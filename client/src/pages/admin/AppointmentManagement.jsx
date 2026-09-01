import React, { useState } from 'react';
import { 
  Search, 
  AlertTriangle, 
  ChevronRight, 
  Plus,
  Calendar
} from 'lucide-react';
import AdminLayout from '../../components/common/AdminLayout';
import useAdminData from '../../hooks/useAdminData';
import API from '../../api/axios';

export default function AppointmentManagement() {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  const statusFilter = activeTab === 'exceptions' ? 'reassignment_needed' : activeTab === 'all' ? 'all' : activeTab;
  const { data: appointmentsData, loading, error, reload } = useAdminData('/admin/appointments', { status: statusFilter, search });
  const { data: reassignmentQueueData, loading: queueLoading } = useAdminData('/admin/reassignment-queue', {
    from: new Date().toISOString().slice(0, 10),
    to: new Date().toISOString().slice(0, 10),
  });
  const appointments = Array.isArray(appointmentsData) ? appointmentsData : [];
  const reevaluationQueue = Array.isArray(reassignmentQueueData) ? reassignmentQueueData : [];
  const exceptionCount = reevaluationQueue.length;

  const assignAppointment = async (appointment) => {
    const technicianId = window.prompt('Enter the technician user ID to assign:');
    if (!technicianId) return;
    await API.post(`/admin/appointments/${appointment.id}/reassign`, { technicianId });
    reload();
  };

  const assignRecommendedTechnician = async (appointment, technicianId) => {
    if (!technicianId) return;
    await API.post(`/admin/appointments/${appointment.id}/reassign`, { technicianId, reason: 'Recommended replacement technician selected from reassignment queue.' });
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
    <AdminLayout pageTitle="Appointment Management">
      <div className="p-4 sm:p-6 lg:p-8">
          
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

          {/* --- SKELETON LOADING STATE --- */}
          {loading || queueLoading ? (
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
                  <span className="text-sm font-semibold text-red-700">
                    {exceptionCount > 0 ? `${exceptionCount} appointment${exceptionCount > 1 ? 's' : ''} require immediate attention` : 'No appointments require immediate attention'}
                  </span>
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
                        {appointments.map((appointment) => {
                          const queueItem = reevaluationQueue.find((item) => item.id === appointment.id);
                          const replacementPreview = queueItem?.eligible_replacements?.length ? queueItem.eligible_replacements.join(', ') : null;
                          const replacements = queueItem?.eligible_replacements || [];

                          return (
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
                                <div className="flex flex-col gap-1">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                    ${appointment.status_label === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' :
                                      appointment.status_label === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                      appointment.status_label === 'Completed' ? 'bg-blue-100 text-blue-700' :
                                      appointment.status_label === 'Declined' ? 'bg-red-100 text-red-700' :
                                      'bg-slate-100 text-slate-700'
                                    }`}>
                                    {appointment.status_label}
                                  </span>
                                  {replacementPreview && (
                                    <span className="text-[10px] text-amber-700">
                                      Replacements: {replacementPreview}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                {replacements.length > 0 ? (
                                  <div className="flex flex-col items-end gap-2">
                                    {replacements.slice(0, 2).map((technicianId) => (
                                      <button
                                        key={technicianId}
                                        onClick={() => assignRecommendedTechnician(appointment, technicianId)}
                                        className="px-3 py-1.5 bg-amber-600 text-white text-[11px] font-semibold rounded-lg hover:bg-amber-700 transition-colors shadow-sm"
                                      >
                                        Assign {technicianId}
                                      </button>
                                    ))}
                                    {replacements.length > 2 && (
                                      <span className="text-[10px] text-slate-500">+{replacements.length - 2} more</span>
                                    )}
                                  </div>
                                ) : !appointment.technician_id ? (
                                  <button 
                                    onClick={() => assignAppointment(appointment)}
                                    className="px-3 py-1.5 bg-emerald-700 text-white text-xs font-semibold rounded-lg hover:bg-emerald-800 transition-colors shadow-sm"
                                  >
                                    Assign
                                  </button>
                                ) : null}
                              </td>
                            </tr>
                          );
                        })}
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
    </AdminLayout>
  );
}