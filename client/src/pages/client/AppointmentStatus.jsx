import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Check, Circle, AlertCircle } from 'lucide-react';
import API from '../../api/axios';

/**
 * AppointmentStatus — shows the five-stage appointment workflow.
 *
 * The five stages (Section 1.3 Objective 3, Section 1.6):
 *   1. Pending Technician Confirmation
 *   2. Technician Confirmed
 *   3. In Progress
 *   4. Completed  — terminal (positive)
 *   5. No-Show    — terminal (missed)
 *
 * Security: this page ALWAYS fetches the appointment fresh from the server
 * by its :id, and never trusts data handed to it via router state. Router
 * state is client-controlled — a user could otherwise craft a link or use
 * dev tools to display a fabricated "Completed" status for an appointment
 * that never happened, or view details of an appointment that isn't theirs.
 * The server is expected to return 403/404 for appointments the logged-in
 * client does not own; this page treats that response as "not found" and
 * does not distinguish the two to avoid leaking which IDs exist.
 */

const STAGES = [
  { key: 'Pending Technician Confirmation', label: 'Pending\nTechnician\nConfirmation' },
  { key: 'Technician Confirmed', label: 'Technician\nConfirmed' },
  { key: 'In Progress', label: 'In Progress' },
  { key: 'Completed', label: 'Completed' },
  { key: 'No-Show', label: 'No-Show' },
];

function getStageStates(currentStatus) {
  const stageOrder = ['Pending Technician Confirmation', 'Technician Confirmed', 'In Progress'];
  const isCompleted = currentStatus === 'Completed';
  const isNoShow = currentStatus === 'No-Show';
  const currentIndex = stageOrder.indexOf(currentStatus);

  return STAGES.map((stage) => {
    if (stage.key === 'Completed') {
      return { ...stage, done: isCompleted, active: isCompleted };
    }
    if (stage.key === 'No-Show') {
      return { ...stage, done: isNoShow, active: isNoShow };
    }
    const stageIdx = stageOrder.indexOf(stage.key);
    const done = stageIdx <= currentIndex || isCompleted || isNoShow;
    const active = stageIdx === currentIndex && !isCompleted && !isNoShow;
    return { ...stage, done, active };
  });
}

function getStatusMessage(status, appointment) {
  const dateTime = `${appointment.preferred_date} at ${appointment.preferred_time}`;
  switch (status) {
    case 'Pending Technician Confirmation':
      return 'Your appointment request has been submitted. Waiting for your assigned technician to confirm.';
    case 'Technician Confirmed':
      return `Your appointment has been confirmed. A veterinary technician will visit your address on ${dateTime}. Please ensure someone is home to receive them.`;
    case 'In Progress':
      return 'Your technician is currently on the way or attending to your appointment.';
    case 'Completed':
      return "Your appointment has been completed. Thank you for using the Gingoog City Veterinary Clinic's services.";
    case 'No-Show':
      return 'The technician visited your address but no one was present. Please contact the clinic to reschedule.';
    default:
      return '';
  }
}

function canCancel(status) {
  return status === 'Pending Technician Confirmation' || status === 'Technician Confirmed';
}

export default function AppointmentStatus() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAppointment = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get(`/appointments/${encodeURIComponent(id)}`);
      setAppointment(res.data?.data || null);
    } catch (err) {
      // Treat 403 and 404 identically so we don't confirm/deny existence
      // of appointments the current client does not own.
      setError('We could not find that appointment.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAppointment();
  }, [loadAppointment]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-xl bg-white p-10 text-center text-gray-500 shadow-sm">Loading appointment…</div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-col items-center gap-3 rounded-xl bg-white p-10 text-center shadow-sm">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="text-gray-700">{error || 'Appointment not found.'}</p>
          <Link to="/client/appointments" className="font-medium text-[#13534D] hover:underline">
            Back to Booking History
          </Link>
        </div>
      </div>
    );
  }

  const stageStates = getStageStates(appointment.status);
  const statusMessage = getStatusMessage(appointment.status, appointment);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-[#0B3A36]">Appointment Status</h1>

      {/* Summary Card */}
      <div className="mb-6 rounded-lg bg-[#13534D] p-6 text-white shadow-md">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-white/60">Service</p>
            <p className="mt-1 font-semibold">{appointment.service_name}</p>
          </div>
          <div>
            <p className="text-xs text-white/60">Animal</p>
            <p className="mt-1 font-semibold">{appointment.animal_description}</p>
          </div>
          <div>
            <p className="text-xs text-white/60">Date &amp; Time</p>
            <p className="mt-1 font-semibold">
              {appointment.preferred_date} · {appointment.preferred_time}
            </p>
          </div>
          <div>
            <p className="text-xs text-white/60">Reference No.</p>
            <p className="mt-1 font-semibold">{appointment.reference_no}</p>
          </div>
        </div>
      </div>

      {/* Progress Tracker Card */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="mb-8 text-lg font-semibold text-[#0B3A36]">Appointment Progress</h3>

        <div className="relative mb-8 flex items-start justify-between px-2">
          <div className="absolute left-6 right-6 top-5 -z-10 h-0.5 bg-gray-200" />
          {stageStates.map((stage) => {
            const isTerminalNoShow = stage.key === 'No-Show';
            const dotClass = stage.done
              ? isTerminalNoShow
                ? 'bg-red-600 border-red-600 text-white'
                : 'bg-[#13534D] border-[#13534D] text-white'
              : 'border-gray-300 bg-white text-gray-400';

            return (
              <div key={stage.key} className="flex flex-col items-center text-center" style={{ flex: 1 }}>
                <div className={`z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 ${dotClass}`}>
                  {stage.done ? <Check size={18} /> : <Circle size={18} />}
                </div>
                <p
                  className={`mt-2 whitespace-pre-line text-xs font-semibold leading-tight ${
                    stage.done ? (isTerminalNoShow ? 'text-red-700' : 'text-[#0B3A36]') : 'text-gray-400'
                  }`}
                >
                  {stage.label}
                </p>
                {stage.active && appointment.status_updated_at && (
                  <p className="mt-0.5 text-[10px] text-gray-500">{appointment.status_updated_at}</p>
                )}
              </div>
            );
          })}
        </div>

        {statusMessage && (
          <div
            className={`mb-8 rounded-md border-l-4 p-4 text-sm ${
              appointment.status === 'No-Show'
                ? 'border-red-500 bg-red-50 text-red-800'
                : appointment.status === 'Completed'
                ? 'border-green-600 bg-green-50 text-green-800'
                : 'border-[#13534D] bg-[#E8F5F4] text-[#0B3A36]'
            }`}
          >
            {statusMessage}
          </div>
        )}

        <div className="flex flex-col gap-4 sm:flex-row">
          {canCancel(appointment.status) && (
            <button
              onClick={() => navigate(`/client/cancel/${appointment.id}`)}
              className="w-full rounded-lg border-2 border-red-500 bg-white py-2.5 text-center font-medium text-red-600 transition hover:bg-red-50 sm:w-auto sm:px-6"
            >
              Cancel Appointment
            </button>
          )}
          <Link
            to="/client/appointments"
            className="w-full rounded-lg border-2 border-[#13534D] bg-white py-2.5 text-center font-medium text-[#0B3A36] transition hover:bg-gray-50 sm:w-auto sm:px-6"
          >
            Back to History
          </Link>
        </div>
      </div>
    </div>
  );
}