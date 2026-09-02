import { runAutoAssignment, validateBookingRequest, validateBlackoutDate } from '../services/autoAssignment.service.js';
import { supabaseAdmin } from '../config/supabase.js';
import { sendInAppNotification, sendEmailNotification } from '../services/notification.service.js';
import { bookingSchema, sanitizeText, validationError } from '../lib/inputSecurity.js';

const STATUS_LABELS = {
  pending_technician_confirmation: 'Pending Technician Confirmation',
  technician_confirmed: 'Technician Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
  no_show: 'No-Show',
  cancelled: 'Cancelled',
};

function presentAppointment(appointment, serviceName) {
  return {
    ...appointment,
    status_code: appointment.status,
    status: STATUS_LABELS[appointment.status] || appointment.status,
    service_name: serviceName || appointment.service_name || 'Veterinary service',
  };
}

async function getServiceNames(appointments) {
  const serviceIds = [...new Set(appointments.map((appointment) => appointment.service_id).filter(Boolean))];
  if (!serviceIds.length) return new Map();

  const { data, error } = await supabaseAdmin.from('services').select('id, name').in('id', serviceIds);
  if (error) throw error;
  return new Map((data || []).map((service) => [service.id, service.name]));
}

// GET /api/appointments/my
export const listMyAppointments = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('appointments')
      .select('*')
      .eq('client_id', req.user.id)
      .order('preferred_date', { ascending: false });

    if (error) throw error;
    const serviceNames = await getServiceNames(data || []);
    return res.json({ success: true, data: (data || []).map((appointment) => presentAppointment(appointment, serviceNames.get(appointment.service_id))) });
  } catch (err) {
    next(err);
  }
};

// GET /api/appointments/:id
export const getMyAppointment = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('appointments')
      .select('*')
      .eq('id', req.params.id)
      .eq('client_id', req.user.id)
      .maybeSingle();

    // Do not distinguish an unknown ID from an appointment owned by another client.
    if (error || !data) return res.status(404).json({ success: false, error: 'Appointment not found.' });
    const serviceNames = await getServiceNames([data]);
    return res.json({ success: true, data: presentAppointment(data, serviceNames.get(data.service_id)) });
  } catch (err) {
    next(err);
  }
};

