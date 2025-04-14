import express from 'express';
import { generateInterview } from '../controllers/gemini.controllers';
import { analyzeAnswer } from '../controllers/analyse.controllers';

const router = express.Router();

router.post('/generate', generateInterview);
router.post('/analyze-answer', analyzeAnswer);

export default router;
