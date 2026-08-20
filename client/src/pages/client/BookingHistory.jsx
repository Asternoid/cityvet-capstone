import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus, AlertCircle } from 'lucide-react';
import API from '../../api/axios';
import { BookingHistorySkeleton } from '../../components/common/Skeleton';

/**
 * BookingHistory — "My Appointments".
 *
 * Data is always fetched from the authenticated /appointments/my endpoint,
 * which the server scopes to the logged-in client's own records. Search and
 * status filtering are sent to the server as query parameters (rather than
 * fetching everything and filtering in the browser) so the client can never
 * be tricked into rendering another client's data by manipulating local
 * state, and so result sets stay bounded regardless of history size.
 */

const STATUS_OPTIONS = [
  'All Statuses',
  'Pending Technician Confirmation',
  'Technician Confirmed',
  'In Progress',
  'Completed',
  'No-Show',
];

const STATUS_COLORS = {
  'Pending Technician Confirmation': 'bg-yellow-100 text-yellow-800',
  'Technician Confirmed': 'bg-[#e8f5f4] text-[#13534D]',
  'In Progress': 'bg-blue-100 text-blue-800',
  Completed: 'bg-green-100 text-green-800',
  'No-Show': 'bg-red-100 text-red-700',
};

const SEARCH_DEBOUNCE_MS = 350;
const MAX_SEARCH_LENGTH = 100;

export default function BookingHistory() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  const fetchAppointments = useCallback(async (searchTerm, status) => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim().slice(0, MAX_SEARCH_LENGTH);
      if (status && status !== 'All Statuses') params.status = status;

      const res = await API.get('/appointments/my', { params });
      setAppointments(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      setError('Could not load your appointment history. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchAppointments(search, statusFilter);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#0B3A36]">Booking History</h1>
        <p className="text-gray-600">All your past and upcoming appointment records</p>
      </div>

      {/* Filters Row */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={search}
            maxLength={MAX_SEARCH_LENGTH}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by service, animal, status..."
            className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-[#13534D] focus:ring-2 focus:ring-[#13534D]/20"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none rounded-md border border-gray-300 bg-white py-2 pl-8 pr-8 text-sm outline-none focus:border-[#13534D]"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <Link
            to="/client/book"
            className="flex items-center gap-2 rounded-md bg-[#13534D] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0B3A36]"
          >
            <Plus size={16} /> New Booking
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          <button onClick={() => fetchAppointments(search, statusFilter)} className="ml-auto font-semibold underline">
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      {loading ? <BookingHistorySkeleton /> : <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Service</th>
              <th className="px-6 py-4">Animal</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Reference No.</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {appointments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                  No appointments found.
                </td>
              </tr>
            ) : (
              appointments.map((appt) => (
                <tr key={appt.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-700">{appt.preferred_date}</td>
                  <td className="px-6 py-4 font-medium text-[#0B3A36]">{appt.service_name}</td>
                  <td className="px-6 py-4 text-gray-600">{appt.animal_description}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        STATUS_COLORS[appt.status] || 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {appt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{appt.reference_no}</td>
                  <td className="px-6 py-4">
                    <Link to={`/client/appointments/${appt.id}`} className="font-medium text-[#13534D] hover:underline">
                      View →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>}
    </div>
  );
}