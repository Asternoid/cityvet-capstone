import { supabaseAdmin } from '../config/supabase.js';
import { sendInAppNotification } from '../services/notification.service.js';

// POST /api/auth/register
export const registerClient = async (req, res, next) => {
  try {
    const { email, password, fullName, contactNumber, barangayId } = req.body;
    const govIdFile = req.file; // Provided via Multer middleware

    if (!email || !password || !fullName || !contactNumber || !barangayId || !govIdFile) {
      return res.status(400).json({ success: false, error: 'All fields including Government ID are required.' });
    }

    if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
      return res.status(400).json({ success: false, error: 'Registration could not be completed.' });
    }

    if (!['image/png', 'image/jpeg', 'application/pdf'].includes(govIdFile.mimetype)) {
      return res.status(400).json({ success: false, error: 'Registration could not be completed.' });
    }

    // 1. Create Supabase Auth User
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) {
      console.error('Supabase registration error:', authError);
      return res.status(400).json({ success: false, error: 'Registration could not be completed.' });
    }
    const userId = authData.user.id;

    // 2. Upload Gov ID to private bucket 'gov-ids'
    const fileExt = govIdFile.originalname.split('.').pop();
    const filePath = `${userId}/gov_id_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('gov-ids')
      .upload(filePath, govIdFile.buffer, { contentType: govIdFile.mimetype });

    if (uploadError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return res.status(500).json({ success: false, error: 'Failed to upload Government ID.' });
    }

    // 3. Create base profile
    await supabaseAdmin.from('profiles').insert([{ id: userId, email, role: 'client' }]);

    // 4. Create client profile
    await supabaseAdmin.from('client_profiles').insert([{
      id: userId,
      full_name: fullName,
      contact_number: contactNumber,
      barangay_id: parseInt(barangayId),
      verification_status: 'pending',
      gov_id_url: filePath
    }]);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Account is pending Admin ID verification.'
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
export const getMe = async (req, res, next) => {
  try {
    let profileData = null;

    if (req.user.role === 'client') {
      const { data } = await supabaseAdmin
        .from('client_profiles')
        .select('*, barangays(name)')
        .eq('id', req.user.id)
        .single();
      profileData = data;
    } else if (req.user.role === 'technician') {
      const { data } = await supabaseAdmin
        .from('technician_profiles')
        .select('*')
        .eq('id', req.user.id)
        .single();
      profileData = data;
    } else if (req.user.role === 'admin') {
      const { data } = await supabaseAdmin
        .from('admin_profiles')
        .select('*')
        .eq('id', req.user.id)
        .single();
      profileData = data;
    }

    res.status(200).json({
      success: true,
      user: {
        ...req.user,
        profile: profileData
      }
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const fullName = typeof req.body.fullName === 'string' ? req.body.fullName.trim() : '';
    if (!fullName || fullName.length > 100) {
      return res.status(400).json({ success: false, error: 'A valid name is required.' });
    }

    const { data: profile, error } = await supabaseAdmin
      .from('client_profiles')
      .update({ full_name: fullName, updated_at: new Date().toISOString() })
      .eq('id', req.user.id)
      .select('*, barangays(name)')
      .single();

    if (error || !profile) return res.status(404).json({ success: false, error: 'Profile not found.' });
    return res.json({ success: true, user: { ...req.user, profile } });
  } catch (err) {
    next(err);
  }
};