import { useState } from 'react';

const SERVICES = [
  'Diagnostics',
  'Brake Service',
  'Battery Replacement',
  'Oil Change',
  'Tune-Up',
  'General Repair',
  'Pre-Purchase Inspection',
  'Other',
];

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.18 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export default function Contact() {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', vehicle: '', service: '', message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contact" className="section contact">
      <div className="container">
        <div className="contact__inner">
          <div className="contact__info">
            <span className="section-label">Get in Touch</span>
            <span className="accent-line" />
            <h2 className="section-title">Request a Quote</h2>
            <p className="contact__info-body">
              Ready to get your vehicle back in shape? Fill out the form and Dylan will follow up
              with a quote — usually within a few hours. No obligation, no pressure.
            </p>

            <div className="contact__details">
              <div className="contact__detail">
                <div className="contact__detail-icon"><PhoneIcon /></div>
                <div>
                  <div className="contact__detail-label">Phone</div>
                  <div className="contact__detail-value">(555) 123-4567</div>
                </div>
              </div>
              <div className="contact__detail">
                <div className="contact__detail-icon"><MailIcon /></div>
                <div>
                  <div className="contact__detail-label">Email</div>
                  <div className="contact__detail-value">dylan@dylansmobilemechanic.com</div>
                </div>
              </div>
              <div className="contact__detail">
                <div className="contact__detail-icon"><ClockIcon /></div>
                <div>
                  <div className="contact__detail-label">Hours</div>
                  <div className="contact__detail-value">Mon–Sat, 7am – 7pm</div>
                </div>
              </div>
            </div>
          </div>

          <div className="contact__form">
            {submitted ? (
              <div className="form-success">
                <p style={{ marginBottom: 8, fontSize: 20 }}>✓</p>
                <p>Thanks! Your request has been received.</p>
                <p style={{ fontSize: 14, color: 'var(--clr-text-muted)', marginTop: 8 }}>
                  Dylan will be in touch within a few hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="name">Full Name *</label>
                    <input
                      id="name" className="form-input" type="text" required
                      placeholder="Jane Smith" value={form.name} onChange={set('name')}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="phone">Phone *</label>
                    <input
                      id="phone" className="form-input" type="tel" required
                      placeholder="(555) 000-0000" value={form.phone} onChange={set('phone')}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email</label>
                  <input
                    id="email" className="form-input" type="email"
                    placeholder="you@example.com" value={form.email} onChange={set('email')}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="vehicle">Vehicle (Year, Make, Model) *</label>
                  <input
                    id="vehicle" className="form-input" type="text" required
                    placeholder="2018 Honda Accord" value={form.vehicle} onChange={set('vehicle')}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="service">Service Needed</label>
                  <select id="service" className="form-select" value={form.service} onChange={set('service')}>
                    <option value="">Select a service...</option>
                    {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="message">Additional Details</label>
                  <textarea
                    id="message" className="form-textarea"
                    placeholder="Describe what's going on with your vehicle..." rows={4}
                    value={form.message} onChange={set('message')}
                  />
                </div>

                <div className="form-submit">
                  <button type="submit" className="btn btn--primary btn--lg" style={{ justifyContent: 'center' }}>
                    Send Request
                  </button>
                  <p className="form-note">We'll respond within a few hours during business hours.</p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
