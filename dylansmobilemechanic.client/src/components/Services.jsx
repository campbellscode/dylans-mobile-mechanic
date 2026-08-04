const SERVICES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
    title: 'Diagnostics',
    desc: 'Professional OBD diagnostics to pinpoint warning lights and hidden issues before they become costly problems.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="3.5" />
        <line x1="12" y1="2.5" x2="12" y2="8.5" />
        <line x1="12" y1="15.5" x2="12" y2="21.5" />
        <line x1="2.5" y1="12" x2="8.5" y2="12" />
        <line x1="15.5" y1="12" x2="21.5" y2="12" />
      </svg>
    ),
    title: 'Brake Service',
    desc: 'Pad replacement, rotor inspection, and brake fluid service to keep your stopping power sharp and safe.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="19" height="11" rx="2" />
        <path d="M21 11v3" />
        <rect x="5" y="10" width="5" height="5" rx="1" />
      </svg>
    ),
    title: 'Battery Replacement',
    desc: 'Fast battery testing and replacement — done at your location so you\'re never stranded again.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C8.5 2 6 5 6 8c0 5 6 14 6 14s6-9 6-14c0-3-2.5-6-6-6z" />
        <circle cx="12" cy="8.5" r="2.5" />
      </svg>
    ),
    title: 'Oil Changes',
    desc: 'Conventional or synthetic oil and filter changes — clean, fast, and done wherever your car is parked.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    title: 'Tune-Ups',
    desc: 'Spark plugs, air filters, and ignition system checks to restore power, performance, and fuel efficiency.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    title: 'General Repairs',
    desc: 'Belts, hoses, starters, alternators, cooling system repairs, and more — most jobs completed on-site.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
        <polyline points="11 8 11 11 13 13" />
      </svg>
    ),
    title: 'Pre-Purchase Inspections',
    desc: "Don't buy a lemon. Get a thorough inspection at any location before you commit — confidence included.",
  },
];

export default function Services() {
  return (
    <section id="services" className="section services">
      <div className="container">
        <div className="section-header">
          <span className="section-label">What We Do</span>
          <span className="accent-line" />
          <h2 className="section-title">Our Services</h2>
          <p className="section-subtitle">
            From routine maintenance to unexpected repairs, we handle it all — right at your location, on your schedule.
          </p>
        </div>

        <div className="services__grid">
          {SERVICES.map((s, i) => (
            <div key={s.title} className="service-card">
              <span className="service-card__num" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="service-card__icon">{s.icon}</div>
              <h3 className="service-card__title">{s.title}</h3>
              <p className="service-card__desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
