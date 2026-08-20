import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import { submitBooking, updateAppointmentStatus, cancelAppointment, rescheduleAppointment, listMyAppointments, getMyAppointment } from '../controllers/appointment.controller.js';

const router = express.Router();

router.post('/submit', verifyToken, requireRole('client'), submitBooking);
router.get('/my', verifyToken, requireRole('client'), listMyAppointments);
router.get('/:id', verifyToken, requireRole('client'), getMyAppointment);
router.patch('/:id/status', verifyToken, requireRole('technician', 'admin'), updateAppointmentStatus);
router.post('/:id/cancel', verifyToken, requireRole('client'), cancelAppointment);
router.post('/:id/reschedule', verifyToken, requireRole('client'), rescheduleAppointment);

export default router;