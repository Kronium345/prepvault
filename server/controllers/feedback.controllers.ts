import { db } from '../firebase/admin';
import { Request, Response } from 'express';

export const getFeedbackById = async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;

    try {
        const doc = await db.collection('feedback').doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, message: 'Feedback not found.' });
        }

        return res.status(200).json({ success: true, feedback: doc.data() });
    } catch (error) {
        console.error('Error fetching feedback:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};
