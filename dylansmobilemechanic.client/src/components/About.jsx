import Stage from './Stage';

const VALUES = [
  { term: 'Convenience', desc: 'Service that works around your life' },
  { term: 'Integrity', desc: 'Honest assessments, fair pricing' },
  { term: 'Quality', desc: 'Professional tools, quality parts' },
  { term: 'Reliability', desc: 'On time, every time' },
  { term: 'Communication', desc: "You're always in the loop" },
];

/* Facts only — nothing here should be a claim we can't back up. */
const FACTS = [
  { value: '100%', label: 'Mobile service' },
  { value: '$0', label: 'Hidden fees' },
  { value: '6', label: 'Days a week' },
];

export default function About() {
  return (
    <section id="about" className="section section--routed about">
      <div className="container about__inner">
        <div className="about__copy">
          <Stage
            num="05"
            label="Your Mechanic"
            title="One Mechanic. Your Driveway."
            lead="Dylan's Mobile Mechanic started from a simple frustration: auto repair shouldn't cost you a whole day in a shop waiting room."
          />

          <p className="about__body">
            Whether you&rsquo;re at home, at work, or stuck somewhere unexpected, the workshop comes to
            you. With professional training, quality tools, and a habit of doing the job properly,
            Dylan delivers dealership-grade work at a fair price — without the overhead or the runaround.
          </p>

          <dl className="facts">
            {FACTS.map((f) => (
              <div key={f.label} className="facts__item">
                <dt className="facts__value">{f.value}</dt>
                <dd className="facts__label">{f.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="commitment panel">
          <span className="edge" aria-hidden="true" />
          <h3 className="commitment__title">Our Commitment</h3>
          <ol className="commitment__list">
            {VALUES.map((v, i) => (
              <li key={v.term} className="commitment__row">
                <span className="commitment__idx" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <span className="commitment__term">{v.term}</span>
                <span className="commitment__desc">{v.desc}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
