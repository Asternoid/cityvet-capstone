import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import API from '../../api/axios';

/**
 * SubmitFeedback — post-service client feedback form.
 *
 * Per Section 1.5 Scope:
 *   - Feedback is written text only (English, Tagalog, or Bisaya)
 *   - GPT-4o mini classifies sentiment server-side
 *   - No star rating widget, no animal-profile field (Section 1.5 Delimitations)
 *
 * Security:
 *   - The appointment is fetched fresh from the server by :id, never trusted
 *     from navigation state, so a client cannot submit feedback attributed
 *     to an appointment they don't own or one that isn't actually Completed.
 *   - The form is only rendered once the server confirms the appointment
 *     belongs to this client and is eligible for feedback; the server still
 *     re-checks eligibility on submit regardless.
 *   - Feedback length is capped client-side to match the server limit and
 *     avoid oversized payloads; the raw text is otherwise left to React's
 *     built-in escaping — no HTML is ever injected from user input.
 */

const MAX_FEEDBACK_LENGTH = 2000;

export default function SubmitFeedback() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [feedbackText, setFeedbackText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const loadAppointment = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await API.get(`/appointments/${encodeURIComponent(id)}`);
      const data = res.data?.data || null;
      if (data && data.status !== 'Completed') {
        setLoadError('Feedback can only be submitted for completed appointments.');
        setAppointment(null);
        return;
      }
      if (data && data.feedback_submitted) {
        setLoadError('Feedback has already been submitted for this appointment.');
        setAppointment(null);
        return;
      }
      setAppointment(data);
    } catch (err) {
      setLoadError('We could not find that appointment.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAppointment();
  }, [loadAppointment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = feedbackText.trim();
    if (!trimmed) return;

    setSubmitError(null);
    setSubmitting(true);
    try {
      await API.post('/feedback/submit', {
        appointmentId: appointment.id,
        feedbackText: trimmed.slice(0, MAX_FEEDBACK_LENGTH),
      });
      navigate('/client/appointments', { state: { feedbackSubmitted: true } });
    } catch (err) {
      const status = err.response?.status;
      if (status === 409) {
        setSubmitError(err.response?.data?.error || 'Feedback has already been submitted for this appointment.');
      } else {
        setSubmitError('Could not submit feedback. Please try again.');
      }
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-xl bg-white p-10 text-center text-gray-500 shadow-sm">Loading appointment…</div>
      </div>
    );
  }

  if (loadError || !appointment) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex flex-col items-center gap-3 rounded-xl bg-white p-10 text-center shadow-sm">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="text-gray-700">{loadError || 'Appointment not found.'}</p>
          <Link to="/client/appointments" className="font-medium text-[#13534D] hover:underline">
            Back to Booking History
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#0B3A36]">Post-Service Feedback</h1>
        <p className="text-gray-600">Help us improve our veterinary services</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 rounded-lg bg-[#13534D] p-5 text-white">
          <h4 className="text-lg font-semibold">{appointment.service_name}</h4>
          <p className="mt-1 text-xs text-white/70">
            {appointment.preferred_date} · {appointment.reference_no}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <label htmlFor="feedback-text" className="mb-2 block font-medium text-[#0B3A36]">
              Tell us about your experience
            </label>
            <textarea
              id="feedback-text"
              required
              rows={6}
              maxLength={MAX_FEEDBACK_LENGTH}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Share your experience — the quality of service, the technician's professionalism, the outcome for your animal... (English, Tagalog, or Bisaya)"
              className="w-full rounded-md border border-gray-300 p-4 text-sm text-gray-800 outline-none transition focus:border-[#13534D] focus:ring-2 focus:ring-[#13534D]/20"
            />
            <div className="mt-1 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Your feedback is reviewed by the clinic administrator only.
              </p>
              <p className="text-xs text-gray-400">
                {feedbackText.length}/{MAX_FEEDBACK_LENGTH}
              </p>
            </div>
          </div>

          {submitError && (
            <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || !feedbackText.trim()}
            className="w-full rounded-lg bg-[#13534D] px-6 py-3 font-semibold text-white transition hover:bg-[#0B3A36] disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
}