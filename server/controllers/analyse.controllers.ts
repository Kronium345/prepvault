import { Request, Response } from 'express';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export const analyzeAnswer = async (req: Request, res: Response): Promise<any> => {
    const { question, answer } = req.body;
    console.log('📡 Analyzing answer request received');  // ⬅️ **LOG: Endpoint hit**
    console.log('Question:', question);  // ⬅️ **LOG: Question received**
    console.log('Answer:', answer);  // ⬅️ **LOG: Answer received**


    try {
        const { text: feedback } = await generateText({
            model: google('gemini-2.0-flash-001'),
            prompt: `
You are a helpful AI interview coach.

Evaluate the following job interview response:

Question: "${question}"
Answer: "${answer}"

Give clear, constructive feedback on the answer. Be concise and professional. Mention if the answer is strong or weak, and suggest improvements.
Return just the feedback text only.`,
        });

        return res.status(200).json({ success: true, feedback });
    } catch (error) {
        console.error('❌ Error analyzing answer:', error);
        return res.status(500).json({ success: false, error });
    }
};
