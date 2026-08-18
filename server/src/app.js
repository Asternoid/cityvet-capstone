import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import errorHandler from './src/middleware/errorHandler.js';

// Route imports
import authRoutes from './src/routes/auth.routes.js';
import clientRoutes from './src/routes/client.routes.js';
import appointmentRoutes from './src/routes/appointment.routes.js';
import technicianRoutes from './src/routes/technician.routes.js';
import adminRoutes from './src/routes/admin.routes.js';
import feedbackRoutes from './src/routes/feedback.routes.js';
import notificationRoutes from './src/routes/notification.routes.js';
import reportRoutes from './src/routes/report.routes.js';

const app = express();

// Security & Core Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/technicians', technicianRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'CityVet API running smoothly' });
});

// Global Error Handler Middleware
app.use(errorHandler);

export default app;