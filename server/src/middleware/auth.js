import { supabaseAdmin } from '../config/supabase.js';

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    const { data: getUserData, error: getUserError } = await supabaseAdmin.auth.getUser(token);
    const user = getUserData?.user;

    if (getUserError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }

    // Try multiple sources for role: unified `profiles` table, user_metadata, or app_metadata
    let role = null;

    try {
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (!profileError && profile && profile.role) role = profile.role;
    } catch (e) {
      // ignore and continue to other sources
    }

    // fallback to metadata stored on the Supabase user object
    if (!role) {
      role = user.user_metadata?.role || user.app_metadata?.role || user.role || null;
    }

    if (!role) {
      // If role is still missing, default to 'client' but allow access only to limited routes downstream
      role = 'client';
    }

    req.user = {
      id: user.id,
      email: user.email,
      role
    };

    next();
  } catch (err) {
    next(err);
  }
};