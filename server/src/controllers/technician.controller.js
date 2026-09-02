import { supabaseAdmin } from '../config/supabase.js';
import { buildDailyQueue } from '../services/queueBuilder.service.js';
import { leaveRequestSchema, sanitizeText, validationError } from '../lib/inputSecurity.js';

// GET /api/technicians/queue/today
export const getTodayQueue = async (req, res, next) => {
  try {
    const techId = req.user.id;
    const targetDate = req.query.date || new Date().toISOString().split('T')[0];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
      return res.status(400).json({ success: false, error: 'A valid schedule date is required.' });
    }
    const queue = await buildDailyQueue(techId, targetDate);

    res.status(200).json({ success: true, data: queue });
  } catch (err) {
    next(err);
  }
};

// GET /api/technicians/leave
export const listMyLeaveRequests = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('leave_requests')
      .select('*')
      .eq('technician_id', req.user.id)
      .order('start_date', { ascending: false });

    if (error) throw error;

    res.status(200).json({ success: true, data: data || [] });
  } catch (err) {
    next(err);
  }
};

// POST /api/technicians/leave
export const createLeaveRequest = async (req, res, next) => {
  try {
    const parsed = leaveRequestSchema.safeParse(req.body);
    if (validationError(parsed, res, 'Start date, end date, and reason are required.')) return;
    const { startDate, endDate } = parsed.data;
    const reason = sanitizeText(parsed.data.reason);

    if (!reason) {
      return res.status(400).json({ success: false, error: 'Start date, end date, and reason are required.' });
    }

    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({ success: false, error: 'Invalid leave date provided.' });
    }

    if (end < start) {
      return res.status(400).json({ success: false, error: 'End date cannot be earlier than start date.' });
    }

    const { data, error } = await supabaseAdmin
      .from('leave_requests')
      .insert([{
        technician_id: req.user.id,
        start_date: startDate,
        end_date: endDate,
        reason: reason.trim(),
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
