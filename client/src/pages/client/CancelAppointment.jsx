import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import API from '../../api/axios';

/**
 * CancelAppointment — allows a client to cancel a pending or confirmed
 * appointment belonging to them.
 *
 * Cancellation rules (per the stakeholder interview and ALG-C1 flowchart):
 *   - Pending Technician Confirmation: free, no penalty
 *   - Technician Confirmed: allowed but logged; within 24 hours of the
 *     scheduled visit it is flagged for Admin visibility
 *   - In Progress / Completed / No-Show: not cancellable
 *
 * Security: the appointment is fetched fresh from the server by :id on
 * every load — never trusted from navigation state — so the cancel action
 * always operates on the client's own, current-status appointment. The
 * cancel button is only rendered once the server-fetched status confirms
 * cancellation is allowed; the final decision is still enforced server-side
 * regardless of what the UI shows.
 */

const STATUS_COLORS = {
  'Pending Technician Confirmation': 'bg-yellow-100 text-yellow-800',
  'Technician Confirmed': 'bg-[#e8f5f4] text-[#13534D]',
  'In Progress': 'bg-blue-100 text-blue-800',
  Completed: 'bg-green-100 text-green-800',
  'No-Show': 'bg-red-100 text-red-700',
};

const MAX_REASON_LENGTH = 300;

function canCancel(status) {
  return status === 'Pending Technician Confirmation' || status === 'Technician Confirmed';
}

export default function CancelAppointment() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const loadAppointment = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await API.get(`/appointments/${encodeURIComponent(id)}`);
      setAppointment(res.data?.data || null);
    } catch (err) {
      setLoadError('We could not find that appointment.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAppointment();
  }, [loadAppointment]);

  const handleConfirmCancel = async () => {
    const trimmedReason = reason.trim();
    if (!trimmedReason) return;

    setSubmitError(null);
    setSubmitting(true);
    try {
      await API.post(`/appointments/${encodeURIComponent(id)}/cancel`, {
        reason: trimmedReason.slice(0, MAX_REASON_LENGTH),
      });
      navigate('/client/appointments');
    } catch (err) {
      const status = err.response?.status;
      if (status === 409) {
        setSubmitError(
          err.response?.data?.error || 'This appointment can no longer be cancelled. It may already be in progress.'
        );
      } else {
        setSubmitError('Could not cancel this appointment right now. Please try again.');
      }
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F3EF] px-4 py-8">
        <div className="mx-auto max-w-2xl rounded-xl bg-white p-10 text-center text-gray-500 shadow-sm">
          Loading appointment…
        </div>
      </div>
    );
  }

  if (loadError || !appointment) {
    return (
      <div className="min-h-screen bg-[#F2F3EF] px-4 py-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 rounded-xl bg-white p-10 text-center shadow-sm">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="text-gray-700">{loadError || 'Appointment not found.'}</p>
          <Link to="/client/appointments" className="font-medium text-[#13534D] hover:underline">
            Back to Booking History
          </Link>
        </div>
      </div>
    );
  }

  const isLateCancellation = appointment.status === 'Technician Confirmed';
  const cancellable = canCancel(appointment.status);

  return (
    <div className="relative min-h-screen bg-[#F2F3EF] px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-[#0B3A36]">Cancel Appointment</h1>

      <div className="mx-auto max-w-2xl rounded-xl bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-xl font-bold text-[#0B3A36]">Appointment Summary</h2>

        <div className="space-y-4">
          <div className="flex justify-between border-b border-gray-100 pb-3">
            <span className="text-gray-600">Service</span>
            <span className="font-medium text-[#0B3A36]">{appointment.service_name}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-3">
            <span className="text-gray-600">Animal</span>
            <span className="font-medium text-[#0B3A36]">{appointment.animal_description}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-3">
            <span className="text-gray-600">Date &amp; Time</span>
            <span className="font-medium text-[#0B3A36]">
              {appointment.preferred_date} · {appointment.preferred_time}
            </span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-3">
            <span className="text-gray-600">Reference No.</span>
            <span className="font-medium text-[#0B3A36]">{appointment.reference_no}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status</span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                STATUS_COLORS[appointment.status] || 'bg-gray-200 text-gray-800'
              }`}
            >
              {appointment.status}
            </span>
          </div>
        </div>

        {!cancellable && (
          <div className="mt-6 flex gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
            <span>
              This appointment can no longer be cancelled online because it is {appointment.status.toLowerCase()}.
              Please contact the clinic directly if you need assistance.
            </span>
          </div>
        )}

        {cancellable && isLateCancellation && (
          <div className="mt-6 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-gray-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <span>
              Cancelling within 24 hours of your scheduled appointment will be recorded in your booking history and
              will be visible to the clinic administrator.
            </span>
          </div>
        )}

        {cancellable && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-6 w-full rounded-lg bg-red-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-red-700"
          >
            Cancel This Appointment
          </button>
        )}

        <Link
          to={`/client/appointments/${appointment.id}`}
          className="mt-3 block w-full rounded-lg border border-[#13534D] bg-white py-2.5 text-center font-medium text-[#13534D] transition hover:bg-gray-50"
        >
          Back to Appointment
        </Link>
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-4 border-red-200 bg-red-50 text-red-600">
                <span className="text-3xl font-bold">!</span>
              </div>

              <h2 className="mb-2 text-2xl font-bold text-[#0B3A36]">Confirm Cancellation</h2>
              <p className="mb-6 text-gray-600">
                Are you sure you want to cancel your <strong>{appointment.service_name}</strong> appointment on{' '}
                {appointment.preferred_date}?
              </p>

              <div className="w-full text-left">
                <label className="mb-1 block text-sm font-bold text-[#0B3A36]">
                  Reason for Cancellation <span className="text-red-500">(Required)</span>
                </label>
                <textarea
                  value={reason}
                  maxLength={MAX_REASON_LENGTH}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Tell us why you need to cancel..."
                  className="w-full rounded-md border border-gray-300 p-3 text-sm outline-none focus:border-[#13534D] focus:ring-2 focus:ring-[#13534D]/20"
                  rows={3}
                />
                <p className="mt-1 text-right text-xs text-gray-400">
                  {reason.length}/{MAX_REASON_LENGTH}
                </p>
              </div>

              {submitError && (
                <p role="alert" className="mb-2 w-full rounded-md bg-red-50 p-2 text-sm text-red-600">
                  {submitError}
                </p>
              )}

              <div className="mt-2 flex w-full gap-3">
                <button
                  onClick={handleConfirmCancel}
                  disabled={!reason.trim() || submitting}
                  className="flex-1 rounded-lg bg-red-600 py-2.5 font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  {submitting ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSubmitError(null);
                  }}
                  disabled={submitting}
                  className="flex-1 rounded-lg border border-[#13534D] bg-white py-2.5 font-semibold text-[#13534D] transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}