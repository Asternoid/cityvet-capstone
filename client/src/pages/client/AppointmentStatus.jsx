import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import StatusTracker from '../../components/client/StatusTracker';

const sampleAppointment = {
  id: 'APT-2026-015',
  petName: 'Milo',
  service: 'Rabies Vaccination',
  status: 'technician_confirmed',
  preferredDate: '2026-08-18',
  preferredTime: '09:00',
  technicianName: 'Dr. Sarah Cruz',
  estimatedArrival: '08:45 AM',
  statusLog: [
    { new_status: 'pending_technician_confirmation', changed_at: '2026-08-10T08:00:00Z' },
    { new_status: 'technician_confirmed', changed_at: '2026-08-11T10:10:00Z' },
  ],
};

export default function AppointmentStatus() {
  const { id } = useParams();
  const location = useLocation();
  const appointment = location.state?.appointment || sampleAppointment;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-mid">Appointment Tracker</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-charcoal">{appointment.service}</h1>
      </div>
      <StatusTracker appointment={{ ...appointment, id: appointment.id || id || sampleAppointment.id }} />
    </div>
  );
}
