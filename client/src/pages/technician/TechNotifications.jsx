import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  Calendar, 
  CalendarDays, 
  Bell, 
  Clock, 
  LogOut, 
  RefreshCw,
  PawPrint
} from 'lucide-react';

/**
 * ============================================================
 * COMPONENT: Sidebar
 * PURPOSE: Navigation menu. Matches the 'Notifications' active state.
 * ============================================================
 */
const Sidebar = ({ activeTab, setActiveTab, unreadCount }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const displayName = user?.full_name || user?.fullName || user?.email || 'Technician';
  const menuItems = [
    { id: 'Dashboard', icon: CalendarDays, label: 'Dashboard' },
    { id: 'Appointments', icon: Calendar, label: 'Appointments' },
    { id: 'Schedule', icon: CalendarDays, label: 'Weekly Schedule' },
    { id: 'Notifications', icon: Bell, label: 'Notifications', badge: 2 },
    { id: 'Leave', icon: Clock, label: 'Leave / Unavailability' },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col justify-between fixed left-0 top-0 z-20">
      <div>
        {/* Logo Section */}
        <div className="p-6 pb-8">
          <div className="flex items-center gap-3">
            <div className="bg-[#1C5B56] p-2 rounded-xl text-white">
              <PawPrint size={24} />
            </div>
            <div>
              <h1 className="font-bold text-[#1C5B56] text-lg leading-tight">City Vet</h1>
              <p className="text-[10px] text-gray-400 font-medium tracking-wide">Technician Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="px-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4 px-3">Navigation</p>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); navigate(`/technician/${item.id === 'Dashboard' ? 'dashboard' : item.id === 'Appointments' ? 'appointments' : item.id === 'Schedule' ? 'schedule' : item.id === 'Notifications' ? 'notifications' : 'leave'}`); }}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === item.id 
                    ? 'bg-[#E9F6F4] text-[#1C5B56] font-medium' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-[#1C5B56]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} />
                  <span className="text-sm">{item.label}</span>
                </div>
                {item.badge && unreadCount > 0 && (
                  <span className="bg-[#D99B4D] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-[#1C5B56] text-white flex items-center justify-center font-bold text-sm">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-sm font-bold text-gray-700">{displayName}</span>
            <span className="text-[11px] text-gray-500">Veterinary Technician</span>
          </div>
        </div>
        <button onClick={async () => { await logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-2 py-2 text-gray-500 hover:text-[#1C5B56] transition-colors text-sm">
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
};

/**
 * ============================================================
 * COMPONENT: Skeleton Loader
 * PURPOSE: Displays a pulsing layout while waiting for the API.
 * ============================================================
 */
const NotificationsSkeleton = () => {
  return (
    <div className="animate-pulse p-8">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/6 mb-10"></div>

      {/* Unread Skeleton */}
      <div className="h-4 bg-gray-200 rounded w-16 mb-4"></div>
      <div className="space-y-4 mb-10">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex gap-4">
            <div className="w-10 h-10 bg-gray-100 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-100 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Earlier Skeleton */}
      <div className="h-4 bg-gray-200 rounded w-16 mb-4"></div>
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex gap-4">
            <div className="w-10 h-10 bg-gray-100 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-100 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * ============================================================
 * HELPER: Notification Icon Styling
 * ============================================================
 */
const getIconStyle = (type) => {
  switch (type) {
    case 'schedule': return { bg: 'bg-[#E9F6F4]', color: 'text-[#1C5B56]', Icon: Clock };
    case 'assignment': return { bg: 'bg-[#F5F6FA]', color: 'text-[#5B8DEF]', Icon: Calendar };
    case 'reassignment': return { bg: 'bg-[#FFF8EB]', color: 'text-[#D99B4D]', Icon: RefreshCw };
    default: return { bg: 'bg-[#F5F6FA]', color: 'text-gray-400', Icon: Bell };
  }
};

/**
 * ============================================================
 * MAIN COMPONENT: NotificationsView
 * ============================================================
 */
function NotificationsView() {
  const [activeTab, setActiveTab] = useState('Notifications');
  const { notifications, unreadCount, loading, markAsRead } = useNotifications();
  const unreadNotifications = notifications.filter((notification) => !notification.read);
  const earlierNotifications = notifications.filter((notification) => notification.read);
  const formatDate = (value) => value
    ? new Date(value).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })
    : '';

  /*
   * ============================================================
   * PROFESSIONAL IMPLEMENTATION NOTE: ROUTING & DATA
   * ============================================================
   * 
   * 1. Routing:
   *    - In a real app, this entire component should be its own file.
   *    - In your main App.jsx, you would set this up like:
   *      <Route path="/notifications" element={<NotificationsView />} />
   *    - Inside the Sidebar component, use `<Link to="/notifications">` 
   *      instead of `onClick` handlers.
   * 
   * 2. Data Flow:
   *    - The `notifications` arrays are intentionally set to empty `[]` 
   *      to prevent any existing data. 
   *    - Replace the comment inside useEffect with your actual API call.
   *    - Example: 
   *      fetch('/api/notifications')
   *        .then(res => res.json())
   *        .then(data => {
   *           setUnreadNotifications(data.unread);
   *           setEarlierNotifications(data.earlier);
   *        })
   * ============================================================
   */

  return (
    <div className="min-h-screen bg-[#F5F7F6] font-sans flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} unreadCount={unreadCount} />

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        {loading ? (
          <NotificationsSkeleton />
        ) : (
          <div className="max-w-4xl mx-auto">
            
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
              <p className="text-gray-400 text-sm mt-1">
                {unreadNotifications.length > 0 
                  ? `${unreadNotifications.length} unread` 
                  : '0 unread'}
              </p>
            </div>

            {/* Unread Notifications Section */}
            <div className="mb-8">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Unread</h2>
              
              {unreadNotifications.length === 0 ? (
                // Professional Empty State for Unread
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
                  <p className="text-gray-400 text-sm">No unread notifications. You are all caught up!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {unreadNotifications.map((notif) => {
                    const { bg, color, Icon } = getIconStyle(notif.type);
                    return (
                      <div key={notif.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center group hover:border-gray-200 transition-colors">
                        <div className="flex gap-4">
                          <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center ${color}`}>
                            <Icon size={18} />
                          </div>
                          <div>
                            <p className="text-gray-800 font-medium leading-snug">
                              {notif.title ? `${notif.title}: ` : ''}{notif.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">{formatDate(notif.created_at)}</p>
                          </div>
                        </div>
                        <button type="button" onClick={() => markAsRead(notif.id)} className="w-2.5 h-2.5 rounded-full bg-[#1C5B56]" aria-label="Mark notification as read" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Earlier Notifications Section */}
            <div>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Earlier</h2>
              
              {earlierNotifications.length === 0 ? (
                // Professional Empty State for Earlier
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
                  <p className="text-gray-400 text-sm">No older notifications to show.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {earlierNotifications.map((notif) => {
                    const { bg, color, Icon } = getIconStyle(notif.type);
                    return (
                      <div key={notif.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex gap-4 group hover:border-gray-200 transition-colors">
                        <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center ${color}`}>
                          <Icon size={18} />
                        </div>
                        <div>
                          <p className="text-gray-600 font-medium leading-snug">
                            {notif.title ? `${notif.title}: ` : ''}{notif.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">{formatDate(notif.created_at)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationsView;