import { supabaseAdmin } from '../config/supabase.js';

export const runAutoAssignmentWithClient = async (supabaseClient, { clientId, serviceId, barangayId, preferredDate, preferredTime, animalDescription, remarks = null }) => {
  const supabase = supabaseClient;

  // 1. Fetch Service Details
  const { data: service, error: serviceErr } = await supabase
    .from('services')
    .select('*')
    .eq('id', serviceId)
    .single();

  if (serviceErr || !service) throw new Error('Invalid service selected.');

  const isUrgent = service.urgency_type === 'urgent';

  // 2. Step 1: Barangay Technician Lookup — fetch all mapped technicians (primary first)
  const { data: maps, error: mapErr } = await supabase
    .from('barangay_technician_map')
    .select('technician_id, is_primary')
    .eq('barangay_id', barangayId)
    .order('is_primary', { ascending: false });

  const candidateList = (maps || []).map(m => m.technician_id);

  // 3. Step 2 & 3: Handle Urgent vs Routine
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

      // Capacity check
      const { count } = await supabase
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('technician_id', candidateId)
        .eq('preferred_date', currentDateStr)
        .not('status', 'in', '("cancelled","no_show")');

      if ((count || 0) < 6) {
        return currentDateStr;
      }

      target.setDate(target.getDate() + 1);
    }

    return null;
  };

  if (isUrgent) {
    // Urgent: try primary mapped tech(s) and set estimated_date to today
    if (candidateList.length > 0) {
      assignedTechId = candidateList[0];
      estimatedDate = new Date().toISOString().slice(0, 10);
    } else {
      initialStatus = 'reassignment_needed';
    }
  } else {
    if (!candidateList || candidateList.length === 0) {
      initialStatus = 'reassignment_needed';
    } else {
      let found = false;
      for (const cand of candidateList) {
        const availableDate = await tryCandidate(cand);
        if (availableDate) {
          assignedTechId = cand;
          estimatedDate = availableDate;
          found = true;
          break;
        }
      }

      if (!found) {
        initialStatus = 'reassignment_needed';
      }
    }
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