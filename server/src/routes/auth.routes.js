import express from 'express';
import multer from 'multer';
import { registerClient, getMe } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.js';

const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit
const router = express.Router();

router.post('/register', upload.single('govId'), registerClient);
router.get('/me', verifyToken, getMe);

export default router;