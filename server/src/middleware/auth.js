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

    // Resolve the application role from server-controlled sources only.
    let role = null;

    // user_metadata is user-editable, so it must never grant CityVet permissions.
    const metadataRole = user.app_metadata?.role;
    if (['client', 'technician', 'admin'].includes(metadataRole)) role = metadataRole;

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

    // Accounts without a profile are denied instead of being treated as clients.
    if (!role) return res.status(403).json({ success: false, error: 'No authorized CityVet role is assigned to this account.' });

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