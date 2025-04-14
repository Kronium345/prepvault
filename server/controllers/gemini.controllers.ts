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
