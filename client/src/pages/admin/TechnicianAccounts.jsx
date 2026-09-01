import React, { useState } from 'react';
import { 
  User, 
  Users, 
  Calendar, 
  UserCheck,
  Eye,
  Search,
  Plus,
  X,
  Edit,
  Trash2,
  MapPin,
  CalendarCheck
} from 'lucide-react';
import AdminLayout from '../../components/common/AdminLayout';
import useAdminData from '../../hooks/useAdminData';
import API from '../../api/axios';

export default function TechnicianManagement() {
  const [activeTab, setActiveTab] = useState('all');
  
  // Barangay Mapping States
  const [barangays, setBarangays] = useState([]);
  const [editingBarangay, setEditingBarangay] = useState(null);
  const [barangayForm, setBarangayForm] = useState({ name: '', technician_id: '' });
  const [showBarangayModal, setShowBarangayModal] = useState(false);

  const statusFilter = activeTab === 'all' ? 'all' : activeTab === 'leave' ? 'on_leave' : activeTab;
  const { data: techniciansData, loading, error } = useAdminData('/admin/technicians', { status: statusFilter });
  const technicians = Array.isArray(techniciansData) ? techniciansData : [];

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
    <AdminLayout pageTitle="Technician Management">
      <div className="p-4 sm:p-6 lg:p-8">
          
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

              {/* --- BARANGAY MAPPING TABLE --- */}
              <div className="mt-8 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden skeleton-fade-in">
                
                {/* Header */}
                <div className="border-b border-slate-200 px-4 sm:px-6 py-4 bg-slate-50/30 flex items-center justify-between">
                  <h4 className="font-semibold text-slate-800">Barangay Service Area Mapping</h4>
                  <button 
                    onClick={() => {
                      setEditingBarangay(null);
                      setBarangayForm({ name: '', technician_id: '' });
                      setShowBarangayModal(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white text-sm font-medium rounded-lg hover:bg-emerald-800 transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Assignment</span>
                  </button>
                </div>

                {/* Table */}
                {barangays.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-slate-500 border-b border-slate-200 bg-slate-50/50">
                        <tr>
                          <th className="px-6 py-3 font-medium">Barangay Name</th>
                          <th className="px-6 py-3 font-medium">Assigned Technician</th>
                          <th className="px-6 py-3 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {barangays.map((barangay) => (
                          <tr key={barangay.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-700">{barangay.name}</td>
                            <td className="px-6 py-4 text-slate-600">
                              {technicians.find(t => t.id === barangay.technician_id)?.full_name || 'Unassigned'}
                            </td>
                            <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                              <button 
                                onClick={() => {
                                  setEditingBarangay(barangay);
                                  setBarangayForm({ name: barangay.name, technician_id: barangay.technician_id });
                                  setShowBarangayModal(true);
                                }}
                                className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={async () => {
                                  if (barangay.id) {
                                    try {
                                      await API.delete(`/admin/barangay-mapping/${barangay.id}`);
                                      setBarangays(barangays.filter(b => b.id !== barangay.id));
                                    } catch (err) {
                                      console.error('Error deleting barangay mapping:', err);
                                    }
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 flex flex-col items-center justify-center text-center py-16">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                      <MapPin className="w-8 h-8" />
                    </div>
                    <h5 className="font-semibold text-slate-700">No barangay mappings yet</h5>
                    <p className="text-xs text-slate-400 max-w-sm mt-1">Add a barangay-to-technician assignment to help optimize service area coverage.</p>
                  </div>
                )}
              </div>
            </>
          )}

        </div>

        {/* Barangay Modal */}
        {showBarangayModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <h2 className="text-xl font-bold text-emerald-900">
                  {editingBarangay ? 'Edit Barangay Assignment' : 'Add Barangay Assignment'}
                </h2>
                <button 
                  onClick={() => setShowBarangayModal(false)}
                  className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                
                {/* Barangay Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Barangay Name</label>
                  <input 
                    type="text"
                    value={barangayForm.name}
                    onChange={(e) => setBarangayForm({ ...barangayForm, name: e.target.value })}
                    placeholder="e.g. Barangay Poblacion" 
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all bg-white"
                  />
                </div>

                {/* Technician Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Assigned Technician</label>
                  <select 
                    value={barangayForm.technician_id}
                    onChange={(e) => setBarangayForm({ ...barangayForm, technician_id: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all bg-white"
                  >
                    <option value="">Select a technician</option>
                    {technicians.map((tech) => (
                      <option key={tech.id} value={tech.id}>{tech.full_name}</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50/50">
                <button 
                  onClick={() => setShowBarangayModal(false)}
                  className="px-5 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    try {
                      if (editingBarangay && editingBarangay.id) {
                        // Update existing
                        await API.put(`/admin/barangay-mapping/${editingBarangay.id}`, barangayForm);
                        setBarangays(barangays.map(b => b.id === editingBarangay.id ? { ...b, ...barangayForm } : b));
                      } else {
                        // Create new
                        const response = await API.post('/admin/barangay-mapping', barangayForm);
                        setBarangays([...barangays, { id: response.data.data?.id, ...barangayForm }]);
                      }
                      setShowBarangayModal(false);
                      setBarangayForm({ name: '', technician_id: '' });
                    } catch (err) {
                      console.error('Error saving barangay mapping:', err);
                    }
                  }}
                  disabled={!barangayForm.name.trim() || !barangayForm.technician_id}
                  className="px-5 py-2 bg-emerald-700 text-white text-sm font-medium rounded-lg hover:bg-emerald-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingBarangay ? 'Update Assignment' : 'Add Assignment'}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Skeleton Styles */}
        <style jsx>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }

          .skeleton {
            background: #e2e8f0;
            background: linear-gradient(90deg, #e2e8f0 0%, #f1f5f9 40%, #e2e8f0 80%);
            background-size: 200% 100%;
            animation: shimmer 1.5s ease-in-out infinite;
            border-radius: 0.25rem;
            min-height: 0.75rem;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(4px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .skeleton-fade-in { animation: fadeIn 0.3s ease-in-out; }

          @media (max-width: 640px) { .skeleton { min-height: 0.625rem; } }
        `}</style>
    </AdminLayout>
  );
}