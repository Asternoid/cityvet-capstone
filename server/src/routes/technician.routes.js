import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import { getTodayQueue, listMyLeaveRequests, createLeaveRequest } from '../controllers/technician.controller.js';

const router = express.Router();

router.get('/queue/today', verifyToken, requireRole('technician'), getTodayQueue);
router.get('/leave', verifyToken, requireRole('technician'), listMyLeaveRequests);
router.post('/leave', verifyToken, requireRole('technician'), createLeaveRequest);

export default router;