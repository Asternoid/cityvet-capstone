import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { supabase, supabaseConfigError } from '../../lib/supabaseClient';
export default function Login({ onNavigate }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!supabase) {
        throw new Error(supabaseConfigError);
      }
      await login({ email: email.trim(), password });
      onNavigate?.('Dashboard');
    } catch (err) {
      console.warn('Login attempt failed:', err?.status || err?.code || 'authentication failure');
      setError('Sign-in failed. Check your email and password and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setError(null);
    setResetMessage(null);
    if (!email.trim()) {
      setError('Enter your email address first to reset your password.');
      return;
    }

    setResetting(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/login`,
      });
      if (resetError) throw resetError;
      setResetMessage('If an account uses that email, a password reset link has been sent.');
    } catch (resetError) {
      setError('Unable to send a password reset link right now. Please try again.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa] px-4 py-12">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        {/* Header */}
        <h2 className="text-2xl font-bold text-[#154e4d]">Welcome Back</h2>
        <p className="mt-1 text-sm text-gray-500">Sign in to your veterinary portal account</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-800">
              Email Address
            </label>
            <input
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="user@gmail.com"
              className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#154e4d] focus:ring-1 focus:ring-[#154e4d]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-800">
              Password
            </label>
            <input
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••••••"
              className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#154e4d] focus:ring-1 focus:ring-[#154e4d]"
            />
            <div className="mt-2 text-right">
              <button
                type="button"
                onClick={handlePasswordReset}
                disabled={resetting}
                className="text-sm font-semibold text-[#154e4d] hover:underline"
              >
                {resetting ? 'Sending...' : 'Forgot Password?'}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded border border-red-200 bg-red-50 p-2 text-xs text-red-600">
              {error}
            </div>
          )}
          {resetMessage && <div className="rounded border border-green-200 bg-green-50 p-2 text-xs text-green-700">{resetMessage}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[#154e4d] py-3 text-base font-semibold text-white transition hover:bg-[#0f3b3a] disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => onNavigate?.('Register')}
            className="font-semibold text-[#154e4d] hover:underline"
          >
            Register here
          </button>
        </div>
      </div>
    </div>
  );
}