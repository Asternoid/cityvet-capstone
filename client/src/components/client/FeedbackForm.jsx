import React, { useState } from 'react';
import Button from '../common/Button';

export default function FeedbackForm({ appointment, onSubmit }) {
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!comments.trim()) {
      setError('Please share a note about your visit before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit?.({ rating, comments: comments.trim() });
      setSubmitted(true);
    } catch (submitError) {
      setError(submitError.message || 'Something went wrong while sending your feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-card border border-gray-light bg-white p-6 shadow-card">
        <p className="text-lg font-semibold text-charcoal">Thank you for your feedback.</p>
        <p className="mt-2 text-sm text-gray-mid">Your response has been recorded for {appointment?.service || 'this appointment'}.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-card border border-gray-light bg-white p-6 shadow-card">
      <div className="mb-5">
        <p className="text-sm text-gray-mid">How would you rate your visit?</p>
        <div className="mt-3 flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className={`flex h-10 w-10 items-center justify-center rounded-full border text-lg font-bold ${
                value <= rating ? 'border-amber-warm bg-amber-light text-amber-warm' : 'border-gray-light bg-white text-gray-mid'
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-charcoal">Comments</label>
        <textarea
          rows={5}
          value={comments}
          onChange={(event) => setComments(event.target.value)}
          className="w-full rounded-btn border border-gray-light bg-white px-3 py-2.5 text-sm text-charcoal outline-none focus:border-teal-deep focus:ring-2 focus:ring-teal-deep/20"
          placeholder="Tell us about the service quality, staff behavior, and care provided."
        />
      </div>

      {error && (
        <div className="mt-4 rounded-card border border-red-light bg-red-light/40 px-4 py-3 text-sm text-red-muted">
          {error}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <Button type="submit" disabled={submitting} className="min-w-40">
          {submitting ? 'Submitting...' : 'Send Feedback'}
        </Button>
      </div>
    </form>
  );
}
