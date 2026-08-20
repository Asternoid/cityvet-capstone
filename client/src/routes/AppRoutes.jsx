import React, { useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Bell, CalendarDays, ClipboardList, Home, Plus, ArrowRight, PawPrint } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AppointmentCard from '../components/client/AppointmentCard';
import RescheduleModal from '../components/client/RescheduleModal';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import useRoleData from '../hooks/useRoleData';
import API from '../api/axios';
import { getPortalForRole } from '../utils/roleGuard';
import { supabase } from '../lib/supabaseClient';
import Landing from '../pages/public/Landing';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';
import BookAppointment from '../pages/client/BookAppointment';
import HomeDashboard from '../pages/client/HomeDashboard';
import BookingHistory from '../pages/client/BookingHistory';
import AppointmentStatus from '../pages/client/AppointmentStatus';
import CancelAppointment from '../pages/client/CancelAppointment';
import SubmitFeedback from '../pages/client/SubmitFeedback';
import Notifications from '../pages/client/Notifications';

const portalConfig = {
  client: { label: 'Client Portal', menu: ['Dashboard', 'Book', 'Appointments', 'Notifications'] },
  technician: { label: 'Technician Portal', menu: ['Dashboard', 'Schedule', 'Leave', 'Notifications'] },
  admin: { label: 'Admin Portal', menu: ['Dashboard', 'Management', 'Accounts', 'Reports'] },
};

const clientIcons = { Dashboard: Home, Book: Plus, Appointments: ClipboardList, Notifications: Bell };

function EmptyState({ label, action }) {
  return <div className="rounded-card border border-dashed border-gray-light bg-white p-8 text-center">
    <PawPrint className="mx-auto h-8 w-8 text-teal-deep/50" aria-hidden="true" />
    <p className="mt-3 text-sm text-gray-mid">No {label} found.</p>
    {action}
  </div>;
}

function ClientAppointmentActions({ appointments, reload }) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState(null);

  const closeModal = () => {
    setModal(null);
    setSelected(null);
  };

  const submitReschedule = async ({ id, newDate, newTime }) => {
    await API.post(`/appointments/${id}/reschedule`, { newDate, newTime });
    await reload();
  };

  const actions = {
    onReschedule: (appointment) => { setSelected(appointment); setModal('reschedule'); },
    onCancel: (appointment) => navigate(`/client/cancel/${appointment.id}`),
    onFeedback: (appointment) => navigate(`/client/feedback/${appointment.id}`),
  };

  return <>
    <div className="grid gap-4 xl:grid-cols-2">
      {appointments.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} {...actions} />)}
    </div>
    <RescheduleModal open={modal === 'reschedule'} appointment={selected} onClose={closeModal} onSubmit={submitReschedule} />
  </>;
}

function ClientDashboardView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { appointments, loading, error, reload } = useRoleData();
  const { unreadCount } = useNotifications();
  const upcoming = appointments.filter((item) => !['completed', 'cancelled', 'no_show'].includes(item.status));
  const firstName = (user?.full_name || user?.email || 'there').split(' ')[0];
  return <div className="space-y-6">
    <section className="overflow-hidden rounded-card bg-teal-deep px-6 py-7 text-white shadow-card sm:px-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm text-green-light">Your CityVet care hub</p><h2 className="mt-2 font-display text-3xl font-bold">Good day, {firstName}.</h2><p className="mt-2 max-w-xl text-sm text-green-light">Keep your pet's care moving forward with one simple place for appointments and updates.</p></div>
        <Button onClick={() => navigate('/client/book')} className="shrink-0 bg-white text-teal-deep hover:bg-green-light"><Plus className="mr-2 h-4 w-4" aria-hidden="true" />Book appointment</Button>
      </div>
    </section>
    {loading && <LoadingSpinner label="Loading appointments..." />}{error && <p className="text-sm text-red-muted">{error}</p>}
    <div className="grid gap-4 md:grid-cols-3">{[['Upcoming', upcoming.length, CalendarDays], ['Total bookings', appointments.length, ClipboardList], ['Unread notifications', unreadCount, Bell]].map(([label, value, Icon]) => <div key={label} className="rounded-card border border-gray-light bg-white p-5 shadow-card"><div className="flex items-center justify-between"><p className="text-sm text-gray-mid">{label}</p><Icon className="h-5 w-5 text-teal-deep" aria-hidden="true" /></div><p className="mt-3 font-display text-3xl font-bold text-charcoal">{value}</p></div>)}</div>
    <section><div className="mb-3 flex items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.2em] text-gray-mid">Your schedule</p><h3 className="mt-1 font-display text-2xl font-bold text-charcoal">Upcoming appointments</h3></div>{upcoming.length > 0 && <button type="button" onClick={() => navigate('/client/appointments')} className="inline-flex items-center text-sm font-medium text-teal-deep hover:text-teal-mid">View all <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" /></button>}</div>{upcoming.length ? <ClientAppointmentActions appointments={upcoming.slice(0, 3)} reload={reload} /> : <EmptyState label="upcoming appointments" action={<Button onClick={() => navigate('/client/book')} className="mt-4">Book an appointment</Button>} />}</section>
  </div>;
}

