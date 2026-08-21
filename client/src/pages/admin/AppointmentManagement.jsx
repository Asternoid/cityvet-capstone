import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  AlertTriangle, 
  ChevronRight, 
  Plus,
  Calendar,
  UserCheck,
  Menu,
  X,
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

export default function AppointmentManagement() {
  const [activeTab, setActiveTab] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  
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

  const statusFilter = activeTab === 'exceptions' ? 'reassignment_needed' : activeTab === 'all' ? 'all' : activeTab;
  const { data: appointmentsData, loading, error, reload } = useAdminData('/admin/appointments', { status: statusFilter, search });
  const appointments = Array.isArray(appointmentsData) ? appointmentsData : [];

  const assignAppointment = async (appointment) => {
    const technicianId = window.prompt('Enter the technician user ID to assign:');
    if (!technicianId) return;
    await API.post(`/admin/appointments/${appointment.id}/assign`, { technicianId });
    reload();
  };

  const getEmptyStateMessage = (tab) => {
    switch(tab) {
      case 'exceptions': return 'No appointments currently require exception handling. All technicians are successfully assigned.';
      case 'declined': return 'No declined appointments found. All assigned technicians have confirmed their schedules.';
      case 'failed': return 'No appointments with failed routing. All service areas are successfully covered.';
      case 'unavailability': return 'No appointments affected by technician unavailability. All technicians are active and confirmed.';
      default: return 'No scheduled appointments found. Create a new appointment to get started.';
    }
  };

  // Navigation Menu Structure
  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, current: false },
    { name: 'Appointments', href: '/admin/appointments', icon: CalendarCheck, current: true },
    { name: 'Technicians', href: '/admin/technicians', icon: UserCog, current: false },
    { name: 'Clients', href: '/admin/clients', icon: Users, current: false },
    { name: 'Blackout Dates', href: '/admin/blackout-dates', icon: Calendar, current: false },
    { name: 'Notifications', href: '/admin/notifications', icon: Bell, current: false },
    { name: 'Reports', href: '/admin/reports', icon: FileText, current: false },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, current: false },
  ];

  const tabs = [
    { id: 'all', label: 'All Appointments' },
    { id: 'exceptions', label: 'Exceptions' },
    { id: 'declined', label: 'Declined' },
    { id: 'failed', label: 'Failed Routing' },
    { id: 'unavailability', label: 'Technician Unavailability' },
  ];

  // Skeleton Components
  const SkeletonTableRow = () => (
    <tr className="border-b border-slate-100">
      <td className="px-6 py-4"><div className="skeleton h-4 w-24" /></td>
      <td className="px-6 py-4"><div className="skeleton h-4 w-32" /></td>
      <td className="px-6 py-4"><div className="skeleton h-4 w-28" /></td>
      <td className="px-6 py-4"><div className="skeleton h-4 w-20" /></td>
      <td className="px-6 py-4"><div className="skeleton h-4 w-36" /></td>
      <td className="px-6 py-4"><div className="skeleton h-4 w-28" /></td>
      <td className="px-6 py-4"><div className="skeleton h-4 w-20" /></td>
      <td className="px-6 py-4"><div className="skeleton h-6 w-16 ml-auto" /></td>
    </tr>
  );

  const SkeletonAlertSection = () => (
    <div className="mb-6 bg-red-50/50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="skeleton h-5 w-5 rounded-full" />
          <div className="skeleton h-4 w-64" />
        </div>
        <div className="skeleton h-4 w-32" />
      </div>
    </div>
  );

  const SkeletonTableHeader = () => (
    <div className="border-b border-slate-200 px-6 pt-4">
      <div className="flex gap-8">
        {tabs.map((tab) => (
          <div key={tab.id} className="skeleton h-5 w-28 pb-4" />
        ))}
      </div>
    </div>
  );

  const SkeletonSearchBar = () => (
    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="skeleton h-10 w-full rounded-lg" />
        </div>
        <div className="skeleton h-4 w-20" />
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
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 tracking-tight truncate">Appointment Management</h2>
              <p className="text-xs text-slate-500 hidden sm:block truncate">Review, assign, monitor, and manage all city veterinary appointments</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <button className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 bg-emerald-700 text-white text-sm font-medium rounded-lg hover:bg-emerald-800 transition-colors shadow-sm whitespace-nowrap">
              <Plus className="w-4 h-4 flex-shrink-0" />
              <span className="hidden xs:inline">New Appointment</span>
              <span className="xs:hidden">New</span>
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
            <>
              {/* Alert Skeleton */}
              <SkeletonAlertSection />

              {/* Table Container Skeleton */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                {/* Tabs Skeleton */}
                <SkeletonTableHeader />
                
                {/* Search Bar Skeleton */}
                <SkeletonSearchBar />

                {/* Table Skeleton */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-slate-500 border-b border-slate-200 bg-slate-50/50">
                      <tr>
                        {['Reference', 'Client', 'Service', 'Barangay', 'Date', 'Technician', 'Status', ''].map((heading) => (
                          <th key={heading} className="px-6 py-3 font-medium">
                            <div className="skeleton h-4 w-16" />
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[...Array(5)].map((_, i) => (
                        <SkeletonTableRow key={i} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            /* --- ACTUAL CONTENT --- */
            <>
              {/* Alert Section */}
              <div className="mb-6 bg-red-50/50 border border-red-200 rounded-lg p-4 flex items-center justify-between skeleton-fade-in">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-semibold text-red-700">Appointments require immediate attention</span>
                </div>
                <button 
                  onClick={() => setActiveTab('exceptions')}
                  className="text-sm font-medium text-red-700 hover:text-red-800 flex items-center gap-1 transition-colors"
                >
                  View Exceptions <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Main Table Container */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 skeleton-fade-in">
                
                {/* Tabs Navigation */}
                <div className="border-b border-slate-200 px-4 sm:px-6 pt-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
                  <div className="flex gap-6 sm:gap-8">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                          pb-4 text-sm font-medium transition-colors relative
                          ${activeTab === tab.id 
                            ? 'text-emerald-700 border-b-2 border-emerald-700'
                            : 'text-slate-500 hover:text-slate-700'
                          }
                        `}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Bar */}
                <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        type="text"
                        placeholder="Search appointments by reference, client, or technician..." 
                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all bg-white"
                      />
                    </div>
                    <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                      {loading ? 'Loading...' : `${appointments.length} results`}
                    </span>
                  </div>
                </div>

                {/* Table Content */}
                {error && <p className="p-6 text-sm text-red-600">{error}</p>}
                
                {appointments.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-slate-500 border-b border-slate-200 bg-slate-50/50">
                        <tr>
                          {['Reference', 'Client', 'Service', 'Barangay', 'Date', 'Technician', 'Status', ''].map((heading) => (
                            <th key={heading} className="px-6 py-3 font-medium">{heading}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {appointments.map((appointment) => (
                          <tr key={appointment.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-700">{appointment.reference_no}</td>
                            <td className="px-6 py-4 text-slate-600">{appointment.client}</td>
                            <td className="px-6 py-4 text-slate-600">{appointment.service}</td>
                            <td className="px-6 py-4 text-slate-600">{appointment.barangay}</td>
                            <td className="px-6 py-4 text-slate-600">
                              {appointment.preferred_date} <span className="text-slate-400 text-xs">{appointment.preferred_time}</span>
                            </td>
                            <td className="px-6 py-4 text-slate-600">
                              {appointment.technician || <span className="text-slate-400 italic">Unassigned</span>}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${appointment.status_label === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' :
                                  appointment.status_label === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                  appointment.status_label === 'Completed' ? 'bg-blue-100 text-blue-700' :
                                  appointment.status_label === 'Declined' ? 'bg-red-100 text-red-700' :
                                  'bg-slate-100 text-slate-700'
                                }`}>
                                {appointment.status_label}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {!appointment.technician_id && (
                                <button 
                                  onClick={() => assignAppointment(appointment)}
                                  className="px-3 py-1.5 bg-emerald-700 text-white text-xs font-semibold rounded-lg hover:bg-emerald-800 transition-colors shadow-sm"
                                >
                                  Assign
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 flex flex-col items-center justify-center text-center py-16 min-h-[400px]">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-5 text-slate-300">
                      <Calendar className="w-10 h-10" />
                    </div>
                    <h4 className="text-lg font-semibold text-slate-700">No {activeTab !== 'all' ? activeTab.replace('-', ' ') : ''} appointments found</h4>
                    <p className="text-sm text-slate-400 max-w-sm mt-1">
                      {getEmptyStateMessage(activeTab)}
                    </p>
                    
                    {activeTab === 'all' && (
                      <button className="mt-6 px-5 py-2 bg-emerald-700 text-white text-sm font-medium rounded-lg hover:bg-emerald-800 transition-colors shadow-sm">
                        Create Appointment
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </main>

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

        /* Hide scrollbar for tabs */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}