import { supabaseAdmin } from '../config/supabase.js';

export const validateBookingRequest = ({ preferredDate, service }) => {
  if (!preferredDate) {
    throw new Error('Preferred date is required.');
  }

  const selectedDate = new Date(`${preferredDate}T00:00:00`);
  if (Number.isNaN(selectedDate.getTime())) {
    throw new Error('Preferred date is invalid.');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    throw new Error('Selected date cannot be in the past.');
  }

  const maxDays = service?.urgency_type === 'urgent' ? 3 : 14;
  const diffInDays = Math.ceil((selectedDate - today) / (1000 * 60 * 60 * 24));

  if (diffInDays > maxDays) {
    const allowedWindow = service?.urgency_type === 'urgent' ? '3 days' : '14 days';
    throw new Error(`Selected date exceeds the allowed booking window (${allowedWindow}).`);
  }
};

// Reject dates that the office has declared unavailable before routing work.
export const validateBlackoutDate = async (supabase, preferredDate) => {
  const { data, error } = await supabase
    .from('blackout_dates')
    .select('id, reason')
    .eq('date', preferredDate)
    .maybeSingle();

  if (error) throw error;
  if (data) throw new Error(`The selected date is unavailable: ${data.reason || 'office blackout date'}.`);
};

export const runAutoAssignmentWithClient = async (supabaseClient, { clientId, serviceId, barangayId, preferredDate, preferredTime, animalDescription, remarks = null }) => {
  const supabase = supabaseClient;

  // 1. Fetch Service Details
  const { data: service, error: serviceErr } = await supabase
    .from('services')
    .select('*')
    .eq('id', serviceId)
    .single();

  if (serviceErr || !service) throw new Error('Invalid service selected.');

  validateBookingRequest({ preferredDate, service });
  await validateBlackoutDate(supabase, preferredDate);

  const isUrgent = service.urgency_type === 'urgent';

  // 2. Step 1: Barangay Technician Lookup — fetch all mapped technicians (primary first)
  const { data: maps, error: mapErr } = await supabase
    .from('barangay_technician_map')
    .select('technician_id, is_primary')
    .eq('barangay_id', barangayId)
    .order('is_primary', { ascending: false });

  if (mapErr) throw mapErr;
  const candidateList = (maps || []).map(m => m.technician_id);

  // 3. Check all candidates against leave and daily workload before assignment.
  let assignedTechId = null;
  let estimatedDate = preferredDate;
  let initialStatus = 'pending_technician_confirmation';

  // helper: check a single candidate for up to 3-day roll-forward
  const tryCandidate = async (candidateId) => {
    let target = new Date(preferredDate);
    for (let dayOffset = 0; dayOffset <= 3; dayOffset++) {
      const currentDateStr = target.toISOString().slice(0, 10);

      // Availability (leave) — confirm no confirmed leave that covers this date
      const { data: leaves } = await supabase
        .from('leave_requests')
        .select('id')
        .eq('technician_id', candidateId)
        .eq('status', 'confirmed')
        .lte('start_date', currentDateStr)
        .gte('end_date', currentDateStr);

      if (leaves && leaves.length > 0) {
        target.setDate(target.getDate() + 1);
        continue; // try next day
      }

      // Capacity is based on the actual scheduled date, not merely the client's preference.
      const { count } = await supabase
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('technician_id', candidateId)
        .eq('estimated_service_date', currentDateStr)
        .not('status', 'in', '("cancelled","no_show")');

      if ((count || 0) < 6) {
        return currentDateStr;
      }

      target.setDate(target.getDate() + 1);
    }

    return null;
  };

  if (!candidateList.length) {
    initialStatus = 'reassignment_needed';
  } else {
    for (const cand of candidateList) {
      const availableDate = await tryCandidate(cand);
      if (availableDate) {
        assignedTechId = cand;
        estimatedDate = availableDate;
        break;
      }
    }
    if (!assignedTechId) initialStatus = 'reassignment_needed';
  }

  // 4. Generate Reference Number
  const referenceNo = `APT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // 5. Insert Appointment
  const { data: newAppointment, error: insertErr } = await supabase
    .from('appointments')
    .insert([{
      reference_no: referenceNo,
      client_id: clientId,
      service_id: serviceId,
      technician_id: assignedTechId,
      barangay_id: barangayId,
      preferred_date: preferredDate,
      estimated_service_date: estimatedDate,
      preferred_time: preferredTime,
      urgency_flag: isUrgent,
      status: initialStatus,
      animal_description: animalDescription,
      remarks
    }])
    .select()
    .single();

  if (insertErr) throw new Error(insertErr.message);

  // 6. Log Initial Status Entry
  try {
    await supabase.from('appointment_status_logs').insert([
      {
        appointment_id: newAppointment.id,
        old_status: 'created',
        new_status: initialStatus,
        changed_by: clientId,
        notes: isUrgent ? 'Urgent dispatch' : 'Auto-assigned via ALG-SYS1'
      }
    ]);
  } catch (logErr) {
    console.error('Failed to write appointment_status_logs:', logErr.message || logErr);
  }

  return newAppointment;
};

// Backwards-compatible default export using the real admin client
export const runAutoAssignment = async (params) => runAutoAssignmentWithClient(supabaseAdmin, params);

export default runAutoAssignment;