function ClientAppointmentsView() {
  const navigate = useNavigate();
  const { appointments, loading, error, reload } = useRoleData();
  return <div className="space-y-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs uppercase tracking-[0.2em] text-gray-mid">Care history</p><h2 className="mt-1 font-display text-3xl font-bold text-charcoal">My appointments</h2><p className="mt-2 text-sm text-gray-mid">Track every visit and manage your upcoming care.</p></div><Button onClick={() => navigate('/client/book')}><Plus className="mr-2 h-4 w-4" aria-hidden="true" />Book appointment</Button></div>{loading && <LoadingSpinner label="Loading appointments..." />}{error && <p className="text-sm text-red-muted">{error}</p>}{appointments.length ? <ClientAppointmentActions appointments={appointments} reload={reload} /> : !loading && <EmptyState label="appointments" action={<Button onClick={() => navigate('/client/book')} className="mt-4">Book an appointment</Button>} />}</div>;
}

function TechnicianView({ schedule = false }) {
  const { appointments, loading, error } = useRoleData();
  const rows = schedule ? appointments : appointments.filter((item) => item.preferredDate === new Date().toISOString().slice(0, 10));
  return <div className="space-y-6"><h2 className="font-display text-xl font-bold text-charcoal">{schedule ? 'Weekly Schedule' : "Today's Appointments"}</h2>{loading && <LoadingSpinner label="Loading assigned appointments..." />}{error && <p className="text-sm text-red-muted">{error}</p>}{rows.length ? <div className="divide-y divide-gray-light rounded-card border border-gray-light bg-white shadow-card">{rows.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 px-4 py-4"><div><p className="font-medium text-charcoal">{item.clientName}</p><p className="text-sm text-gray-mid">{item.service} in {item.barangayName} at {item.preferredTime}</p></div><StatusBadge status={item.status}>{item.status}</StatusBadge></div>)}</div> : !loading && <EmptyState label="assigned appointments" />}</div>;
}

function TechnicianLeaveView() {
  const { user } = useAuth();
  const [form, setForm] = useState({ startDate: '', endDate: '', reason: '' });
  const [message, setMessage] = useState(null);
  const submit = async (event) => {
    event.preventDefault();
    setMessage(null);
    if (!supabase) {
      setMessage('Supabase is not configured.');
      return;
    }
    const { error } = await supabase.from('leave_requests').insert({ technician_id: user.id, start_date: form.startDate, end_date: form.endDate, reason: form.reason, status: 'pending' });
    setMessage(error ? error.message : 'Leave request submitted for processing.');
  };
  return <form onSubmit={submit} className="space-y-5 rounded-card border border-gray-light bg-white p-6 shadow-card"><h2 className="font-display text-xl font-bold text-charcoal">Leave / Unavailability</h2>{message && <p className="text-sm text-gray-mid">{message}</p>}<div className="grid gap-5 sm:grid-cols-2"><input required type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} className="rounded-btn border border-gray-light px-3 py-2.5 text-sm" /><input required type="date" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} className="rounded-btn border border-gray-light px-3 py-2.5 text-sm" /></div><textarea required rows={4} value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} className="w-full rounded-btn border border-gray-light px-3 py-2.5 text-sm" placeholder="Reason" /><Button type="submit">Submit Leave Request</Button></form>;
}

function AdminView({ mode }) {
  const { appointments, technicians, clients, loading, error } = useRoleData({ includeAllAppointments: true });
  const rows = mode === 'accounts' ? technicians : appointments;
  return <div className="space-y-6"><h2 className="font-display text-xl font-bold text-charcoal">{mode === 'accounts' ? 'Technician Accounts' : mode === 'management' ? 'Appointment Management' : 'Admin Dashboard'}</h2>{loading && <LoadingSpinner label="Loading administrative data..." />}{error && <p className="text-sm text-red-muted">{error}</p>}<div className="grid gap-4 md:grid-cols-3">{[['Appointments', appointments.length], ['Technicians', technicians.length], ['Clients', clients.length]].map(([label, value]) => <div key={label} className="rounded-card border border-gray-light bg-white p-5 shadow-card"><p className="text-sm text-gray-mid">{label}</p><p className="mt-3 text-3xl font-bold text-charcoal">{value}</p></div>)}</div>{rows.length ? <div className="overflow-hidden rounded-card border border-gray-light bg-white shadow-card"><table className="min-w-full text-left"><thead className="bg-off-white text-xs uppercase tracking-wide text-gray-mid"><tr><th className="px-4 py-3">{mode === 'accounts' ? 'Technician' : 'Reference'}</th><th className="px-4 py-3">{mode === 'accounts' ? 'Availability' : 'Service'}</th><th className="px-4 py-3">Status</th></tr></thead><tbody>{rows.map((item) => <tr key={item.id} className="border-t border-gray-light text-sm text-charcoal"><td className="px-4 py-3">{mode === 'accounts' ? item.full_name : item.reference}</td><td className="px-4 py-3">{mode === 'accounts' ? item.availability_status : item.service}</td><td className="px-4 py-3"><StatusBadge status={mode === 'accounts' ? item.account_status : item.status}>{mode === 'accounts' ? item.account_status : item.status}</StatusBadge></td></tr>)}</tbody></table></div> : !loading && <EmptyState label="records" />}</div>;
}

