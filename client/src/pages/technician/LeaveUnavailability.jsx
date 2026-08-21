import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import { 
  Calendar, 
  CalendarDays, 
  Bell, 
  Clock, 
  LogOut, 
  PawPrint,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

/**
 * ============================================================
 * COMPONENT: Sidebar
 * PURPOSE: Navigation menu. Matches the 'Leave' active state.
 * ============================================================
 */
const Sidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const displayName = user?.full_name || user?.fullName || user?.email || 'Technician';
  const menuItems = [
    { id: 'Dashboard', icon: CalendarDays, label: 'Dashboard' },
    { id: 'Appointments', icon: Calendar, label: 'Appointments' },
    { id: 'Schedule', icon: CalendarDays, label: 'Weekly Schedule' },
    { id: 'Notifications', icon: Bell, label: 'Notifications', badge: 1 }, // Updated badge to match image
    { id: 'Leave', icon: Clock, label: 'Leave / Unavailability' },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col justify-between fixed left-0 top-0 z-20">
      <div>
        {/* Logo Section */}
        <div className="p-6 pb-8">
          <div className="flex items-center gap-3">
            <div className="bg-[#1C5B56] p-2 rounded-xl text-white">
              <PawPrint size={24} />
            </div>
            <div>
              <h1 className="font-bold text-[#1C5B56] text-lg leading-tight">City Vet</h1>
              <p className="text-[10px] text-gray-400 font-medium tracking-wide">Technician Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
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

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-[#1C5B56] text-white flex items-center justify-center font-bold text-sm">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-sm font-bold text-gray-700">{displayName}</span>
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
 * MAIN COMPONENT: LeaveUnavailability
 * ============================================================
 */
function LeaveUnavailability() {
  const [activeTab, setActiveTab] = useState('Leave');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.startDate || !formData.endDate || !formData.reason.trim()) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    if (new Date(`${formData.endDate}T00:00:00`) < new Date(`${formData.startDate}T00:00:00`)) {
      setMessage({ type: 'error', text: 'End date cannot be earlier than start date.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await API.post('/technicians/leave', {
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason.trim(),
      });

      setMessage({ type: 'success', text: 'Leave request submitted successfully. Admin review is pending.' });
      setFormData({ startDate: '', endDate: '', reason: '' });
    } catch (error) {
      const apiMessage = error?.response?.data?.error || 'Unable to submit leave request right now.';
      setMessage({ type: 'error', text: apiMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7F6] font-sans flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 p-8">
        <div className="max-w-3xl mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Leave / Unavailability</h1>
            <p className="text-gray-400 text-sm mt-1">Request time off or declare unavailability</p>
          </div>

          {/* Important Notice Banner */}
          <div className="bg-[#FFF8EB] border border-[#FCEFDB] rounded-xl p-5 mb-6 flex gap-3">
            <div className="text-[#D99B4D] mt-1">
              <AlertCircle size={18} />
            </div>
            <div>
              <h3 className="font-bold text-[#D99B4D] text-sm mb-1">Important Notice</h3>
              <p className="text-[#A87B45] text-sm leading-relaxed">
                When your leave affects existing appointments, the administrator will handle reassignment. You will not be able to manually reassign appointments from this portal.
              </p>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1C5B56] focus:border-transparent text-sm"
                  required
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1C5B56] focus:border-transparent text-sm"
                  required
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Describe the reason for your leave or unavailability..."
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1C5B56] focus:border-transparent text-sm resize-none"
                  required
                />
              </div>

              {message.text && (
                <div className={`rounded-lg border px-3 py-2 text-sm ${message.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                  {message.text}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#8EB5B0] hover:bg-[#7AA5A0] text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <span>{loading ? 'Submitting...' : 'Submit Leave Request'}</span>
                <ArrowRight size={18} />
              </button>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeaveUnavailability;