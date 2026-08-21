import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Calendar, 
  CalendarDays, 
  Bell, 
  Clock, 
  LogOut, 
  MapPin, 
  ChevronRight,
  PawPrint,
  Filter,
  ChevronDown
} from 'lucide-react';

/**
 * ============================================================
 * COMPONENT: Status Badge
 * PURPOSE: Renders the dynamic status tag for appointments
 * ============================================================
 */
const StatusBadge = ({ status }) => {
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

/**
 * ============================================================
 * COMPONENT: Sidebar
 * PURPOSE: Navigation menu. 
 * NOTE: Matches the 'Appointments' active state from the image.
 * ============================================================
 */
const Sidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
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
            JD
          </div>
          <div className="flex flex-col text-left">
            <span className="text-sm font-bold text-gray-700">Juan dela Cruz</span>
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
 * COMPONENT: Skeleton Loader (Appointments View)
 * PURPOSE: Pulses while waiting for data to load from the API.
 * ============================================================
 */
const AppointmentsSkeleton = () => {
  return (
    <div className="animate-pulse p-8">
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/6"></div>
      </div>
      
      {/* Filter Chips Skeleton */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
        <div className="h-8 w-12 bg-gray-200 rounded-full"></div>
        <div className="h-8 w-20 bg-gray-100 rounded-full"></div>
        <div className="h-8 w-20 bg-gray-100 rounded-full"></div>
        <div className="h-8 w-20 bg-gray-100 rounded-full"></div>
      </div>

      {/* Dropdown Skeleton */}
      <div className="flex gap-4 mb-8">
        <div className="h-10 bg-gray-200 rounded-lg w-1/3"></div>
        <div className="h-10 bg-gray-200 rounded-lg w-1/4"></div>
      </div>

      {/* List Items Skeleton */}
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex justify-between">
            <div className="space-y-3 w-3/4">
              <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-100 rounded w-1/2"></div>
              <div className="flex gap-4 mt-2">
                <div className="h-3 bg-gray-100 rounded w-16"></div>
                <div className="h-3 bg-gray-100 rounded w-16"></div>
              </div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * ============================================================
 * MAIN COMPONENT: AppointmentsView
 * ============================================================
 */
function AppointmentsView() {
  const [activeTab, setActiveTab] = useState('Appointments');
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);

  // Filter states based on image UI
  const [selectedFilter, setSelectedFilter] = useState('All');

  /*
   * ============================================================
   * PROFESSIONAL IMPLEMENTATION NOTE: ROUTING & ARCHITECTURE
   * ============================================================
   * 
   * This component is currently standalone. To integrate it into your 
   * main dashboard and use React Router:
   * 
   * 1. In your main `App.jsx`:
   *    - Remove `useState` for active tabs.
   *    - Import this component: `import AppointmentsView from './AppointmentsView';`
   *    - Setup Routes:
   *      import { Routes, Route } from 'react-router-dom';
   *      // In your render method...
   *      <div className="flex">
   *        <Sidebar /> 
   *        <div className="ml-64 flex-1">
   *          <Routes>
   *             <Route path="/" element={<Dashboard />} />
   *             <Route path="/appointments" element={<AppointmentsView />} />
   *          </Routes>
   *        </div>
   *      </div>
   * 
   * 2. In the Sidebar component (imported above):
   *    - Replace the `onClick={() => setActiveTab(...)}` with:
   *      import { Link } from 'react-router-dom';
   *      <Link to="/appointments" className="...">...</Link>
   * 
   * 3. Data fetching:
   *    - Move the fetch logic inside `useEffect` to a separate `api.js` file.
   *    - Call `fetchAppointments()` from that file here.
   * ============================================================
   */

  // Mock Data Fetch with NO Pre-Built Data (Starts empty)
  useEffect(() => {
    const timer = setTimeout(() => {
      
      // IN A REAL APP: Replace this block with fetch('api/appointments').then(...)
      // For demonstration, we load an empty array to keep it professional and blank.
      setAppointments([]); 
      setLoading(false);

    }, 1800); // Shows skeleton for 1.8 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F7F6] font-sans flex">
      
      {/* Sidebar - Passed activeTab to match visual */ }
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="ml-64 flex-1 min-h-screen">
        {loading ? (
          <AppointmentsSkeleton />
        ) : (
          <div className="p-8 max-w-5xl mx-auto">
            
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Assigned Appointments</h1>
              <p className="text-gray-400 text-sm mt-1">8 of 8 appointments</p>
            </div>

            {/* Status Filter Chips */}
            <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              {['All', 'Pending', 'Confirmed', 'In Progress', 'Completed', 'No-Show'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedFilter === filter 
                      ? 'bg-[#1C5B56] text-white' 
                      : 'bg-[#F0F1F2] text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Barangay & Date Dropdowns */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="relative flex-1 min-w-[180px]">
                <select className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 px-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C5B56] focus:border-transparent text-sm shadow-sm cursor-pointer">
                  <option>All Barangays</option>
                  <option>Brgy. Puntod</option>
                  <option>Brgy. Kinabranan</option>
                  <option>Brgy. Agay-ayan</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative flex-1 min-w-[150px]">
                <select className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 px-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C5B56] focus:border-transparent text-sm shadow-sm cursor-pointer">
                  <option>All Dates</option>
                  <option>Today</option>
                  <option>This Week</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Appointment List */}
            <div className="space-y-4">
              
              {appointments.length === 0 ? (
                // Professional Empty State since we have no pre-built data
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Calendar size={28} className="text-gray-300" />
                  </div>
                  <h3 className="text-gray-700 font-medium text-lg">No appointments found</h3>
                  <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or check back later.</p>
                </div>
              ) : (
                /* Standard Appointment Cards (Rendered if data exists) */
                appointments.map((appt) => (
                  <div 
                    key={appt.id} 
                    className="flex items-center justify-between bg-white p-5 rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] border-l-[6px] hover:shadow-md transition-all cursor-pointer group"
                    style={{ borderLeftColor: appt.borderColor }}
                  >
                    <div className="flex flex-col">
                      <h3 className="font-bold text-gray-800 text-base">{appt.name}</h3>
                      <p className="text-gray-500 text-sm">{appt.service}</p>
                      <div className="flex items-center gap-5 mt-2.5 text-xs text-gray-400">
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
                ))
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default AppointmentsView;