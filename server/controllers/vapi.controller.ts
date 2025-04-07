import { UpdateCallDto } from '@vapi-ai/server-sdk/api';
import { vapi } from '../lib/vapi'; // ✅ Now this makes sense
import type { Request, Response } from 'express';

export const startCall = async (req: Request, res: Response): Promise<any> => {
  try {
    const call = await vapi.calls.create({
      assistantId: process.env.VAPI_ASSISTANT_ID!,
      customer: {
        name: req.body.user_name || 'Anonymous',
      },
    });

    return res.status(200).json({
      success: true,
      call,
    });
  } catch (err: any) {
    console.error('Vapi Error:', err.message || err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to start call',
    });
  }
};

export const endCall = async (req: Request, res: Response): Promise<any> => {
  const { call_id } = req.body;

  if (!call_id) {
    return res.status(400).json({ success: false, message: 'Call ID is required.' });
  }

  try {
    // TypeScript override to allow 'status' property
    await vapi.calls.update(call_id, {
      status: 'completed',
    } as unknown as UpdateCallDto);

    return res.status(200).json({ success: true, message: 'Call ended successfully.' });
  } catch (error) {
    console.error('Error ending call:', error);
    return res.status(500).json({ success: false, message: 'Failed to end call.' });
  }
};



