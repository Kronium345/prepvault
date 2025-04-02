// server/routes/vapi.ts
import express from 'express';
import { endCall, startCall } from '../controllers/vapi.controller';

const router = express.Router();

router.post('/start-call', startCall);
router.post('/end', endCall);

export default router;
