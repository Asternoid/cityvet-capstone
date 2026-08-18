import { supabaseAdmin } from '../config/supabase.js';
import { sendEmailNotification, sendInAppNotification } from '../services/notification.service.js';

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
      .select('*, profiles(email)')
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
    await sendEmailNotification(client.profiles.email, 'CityVet Account Verified', 'Your account has been approved. You may now log in and schedule appointments.');

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
      .select('*, profiles(email)')
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
    await sendEmailNotification(
      client.profiles.email,
      'CityVet Account Verification Update',
      `Your account verification was not approved. Reason: ${reason || 'Document image unreadable or invalid.'}`
    );

    res.status(200).json({ success: true, message: 'Client verification rejected and ID document purged.' });
  } catch (err) {
    next(err);
  }
};