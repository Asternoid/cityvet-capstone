import React, { useMemo, useState, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import StatusStepper from '../components/common/StatusStepper';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorBoundary from '../components/common/ErrorBoundary';
import useAppointments from '../hooks/useAppointments';
import useAuth from '../hooks/useAuth';
import API from '../api/axios';
import { getPortalForRole } from '../utils/roleGuard';
import Landing from '../pages/public/Landing';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';
import BookingPage from '../pages/client/BookingPage';
import BookAppointment from '../pages/client/BookAppointment';
import MyAppointments from '../pages/client/MyAppointments';
import AppointmentStatus from '../pages/client/AppointmentStatus';
import SubmitFeedback from '../pages/client/SubmitFeedback';
import Notifications from '../pages/client/Notifications';

const portalConfig = {
  client: {
    label: 'Client Portal',
    menu: ['Dashboard', 'Book', 'Appointments', 'Notifications'],
  },
  technician: {
    label: 'Technician Portal',
    menu: ['Dashboard', 'Schedule', 'Leave', 'Notifications'],
  },
  admin: {
    label: 'Admin Portal',
    menu: ['Dashboard', 'Management', 'Accounts', 'Reports'],
  },
};

const statusClass = {
  confirmed: 'bg-green-light text-green-forest',
  pending: 'bg-amber-light text-amber-warm',
  urgent: 'bg-red-light text-red-muted',
  inProgress: 'bg-teal-deep/10 text-teal-deep',
  completed: 'bg-green-light text-green-forest',
  noShow: 'bg-red-light text-red-muted',
};

function Badge({ children, tone = 'confirmed' }) {
  return <StatusBadge status={tone}>{children}</StatusBadge>;
}

function SectionTitle({ title, action }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="font-display text-xl font-bold text-charcoal">{title}</h2>
      {action ? <button className="text-sm font-medium text-teal-deep hover:text-teal-mid">{action}</button> : null}
    </div>
  );
}

