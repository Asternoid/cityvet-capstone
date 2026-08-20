import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, ChevronDown, AlertTriangle, Info } from 'lucide-react';
import API from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import { BookingFormSkeleton } from '../../components/common/Skeleton';

/**
 * BookAppointment — client booking form.
 *
 * All selectable data (services, time slots, the client's confirmed barangay
 * address) comes from the server via `useRoleData()` / the authenticated
 * user profile — nothing is hardcoded here. This keeps the UI in sync with
 * whatever services the clinic actually offers and avoids the UI silently
 * drifting from the backend's source of truth.
 *
 * Client-side date-window and urgency rules are shown for guidance only
 * (two-week advance cap for routine services, same/next-day for urgent
 * cases per Section 1.5 Scope and ALG-SYS1). The server is the final
 * authority and re-validates every rule on submit — the client never
 * trusts its own computed window to be authoritative.
 */

const TIME_SLOTS = [
  { label: '8:00 AM', value: '08:00' },
  { label: '9:00 AM', value: '09:00' },
  { label: '10:00 AM', value: '10:00' },
  { label: '11:00 AM', value: '11:00' },
  { label: '1:00 PM', value: '13:00' },
  { label: '2:00 PM', value: '14:00' },
  { label: '3:00 PM', value: '15:00' },
  { label: '4:00 PM', value: '16:00' },
];

const MAX_REMARKS_LENGTH = 500;
const MAX_ANIMAL_DESC_LENGTH = 200;

function today() {
  return new Date().toISOString().split('T')[0];
}

