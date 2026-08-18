import { supabaseAdmin } from '../config/supabase.js';

export const runAutoAssignment = async ({ clientId, serviceId, barangayId, preferredDate, preferredTime, animalDescription }) => {
  // 1. Fetch Service Details
  const { data: service, error: serviceErr } = await supabaseAdmin
    .from('services')
    .select('*')
    .eq('id', serviceId)
    .single();

  if (serviceErr || !service) throw new Error('Invalid service selected.');

  const isUrgent = service.urgency_type === 'urgent';

  // 2. Step 1: Barangay Technician Lookup
  const { data: maps, error: mapErr } = await supabaseAdmin
    .from('barangay_technician_map')
    .select('technician_id, technician_profiles(*)')
    .eq('barangay_id', barangayId)
    .eq('is_primary', true);

  let candidateTechId = maps && maps.length > 0 ? maps[0].technician_id : null;

  // 3. Step 2 & 3: Handle Urgent vs Routine
  let assignedTechId = null;
  let estimatedDate = preferredDate;
  let initialStatus = 'pending_technician_confirmation';

  if (isUrgent) {
    // Urgent bypassing: route to assigned barangay tech or raise exception if no tech mapped
    if (candidateTechId) {
      assignedTechId = candidateTechId;
    } else {
      initialStatus = 'reassignment_needed'; // Flag for Admin manual assignment
    }
  } else {
    // Routine Workflow: Check Leave & Capacity
    if (!candidateTechId) {
      initialStatus = 'reassignment_needed';
    } else {
      let targetDate = new Date(preferredDate);
      let foundSlot = false;

      // Roll forward check (up to 3 days)
      for (let dayOffset = 0; dayOffset <= 3; dayOffset++) {
        const currentDateStr = targetDate.toISOString().split('T')[0];

        // Step 3: Availability (Check Leave)
        const { data: leaves } = await supabaseAdmin
          .from('leave_requests')
          .select('*')
          .eq('technician_id', candidateTechId)
          .eq('status', 'confirmed')
          .lte('start_date', currentDateStr)
          .gte('end_date', currentDateStr);

        if (leaves && leaves.length > 0) {
          targetDate.setDate(targetDate.getDate() + 1);
          continue; // On leave, try next day
        }

        // Step 4: Capacity Check (Max 6 appointments/day)
        const { count } = await supabaseAdmin
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .eq('technician_id', candidateTechId)
          .eq('preferred_date', currentDateStr)
          .not('status', 'in', '("cancelled","no_show")');

        if ((count || 0) < 6) {
          assignedTechId = candidateTechId;
          estimatedDate = currentDateStr;
          foundSlot = true;
          break;
        }

        targetDate.setDate(targetDate.getDate() + 1);
      }

      if (!foundSlot) {
        // Exceeded capacity limit: Exception Type 2
        initialStatus = 'reassignment_needed';
      }
    }
  }

  // 4. Generate Reference Number
  const referenceNo = `APT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // 5. Insert Appointment
  const { data: newAppointment, error: insertErr } = await supabaseAdmin
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
      animal_description: animalDescription
    }])
    .select()
    .single();

  if (insertErr) throw new Error(insertErr.message);

  // 6. Log Initial Status Entry
  await supabaseAdmin.from('appointment_status_logs').insert([{
    appointment_id: newAppointment.id,
    old_status: 'created',
    new_status: initialStatus,
    changed_by: clientId,
    notes: isUrgent ? 'Urgent dispatch' : 'Auto-assigned via ALG-SYS1'
  }]);

  return newAppointment;
};