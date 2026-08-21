import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  UserCheck, 
  AlertCircle, 
  ClipboardList,
  X,
  Menu,
  LayoutDashboard,
  CalendarCheck,
  Users,
  UserCog,
  Bell,
  FileText,
  BarChart3,
  LogOut,
  Calendar
} from 'lucide-react';
import useAdminData from '../../hooks/useAdminData';
import API from '../../api/axios';

// RBAC Simulation
const CURRENT_USER = {
  name: 'Administrator',
  email: 'admin@cityvet.gov.ph',
  role: 'admin'
};

export default function ClientVerification() {
  const [activeTab, setActiveTab] = useState('total');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);
  
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

  const { data: clientsData, loading, error, reload } = useAdminData('/admin/clients', { verificationStatus: activeTab });
  const clients = Array.isArray(clientsData) ? clientsData : [];
  
  const verifyClient = async (client) => { 
    await API.post(`/admin/clients/${client.id}/verify`); 
    reload(); 
  };
  
  const rejectClient = async (client) => { 
    const reason = window.prompt('Reason for rejection:'); 
    if (reason === null) return; 
    await API.post(`/admin/clients/${client.id}/reject`, { reason }); 
    reload(); 
  };

  // Navigation Menu Structure
  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, current: false },
    { name: 'Appointments', href: '/admin/appointments', icon: CalendarCheck, current: false },
    { name: 'Technicians', href: '/admin/technicians', icon: UserCog, current: false },
    { name: 'Clients', href: '/admin/clients', icon: Users, current: true },
    { name: 'Blackout Dates', href: '/admin/blackout-dates', icon: Calendar, current: false },
    { name: 'Notifications', href: '/admin/notifications', icon: Bell, current: false },
    { name: 'Reports', href: '/admin/reports', icon: FileText, current: false },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, current: false },
  ];

  // Stat Cards
  const statCards = [
    { label: 'Total Clients', value: clients.length, bgClass: 'bg-emerald-900 text-white', icon: Users },
    { label: 'Verified', value: clients.filter((client) => client.verification_status === 'verified').length, bgClass: 'bg-white text-slate-800 border border-slate-200', icon: UserCheck },
    { label: 'Pending', value: clients.filter((client) => client.verification_status === 'pending').length, bgClass: 'bg-white text-slate-800 border border-slate-200', icon: AlertCircle },
    { label: 'Rejected', value: clients.filter((client) => client.verification_status === 'rejected').length, bgClass: 'bg-white text-slate-800 border border-slate-200', icon: X },
  ];

  // Tabs
  const tabs = [
    { id: 'total', label: 'Total Clients' },
    { id: 'verified', label: 'Verified' },
    { id: 'pending', label: 'Pending' },
    { id: 'rejected', label: 'Rejected' },
  ];

  const closeModal = () => {
    setSelectedClientId(null);
  };

  // Skeleton Components
  const SkeletonStatCard = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
      <div className="skeleton h-8 w-12 mb-2" />
      <div className="skeleton h-4 w-24" />
    </div>
  );

  const SkeletonTableRow = () => (
    <tr className="border-b border-slate-100">
      <td className="px-6 py-4"><div className="skeleton h-4 w-32" /></td>
      <td className="px-6 py-4"><div className="skeleton h-4 w-20" /></td>
      <td className="px-6 py-4"><div className="skeleton h-4 w-24" /></td>
      <td className="px-6 py-4"><div className="skeleton h-4 w-20" /></td>
      <td className="px-6 py-4"><div className="skeleton h-4 w-20" /></td>
      <td className="px-6 py-4"><div className="skeleton h-6 w-24 ml-auto" /></td>
    </tr>
  );

  const SkeletonAlertSection = () => (
    <div className="mb-6 bg-amber-50/50 border border-amber-200 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className="skeleton h-5 w-5 rounded-full" />
        <div className="skeleton h-4 w-48" />
      </div>
    </div>
  );

  const SkeletonFilterTabs = () => (
    <div className="border-b border-slate-200 px-6 py-4 bg-slate-50/30 grid grid-cols-2 md:grid-cols-4 gap-3">
      {tabs.map((tab) => (
        <div key={tab.id} className="skeleton h-10 w-full rounded-lg" />
      ))}
    </div>
  );

  const SkeletonTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-slate-600 bg-slate-50 border-b border-slate-200">
          <tr>
            {['Name', 'Barangay', 'Registered', 'Verification', 'Account', ''].map((heading) => (
              <th key={heading} className="px-6 py-3.5 font-semibold uppercase tracking-wider text-xs">
                <div className="skeleton h-3 w-16" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
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
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 tracking-tight truncate">Client Verification</h2>
              <p className="text-xs text-slate-500 hidden sm:block truncate">Review client verification requests and manage registered accounts</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
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

              {/* Stats Skeleton */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[...Array(4)].map((_, i) => (
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
              {/* --- ALERT BANNER --- */}
              <div className="mb-6 bg-amber-50/50 border border-amber-200 rounded-lg p-4 flex items-center justify-between skeleton-fade-in">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">
                    {clients.filter((client) => client.verification_status === 'pending').length} client verifications pending review
                  </span>
                </div>
              </div>

              {/* --- STAT CARDS --- */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 skeleton-fade-in">
                {statCards.map((stat, index) => (
                  <div 
                    key={index} 
                    className={`${stat.bgClass} rounded-xl px-4 sm:px-6 py-4 sm:py-5 transition-all shadow-sm flex items-center justify-between`}
                  >
                    <div>
                      <p className={`text-2xl sm:text-3xl font-bold ${stat.label === 'Total Clients' ? '' : 'text-emerald-900'} mb-1`}>
                        {stat.value}
                      </p>
                      <p className={`text-xs sm:text-sm font-medium ${stat.label === 'Total Clients' ? 'text-emerald-100' : 'text-slate-600'}`}>
                        {stat.label}
                      </p>
                    </div>
                    <stat.icon className={`w-6 h-6 ${stat.label === 'Total Clients' ? 'text-emerald-300' : 'text-slate-400'}`} />
                  </div>
                ))}
              </section>

              {/* --- FILTERS & TABLE CONTAINER --- */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden skeleton-fade-in">
                
                {/* Filter Tabs */}
                <div className="border-b border-slate-200 px-4 sm:px-6 py-4 bg-slate-50/30 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        py-2.5 px-4 text-sm font-medium rounded-lg transition-colors border shadow-sm
                        ${activeTab === tab.id 
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }
                      `}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Client table */}
                {clients.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-slate-600 bg-slate-50 border-b border-slate-200">
                        <tr>
                          {['Name', 'Barangay', 'Registered', 'Verification', 'Account', ''].map((heading) => (
                            <th key={heading} className="px-6 py-3.5 font-semibold uppercase tracking-wider text-xs">{heading}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {clients.map((client) => (
                          <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-700">{client.full_name}</td>
                            <td className="px-6 py-4 text-slate-600">{client.barangay}</td>
                            <td className="px-6 py-4 text-slate-600">{new Date(client.created_at).toLocaleDateString()}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${client.verification_status === 'verified' ? 'bg-emerald-100 text-emerald-700' :
                                  client.verification_status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                  client.verification_status === 'rejected' ? 'bg-red-100 text-red-700' :
                                  'bg-slate-100 text-slate-700'
                                }`}>
                                {client.verification_status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${client.account_status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                  client.account_status === 'suspended' ? 'bg-red-100 text-red-700' :
                                  'bg-slate-100 text-slate-700'
                                }`}>
                                {client.account_status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                              <button 
                                onClick={() => setSelectedClientId(client.id)} 
                                className="px-3 py-1.5 border border-slate-200 text-slate-600 text-xs rounded-lg hover:bg-slate-50 transition-colors"
                              >
                                View
                              </button>
                              {client.verification_status === 'pending' && (
                                <>
                                  <button 
                                    onClick={() => verifyClient(client)} 
                                    className="px-3 py-1.5 bg-emerald-700 text-white text-xs rounded-lg hover:bg-emerald-800 transition-colors shadow-sm"
                                  >
                                    Verify
                                  </button>
                                  <button 
                                    onClick={() => rejectClient(client)} 
                                    className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 flex flex-col items-center justify-center text-center py-20 min-h-[400px]">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-5 text-slate-300">
                      <ClipboardList className="w-10 h-10" />
                    </div>
                    <h4 className="text-lg font-semibold text-slate-700">
                      {activeTab === 'total' ? 'No clients registered yet' : `No ${activeTab} clients found`}
                    </h4>
                    <p className="text-sm text-slate-400 max-w-sm mt-1">
                      {activeTab === 'total' 
                        ? "Registered clients and their verification statuses will appear here." 
                        : `There are currently no clients with a "${activeTab}" status.`}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </main>

      {/* ================= CLIENT DETAIL MODAL ================= */}
      {selectedClientId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-emerald-900">Client Account</h2>
              <button 
                onClick={closeModal}
                className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Empty State Placeholder */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                
                {/* 
                BACKEND INTEGRATION NOTE: CLIENT DETAIL MODAL
                
                When the modal opens, map the selected client's data here.
                Example: {selectedClient.name}, {selectedClient.email}
                */}
                
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Client ID</p>
                  <p className="text-sm font-medium text-slate-800">Loading...</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Name</p>
                  <p className="text-sm font-medium text-slate-800">Loading...</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Barangay</p>
                  <p className="text-sm font-medium text-slate-800">Loading...</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                  <p className="text-sm font-medium text-slate-800">Loading...</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</p>
                  <p className="text-sm font-medium text-slate-800">Loading...</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registered Pets</p>
                  <p className="text-sm font-medium text-slate-800">Loading...</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registration Date</p>
                  <p className="text-sm font-medium text-slate-800">Loading...</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verification Status</p>
                  <div className="mt-0.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Verified
                    </span>
                  </div>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Status</p>
                  <div className="mt-0.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Active
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50/50">
              <button 
                onClick={closeModal}
                className="px-5 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
              >
                Close
              </button>
              <button className="px-5 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm">
                Suspend Account
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