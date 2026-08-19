import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import API from '../api/axios';
import useRealtime from '../hooks/useRealtime';
import { supabase } from '../lib/supabaseClient';

export const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchNotifications = useCallback(async () => {
    if (!supabase) {
      setNotifications([
        { id: 'demo-1', title: 'Booking confirmed', message: 'Your appointment was confirmed by the clinic.', read: false },
        { id: 'demo-2', title: 'Status update', message: 'The technician is en route to your appointment.', read: true },
      ]);
      setUnreadCount(1);
      return;
    }

    try {
      setLoading(true);
      const response = await API.get('/notifications');
      const list = response.data?.notifications || response.data?.data || [];
      setNotifications(list);
      setUnreadCount(list.filter((item) => !item.read).length);
    } catch (error) {
      console.warn('Unable to load notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useRealtime({
    table: 'notifications',
    enabled: !!supabase,
    onChange: () => fetchNotifications(),
  });

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToast({ id, message, type });
    window.setTimeout(() => setToast((current) => (current?.id === id ? null : current)), 3000);
  }, []);

  const markAsRead = useCallback(async (id) => {
    try {
      setNotifications((current) =>
        current.map((item) => (item.id === id ? { ...item, read: true } : item))
      );
      setUnreadCount((current) => Math.max(0, current - 1));
      await API.post(`/notifications/${id}/read`);
    } catch (error) {
      console.warn('Unable to mark notification as read:', error);
      showToast('Unable to update notification status.', 'error');
    }
  }, [showToast]);

  const clearAll = useCallback(async () => {
    try {
      setNotifications([]);
      setUnreadCount(0);
      await API.post('/notifications/mark-all-read');
    } catch (error) {
      console.warn('Unable to clear notifications:', error);
      showToast('Unable to clear notifications.', 'error');
    }
  }, [showToast]);

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    loading,
    markAsRead,
    clearAll,
    fetchNotifications,
    showToast,
  }), [notifications, unreadCount, loading, markAsRead, clearAll, fetchNotifications, showToast]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm rounded-card border border-gray-light bg-white p-3 shadow-card">
          <p className="text-sm font-medium text-charcoal">{toast.message}</p>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};