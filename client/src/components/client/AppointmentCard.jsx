import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';
import { formatAppointmentDateTime, formatStatusLabel } from '../../utils/dateUtils';

export default function AppointmentCard({ appointment, onReschedule, onCancel, onFeedback }) {
  const navigate = useNavigate();
  const status = appointment.status || 'pending';

  const openStatus = () => {
    navigate(`/client/appointments/${appointment.id}`, { state: { appointment } });
  };

  return (
    <div className="rounded-card border border-gray-light bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-charcoal">{appointment.petName || appointment.service || 'Appointment'}</p>
          <p className="mt-1 text-sm text-gray-mid">{appointment.service || 'General consultation'}</p>
        </div>
        <StatusBadge status={status}>{formatStatusLabel(status)}</StatusBadge>
      </div>

      <div className="mt-4 space-y-2 text-sm text-gray-mid">
        <p>Technician: {appointment.technicianName || 'Awaiting assignment'}</p>
        <p>{formatAppointmentDateTime(appointment.preferredDate || appointment.date, appointment.preferredTime || appointment.time)}</p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button variant="secondary" onClick={openStatus} type="button">View Status</Button>
        <Button variant="secondary" onClick={() => onReschedule?.(appointment)} type="button">Reschedule</Button>
        <Button variant="danger" onClick={() => onCancel?.(appointment)} type="button">Cancel</Button>
        {status === 'completed' && (
          <Button variant="primary" onClick={() => onFeedback?.(appointment)} type="button">Submit Feedback</Button>
        )}
      </div>
    </div>
  );
}
