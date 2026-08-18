import { runAutoAssignment } from '../services/autoAssignment.service.js';
import { supabaseAdmin } from '../config/supabase.js';
import { sendInAppNotification, sendEmailNotification } from '../services/notification.service.js';

// POST /api/appointments/submit
export const submitBooking = async (req, res, next) => {
  try {
    const { serviceId, barangayId, preferredDate, preferredTime, animalDescription } = req.body;
    const clientId = req.user.id;

    if (!serviceId || !barangayId || !preferredDate || !preferredTime || !animalDescription) {
      return res.status(400).json({ success: false, error: 'Please provide all booking details.' });
    }

    const appointment = await runAutoAssignment({
      clientId,
      serviceId,
      barangayId,
      preferredDate,
      preferredTime,
      animalDescription
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