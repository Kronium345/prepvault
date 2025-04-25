// server/routes/auth.ts
import express from 'express';
import type { Request, Response } from 'express';
import { auth, db } from '../firebase/admin';
import cookieParser from 'cookie-parser';

const router = express.Router();

const ONE_WEEK = 60 * 60 * 24 * 7; // seconds in one week
router.use(cookieParser());

router.post('/signup', async (req: Request, res: Response): Promise<any> => {
  const { uid, name, email } = req.body;

  try {
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    await userRef.set({
      name,
      email,
      createdAt: Date.now(),
    });

    // Get Firebase ID token from client in future (not required here since client doesn’t send it yet)
    // Example: const idToken = req.body.token;
    // const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: ONE_WEEK * 1000 });

    return res.status(200).json({
      success: true,
      message: 'User created successfully',
    });
  } catch (e: any) {
    console.error('Error signing up:', e);

    // handle Firebase errors
    if (e.code === 'auth/email-already-exists') {
      return res.status(409).json({
        success: false,
        message: 'Email already exists',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Something went wrong, failed to create user',
    });
  }
});

// server/routes/auth.ts
router.post('/signin', async (req, res): Promise<any> => {
  const { email, idToken } = req.body;

  if (!email || !idToken) {
    return res
      .status(400)
      .json({ success: false, message: 'Missing email or idToken' });
  }

  try {
    const userRecord = await auth.getUserByEmail(email);
    if (!userRecord) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: ONE_WEEK,
    });

    // ✅ Set the session cookie in the response
    res.cookie('session', sessionCookie, {
      maxAge: ONE_WEEK,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return res.status(200).json({
      success: true,
      message: 'User signed in and session cookie set.',
      session: sessionCookie
    });
  } catch (error) {
    console.error('❌ Sign-in error:', error);
    return res.status(401).json({ success: false, message: 'Sign-in failed' });
  }
});

router.get(
  '/current-user',
  async (req: Request, res: Response): Promise<any> => {
    try {
      const sessionCookie = req.cookies?.session ||
        req.headers.authorization?.replace('Bearer ', '');

      if (!sessionCookie) {
        console.log('❌ No session cookie found');
        return res
          .status(401)
          .json({ success: false, message: 'No session cookie' });
      }

      console.log('✅ Session cookie:', sessionCookie);

      const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
      console.log('✅ Decoded session claims:', decodedClaims);

      const userDoc = await db.collection('users').doc(decodedClaims.uid).get();

      if (!userDoc.exists) {
        console.log('❌ No user found for UID:', decodedClaims.uid);
        return res
          .status(404)
          .json({ success: false, message: 'User not found' });
      }

      return res.status(200).json({
        success: true,
        user: {
          id: userDoc.id,
          ...userDoc.data(),
        },
      });
    } catch (error) {
      console.error('❌ Error verifying session cookie:', error);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session',
      });
    }
  }
);

router.get('/interview/user', async (req: Request, res: Response): Promise<any> => {
  try {
    const sessionCookie = req.cookies?.session || req.headers.authorization?.replace('Bearer ', '');

    if (!sessionCookie) {
      console.log('❌ No session cookie found');
      return res.status(401).json({ success: false, message: 'No session cookie' });
    }

    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    const userId = decodedClaims.uid;

    console.log('🔑 Decoded userId for interview fetch:', userId);

    const snapshot = await db.collection('interviews')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const interviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json({ success: true, interviews });
  } catch (error) {
    console.error('❌ Error fetching interviews:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch interviews' });
  }
});

router.get('/interview/latest', async (req: Request, res: Response): Promise<any> => {
  try {
    const sessionCookie = req.cookies?.session || req.headers.authorization?.replace('Bearer ', '');
    const limit = parseInt(req.query.limit as string) || 20;

    if (!sessionCookie) {
      return res.status(401).json({ success: false, message: 'No session token found' });
    }

    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    const currentUserId = decodedClaims.uid;

    const snapshot = await db
      .collection('interviews')
      .where('finalized', '==', true)
      .where('userId', '!=', currentUserId)
      .orderBy('userId') // Required to use '!='
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const interviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json({ success: true, interviews });
  } catch (error) {
    console.error('❌ Error fetching latest interviews:', error);
    return res.status(500).json({ success: false, message: 'Failed to get latest interviews' });
  }
});

// ✅ GET /auth/interview/:id
router.get('/interview/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const sessionCookie = req.cookies?.session || req.headers.authorization?.replace('Bearer ', '');
    const interviewId = req.params.id;

    if (!sessionCookie) {
      return res.status(401).json({ success: false, message: 'No session cookie provided' });
    }

    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    const interviewDoc = await db.collection('interviews').doc(interviewId).get();

    if (!interviewDoc.exists) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    const interviewData = interviewDoc.data();

    // Optional: ensure user can only access their own interview
    if (interviewData?.userId !== decodedClaims.uid) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to interview' });
    }

    return res.status(200).json({
      success: true,
      interview: {
        id: interviewDoc.id,
        ...interviewData,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching interview by ID:', error);
    return res.status(500).json({ success: false, message: 'Failed to get interview by ID' });
  }
});


export default router;
