import React, { useState, useEffect } from 'react';
import { Calendar, ChevronRight, Plus } from 'lucide-react';
import AdminLayout from '../../components/common/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';

export default function Reports() {
  const { user } = useAuth();
  const [selectedReportId, setSelectedReportId] = useState(null); // No report selected initially
  const [formats, setFormats] = useState({ pdf: true, csv: false }); // PDF selected by default
  const [dateRange, setDateRange] = useState({ 
    from: `${new Date().getFullYear()}-01-01`, 
    to: new Date().toISOString().slice(0, 10) 
  });
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState(null);

  // Report Definitions (The left-hand side list)
  const allReports = [
    { 
      id: 'summary', 
      title: 'Appointment Summary Report', 
      desc: 'Overview of all appointments within the selected period — counts by status, service, and barangay.' 
    },
    { 
      id: 'performance', 
      title: 'Technician Performance Report', 
      desc: 'Technician assignment counts, completion rates, and no-show records.' 
    },
    { 
      id: 'routing', 
      title: 'Routing & Exception Report', 
      desc: 'Summary of declined appointments, failed routings, and technician unavailability incidents.' 
    },
    { 
      id: 'activity', 
      title: 'Client Activity Report', 
      desc: 'Registered client statistics, verification status summary, and appointment frequency.' 
    },
    { 
      id: 'feedback', 
      title: 'Client Feedback & Satisfaction Report', 
      desc: 'Aggregate sentiment data, recurring themes, and satisfaction trend over the selected period.' 
    },
  ];

  // Filter reports based on user role
  const reportTypes = user?.role === 'admin' 
    ? allReports.filter(r => r.id !== 'routing') // Admin sees all except routing
    : user?.role === 'department_head'
    ? allReports // Department head sees all
    : allReports.filter(r => ['summary', 'activity'].includes(r.id)); // Others see limited reports

  // Handle report card click
  const handleSelectReport = (id) => {
    setSelectedReportId(id);
  };

  // Toggle format selection
  const toggleFormat = (format) => {
    setFormats({ pdf: format === 'pdf', csv: format === 'csv' });
  };

  // Find the currently selected report object
  const activeReport = reportTypes.find(r => r.id === selectedReportId);

  const generateReport = async () => {
    setGenerating(true);
    setMessage(null);
    try {
      const response = await API.post('/admin/reports/generate', { 
        type: selectedReportId, 
        ...dateRange, 
        format: formats.csv ? 'csv' : 'pdf' 
      });
      const report = response.data.data;
      if (formats.csv) {
        const lines = [
          ['Reference', 'Client', 'Service', 'Barangay', 'Date', 'Status'],
          ...report.rows.map((row) => [
            row.reference_no, 
            row.client, 
            row.service, 
            row.barangay, 
            row.preferred_date, 
            row.status_label
          ])
        ];
        const blob = new Blob([
          lines.map((line) => 
            line.map((value) => `"${String(value || '').replaceAll('"', '""')}"`).join(',')
          ).join('\n')
        ], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cityvet-${selectedReportId}-${dateRange.from}-${dateRange.to}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        setMessage(`Report generated with ${report.rows.length} records. PDF export can be enabled when the reports storage bucket is configured.`);
      }
    } catch (error) {
      setMessage(error.response?.data?.error || error.message);
    } finally {
      setGenerating(false);
    }
  };

  // Skeleton Components
  const SkeletonReportCard = () => (
    <div className="w-full bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <div className="skeleton h-5 w-48 mb-2" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-3/4 mt-1" />
    </div>
  );

  const SkeletonParametersPanel = () => (
    <div className="w-full lg:w-80 shrink-0 bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-24">
      <div className="skeleton h-5 w-32 border-b border-slate-100 pb-4 mb-4" />
      <div className="space-y-5">
        <div>
          <div className="skeleton h-3 w-24 mb-1.5" />
          <div className="skeleton h-4 w-40" />
        </div>
        <div>
          <div className="skeleton h-3 w-20 mb-1.5" />
          <div className="skeleton h-10 w-full rounded-md" />
        </div>
        <div>
          <div className="skeleton h-3 w-16 mb-1.5" />
          <div className="skeleton h-10 w-full rounded-md" />
        </div>
        <div>
          <div className="skeleton h-3 w-14 mb-1.5" />
          <div className="flex border border-slate-200 rounded-md overflow-hidden">
            <div className="flex-1 skeleton h-10" />
            <div className="flex-1 skeleton h-10 border-l border-slate-200" />
          </div>
        </div>
        <div className="skeleton h-10 w-full rounded-lg mt-2" />
      </div>
    </div>
  );

  return (
    <AdminLayout pageTitle="Reports">
      <div className="p-4 sm:p-6 lg:p-8">
        {/* --- SKELETON LOADING STATE --- */}
        {generating ? (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* LEFT COLUMN: Report Type Selection Skeleton */}
            <div className="flex-1">
              <div className="skeleton h-4 w-40 mb-4" />
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <SkeletonReportCard key={i} />
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN: Report Parameters Skeleton */}
            <SkeletonParametersPanel />
          </div>
        ) : (
          /* --- ACTUAL CONTENT --- */
          <div className="flex flex-col lg:flex-row gap-8 skeleton-fade-in">
            
            {/* LEFT COLUMN: Report Type Selection */}
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Select Report Type</h3>
              
              <div className="space-y-4">
                {reportTypes.map((report) => {
                  const isActive = selectedReportId === report.id;
                  return (
                    <button
                      key={report.id}
                      onClick={() => handleSelectReport(report.id)}
                      className={`
                        w-full text-left bg-white p-4 sm:p-5 rounded-xl border transition-all shadow-sm
                        ${isActive 
                          ? 'border-emerald-700 ring-1 ring-emerald-700 bg-emerald-50/30' 
                          : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                        }
                      `}
                    >
                      <h4 className={`font-semibold text-[15px] ${isActive ? 'text-emerald-900' : 'text-slate-800'}`}>
                        {report.title}
                      </h4>
                      <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{report.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: Report Parameters Panel */}
            <div className="w-full lg:w-80 shrink-0">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-24">
                <h4 className="font-semibold text-slate-800 border-b border-slate-100 pb-4 mb-4">Report Parameters</h4>
                
                <div className="space-y-5">
                  {/* Report Type Display */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Report Type</label>
                    <p className={`text-sm ${activeReport ? 'text-slate-800 font-medium' : 'text-slate-400 italic'}`}>
                      {activeReport ? activeReport.title : 'None selected'}
                    </p>
                  </div>

                  {/* Date From */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Date From</label>
                    <div className="relative">
                      <input 
                        type="date" 
                        value={dateRange.from}
                        onChange={(event) => setDateRange({ ...dateRange, from: event.target.value })}
                        className="w-full pl-3 pr-9 py-2 border border-slate-200 rounded-md text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Date To */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Date To</label>
                    <div className="relative">
                      <input 
                        type="date" 
                        value={dateRange.to}
                        onChange={(event) => setDateRange({ ...dateRange, to: event.target.value })}
                        className="w-full pl-3 pr-9 py-2 border border-slate-200 rounded-md text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Format Toggle */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Format</label>
                    <div className="flex border border-slate-200 rounded-md overflow-hidden">
                      <button 
                        onClick={() => toggleFormat('pdf')}
                        className={`
                          flex-1 py-2 text-sm font-medium transition-colors text-center
                          ${formats.pdf 
                            ? 'bg-emerald-700 text-white'
                            : 'bg-white text-slate-600 hover:bg-slate-50'
                          }
                        `}
                      >
                        PDF
                      </button>
                      <button 
                        onClick={() => toggleFormat('csv')}
                        className={`
                          flex-1 py-2 text-sm font-medium transition-colors text-center border-l border-slate-200
                          ${formats.csv 
                            ? 'bg-emerald-700 text-white'
                            : 'bg-white text-slate-600 hover:bg-slate-50'
                          }
                        `}
                      >
                        CSV
                      </button>
                    </div>
                  </div>

                  {/* Generate Button */}
                  {message && (
                    <p className={`text-xs ${message.includes('Error') ? 'text-red-600' : 'text-slate-500'}`}>
                      {message}
                    </p>
                  )}
                  
                  <button
                    onClick={generateReport}
                    disabled={!activeReport || generating || dateRange.from > dateRange.to}
                    className={`
                      w-full py-2.5 mt-2 rounded-lg text-sm font-medium transition-colors shadow-sm
                      ${activeReport && !generating && dateRange.from <= dateRange.to
                        ? 'bg-emerald-700 text-white hover:bg-emerald-800 cursor-pointer'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }
                    `}
                  >
                    {generating ? 'Generating...' : 'Generate Report'}
                  </button>

                </div>
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
    </AdminLayout>
  );
}