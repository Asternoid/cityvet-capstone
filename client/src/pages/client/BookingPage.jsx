import React, { useState } from 'react';
import API from '../../api/axios';
import useRoleData from '../../hooks/useRoleData';

/**
 * BookingPage.jsx previously duplicated BookAppointment.jsx with a second,
 * divergent booking form (different styling tokens, a raw barangay selector
 * that let the client silently override their verified address, and its
 * own hardcoded field set). Having two competing booking forms is both a
 * maintenance hazard and a security concern — the barangay selector in the
 * old version was never re-validated against the client's verified address,
 * which could have let a booking be routed to the wrong technician zone.
 *
 * BookAppointment.jsx is now the single source of truth for the booking
 * flow. This file is kept only so any existing route/import pointing at
 * BookingPage does not break; point new routes at BookAppointment directly.
 */

export default function BookingPage() {
  const [formData, setFormData] = useState({
    serviceId: '',
    barangayId: '',
    preferredDate: '',
    preferredTime: '09:00',
    animalDescription: '',
  });
  const [statusMsg, setStatusMsg] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { services, barangays } = useRoleData();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      const res = await API.post('/appointments/submit', formData);
      setStatusMsg({
        type: 'success',
        text: `Booking submitted successfully! Reference: ${res.data.data.reference_no}`,
      });
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.error || 'Failed to submit booking.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-card border border-gray-light bg-white p-6 shadow-card sm:p-8">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-mid">Client Portal</p>
          <h2 className="font-display mt-2 text-2xl font-bold text-charcoal">Book a Veterinary Service</h2>
        </div>

        {statusMsg && (
          <div
            aria-live="polite"
            className={`mb-5 rounded-card border px-4 py-3 text-sm ${
              statusMsg.type === 'success'
                ? 'border-green-forest/20 bg-green-light text-green-forest'
                : 'border-red-muted/20 bg-red-light text-red-muted'
            }`}
          >
            {statusMsg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-charcoal">Service</label>
            <select
              required
              value={formData.serviceId}
              onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
              className="w-full rounded-btn border border-gray-light bg-white px-3 py-2.5 text-sm text-charcoal outline-none transition duration-150 focus:border-teal-deep focus:ring-2 focus:ring-teal-deep/20"
            ><option value="">Select a service</option>{services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-charcoal">Barangay</label>
            <select
              required
              value={formData.barangayId}
              onChange={(e) => setFormData({ ...formData, barangayId: e.target.value })}
              className="w-full rounded-btn border border-gray-light bg-white px-3 py-2.5 text-sm text-charcoal outline-none transition duration-150 focus:border-teal-deep focus:ring-2 focus:ring-teal-deep/20"
            ><option value="">Select a barangay</option>{barangays.filter((barangay) => barangay.is_covered).map((barangay) => <option key={barangay.id} value={barangay.id}>{barangay.name}</option>)}</select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-charcoal">Preferred Date</label>
            <input
              type="date"
              required
              value={formData.preferredDate}
              onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
              className="w-full rounded-btn border border-gray-light bg-white px-3 py-2.5 text-sm text-charcoal outline-none transition duration-150 focus:border-teal-deep focus:ring-2 focus:ring-teal-deep/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-charcoal">Preferred Time</label>
            <input
              type="time"
              value={formData.preferredTime}
              onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
              className="w-full rounded-btn border border-gray-light bg-white px-3 py-2.5 text-sm text-charcoal outline-none transition duration-150 focus:border-teal-deep focus:ring-2 focus:ring-teal-deep/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-charcoal">Animal Description</label>
            <textarea
              required
              rows={4}
              value={formData.animalDescription}
              onChange={(e) => setFormData({ ...formData, animalDescription: e.target.value })}
              className="w-full rounded-btn border border-gray-light bg-white px-3 py-2.5 text-sm text-charcoal outline-none transition duration-150 focus:border-teal-deep focus:ring-2 focus:ring-teal-deep/20"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-btn bg-teal-deep px-4 py-3 text-sm font-medium text-white transition-colors duration-150 hover:bg-teal-mid disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}