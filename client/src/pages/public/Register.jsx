import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, FileText, LockKeyhole, Upload } from 'lucide-react';
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

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (form.password.length < 8) return setError('Your password must contain at least 8 characters.');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    if (!govId) return setError('Please upload a government ID to continue.');
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

      await API.post('/auth/register', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
      onNavigate('Login');
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Registration could not be completed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-8 py-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:py-12">
      <aside className="rounded-[24px] bg-teal-deep p-7 text-white shadow-card sm:p-9">
        <button onClick={() => onNavigate('Landing')} className="mb-12 inline-flex items-center gap-2 text-sm text-white/75 transition-colors hover:text-white"><ArrowLeft size={16} /> Back to CityVet</button>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-warm">New client account</p>
        <h1 className="mt-3 font-display text-3xl font-bold leading-tight">Start your animal’s care journey.</h1>
        <p className="mt-4 text-sm leading-6 text-white/75">Register once to request home-based veterinary services and follow every appointment from your portal.</p>
        <div className="mt-10 space-y-5">
          {['Free city veterinary services', 'Secure account verification', 'Appointment updates in one place'].map((item) => <p key={item} className="flex items-center gap-3 text-sm"><CheckCircle2 size={17} className="shrink-0 text-amber-warm" /> {item}</p>)}
        </div>
      </aside>

      <section className="rounded-[24px] border border-gray-light bg-white p-6 shadow-card sm:p-9">
        <div className="mb-7 flex items-start justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-deep">Step 1 of 1</p><h2 className="mt-2 font-display text-2xl font-bold text-charcoal">Create your account</h2><p className="mt-1 text-sm text-gray-mid">Your ID is reviewed by the clinic administrator before booking.</p></div>
          <span className="hidden h-11 w-11 items-center justify-center rounded-xl bg-green-light text-teal-deep sm:flex"><LockKeyhole size={20} /></span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name"><input required value={form.fullName} onChange={update('fullName')} className="input" placeholder="Maria Santos" /></Field>
            <Field label="Email address"><input required type="email" value={form.email} onChange={update('email')} className="input" placeholder="you@example.com" /></Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Contact number"><input required pattern="09[0-9]{9}" title="Use the format 09XXXXXXXXX" value={form.contactNumber} onChange={update('contactNumber')} className="input" placeholder="09XXXXXXXXX" /></Field>
            <Field label="Barangay ID"><input required type="number" min="1" value={form.barangayId} onChange={update('barangayId')} className="input" placeholder="Enter your barangay ID" /></Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Password"><input required type="password" value={form.password} onChange={update('password')} className="input" placeholder="At least 8 characters" /></Field>
            <Field label="Confirm password"><input required type="password" value={form.confirmPassword} onChange={update('confirmPassword')} className="input" placeholder="Repeat your password" /></Field>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-charcoal">Government ID</label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#a9c2b3] bg-[#f7fbf8] p-4 transition-colors hover:border-teal-deep hover:bg-green-light">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-teal-deep shadow-sm">{govId ? <FileText size={19} /> : <Upload size={19} />}</span>
              <span className="min-w-0"><span className="block truncate text-sm font-medium text-charcoal">{govId ? govId.name : 'Upload a valid government ID'}</span><span className="block text-xs text-gray-mid">PNG, JPG, or PDF · maximum 5 MB</span></span>
              <input required type="file" accept="image/png,image/jpeg,application/pdf" className="sr-only" onChange={(event) => setGovId(event.target.files?.[0] || null)} />
            </label>
          </div>

          <label className="flex items-start gap-3 text-xs leading-5 text-gray-mid"><input required type="checkbox" checked={form.agreed} onChange={update('agreed')} className="mt-1 accent-teal-deep" /> <span>I agree to the Terms of Service and Data Privacy Policy of the Office of the City Veterinarian.</span></label>
          {error && <p role="alert" className="rounded-lg bg-red-light px-3 py-2 text-sm text-red-muted">{error}</p>}
          <button disabled={loading} className="group flex w-full items-center justify-center gap-2 rounded-btn bg-teal-deep px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-teal-mid disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Creating account...' : 'Create client account'} {!loading && <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />}</button>
          <p className="text-center text-sm text-gray-mid">Already registered? <button type="button" onClick={() => onNavigate('Login')} className="font-semibold text-teal-deep hover:underline">Sign in</button></p>
        </form>
      </section>
    </div>
  );
}

function Field({ label, children }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-medium text-charcoal">{label}</span>{children}</label>;
}
