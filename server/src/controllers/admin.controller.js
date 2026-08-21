import { supabaseAdmin } from '../config/supabase.js';
import { sendEmailNotification, sendInAppNotification } from '../services/notification.service.js';

async function getAuthEmail(userId) {
  const { data } = await supabaseAdmin.auth.admin.getUserById(userId);
  return data?.user?.email || null;
}

// GET /api/admin/clients/pending
export const getPendingClients = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('client_profiles')
      .select('*, barangays(name)')
      .eq('verification_status', 'pending');

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/clients/:id/verify
export const verifyClient = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get current client record
    const { data: client, error: fetchError } = await supabaseAdmin
      .from('client_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !client) return res.status(404).json({ success: false, error: 'Client profile not found.' });

    // 1. Delete Gov ID image from Storage immediately (RA 10173 Compliance)
    if (client.gov_id_url) {
      await supabaseAdmin.storage.from('gov-ids').remove([client.gov_id_url]);
    }

    // 2. Update client status to verified and clear gov_id_url
    await supabaseAdmin
      .from('client_profiles')
      .update({
        verification_status: 'verified',
        gov_id_url: null,
        verified_at: new Date().toISOString()
      })
      .eq('id', id);

    // 3. Notify Client
    await sendInAppNotification(id, 'Account Verified', 'Your CityVet account has been verified. You can now book appointments.', 'system');
    const email = await getAuthEmail(id);
    if (email) await sendEmailNotification(email, 'CityVet Account Verified', 'Your account has been approved. You may now log in and schedule appointments.');

    res.status(200).json({ success: true, message: 'Client verified successfully and ID document permanently purged.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/clients/:id/reject
export const rejectClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const { data: client } = await supabaseAdmin
      .from('client_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (!client) return res.status(404).json({ success: false, error: 'Client profile not found.' });

    // 1. Delete Gov ID image from Storage immediately
    if (client.gov_id_url) {
      await supabaseAdmin.storage.from('gov-ids').remove([client.gov_id_url]);
    }

    // 2. Update status
    await supabaseAdmin
      .from('client_profiles')
      .update({
        verification_status: 'rejected',
        gov_id_url: null,
        rejection_reason: reason || 'Document image unreadable or invalid.'
      })
      .eq('id', id);

    // 3. Notify Client
    const email = await getAuthEmail(id);
    if (email) await sendEmailNotification(
      email,
      'CityVet Account Verification Update',
      `Your account verification was not approved. Reason: ${reason || 'Document image unreadable or invalid.'}`
    );

    res.status(200).json({ success: true, message: 'Client verification rejected and ID document purged.' });
  } catch (err) {
    next(err);
  }
};

const APPOINTMENT_SELECT = `
  id, reference_no, client_id, service_id, technician_id, barangay_id,
  preferred_date, estimated_service_date, preferred_time, urgency_flag,
  status, animal_description, remarks, cancellation_reason, created_at,
  client_profiles(full_name), services(name), barangays(name), technician_profiles(full_name)
`;

const statusLabels = {
  pending_technician_confirmation: 'Pending Technician Confirmation',
  technician_confirmed: 'Technician Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
  no_show: 'No-Show',
  cancelled: 'Cancelled',
  reassignment_needed: 'Reassignment Needed',
};

function presentAdminAppointment(row) {
  return {
    ...row,
    client: row.client_profiles?.full_name || 'Client',
    service: row.services?.name || 'Veterinary service',
    barangay: row.barangays?.name || 'Unassigned area',
    technician: row.technician_profiles?.full_name || null,
    status_code: row.status,
    status_label: statusLabels[row.status] || row.status,
  };
}

function parseLimit(value, fallback = 100) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 200) : fallback;
}

export const getAdminDashboard = async (req, res, next) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const monthStart = `${today.slice(0, 8)}01`;
    const [appointments, technicians, clients, pendingClients, todayAppointments] = await Promise.all([
      supabaseAdmin.from('appointments').select('id, reference_no, status, preferred_date, preferred_time, created_at, client_profiles(full_name), services(name)').order('created_at', { ascending: false }).limit(8),
      supabaseAdmin.from('technician_profiles').select('id, availability_status, account_status'),
      supabaseAdmin.from('client_profiles').select('id, account_status'),
      supabaseAdmin.from('client_profiles').select('id', { count: 'exact', head: true }).eq('verification_status', 'pending'),
      supabaseAdmin.from('appointments').select('id', { count: 'exact', head: true }).eq('preferred_date', today),
    ]);
    const firstError = [appointments, technicians, clients, pendingClients, todayAppointments].find((result) => result.error)?.error;
    if (firstError) throw firstError;
    const monthAppointments = (appointments.data || []).filter((item) => item.created_at >= `${monthStart}T00:00:00.000Z`);
    const activeStatuses = ['technician_confirmed', 'in_progress'];
    res.json({ success: true, data: {
      stats: {
        totalAppointments: monthAppointments.length,
        pendingAssignments: (appointments.data || []).filter((item) => item.status === 'pending_technician_confirmation').length,
        activeCases: (appointments.data || []).filter((item) => activeStatuses.includes(item.status)).length,
        upcomingToday: todayAppointments.count || 0,
        availableTechnicians: (technicians.data || []).filter((item) => item.account_status === 'active' && item.availability_status === 'available').length,
        totalTechnicians: (technicians.data || []).length,
        pendingVerifications: pendingClients.count || 0,
        registeredClients: (clients.data || []).length,
      },
      recentAppointments: (appointments.data || []).map((item) => ({ ...item, client: item.client_profiles?.full_name || 'Client', service: item.services?.name || 'Veterinary service', status_label: statusLabels[item.status] || item.status })),
    }});
  } catch (err) { next(err); }
};

