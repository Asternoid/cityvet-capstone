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

    // Supabase's built-in user.role is usually "authenticated", not an
    // application role, so never use it for authorization decisions.
    if (!role) {
      const metadataRole = user.user_metadata?.role || user.app_metadata?.role;
      if (['client', 'technician', 'admin'].includes(metadataRole)) role = metadataRole;
    }

    // Older accounts may not have an application role in metadata.
    if (!role) {
      const profileTables = [
        ['client_profiles', 'client'],
        ['technician_profiles', 'technician'],
        ['admin_profiles', 'admin'],
      ];
      for (const [table, tableRole] of profileTables) {
        const { data: profile } = await supabaseAdmin
          .from(table)
          .select('id')
          .eq('id', user.id)
          .maybeSingle();
        if (profile) {
          role = tableRole;
          break;
        }
      }
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