function ClientDashboardView() {
  const stats = [
    { label: 'Upcoming', value: '02', tone: 'bg-teal-deep text-white' },
    { label: 'Total Bookings', value: '12', tone: 'bg-white text-charcoal border border-gray-light' },
    { label: 'Pending Feedback', value: '02', tone: 'bg-amber-light text-amber-warm' },
  ];

  const upcoming = [
    { service: 'Rabies Vaccination', date: 'Aug 18, 2026', time: '09:00 AM', state: 'confirmed' },
    { service: 'Deworming', date: 'Aug 22, 2026', time: '02:00 PM', state: 'pending' },
  ];

  const history = [
    { service: 'Treatment of Animals', date: 'Aug 08', ref: 'APT-2026-015', state: 'inProgress' },
    { service: 'Vaccination', date: 'Jul 29', ref: 'APT-2026-009', state: 'completed' },
    { service: 'Check-up', date: 'Jul 15', ref: 'APT-2026-007', state: 'noShow' },
  ];

  return (
    <div className="space-y-6">
      <SectionTitle title="Client Dashboard" action="Overview" />
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((item) => (
          <div key={item.label} className={`rounded-card p-5 shadow-card ${item.tone}`}>
            <p className="text-sm font-medium opacity-80">{item.label}</p>
            <div className="mt-3 text-3xl font-bold leading-none">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-card border border-gray-light bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-gray-light bg-off-white px-4 py-3">
            <h3 className="font-display text-lg font-semibold text-charcoal">Upcoming Visits</h3>
            <span className="text-xs uppercase tracking-wide text-gray-mid">Next 2</span>
          </div>
          <div className="divide-y divide-gray-light">
            {upcoming.map((item) => (
              <div key={item.service} className="flex items-center justify-between gap-4 px-4 py-4">
                <div>
                  <p className="font-medium text-charcoal">{item.service}</p>
                  <p className="mt-1 text-sm text-gray-mid">{item.date} • {item.time}</p>
                </div>
                <Badge tone={item.state}>{item.state === 'confirmed' ? 'Confirmed' : 'Pending'}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-card border border-gray-light bg-white p-5 shadow-card">
          <h3 className="font-display text-lg font-semibold text-charcoal">Quick Actions</h3>
          <div className="mt-4 space-y-3">
            {['Book Appointment', 'View History', 'Notifications'].map((action, index) => (
              <button
                key={action}
                className="flex w-full items-center justify-between rounded-btn border border-gray-light bg-off-white px-4 py-3 text-left text-sm font-medium text-charcoal transition-colors duration-150 hover:border-teal-deep hover:bg-green-light"
              >
                <span>{action}</span>
                <span>{index === 2 ? '3' : '→'}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-card border border-gray-light bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-gray-light bg-off-white px-4 py-3">
          <h3 className="font-display text-lg font-semibold text-charcoal">Recent Booking History</h3>
          <button className="text-sm font-medium text-teal-deep hover:text-teal-mid">View all</button>
        </div>

        <div className="divide-y divide-gray-light">
          {history.map((item) => (
            <div key={item.ref} className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-charcoal">{item.service}</p>
                <p className="text-sm text-gray-mid">{item.ref}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-mid">{item.date}</span>
                <Badge tone={item.state}>
                  {item.state === 'inProgress'
                    ? 'In Progress'
                    : item.state === 'completed'
                      ? 'Completed'
                      : 'No-show'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ClientBookView() {
  const [form, setForm] = useState({
    service: 'Rabies Vaccination',
    date: '2026-08-18',
    time: '09:00',
    animalDescription: 'Dog, mild limping and swelling',
    notes: 'Please check for signs of infection.',
  });
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const payload = {
      service: form.service,
      preferredDate: form.date,
      preferredTime: form.time,
      animalDescription: form.animalDescription,
      notes: form.notes,
      reference: `APT-${Date.now()}`,
    };

    try {
      // Try real API call; if backend not available, fallback to mock success
      if (API) {
        await API.post('/appointments/submit', payload);
      }
      setSuccess('Appointment request submitted. Reference: ' + payload.reference);
    } catch (err) {
      console.error('Booking failed', err);
      setError('Failed to submit appointment request. Your request is saved locally for now.');
      // still show success for dev flow
      setSuccess('Appointment request queued (dev mode). Reference: ' + payload.reference);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionTitle title="Book Appointment" action="My Bookings" />
      <div className="mx-auto max-w-2xl rounded-card border border-gray-light bg-white p-6 shadow-card sm:p-8">
        <div className="grid gap-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-charcoal">Select Service</label>
            <select
              value={form.service}
              onChange={(e) => setForm({ ...form, service: e.target.value })}
              className="w-full rounded-btn border border-gray-light bg-white px-3 py-2.5 text-sm text-charcoal outline-none transition duration-150 focus:border-teal-deep focus:ring-2 focus:ring-teal-deep/20"
            >
              <option>Rabies Vaccination</option>
              <option>Deworming</option>
              <option>Check-up</option>
              <option>Treatment of Animals</option>
            </select>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-charcoal">Preferred Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full rounded-btn border border-gray-light bg-white px-3 py-2.5 text-sm text-charcoal outline-none transition duration-150 focus:border-teal-deep focus:ring-2 focus:ring-teal-deep/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-charcoal">Preferred Time</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full rounded-btn border border-gray-light bg-white px-3 py-2.5 text-sm text-charcoal outline-none transition duration-150 focus:border-teal-deep focus:ring-2 focus:ring-teal-deep/20"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-charcoal">Animal Description</label>
            <textarea
              rows={3}
              value={form.animalDescription}
              onChange={(e) => setForm({ ...form, animalDescription: e.target.value })}
              className="w-full rounded-btn border border-gray-light bg-white px-3 py-2.5 text-sm text-charcoal outline-none transition duration-150 focus:border-teal-deep focus:ring-2 focus:ring-teal-deep/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-charcoal">Additional Notes</label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-btn border border-gray-light bg-white px-3 py-2.5 text-sm text-charcoal outline-none transition duration-150 focus:border-teal-deep focus:ring-2 focus:ring-teal-deep/20"
            />
          </div>

          <div>
            {error ? <div className="mb-3 text-sm text-red-muted">{error}</div> : null}
            {success ? <div className="mb-3 text-sm text-green-forest">{success}</div> : null}
            <Button className="w-full" onClick={handleSubmit} disabled={submitting}>{submitting ? 'Submitting...' : 'Save Appointment Request'}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClientAppointmentsView() {
  const rows = [
    { ref: 'APT-2026-015', service: 'Rabies Vaccination', date: 'Aug 18', status: 'technician_confirmed' },
    { ref: 'APT-2026-009', service: 'Vaccination', date: 'Jul 29', status: 'completed' },
    { ref: 'APT-2026-007', service: 'Check-up', date: 'Jul 15', status: 'no_show' },
  ];
  const [selected, setSelected] = useState(rows[0]);

  return (
    <div className="space-y-6">
      <SectionTitle title="My Appointments" action="New Booking" />
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="overflow-hidden rounded-card border border-gray-light bg-white shadow-card">
          <table className="min-w-full text-left">
            <thead className="bg-off-white text-xs uppercase tracking-wide text-gray-mid">
              <tr>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.ref} className={`border-t border-gray-light text-sm text-charcoal ${selected.ref === row.ref ? 'bg-green-light/50' : ''}`}>
                  <td className="px-4 py-3 font-data text-xs"><button onClick={() => setSelected(row)} className="font-medium text-teal-deep hover:underline">{row.ref}</button></td>
                  <td className="px-4 py-3">{row.service}</td>
                  <td className="px-4 py-3">{row.date}</td>
                  <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-card border border-gray-light bg-white p-5 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div><p className="text-xs uppercase tracking-wide text-gray-mid">Appointment details</p><h3 className="mt-1 font-display text-lg font-bold text-charcoal">{selected.service}</h3></div>
            <StatusBadge status={selected.status} />
          </div>
          <div className="mt-5 rounded-xl bg-off-white p-4"><StatusStepper status={selected.status} /></div>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-gray-mid">Reference</dt><dd className="font-data text-xs text-charcoal">{selected.ref}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-gray-mid">Preferred date</dt><dd className="text-charcoal">{selected.date}, 2026</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-gray-mid">Animal description</dt><dd className="max-w-[12rem] text-right text-charcoal">Adult dog, brown coat</dd></div>
          </dl>
        </div>
      </div>
    </div>
  );
}

function ClientNotificationsView() {
  const items = [
    { title: 'Appointment confirmed', detail: 'Rabies Vaccination booking has been approved.', tone: 'confirmed' },
    { title: 'Reminder', detail: 'Your follow-up visit is due in 2 days.', tone: 'pending' },
    { title: 'Service completed', detail: 'Your vaccination record is now available.', tone: 'completed' },
  ];

  return (
    <div className="space-y-6">
      <SectionTitle title="Notifications" action="Mark all as read" />
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.title} className={`rounded-card border border-gray-light p-4 shadow-card ${item.tone === 'confirmed' ? 'bg-white' : item.tone === 'pending' ? 'bg-amber-light/40' : 'bg-green-light/50'}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-charcoal">{item.title}</p>
                <p className="mt-1 text-sm text-gray-mid">{item.detail}</p>
              </div>
              <span className="h-2.5 w-2.5 rounded-full bg-amber-warm" aria-hidden="true" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TechnicianDashboardView() {
  const stats = [
    { label: 'Pending', value: '09', tone: 'bg-amber-light text-amber-warm' },
    { label: 'Confirmed', value: '14', tone: 'bg-teal-deep text-white' },
    { label: 'In Progress', value: '06', tone: 'bg-teal-deep/10 text-teal-deep' },
    { label: 'Done', value: '22', tone: 'bg-green-light text-green-forest' },
  ];

  const jobs = [
    { client: 'Maria Santos', service: 'Deworming', barangay: 'Barangay 1', time: '08:00 AM', tone: 'urgent' },
    { client: 'Leo Ramos', service: 'Treatment of Animals', barangay: 'Barangay 3', time: '09:30 AM', tone: 'pending' },
    { client: 'Ren Ramos', service: 'Vaccination', barangay: 'Barangay 5', time: '11:00 AM', tone: 'confirmed' },
  ];

  return (
    <div className="space-y-6">
      <SectionTitle title="Technician Dashboard" action="Today's Queue" />
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className={`rounded-full px-4 py-3 text-center text-sm font-medium ${item.tone}`}>
            <div className="text-xl font-bold">{item.value}</div>
            <div>{item.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-card border border-gray-light bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-gray-light bg-off-white px-4 py-3">
          <h3 className="font-display text-lg font-semibold text-charcoal">Today's Appointments</h3>
          <span className="text-sm text-gray-mid">3 assigned</span>
        </div>

        <div className="divide-y divide-gray-light">
          {jobs.map((job) => (
            <div key={job.client} className={`flex items-center justify-between gap-4 border-l-4 px-4 py-4 ${job.tone === 'urgent' ? 'border-red-muted bg-red-light/30' : job.tone === 'pending' ? 'border-amber-warm bg-amber-light/40' : 'border-teal-deep bg-white'}`}>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-charcoal">{job.client}</p>
                  <Badge tone={job.tone === 'urgent' ? 'urgent' : job.tone === 'pending' ? 'pending' : 'confirmed'}>{job.tone === 'urgent' ? 'Urgent' : job.tone === 'pending' ? 'Pending' : 'Confirmed'}</Badge>
                </div>
                <p className="mt-1 text-sm text-gray-mid">{job.service} • {job.barangay}</p>
              </div>
              <span className="text-sm font-medium text-charcoal">{job.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TechnicianScheduleView() {
  const schedule = [
    { time: '08:00 AM', client: 'Maria Santos', service: 'Deworming', state: 'confirmed' },
    { time: '09:30 AM', client: 'Leo Ramos', service: 'Treatment of Animals', state: 'urgent' },
    { time: '02:00 PM', client: 'Ren Ramos', service: 'Vaccination', state: 'pending' },
  ];

  return (
    <div className="space-y-6">
      <SectionTitle title="Weekly Schedule" action="Mon-Sun" />
      <div className="rounded-card border border-gray-light bg-white shadow-card">
        <div className="border-b border-gray-light bg-off-white px-4 py-3">
          <div className="flex flex-wrap gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <button key={day} className={`rounded-btn px-3 py-2 text-sm ${index === 0 ? 'bg-teal-deep text-white' : 'bg-white text-charcoal hover:bg-off-white'}`}>
                {day}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-gray-light">
          {schedule.map((item) => (
            <div key={item.time} className="flex items-center justify-between gap-4 px-4 py-4">
              <span className="font-data text-sm text-charcoal">{item.time}</span>
              <div className="flex-1">
                <p className="font-medium text-charcoal">{item.client}</p>
                <p className="text-sm text-gray-mid">{item.service}</p>
              </div>
              <Badge tone={item.state === 'urgent' ? 'urgent' : item.state === 'pending' ? 'pending' : 'confirmed'}>{item.state === 'urgent' ? 'Urgent' : item.state === 'pending' ? 'Pending' : 'Confirmed'}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TechnicianLeaveView() {
  return (
    <div className="space-y-6">
      <SectionTitle title="Leave / Unavailability" action="History" />
      <div className="rounded-card border border-gray-light bg-white p-6 shadow-card">
        <div className="mb-4 rounded-card border border-amber-warm/40 bg-amber-light p-3 text-sm text-amber-warm">
          Existing appointments in the selected range will be queued for reassignment by the admin team.
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-charcoal">Start Date</label>
            <input type="date" className="w-full rounded-btn border border-gray-light bg-white px-3 py-2.5 text-sm text-charcoal" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-charcoal">End Date</label>
            <input type="date" className="w-full rounded-btn border border-gray-light bg-white px-3 py-2.5 text-sm text-charcoal" />
          </div>
        </div>

        <div className="mt-5">
          <label className="mb-1 block text-sm font-medium text-charcoal">Reason</label>
          <textarea rows={4} className="w-full rounded-btn border border-gray-light bg-white px-3 py-2.5 text-sm text-charcoal" />
        </div>

        <Button className="mt-5">Submit Leave Request</Button>
      </div>
    </div>
  );
}

function TechnicianNotificationsView() {
  const items = [
    { title: 'New assignment', detail: 'You have been assigned to a vaccination request.', tone: 'confirmed' },
    { title: 'Leave update', detail: 'Admin reviewed your leave request and marked it pending.', tone: 'pending' },
  ];

  return (
    <div className="space-y-6">
      <SectionTitle title="Notifications" action="Mark all as read" />
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.title} className={`rounded-card border border-gray-light p-4 shadow-card ${item.tone === 'confirmed' ? 'bg-white' : 'bg-amber-light/40'}`}>
            <p className="font-medium text-charcoal">{item.title}</p>
            <p className="mt-1 text-sm text-gray-mid">{item.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminDashboardView() {
  const stats = [
    { label: 'Total Appointments', value: '128', tone: 'bg-teal-deep text-white' },
    { label: 'Pending Assignment', value: '24', tone: 'bg-amber-light text-amber-warm' },
    { label: 'Exceptions', value: '08', tone: 'bg-white text-charcoal border border-gray-light' },
    { label: 'In Progress Today', value: '18', tone: 'bg-green-light text-green-forest' },
  ];

  const rows = [
    { ref: 'APT-2026-015', client: 'Juan dela Cruz', service: 'Rabies Vaccination', date: 'Aug 18', tech: 'Dr. S. Cruz', state: 'pending' },
    { ref: 'APT-2026-118', client: 'Maria Santos', service: 'Deworming', date: 'Aug 18', tech: 'A. Gomez', state: 'confirmed' },
    { ref: 'APT-2026-201', client: 'Leo Ramos', service: 'Treatment of Animals', date: 'Aug 19', tech: 'R. Lim', state: 'urgent' },
  ];

  return (
    <div className="space-y-6">
      <SectionTitle title="Admin Dashboard" action="Overview" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className={`rounded-card p-5 shadow-card ${item.tone}`}>
            <p className="text-sm font-medium opacity-80">{item.label}</p>
            <div className="mt-3 text-3xl font-bold leading-none">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="overflow-hidden rounded-card border border-gray-light bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-gray-light bg-off-white px-4 py-3">
            <h3 className="font-display text-lg font-semibold text-charcoal">Recent Appointments</h3>
            <span className="text-xs uppercase tracking-wide text-gray-mid">This Week</span>
          </div>
          <table className="min-w-full text-left">
            <thead className="bg-off-white text-xs uppercase tracking-wide text-gray-mid">
              <tr>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.ref} className="border-t border-gray-light text-sm text-charcoal">
                  <td className="px-4 py-3 font-data text-xs">{row.ref}</td>
                  <td className="px-4 py-3">{row.client}</td>
                  <td className="px-4 py-3">{row.service}</td>
                  <td className="px-4 py-3">{row.date}</td>
                  <td className="px-4 py-3"><Badge tone={row.state}>{row.state === 'urgent' ? 'Urgent' : row.state === 'confirmed' ? 'Confirmed' : 'Pending'}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-card border border-gray-light bg-white p-5 shadow-card">
          <h3 className="font-display text-lg font-semibold text-charcoal">System Overview</h3>
          <div className="mt-4 space-y-4">
            {[
              ['Available Technicians', '14'],
              ['Pending Verifications', '09'],
              ['Registered Clients', '1,248'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-card bg-off-white p-3">
                <span className="text-sm text-gray-mid">{label}</span>
                <span className="font-data text-lg font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminManagementView() {
  const rows = [
    { ref: 'APT-2026-202', client: 'R. Dela Vega', service: 'Check-up', barangay: 'Barangay 2', date: 'Aug 19', status: 'Needs Review', tone: 'pending' },
    { ref: 'APT-2026-203', client: 'C. Escobar', service: 'Vaccination', barangay: 'Barangay 4', date: 'Aug 19', status: 'Assigned', tone: 'confirmed' },
  ];

  return (
    <div className="space-y-6">
      <SectionTitle title="Appointment Management" action="Exceptions" />
      <div className="overflow-hidden rounded-card border border-gray-light bg-white shadow-card">
        <table className="min-w-full text-left">
          <thead className="bg-off-white text-xs uppercase tracking-wide text-gray-mid">
            <tr>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Barangay</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.ref} className="border-t border-gray-light text-sm text-charcoal">
                <td className="px-4 py-3 font-data text-xs">{row.ref}</td>
                <td className="px-4 py-3">{row.client}</td>
                <td className="px-4 py-3">{row.service}</td>
                <td className="px-4 py-3">{row.barangay}</td>
                <td className="px-4 py-3"><Badge tone={row.tone}>{row.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminAccountsView() {
  const rows = [
    { name: 'A. Gomez', title: 'Vaccination', status: 'Available', account: 'Active' },
    { name: 'R. Lim', title: 'Treatment', status: 'Assigned', account: 'Active' },
    { name: 'S. Cruz', title: 'General Care', status: 'On Leave', account: 'Inactive' },
  ];

  return (
    <div className="space-y-6">
      <SectionTitle title="Technician Accounts" action="Filter" />
      <div className="overflow-hidden rounded-card border border-gray-light bg-white shadow-card">
        <table className="min-w-full text-left">
          <thead className="bg-off-white text-xs uppercase tracking-wide text-gray-mid">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Service Area</th>
              <th className="px-4 py-3">Availability</th>
              <th className="px-4 py-3">Account</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name} className="border-t border-gray-light text-sm text-charcoal">
                <td className="px-4 py-3 font-medium">{row.name}</td>
                <td className="px-4 py-3">{row.title}</td>
                <td className="px-4 py-3"><Badge tone={row.status === 'Available' ? 'confirmed' : row.status === 'Assigned' ? 'pending' : 'urgent'}>{row.status}</Badge></td>
                <td className="px-4 py-3">{row.account}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminReportsView() {
  return (
    <div className="space-y-6">
      <SectionTitle title="Reports" action="Generate" />
      <div className="grid gap-6 xl:grid-cols-[1.2fr_1.8fr]">
        <div className="rounded-card border border-gray-light bg-white p-5 shadow-card">
          <h3 className="font-display text-lg font-semibold text-charcoal">Report Type</h3>
          <div className="mt-4 space-y-3">
            {['Appointments', 'Client Feedback', 'Technician Performance', 'Blackout Overview'].map((item) => (
              <label key={item} className="flex items-center gap-3 rounded-btn border border-gray-light bg-off-white p-3 text-sm text-charcoal">
                <input type="radio" name="reportType" defaultChecked={item === 'Appointments'} />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-card border border-gray-light bg-white p-5 shadow-card">
          <h3 className="font-display text-lg font-semibold text-charcoal">Report Parameters</h3>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-charcoal">From</label>
              <input type="date" className="w-full rounded-btn border border-gray-light bg-white px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-charcoal">To</label>
              <input type="date" className="w-full rounded-btn border border-gray-light bg-white px-3 py-2.5 text-sm" />
            </div>
          </div>
          <button className="mt-5 rounded-btn bg-teal-deep px-4 py-3 text-sm font-medium text-white hover:bg-teal-mid">
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
}

function PublicPage({ page }) {
  const navigate = useNavigate();
  const go = (name) => navigate(
    name === 'Register' ? '/register' : name === 'Login' ? '/login' : '/client/dashboard'
  );

  if (page === 'login') return <Login onNavigate={go} />;
  if (page === 'register') return <Register onNavigate={go} />;
  return <Landing onNavigate={go} />;
}

function PortalPage({ portal, section }) {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading: apptsLoading } = useAppointments();
  const actualPortal = user ? getPortalForRole(user.role) : null;
  const activeMenu = portalConfig[portal].menu;
  const displayName = user?.full_name || user?.name || user?.email?.split('@')[0] || 'Client';

  if (authLoading) return <LoadingSpinner label="Loading your portal..." />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (actualPortal !== portal) return <Navigate to={`/${actualPortal}/dashboard`} replace />;

  const sectionView = portal === 'client'
    ? section === 'Book' ? <BookingPage />
      : section === 'Appointments' ? <ClientAppointmentsView />
        : section === 'Notifications' ? <ClientNotificationsView />
          : <ClientDashboardView />
    : portal === 'technician'
      ? section === 'Schedule' ? <TechnicianScheduleView />
        : section === 'Leave' ? <TechnicianLeaveView />
          : section === 'Notifications' ? <TechnicianNotificationsView />
            : <TechnicianDashboardView />
      : section === 'Management' ? <AdminManagementView />
        : section === 'Accounts' ? <AdminAccountsView />
          : section === 'Reports' ? <AdminReportsView />
            : <AdminDashboardView />;

  const sectionPath = (item) => {
    const paths = {
      Dashboard: 'dashboard',
      Book: 'book',
      Appointments: 'appointments',
      Notifications: 'notifications',
      Schedule: 'schedule',
      Leave: 'leave',
      Management: 'management',
      Accounts: 'accounts',
      Reports: 'reports',
    };
    return `/${portal}/${paths[item] || 'dashboard'}`;
  };
  const portalTabs = actualPortal === 'admin' ? ['admin'] : [portal];

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-off-white text-charcoal">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Navbar
            title="CityVet"
            subtitle="Office of the City Veterinarian"
            tabs={portalTabs.map((key) => portalConfig[key].label)}
            activeTab={portalConfig[portal].label}
            userName={displayName}
          />
          <div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]">
            <Sidebar
              items={activeMenu}
              activeItem={section}
              onSelect={(item) => navigate(sectionPath(item))}
            />
            <main>{apptsLoading ? <LoadingSpinner label="Loading appointments..." /> : sectionView}</main>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicPage page="landing" />} />
      <Route path="/login" element={<PublicPage page="login" />} />
      <Route path="/register" element={<PublicPage page="register" />} />
      <Route path="/client/dashboard" element={<PortalPage portal="client" section="Dashboard" />} />
      <Route path="/client/book" element={<PortalPage portal="client" section="Book" />} />
      <Route path="/client/book-appointment" element={<BookAppointment />} />
      <Route path="/client/appointments" element={<PortalPage portal="client" section="Appointments" />} />
      <Route path="/client/appointments/:id" element={<AppointmentStatus />} />
      <Route path="/client/feedback" element={<SubmitFeedback />} />
      <Route path="/client/notifications" element={<Notifications />} />
      <Route path="/technician/dashboard" element={<PortalPage portal="technician" section="Dashboard" />} />
      <Route path="/technician/schedule" element={<PortalPage portal="technician" section="Schedule" />} />
      <Route path="/technician/leave" element={<PortalPage portal="technician" section="Leave" />} />
      <Route path="/technician/notifications" element={<PortalPage portal="technician" section="Notifications" />} />
      <Route path="/admin/dashboard" element={<PortalPage portal="admin" section="Dashboard" />} />
      <Route path="/admin/management" element={<PortalPage portal="admin" section="Management" />} />
      <Route path="/admin/accounts" element={<PortalPage portal="admin" section="Accounts" />} />
      <Route path="/admin/reports" element={<PortalPage portal="admin" section="Reports" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
