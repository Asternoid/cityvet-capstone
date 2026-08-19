import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { supabase } from '../../lib/supabaseClient';

export default function Login({ onNavigate }) {
  const { fetchCurrentUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!supabase) {
        throw new Error('Authentication is not configured. Add the Supabase environment variables and try again.');
      }
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      await fetchCurrentUser();
      onNavigate?.('Dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md py-12">
      <div className="rounded-card border border-gray-light bg-white p-6 shadow-card">
        <h2 className="mb-4 text-xl font-semibold text-charcoal">Sign in</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-charcoal">Email</label>
            <input required value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full rounded-btn border border-gray-light px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-charcoal">Password</label>
            <input required value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-full rounded-btn border border-gray-light px-3 py-2 text-sm" />
          </div>

          {error ? <div className="text-sm text-red-muted">{error}</div> : null}

          <div className="flex items-center justify-between">
            <button type="submit" disabled={loading} className="rounded-btn bg-teal-deep px-4 py-2 text-sm font-medium text-white">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            <button type="button" onClick={() => onNavigate('Register')} className="text-sm text-teal-deep">Register</button>
          </div>
        </form>
      </div>
    </div>
  );
}