// POST /api/appointments/submit
export const submitBooking = async (req, res, next) => {
  try {
    const parsed = bookingSchema.safeParse(req.body);
    if (validationError(parsed, res, 'Please provide valid booking details.')) return;
    const { serviceId, preferredDate, preferredTime } = parsed.data;
    const animalDescription = sanitizeText(parsed.data.animalDescription);
    const concernRemarks = sanitizeText(parsed.data.concernRemarks);
    const clientId = req.user.id;

    if (!animalDescription) {
      return res.status(400).json({ success: false, error: 'Please provide all booking details.' });
    }

    const { data: service, error: serviceError } = await supabaseAdmin
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .maybeSingle();

    if (serviceError || !service) {
      return res.status(400).json({ success: false, error: 'Invalid service selected.' });
    }

    try {
      validateBookingRequest({ preferredDate, service });
    } catch (validationError) {
      return res.status(400).json({ success: false, error: validationError.message });
    }

    const { data: clientProfile, error: profileError } = await supabaseAdmin
      .from('client_profiles')
      .select('barangay_id, verification_status, account_status')
      .eq('id', clientId)
      .maybeSingle();

    // Only verified, active residents may create a government service request.
    if (profileError || !clientProfile?.barangay_id || clientProfile.verification_status !== 'verified' || clientProfile.account_status !== 'active') {
      return res.status(400).json({ success: false, error: 'A verified service address is required before booking.' });
    }

    const appointment = await runAutoAssignment({
      clientId,
      serviceId,
      barangayId: clientProfile.barangay_id,
      preferredDate,
      preferredTime,
      animalDescription,
      remarks: concernRemarks || null,
    });

    // Notify Client
    await sendInAppNotification(
      clientId,
      'Booking Submitted',
      `Your appointment reference ${appointment.reference_no} is now pending confirmation.`,
      'appointment',
      appointment.id
    );

    // If assigned, notify Technician
    if (appointment.technician_id) {
      await sendInAppNotification(
        appointment.technician_id,
        'New Service Assignment',
        `New booking assigned (${appointment.reference_no}). Please review and confirm.`,
        'appointment',
        appointment.id
      );
    }

    res.status(201).json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/appointments/:id/status (Technician / Admin Workflow Updates)
export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newStatus, notes, cancellationReason } = req.body;
    const userId = req.user.id;

    // Fetch current status
    const { data: current, error: fetchErr } = await supabaseAdmin
      .from('appointments')
      .select('*, client_profiles(id, profiles(email))')
      .eq('id', id)
      .single();

    if (fetchErr || !current) return res.status(404).json({ success: false, error: 'Appointment not found.' });

    if (req.user.role === 'technician' && current.technician_id !== userId) {
      return res.status(403).json({ success: false, error: 'You are not assigned to this appointment.' });
    }

    const allowedTransitions = {
      pending_technician_confirmation: ['technician_confirmed', 'reassignment_needed'],
      technician_confirmed: ['in_progress'],
      in_progress: ['completed', 'no_show'],
    };
    if (!allowedTransitions[current.status]?.includes(newStatus)) {
      return res.status(400).json({ success: false, error: `Cannot change status from ${current.status} to ${newStatus}.` });
    }

    // A technician decline must explain why the appointment needs reassignment.
    if (newStatus === 'reassignment_needed' && !notes?.trim()) {
      return res.status(400).json({ success: false, error: 'A reason is required when declining an appointment.' });
    }

    const updateFields = {
      status: newStatus,
      ...(newStatus === 'completed' && { completed_at: new Date().toISOString() }),
      ...(newStatus === 'no_show' && { no_show_recorded_at: new Date().toISOString() }),
      ...(cancellationReason && { cancellation_reason: cancellationReason })
    };

    // Update appointment
    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('appointments')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // MANDATORY AUDIT TRAIL LOG
    await supabaseAdmin.from('appointment_status_logs').insert([{
      appointment_id: id,
      old_status: current.status,
      new_status: newStatus,
      changed_by: userId,
      notes: notes || null
    }]);

    // Dispatch Notifications
    await sendInAppNotification(
      current.client_id,
      'Appointment Status Update',
      `Appointment ${current.reference_no} status changed to ${newStatus.replace('_', ' ')}.`,
      'appointment',
      id
    );

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// POST /api/appointments/:id/cancel
export const cancelAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    const { data: appointment, error: fetchErr } = await supabaseAdmin
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !appointment) return res.status(404).json({ success: false, error: 'Appointment not found.' });

    if (appointment.client_id !== userId) {
      return res.status(403).json({ success: false, error: 'You do not own this appointment.' });
    }

    if (['completed', 'cancelled', 'no_show'].includes(appointment.status)) {
      return res.status(400).json({ success: false, error: 'Cannot cancel an appointment in its current state.' });
    }

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('appointments')
      .update({ status: 'cancelled', cancellation_reason: reason || null })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    await supabaseAdmin.from('appointment_status_logs').insert([{
      appointment_id: id,
      old_status: appointment.status,
      new_status: 'cancelled',
      changed_by: userId,
      notes: reason || 'Cancelled by client'
    }]);

    // Notify technician if assigned
    if (appointment.technician_id) {
      await sendInAppNotification(
        appointment.technician_id,
        'Appointment Cancelled',
        `Appointment ${appointment.reference_no} has been cancelled by the client.`,
        'appointment',
        id
      );
    }

    // Notify client
    await sendInAppNotification(
      userId,
      'Cancellation Confirmed',
      `Your appointment ${appointment.reference_no} has been cancelled.`,
      'appointment',
      id
    );

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// POST /api/appointments/:id/reschedule
export const rescheduleAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newDate, newTime } = req.body;
    const userId = req.user.id;

    if (!newDate || !newTime) return res.status(400).json({ success: false, error: 'newDate and newTime are required.' });

    const { data: appointment, error: fetchErr } = await supabaseAdmin
      .from('appointments').select('*').eq('id', id).single();
    if (fetchErr || !appointment) return res.status(404).json({ success: false, error: 'Appointment not found.' });
    if (appointment.client_id !== userId) return res.status(403).json({ success: false, error: 'You do not own this appointment.' });
    if (['completed', 'cancelled', 'no_show'].includes(appointment.status)) return res.status(400).json({ success: false, error: 'Cannot reschedule an appointment in its current state.' });

    const { data: service, error: serviceError } = await supabaseAdmin
      .from('services').select('*').eq('id', appointment.service_id).maybeSingle();
    if (serviceError || !service) return res.status(400).json({ success: false, error: 'The appointment service is no longer available.' });
    try {
      validateBookingRequest({ preferredDate: newDate, service });
      await validateBlackoutDate(supabaseAdmin, newDate);
    } catch (validationError) {
      return res.status(400).json({ success: false, error: validationError.message });
    }

    // Re-route the request as a new appointment so every booking rule is enforced.
    const { data: clientProfile, error: profileError } = await supabaseAdmin
      .from('client_profiles').select('barangay_id').eq('id', userId).maybeSingle();
    if (profileError || !clientProfile?.barangay_id) return res.status(400).json({ success: false, error: 'A verified service address is required before rescheduling.' });

    const routingResult = await runAutoAssignment({
      clientId: userId,
      serviceId: appointment.service_id,
      barangayId: clientProfile.barangay_id,
      preferredDate: newDate,
      preferredTime: newTime,
      animalDescription: appointment.animal_description,
      remarks: appointment.remarks,
    });

    // Keep the old record for auditability, but cancel it after replacement succeeds.
    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('appointments')
      .update({ status: 'cancelled', cancellation_reason: `Rescheduled as ${routingResult.reference_no}` })
      .eq('id', id).select().single();
    if (updateErr) throw updateErr;

    await supabaseAdmin.from('appointment_status_logs').insert([{
      appointment_id: id,
      old_status: appointment.status,
      new_status: 'cancelled',
      changed_by: userId,
      notes: `Rescheduled as ${routingResult.reference_no} for ${newDate} ${newTime}`
    }]);

    await sendInAppNotification(userId, 'Appointment Rescheduled', `Your appointment was rescheduled. New reference: ${routingResult.reference_no}.`, 'appointment', routingResult.id);
    if (appointment.technician_id) await sendInAppNotification(appointment.technician_id, 'Appointment Cancelled', `Appointment ${appointment.reference_no} was rescheduled by the client.`, 'appointment', id);
    if (routingResult.technician_id) await sendInAppNotification(routingResult.technician_id, 'New Service Assignment', `New booking assigned (${routingResult.reference_no}). Please review and confirm.`, 'appointment', routingResult.id);

    res.status(200).json({ success: true, data: { cancelledAppointment: updated, rescheduledAppointment: routingResult } });
  } catch (err) {
    next(err);
  }
};
