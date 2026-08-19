import { analyzeFeedbackNLP } from '../services/nlp.service.js';
import { supabaseAdmin } from '../config/supabase.js';

// POST /api/feedback/submit
export const submitFeedback = async (req, res, next) => {
  try {
    const { appointmentId, feedbackText } = req.body;
    const clientId = req.user.id;

    if (!appointmentId || !feedbackText?.trim()) {
      return res.status(400).json({ success: false, error: 'Appointment ID and feedback text are required.' });
    }

    // Get appointment info
    const { data: apt } = await supabaseAdmin
      .from('appointments')
      .select('client_id, technician_id, status')
      .eq('id', appointmentId)
      .single();

    if (!apt) return res.status(404).json({ success: false, error: 'Appointment not found.' });
    if (apt.client_id !== clientId) {
      return res.status(403).json({ success: false, error: 'You do not own this appointment.' });
    }
    if (apt.status !== 'completed') {
      return res.status(400).json({ success: false, error: 'Feedback can only be submitted for completed appointments.' });
    }

    const { data: existingFeedback } = await supabaseAdmin
      .from('feedback')
      .select('id')
      .eq('appointment_id', appointmentId)
      .maybeSingle();
    if (existingFeedback) {
      return res.status(409).json({ success: false, error: 'Feedback has already been submitted for this appointment.' });
    }

    // Run GPT-4o mini NLP analysis
    const { sentiment, themes } = await analyzeFeedbackNLP(feedbackText);

    const { data: newFeedback, error } = await supabaseAdmin
      .from('feedback')
      .insert([{
        appointment_id: appointmentId,
        client_id: clientId,
        technician_id: apt.technician_id,
        feedback_text: feedbackText.trim(),
        sentiment,
        themes
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data: newFeedback });
  } catch (err) {
    next(err);
  }
};