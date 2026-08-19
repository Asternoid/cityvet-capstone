import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import StatusBadge from '../../components/common/StatusBadge';
import AppointmentCard from '../../components/client/AppointmentCard';

const upcomingAppointments = [
  {
    id: 'APT-2026-015',
    petName: 'Milo',
    service: 'Rabies Vaccination',
    preferredDate: '2026-08-18',
    preferredTime: '09:00',
    status: 'technician_confirmed',
    technicianName: 'Dr. Sarah Cruz',
  },
  {
    id: 'APT-2026-017',
    petName: 'Luna',
    service: 'Deworming',
    preferredDate: '2026-08-22',
    preferredTime: '14:00',
    status: 'pending_technician_confirmation',
    technicianName: 'Awaiting assignment',
  },
];

const recentBookings = [
  { service: 'Treatment of Animals', status: 'in_progress', date: 'Aug 08', reference: 'APT-2026-015' },
  { service: 'Vaccination', status: 'completed', date: 'Jul 29', reference: 'APT-2026-009' },
  { service: 'Check-up', status: 'no_show', date: 'Jul 15', reference: 'APT-2026-007' },
];

export default function ClientDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications = [] } = useNotifications();
  const firstName = user?.full_name?.split(' ')[0] || user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Client';

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-mid">Welcome back</p>
          <h1 className="font-display mt-2 text-3xl font-bold text-charcoal">{firstName}</h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate('/client/appointments')}
            className="rounded-btn border border-teal-deep bg-white px-4 py-2 text-sm font-medium text-teal-deep transition-colors duration-150 hover:bg-green-light"
          >
            My Appointments
          </button>
          <button
            type="button"
            onClick={() => navigate('/client/book-appointment')}
            className="rounded-btn bg-teal-deep px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-teal-mid"
          >
            Book Appointment
          </button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-card border border-gray-light bg-white p-5 shadow-card">
          <p className="text-sm text-gray-mid">Upcoming Appointment</p>
          <h2 className="mt-3 text-xl font-semibold text-charcoal">{upcomingAppointments[0].service}</h2>
          <p className="mt-2 text-sm text-gray-mid">Aug 18, 2026 • 09:00 AM</p>
          <div className="mt-4">
            <StatusBadge status="technician_confirmed">Confirmed</StatusBadge>
          </div>
        </div>

        <div className="rounded-card border border-gray-light bg-white p-5 shadow-card">
          <p className="text-sm text-gray-mid">Total Bookings</p>
          <h2 className="mt-3 text-3xl font-bold text-charcoal">12</h2>
          <p className="mt-2 text-sm text-gray-mid">Across the last 12 months</p>
        </div>

        <div className="rounded-card border border-gray-light bg-white p-5 shadow-card">
          <p className="text-sm text-gray-mid">Pending Feedback</p>
          <h2 className="mt-3 text-3xl font-bold text-charcoal">02</h2>
          <button
            type="button"
            onClick={() => navigate('/client/feedback')}
            className="mt-3 text-sm font-medium text-teal-deep hover:text-teal-mid"
          >
            Leave Feedback →
          </button>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-card border border-gray-light bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-gray-light bg-off-white px-4 py-3">
            <h2 className="font-display text-lg font-semibold text-charcoal">Upcoming Visits</h2>
            <span className="text-xs uppercase tracking-wide text-gray-mid">Next 2</span>
          </div>

          <div className="divide-y divide-gray-light">
            {upcomingAppointments.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 px-4 py-4">
                <div>
                  <p className="font-medium text-charcoal">{item.service}</p>
                  <p className="mt-1 text-sm text-gray-mid">{item.preferredDate} • {item.preferredTime}</p>
                </div>
                <StatusBadge status={item.status}>{item.status === 'technician_confirmed' ? 'Confirmed' : 'Pending'}</StatusBadge>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-card border border-gray-light bg-white p-5 shadow-card">
          <h2 className="font-display text-lg font-semibold text-charcoal">Quick Actions</h2>
          <div className="mt-4 space-y-3">
            <button
              type="button"
              onClick={() => navigate('/client/book-appointment')}
              className="flex w-full items-center justify-between rounded-btn border border-gray-light bg-off-white px-4 py-3 text-left text-sm font-medium text-charcoal transition-colors duration-150 hover:border-teal-deep hover:bg-green-light"
            >
              <span>Book Appointment</span>
              <span>→</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/client/appointments')}
              className="flex w-full items-center justify-between rounded-btn border border-gray-light bg-off-white px-4 py-3 text-left text-sm font-medium text-charcoal transition-colors duration-150 hover:border-teal-deep hover:bg-green-light"
            >
              <span>View History</span>
              <span>→</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/client/notifications')}
              className="flex w-full items-center justify-between rounded-btn border border-gray-light bg-off-white px-4 py-3 text-left text-sm font-medium text-charcoal transition-colors duration-150 hover:border-teal-deep hover:bg-green-light"
            >
              <span>Notifications</span>
              <span>{notifications.filter((item) => !item.read).length || 3}</span>
            </button>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-card border border-gray-light bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-gray-light bg-off-white px-4 py-3">
          <h2 className="font-display text-lg font-semibold text-charcoal">Recent Booking History</h2>
          <button type="button" onClick={() => navigate('/client/appointments')} className="text-sm font-medium text-teal-deep hover:text-teal-mid">
            View all
          </button>
        </div>

        <div className="divide-y divide-gray-light">
          {recentBookings.map((item) => (
            <div key={item.reference} className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-charcoal">{item.service}</p>
                <p className="text-sm text-gray-mid">{item.reference}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-mid">{item.date}</span>
                <StatusBadge status={item.status}>{item.status === 'in_progress' ? 'In Progress' : item.status === 'completed' ? 'Completed' : 'No-show'}</StatusBadge>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-charcoal">Recent alerts</h2>
          <button type="button" onClick={() => navigate('/client/notifications')} className="text-sm font-medium text-teal-deep hover:text-teal-mid">
            See all
          </button>
        </div>
        <div className="space-y-3">
          {(notifications || []).slice(0, 3).map((item) => (
            <div key={item.id} className={`rounded-card border p-4 shadow-card ${item.read ? 'border-gray-light bg-white' : 'border-teal-deep/20 bg-green-light/30'}`}>
              <p className="font-medium text-charcoal">{item.title || 'System update'}</p>
              <p className="mt-1 text-sm text-gray-mid">{item.message || item.detail || 'New notification'}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
