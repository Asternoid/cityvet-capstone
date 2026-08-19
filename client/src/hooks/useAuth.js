import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Simple wrapper hook to consume AuthContext. Keeps imports consistent.
export default function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return ctx;
}
