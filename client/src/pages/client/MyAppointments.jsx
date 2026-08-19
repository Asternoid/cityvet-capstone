import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppointmentCard from '../../components/client/AppointmentCard';
import RescheduleModal from '../../components/client/RescheduleModal';
import CancelModal from '../../components/client/CancelModal';
import API from '../../api/axios';

const seedAppointments = [
  {
    id: 'APT-2026-015',
    petName: 'Milo',
    service: 'Rabies Vaccination',
    date: '2026-08-18',
    preferredDate: '2026-08-18',
    preferredTime: '09:00',
    technicianName: 'Dr. Sarah Cruz',
    status: 'technician_confirmed',
  },
  {
    id: 'APT-2026-017',
    petName: 'Luna',
    service: 'Check-up',
    date: '2026-08-22',
    preferredDate: '2026-08-22',
    preferredTime: '14:00',
    technicianName: 'Dr. Alex Ramos',
    status: 'pending_technician_confirmation',
  },
  {
    id: 'APT-2026-020',
    petName: 'Hana',
    service: 'Deworming',
    date: '2026-08-04',
    preferredDate: '2026-08-04',
    preferredTime: '11:00',
    technicianName: 'Dr. Sarah Cruz',
    status: 'completed',
  },
];

export default function MyAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState(seedAppointments);
  const [rescheduleAppointment, setRescheduleAppointment] = useState(null);
  const [cancelAppointment, setCancelAppointment] = useState(null);

  const handleReschedule = async ({ id, newDate, newTime }) => {
    try {
      await API.post(`/appointments/${id}/reschedule`, { newDate, newTime });
      setAppointments((current) => current.map((appointment) =>
        appointment.id === id ? { ...appointment, preferredDate: newDate, preferredTime: newTime, status: 'pending_technician_confirmation' } : appointment
      ));
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Unable to reschedule this appointment.');
    }
  };

  const handleCancel = async ({ id, reason }) => {
    try {
      await API.post(`/appointments/${id}/cancel`, { reason });
      setAppointments((current) => current.map((appointment) =>
        appointment.id === id ? { ...appointment, status: 'cancelled' } : appointment
      ));
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Unable to cancel this appointment.');
    }
  };

  const handleFeedback = (appointment) => {
    navigate('/client/feedback', { state: { appointment } });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-mid">Appointments</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-charcoal">My Appointments</h1>
        </div>
        <button
          type="button"
          onClick={() => navigate('/client/book-appointment')}
          className="rounded-btn bg-teal-deep px-4 py-2 text-sm font-medium text-white hover:bg-teal-mid"
        >
          Book New Appointment
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {appointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            onReschedule={setRescheduleAppointment}
            onCancel={setCancelAppointment}
            onFeedback={handleFeedback}
          />
        ))}
      </div>

      <RescheduleModal
        open={Boolean(rescheduleAppointment)}
        appointment={rescheduleAppointment}
        onClose={() => setRescheduleAppointment(null)}
        onSubmit={handleReschedule}
      />

      <CancelModal
        open={Boolean(cancelAppointment)}
        appointment={cancelAppointment}
        onClose={() => setCancelAppointment(null)}
        onSubmit={handleCancel}
      />
    </div>
  );
}
