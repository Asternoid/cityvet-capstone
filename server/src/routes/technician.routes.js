import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import { getTodayQueue } from '../controllers/technician.controller.js';

const router = express.Router();

router.get('/queue/today', verifyToken, requireRole('technician'), getTodayQueue);

export default router;