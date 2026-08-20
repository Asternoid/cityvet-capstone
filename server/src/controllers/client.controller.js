import { supabaseAdmin } from '../config/supabase.js';

export const getBookingOptions = async (req, res, next) => {
	try {
		const [servicesResult, barangaysResult] = await Promise.all([
			supabaseAdmin
				.from('services')
				.select('id, name, urgency_type, allows_followup, allows_client_followup, is_active')
				.eq('is_active', true)
				.order('name'),
			supabaseAdmin
				.from('barangays')
				.select('id, name, is_covered')
				.eq('is_covered', true)
				.order('name'),
		]);

		const queryError = servicesResult.error || barangaysResult.error;
		if (queryError) throw queryError;

		return res.json({
			success: true,
			services: servicesResult.data || [],
			barangays: barangaysResult.data || [],
		});
	} catch (error) {
		next(error);
	}
};
