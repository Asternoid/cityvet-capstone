import React from 'react';
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, HeartPulse, MapPin, Menu, ShieldCheck, X } from 'lucide-react';

const services = [
  { name: 'Rabies vaccination', detail: 'Protect your companion with reliable preventive care.', icon: ShieldCheck },
  { name: 'Animal treatment', detail: 'Practical support for common conditions and concerns.', icon: HeartPulse },
  { name: 'Deworming', detail: 'Essential care delivered in the comfort of home.', icon: CheckCircle2 },
  { name: 'Routine check-up', detail: 'A simple visit to keep your animal healthy.', icon: CalendarDays },
];

export default function Landing({ onNavigate }) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const goTo = (destination) => {
    setMenuOpen(false);
    onNavigate(destination);
  };

  return (
    <div className="overflow-hidden rounded-[24px] border border-[#d8e1dc] bg-[#fbfcf9] shadow-[0_18px_60px_rgba(27,94,92,0.08)]">
      <header className="relative z-10 flex items-center justify-between border-b border-[#d8e1dc] bg-[#fbfcf9]/95 px-5 py-4 backdrop-blur sm:px-8">
        <button onClick={() => goTo('Landing')} className="flex items-center gap-3 text-left" aria-label="Go to CityVet home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-deep text-lg font-bold text-white">C</span>
          <span>
            <span className="block font-display text-lg font-bold leading-tight text-teal-deep">CityVet</span>
            <span className="hidden text-[10px] uppercase tracking-[0.16em] text-gray-mid sm:block">Gingoog City</span>
          </span>
        </button>

        <nav className="hidden items-center gap-7 text-sm font-medium text-[#46605d] md:flex" aria-label="Primary navigation">
          <a href="#services" className="transition-colors hover:text-teal-deep">Services</a>
          <a href="#how-it-works" className="transition-colors hover:text-teal-deep">How it works</a>
          <button onClick={() => goTo('Login')} className="rounded-btn border border-teal-deep px-4 py-2 text-teal-deep transition-colors hover:bg-green-light">Sign in</button>
          <button onClick={() => goTo('Register')} className="rounded-btn bg-teal-deep px-4 py-2 text-white shadow-sm transition-colors hover:bg-teal-mid">Book a visit</button>
        </nav>

        <button onClick={() => setMenuOpen((open) => !open)} className="rounded-lg p-2 text-teal-deep md:hidden" aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        {menuOpen && (
          <nav className="absolute inset-x-4 top-[72px] space-y-1 rounded-xl border border-[#d8e1dc] bg-white p-3 shadow-modal md:hidden" aria-label="Mobile navigation">
            <a href="#services" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-charcoal hover:bg-off-white">Services</a>
            <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-charcoal hover:bg-off-white">How it works</a>
            <button onClick={() => goTo('Login')} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-teal-deep hover:bg-green-light">Sign in</button>
            <button onClick={() => goTo('Register')} className="block w-full rounded-lg bg-teal-deep px-3 py-2 text-left text-sm font-medium text-white">Book a visit</button>
          </nav>
        )}
      </header>

      <main>
        <section className="relative bg-[#e8f2ec] px-5 pb-16 pt-14 sm:px-10 sm:pb-20 sm:pt-20 lg:px-16">
          <div className="pointer-events-none absolute right-[-90px] top-[-110px] h-72 w-72 rounded-full border-[40px] border-[#cbded1] opacity-70" />
          <div className="relative grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-xl">
              <p className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-teal-deep"><MapPin size={15} /> Office of the City Veterinarian</p>
              <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-tight text-[#173c3a] sm:text-6xl">Care that comes to your doorstep.</h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-[#506864] sm:text-lg">Access free, home-based veterinary services across Gingoog City. Request a visit, follow its progress, and keep your animal’s care moving.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button onClick={() => goTo('Register')} className="group inline-flex items-center justify-center gap-2 rounded-btn bg-teal-deep px-5 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(27,94,92,0.2)] transition-transform hover:-translate-y-0.5">Book an appointment <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></button>
                <button onClick={() => goTo('Login')} className="rounded-btn border border-[#a9c2b3] bg-white/60 px-5 py-3 text-sm font-bold text-teal-deep transition-colors hover:bg-white">Sign in to portal</button>
              </div>
              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-[#59726d]">
                <span className="inline-flex items-center gap-2"><CheckCircle2 size={16} className="text-green-forest" /> No registration fee</span>
                <span className="inline-flex items-center gap-2"><CheckCircle2 size={16} className="text-green-forest" /> Barangay-wide coverage</span>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-md lg:mr-0">
              <div className="relative overflow-hidden rounded-[28px] bg-teal-deep p-6 text-white shadow-[0_22px_45px_rgba(27,94,92,0.22)] sm:p-8">
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border-[22px] border-white/10" />
                <p className="relative text-sm font-medium text-white/70">Your next step</p>
                <h2 className="relative mt-2 max-w-xs font-display text-3xl font-bold leading-tight">Make care easier for your family.</h2>
                <div className="relative mt-8 space-y-3">
                  {['Choose a service', 'Pick a preferred schedule', 'Track technician confirmation'].map((item, index) => (
                    <div key={item} className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-3 text-sm">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-warm font-bold text-charcoal">{index + 1}</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <p className="relative mt-7 flex items-center gap-2 text-xs text-white/70"><Clock3 size={15} /> Typical request takes less than 3 minutes</p>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="scroll-mt-6 bg-[#fbfcf9] px-5 py-14 sm:px-10 sm:py-16 lg:px-16">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-deep">What we provide</p><h2 className="mt-2 font-display text-2xl font-bold text-[#173c3a] sm:text-3xl">Essential care, made accessible.</h2></div>
            <p className="max-w-sm text-sm leading-6 text-gray-mid">Professional support from the city veterinary team, available in your barangay.</p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map(({ name, detail, icon: Icon }) => (
              <article key={name} className="rounded-2xl border border-[#d8e1dc] bg-white p-5 transition-transform hover:-translate-y-1 hover:shadow-card">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-light text-teal-deep"><Icon size={20} /></span>
                <h3 className="mt-5 font-display text-base font-bold text-charcoal">{name}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-mid">{detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-6 border-t border-[#d8e1dc] bg-white px-5 py-12 sm:px-10 lg:px-16">
          <div className="grid gap-8 sm:grid-cols-3">
            {[['01', 'Register once', 'Create your account and submit your government ID for verification.'], ['02', 'Request a service', 'Tell us what your animal needs and choose a convenient schedule.'], ['03', 'Follow the visit', 'See confirmations and appointment updates in your portal.']].map(([number, title, detail]) => (
              <div key={number} className="flex gap-4"><span className="font-data text-sm font-bold text-amber-warm">{number}</span><div><h3 className="font-display font-bold text-charcoal">{title}</h3><p className="mt-1 text-sm leading-6 text-gray-mid">{detail}</p></div></div>
            ))}
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-3 bg-[#173c3a] px-5 py-6 text-xs text-white/70 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-16">
        <span className="font-display font-bold text-white">CityVet</span>
        <span>Office of the City Veterinarian · Gingoog City, Misamis Oriental</span>
        <span>© 2026 CityVet</span>
      </footer>
    </div>
  );
}
