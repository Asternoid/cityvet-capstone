import { supabaseAdmin } from '../config/supabase.js';
import { sendInAppNotification } from '../services/notification.service.js';
import { loginSchema, profileSchema, registrationSchema, validationError } from '../lib/inputSecurity.js';

const resolveRoleFromUserId = async (userId) => {
  const checks = [
    ['client_profiles', 'client'],
    ['technician_profiles', 'technician'],
    ['admin_profiles', 'admin']
  ];

  for (const [table, role] of checks) {
    try {
      const { data } = await supabaseAdmin
        .from(table)
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (data) return role;
    } catch (error) {
      continue;
    }
  }

  return 'client';
};

export const getRegistrationOptions = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('barangays')
      .select('id, name')
      .eq('is_covered', true)
      .order('name');

    if (error) throw error;
    return res.json({ success: true, barangays: data || [] });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
export const loginUser = async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (validationError(parsed, res, 'A valid email and password are required.')) return;
    const { email, password } = parsed.data;

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });

    if (error) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const userId = data?.user?.id;
    const role = userId ? await resolveRoleFromUserId(userId) : 'client';

    return res.status(200).json({
      success: true,
      user: {
        id: userId,
        email: data?.user?.email || email,
        role
      },
      session: data?.session || null
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout
export const logoutUser = async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin.auth.signOut();

    if (error) {
      return res.status(400).json({ success: false, error: 'Logout failed.' });
    }

    return res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/register
export const registerClient = async (req, res, next) => {
  let userId = null;
  let filePath = null;
  try {
    const parsed = registrationSchema.safeParse(req.body);
    if (validationError(parsed, res, 'Registration could not be completed.')) return;
    const { email, password, fullName, contactNumber, barangayId } = parsed.data;
    const govIdFile = req.file; // Provided via Multer middleware

    if (!govIdFile) {
      return res.status(400).json({ success: false, error: 'All fields including Government ID are required.' });
    }

    if (!['image/png', 'image/jpeg', 'application/pdf'].includes(govIdFile.mimetype)) {
      return res.status(400).json({ success: false, error: 'Registration could not be completed.' });
    }

    const { data: barangay, error: barangayError } = await supabaseAdmin
      .from('barangays')
      .select('id')
      .eq('id', barangayId)
      .eq('is_covered', true)
      .maybeSingle();

    if (barangayError || !barangay) {
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
    userId = authData.user.id;

    // 2. Upload Gov ID to private bucket 'gov-ids'
    const fileExt = { 'image/png': 'png', 'image/jpeg': 'jpg', 'application/pdf': 'pdf' }[govIdFile.mimetype];
    filePath = `${userId}/gov_id_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('gov-ids')
      .upload(filePath, govIdFile.buffer, { contentType: govIdFile.mimetype });

    if (uploadError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return res.status(500).json({ success: false, error: 'Failed to upload Government ID.' });
    }

    // Create the role-specific profile used for account verification and RBAC.
    const { error: clientProfileError } = await supabaseAdmin.from('client_profiles').insert([{
      id: userId,
      full_name: fullName,
      contact_number: contactNumber,
      barangay_id: barangayId,
      verification_status: 'pending',
      gov_id_url: filePath
    }]);
    if (clientProfileError) throw clientProfileError;

    res.status(201).json({
      success: true,
      message: 'Registration successful. Account is pending Admin ID verification.'
    });
  } catch (err) {
    if (userId) {
      if (filePath) await supabaseAdmin.storage.from('gov-ids').remove([filePath]);
      await supabaseAdmin.auth.admin.deleteUser(userId);
    }
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
    const parsed = profileSchema.safeParse(req.body);
    if (validationError(parsed, res, 'A valid name is required.')) return;
    const { fullName } = parsed.data;

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
