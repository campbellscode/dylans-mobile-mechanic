import Stage from './Stage';
import Reveal from './Reveal';

const STANDARDS = [
  {
    title: 'We Come to You',
    desc: 'No tow trucks, no waiting rooms, no Ubers. We show up at your home, office, or anywhere your car is.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C8.5 2 6 5 6 8c0 5 6 14 6 14s6-9 6-14c0-3-2.5-6-6-6z" />
        <circle cx="12" cy="8.5" r="2.5" />
      </svg>
    ),
  },
  {
    title: 'Flexible Scheduling',
    desc: 'Book around your life, not ours. We offer flexible appointment times including evenings and weekends.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    title: 'Honest & Transparent',
    desc: 'Upfront pricing, no hidden fees. We explain exactly what your vehicle needs before we start any work.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
  {
    title: 'Quality Workmanship',
    desc: 'Professional-grade tools and quality parts on every job. We take pride in doing it right the first time.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    title: 'Clear Communication',
    desc: "You'll always know what's happening with your vehicle. We explain everything in plain language — no jargon.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    title: 'Customer-First Service',
    desc: "Your satisfaction is the job. We're not done until you're confident your car is fixed and back on the road.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
];

export default function WhyChooseUs() {
  return (
    <section className="section section--routed standards">
      <div className="container">
        <Stage
          num="03"
          label="Workshop Standards"
          title="The Checklist Behind Every Job"
          lead="Auto repair is stressful because of how it's usually done. These are the standards we hold ourselves to instead."
        />

        <ol className="checklist">
          {STANDARDS.map((s, i) => (
            <Reveal key={s.title} as="li" variant="rise" index={i} step={80} className="check">
              <span className="check__idx" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <span className="check__icon" aria-hidden="true">{s.icon}</span>
              <div className="check__body">
                <h3 className="check__title">{s.title}</h3>
                <p className="check__desc">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
