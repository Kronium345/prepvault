import express from 'express';
import { generateInterview } from '../controllers/gemini.controllers';

const router = express.Router();

router.post('/generate', generateInterview);

export default router;
