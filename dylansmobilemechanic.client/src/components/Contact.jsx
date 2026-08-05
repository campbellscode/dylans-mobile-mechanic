import { useState } from 'react';
import Stage from './Stage';
import Reveal from './Reveal';

const SERVICE_OPTIONS = [
  'Diagnostics',
  'Brake Service',
  'Battery Replacement',
  'Oil Change',
  'Tune-Up',
  'General Repair',
  'Pre-Purchase Inspection',
  'Other',
];

const STEPS = [
  { title: 'Tell us about the vehicle', desc: 'Year, make, model, and what it’s doing.' },
  { title: 'Dylan reviews the request', desc: 'He reads every one himself — no call centre.' },
  { title: 'We confirm time and price', desc: 'Then the van comes to you.' },
];

/* Editable contact details */
const PHONE_DISPLAY = '(555) 123-4567';
const PHONE_HREF = '+15551234567';
const EMAIL = 'dylan@dylansmobilemechanic.com';
const HOURS = 'Mon–Sat, 7am – 7pm';

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.18 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export default function Contact() {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', vehicle: '', service: '', message: '',
  });
  const [ready, setReady] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setReady(true);
  };

  // No server is wired up yet, so the request is handed to the customer's own
  // mail client rather than pretending it was received.
  const mailHref = (() => {
    const subject = `Quote request — ${form.vehicle || 'vehicle'}`;
    const body = [
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
      `Email: ${form.email || '—'}`,
      `Vehicle: ${form.vehicle}`,
      `Service needed: ${form.service || '—'}`,
      '',
      'Details:',
      form.message || '—',
    ].join('\n');
    return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  })();

  return (
    <section id="contact" className="section section--routed section--end quote">
      <div className="container quote__inner">
        {/* ---------- What happens next ---------- */}
        <div className="quote__aside">
          <Stage
            num="06"
            label="Request Service"
            title="Book the Van"
            lead="Send the details and Dylan will come back with a quote — no obligation, no pressure, no sales script."
          />

          {/* Each step activates after the previous one — the same route
              idea as the rest of the page, in miniature */}
          <ol className="next">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} as="li" variant="rise" index={i} step={90} className="next__step">
                <span className="next__node" aria-hidden="true">{i + 1}</span>
                <div className="next__body">
                  <h3 className="next__title">{s.title}</h3>
                  <p className="next__desc">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </ol>

          <Reveal as="ul" variant="rise" delay={320} className="quote__contact">
            <li className="quote__contact-item">
              <span className="quote__contact-icon"><PhoneIcon /></span>
              <span>
                <span className="quote__contact-label">Phone</span>
                <a href={`tel:${PHONE_HREF}`} className="quote__contact-value quote__contact-value--link">{PHONE_DISPLAY}</a>
              </span>
            </li>
            <li className="quote__contact-item">
              <span className="quote__contact-icon"><MailIcon /></span>
              <span>
                <span className="quote__contact-label">Email</span>
                <a href={`mailto:${EMAIL}`} className="quote__contact-value quote__contact-value--link">{EMAIL}</a>
              </span>
            </li>
            <li className="quote__contact-item">
              <span className="quote__contact-icon"><ClockIcon /></span>
              <span>
                <span className="quote__contact-label">Hours</span>
                <span className="quote__contact-value">{HOURS}</span>
              </span>
            </li>
          </Reveal>
        </div>

        {/* ---------- The form: settles into place as one panel, fields
            stagger lightly inside it once it's in view ---------- */}
        <Reveal variant="lock" delay={80} className="quote__form panel">
          <span className="edge" aria-hidden="true" />

          {ready ? (
            <div className="ready" role="status">
              <span className="ready__mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <h3 className="ready__title">Your request is ready to send</h3>
              <p className="ready__desc">
                Send it straight to Dylan below, or call now if the vehicle needs attention today.
              </p>
              <div className="ready__actions">
                <a href={mailHref} className="btn btn--primary btn--lg btn--block">Send to Dylan</a>
                <a href={`tel:${PHONE_HREF}`} className="btn btn--ghost btn--block">
                  <PhoneIcon />Call {PHONE_DISPLAY}
                </a>
                <button type="button" className="ready__back" onClick={() => setReady(false)}>
                  Edit my details
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate={false}>
              <Reveal as="fieldset" variant="rise" index={0} step={60} className="fieldset">
                <legend className="fieldset__legend">Your contact</legend>

                <div className="field-row">
                  <div className="field">
                    <label className="field__label" htmlFor="name">Full name <span aria-hidden="true">*</span></label>
                    <input id="name" name="name" className="field__input" type="text" required
                      autoComplete="name" value={form.name} onChange={set('name')} />
                  </div>
                  <div className="field">
                    <label className="field__label" htmlFor="phone">Phone <span aria-hidden="true">*</span></label>
                    <input id="phone" name="phone" className="field__input" type="tel" required
                      autoComplete="tel" value={form.phone} onChange={set('phone')} />
                  </div>
                </div>

                <div className="field">
                  <label className="field__label" htmlFor="email">Email</label>
                  <input id="email" name="email" className="field__input" type="email"
                    autoComplete="email" value={form.email} onChange={set('email')} />
                </div>
              </Reveal>

              <Reveal as="fieldset" variant="rise" index={1} step={60} className="fieldset">
                <legend className="fieldset__legend">Your vehicle</legend>

                <div className="field">
                  <label className="field__label" htmlFor="vehicle">Year, make and model <span aria-hidden="true">*</span></label>
                  <input id="vehicle" name="vehicle" className="field__input" type="text" required
                    placeholder="2018 Honda Accord" value={form.vehicle} onChange={set('vehicle')} />
                </div>

                <div className="field">
                  <label className="field__label" htmlFor="service">Service needed</label>
                  <select id="service" name="service" className="field__input field__select"
                    value={form.service} onChange={set('service')}>
                    <option value="">Not sure yet</option>
                    {SERVICE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="field">
                  <label className="field__label" htmlFor="message">What&rsquo;s going on?</label>
                  <textarea id="message" name="message" className="field__input field__textarea" rows={4}
                    placeholder="Noises, warning lights, when it started…" value={form.message} onChange={set('message')} />
                </div>
              </Reveal>

              <Reveal as="div" variant="rise" index={2} step={60} className="quote__submit">
                <button type="submit" className="btn btn--primary btn--lg btn--block">Request My Quote</button>
                <p className="quote__note">
                  <span aria-hidden="true">*</span> Required. Prefer to talk?{' '}
                  <a href={`tel:${PHONE_HREF}`} className="quote__note-link">Call {PHONE_DISPLAY}</a>.
                </p>
              </Reveal>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
