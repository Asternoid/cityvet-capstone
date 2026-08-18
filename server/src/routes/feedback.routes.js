import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import { submitFeedback } from '../controllers/feedback.controller.js';

const router = express.Router();

router.post('/submit', verifyToken, requireRole('client'), submitFeedback);

export default router;