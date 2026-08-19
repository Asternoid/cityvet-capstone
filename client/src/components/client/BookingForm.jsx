import React, { useMemo, useState } from 'react';
import Button from '../common/Button';
import { getDefaultDateInputValue, isPastDate } from '../../utils/dateUtils';

const defaultServices = [
  'Rabies Vaccination',
  'Deworming',
  'Check-up',
  'Treatment of Animals',
  'Spaying / Neutering',
];

export default function BookingForm({ initialValues, onSubmit, submitting = false }) {
  const [form, setForm] = useState({
    petName: initialValues?.petName || '',
    petType: initialValues?.petType || 'Dog',
    breed: initialValues?.breed || '',
    age: initialValues?.age || '',
    service: initialValues?.service || defaultServices[0],
    preferredDate: initialValues?.preferredDate || getDefaultDateInputValue(1),
    preferredTime: initialValues?.preferredTime || '09:00',
    medicalNotes: initialValues?.medicalNotes || '',
  });
  const [error, setError] = useState('');

  const minDate = useMemo(() => getDefaultDateInputValue(0), []);

  const handleChange = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.petName.trim() || !form.breed.trim() || !form.age.trim()) {
      setError('Please complete the pet details before booking.');
      return;
    }

    if (!form.preferredDate) {
      setError('Please select a preferred appointment date.');
      return;
    }

    if (isPastDate(form.preferredDate)) {
      setError('Please choose a future appointment date.');
      return;
    }

    const payload = {
      petName: form.petName.trim(),
      petType: form.petType,
      breed: form.breed.trim(),
      age: form.age.trim(),
      service: form.service,
      preferredDate: form.preferredDate,
      preferredTime: form.preferredTime,
      animalDescription: `${form.petType} - ${form.breed} (${form.age})`,
      medicalNotes: form.medicalNotes.trim(),
    };

    try {
      await onSubmit?.(payload);
    } catch (submitError) {
      setError(submitError.message || 'Unable to submit appointment.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-card border border-gray-light bg-white p-6 shadow-card sm:p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-charcoal">Pet Name</label>
          <input
            value={form.petName}
            onChange={(event) => handleChange('petName', event.target.value)}
            className="w-full rounded-btn border border-gray-light bg-white px-3 py-2.5 text-sm text-charcoal outline-none focus:border-teal-deep focus:ring-2 focus:ring-teal-deep/20"
            placeholder="e.g. Milo"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-charcoal">Pet Type</label>
          <select
            value={form.petType}
            onChange={(event) => handleChange('petType', event.target.value)}
            className="w-full rounded-btn border border-gray-light bg-white px-3 py-2.5 text-sm text-charcoal outline-none focus:border-teal-deep focus:ring-2 focus:ring-teal-deep/20"
          >
            {['Dog', 'Cat', 'Bird', 'Other'].map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-charcoal">Breed</label>
          <input
            value={form.breed}
            onChange={(event) => handleChange('breed', event.target.value)}
            className="w-full rounded-btn border border-gray-light bg-white px-3 py-2.5 text-sm text-charcoal outline-none focus:border-teal-deep focus:ring-2 focus:ring-teal-deep/20"
            placeholder="e.g. Labrador"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-charcoal">Age</label>
          <input
            value={form.age}
            onChange={(event) => handleChange('age', event.target.value)}
            className="w-full rounded-btn border border-gray-light bg-white px-3 py-2.5 text-sm text-charcoal outline-none focus:border-teal-deep focus:ring-2 focus:ring-teal-deep/20"
            placeholder="e.g. 2 years"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-charcoal">Service</label>
          <select
            value={form.service}
            onChange={(event) => handleChange('service', event.target.value)}
            className="w-full rounded-btn border border-gray-light bg-white px-3 py-2.5 text-sm text-charcoal outline-none focus:border-teal-deep focus:ring-2 focus:ring-teal-deep/20"
          >
            {defaultServices.map((service) => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-charcoal">Preferred Date</label>
          <input
            type="date"
            min={minDate}
            value={form.preferredDate}
            onChange={(event) => handleChange('preferredDate', event.target.value)}
            className="w-full rounded-btn border border-gray-light bg-white px-3 py-2.5 text-sm text-charcoal outline-none focus:border-teal-deep focus:ring-2 focus:ring-teal-deep/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-charcoal">Preferred Time</label>
          <input
            type="time"
            value={form.preferredTime}
            onChange={(event) => handleChange('preferredTime', event.target.value)}
            className="w-full rounded-btn border border-gray-light bg-white px-3 py-2.5 text-sm text-charcoal outline-none focus:border-teal-deep focus:ring-2 focus:ring-teal-deep/20"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-charcoal">Medical Notes</label>
          <textarea
            rows={4}
            value={form.medicalNotes}
            onChange={(event) => handleChange('medicalNotes', event.target.value)}
            className="w-full rounded-btn border border-gray-light bg-white px-3 py-2.5 text-sm text-charcoal outline-none focus:border-teal-deep focus:ring-2 focus:ring-teal-deep/20"
            placeholder="Describe symptoms or concerns for the veterinarian"
          />
        </div>
      </div>

      {error && (
        <div className="mt-5 rounded-card border border-red-light bg-red-light/40 px-4 py-3 text-sm text-red-muted">
          {error}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <Button type="submit" disabled={submitting} className="min-w-48">
          {submitting ? 'Submitting...' : 'Submit Appointment'}
        </Button>
      </div>
    </form>
  );
}
