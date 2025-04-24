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

// ✅ Fix newline escaping in the JSON string
const fixedCreds = JSON.stringify(
  JSON.parse(googleCredsRaw, (_, value) => {
    return typeof value === 'string' ? value.replace(/\\n/g, '\n') : value;
  })
);

// ✅ Write to a temp file
const tempKeyPath = path.join(tmpdir(), 'gcp-creds.json');
writeFileSync(tempKeyPath, fixedCreds);

console.log('🌍 GOOGLE_APPLICATION_CREDENTIALS_JSON loaded:', !!googleCredsRaw);
console.log('🗂️ Temporary GCP Key Path:', tempKeyPath);



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
    console.log('🎙️ Transcription endpoint hit');
    console.log('📥 Incoming request headers:', req.headers);

    const multerFiles = (req as any).files;
    console.log('🗂️ Multer received files:', multerFiles);

    if (!multerFiles || multerFiles.length === 0) {
      console.error('❌ No audio file uploaded');
      res.status(400).json({ success: false, message: 'No audio uploaded' });
      return;
    }

    const audioFile = multerFiles[0];

    console.log('Saved audio file at:', audioFile.path);

    const audioBytes = fs.readFileSync(audioFile.path).toString('base64');
    console.log('🔊 Audio file read and converted to base64');

    const audio = { content: audioBytes };
    const config: protos.google.cloud.speech.v1.IRecognitionConfig = {
      encoding: protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.LINEAR16,
      sampleRateHertz: 16000,
      languageCode: 'en-US',
    };

    console.log('📝 Recognition config prepared:', config);

    const request = { audio, config };
    console.log('📡 Sending request to Google Speech API');

    const [response] = await client.recognize(request);
    console.log('📡 Response received from Google Speech API');

    const transcript = (response.results ?? [])
      .map((result) => result.alternatives?.[0]?.transcript)
      .join(' ')
      .trim();

    console.log('📝 Transcript generated:', transcript);

    res.status(200).json({ success: true, transcript });
    console.log('✅ Transcription successful');
  } catch (error) {
    console.error('Error transcribing audio:', error);
    console.log('❌ Transcription failed');
    res.status(500).json({ success: false, message: 'Failed to transcribe audio' });
  }
};