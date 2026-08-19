import React from 'react';
import { useLocation } from 'react-router-dom';
import FeedbackForm from '../../components/client/FeedbackForm';
import API from '../../api/axios';

export default function SubmitFeedback() {
  const location = useLocation();
  const appointment = location.state?.appointment || {
    id: 'APT-2026-015',
    service: 'Rabies Vaccination',
  };

  const handleSubmit = async ({ rating, comments }) => {
    await API.post('/feedback/submit', {
      appointmentId: appointment.id,
      rating,
      feedbackText: comments,
    });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-mid">Feedback</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-charcoal">Share your visit experience</h1>
      </div>
      <FeedbackForm appointment={appointment} onSubmit={handleSubmit} />
    </div>
  );
}
