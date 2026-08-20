import React from 'react';
import {
  ArrowRight,
  Clock3,
  Menu,
  X,
  Phone,
  Mail,
  Clock,
  Syringe,
  Scissors,
  Stethoscope,
  Activity,
  ShieldCheck,
  Bug,
  HeartPulse,
  CheckCircle2,
  PawPrint,
  Wheat,
} from 'lucide-react';

/**
 * Exact 10 home-based external veterinary services as listed in the document
 * (Section 1.5 Scope and the actual services list from Appendix B.1)
 */
const SERVICES = [
  {
    name: 'Artificial Insemination',
    detail: "Cattle and carabao artificial insemination service conducted at the client's location.",
    icon: Activity,
  },
  {
    name: 'Castration of Animals',
    detail: 'Castration procedures for livestock and domestic animals, performed by field technicians.',
    icon: Scissors,
  },
  {
    name: 'Consultation Services',
    detail: 'On-site veterinary consultation for animal health concerns and general wellness.',
    icon: Stethoscope,
  },
  {
    name: 'Deworming',
    detail: 'Internal parasite control for livestock, poultry, and household pets.',
    icon: CheckCircle2,
  },
  {
    name: 'Treatment of Animals',
    detail: 'On-site medical treatment for sick or injured animals. Mark as urgent when needed.',
    icon: HeartPulse,
  },
  {
    name: 'Vaccination of Livestock and Poultry',
    detail: 'Immunization services for farm animals including cattle, carabao, swine, and poultry.',
    icon: Syringe,
  },
  {
    name: 'Hog Inspection for Slaughter',
    detail: 'Pre-slaughter inspection of swine to ensure compliance with health standards.',
    icon: Wheat,
  },
  {
    name: 'Technical and Pesticide Assistance for Fly Control',
    detail: 'Technical guidance and pesticide application to control fly infestation in livestock areas.',
    icon: Bug,
  },
  {
    name: 'Rabies Vaccination of Dogs',
    detail: 'Free anti-rabies vaccination for dogs as part of the city\'s rabies control program.',
    icon: ShieldCheck,
  },
  {
    name: 'Voluntary Surrender of Dog',
    detail: 'Assisted surrender of dogs to the city. Urgent cases such as biting incidents are prioritized.',
    icon: PawPrint,
  },
];

