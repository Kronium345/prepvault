import { SpeechClient, protos } from '@google-cloud/speech';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { tmpdir } from 'os'; // ⬅️ new
import { writeFileSync } from 'fs'; // ⬅️ new
import { Request, Response } from 'express';

// 🧠 Get the JSON string from environment
const googleCredsRaw = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

if (!googleCredsRaw) {
  throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON is not set');
}

// ✍️ Write it to a temporary file so Google SDK can use it
const tempKeyPath = path.join(tmpdir(), 'gcp-creds.json');
writeFileSync(tempKeyPath, googleCredsRaw);

const client = new SpeechClient({
  keyFilename: tempKeyPath,
});

export const upload = multer({
  storage: multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  }),
});

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export const transcribeAudio = async (req: Request, res: Response): Promise<void> => {
  try {
    const multerReq = req as MulterRequest;
    const audioFile = multerReq.file;

    if (!audioFile) {
      res.status(400).json({ success: false, message: 'No audio uploaded' });
      return;
    }

    console.log('Saved audio file at:', audioFile.path);

    const audioBytes = fs.readFileSync(audioFile.path).toString('base64');

    const audio = { content: audioBytes };
    const config: protos.google.cloud.speech.v1.IRecognitionConfig = {
      encoding: protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.ENCODING_UNSPECIFIED,
      sampleRateHertz: 16000,
      languageCode: 'en-US',
    };

    const request = { audio, config };

    const [response] = await client.recognize(request);
    const transcript = (response.results ?? [])
      .map((result) =>
        result.alternatives?.[0]?.transcript
      )
      .join(' ')
      .trim();

    res.status(200).json({ success: true, transcript });
  } catch (error) {
    console.error('Error transcribing audio:', error);
    res.status(500).json({ success: false, message: 'Failed to transcribe audio' });
  }
};
