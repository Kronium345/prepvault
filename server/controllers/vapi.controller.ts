// server/controllers/vapi.controller.ts
import { vapi } from '../lib/vapi';
import type { Request, Response } from 'express';

export const startCall = async (req: Request, res: Response): Promise<any> => {
  try {
    const response = await fetch('https://api.vapi.ai/v1/calls', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
      },
      body: JSON.stringify({
        assistant_id: process.env.VAPI_ASSISTANT_ID,
        customer: {
          name: req.body.user_name || 'Anonymous',
        }
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Vapi API error details:', {
        status: response.status,
        statusText: response.statusText,
        body: result
      });
      throw new Error(`Vapi API error: ${result.message || 'Unknown error'}`);
    }

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

export const endCall = async (req: Request, res: Response): Promise<any> => {
  const { call_id } = req.body;

  if (!call_id) {
    return res
      .status(400)
      .json({ success: false, message: 'Call ID is required.' });
  }

  try {
    await fetch(`https://api.vapi.ai/v1/calls/${call_id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
      },
      body: JSON.stringify({ status: 'completed' }),
    });

    return res
      .status(200)
      .json({ success: true, message: 'Call ended successfully.' });
  } catch (error) {
    console.error('Error ending call:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to end call.' });
  }
};
