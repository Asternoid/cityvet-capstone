import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  CalendarDays, 
  Bell, 
  Clock, 
  LogOut, 
  MapPin, 
  ChevronRight,
  PawPrint,
  ChevronLeft,
  Phone
} from 'lucide-react';

/**
 * ============================================================
 * HELPER: Get status color classes
 * ============================================================
 */
const getStatusClasses = (status) => {
  switch (status) {
    case 'Pending Confirmation': return 'border-[#D99B4D] text-[#D99B4D]';
    case 'Technician Confirmed': return 'border-[#5BC2C1] text-[#5BC2C1]';
    case 'In Progress': return 'border-[#5B8DEF] text-[#5B8DEF]';
    case 'Completed': return 'border-[#48BB78] text-[#48BB78]';
    case 'No-Show': return 'border-[#FC8181] text-[#FC8181]';
    default: return 'border-gray-300 text-gray-500';
  }
};

/**
 * ============================================================
 * COMPONENT: Status Badge
 * ============================================================
 */
const StatusBadge = ({ status }) => {
  return (
    <span className={`px-3 py-1 rounded border text-xs font-medium bg-white ${getStatusClasses(status)}`}>
      {status}
    </span>
  );
};

/**
 * ============================================================
 * COMPONENT: Sidebar
 * ============================================================
 */
const Sidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const menuItems = [
    { id: 'Dashboard', icon: CalendarDays, label: 'Dashboard' },
    { id: 'Appointments', icon: CalendarDays, label: 'Appointments' },
    { id: 'Schedule', icon: CalendarDays, label: 'Weekly Schedule' },
    { id: 'Notifications', icon: Bell, label: 'Notifications', badge: 2 },
    { id: 'Leave', icon: Clock, label: 'Leave / Unavailability' },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col justify-between fixed left-0 top-0 z-20">
      <div>
        <div className="p-6 pb-8">
          <div className="flex items-center gap-3">
            <div className="bg-[#1C5B56] p-2 rounded-xl text-white"><PawPrint size={24} /></div>
            <div>
              <h1 className="font-bold text-[#1C5B56] text-lg leading-tight">City Vet</h1>
              <p className="text-[10px] text-gray-400 font-medium tracking-wide">Technician Portal</p>
            </div>
          </div>
        </div>

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

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-[#1C5B56] text-white flex items-center justify-center font-bold text-sm">JD</div>
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
 * COMPONENT: Skeleton Loader
 * ============================================================
 */
const ScheduleSkeleton = () => {
  return (
    <div className="animate-pulse p-8 ml-64">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/6 mb-8"></div>
      
      {/* Calendar Bar Skeleton */}
      <div className="flex justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-8">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
             <div className="h-3 w-8 bg-gray-200 rounded"></div>
             <div className="h-4 w-6 bg-gray-200 rounded"></div>
             <div className="h-2 w-2 bg-gray-200 rounded-full"></div>
          </div>
        ))}
      </div>
      
      {/* List Items Skeleton */}
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex gap-6">
            <div className="w-24 h-6 bg-gray-200 rounded"></div>
            <div className="border-l border-gray-100 pl-6 flex-1 space-y-2">
              <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-100 rounded w-1/2"></div>
              <div className="flex gap-4 mt-2">
                <div className="h-3 bg-gray-100 rounded w-16"></div>
                <div className="h-5 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * ============================================================
 * SUB-VIEW: Appointment Details
 * ============================================================
 */
const AppointmentDetailsView = ({ appointment, onBack }) => {
  if (!appointment) return null;

  return (
    <div className="p-8 ml-64 max-w-4xl mx-auto">
      {/* Back Button & Header */}
      <div className="flex items-center gap-4 mb-6 cursor-pointer group" onClick={onBack}>
        <div className="bg-gray-100 p-2 rounded-full group-hover:bg-gray-200 transition-colors">
          <ChevronLeft size={20} className="text-gray-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Appointment Details</h2>
          <p className="text-xs text-gray-400">Ref: {appointment.ref || 'APT-004'}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Current Status Card */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
          <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">Current Status</span>
          <StatusBadge status={appointment.status} />
        </div>

        {/* Client Information Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-4">Client Information</h3>
          <div className="space-y-4">
            <div className="pb-4 border-b border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Client Name</p>
              <p className="text-gray-800 font-medium">{appointment.name}</p>
            </div>
            <div className="pb-4 border-b border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Contact Number</p>
              <div className="flex items-center gap-2 text-gray-800 font-medium">
                <Phone size={14} className="text-gray-400" />
                {appointment.contact || '09451234567'}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Barangay Address</p>
              <p className="text-gray-800 font-medium">{appointment.location}</p>
            </div>
          </div>
        </div>

        {/* Service Information Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-4">Service Information</h3>
          <div className="space-y-4">
            <div className="pb-4 border-b border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Service Type</p>
              <p className="text-gray-800 font-medium">{appointment.service}</p>
            </div>
            <div className="pb-4 border-b border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Service Address / Location</p>
              <p className="text-gray-800 font-medium">{appointment.fullAddress || 'Purok 7, Puntod, Gingoog City'}</p>
            </div>
            <div className="pb-4 border-b border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Scheduled Date</p>
              <p className="text-gray-800 font-medium">{appointment.date || 'Thursday, August 14, 2025'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Scheduled Time</p>
              <p className="text-gray-800 font-medium">{appointment.time}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * ============================================================
 * MAIN COMPONENT: WeeklySchedule
 * ============================================================
 */
function WeeklySchedule() {
  const [activeTab, setActiveTab] = useState('Schedule');
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedDate, setSelectedDate] = useState('14');

  const weekDays = [
    { day: 'Mon', date: '11' },
    { day: 'Tue', date: '12' },
    { day: 'Wed', date: '13' },
    { day: 'Thu', date: '14', hasDot: true },
    { day: 'Fri', date: '15', hasDot: true },
    { day: 'Sat', date: '16', hasDot: true },
    { day: 'Sun', date: '17' },
  ];

  /*
   * ============================================================
   * PROFESSIONAL IMPLEMENTATION NOTE: ROUTING STRUCTURE
   * ============================================================
   * 
   * Currently, I am using "selectedAppointment" state to swap views
   * on the screen. In a professional production app, you should
   * separate these into nested routes using React Router v6:
   * 
   * 1. Create these component files:
   *    - WeeklySchedule.jsx (The Calendar & List)
   *    - AppointmentDetails.jsx (The Detail Card)
   * 
   * 2. In your main Route setup:
   *    <Route path="/schedule" element={<WeeklySchedule />} />
   *    <Route path="/schedule/:appointmentId" element={<AppointmentDetails />} />
   * 
   * 3. In the WeeklySchedule list, replace the onClick with:
   *    import { useNavigate } from 'react-router-dom';
   *    const navigate = useNavigate();
   *    <div onClick={() => navigate(`/schedule/${appt.id}`)}>
   * 
   * 4. In AppointmentDetails, use useParams() to get the ID:
   *    const { appointmentId } = useParams();
   *    fetch(`/api/appointments/${appointmentId}`)...
   * ============================================================
   */

  // Mock Data Fetch with NO hardcoded data. Starts blank.
  useEffect(() => {
    const timer = setTimeout(() => {
      // Set empty array to prove no prebuilt data exists.
      // If you connect an API, you'll place the fetch here.
      setAppointments([]);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // If a user clicks a card, we go to Details view
  if (selectedAppointment) {
    return <AppointmentDetailsView appointment={selectedAppointment} onBack={() => setSelectedAppointment(null)} />;
  }

  return (
    <div className="min-h-screen bg-[#F5F7F6] font-sans flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {loading ? (
        <ScheduleSkeleton />
      ) : (
        <div className="flex-1 ml-64 p-8 max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Weekly Schedule</h1>
            <p className="text-gray-400 text-sm mt-1">Aug 11 – 17, 2025</p>
          </div>

          {/* Calendar Selection Bar */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-8 flex justify-between items-center">
            {weekDays.map((item) => (
              <button
                key={item.date}
                onClick={() => setSelectedDate(item.date)}
                className={`flex flex-col items-center justify-center w-14 h-16 rounded-2xl transition-all ${
                  selectedDate === item.date
                    ? 'bg-[#1C5B56] text-white shadow-md'
                    : 'bg-transparent text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="text-[11px] font-medium">{item.day}</span>
                <span className="text-sm font-bold mt-1">{item.date}</span>
                {item.hasDot && (
                  <span className={`w-1.5 h-1.5 rounded-full mt-1 ${selectedDate === item.date ? 'bg-white/70' : 'bg-[#1C5B56]'}`}></span>
                )}
              </button>
            ))}
          </div>

          {/* Daily Schedule List */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-gray-700">Thu, Aug 14</h2>
            <span className="text-xs text-gray-400">{appointments.length} appointments</span>
          </div>

          <div className="space-y-4">
            {appointments.length === 0 ? (
              // Clean, Empty State
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <CalendarDays size={28} className="text-gray-300" />
                </div>
                <h3 className="text-gray-700 font-medium text-lg">No appointments scheduled</h3>
                <p className="text-gray-400 text-sm mt-1">You have no appointments for this day.</p>
              </div>
            ) : (
              // Horizontal List Format (Time on Left)
              appointments.map((appt) => (
                <div 
                  key={appt.id} 
                  onClick={() => setSelectedAppointment(appt)}
                  className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-6 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="w-24 text-[#1C5B56] font-bold text-sm text-right pr-4 border-r border-gray-100">
                    {appt.time}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-base">{appt.name}</h3>
                    <p className="text-gray-500 text-sm">{appt.service}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} />
                        {appt.location}
                      </span>
                      <span className="text-gray-300">·</span>
                      <StatusBadge status={appt.status} />
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-300 group-hover:text-[#1C5B56] transition-colors" />
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default WeeklySchedule;