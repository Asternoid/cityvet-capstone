import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import { getPendingClients, verifyClient, rejectClient } from '../controllers/admin.controller.js';

const router = express.Router();

// Admin Client Verification Routes
router.get('/clients/pending', verifyToken, requireRole('admin'), getPendingClients);
router.post('/clients/:id/verify', verifyToken, requireRole('admin'), verifyClient);
router.post('/clients/:id/reject', verifyToken, requireRole('admin'), rejectClient);

export default router;