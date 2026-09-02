import { supabaseAdmin } from '../config/supabase.js';
import { analyzeFeedbackNLP } from '../services/nlp.service.js';
import { feedbackSchema, sanitizeText, validationError } from '../lib/inputSecurity.js';

// POST /api/feedback/submit
export const submitFeedback = async (req, res, next) => {
  try {
    const parsed = feedbackSchema.safeParse(req.body);
    if (validationError(parsed, res, 'Appointment ID and feedback text are required.')) return;
    const { appointmentId } = parsed.data;
    const feedbackText = sanitizeText(parsed.data.feedbackText);
    const clientId = req.user.id;

    if (!feedbackText) {
      return res.status(400).json({
        success: false,
        error: 'Appointment ID and feedback text are required.'
      });
    }

    const { data: apt, error: appointmentError } = await supabaseAdmin
      .from('appointments')
      .select('client_id, technician_id, status')
      .eq('id', appointmentId)
      .single();

    if (appointmentError || !apt) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found.'
      });
    }

    if (apt.client_id !== clientId) {
      return res.status(403).json({
        success: false,
        error: 'You do not own this appointment.'
      });
    }

    if (apt.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Feedback can only be submitted for completed appointments.'
      });
    }

    const { data: existingFeedback } = await supabaseAdmin
      .from('feedback')
      .select('id')
      .eq('appointment_id', appointmentId)
      .maybeSingle();

    if (existingFeedback) {
      return res.status(409).json({
        success: false,
        error: 'Feedback has already been submitted for this appointment.'
      });
    }

    let analysis = { sentiment: 'neutral', themes: ['general_service'] };

    try {
      analysis = await analyzeFeedbackNLP(feedbackText);
    } catch (err) {
      analysis = {
        sentiment: 'neutral',
        themes: ['general_service'],
        status: 'fallback',
        message: 'Fallback analysis triggered after NLP error.'
      };
    }

    const sentiment = analysis?.sentiment || 'neutral';
    const themes = Array.isArray(analysis?.themes) && analysis.themes.length
      ? analysis.themes
      : ['general_service'];

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

    res.status(201).json({
      success: true,
      data: newFeedback
    });

  } catch (err) {
    next(err);
  }
};
