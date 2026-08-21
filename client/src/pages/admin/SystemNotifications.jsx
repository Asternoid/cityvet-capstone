import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  UserCheck, 
  Plus, 
  Inbox, 
  Menu,
  X,
  LayoutDashboard,
  CalendarCheck,
  Users,
  UserCog,
  FileText,
  BarChart3,
  LogOut,
  Calendar
} from 'lucide-react';
import useAdminData from '../../hooks/useAdminData';
import API from '../../api/axios';

// RBAC Simulation
const CURRENT_USER = {
  name: 'Administrator',
  email: 'admin@cityvet.gov.ph',
  role: 'admin'
};

export default function SystemNotifications() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showComposeForm, setShowComposeForm] = useState(false);
  const [sendTo, setSendTo] = useState('All Users');
  const [form, setForm] = useState({ title: '', message: '' });
  
  // Close sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { data: notificationsData, loading, error, reload } = useAdminData('/admin/notifications');
  const notifications = Array.isArray(notificationsData) ? notificationsData : [];

  // Navigation Menu Structure
  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, current: false },
    { name: 'Appointments', href: '/admin/appointments', icon: CalendarCheck, current: false },
    { name: 'Technicians', href: '/admin/technicians', icon: UserCog, current: false },
    { name: 'Clients', href: '/admin/clients', icon: Users, current: false },
    { name: 'Blackout Dates', href: '/admin/blackout-dates', icon: Calendar, current: false },
    { name: 'Notifications', href: '/admin/notifications', icon: Bell, current: true },
    { name: 'Reports', href: '/admin/reports', icon: FileText, current: false },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, current: false },
  ];

  // Recipient options for dropdown
  const recipientOptions = ['All Users', 'All Clients', 'Verified Clients', 'All Technicians'];
  
  const sendNotification = async () => {
    const audience = sendTo === 'All Clients' || sendTo === 'Verified Clients' ? 'clients' : 
                     sendTo === 'All Technicians' ? 'technicians' : 'all';
    await API.post('/admin/notifications/broadcast', { ...form, audience });
    setForm({ title: '', message: '' });
    setShowComposeForm(false);
    reload();
  };

  // Skeleton Components
  const SkeletonComposeForm = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8 max-w-4xl">
      <div className="skeleton h-6 w-48 mb-5" />
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2">
            <div className="skeleton h-4 w-28 mb-1.5" />
            <div className="skeleton h-10 w-full rounded-lg" />
          </div>
          <div>
            <div className="skeleton h-4 w-16 mb-1.5" />
            <div className="skeleton h-10 w-full rounded-lg" />
          </div>
        </div>
        <div>
          <div className="skeleton h-4 w-24 mb-1.5" />
          <div className="skeleton h-24 w-full rounded-lg" />
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <div className="skeleton h-10 w-20 rounded-lg" />
          <div className="skeleton h-10 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );

  const SkeletonNotificationCard = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-start justify-between mb-2">
        <div className="skeleton h-5 w-48" />
        <div className="skeleton h-5 w-12 rounded-md" />
      </div>
      <div className="flex items-center gap-2 mb-3">
        <div className="skeleton h-3 w-32" />
        <div className="skeleton h-3 w-4" />
        <div className="skeleton h-3 w-16" />
      </div>
      <div className="space-y-2">
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-3/4" />
      </div>
    </div>
  );

  const SkeletonEmptyState = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
      <div className="skeleton h-20 w-20 rounded-full mb-5" />
      <div className="skeleton h-6 w-48 mb-2" />
      <div className="skeleton h-4 w-64" />
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 text-slate-700 font-sans overflow-hidden">
      
      {/* === OVERLAY MOBILE === */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-20 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* === SIDEBAR === */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-emerald-900 text-slate-200 flex flex-col transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-emerald-800/50 gap-3 flex-shrink-0">
          <div className="bg-amber-500 h-8 w-8 rounded-lg flex items-center justify-center text-emerald-900 font-bold shadow-sm">
            CV
          </div>
          <div>
            <h1 className="font-bold text-white tracking-tight text-lg">CityVet</h1>
            <p className="text-[10px] text-emerald-300/70 uppercase tracking-wider">Veterinary Services</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`
                flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${item.current 
                  ? 'bg-emerald-800/60 text-white shadow-sm' 
                  : 'text-emerald-200/70 hover:bg-emerald-800/40 hover:text-white'
                }
              `}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer (User Profile) */}
        <div className="p-4 border-t border-emerald-800/50 flex-shrink-0">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
              {CURRENT_USER.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{CURRENT_USER.name}</p>
              <p className="text-xs text-emerald-300/60 truncate">{CURRENT_USER.role}</p>
            </div>
            <button className="text-emerald-300/50 hover:text-white transition-colors flex-shrink-0">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* === MAIN CONTENT AREA === */}
      <main className="flex-1 flex flex-col min-h-screen lg:min-h-0 lg:h-screen overflow-hidden relative">
        
        {/* Top Header */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-slate-500 hover:text-slate-700 transition-colors p-1 flex-shrink-0"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 tracking-tight truncate">System Notifications</h2>
              <p className="text-xs text-slate-500 hidden sm:block truncate">Send and manage system-wide notifications to clients and technicians</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <button 
              onClick={() => setShowComposeForm(true)}
              className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 bg-emerald-700 text-white text-sm font-medium rounded-lg hover:bg-emerald-800 transition-colors shadow-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              <span className="hidden xs:inline">Compose Notification</span>
              <span className="xs:hidden">Compose</span>
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-lg transition-colors relative flex-shrink-0">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

          {/* --- SKELETON LOADING STATE --- */}
          {loading ? (
            <>
              {/* Compose Form Skeleton (if visible) */}
              {showComposeForm && <SkeletonComposeForm />}

              {/* Notification History Skeleton */}
              <div className="max-w-4xl">
                <div className="skeleton h-4 w-40 mb-4 px-1" />
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <SkeletonNotificationCard key={i} />
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* --- ACTUAL CONTENT --- */
            <>
              {/* --- COMPOSE NOTIFICATION FORM --- */}
              {showComposeForm && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-8 max-w-4xl skeleton-fade-in">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-emerald-900">New System Notification</h3>
                    <button 
                      onClick={() => setShowComposeForm(false)}
                      className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-5">
                    {/* Title & Recipient Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Notification Title</label>
                        <input 
                          type="text" 
                          placeholder="e.g. System Maintenance Notice"
                          value={form.title}
                          onChange={(event) => setForm({ ...form, title: event.target.value })}
                          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Send To</label>
                        <div className="relative">
                          <select 
                            value={sendTo}
                            onChange={(e) => setSendTo(e.target.value)}
                            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all bg-white appearance-none"
                          >
                            {recipientOptions.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Message Body */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Message Body</label>
                      <textarea 
                        rows="4"
                        value={form.message}
                        onChange={(event) => setForm({ ...form, message: event.target.value })}
                        placeholder="Write your notification message..." 
                        className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all bg-white resize-y"
                      ></textarea>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button 
                        onClick={() => setShowComposeForm(false)}
                        className="px-5 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={sendNotification} 
                        disabled={!form.title.trim() || !form.message.trim()} 
                        className="px-5 py-2 bg-emerald-700 text-white text-sm font-medium rounded-lg hover:bg-emerald-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Send Notification
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* --- NOTIFICATION HISTORY AREA --- */}
              <div className="max-w-4xl skeleton-fade-in">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 px-1">Notification History</h3>
                
                {notifications.length ? (
                  <div className="space-y-4">
                    {notifications.map((note) => (
                      <div key={note.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-slate-800">{note.title}</h4>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Sent
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                          <span>{new Date(note.created_at).toLocaleString()}</span>
                          <span>→</span>
                          <span>{note.recipient_id ? 'User' : note.audience || 'All Users'}</span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">{note.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-5 text-slate-300">
                      <Inbox className="w-10 h-10" />
                    </div>
                    <h4 className="text-lg font-semibold text-slate-700">No notifications sent</h4>
                    <p className="text-sm text-slate-400 max-w-sm mt-1">
                      Your broadcast history to clients and technicians will appear here once you compose and send your first notification.
                    </p>
                    <button 
                      onClick={() => setShowComposeForm(true)}
                      className="mt-6 px-5 py-2 bg-emerald-700 text-white text-sm font-medium rounded-lg hover:bg-emerald-800 transition-colors shadow-sm"
                    >
                      Compose Your First Notification
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </main>

      {/* Add global styles for skeleton loading */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .skeleton {
          background: #e2e8f0;
          background: linear-gradient(
            90deg,
            #e2e8f0 0%,
            #f1f5f9 40%,
            #e2e8f0 80%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s ease-in-out infinite;
          border-radius: 0.25rem;
          min-height: 0.75rem;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .skeleton-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }

        /* Responsive skeleton adjustments */
        @media (max-width: 640px) {
          .skeleton {
            min-height: 0.625rem;
          }
        }
      `}</style>
    </div>
  );
}