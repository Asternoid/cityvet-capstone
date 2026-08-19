import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export default function NotificationBell() {
  const { notifications = [], unreadCount = 0, markAsRead } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-light bg-white text-charcoal transition hover:bg-off-white"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-muted px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-20 w-80 rounded-card border border-gray-light bg-white p-2 shadow-card">
          <div className="mb-2 flex items-center justify-between px-2 pb-2 pt-1">
            <h3 className="text-sm font-semibold text-charcoal">Notifications</h3>
            <span className="text-xs text-gray-mid">{unreadCount} unread</span>
          </div>

          <div className="max-h-72 space-y-2 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-2 py-4 text-sm text-gray-mid">No notifications yet.</p>
            ) : (
              notifications.slice(0, 6).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => markAsRead(item.id)}
                  className={`w-full rounded-btn border px-3 py-2 text-left ${item.read ? 'border-gray-light bg-off-white' : 'border-teal-deep/20 bg-green-light/40'}`}
                >
                  <p className="text-sm font-medium text-charcoal">{item.title || 'System update'}</p>
                  <p className="mt-1 text-xs text-gray-mid">{item.message || item.detail || 'New activity'}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}