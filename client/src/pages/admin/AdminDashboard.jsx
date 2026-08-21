import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Calendar,
  Users, 
  UserCog, 
  Bell, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import useAdminData from '../../hooks/useAdminData';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
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

  // Simulation of a secure session state (In a real app, this comes from JWT/Context)
  // We keep it generic to show a professional dashboard structure
  const session = {
    user: {
      name: 'Administrator',
      role: 'Admin',
      avatar: 'A'
    }
  };

  const { data: dashboardData, loading: isLoading, error } = useAdminData('/admin/dashboard');

  // Navigation Menu Structure
  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, current: true },
    { name: 'Appointments', href: '/admin/appointments', icon: CalendarCheck, current: false },
    { name: 'Technicians', href: '/admin/technicians', icon: UserCog, current: false },
    { name: 'Clients', href: '/admin/clients', icon: Users, current: false },
    { name: 'Blackout Dates', href: '/admin/blackout-dates', icon: Calendar, current: false },
    { name: 'Notifications', href: '/admin/notifications', icon: Bell, current: false },
    { name: 'Reports', href: '/admin/reports', icon: FileText, current: false },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, current: false },
  ];

  // UI Constants for Clean Professional Cards
  const statCards = [
    { label: 'Total Appointments', value: dashboardData?.stats?.totalAppointments || 0, subtext: 'This month' },
    { label: 'Pending Assignments', value: dashboardData?.stats?.pendingAssignments || 0, subtext: 'Need technician' },
    { label: 'Active Cases', value: dashboardData?.stats?.activeCases || 0, subtext: 'In progress' },
    { label: 'Upcoming Today', value: dashboardData?.stats?.upcomingToday || 0, subtext: 'Scheduled visits' },
  ];

  // Skeleton Components (inline)
  const SkeletonStatCard = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
      <div className="skeleton h-4 w-24 mb-3" />
      <div className="skeleton h-8 w-16 mb-2" />
      <div className="skeleton h-3 w-20" />
    </div>
  );

  const SkeletonRecentAppointments = () => (
    <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 flex items-center justify-between">
        <div className="skeleton h-6 w-40" />
        <div className="skeleton h-4 w-16" />
      </div>
      <div className="divide-y divide-slate-100">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4">
            <div className="min-w-0 flex-1">
              <div className="skeleton h-5 w-32 mb-2" />
              <div className="skeleton h-4 w-48" />
            </div>
            <div className="skeleton h-5 w-20 flex-shrink-0 self-start sm:self-center" />
          </div>
        ))}
      </div>
    </div>
  );

  const SkeletonSystemOverview = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
      <div className="skeleton h-6 w-36 mb-4 sm:mb-5" />
      <div className="space-y-4 sm:space-y-5">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center justify-between border-b border-slate-50 pb-3 sm:pb-4">
            <div className="skeleton h-4 w-32" />
            <div className="skeleton h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );

  const SkeletonAlertSection = () => (
    <section className="bg-red-50/50 border border-red-200 rounded-xl p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2 sm:gap-4">
        <div>
          <div className="skeleton h-5 w-56 mb-1" />
          <div className="skeleton h-4 w-48" />
        </div>
      </div>
      <div className="bg-white/80 rounded-lg p-6 sm:p-8 flex flex-col items-center justify-center text-center border border-red-100/50">
        <div className="skeleton h-4 w-64" />
      </div>
    </section>
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
              {session.user.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{session.user.name}</p>
              <p className="text-xs text-emerald-300/60 truncate">{session.user.role}</p>
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
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 tracking-tight truncate">Dashboard</h2>
              <p className="text-xs text-slate-500 hidden sm:block truncate">Manage your clinic operations efficiently</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <button className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 bg-emerald-700 text-white text-sm font-medium rounded-lg hover:bg-emerald-800 transition-colors shadow-sm whitespace-nowrap">
              <CalendarCheck className="w-4 h-4 flex-shrink-0" />
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
          
          {/* Date / Greeting - Always visible */}
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-sm text-slate-500 font-medium">Thursday, August 14, 2026</p>
              <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mt-0.5 sm:mt-1">Good morning, Admin</h3>
            </div>
          </div>

          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

          {/* --- SKELETON LOADING STATE --- */}
          {isLoading ? (
            <>
              {/* Stats Skeleton */}
              <section className="grid grid-cols-1 xs:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {[...Array(4)].map((_, i) => (
                  <SkeletonStatCard key={i} />
                ))}
              </section>

              {/* Main Grid Skeleton */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <SkeletonRecentAppointments />
                <SkeletonSystemOverview />
              </div>

              {/* Alert Section Skeleton */}
              <SkeletonAlertSection />
            </>
          ) : (
            /* --- ACTUAL CONTENT --- */
            <>
              {/* --- STATS SECTION --- */}
              <section className="grid grid-cols-1 xs:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {statCards.map((stat, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 transition-all hover:shadow-md skeleton-fade-in">
                    <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">{stat.value}</span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-slate-400 mt-1 sm:mt-2 font-medium">{stat.subtext}</p>
                  </div>
                ))}
              </section>

              {/* --- MAIN GRID (Recent Activity & Overview) --- */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                
                {/* Recent Activity List */}
                <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col skeleton-fade-in">
                  <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 flex items-center justify-between">
                    <h4 className="font-semibold text-slate-800 text-sm sm:text-base">Recent Appointments</h4>
                    <a href="#" className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 font-medium whitespace-nowrap">View all &rarr;</a>
                  </div>
                  
                  {dashboardData?.recentAppointments?.length ? (
                    <div className="divide-y divide-slate-100">
                      {dashboardData.recentAppointments.map((appointment) => (
                        <div key={appointment.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4">
                          <div className="min-w-0">
                            <p className="font-medium text-slate-700 text-sm sm:text-base truncate">{appointment.reference_no}</p>
                            <p className="text-xs sm:text-sm text-slate-500 truncate">{appointment.client} · {appointment.service}</p>
                          </div>
                          <span className="text-xs font-medium text-emerald-700 flex-shrink-0 self-start sm:self-center">
                            {appointment.status_label}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 sm:p-6 flex-1 flex flex-col items-center justify-center text-center py-8 sm:py-12">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3 sm:mb-4 text-slate-300">
                        <CalendarCheck className="w-6 h-6 sm:w-8 sm:h-8" />
                      </div>
                      <h5 className="text-slate-700 font-medium text-sm sm:text-base">No recent appointments</h5>
                      <p className="text-xs sm:text-sm text-slate-400 max-w-sm mt-1">New client bookings and scheduled visits will appear here.</p>
                    </div>
                  )}
                </div>

                {/* System Overview */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 skeleton-fade-in">
                  <h4 className="font-semibold text-slate-800 mb-4 sm:mb-5 border-b border-slate-100 pb-3 sm:pb-4 text-sm sm:text-base">System Overview</h4>
                  
                  <div className="space-y-4 sm:space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-3 sm:pb-4">
                      <span className="text-xs sm:text-sm text-slate-600">Available Technicians</span>
                      <span className="text-xs sm:text-sm font-semibold text-slate-800">
                        {dashboardData?.stats?.availableTechnicians || 0} <span className="text-slate-400 font-normal">/ {dashboardData?.stats?.totalTechnicians || 0}</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-slate-50 pb-3 sm:pb-4">
                      <span className="text-xs sm:text-sm text-slate-600">Pending Verifications</span>
                      <span className="text-xs sm:text-sm font-semibold text-amber-600">
                        {dashboardData?.stats?.pendingVerifications || 0} <span className="text-slate-400 font-normal">pending</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-slate-600">Registered Clients</span>
                      <span className="text-xs sm:text-sm font-semibold text-slate-800">{dashboardData?.stats?.registeredClients || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- ALERTS / ATTENTION SECTION --- */}
              <section className="bg-red-50/50 border border-red-200 rounded-xl p-4 sm:p-6 skeleton-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2 sm:gap-4">
                  <div>
                    <h4 className="font-semibold text-red-800 text-sm sm:text-base">Appointments Requiring Attention</h4>
                    <p className="text-xs sm:text-sm text-red-600/80">Items that need your immediate response.</p>
                  </div>
                </div>

                <div className="bg-white/80 rounded-lg p-6 sm:p-8 flex flex-col items-center justify-center text-center border border-red-100/50">
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">All clear! No appointments require attention at this time.</p>
                </div>
              </section>
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
      `}</style>
    </div>
  );
}