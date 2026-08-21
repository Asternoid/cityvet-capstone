import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  UserCheck, 
  Plus, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Menu,
  LayoutDashboard,
  CalendarCheck,
  Users,
  UserCog,
  Bell,
  FileText,
  BarChart3,
  LogOut
} from 'lucide-react';
import useAdminData from '../../hooks/useAdminData';
import API from '../../api/axios';

// RBAC Simulation
const CURRENT_USER = {
  name: 'Administrator',
  email: 'admin@cityvet.gov.ph',
  role: 'admin'
};

export default function BlackoutDates() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(7); // 0-indexed (August = 7)
  const [currentYear, setCurrentYear] = useState(2025);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ date: '', reason: '' });
  
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

  const { data: blackoutDatesData, loading, error, reload } = useAdminData('/admin/blackout-dates');
  const blackoutDates = Array.isArray(blackoutDatesData) ? blackoutDatesData : [];
  const blackoutSet = new Set(blackoutDates.map((item) => item.date));
  
  const saveBlackoutDate = async () => {
    await API.post('/admin/blackout-dates', form);
    setForm({ date: '', reason: '' });
    setIsModalOpen(false);
    reload();
  };

  // Navigation Menu Structure
  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, current: false },
    { name: 'Appointments', href: '/admin/appointments', icon: CalendarCheck, current: false },
    { name: 'Technicians', href: '/admin/technicians', icon: UserCog, current: false },
    { name: 'Clients', href: '/admin/clients', icon: Users, current: false },
    { name: 'Blackout Dates', href: '/admin/blackout-dates', icon: CalendarIcon, current: true },
    { name: 'Notifications', href: '/admin/notifications', icon: Bell, current: false },
    { name: 'Reports', href: '/admin/reports', icon: FileText, current: false },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, current: false },
  ];

  // --- CALENDAR LOGIC ---
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const startDay = getFirstDayOfMonth(currentYear, currentMonth);
    
    const days = [];
    // Empty slots before the 1st
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-14"></div>);
    }
    
    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isBlackout = blackoutSet.has(date);
      
      days.push(
        <div 
          key={day} 
          className={`
            h-14 flex flex-col items-center justify-center rounded-lg border border-transparent relative transition-colors
            ${isBlackout ? 'bg-red-50 border-red-200 text-red-700 font-medium' : 'text-slate-700 hover:bg-slate-50'}
          `}
        >
          <span>{day}</span>
          {isBlackout && <div className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-red-500"></div>}
        </div>
      );
    }
    return days;
  };

  const changeMonth = (offset) => {
    let newMonth = currentMonth + offset;
    let newYear = currentYear;
    if (newMonth > 11) { newMonth = 0; newYear++; }
    if (newMonth < 0) { newMonth = 11; newYear--; }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Skeleton Components
  const SkeletonCalendar = () => (
    <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div className="skeleton h-8 w-8 rounded-md" />
        <div className="skeleton h-6 w-32" />
        <div className="skeleton h-8 w-8 rounded-md" />
      </div>
      <div className="p-6">
        <div className="grid grid-cols-7 mb-2 text-center">
          {dayNames.map(day => (
            <div key={day} className="skeleton h-4 w-8 mx-auto py-2" />
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1 gap-x-1">
          {[...Array(35)].map((_, i) => (
            <div key={i} className="skeleton h-14 w-full rounded-lg" />
          ))}
        </div>
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="skeleton h-4 w-4 rounded-sm" />
            <div className="skeleton h-3 w-8" />
          </div>
          <div className="flex items-center gap-2">
            <div className="skeleton h-4 w-4 rounded-sm" />
            <div className="skeleton h-3 w-16" />
          </div>
          <div className="flex items-center gap-2">
            <div className="skeleton h-4 w-4 rounded-sm" />
            <div className="skeleton h-3 w-12" />
          </div>
        </div>
      </div>
    </div>
  );

  const SkeletonBlackoutList = () => (
    <div className="w-full lg:w-80 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="skeleton h-5 w-40 mb-4 border-b border-slate-100 pb-3" />
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="pt-4 first:pt-0 flex items-center justify-between">
            <div>
              <div className="skeleton h-4 w-28 mb-1" />
              <div className="skeleton h-3 w-20" />
            </div>
            <div className="skeleton h-4 w-4" />
          </div>
        ))}
      </div>
    </div>
  );

  const SkeletonInfoNote = () => (
    <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-5">
      <div className="skeleton h-4 w-16 mb-1" />
      <div className="space-y-2">
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-3/4" />
      </div>
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
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 tracking-tight truncate">Blackout Dates</h2>
              <p className="text-xs text-slate-500 hidden sm:block truncate">Manage dates when appointment scheduling is unavailable</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 bg-emerald-700 text-white text-sm font-medium rounded-lg hover:bg-emerald-800 transition-colors shadow-sm whitespace-nowrap"
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              <span className="hidden xs:inline">Add Blackout Date</span>
              <span className="xs:hidden">Add</span>
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
            <div className="flex flex-col lg:flex-row gap-6">
              <SkeletonCalendar />
              <div className="w-full lg:w-80 flex flex-col gap-6">
                <SkeletonBlackoutList />
                <SkeletonInfoNote />
              </div>
            </div>
          ) : (
            /* --- ACTUAL CONTENT --- */
            <div className="flex flex-col lg:flex-row gap-6 skeleton-fade-in">
              
              {/* --- CALENDAR AREA --- */}
              <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                
                {/* Calendar Header */}
                <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <button 
                    onClick={() => changeMonth(-1)}
                    className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <h3 className="font-semibold text-emerald-900 text-base sm:text-lg">
                    {monthNames[currentMonth]} {currentYear}
                  </h3>
                  <button 
                    onClick={() => changeMonth(1)}
                    className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="p-4 sm:p-6">
                  {/* Days of Week Header */}
                  <div className="grid grid-cols-7 mb-2 text-center">
                    {dayNames.map(day => (
                      <div key={day} className="text-xs font-medium text-slate-500 py-2">{day}</div>
                    ))}
                  </div>
                  {/* Days Grid */}
                  <div className="grid grid-cols-7 gap-y-1 gap-x-1">
                    {renderCalendar()}
                  </div>

                  {/* Calendar Legend */}
                  <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border border-slate-300 bg-white rounded-sm"></div>
                      <span>Today</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border border-red-200 bg-red-50 rounded-sm"></div>
                      <span>Blackout / Unavailable</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border border-slate-200 bg-white rounded-sm"></div>
                      <span>Available</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- SIDEBAR LIST (Right Panel) --- */}
              <div className="w-full lg:w-80 flex flex-col gap-6">
                
                {/* Scheduled Blackout Dates List */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
                  <h4 className="font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-3 text-sm sm:text-base">Scheduled Blackout Dates</h4>
                  
                  {blackoutDates.length ? (
                    <ul className="space-y-4 divide-y divide-slate-100">
                      {blackoutDates.map((item) => (
                        <li key={item.id} className="pt-4 first:pt-0 flex items-center justify-between group">
                          <div>
                            <p className="text-sm font-medium text-red-700">{item.date}</p>
                            <p className="text-xs text-slate-400">{item.reason || 'Unavailable'}</p>
                          </div>
                          <button 
                            onClick={async () => { 
                              await API.delete(`/admin/blackout-dates/${item.id}`); 
                              reload(); 
                            }} 
                            className="text-slate-300 hover:text-red-600 transition-colors p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 text-slate-300">
                        <CalendarIcon className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-medium text-slate-600">No blackout dates</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Scheduled unavailable dates will appear here.</p>
                    </div>
                  )}
                </div>

                {/* Info Note */}
                <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-5">
                  <h5 className="text-sm font-medium text-amber-800 mb-1">Note</h5>
                  <p className="text-xs text-amber-700/80 leading-relaxed">
                    Clients will be unable to schedule appointments on blackout dates. Existing appointments on these dates will not be automatically cancelled.
                  </p>
                </div>

              </div>

            </div>
          )}

        </div>
      </main>

      {/* ================= ADD BLACKOUT DATE MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-emerald-900">Add Blackout Date</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              
              {/* Date Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
                <input 
                  type="date"
                  value={form.date}
                  onChange={(event) => setForm({ ...form, date: event.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all bg-white"
                />
              </div>

              {/* Reason Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason (optional)</label>
                <input 
                  type="text"
                  value={form.reason}
                  onChange={(event) => setForm({ ...form, reason: event.target.value })}
                  placeholder="e.g. Public holiday, maintenance" 
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all bg-white"
                />
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50/50">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button 
                onClick={saveBlackoutDate} 
                disabled={!form.date || !form.reason.trim()} 
                className="px-5 py-2 bg-emerald-700 text-white text-sm font-medium rounded-lg hover:bg-emerald-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Blackout Date
              </button>
            </div>

          </div>
        </div>
      )}

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