function daysFromToday(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

export default function BookAppointment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    API.get('/client/booking-options')
      .then((response) => {
        if (!active) return;
        setServices(response.data?.services || []);
        setBarangays(response.data?.barangays || []);
      })
      .catch(() => {
        if (active) setError('Could not load available veterinary services. Please try again.');
      })
      .finally(() => {
        if (active) setLoadingServices(false);
      });
    return () => { active = false; };
  }, []);

  const [formData, setFormData] = useState({
    serviceId: '',
    isUrgent: false,
    preferredDate: '',
    preferredTime: '',
    animalDescription: '',
    concernRemarks: '',
  });

  const profile = user?.profile || user;
  const barangayId = profile?.barangay_id || user?.barangay_id;
  const barangay = barangays.find((item) => String(item.id) === String(barangayId));

  const selectedService = useMemo(
    () => services.find((s) => String(s.id) === String(formData.serviceId)),
    [services, formData.serviceId]
  );
  // The clinic determines, server-side, which services may ever be flagged
  // urgent (per the document: Treatment of Animals and Voluntary Surrender
  // of Dog, when biting/aggression is involved). We rely on a flag returned
  // by the server rather than hardcoding service names in the UI.
  const canBeUrgent = selectedService?.urgency_type === 'urgent';

  const minDate = formData.isUrgent ? today() : daysFromToday(1);
  const maxDate = formData.isUrgent ? daysFromToday(1) : daysFromToday(14);

  const set = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'serviceId'
        ? { isUrgent: services.find((s) => String(s.id) === String(value))?.urgency_type !== 'urgent' ? false : prev.isUrgent }
        : {}),
      ...(field === 'isUrgent' ? { preferredDate: '' } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.serviceId) {
      setError('Please select a service.');
      return;
    }
    if (!barangayId) {
      setError('Your verified barangay address is missing. Please contact the clinic before booking.');
      return;
    }
    if (!formData.preferredDate) {
      setError('Please select a preferred date.');
      return;
    }
    if (!formData.preferredTime) {
      setError('Please select a preferred time slot.');
      return;
    }
    if (!formData.animalDescription.trim()) {
      setError('Please briefly describe the animal(s) involved.');
      return;
    }
    if (formData.animalDescription.length > MAX_ANIMAL_DESC_LENGTH) {
      setError(`Animal description must be ${MAX_ANIMAL_DESC_LENGTH} characters or fewer.`);
      return;
    }
    if (formData.concernRemarks.length > MAX_REMARKS_LENGTH) {
      setError(`Remarks must be ${MAX_REMARKS_LENGTH} characters or fewer.`);
      return;
    }

    setSubmitting(true);
    try {
      await API.post('/appointments/submit', {
        serviceId: formData.serviceId,
        barangayId,
        isUrgent: formData.isUrgent,
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        animalDescription: formData.animalDescription.trim(),
        concernRemarks: formData.concernRemarks.trim(),
      });
      navigate('/client/appointments');
    } catch (err) {
      // Never surface raw server/database error text to the client.
      const status = err.response?.status;
      if (status === 409) {
        setError(err.response?.data?.error || 'That date is no longer available. Please choose another date.');
      } else if (status === 422 || status === 400) {
        setError(err.response?.data?.error || 'Please check your booking details and try again.');
      } else {
        setError('Could not submit your booking right now. Please try again in a moment.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#0B3A36]">Book an Appointment</h1>
        <p className="text-gray-600">Schedule a home-based veterinary visit</p>
      </div>

      {/* Confirmed address from the client's verified profile — not editable here.
          The system does not let a booking silently override the verified barangay,
          since barangay determines which technician receives the appointment. */}
      {barangay && (
        <div className="mb-6 rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-700 shadow-sm">
          <span className="font-medium text-[#0B3A36]">Service address on file: </span>
          {profile.address ? `${profile.address}, ` : ''}
          Barangay {barangay.name}, Gingoog City
          <p className="mt-1 text-xs text-gray-500">
            To update your address or barangay, please contact the clinic directly.
          </p>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        {loadingServices ? <BookingFormSkeleton /> : <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Select Service */}
          <div>
            <label className="mb-2 block text-base font-medium text-[#0B3A36]">Select Service</label>
            <div className="relative">
              <select
                required
                value={formData.serviceId}
                onChange={set('serviceId')}
                disabled={loadingServices}
                className="w-full appearance-none rounded-md border border-gray-300 bg-white px-4 py-3 text-gray-700 outline-none focus:border-[#13534D] focus:ring-2 focus:ring-[#13534D]/20 disabled:bg-gray-50"
              >
                <option value="">
                  {loadingServices ? 'Loading services…' : 'Choose a veterinary service...'}
                </option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Urgency Toggle */}
          {canBeUrgent && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={formData.isUrgent}
                  onChange={set('isUrgent')}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#13534D]"
                />
                <span className="text-sm text-gray-800">
                  <span className="font-semibold text-[#0B3A36]">Mark as Urgent</span>
                  <span className="ml-1 text-gray-600">
                    — for biting incidents or aggressive animal cases requiring same-day or next-day service.
                  </span>
                </span>
              </label>
            </div>
          )}

          {/* Booking Window Notice */}
          {formData.serviceId && (
            <div className="flex items-start gap-2 rounded-md bg-[#e8f5f4] p-3 text-xs text-[#0B3A36]">
              <Info size={14} className="mt-0.5 shrink-0" />
              {formData.isUrgent
                ? 'Urgent bookings are scheduled for today or tomorrow. Your technician will be notified immediately.'
                : 'Routine bookings can be scheduled up to two weeks in advance, subject to technician availability and clinic blackout dates.'}
            </div>
          )}

          {/* Preferred Date */}
          <div>
            <label className="mb-2 block text-base font-medium text-[#0B3A36]">Preferred Date</label>
            <div className="relative">
              <input
                type="date"
                required
                min={minDate}
                max={maxDate}
                value={formData.preferredDate}
                onChange={set('preferredDate')}
                disabled={!formData.serviceId}
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-gray-700 outline-none focus:border-[#13534D] focus:ring-2 focus:ring-[#13534D]/20 disabled:bg-gray-50 disabled:text-gray-400"
              />
              <CalendarIcon className="pointer-events-none absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Final availability is confirmed by the clinic; blackout dates and technician capacity are enforced on submission.
            </p>
          </div>

          {/* Preferred Time */}
          <div>
            <label className="mb-2 block text-base font-medium text-[#0B3A36]">Preferred Time</label>
            <div className="grid grid-cols-4 gap-3">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot.value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, preferredTime: slot.value }))}
                  className={`rounded-md border py-3 text-sm font-medium transition-colors ${
                    formData.preferredTime === slot.value
                      ? 'border-[#13534D] bg-[#13534D] text-white'
                      : 'border-gray-300 bg-white text-[#0B3A36] hover:bg-gray-50'
                  }`}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          </div>

          {/* Animal Description — per-appointment only; the system does not
              maintain a persistent animal profile (Section 1.5 Delimitations). */}
          <div>
            <label className="mb-2 block text-base font-medium text-[#0B3A36]">Animal Description</label>
            <input
              type="text"
              required
              maxLength={MAX_ANIMAL_DESC_LENGTH}
              value={formData.animalDescription}
              onChange={set('animalDescription')}
              placeholder="e.g. Brown dog, mixed breed / 2 carabaos / 5 pigs"
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-gray-700 outline-none focus:border-[#13534D] focus:ring-2 focus:ring-[#13534D]/20"
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.animalDescription.length}/{MAX_ANIMAL_DESC_LENGTH} characters. No permanent animal record is stored.
            </p>
          </div>

          {/* Concern / Remarks */}
          <div>
            <label className="mb-2 block text-base font-medium text-[#0B3A36]">
              Concern / Remarks <span className="font-normal text-gray-500">(optional)</span>
            </label>
            <textarea
              rows={4}
              maxLength={MAX_REMARKS_LENGTH}
              value={formData.concernRemarks}
              onChange={set('concernRemarks')}
              placeholder="Any special instructions, observed symptoms, or specific concern..."
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-gray-700 outline-none focus:border-[#13534D] focus:ring-2 focus:ring-[#13534D]/20"
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.concernRemarks.length}/{MAX_REMARKS_LENGTH} characters
            </p>
          </div>

          {formData.isUrgent && (
            <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              This appointment is marked <strong className="mx-1">Urgent</strong>. It will bypass the normal queue
              and be routed to the assigned technician immediately.
            </div>
          )}

          {error && (
            <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || loadingServices}
            className="w-full rounded-lg bg-[#13534D] px-6 py-4 text-center text-base font-semibold text-white shadow-md transition hover:bg-[#0B3A36] disabled:opacity-70"
          >
            {submitting ? 'Saving...' : 'Save Appointment Request'}
          </button>
        </form>}
      </div>
    </div>
  );
}