import { analyzeFeedbackNLP } from '../services/nlp.service.js';
import { supabaseAdmin } from '../config/supabase.js';

// POST /api/feedback/submit
export const submitFeedback = async (req, res, next) => {
  try {
    const { appointmentId, feedbackText } = req.body;
    const clientId = req.user.id;

    // Get appointment info
    const { data: apt } = await supabaseAdmin
      .from('appointments')
      .select('technician_id')
      .eq('id', appointmentId)
      .single();

    if (!apt) return res.status(404).json({ success: false, error: 'Appointment not found.' });

    // Run GPT-4o mini NLP analysis
    const { sentiment, themes } = await analyzeFeedbackNLP(feedbackText);

    const { data: newFeedback, error } = await supabaseAdmin
      .from('feedback')
      .insert([{
        appointment_id: appointmentId,
        client_id: clientId,
        technician_id: apt.technician_id,
        feedback_text: feedbackText,
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