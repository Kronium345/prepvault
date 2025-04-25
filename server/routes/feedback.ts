import express from 'express';
import { getFeedbackById } from '../controllers/feedback.controllers';

const router = express.Router();

router.get('/:id', getFeedbackById);

export default router;
