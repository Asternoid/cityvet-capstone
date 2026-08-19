// Utility helpers for mapping user roles to portal keys and simple checks
export function getPortalForRole(role) {
	if (!role) return 'client';
	const r = role.toLowerCase();
	if (r === 'admin' || r === 'administrator' || r.startsWith('admin_')) return 'admin';
	if (r === 'technician' || r === 'tech') return 'technician';
	return 'client';
}

export function isRoleAllowed(userRole, allowedRoles = []) {
	if (!userRole) return false;
	const role = userRole.toLowerCase();
	return allowedRoles.map((r) => r.toLowerCase()).includes(role);
}

export default {
	getPortalForRole,
	isRoleAllowed,
};
