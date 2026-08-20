import express from 'express';
import multer from 'multer';
import { registerClient, getMe, updateProfile } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import rateLimit from 'express-rate-limit';

const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 10,
	standardHeaders: 'draft-8',
	legacyHeaders: false,
	message: { success: false, error: 'Too many authentication attempts. Please try again later.' },
});
const router = express.Router();

router.post('/register', authLimiter, upload.single('govId'), registerClient);
router.get('/me', verifyToken, getMe);
router.patch('/profile', verifyToken, requireRole('client'), updateProfile);

export default router;