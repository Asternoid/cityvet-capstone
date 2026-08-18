import { buildDailyQueue } from '../services/queueBuilder.service.js';

// GET /api/technicians/queue/today
export const getTodayQueue = async (req, res, next) => {
  try {
    const techId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    const queue = await buildDailyQueue(techId, today);

    res.status(200).json({ success: true, data: queue });
  } catch (err) {
    next(err);
  }
};