import React from 'react';
import StatusStepper from '../common/StatusStepper';
import StatusBadge from '../common/StatusBadge';
import { formatAppointmentDateTime, formatStatusLabel } from '../../utils/dateUtils';

export default function StatusTracker({ appointment }) {
  const status = appointment?.status || 'pending_technician_confirmation';
  const logs = appointment?.statusLog || [];

  return (
    <div className="rounded-card border border-gray-light bg-white p-6 shadow-card">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-mid">Appointment #{appointment?.id || 'N/A'}</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-charcoal">{appointment?.petName || 'Pet'}</h2>
        </div>
        <StatusBadge status={status}>{formatStatusLabel(status)}</StatusBadge>
      </div>

      <div className="mt-6 rounded-card bg-off-white p-4">
        <StatusStepper status={status} statusLog={logs} />
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div className="rounded-card border border-gray-light bg-off-white p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-mid">Service</p>
          <p className="mt-2 text-lg font-semibold text-charcoal">{appointment?.service || 'General consultation'}</p>
          <p className="mt-2 text-sm text-gray-mid">
            {formatAppointmentDateTime(appointment?.preferredDate || appointment?.date, appointment?.preferredTime || appointment?.time)}
          </p>
        </div>

        <div className="rounded-card border border-gray-light bg-off-white p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-mid">Assigned technician</p>
          <p className="mt-2 text-lg font-semibold text-charcoal">{appointment?.technicianName || 'Awaiting assignment'}</p>
          <p className="mt-2 text-sm text-gray-mid">Estimated arrival: {appointment?.estimatedArrival || 'Pending confirmation'}</p>
        </div>
      </div>
    </div>
  );
}
