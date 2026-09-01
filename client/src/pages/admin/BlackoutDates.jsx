import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  UserCheck, 
  Plus, 
  X, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import AdminLayout from '../../components/common/AdminLayout';
import useAdminData from '../../hooks/useAdminData';
import API from '../../api/axios';

export default function BlackoutDates() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ date: '', reason: '' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, date: null, appointments: [] });
  const [dateToDelete, setDateToDelete] = useState(null);

  const { data: blackoutDatesData, loading, error, reload } = useAdminData('/admin/blackout-dates');
  const blackoutDates = Array.isArray(blackoutDatesData) ? blackoutDatesData : [];
  const blackoutSet = new Set(blackoutDates.map((item) => item.date));
  
  const saveBlackoutDate = async () => {
    await API.post('/admin/blackout-dates', form);
    setForm({ date: '', reason: '' });
    setIsModalOpen(false);
    reload();
  };

  const checkAndDeleteBlackoutDate = async (item) => {
    try {
      const response = await API.get(`/admin/appointments?date=${item.date}`);
      const appointments = response.data?.data || [];
      
      if (appointments.length > 0) {
        setConfirmDialog({ 
          open: true, 
          date: item.date,
          appointments: appointments 
        });
        setDateToDelete(item);
      } else {
        await API.delete(`/admin/blackout-dates/${item.id}`);
        reload();
      }
    } catch (err) {
      console.error('Error checking appointments:', err);
      // If check fails, allow deletion anyway
      await API.delete(`/admin/blackout-dates/${item.id}`);
      reload();
    }
  };

  const confirmDelete = async () => {
    if (dateToDelete) {
      await API.delete(`/admin/blackout-dates/${dateToDelete.id}`);
      reload();
      setConfirmDialog({ open: false, date: null, appointments: [] });
      setDateToDelete(null);
    }
  };

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
    <AdminLayout pageTitle="Blackout Dates">
      <div className="p-4 sm:p-6 lg:p-8">
        
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
                          onClick={() => checkAndDeleteBlackoutDate(item)}
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

      {/* ================= CONFIRM DELETION DIALOG ================= */}
      {confirmDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-red-900">Confirm Deletion</h2>
              <button 
                onClick={() => setConfirmDialog({ open: false, date: null, appointments: [] })}
                className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-700">
                There are <strong>{confirmDialog.appointments.length}</strong> existing appointment(s) scheduled on <strong>{confirmDialog.date}</strong>:
              </p>
              
              <div className="max-h-48 overflow-y-auto bg-slate-50 rounded-lg p-4 space-y-2">
                {confirmDialog.appointments.map((apt, idx) => (
                  <div key={idx} className="text-sm text-slate-600 border-l-2 border-amber-300 pl-3">
                    <p className="font-medium">{apt.reference_no}</p>
                    <p className="text-xs text-slate-500">{apt.client} • {apt.service}</p>
                  </div>
                ))}
              </div>

              <p className="text-xs text-red-600 font-medium">
                Warning: Deleting this blackout date will not affect existing appointments. Are you sure?
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50/50">
              <button 
                onClick={() => setConfirmDialog({ open: false, date: null, appointments: [] })}
                className="px-5 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
              >
                Keep Blackout Date
              </button>
              <button 
                onClick={confirmDelete}
                className="px-5 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
              >
                Delete Anyway
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
    </AdminLayout>
  );
}