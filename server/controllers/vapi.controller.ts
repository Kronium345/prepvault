// server/controllers/vapi.controller.ts
import { vapi } from '../lib/vapi';
import type { Request, Response } from 'express';

export const startCall = async (req: Request, res: Response): Promise<any> => {
  try {
    const response = await fetch('https://api.vapi.ai/v1/calls', { // ✅ use /v1/calls
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
      },
      body: JSON.stringify({
        assistant_id: process.env.VAPI_ASSISTANT_ID, // ✅ Vapi uses snake_case here
        customer: {
          name: req.body.user_name || 'Anonymous',
          sip_uri: 'sip:prepvault-daniel@sip.vapi.ai', // ✅ correct
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