export const listAdminAppointments = async (req, res, next) => {
  try {
    let query = supabaseAdmin.from('appointments').select(APPOINTMENT_SELECT).order('preferred_date', { ascending: false }).limit(parseLimit(req.query.limit));
    if (req.query.status && req.query.status !== 'all') query = query.eq('status', req.query.status);
    if (req.query.from) query = query.gte('preferred_date', req.query.from);
    if (req.query.to) query = query.lte('preferred_date', req.query.to);
    const { data, error } = await query;
    if (error) throw error;
    const search = String(req.query.search || '').trim().toLowerCase();
    const rows = (data || []).map(presentAdminAppointment).filter((item) => !search || [item.reference_no, item.client, item.service, item.barangay, item.technician].some((value) => String(value || '').toLowerCase().includes(search)));
    res.json({ success: true, data: rows, meta: { count: rows.length } });
  } catch (err) { next(err); }
};

export const assignAdminAppointment = async (req, res, next) => {
  try {
    const { technicianId } = req.body;
    if (!technicianId) return res.status(400).json({ success: false, error: 'technicianId is required.' });
    const { data: appointment, error: fetchError } = await supabaseAdmin.from('appointments').select('id, client_id, reference_no, technician_id, status').eq('id', req.params.id).maybeSingle();
    if (fetchError || !appointment) return res.status(404).json({ success: false, error: 'Appointment not found.' });
    const { data: technician, error: technicianError } = await supabaseAdmin.from('technician_profiles').select('id, account_status').eq('id', technicianId).maybeSingle();
    if (technicianError || !technician || technician.account_status !== 'active') return res.status(400).json({ success: false, error: 'Technician is not active.' });
    const { data, error } = await supabaseAdmin.from('appointments').update({ technician_id: technicianId, status: 'pending_technician_confirmation' }).eq('id', req.params.id).select().single();
    if (error) throw error;
    await supabaseAdmin.from('appointment_status_logs').insert({ appointment_id: req.params.id, old_status: appointment.status, new_status: 'pending_technician_confirmation', changed_by: req.user.id, notes: `Assigned by admin${appointment.technician_id ? ' (reassigned)' : ''}.` });
    await sendInAppNotification(technicianId, 'New Service Assignment', `Appointment ${appointment.reference_no} has been assigned to you.`, 'appointment', req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const listAdminTechnicians = async (req, res, next) => {
  try {
    let query = supabaseAdmin.from('technician_profiles').select('id, full_name, contact_number, account_status, availability_status, created_at').order('full_name');
    if (req.query.status && req.query.status !== 'all') query = query.eq('availability_status', req.query.status);
    const { data, error } = await query;
    if (error) throw error;
    const { data: assignments, error: assignmentsError } = await supabaseAdmin.from('appointments').select('technician_id, reference_no, status').not('technician_id', 'is', null).in('status', ['pending_technician_confirmation', 'technician_confirmed', 'in_progress']);
    if (assignmentsError) throw assignmentsError;
    const activeAssignments = new Map((assignments || []).map((item) => [item.technician_id, item]));
    const rows = (data || []).map((item) => ({ ...item, current_assignment: activeAssignments.get(item.id) || null }));
    res.json({ success: true, data: rows, meta: { count: rows.length } });
  } catch (err) { next(err); }
};

export const listAdminClients = async (req, res, next) => {
  try {
    let query = supabaseAdmin.from('client_profiles').select('id, full_name, contact_number, barangay_id, verification_status, account_status, rejection_reason, created_at, barangays(name)').order('created_at', { ascending: false });
    if (req.query.verificationStatus && req.query.verificationStatus !== 'total') query = query.eq('verification_status', req.query.verificationStatus);
    if (req.query.accountStatus) query = query.eq('account_status', req.query.accountStatus);
    const { data, error } = await query;
    if (error) throw error;
    const search = String(req.query.search || '').trim().toLowerCase();
    const rows = (data || []).map((item) => ({ ...item, barangay: item.barangays?.name || 'Unknown' })).filter((item) => !search || item.full_name.toLowerCase().includes(search) || item.contact_number.toLowerCase().includes(search));
    res.json({ success: true, data: rows, meta: { count: rows.length } });
  } catch (err) { next(err); }
};

export const updateClientAccountStatus = async (req, res, next) => {
  try {
    const { accountStatus } = req.body;
    if (!['active', 'suspended'].includes(accountStatus)) return res.status(400).json({ success: false, error: 'accountStatus must be active or suspended.' });
    const { data, error } = await supabaseAdmin.from('client_profiles').update({ account_status: accountStatus }).eq('id', req.params.id).select().single();
    if (error || !data) return res.status(404).json({ success: false, error: 'Client profile not found.' });
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const listBlackoutDates = async (req, res, next) => {
  try {
    let query = supabaseAdmin.from('blackout_dates').select('id, date, reason, created_by, created_at').order('date');
    if (req.query.from) query = query.gte('date', req.query.from);
    if (req.query.to) query = query.lte('date', req.query.to);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data: data || [], meta: { count: (data || []).length } });
  } catch (err) { next(err); }
};

export const createBlackoutDate = async (req, res, next) => {
  try {
    const { date, reason } = req.body;
    if (!date || !reason?.trim()) return res.status(400).json({ success: false, error: 'date and reason are required.' });
    const { data, error } = await supabaseAdmin.from('blackout_dates').insert({ date, reason: reason.trim(), created_by: req.user.id }).select().single();
    if (error?.code === '23505') return res.status(409).json({ success: false, error: 'That date is already unavailable.' });
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
};

export const deleteBlackoutDate = async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin.from('blackout_dates').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, data: { id: req.params.id } });
  } catch (err) { next(err); }
};

