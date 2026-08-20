import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import StatusTracker from '../../components/client/StatusTracker';
import useRoleData from '../../hooks/useRoleData';

export default function AppointmentStatus() {
  const { id } = useParams();
  const location = useLocation();
  const { appointments, loading, error } = useRoleData();
  const appointment = location.state?.appointment || appointments.find((item) => item.id === id);

  if (loading) return <div className="p-8"><p className="text-sm text-gray-mid">Loading appointment...</p></div>;
  if (error || !appointment) return <div className="p-8"><p className="text-sm text-red-muted">{error || 'Appointment not found.'}</p></div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-mid">Appointment Tracker</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-charcoal">{appointment.service}</h1>
      </div>
      <StatusTracker appointment={{ ...appointment, id: appointment.id || id }} />
    </div>
  );
}
