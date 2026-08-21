import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import {
	getAdminDashboard,
	listAdminAppointments,
	assignAdminAppointment,
	listAdminTechnicians,
	listAdminClients,
	updateClientAccountStatus,
	getPendingClients,
	verifyClient,
	rejectClient,
	listBlackoutDates,
	createBlackoutDate,
	deleteBlackoutDate,
	listAdminNotifications,
	broadcastAdminNotification,
	getAdminAnalytics,
	generateAdminReport,
} from '../controllers/admin.controller.js';

const router = express.Router();

router.use(verifyToken, requireRole('admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/appointments', listAdminAppointments);
router.post('/appointments/:id/assign', assignAdminAppointment);
router.get('/technicians', listAdminTechnicians);
router.get('/clients', listAdminClients);
router.patch('/clients/:id/account-status', updateClientAccountStatus);
router.get('/clients/pending', getPendingClients);
router.post('/clients/:id/verify', verifyClient);
router.post('/clients/:id/reject', rejectClient);
router.get('/blackout-dates', listBlackoutDates);
router.post('/blackout-dates', createBlackoutDate);
router.delete('/blackout-dates/:id', deleteBlackoutDate);
router.get('/notifications', listAdminNotifications);
router.post('/notifications/broadcast', broadcastAdminNotification);
router.get('/analytics', getAdminAnalytics);
router.post('/reports/generate', generateAdminReport);

export default router;