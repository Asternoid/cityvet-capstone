import { supabaseAdmin } from '../config/supabase.js';
import { sendInAppNotification } from '../services/notification.service.js';

export const listNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, notifications: data });
  } catch (err) {
    next(err);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const id = req.params.id;
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .eq('recipient_id', userId);

    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, updated: data });
  } catch (err) {
    next(err);
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .update({ read: true })
      .eq('recipient_id', userId);

    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, updated: data });
  } catch (err) {
    next(err);
  }
};

export const createNotification = async (req, res, next) => {
  try {
    const { recipientId, title, message, type, relatedAppointmentId } = req.body;
    // Use service to insert and optionally send email
    const data = await sendInAppNotification(recipientId, title, message, type, relatedAppointmentId);
    return res.json({ success: true, notification: data });
  } catch (err) {
    next(err);
  }
};
