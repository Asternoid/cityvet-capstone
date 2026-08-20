import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, FileText, Bell, AlertCircle } from 'lucide-react';
import API from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import { DashboardSkeleton } from '../../components/common/Skeleton';

/**
 * Client Dashboard — HomeDashboard
 *
 * All data is fetched live from the server for the authenticated client.
 * No animal-profile card is shown: the system deliberately excludes animal
 * profiling (Section 1.5 Delimitations). Client data is limited to name,
 * contact number, and barangay address.
 *
 * Status labels follow the five-stage workflow (Section 1.6):
 *   Pending Technician Confirmation → Technician Confirmed → In Progress → Completed / No-Show
 *
 * Security notes:
 *  - This page never trusts client-supplied state for what appointments exist;
 *    everything is re-fetched from the authenticated /appointments/my endpoint,
 *    which the server scopes to the logged-in client's own records only.
 *  - No raw server error text is rendered to avoid leaking backend details.
 */

const STATUS_COLORS = {
  'Pending Technician Confirmation': 'bg-yellow-100 text-yellow-800',
  'Technician Confirmed': 'bg-[#e8f5f4] text-[#13534D]',
  'In Progress': 'bg-blue-100 text-blue-800',
  Completed: 'bg-green-100 text-green-800',
  'No-Show': 'bg-red-100 text-red-700',
};

export default function HomeDashboard() {
  const { user } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const today = new Date().toLocaleDateString('en-PH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/appointments/my');
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      setAppointments(list);
    } catch (err) {
      setError('We could not load your dashboard right now. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const ACTIVE_STATUSES = ['Pending Technician Confirmation', 'Technician Confirmed', 'In Progress'];

  const upcomingAppointment = appointments
    .filter((a) => ACTIVE_STATUSES.includes(a.status))
    .sort((a, b) => new Date(a.preferred_date) - new Date(b.preferred_date))[0];

  const feedbackPending = appointments.filter((a) => a.status === 'Completed' && !a.feedback_submitted);

  const recentAppointments = [...appointments]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#13534D]">
          Welcome Back, <span className="text-[#0B3A36]">{user?.fullName || 'Client'}</span>
        </h1>
        <p className="mt-2 text-lg text-gray-700">{today} · Gingoog City</p>
      </div>

      {/* Quick Action Buttons */}
      <div className="mb-10 flex flex-wrap gap-4">
        <Link
          to="/client/book"
          className="flex items-center gap-2 rounded-md bg-[#13534D] px-6 py-4 text-white shadow-sm transition hover:bg-[#0B3A36]"
        >
          <Calendar className="h-5 w-5" /> Book Appointment
        </Link>
        <Link
          to="/client/appointments"
          className="flex items-center gap-2 rounded-md border-2 border-[#13534D] bg-white px-6 py-4 text-[#13534D] transition hover:bg-[#F0F5F4]"
        >
          <FileText className="h-5 w-5" /> My Appointments
        </Link>
        <Link
          to="/client/notifications"
          className="flex items-center gap-2 rounded-md border-2 border-[#13534D] bg-white px-6 py-4 text-[#13534D] transition hover:bg-[#F0F5F4]"
        >
          <Bell className="h-5 w-5" /> Notifications
        </Link>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          <button onClick={loadDashboard} className="ml-auto font-semibold underline">
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* Stats Cards */}
          <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Card 1: Upcoming Appointment */}
            <div className="rounded-xl border-l-[6px] border-[#4ADE80] bg-white p-5 shadow-sm">
              <p className="mb-2 text-sm text-gray-600">Upcoming Appointment</p>
              {upcomingAppointment ? (
                <>
                  <h3 className="text-lg font-semibold text-[#0B3A36]">{upcomingAppointment.service_name}</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    {upcomingAppointment.preferred_date} · {upcomingAppointment.preferred_time}
                  </p>
                  <span
                    className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                      STATUS_COLORS[upcomingAppointment.status] || 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {upcomingAppointment.status}
                  </span>
                </>
              ) : (
                <p className="text-sm text-gray-500">No upcoming appointments.</p>
              )}
            </div>

            {/* Card 2: Pending Feedback */}
            <div className="rounded-xl border-l-[6px] border-[#FBBF24] bg-white p-5 shadow-sm">
              <p className="mb-2 text-sm text-gray-600">Pending Feedback</p>
              {feedbackPending.length > 0 ? (
                <>
                  <h3 className="text-4xl font-bold text-[#0B3A36]">{feedbackPending.length}</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    {feedbackPending[0].service_name} · {feedbackPending[0].preferred_date}
                  </p>
                  <Link
                    to={`/client/feedback/${feedbackPending[0].id}`}
                    state={{ appointmentId: feedbackPending[0].id }}
                    className="mt-3 flex items-center text-sm font-medium text-[#13534D] hover:underline"
                  >
                    Leave Feedback <span className="ml-1">→</span>
                  </Link>
                </>
              ) : (
                <p className="text-sm text-gray-500">No pending feedback.</p>
              )}
            </div>
          </div>

          {/* Recent Appointments */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0B3A36]">Recent Appointments</h2>
              <Link to="/client/appointments" className="text-sm font-medium text-[#13534D] hover:underline">
                View All →
              </Link>
            </div>

            {recentAppointments.length === 0 ? (
              <p className="text-sm text-gray-500">No appointment records yet.</p>
            ) : (
              <div className="space-y-4">
                {recentAppointments.map((appt) => (
                  <Link
                    key={appt.id}
                    to={`/client/appointments/${appt.id}`}
                    className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <h4 className="font-semibold text-gray-800">{appt.service_name}</h4>
                      <p className="text-sm text-gray-500">
                        {appt.preferred_date} · {appt.reference_no}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        STATUS_COLORS[appt.status] || 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {appt.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}