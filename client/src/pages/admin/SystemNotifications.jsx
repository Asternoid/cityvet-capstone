import React, { useState } from 'react';
import { 
  Bell, 
  UserCheck, 
  Plus, 
  Inbox, 
  X
} from 'lucide-react';
import AdminLayout from '../../components/common/AdminLayout';
import useAdminData from '../../hooks/useAdminData';
import API from '../../api/axios';

export default function SystemNotifications() {
  const [showComposeForm, setShowComposeForm] = useState(false);
  const [sendTo, setSendTo] = useState('All Users');
  const [form, setForm] = useState({ title: '', message: '' });

  const { data: notificationsData, loading, error, reload } = useAdminData('/admin/notifications');
  const notifications = Array.isArray(notificationsData) ? notificationsData : [];

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
    <AdminLayout pageTitle="System Notifications">
      <div className="p-4 sm:p-6 lg:p-8">
          
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
    </AdminLayout>
  );
}