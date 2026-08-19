const upcomingAppointments = [
  { service: 'Rabies Vaccination', date: 'Aug 18, 2026', time: '09:00 AM', status: 'Confirmed', badge: 'bg-green-light text-green-forest' },
  { service: 'Deworming', date: 'Aug 22, 2026', time: '02:00 PM', status: 'Pending', badge: 'bg-amber-light text-amber-warm' },
];

const recentBookings = [
  { service: 'Treatment of Animals', status: 'In Progress', date: 'Aug 08', reference: 'APT-2026-015' },
  { service: 'Vaccination', status: 'Completed', date: 'Jul 29', reference: 'APT-2026-009' },
  { service: 'Check-up', status: 'No-show', date: 'Jul 15', reference: 'APT-2026-007' },
];

export default function ClientDashboard() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-mid">Welcome back</p>
          <h1 className="font-display mt-2 text-3xl font-bold text-charcoal">Juan dela Cruz</h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="rounded-btn border border-teal-deep bg-white px-4 py-2 text-sm font-medium text-teal-deep transition-colors duration-150 hover:bg-green-light">
            My Appointments
          </button>
          <button className="rounded-btn bg-teal-deep px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-teal-mid">
            Book Appointment
          </button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-card border border-gray-light bg-white p-5 shadow-card">
          <p className="text-sm text-gray-mid">Upcoming Appointment</p>
          <h2 className="mt-3 text-xl font-semibold text-charcoal">Rabies Vaccination</h2>
          <p className="mt-2 text-sm text-gray-mid">Aug 18, 2026 • 09:00 AM</p>
          <span className="mt-4 inline-flex rounded-badge bg-green-light px-2.5 py-1 text-xs font-medium text-green-forest">
            Confirmed
          </span>
        </div>

        <div className="rounded-card border border-gray-light bg-white p-5 shadow-card">
          <p className="text-sm text-gray-mid">Total Bookings</p>
          <h2 className="mt-3 text-3xl font-bold text-charcoal">12</h2>
          <p className="mt-2 text-sm text-gray-mid">Across the last 12 months</p>
        </div>

        <div className="rounded-card border border-gray-light bg-white p-5 shadow-card">
          <p className="text-sm text-gray-mid">Pending Feedback</p>
          <h2 className="mt-3 text-3xl font-bold text-charcoal">02</h2>
          <button className="mt-3 text-sm font-medium text-teal-deep hover:text-teal-mid">Leave Feedback →</button>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-card border border-gray-light bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-gray-light bg-off-white px-4 py-3">
            <h2 className="font-display text-lg font-semibold text-charcoal">Upcoming Visits</h2>
            <span className="text-xs uppercase tracking-wide text-gray-mid">Next 2</span>
          </div>

          <div className="divide-y divide-gray-light">
            {upcomingAppointments.map((item) => (
              <div key={item.service} className="flex items-center justify-between gap-4 px-4 py-4">
                <div>
                  <p className="font-medium text-charcoal">{item.service}</p>
                  <p className="mt-1 text-sm text-gray-mid">{item.date} • {item.time}</p>
                </div>
                <span className={`inline-flex rounded-badge px-2.5 py-1 text-xs font-medium ${item.badge}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-card border border-gray-light bg-white p-5 shadow-card">
          <h2 className="font-display text-lg font-semibold text-charcoal">Quick Actions</h2>
          <div className="mt-4 space-y-3">
            <button className="flex w-full items-center justify-between rounded-btn border border-gray-light bg-off-white px-4 py-3 text-left text-sm font-medium text-charcoal transition-colors duration-150 hover:border-teal-deep hover:bg-green-light">
              <span>Book Appointment</span>
              <span>→</span>
            </button>
            <button className="flex w-full items-center justify-between rounded-btn border border-gray-light bg-off-white px-4 py-3 text-left text-sm font-medium text-charcoal transition-colors duration-150 hover:border-teal-deep hover:bg-green-light">
              <span>View History</span>
              <span>→</span>
            </button>
            <button className="flex w-full items-center justify-between rounded-btn border border-gray-light bg-off-white px-4 py-3 text-left text-sm font-medium text-charcoal transition-colors duration-150 hover:border-teal-deep hover:bg-green-light">
              <span>Notifications</span>
              <span>3</span>
            </button>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-card border border-gray-light bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-gray-light bg-off-white px-4 py-3">
          <h2 className="font-display text-lg font-semibold text-charcoal">Recent Booking History</h2>
          <button className="text-sm font-medium text-teal-deep hover:text-teal-mid">View all</button>
        </div>

        <div className="divide-y divide-gray-light">
          {recentBookings.map((item) => (
            <div key={item.reference} className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-charcoal">{item.service}</p>
                <p className="text-sm text-gray-mid">{item.reference}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-mid">{item.date}</span>
                <span className={`inline-flex rounded-badge px-2.5 py-1 text-xs font-medium ${
                  item.status === 'Completed'
                    ? 'bg-green-light text-green-forest'
                    : item.status === 'In Progress'
                      ? 'bg-amber-light text-amber-warm'
                      : 'bg-red-light text-red-muted'
                }`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
