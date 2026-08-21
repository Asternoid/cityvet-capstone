import express from 'express';
import multer from 'multer';
import { registerClient, getMe, updateProfile, loginUser, logoutUser, getRegistrationOptions } from '../controllers/auth.controller.js';
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

router.post('/login', authLimiter, loginUser);
router.get('/registration-options', getRegistrationOptions);
router.post('/logout', verifyToken, logoutUser);
router.get('/register', (req, res) => res.status(405).json({ success: false, error: 'Registration must be submitted using the registration form.' }));
router.post('/register', authLimiter, upload.single('govId'), registerClient);
router.get('/me', verifyToken, getMe);
router.patch('/profile', verifyToken, requireRole('client'), updateProfile);

export default router;