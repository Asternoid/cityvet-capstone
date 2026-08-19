import React from 'react';
import { useNotifications } from '../../context/NotificationContext';

export default function Notifications() {
  const { notifications, markAsRead } = useNotifications();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-mid">Inbox</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-charcoal">Notifications</h1>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="rounded-card border border-gray-light bg-white p-5 shadow-card text-sm text-gray-mid">
            You have no notifications.
          </div>
        ) : (
          notifications.map((item) => (
            <div key={item.id} className={`rounded-card border p-4 shadow-card ${item.read ? 'border-gray-light bg-white' : 'border-teal-deep/20 bg-green-light/30'}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-charcoal">{item.title || 'Appointment update'}</p>
                  <p className="mt-1 text-sm text-gray-mid">{item.message || item.detail || 'New activity'}</p>
                </div>
                {!item.read && (
                  <button type="button" onClick={() => markAsRead(item.id)} className="text-xs font-medium text-teal-deep hover:text-teal-mid">
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
