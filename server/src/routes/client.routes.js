import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import { getBookingOptions } from '../controllers/client.controller.js';

const router = express.Router();

router.get('/booking-options', verifyToken, requireRole('client'), getBookingOptions);

export default router;