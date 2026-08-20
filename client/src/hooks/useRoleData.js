import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

const APPOINTMENT_SELECT = `
  id, reference_no, client_id, service_id, technician_id, barangay_id,
  preferred_date, estimated_service_date, preferred_time, urgency_flag,
  status, animal_description, remarks, is_followup, parent_appointment_id,
  cancellation_reason, no_show_recorded_at, completed_at, created_at, updated_at
`;

function toAppointment(row, services, clients, technicians, barangays) {
  return {
    ...row,
    id: row.id,
    reference: row.reference_no,
    service: services.get(row.service_id)?.name || `Service #${row.service_id}`,
    clientName: clients.get(row.client_id)?.full_name || 'Client',
    technicianName: technicians.get(row.technician_id)?.full_name || 'Awaiting assignment',
    barangayName: barangays.get(row.barangay_id)?.name || `Barangay #${row.barangay_id}`,
    preferredDate: row.preferred_date,
    preferredTime: row.preferred_time,
    petName: row.animal_description || 'Animal service',
  };
}

export default function useRoleData({ includeAllAppointments = false } = {}) {
  const { user } = useAuth();
  const [data, setData] = useState({ appointments: [], services: [], barangays: [], technicians: [], clients: [], notifications: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!supabase || !user?.id) {
      setData((current) => ({ ...current, appointments: [], notifications: [] }));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let appointmentQuery = supabase.from('appointments').select(APPOINTMENT_SELECT).order('preferred_date', { ascending: true });
      if (!includeAllAppointments) {
        appointmentQuery = user.role === 'technician'
          ? appointmentQuery.eq('technician_id', user.id)
          : appointmentQuery.eq('client_id', user.id);
      }

      const [appointmentResult, servicesResult, barangaysResult, techniciansResult, clientsResult] = await Promise.all([
        appointmentQuery,
        supabase.from('services').select('id, name, urgency_type, allows_followup, allows_client_followup, is_active').eq('is_active', true).order('name'),
        supabase.from('barangays').select('id, name, is_covered').order('name'),
        supabase.from('technician_profiles').select('id, full_name, contact_number, account_status, availability_status'),
        includeAllAppointments ? supabase.from('client_profiles').select('id, full_name, barangay_id, verification_status, account_status') : Promise.resolve({ data: [], error: null }),
      ]);

      const firstError = [appointmentResult, servicesResult, barangaysResult, techniciansResult, clientsResult].find((result) => result.error)?.error;
      if (firstError) throw firstError;

      const services = new Map((servicesResult.data || []).map((item) => [item.id, item]));
      const clients = new Map((clientsResult.data || []).map((item) => [item.id, item]));
      const technicians = new Map((techniciansResult.data || []).map((item) => [item.id, item]));
      const barangays = new Map((barangaysResult.data || []).map((item) => [item.id, item]));

      setData({
        services: servicesResult.data || [],
        barangays: barangaysResult.data || [],
        technicians: techniciansResult.data || [],
        clients: clientsResult.data || [],
        appointments: (appointmentResult.data || []).map((row) => toAppointment(row, services, clients, technicians, barangays)),
        notifications: [],
      });
    } catch (loadError) {
      setError(loadError.message || 'Unable to load data from Supabase.');
      setData((current) => ({ ...current, appointments: [], notifications: [] }));
    } finally {
      setLoading(false);
    }
  }, [includeAllAppointments, user?.id, user?.role]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...data, loading, error, reload: load };
}
