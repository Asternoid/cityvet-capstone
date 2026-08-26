import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import { 
  Home, 
  Calendar, 
  CalendarDays, 
  Bell, 
  Clock, 
  LogOut, 
  MapPin, 
  ChevronRight,
  PawPrint,
  CalendarClock
} from 'lucide-react';

/**
 * ============================================================
 * COMPONENT: Status Badge
 * PURPOSE: Renders the dynamic status tag for appointments
 * ============================================================
 */
const StatusBadge = ({ status }) => {
  // Determine styling based on status
  let classes = "px-3 py-1 rounded border text-xs font-medium ";
  
  switch (status) {
    case 'Pending Confirmation':
      classes += "border-[#D99B4D] text-[#D99B4D] bg-transparent";
      break;
    case 'Technician Confirmed':
      classes += "border-[#5BC2C1] text-[#5BC2C1] bg-transparent";
      break;
    case 'In Progress':
      classes += "border-[#5B8DEF] text-[#5B8DEF] bg-transparent";
      break;
    case 'Completed':
      classes += "border-[#48BB78] text-[#48BB78] bg-transparent";
      break;
    case 'No-Show':
      classes += "border-[#FC8181] text-[#FC8181] bg-transparent";
      break;
    default:
      classes += "border-gray-300 text-gray-500";
  }

  return <span className={classes}>{status}</span>;
};

const STATUS_LABELS = {
  pending_technician_confirmation: 'Pending Confirmation',
  technician_confirmed: 'Technician Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
  no_show: 'No-Show',
};

/**
 * ============================================================
 * COMPONENT: Sidebar
 * PURPOSE: Navigation menu, profile, and logout
 * ============================================================
 */
const Sidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const displayName = user?.full_name || user?.fullName || user?.email || 'Technician';
  const menuItems = [
    { id: 'Dashboard', icon: Home, label: 'Dashboard' },
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
                {item.badge && (
                  <span className="bg-[#D99B4D] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
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
 * PURPOSE: Displays an empty, gray, pulsing box layout to 
 *          simulate loading state before data arrives.
 * ============================================================
 */
const SkeletonLoader = () => {
  return (
    <div className="animate-pulse">
      {/* Header Skeleton */}
      <div className="p-8 bg-[#1C5B56]">
        <div className="h-6 bg-[#2d7a74] rounded w-1/4 mb-2"></div>
        <div className="h-8 bg-[#2d7a74] rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-[#2d7a74] rounded w-1/6"></div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-4 gap-4 p-8 pb-0">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center">
            <div className="h-6 bg-gray-200 rounded w-8 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-12"></div>
          </div>
        ))}
      </div>

      {/* List Skeleton */}
      <div className="p-8">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 mb-4 shadow-sm flex justify-between">
            <div className="space-y-2 w-3/4">
              <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-100 rounded w-1/2"></div>
              <div className="flex gap-4 mt-2">
                <div className="h-3 bg-gray-100 rounded w-16"></div>
                <div className="h-3 bg-gray-100 rounded w-16"></div>
              </div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-24"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * ============================================================
 * MAIN COMPONENT: App
 * ============================================================
 */
function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  // NO PRE-BUILT DATA. Initialized as empty array.
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState([]);
  const [error, setError] = useState(null);

  /*
   * ============================================================
   * PROFESSIONAL IMPLEMENTATION NOTE: ROUTING & ARCHITECTURE
   * ============================================================
   * 1. Do NOT keep the 'activeTab' state for a real production app.
   * 2. Install React Router: `npm install react-router-dom`
   * 3. In main.jsx, wrap <App /> with <BrowserRouter>.
   * 4. In Sidebar.jsx: Replace <button onClick> with:
   *    import { Link } from 'react-router-dom';
   *    <Link to={item.id === 'Dashboard' ? '/' : `/app/${item.id.toLowerCase()}`} />
   * 5. In App.jsx: Replace the `activeTab === 'Dashboard'` check with:
   *    import { Routes, Route, Outlet } from 'react-router-dom';
   *    return (
   *      <div className="...flex">
   *         <Sidebar />
   *         <div className="ml-64">
   *             <Routes>
   *                <Route path="/" element={<DashboardComponent />} />
   *                <Route path="/app/appointments" element={<AppointmentsComponent />} />
   *             </Routes>
   *         </div>
   *      </div>
   *    )
   * 6. Separate the Dashboard code into its own file `Dashboard.jsx`.
   * ============================================================
   */

  /*
   * ============================================================
   * DATA FETCHING SIMULATION
   * ============================================================
   * This useEffect acts as a real API call. 
   * Since we removed all existing data:
   * - `loading` will be true for 1.8 seconds (Skeleton shows).
   * - `loading` will turn false.
   * - `appointments` remains empty `[]`.
   * - The UI will automatically show a clean "No Appointments" message.
   * ============================================================
   */
  useEffect(() => {
    let active = true;
    const loadQueue = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await API.get('/technicians/queue/today');
        const queue = Array.isArray(response.data?.data) ? response.data.data : [];
        if (!active) return;
        setAppointments(queue.map((appointment) => ({
          id: appointment.id,
          name: appointment.client_profiles?.full_name || 'Client',
          service: appointment.services?.name || 'Veterinary service',
          location: appointment.barangays?.name || 'Assigned barangay',
          time: appointment.preferred_time,
          status: STATUS_LABELS[appointment.status] || appointment.status,
          borderColor: appointment.urgency_flag ? 'border-l-[#D99B4D]' : 'border-l-[#5BC2C1]',
        })));
        setStats([
          { label: 'Pending', count: queue.filter((item) => item.status === 'pending_technician_confirmation').length },
          { label: 'Confirmed', count: queue.filter((item) => item.status === 'technician_confirmed').length },
          { label: 'In Progress', count: queue.filter((item) => item.status === 'in_progress').length },
          { label: 'Done', count: queue.filter((item) => item.status === 'completed').length },
        ]);
      } catch (loadError) {
        if (active) setError('Unable to load today\'s appointments. Please try again.');
      } finally {
        if (active) setLoading(false);
      }
    };
    if (user?.id) loadQueue();
    return () => { active = false; };
  }, [user?.id]);

  return (
    // Main Layout Container
    <div className="min-h-screen bg-[#F5F7F6] font-sans">
      
      {/* Sidebar Component */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area (Offset by sidebar width) */}
      <div className="ml-64 flex-1">
        
        {/* 
           NOTE: In a real routed app, the following logic would 
           be inside <DashboardComponent />, and the <div> block
           below would be replaced by <Outlet />.
        */}
        {activeTab === 'Dashboard' && (
          <div className="flex flex-col min-h-screen">
            
            {/* Conditional Rendering: Skeleton vs Actual Data */}
            {loading ? (
              <SkeletonLoader />
            ) : (
              <>
                {/* --- GREEN HEADER SECTION --- */}
                <header className="bg-[#1C5B56] px-8 py-8 pb-10 text-white relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[#9BC8C4] text-sm font-medium mb-1">Welcome back,</p>
                      <h1 className="text-3xl font-bold tracking-tight">{user?.full_name || user?.fullName || user?.email || 'Technician'}</h1>
                      <p className="text-[#9BC8C4] text-sm mt-1">{new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-[#2d7a74] flex items-center justify-center font-bold text-white">
                      {(user?.full_name || user?.fullName || user?.email || 'Technician').slice(0, 2).toUpperCase()}
                    </div>
                  </div>

                  {/* Stats Cards Row */}
                  <div className="grid grid-cols-4 gap-4 mt-8">
                    {stats.map((stat, index) => (
                      <div 
                        key={stat.label} 
                        className={`h-20 rounded-xl flex flex-col justify-center items-center relative ${
                          index === 0 
                            ? 'bg-[#3E6F5B]' 
                            : index === 3 
                              ? 'bg-[#2A6D51]' 
                              : 'bg-[#2d7a74]' 
                        }`}
                      >
                        <span className="text-2xl font-bold mb-0.5">{stat.count}</span>
                        <span className={`text-[11px] font-medium ${index === 0 ? 'text-[#F4D03F]' : 'text-[#a3d3d0]'}`}>
                          {stat.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </header>

                {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

                {/* --- APPOINTMENTS BODY SECTION --- */}
                <main className="p-8 flex-1">
                  <div className="bg-white rounded-t-2xl shadow-sm p-6 -mt-2 relative z-10 min-h-[600px]">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-lg font-bold text-gray-700">Today's Appointments</h2>
                      <span className="text-sm text-gray-400">{appointments.length} total</span>
                    </div>

                    {/* Appointments List - No Data State */}
                    {appointments.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <div className="bg-gray-100 p-4 rounded-full mb-4">
                          <CalendarClock size={48} className="text-gray-300" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-600 mb-1">No Appointments Today</h3>
                        <p className="text-sm">Your schedule is currently empty. Check back later.</p>
                      </div>
                    ) : (
                      /* The list would render here if you inserted data */
                      <div className="space-y-4">
                        {appointments.map((appt) => (
                          <div 
                            key={appt.id} 
                            className={`flex items-center justify-between bg-white p-5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border-l-4 ${appt.borderColor.replace('border-l-', 'border-l-')} border-b border-gray-50 hover:shadow-md transition-shadow cursor-pointer group`}
                          >
                            <div className="flex flex-col">
                              <h3 className="font-bold text-gray-800 text-base">{appt.name}</h3>
                              <p className="text-gray-500 text-sm">{appt.service}</p>
                              <div className="flex items-center gap-5 mt-2 text-xs text-gray-400">
                                <div className="flex items-center gap-1.5">
                                  <MapPin size={14} />
                                  <span>{appt.location}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Clock size={14} />
                                  <span>{appt.time}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <StatusBadge status={appt.status} />
                              <ChevronRight size={18} className="text-gray-300 group-hover:text-[#1C5B56] transition-colors" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Coverage Area Section */}
                    <div className="mt-8 bg-[#EBEDEC] rounded-xl p-4">
                      <p className="text-sm font-bold text-gray-700 mb-2">Assigned Coverage Area</p>
                      <div className="flex flex-wrap gap-2">
                        {['Brgy. Puntod', 'Brgy. Kinabranan', 'Brgy. Agay-ayan'].map((area) => (
                          <span key={area} className="bg-white px-3 py-1.5 rounded-full border border-gray-200 text-xs text-gray-600 font-medium">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </main>
              </>
            )}
          </div>
        )}
        
        {/* Fallback for inactive dashboard tabs */}
        {activeTab !== 'Dashboard' && (
          <div className="flex items-center justify-center h-screen text-gray-400">
            <p className="text-xl font-light">Page under construction for: <span className="font-bold text-[#1C5B56]">{activeTab}</span></p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;