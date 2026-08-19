import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';

export default function RescheduleModal({ open, appointment, onClose, onSubmit }) {
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('09:00');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!newDate || !newTime) {
      setError('Please choose a new date and time.');
      return;
    }

    try {
      await onSubmit?.({ id: appointment?.id, newDate, newTime });
      onClose?.();
    } catch (submitError) {
      setError(submitError.message || 'Unable to reschedule this appointment.');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reschedule Appointment"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
          <Button onClick={handleSubmit} type="button">Confirm Reschedule</Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-mid">Select a new date and time for {appointment?.service || 'this appointment'}.</p>
        <div>
          <label className="mb-1 block text-sm font-medium text-charcoal">New Date</label>
          <input
            type="date"
            value={newDate}
            onChange={(event) => setNewDate(event.target.value)}
            className="w-full rounded-btn border border-gray-light bg-white px-3 py-2.5 text-sm text-charcoal outline-none focus:border-teal-deep focus:ring-2 focus:ring-teal-deep/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-charcoal">New Time</label>
          <input
            type="time"
            value={newTime}
            onChange={(event) => setNewTime(event.target.value)}
            className="w-full rounded-btn border border-gray-light bg-white px-3 py-2.5 text-sm text-charcoal outline-none focus:border-teal-deep focus:ring-2 focus:ring-teal-deep/20"
          />
        </div>
        {error && <p className="text-sm text-red-muted">{error}</p>}
      </div>
    </Modal>
  );
}
