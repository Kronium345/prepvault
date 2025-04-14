import express from 'express';
import { generateInterview } from '../controllers/gemini.controllers';
import { analyzeAnswer } from '../controllers/analyse.controllers';
import { transcribeAudio, upload } from '../controllers/transcribe.controllers';

const router = express.Router();

router.post('/generate', generateInterview);
router.post('/analyze-answer', analyzeAnswer);
router.post('/transcribe', upload.single('file'), transcribeAudio);

export default router;
