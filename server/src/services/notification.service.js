import { supabaseAdmin } from '../config/supabase.js';
import transporter from '../config/mailer.js';

// Send In-App Notification (Stored in DB for Real-time)
export const sendInAppNotification = async (recipientId, title, message, type = 'system', relatedAppointmentId = null) => {
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .insert([
      {
        recipient_id: recipientId,
        title,
        message,
        type,
        related_appointment_id: relatedAppointmentId
      }
    ]);

  if (error) console.error('Failed to create in-app notification:', error.message);
  return data;
};

// Send Email Notification via Nodemailer
export const sendEmailNotification = async (to, subject, text) => {
  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.warn('Email credentials not configured. Skipping email dispatch.');
      return;
    }
    await transporter.sendMail({
      from: `"CityVet Gingoog" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      text
    });
  } catch (err) {
    console.error('Failed to send email:', err.message);
  }
};