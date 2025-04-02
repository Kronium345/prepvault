// server/controllers/vapi.controller.ts
import { vapi } from '../lib/vapi';
import type { Request, Response } from 'express';

export const startCall = async (req: Request, res: Response): Promise<any> => {
  try {
    const result = await vapi.calls.create({
      assistantId: process.env.VAPI_ASSISTANT_ID!,
      phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID!,
    });

    return res.status(200).json({
      success: true,
      call: result,
    });
  } catch (err: any) {
    console.error('Vapi Error:', err.message || err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to start call',
    });
  }
};
