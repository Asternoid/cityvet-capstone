import assert from 'assert';
import { validateBookingRequest } from '../src/services/autoAssignment.service.js';

const formatDate = (daysAhead) => {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().slice(0, 10);
};

(async () => {
  try {
    const routineDate = formatDate(5);
    const urgentDate = formatDate(2);

    validateBookingRequest({ preferredDate: routineDate, service: { urgency_type: 'routine' } });
    validateBookingRequest({ preferredDate: urgentDate, service: { urgency_type: 'urgent' } });

    console.log('Booking rules test passed: routine and urgent bookings within valid windows are accepted');
    process.exit(0);
  } catch (error) {
    console.error('Booking rules test failed:', error.message);
    process.exit(2);
  }
})();
