import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import {
	listNotifications,
	markNotificationRead,
	markAllRead,
	createNotification,
} from '../controllers/notification.controller.js';

const router = express.Router();

// List notifications for the current user
router.get('/', verifyToken, listNotifications);

// Mark a single notification as read
router.post('/:id/read', verifyToken, markNotificationRead);

// Mark all notifications as read for current user
router.post('/mark-all-read', verifyToken, markAllRead);

// Create a notification (admin only)
router.post('/', verifyToken, requireRole('admin'), createNotification);

export default router;
