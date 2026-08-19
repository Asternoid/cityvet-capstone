import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';

export default function CancelModal({ open, appointment, onClose, onSubmit }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError('Please provide a cancellation reason.');
      return;
    }

    try {
      await onSubmit?.({ id: appointment?.id, reason: reason.trim() });
      onClose?.();
    } catch (submitError) {
      setError(submitError.message || 'Unable to cancel this appointment.');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cancel Appointment"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} type="button">Keep Appointment</Button>
          <Button variant="danger" onClick={handleSubmit} type="button">Cancel Appointment</Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-mid">Let us know why you need to cancel this {appointment?.service || 'appointment'}.</p>
        <textarea
          rows={4}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className="w-full rounded-btn border border-gray-light bg-white px-3 py-2.5 text-sm text-charcoal outline-none focus:border-teal-deep focus:ring-2 focus:ring-teal-deep/20"
          placeholder="Type or select a reason"
        />
        {error && <p className="text-sm text-red-muted">{error}</p>}
      </div>
    </Modal>
  );
}