export default function Landing({ onNavigate }) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const goTo = (destination) => {
    setMenuOpen(false);
    if (typeof onNavigate === 'function') {
      onNavigate(destination);
    }
  };

  return (
    <div className="overflow-hidden rounded-[24px] border border-[#d8e1dc] bg-[#fbfcf9] shadow-[0_18px_60px_rgba(27,94,92,0.08)] text-[#173c3a] font-sans">
      {/* Top Bar Navigation */}
      <header className="relative z-10 flex items-center justify-between border-b border-[#d8e1dc] bg-[#fbfcf9]/95 px-5 py-4 backdrop-blur sm:px-8">
        <button onClick={() => goTo('Landing')} className="flex items-center gap-3 text-left" aria-label="Go to CityVet home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#173c3a] text-lg font-bold text-white">C</span>
          <span className="block font-display text-lg font-bold leading-tight text-[#173c3a]">City Vet</span>
        </button>

        <nav className="hidden items-center gap-7 text-sm font-medium text-[#46605d] md:flex" aria-label="Primary navigation">
          <a href="#home" className="transition-colors hover:text-[#173c3a]">Home</a>
          <a href="#services" className="transition-colors hover:text-[#173c3a]">Services</a>
          <a href="#contact" className="transition-colors hover:text-[#173c3a]">Contact</a>
          <button onClick={() => goTo('Login')} className="border border-[#173c3a] px-4 py-2 text-[#173c3a] rounded-lg transition-colors hover:bg-[#e8f2ec]">Log in</button>
          <button onClick={() => goTo('Register')} className="bg-[#173c3a] px-4 py-2 text-white shadow-sm transition-colors hover:bg-[#25524f] rounded-lg">Register</button>
        </nav>

        <button onClick={() => setMenuOpen((open) => !open)} className="rounded-lg p-2 text-[#173c3a] md:hidden" aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {menuOpen && (
          <nav className="absolute inset-x-4 top-[72px] space-y-1 rounded-xl border border-[#d8e1dc] bg-white p-3 shadow-lg md:hidden z-20" aria-label="Mobile navigation">
            <a href="#home" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-[#173c3a] hover:bg-[#f2f6f4]">Home</a>
            <a href="#services" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-[#173c3a] hover:bg-[#f2f6f4]">Services</a>
            <a href="#contact" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-[#173c3a] hover:bg-[#f2f6f4]">Contact</a>
            <button onClick={() => goTo('Login')} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-[#173c3a] hover:bg-[#e8f2ec]">Log in</button>
            <button onClick={() => goTo('Register')} className="block w-full rounded-lg bg-[#173c3a] px-3 py-2 text-left text-sm font-medium text-white">Register</button>
          </nav>
        )}
      </header>

      <main>
        {/* Hero Section */}
        <section id="home" className="relative bg-[#e8f2ec] px-5 pb-16 pt-14 sm:px-10 sm:pb-20 sm:pt-20 lg:px-16">
          <div className="pointer-events-none absolute right-[-90px] top-[-110px] h-72 w-72 rounded-full border-[40px] border-[#cbded1] opacity-70" />
          <div className="relative grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-xl">
              <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-[#173c3a] sm:text-5xl">
                Gingoog City Veterinary Clinic's home-based services
              </h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-[#506864] sm:text-lg">
                The Office of the City Veterinarian provides free home-based veterinary services to all barangays in Gingoog City. Book an appointment online — we come to you.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => goTo('Register')}
                  className="group inline-flex items-center justify-center gap-2 rounded-lg bg-[#173c3a] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(27,94,92,0.2)] transition-transform hover:-translate-y-0.5"
                >
                  Book an Appointment <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => goTo('Login')}
                  className="rounded-lg border border-[#a9c2b3] bg-white/60 px-6 py-3 text-sm font-bold text-[#173c3a] transition-colors hover:bg-white"
                >
                  Sign in to Portal
                </button>
              </div>
            </div>

            {/* Feature Card */}
            <div className="relative mx-auto w-full max-w-md lg:mr-0">
              <div className="relative overflow-hidden rounded-[28px] bg-[#173c3a] p-6 text-white shadow-[0_22px_45px_rgba(27,94,92,0.22)] sm:p-8">
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border-[22px] border-white/10" />
                <h2 className="relative font-display text-3xl font-bold leading-tight">
                  10 Available Services
                </h2>
                <p className="relative mt-2 text-sm font-medium text-white/80">
                  Office of the City Veterinarian
                </p>
                <div className="relative mt-8 space-y-3">
                  {['Choose a service', 'Pick a preferred schedule', 'Track technician confirmation'].map((item, index) => (
                    <div key={item} className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-sm">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e3a835] font-bold text-[#173c3a]">{index + 1}</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <p className="relative mt-7 flex items-center gap-2 text-xs text-white/70">
                  <Clock3 size={15} /> Typical request takes less than 3 minutes
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="scroll-mt-6 bg-[#fbfcf9] px-5 py-14 sm:px-10 sm:py-16 lg:px-16">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#173c3a]">What we provide</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-[#173c3a] sm:text-3xl">Essential care, made accessible.</h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-[#506864]">Professional support from the city veterinary team, available across all barangays.</p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {SERVICES.map(({ name, detail, icon: Icon }) => (
              <article key={name} className="rounded-2xl border border-[#d8e1dc] bg-white p-5 transition-transform hover:-translate-y-1 hover:shadow-md">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f2ec] text-[#173c3a]">
                  <Icon size={20} />
                </span>
                <h3 className="mt-5 font-display text-base font-bold text-[#173c3a]">{name}</h3>
                <p className="mt-2 text-sm leading-6 text-[#506864]">{detail}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Contact / Footer Info Section */}
        <section id="contact" className="scroll-mt-6 border-t border-[#d8e1dc] bg-white px-5 py-12 sm:px-10 lg:px-16">
          <div className="grid gap-8 md:grid-cols-3 text-sm text-[#506864]">
            <div>
              <h3 className="font-bold text-[#173c3a] mb-3 text-base">Office of the City Veterinarian</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2"><Phone size={16} className="text-[#173c3a]" /> (088) 123-4567</li>
                <li className="flex items-center gap-2"><Mail size={16} className="text-[#173c3a]" /> vet@gingoogcity.gov.ph</li>
                <li className="flex items-center gap-2"><Clock size={16} className="text-[#173c3a]" /> Mon – Fri: 8:00 AM – 5:00 PM</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-[#173c3a] mb-3 text-base">Barangay Coverage</h3>
              <p className="leading-relaxed">
                Services are deployed across assigned barangay clusters throughout Gingoog City. Each barangay is assigned a dedicated field technician for efficient service delivery.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-[#173c3a] mb-3 text-base">Emergency Hotline</h3>
              <p className="leading-relaxed mb-2">
                For urgent animal health concerns, rabies biting incidents, or aggressive animals:
              </p>
              <p className="font-bold text-[#173c3a]">Office Phone: (088) 861-0000</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-3 bg-[#173c3a] px-5 py-6 text-xs text-white/70 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-16 border-t border-white/10">
        <span className="font-display font-bold text-white text-sm">City Vet</span>
        <span>Office of the City Veterinarian · Gingoog City, Misamis Oriental</span>
        <span>© 2026 CityVet. All rights reserved.</span>
      </footer>
    </div>
  );
}