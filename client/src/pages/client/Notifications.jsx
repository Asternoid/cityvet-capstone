import React, { useEffect, useState, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import API from '../../api/axios';
import { NotificationsSkeleton } from '../../components/common/Skeleton';

/**
 * Notifications — client notification center.
 *
 * Notifications are triggered server-side by every appointment status
 * transition, technician confirmation, schedule update, or service
 * reminder (Section 1.3 Objective 5, Section 1.5 Scope — Notification
 * module). This page only renders what the authenticated /notifications
 * endpoint returns for the current client — it never fabricates or caches
 * notifications locally, so a stale or tampered local list can't diverge
 * from what actually happened to the client's appointments.
 */

const BORDER_COLORS = {
  success: 'border-l-[6px] border-[#4ADE80]',
  warning: 'border-l-[6px] border-[#FBBF24]',
  info: 'border-l-[6px] border-[#60A5FA]',
  error: 'border-l-[6px] border-[#F87171]',
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [marking, setMarking] = useState(false);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/notifications');
      setNotifications(Array.isArray(res.data?.notifications) ? res.data.notifications : []);
    } catch (err) {
      setError('Could not load your notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markAllRead = async () => {
    if (marking) return;
    setMarking(true);
    const previous = notifications;
    // Optimistic update, rolled back on failure — the server remains the
    // source of truth for read state.
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await API.post('/notifications/mark-all-read');
    } catch (err) {
      setNotifications(previous);
      setError('Could not mark notifications as read. Please try again.');
    } finally {
      setMarking(false);
    }
  };

  const markRead = async (notificationId) => {
    const previous = notifications;
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)));
    try {
      await API.post(`/notifications/${encodeURIComponent(notificationId)}/read`);
    } catch (err) {
      setNotifications(previous);
    }
  };

  const unread = notifications.filter((n) => !n.read);
  const earlier = notifications.filter((n) => n.read);

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#0B3A36]">Notifications</h1>
        {unread.length > 0 && (
          <button
            onClick={markAllRead}
            disabled={marking}
            className="text-sm font-semibold text-[#13534D] hover:underline disabled:opacity-50"
          >
            Mark all as read
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          <button onClick={loadNotifications} className="ml-auto font-semibold underline">
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <NotificationsSkeleton />
      ) : notifications.length === 0 ? (
        <div className="rounded-xl bg-white p-10 text-center text-gray-500 shadow-sm">No notifications yet.</div>
      ) : (
        <>
          {unread.length > 0 && (
            <section className="mb-6">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500">Unread</p>
              <div className="space-y-3">
                {unread.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => markRead(item.id)}
                    className={`flex w-full flex-col rounded-lg bg-white p-5 text-left shadow-sm transition hover:shadow-md ${
                      BORDER_COLORS[item.type] || 'border-l-[6px] border-gray-200'
                    }`}
                  >
                    <p className="text-base text-[#0B3A36]">
                      <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#13534D]" />
                      {item.message}
                    </p>
                    <span className="mt-2 text-sm text-gray-500">{item.time_ago}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {earlier.length > 0 && (
            <section>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-500">Earlier</p>
              <div className="space-y-3">
                {earlier.map((item) => (
                  <div
                    key={item.id}
                    className={`flex flex-col rounded-lg bg-white p-5 opacity-70 shadow-sm ${
                      BORDER_COLORS[item.type] || 'border-l-[6px] border-gray-200'
                    }`}
                  >
                    <p className="text-base text-gray-700">{item.message}</p>
                    <span className="mt-2 text-sm text-gray-500">{item.time_ago}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}