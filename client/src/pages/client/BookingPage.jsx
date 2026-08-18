import React, { useState } from 'react';
import API from '../../api/axios';

export default function BookingPage() {
  const [formData, setFormData] = useState({
    serviceId: '',
    barangayId: '',
    preferredDate: '',
    preferredTime: '09:00',
    animalDescription: ''
  });
  const [statusMsg, setStatusMsg] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      const res = await API.post('/appointments/submit', formData);
      setStatusMsg({
        type: 'success',
        text: `Booking submitted successfully! Reference: ${res.data.data.reference_no}`
      });
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.error || 'Failed to submit booking.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '1rem' }}>
      <h2>Book a Veterinary Service</h2>
      {statusMsg && (
        <p style={{ color: statusMsg.type === 'success' ? 'green' : 'red' }}>
          {statusMsg.text}
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Service ID:</label>
          <input
            type="number"
            required
            value={formData.serviceId}
            onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Barangay ID:</label>
          <input
            type="number"
            required
            value={formData.barangayId}
            onChange={(e) => setFormData({ ...formData, barangayId: e.target.value })}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Preferred Date:</label>
          <input
            type="date"
            required
            value={formData.preferredDate}
            onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Animal Description:</label>
          <textarea
            required
            rows={3}
            value={formData.animalDescription}
            onChange={(e) => setFormData({ ...formData, animalDescription: e.target.value })}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <button type="submit" disabled={isSubmitting} style={{ padding: '0.75rem 1.5rem' }}>
          {isSubmitting ? 'Submitting...' : 'Submit Booking'}
        </button>
      </form>
    </div>
  );
}