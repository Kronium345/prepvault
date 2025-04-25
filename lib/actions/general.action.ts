import AsyncStorage from '@react-native-async-storage/async-storage';
// import { feedbackSchema } from 'constants';
import { db } from 'firebase/client';

export async function getInterviewByCurrentUser(userId: string): Promise<Interview[] | null> {
    try {
        const session = await AsyncStorage.getItem('session');
        if (!session) throw new Error('No session found');

        const res = await fetch('https://prepvault-1rdj.onrender.com/auth/interview/user', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${session}`,
            },
        });

        const data = await res.json();

        if (!res.ok || !data?.success) {
            throw new Error(data.message || 'Failed to fetch interviews');
        }

        return data.interviews as Interview[];
    } catch (err) {
        console.error('Failed to fetch user interviews:', err);
        return null;
    }
}


export async function getLatestInterviews(params: GetLatestInterviewsParams): Promise<Interview[] | null> {
    try {
        const session = await AsyncStorage.getItem('session');
        if (!session) return null;

        const { limit } = params;

        const res = await fetch(`https://prepvault-1rdj.onrender.com/auth/interview/latest?limit=${limit}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${session}`,
            },
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            console.warn('❌ Failed to fetch latest interviews');
            return null;
        }

        return data.interviews;
    } catch (err) {
        console.error('❌ Error getting latest interviews:', err);
        return null;
    }
}


export async function getInterviewById(id: string): Promise<Interview | null> {
    try {
        const session = await AsyncStorage.getItem('session');
        if (!session) throw new Error('No session found');

        const res = await fetch(`https://prepvault-1rdj.onrender.com/auth/interview/${id}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${session}`,
            },
        });

        const data = await res.json();

        if (!res.ok || !data?.success) {
            throw new Error(data.message || 'Failed to fetch interview');
        }

        return data.interview as Interview;
    } catch (err) {
        console.error('Failed to fetch interview by ID:', err);
        return null;
    }
}

// export async function createFeedback(params: CreateFeedbackParams) {
//     const { interviewId, userId, transcript } = params;

//     try {
//         const formattedTranscript = transcript.map((message: { role: string; content: string }) => `${message.role}: ${message.content}`).join('\n');

//         // generateObject comes from "ai"
//         const { object: { totalScore, categoryScores, strengths, areasForImprovement, finalAssessment } } = await generateObject({
//             model: 'gemini-2.0-flash',
//             structuredOutputs: false,
//         }),
//             schema: feedbackSchema,
//             prompt: `
//         You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
//         Transcript:
//         ${formattedTranscript}

//         Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
//         - **Communication Skills**: Clarity, articulation, structured responses.
//         - **Technical Knowledge**: Understanding of key concepts for the role.
//         - **Problem-Solving**: Ability to analyze problems and propose solutions.
//         - **Cultural & Role Fit**: Alignment with company values and job role.
//         - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
//         `,
//             system:
//                 "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",

//     });
//     const feedback = await db.collection('feedback').add({
//         interviewId,
//         userId,
//         transcript,
//         totalScore,
//         categoryScores,
//         strengths,
//         areasForImprovement,
//         finalAssessment,
//         createdAt: new Date().toISOString(),
//     })

//     return {
//         success: true,
//         feedbackId: feedback.id
//     }
//     catch (error) {
//         console.error('❌ Error creating feedback:', error);
//     }

