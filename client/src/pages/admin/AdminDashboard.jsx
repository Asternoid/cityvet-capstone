import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck } from 'lucide-react';
import useAdminData from '../../hooks/useAdminData';
import AdminLayout from '../../components/common/AdminLayout';

export default function Dashboard() {
  const { data: dashboardData, loading: isLoading, error } = useAdminData('/admin/dashboard');

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
    <AdminLayout pageTitle="Dashboard">
      <div className="p-4 sm:p-6 lg:p-8">
          
          {/* Date / Greeting - Always visible */}
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-sm text-slate-500 font-medium">{new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
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
                    <Link to="/admin/appointments" className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 font-medium whitespace-nowrap">View all &rarr;</Link>
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