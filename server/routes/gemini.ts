import express from 'express';
import { generateInterview, generateFeedback } from '../controllers/gemini.controllers';
import { analyzeAnswer } from '../controllers/analyse.controllers';
import { transcribeAudio, upload } from '../controllers/transcribe.controllers';

const router = express.Router();

router.post('/generate', generateInterview);
router.post('/generate-feedback', generateFeedback);
router.post('/analyze-answer', analyzeAnswer);
router.post('/transcribe', upload.any(), transcribeAudio);

export default router;
