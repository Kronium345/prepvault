import multer from 'multer';
import { Request, Response } from 'express';

// Setup multer
export const upload = multer({
  storage: multer.diskStorage({
    destination: './uploads/', // saves to /uploads folder
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  }),
});
// Custom MulterRequest type
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// 🛠️ Important: NO return type from the controller
export const transcribeAudio = async (req: Request, res: Response): Promise<void> => {
  try {
    const multerReq = req as MulterRequest;
    const audioFile = multerReq.file; // multer already saved it to /uploads!

    if (!audioFile) {
      res.status(400).json({ success: false, message: 'No audio uploaded' });
      return;
    }

    console.log('Saved audio file at:', audioFile.path);

    // TODO: Send the audio file to Google STT here instead of mock
    const mockTranscript = "This is a simulated transcription.";

    res.status(200).json({ success: true, transcript: mockTranscript });
  } catch (error) {
    console.error('Error transcribing audio:', error);
    res.status(500).json({ success: false, message: 'Failed to transcribe audio' });
  }
};

