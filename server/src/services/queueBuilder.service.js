import { supabaseAdmin } from '../config/supabase.js';

export const buildDailyQueue = async (technicianId, targetDate) => {
  const { data: appointments, error } = await supabaseAdmin
    .from('appointments')
    .select('*, client_profiles(full_name, contact_number), services(name), barangays(name)')
    .eq('technician_id', technicianId)
    // Use the routed service date so roll-forward assignments appear on the correct daily queue.
    .eq('estimated_service_date', targetDate)
    .in('status', ['pending_technician_confirmation', 'technician_confirmed', 'in_progress']);

  if (error) throw new Error(error.message);

  // Apply 3-level sorting
  const sortedQueue = appointments.sort((a, b) => {
    // Priority 1: Urgency Flag
    if (a.urgency_flag !== b.urgency_flag) {
      return a.urgency_flag ? -1 : 1;
    }

    // Priority 2: Geographic Proximity (Barangay ID)
    if (a.barangay_id !== b.barangay_id) {
      return a.barangay_id - b.barangay_id;
    }

    // Priority 3: Creation Order
    return new Date(a.created_at) - new Date(b.created_at);
  });

  return sortedQueue;
};