export const listAdminNotifications = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('notifications').select('id, title, message, type, created_at, recipient_id').eq('type', 'system').order('created_at', { ascending: false }).limit(100);
    if (error) throw error;
    res.json({ success: true, data: data || [], meta: { count: (data || []).length } });
  } catch (err) { next(err); }
};

export const broadcastAdminNotification = async (req, res, next) => {
  try {
    const { title, message, audience = 'all' } = req.body;
    const audiences = { all: null, clients: 'client', technicians: 'technician' };
    if (!title?.trim() || !message?.trim() || !Object.prototype.hasOwnProperty.call(audiences, audience)) return res.status(400).json({ success: false, error: 'title, message, and a valid audience are required.' });
    let recipientIds = [];
    if (audience === 'clients') recipientIds = (await supabaseAdmin.from('client_profiles').select('id').eq('account_status', 'active')).data?.map((item) => item.id) || [];
    else if (audience === 'technicians') recipientIds = (await supabaseAdmin.from('technician_profiles').select('id').eq('account_status', 'active')).data?.map((item) => item.id) || [];
    else {
      const [clients, technicians, admins] = await Promise.all(['client_profiles', 'technician_profiles', 'admin_profiles'].map((table) => supabaseAdmin.from(table).select('id')));
      recipientIds = [...clients.data || [], ...technicians.data || [], ...admins.data || []].map((item) => item.id);
    }
    const rows = recipientIds.map((recipient_id) => ({ recipient_id, title: title.trim(), message: message.trim(), type: 'system' }));
    if (rows.length) {
      const { error } = await supabaseAdmin.from('notifications').insert(rows);
      if (error) throw error;
    }
    res.status(201).json({ success: true, data: { audience, recipientCount: rows.length } });
  } catch (err) { next(err); }
};

export const getAdminAnalytics = async (req, res, next) => {
  try {
    const from = req.query.from || `${new Date().getFullYear()}-01-01`;
    const to = req.query.to || new Date().toISOString().slice(0, 10);
    const { data, error } = await supabaseAdmin.from('feedback').select('sentiment, themes, submitted_at').gte('submitted_at', `${from}T00:00:00.000Z`).lte('submitted_at', `${to}T23:59:59.999Z`);
    if (error) throw error;
    const rows = data || [];
    const sentiment = rows.reduce((result, item) => { if (item.sentiment) result[item.sentiment] = (result[item.sentiment] || 0) + 1; return result; }, {});
    const themes = rows.flatMap((item) => Array.isArray(item.themes) ? item.themes : []).reduce((result, theme) => { result[theme] = (result[theme] || 0) + 1; return result; }, {});
    res.json({ success: true, data: { totalFeedback: rows.length, sentiment, themes: Object.entries(themes).sort((a, b) => b[1] - a[1]).map(([theme, count]) => ({ theme, count })) } });
  } catch (err) { next(err); }
};

export const generateAdminReport = async (req, res, next) => {
  try {
    const { type = 'summary', from, to, format = 'csv' } = req.body;
    if (!from || !to || !['summary', 'performance', 'routing', 'activity', 'feedback'].includes(type)) return res.status(400).json({ success: false, error: 'type, from, and to are required.' });
    const { data, error } = await supabaseAdmin.from('appointments').select(APPOINTMENT_SELECT).gte('preferred_date', from).lte('preferred_date', to).order('preferred_date');
    if (error) throw error;
    const rows = (data || []).map(presentAdminAppointment);
    res.json({ success: true, data: { type, format, from, to, rows, generatedAt: new Date().toISOString() }, meta: { count: rows.length } });
  } catch (err) { next(err); }
};