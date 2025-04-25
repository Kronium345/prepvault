import { Request, Response } from 'express';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { db } from '../firebase/admin';
import { getRandomInterviewCover } from '../lib/client-copy-files/utils';

export const generateInterview = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { type, role, level, techstack, amount, userid } = req.body;

  try {
    const { text: questions } = await generateText({
      model: google('gemini-2.0-flash-001'),
      prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]`,
    });

    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(','),
      questions: JSON.parse(questions),
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    await db.collection('interviews').add(interview);

    return res.status(200).json({ success: true, questions: JSON.parse(questions) });
  } catch (error) {
    console.error('❌ Error generating interview:', error);
    return res.status(500).json({ success: false, error });
  }
};

export const generateFeedback = async (req: Request, res: Response): Promise<any> => {
  const { messages, role, level, techstack, type, userId } = req.body;

  if (!messages || !userId) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    // 🔮 Use Gemini (or your AI service) to generate feedback from the messages
    const { text: feedbackText } = await generateText({
      model: google('gemini-2.0-pro'),
      prompt: `You are an AI interview coach. Analyze the following interview conversation and generate detailed feedback based on communication skills, technical knowledge, problem solving, cultural fit, and confidence & clarity.

Interview details:
- Role: ${role}
- Level: ${level}
- Tech Stack: ${techstack}
- Type: ${type}

Conversation:
${messages.map((msg: { role: string; content: string }) => `${msg.role}: ${msg.content}`).join('\n')}

Provide feedback with a total score out of 100, category scores, strengths, areas for improvement, and a final assessment.`,
    });

    // Optionally parse feedbackText into structured data (e.g., using regex or JSON if the model returns JSON).

    // 📝 Save feedback to Firestore
    const feedbackDoc = await db.collection('feedback').add({
      userId,
      role,
      level,
      techstack,
      type,
      messages,
      feedback: feedbackText,
      createdAt: new Date().toISOString(),
    });

    return res.status(200).json({ success: true, id: feedbackDoc.id });
  } catch (error) {
    console.error('❌ Error generating feedback:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate feedback' });
  }
};