function PortalPage({ portal, section }) {
  const { user, loading: authLoading, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = async () => {
    const logoutRequest = logout();
    navigate('/', { replace: true });
    await logoutRequest;
  };
  if (authLoading) return <LoadingSpinner label="Loading your portal..." />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  const actualPortal = getPortalForRole(user.role);
  if (actualPortal !== portal) return <Navigate to={`/${actualPortal}/dashboard`} replace />;
  const view = portal === 'client' ? section === 'Book' ? <BookAppointment /> : section === 'Appointments' ? <BookingHistory /> : section === 'Notifications' ? <Notifications /> : section === 'Appointment Status' ? <AppointmentStatus /> : section === 'Cancel Appointment' ? <CancelAppointment /> : section === 'Feedback' ? <SubmitFeedback /> : <HomeDashboard /> : portal === 'technician' ? section === 'Schedule' ? <TechnicianView schedule /> : section === 'Leave' ? <TechnicianLeaveView /> : section === 'Notifications' ? <Notifications /> : <TechnicianView /> : section === 'Management' ? <AdminView mode="management" /> : section === 'Accounts' ? <AdminView mode="accounts" /> : <AdminView mode="dashboard" />;
  const paths = { Dashboard: 'dashboard', Book: 'book', Appointments: 'appointments', Notifications: 'notifications', Schedule: 'schedule', Leave: 'leave', Management: 'management', Accounts: 'accounts', Reports: 'reports' };
  return <ErrorBoundary><div className="min-h-screen bg-off-white text-charcoal"><div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8"><Navbar title="CityVet" subtitle="Office of the City Veterinarian" user={user} onLogout={handleLogout} onProfileUpdated={(updatedUser) => updatedUser && setUser(updatedUser)} /><div className="mt-6 grid gap-6 lg:grid-cols-[220px_1fr]"><Sidebar items={portalConfig[portal].menu} activeItem={section} icons={portal === 'client' ? clientIcons : {}} onSelect={(item) => navigate(`/${portal}/${paths[item] || 'dashboard'}`)} /><main className="min-w-0">{view}</main></div></div></div></ErrorBoundary>;
}

function PublicPage({ page }) { const navigate = useNavigate(); const go = (name) => navigate(name === 'Register' ? '/register' : name === 'Login' ? '/login' : '/client/dashboard'); if (page === 'login') return <Login onNavigate={go} />; if (page === 'register') return <Register onNavigate={go} />; return <Landing onNavigate={go} />; }

export default function AppRoutes() {
  return <Routes><Route path="/" element={<PublicPage page="landing" />} /><Route path="/login" element={<PublicPage page="login" />} /><Route path="/register" element={<PublicPage page="register" />} /><Route path="/client/dashboard" element={<PortalPage portal="client" section="Dashboard" />} /><Route path="/client/book" element={<PortalPage portal="client" section="Book" />} /><Route path="/client/book-appointment" element={<Navigate to="/client/book" replace />} /><Route path="/client/booking-page" element={<PortalPage portal="client" section="Book" />} /><Route path="/client/appointments" element={<PortalPage portal="client" section="Appointments" />} /><Route path="/client/appointments/:id" element={<PortalPage portal="client" section="Appointment Status" />} /><Route path="/client/cancel/:id" element={<PortalPage portal="client" section="Cancel Appointment" />} /><Route path="/client/feedback/:id" element={<PortalPage portal="client" section="Feedback" />} /><Route path="/client/feedback" element={<Navigate to="/client/appointments" replace />} /><Route path="/client/notifications" element={<PortalPage portal="client" section="Notifications" />} /><Route path="/technician/dashboard" element={<PortalPage portal="technician" section="Dashboard" />} /><Route path="/technician/schedule" element={<PortalPage portal="technician" section="Schedule" />} /><Route path="/technician/leave" element={<PortalPage portal="technician" section="Leave" />} /><Route path="/technician/notifications" element={<PortalPage portal="technician" section="Notifications" />} /><Route path="/admin/dashboard" element={<PortalPage portal="admin" section="Dashboard" />} /><Route path="/admin/management" element={<PortalPage portal="admin" section="Management" />} /><Route path="/admin/accounts" element={<PortalPage portal="admin" section="Accounts" />} /><Route path="/admin/reports" element={<PortalPage portal="admin" section="Reports" />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes>;
}
