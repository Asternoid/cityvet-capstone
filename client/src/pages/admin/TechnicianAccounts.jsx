import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Users, 
  Calendar, 
  UserCheck,
  Eye,
  Search,
  Plus,
  Menu,
  X,
  LayoutDashboard,
  CalendarCheck,
  UserCog,
  Bell,
  FileText,
  BarChart3,
  LogOut
} from 'lucide-react';
import useAdminData from '../../hooks/useAdminData';

// RBAC Simulation
const CURRENT_USER = {
  name: 'Administrator',
  email: 'admin@cityvet.gov.ph',
  role: 'admin'
};

export default function TechnicianManagement() {
  const [activeTab, setActiveTab] = useState('all');
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

  const statusFilter = activeTab === 'all' ? 'all' : activeTab === 'leave' ? 'on_leave' : activeTab;
  const { data: techniciansData, loading, error } = useAdminData('/admin/technicians', { status: statusFilter });
  const technicians = Array.isArray(techniciansData) ? techniciansData : [];

  // Navigation Menu Structure
  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, current: false },
    { name: 'Appointments', href: '/admin/appointments', icon: CalendarCheck, current: false },
    { name: 'Technicians', href: '/admin/technicians', icon: UserCog, current: true },
    { name: 'Clients', href: '/admin/clients', icon: Users, current: false },
    { name: 'Blackout Dates', href: '/admin/blackout-dates', icon: Calendar, current: false },
    { name: 'Notifications', href: '/admin/notifications', icon: Bell, current: false },
    { name: 'Reports', href: '/admin/reports', icon: FileText, current: false },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, current: false },
  ];

  // Stat Cards
  const statCards = [
    {
      label: 'Available',
      value: technicians.filter((item) => item.availability_status === 'available').length,
      bgClass: 'bg-emerald-50/50 border border-emerald-200', 
      textClass: 'text-emerald-700',
      icon: User
    },
    { 
      label: 'Currently Assigned', 
      value: technicians.filter((item) => item.availability_status === 'assigned').length,
      bgClass: 'bg-sky-50/50 border border-sky-200', 
      textClass: 'text-sky-700',
      icon: CalendarCheck
    },
    { 
      label: 'On Leave', 
      value: technicians.filter((item) => item.availability_status === 'on_leave').length,
      bgClass: 'bg-amber-50/50 border border-amber-200', 
      textClass: 'text-amber-700',
      icon: Calendar
    },
  ];

  // Tabs
  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'available', label: 'Available' },
    { id: 'assigned', label: 'Assigned' },
    { id: 'leave', label: 'On Leave' },
  ];

  // Skeleton Components
  const SkeletonStatCard = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="skeleton h-8 w-12 mb-1" />
      <div className="skeleton h-4 w-24" />
    </div>
  );

  const SkeletonTableRow = () => (
    <tr className="border-b border-slate-100">
      <td className="px-6 py-4"><div className="skeleton h-4 w-32" /></td>
      <td className="px-6 py-4"><div className="skeleton h-4 w-20" /></td>
      <td className="px-6 py-4"><div className="skeleton h-4 w-24" /></td>
      <td className="px-6 py-4"><div className="skeleton h-4 w-20" /></td>
    </tr>
  );

  const SkeletonFilterTabs = () => (
    <div className="border-b border-slate-200 px-6 py-4 bg-slate-50/30 flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <div key={tab.id} className="skeleton h-8 w-20 rounded-md" />
      ))}
    </div>
  );

  const SkeletonTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-slate-500 border-b border-slate-200 bg-slate-50/50">
          <tr>
            {['Name', 'Availability', 'Current Assignment', 'Account Status'].map((heading) => (
              <th key={heading} className="px-6 py-3 font-medium">
                <div className="skeleton h-3 w-16" />
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
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 tracking-tight truncate">Technician Management</h2>
              <p className="text-xs text-slate-500 hidden sm:block truncate">Manage technician accounts, availability, and service area assignments</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <button className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 bg-emerald-700 text-white text-sm font-medium rounded-lg hover:bg-emerald-800 transition-colors shadow-sm whitespace-nowrap">
              <Plus className="w-4 h-4 flex-shrink-0" />
              <span className="hidden xs:inline">Add Technician</span>
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
            <>
              {/* Stats Skeleton */}
              <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {[...Array(3)].map((_, i) => (
                  <SkeletonStatCard key={i} />
                ))}
              </section>

              {/* Table Container Skeleton */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                {/* Filter Tabs Skeleton */}
                <SkeletonFilterTabs />
                
                {/* Table Skeleton */}
                <SkeletonTable />
              </div>
            </>
          ) : (
            /* --- ACTUAL CONTENT --- */
            <>
              {/* --- STAT CARDS --- */}
              <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 skeleton-fade-in">
                {statCards.map((stat, index) => (
                  <div 
                    key={index} 
                    className={`${stat.bgClass} rounded-xl p-4 sm:p-6 transition-all shadow-sm flex items-center justify-between`}
                  >
                    <div>
                      <p className={`text-2xl sm:text-3xl font-bold ${stat.textClass} mb-1`}>{stat.value}</p>
                      <p className={`text-xs sm:text-sm font-medium ${stat.textClass} opacity-80`}>{stat.label}</p>
                    </div>
                    <stat.icon className={`w-6 h-6 ${stat.textClass} opacity-60`} />
                  </div>
                ))}
              </section>

              {/* --- FILTERS & TABLE CONTAINER --- */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden skeleton-fade-in">
                
                {/* Filter Tabs */}
                <div className="border-b border-slate-200 px-4 sm:px-6 py-4 bg-slate-50/30 flex flex-wrap gap-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        px-4 sm:px-5 py-1.5 text-sm font-medium rounded-md transition-colors border
                        ${activeTab === tab.id 
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }
                      `}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Table Area */}
                {technicians.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-slate-500 border-b border-slate-200 bg-slate-50/50">
                        <tr>
                          {['Name', 'Availability', 'Current Assignment', 'Account Status'].map((heading) => (
                            <th key={heading} className="px-6 py-3 font-medium">{heading}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {technicians.map((technician) => (
                          <tr key={technician.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-700">{technician.full_name}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${technician.availability_status === 'available' ? 'bg-emerald-100 text-emerald-700' :
                                  technician.availability_status === 'assigned' ? 'bg-sky-100 text-sky-700' :
                                  technician.availability_status === 'on_leave' ? 'bg-amber-100 text-amber-700' :
                                  'bg-slate-100 text-slate-700'
                                }`}>
                                {technician.availability_status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-600">
                              {technician.current_assignment?.reference_no || <span className="text-slate-400 italic">None</span>}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${technician.account_status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                  technician.account_status === 'suspended' ? 'bg-red-100 text-red-700' :
                                  'bg-slate-100 text-slate-700'
                                }`}>
                                {technician.account_status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 flex flex-col items-center justify-center text-center py-20 min-h-[400px]">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-5 text-slate-300">
                      <Users className="w-10 h-10" />
                    </div>
                    <h4 className="text-lg font-semibold text-slate-700">No technicians found</h4>
                    <p className="text-sm text-slate-400 max-w-sm mt-1">
                      {activeTab === 'all' 
                        ? "Add a new technician to start managing your veterinary workforce." 
                        : `There are currently no technicians with the "${activeTab}" status.`}
                    </p>
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
      `}</style>
    </div>
  );
}