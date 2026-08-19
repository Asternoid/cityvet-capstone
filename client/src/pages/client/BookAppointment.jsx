import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BookingForm from '../../components/client/BookingForm';
import API from '../../api/axios';

const initialValues = {
  petName: '',
  petType: 'Dog',
  breed: '',
  age: '',
  service: 'Rabies Vaccination',
  preferredDate: '',
  preferredTime: '09:00',
  medicalNotes: '',
};

export default function BookAppointment() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      const response = await API.post('/appointments/submit', payload);
      const data = response.data?.data || response.data;
      const reference = data?.reference_no || data?.reference || 'APT-NEW';
      navigate('/client/appointments', { state: { successMessage: `Appointment submitted successfully. Reference: ${reference}` } });
    } catch (error) {
      const message = error.response?.data?.error || 'Unable to submit appointment. Please try again.';
      throw new Error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-mid">Client Portal</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-charcoal">Book Appointment</h1>
      </div>
      <BookingForm initialValues={initialValues} onSubmit={handleSubmit} submitting={submitting} />
    </div>
  );
}
