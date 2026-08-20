import React from 'react';
import { useLocation } from 'react-router-dom';
import FeedbackForm from '../../components/client/FeedbackForm';
import API from '../../api/axios';
import useRoleData from '../../hooks/useRoleData';

export default function SubmitFeedback() {
  const location = useLocation();
  const { appointments, loading } = useRoleData();
  const appointment = location.state?.appointment || appointments.find((item) => item.status === 'completed');

  const handleSubmit = async ({ rating, comments }) => {
    await API.post('/feedback/submit', {
      appointmentId: appointment.id,
      rating,
      feedbackText: comments,
    });
  };

  if (loading) return <div className="p-8"><p className="text-sm text-gray-mid">Loading completed appointments...</p></div>;
  if (!appointment) return <div className="p-8"><p className="text-sm text-gray-mid">No completed appointment is available for feedback.</p></div>;

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
