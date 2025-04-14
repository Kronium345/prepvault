import multer from 'multer';
import { Request, Response } from 'express';

// Setup multer
export const upload = multer({ storage: multer.memoryStorage() });

// Custom MulterRequest type
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// 🛠️ Important: NO return type from the controller
export const transcribeAudio = async (req: Request, res: Response): Promise<void> => {
  try {
    const multerReq = req as MulterRequest;
    const audioBuffer = multerReq.file?.buffer;

    if (!audioBuffer) {
      res.status(400).json({ success: false, message: 'No audio uploaded' });
      return;
    }

    // (Mock for now)
    const mockTranscript = "This is a simulated transcription.";

    res.status(200).json({ success: true, transcript: mockTranscript }); // ✅ Just send response, no return
  } catch (error) {
    console.error('Error transcribing audio:', error);
    res.status(500).json({ success: false, message: 'Failed to transcribe audio' });
  }
};
