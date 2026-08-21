import React, { useState } from 'react';
import { Upload, ChevronDown } from 'lucide-react';
import API from '../../api/axios';
const initialForm = {
  fullName: '',
  email: '',
  contactNumber: '',
  barangayId: '',
  password: '',
  confirmPassword: '',
  agreed: false,
};

export default function Register({ onNavigate }) {
  const [form, setForm] = useState(initialForm);
  const [govId, setGovId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [barangays, setBarangays] = useState([]);
  const [loadingBarangays, setLoadingBarangays] = useState(true);

  React.useEffect(() => {
    let active = true;
    API.get('/auth/registration-options')
      .then(({ data }) => { if (active) setBarangays(data?.barangays || []); })
      .catch(() => { if (active) setError('Unable to load covered barangays. Please refresh and try again.'); })
      .finally(() => { if (active) setLoadingBarangays(false); });
    return () => { active = false; };
  }, []);

  const update = (field) => (event) =>
    setForm((current) => ({
      ...current,
      [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value,
    }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (form.fullName.trim().length < 2 || form.fullName.trim().length > 100) return setError('Enter a valid name between 2 and 100 characters.');
    if (!/^09\d{9}$/.test(form.contactNumber.trim())) return setError('Use a valid Philippine mobile number in the format 09XXXXXXXXX.');
    if (!form.barangayId) return setError('Please select a covered barangay.');
    if (form.password.length < 8 || form.password.length > 128) return setError('Choose a password between 8 and 128 characters.');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    if (!govId) return setError('Please upload a government ID to continue.');
    if (!['image/png', 'image/jpeg', 'application/pdf'].includes(govId.type) || govId.size > 5 * 1024 * 1024) return setError('Government ID must be a PNG, JPG, or PDF file up to 5 MB.');
    if (!form.agreed) return setError('Please accept the terms and data privacy policy.');

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('fullName', form.fullName.trim());
      payload.append('email', form.email.trim());
      payload.append('password', form.password);
      payload.append('contactNumber', form.contactNumber.trim());
      payload.append('barangayId', form.barangayId.trim());
      payload.append('govId', govId);

      await API.post('/auth/register', payload);
      onNavigate('Login');
    } catch (requestError) {
      console.warn('Registration attempt failed:', requestError.response?.status || 'request failure');
      setError('Registration could not be completed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa] px-4 py-12">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        {/* Header */}
        <h2 className="text-2xl font-bold text-[#154e4d]">Create Your Account</h2>
        <p className="mt-1 text-sm text-gray-500">Join the Gingoog City Veterinary Portal</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Full Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">Full Name</label>
            <input
              required
              value={form.fullName}
              onChange={update('fullName')}
              placeholder="Juan Dela Cruz"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-[#154e4d] focus:ring-1 focus:ring-[#154e4d]"
            />
          </div>

          {/* Address/Barangay Dropdown */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">Address/Barangay</label>
            <div className="relative">
              <select
                required
                value={form.barangayId}
                onChange={update('barangayId')}
                className="w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-[#154e4d] focus:ring-1 focus:ring-[#154e4d]"
              >
                <option value="" disabled hidden>
                  {loadingBarangays ? 'Loading barangays...' : 'Please Select'}
                </option>
                {barangays.map((barangay) => (
                  <option key={barangay.id} value={barangay.id}>{barangay.name}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
            </div>
          </div>

          {/* Contact & Email */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-800">Contact Number</label>
              <input
                required
                pattern="09[0-9]{9}"
                title="Use the format 09XXXXXXXXX"
                value={form.contactNumber}
                onChange={update('contactNumber')}
                placeholder="09XX XXX XXX"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-[#154e4d] focus:ring-1 focus:ring-[#154e4d]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-800">Email</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={update('email')}
                placeholder="user@gmail.com"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-[#154e4d] focus:ring-1 focus:ring-[#154e4d]"
              />
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-800">Password</label>
              <input
                required
                type="password"
                value={form.password}
                onChange={update('password')}
                placeholder="••••••••••••"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-[#154e4d] focus:ring-1 focus:ring-[#154e4d]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-800">Confirm Password</label>
              <input
                required
                type="password"
                value={form.confirmPassword}
                onChange={update('confirmPassword')}
                placeholder="••••••••••••"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-[#154e4d] focus:ring-1 focus:ring-[#154e4d]"
              />
            </div>
          </div>

          {/* Government ID Upload */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">Government ID</label>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-400 bg-white p-4 text-center transition hover:border-[#154e4d]">
              <Upload className="mb-1 h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-800">
                {govId ? govId.name : 'Upload Government ID'}
              </span>
              <span className="mt-0.5 text-xs text-gray-400">
                Click to browse or drag & drop (PNG, JPG, PDF)
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg,application/pdf"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  setGovId(file);
                  if (file && (!['image/png', 'image/jpeg', 'application/pdf'].includes(file.type) || file.size > 5 * 1024 * 1024)) {
                    setError('Government ID must be a PNG, JPG, or PDF file up to 5 MB.');
                  } else {
                    setError(null);
                  }
                }}
              />
            </label>
          </div>

          {/* Terms Checkbox */}
          <label className="flex items-start gap-2 pt-1 text-xs text-gray-600">
            <input
              required
              type="checkbox"
              checked={form.agreed}
              onChange={update('agreed')}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#154e4d]"
            />
            <span>
              I agree to the{' '}
              <a href="#terms" className="text-[#154e4d] hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#privacy" className="text-[#154e4d] hover:underline">
                Data Privacy Policy
              </a>{' '}
              of the Office of the City Veterinarian.
            </span>
          </label>

          {error && (
            <p role="alert" className="rounded-md bg-red-50 p-2 text-xs text-red-600">
              {error}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[#154e4d] py-2.5 text-base font-semibold text-white transition hover:bg-[#0f3b3a] disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => onNavigate('Login')}
            className="font-semibold text-[#154e4d] hover:underline"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}