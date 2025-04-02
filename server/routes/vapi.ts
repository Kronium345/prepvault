// server/routes/vapi.ts
import express from 'express';
import { startCall } from '../controllers/vapi.controller';

const router = express.Router();

router.post('/start-call', startCall);

export default router;
