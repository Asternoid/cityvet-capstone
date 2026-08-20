import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, UserRound, X } from 'lucide-react';
import API from '../../api/axios';
import { supabase } from '../../lib/supabaseClient';

const MAX_NAME_LENGTH = 100;

export default function AccountMenu({ user, onLogout, onProfileUpdated }) {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [fullName, setFullName] = useState(user?.profile?.full_name || user?.full_name || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  const name = user?.profile?.full_name || user?.full_name || user?.email || 'Client';

  const openProfile = () => {
    setFullName(user?.profile?.full_name || user?.full_name || '');
    setNewPassword('');
    setConfirmPassword('');
    setMessage(null);
    setOpen(false);
    setProfileOpen(true);
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    const trimmedName = fullName.trim();
    if (!trimmedName || trimmedName.length > MAX_NAME_LENGTH) {
      setMessage({ type: 'error', text: `Name is required and must be ${MAX_NAME_LENGTH} characters or fewer.` });
      return;
    }
    if (newPassword && newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const profileResponse = await API.patch('/auth/profile', { fullName: trimmedName });
      if (newPassword) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
      }
      onProfileUpdated?.(profileResponse.data?.user);
      setNewPassword('');
      setConfirmPassword('');
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Could not update your profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-haspopup="menu"
          className="flex items-center gap-2 rounded-btn border border-gray-light bg-off-white px-2 py-1.5 text-left transition hover:bg-white"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-deep text-xs font-bold text-white">
            {name.charAt(0).toUpperCase()}
          </span>
          <span className="max-w-40 truncate text-sm font-medium text-charcoal">{name}</span>
          <ChevronDown className="h-4 w-4 text-gray-mid" aria-hidden="true" />
        </button>

        {open && (
          <div className="absolute right-0 top-12 z-30 w-52 rounded-card border border-gray-light bg-white p-2 shadow-card" role="menu">
            <button
              type="button"
              onClick={openProfile}
              className="flex w-full items-center gap-2 rounded-btn px-3 py-2 text-left text-sm text-charcoal hover:bg-off-white"
              role="menuitem"
            >
              <UserRound className="h-4 w-4" aria-hidden="true" /> Profile
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="w-full rounded-btn px-3 py-2 text-left text-sm text-red-muted hover:bg-red-light"
              role="menuitem"
            >
              Log out
            </button>
          </div>
        )}
      </div>

      {profileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" role="presentation">
          <div className="w-full max-w-md rounded-card bg-white p-6 shadow-card" role="dialog" aria-modal="true" aria-labelledby="profile-title">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-mid">Account</p>
                <h2 id="profile-title" className="mt-1 font-display text-2xl font-bold text-charcoal">Profile</h2>
              </div>
              <button type="button" onClick={() => setProfileOpen(false)} className="rounded-full p-2 text-gray-mid hover:bg-off-white" aria-label="Close profile">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={saveProfile} className="mt-6 space-y-4">
              <div>
                <label htmlFor="profile-email" className="mb-1 block text-sm font-medium text-charcoal">Email</label>
                <input id="profile-email" value={user?.email || ''} disabled className="w-full rounded-btn border border-gray-light bg-off-white px-3 py-2.5 text-sm text-gray-mid" />
              </div>
              <div>
                <label htmlFor="profile-name" className="mb-1 block text-sm font-medium text-charcoal">Full name</label>
                <input id="profile-name" required maxLength={MAX_NAME_LENGTH} value={fullName} onChange={(event) => setFullName(event.target.value)} className="w-full rounded-btn border border-gray-light px-3 py-2.5 text-sm text-charcoal outline-none focus:border-teal-deep" />
              </div>
              <div className="border-t border-gray-light pt-4">
                <p className="mb-3 text-sm font-semibold text-charcoal">Change password</p>
                <input type="password" minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="New password (optional)" autoComplete="new-password" className="w-full rounded-btn border border-gray-light px-3 py-2.5 text-sm text-charcoal outline-none focus:border-teal-deep" />
                <input type="password" minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm new password" autoComplete="new-password" className="mt-3 w-full rounded-btn border border-gray-light px-3 py-2.5 text-sm text-charcoal outline-none focus:border-teal-deep" />
              </div>
              {message && <p role="alert" className={`rounded-btn p-3 text-sm ${message.type === 'success' ? 'bg-green-light text-green-forest' : 'bg-red-light text-red-muted'}`}>{message.text}</p>}
              <button type="submit" disabled={saving} className="w-full rounded-btn bg-teal-deep px-4 py-3 text-sm font-semibold text-white hover:bg-teal-mid disabled:cursor-not-allowed disabled:opacity-60">
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
