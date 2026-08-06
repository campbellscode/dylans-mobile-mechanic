import { useState, useEffect, useRef } from 'react';
import Stage from './Stage';
import Reveal from './Reveal';

/* Customer-facing dropdown shows label only — never a price. This exists
 * purely to render the <select> in the right order; it is never trusted
 * for pricing. The server holds the one authoritative catalog
 * (DylansMobileMechanic.Server/Pricing/ServicePricingCatalog.cs) and
 * calculates every dollar amount shown in the estimate panel. */
const SERVICE_CATALOG = [
  { value: 'diagnostic', label: 'Diagnostic' },
  { value: 'brake-service', label: 'Brake Service' },
  { value: 'oil-changes', label: 'Oil Changes' },
  { value: 'tune-ups', label: 'Tune-Ups' },
  { value: 'ac-service', label: 'A/C Service' },
  { value: 'battery-replacement', label: 'Battery Replacement' },
  { value: 'alternator-replacement', label: 'Alternator Replacement' },
  { value: 'starter-replacement', label: 'Starter Replacement' },
  { value: 'cooling-system-repairs', label: 'Cooling System Repairs' },
  { value: 'suspension-repairs', label: 'Suspension Repairs' },
  { value: 'electrical-diagnosis', label: 'Electrical Diagnosis' },
  { value: 'other', label: 'Other' },
];

/* The empty placeholder option maps to this stable code before the
 * quote-calculate request is sent. Must match the server catalog. */
const NOT_SURE_YET_CODE = 'not-sure-yet';

const STEPS = [
  { title: 'Tell us about the vehicle', desc: 'Year, make, model, and what it’s doing.' },
  { title: 'Dylan reviews the request', desc: 'He reads every one himself — no call centre.' },
  { title: 'We confirm time and price', desc: 'Then the van comes to you.' },
];

/* Editable contact details */
const PHONE_DISPLAY = '(513) 846-1958';
const PHONE_HREF = '+15138461958';
const EMAIL = 'dyfrey94@gmail.com';
const HOURS = 'Mon-Fri, 4:30pm-12am';

/* Fields that invalidate a computed estimate when changed */
const ESTIMATE_FIELDS = ['service', 'serviceAddress', 'serviceCity', 'serviceState', 'servicePostalCode'];

const QUOTE_ERROR_MESSAGES = {
  invalid_service_code: 'Please choose a service from the list and try again.',
  invalid_address: "We couldn't process that address — please check it and try again.",
  route_configuration_unavailable: 'The automatic quote calculator is unavailable right now.',
  route_provider_unauthorized: 'The automatic quote calculator is unavailable right now.',
  route_provider_invalid_request: "We couldn't process that address — please check it and try again.",
  route_provider_rate_limited: 'The automatic quote calculator is busy right now. Please try again shortly.',
  route_service_timeout: 'The automatic quote calculator timed out. Please try again.',
  route_provider_unavailable: 'The automatic quote calculator is unavailable right now.',
  route_not_found: "We couldn't find a driving route to that address.",
  route_provider_invalid_response: 'The automatic quote calculator is unavailable right now.',
  network_error: "We couldn't reach our server — check your connection and try again.",
  unknown_error: 'Something went wrong calculating your estimate.',
};

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

const INITIAL_FORM = {
  name: '', phone: '', email: '', vehicle: '', service: '', message: '',
  serviceAddress: '', serviceCity: '', serviceState: '', servicePostalCode: '',
};

export default function Contact() {
  const [form, setForm] = useState(INITIAL_FORM);

  // 'form' | 'calculating' | 'estimate' | 'error'
  const [quoteState, setQuoteState] = useState('form');
  const [estimate, setEstimate] = useState(null);
  const [quoteErrorCode, setQuoteErrorCode] = useState(null);
  const estimatePanelRef = useRef(null);

  // Runs after React has committed the estimate panel to the DOM (the
  // effect fires after render, so the ref is guaranteed to be attached —
  // no risk of scrolling before the panel exists).
  useEffect(() => {
    if (quoteState !== 'estimate' || !estimatePanelRef.current) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    estimatePanelRef.current.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }, [quoteState]);

  const set = (field) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
    // Editing anything the estimate was calculated from invalidates it —
    // no separate "recalculate" button, just re-submit when ready.
    if (ESTIMATE_FIELDS.includes(field) && quoteState !== 'form') {
      setQuoteState('form');
      setEstimate(null);
      setQuoteErrorCode(null);
    }
  };

  // Clear wipes every field and abandons any in-progress/completed quote.
  const handleClear = () => {
    setForm(INITIAL_FORM);
    setQuoteState('form');
    setEstimate(null);
    setQuoteErrorCode(null);
  };

  // Reset keeps the entered field values but discards the current estimate
  // — same effect as the automatic stale-estimate invalidation, just
  // triggered manually instead of by editing a field.
  const handleResetEstimate = () => {
    setQuoteState('form');
    setEstimate(null);
    setQuoteErrorCode(null);
  };

  const serviceLabel = SERVICE_CATALOG.find((s) => s.value === form.service)?.label || 'Not sure yet';
  const serviceAddressLine = [form.serviceAddress, form.serviceCity, form.serviceState, form.servicePostalCode]
    .filter(Boolean).join(', ') || '—';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (quoteState === 'calculating') return;

    setQuoteState('calculating');
    setEstimate(null);
    setQuoteErrorCode(null);

    try {
      const response = await fetch('/api/quote/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceCode: form.service || NOT_SURE_YET_CODE,
          streetAddress: form.serviceAddress,
          city: form.serviceCity,
          state: form.serviceState,
          postalCode: form.servicePostalCode,
        }),
      });

      if (!response.ok) {
        let errorCode = 'unknown_error';
        try {
          const errorBody = await response.json();
          errorCode = errorBody?.error ?? errorCode;
        } catch {
          // Response wasn't JSON — leave errorCode as unknown_error.
        }
        console.error(`Quote calculation failed: HTTP ${response.status} (${errorCode})`);
        setQuoteErrorCode(errorCode);
        setQuoteState('error');
        return;
      }

      const data = await response.json();
      setEstimate(data);
      setQuoteState('estimate');
    } catch (err) {
      console.error('Quote calculation request failed before reaching the server:', err);
      setQuoteErrorCode('network_error');
      setQuoteState('error');
    }
  };

  // Strips line breaks and caps length before a value goes into a mailto
  // subject — subjects are a single header line, never multi-line.
  const sanitizeSubjectPart = (text, maxLength = 60) => {
    const cleaned = (text || '').replace(/[\r\n]+/g, ' ').trim();
    return cleaned.length > maxLength ? cleaned.slice(0, maxLength).trim() : cleaned;
  };

  // Base request details every "send" email includes, regardless of outcome.
  const baseMailLines = () => [
    `Name: ${form.name}`,
    `Phone: ${form.phone}`,
    `Email: ${form.email || '—'}`,
    `Vehicle: ${form.vehicle}`,
    `Service needed: ${serviceLabel}`,
    `Service address: ${serviceAddressLine}`,
    '',
    'Details:',
    form.message || '—',
  ];

  // Only meaningful once quoteState === 'estimate' — this is what "Send to
  // Dylan" links to. The mailto body is fully editable by the customer, so
  // this is explicitly labeled as an automated, unverified estimate.
  const mailHref = (() => {
    const customerName = sanitizeSubjectPart(form.name) || 'Customer';
    const serviceName = sanitizeSubjectPart(estimate?.serviceName || serviceLabel);
    const subject = estimate && !estimate.withinStandardServiceArea
      ? `Custom Travel Quote Request — ${serviceName} — ${customerName}`
      : `Quote Request — ${serviceName} — ${customerName}`;
    const lines = [...baseMailLines()];

    if (estimate) {
      lines.push('', 'Automated preliminary estimate:', '');
      lines.push(`Service needed: ${estimate.serviceName}`);
      lines.push(`Service address: ${serviceAddressLine}`);
      lines.push(`Pricing guidance: ${estimate.pricingGuidance}`);
      lines.push(`One-way driving distance: ${estimate.oneWayDistanceMiles} miles`);
      lines.push(`Estimated one-way driving time: ${estimate.oneWayDurationMinutes} minutes`);

      if (estimate.withinStandardServiceArea) {
        lines.push(`Round-trip billable mileage: ${estimate.roundTripBillableMiles} miles`);
        lines.push(`Mobile service fee: $${estimate.travelFee.toFixed(2)}`);
        // Never $0.00 and never a fabricated line — omitted entirely when
        // the pricing type (Hourly/ManualReview) has no calculable subtotal.
        if (estimate.estimatedStartingSubtotal != null) {
          lines.push(`Estimated starting subtotal: $${estimate.estimatedStartingSubtotal.toFixed(2)}`);
        }
        lines.push(`Standard labor rate: $${estimate.standardLaborRatePerHour.toFixed(0)}/hour`);
        lines.push('Parts: Quoted separately');
        lines.push('Within standard service area: Yes');
      } else {
        // No fabricated mileage/fee/subtotal for a location outside the
        // configured radius — status lines first, then the pending notes.
        lines.push('Within standard service area: No');
        lines.push('Custom travel quote required: Yes');
        lines.push('Mobile service fee: Pending manual review');
        lines.push('Estimated starting subtotal: Not available pending manual review');
      }

      lines.push('', 'Estimate must be verified by Dylan before acceptance.');
    }

    return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
  })();

  // Fallback path when the automated calculation fails — no guessed
  // mileage or pricing, no claim about being in the service area.
  const manualReviewMailHref = (() => {
    const customerName = sanitizeSubjectPart(form.name) || 'Customer';
    const subject = `Manual Quote Review Request — ${customerName}`;
    const lines = [...baseMailLines(), '', 'Automated estimate unavailable — manual review required'];
    return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
  })();

  const submitBusy = quoteState === 'calculating';

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
                <a href={`tel:${PHONE_HREF}`} className="quote__contact-value quote__contact-value--link contact-link">{PHONE_DISPLAY}</a>
              </span>
            </li>
            <li className="quote__contact-item">
              <span className="quote__contact-icon"><MailIcon /></span>
              <span>
                <span className="quote__contact-label">Email</span>
                <a href={`mailto:${EMAIL}`} className="quote__contact-value quote__contact-value--link contact-link">{EMAIL}</a>
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
            stagger lightly inside it once it's in view. Stays visible and
            editable throughout — the estimate/error panel appears below
            the submit button rather than replacing the form. ---------- */}
        <Reveal variant="lock" delay={80} className="quote__form panel">
          <span className="edge" aria-hidden="true" />

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
            </Reveal>

            <Reveal as="fieldset" variant="rise" index={1} step={60} className="fieldset">
              <legend className="fieldset__legend">Service address</legend>

              <div className="field">
                <label className="field__label" htmlFor="serviceAddress">Street address <span aria-hidden="true">*</span></label>
                <input id="serviceAddress" name="serviceAddress" className="field__input" type="text" required
                  autoComplete="street-address" placeholder="123 Main St" value={form.serviceAddress} onChange={set('serviceAddress')} />
              </div>

              <div className="field-row field-row--3">
                <div className="field">
                  <label className="field__label" htmlFor="serviceCity">City <span aria-hidden="true">*</span></label>
                  <input id="serviceCity" name="serviceCity" className="field__input" type="text" required
                    autoComplete="address-level2" value={form.serviceCity} onChange={set('serviceCity')} />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="serviceState">State <span aria-hidden="true">*</span></label>
                  <input id="serviceState" name="serviceState" className="field__input" type="text" required
                    autoComplete="address-level1" placeholder="OH" maxLength={2} value={form.serviceState} onChange={set('serviceState')} />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="servicePostalCode">ZIP code <span aria-hidden="true">*</span></label>
                  <input id="servicePostalCode" name="servicePostalCode" className="field__input" type="text" required
                    autoComplete="postal-code" inputMode="numeric" placeholder="45202" value={form.servicePostalCode} onChange={set('servicePostalCode')} />
                </div>
              </div>
            </Reveal>

            <Reveal as="div" variant="rise" index={2} step={60} className="field">
              <label className="field__label" htmlFor="email">Email</label>
              <input id="email" name="email" className="field__input" type="email"
                autoComplete="email" value={form.email} onChange={set('email')} />
            </Reveal>

            <Reveal as="fieldset" variant="rise" index={3} step={60} className="fieldset">
              <legend className="fieldset__legend">Your vehicle</legend>

              <div className="field">
                <label className="field__label" htmlFor="vehicle">Year, make and model <span aria-hidden="true">*</span></label>
                <input id="vehicle" name="vehicle" className="field__input" type="text" required
                  placeholder="2018 Honda Accord" value={form.vehicle} onChange={set('vehicle')} />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="service">Service needed</label>
                <p className="field__hint">Starting prices vary by service — labor rate is $100/hr. Parts are quoted separately.</p>
                <select id="service" name="service" className="field__input field__select"
                  value={form.service} onChange={set('service')}>
                  <option value="">Not sure yet</option>
                  {SERVICE_CATALOG.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              <div className="field">
                <label className="field__label" htmlFor="message">What&rsquo;s going on?</label>
                <textarea id="message" name="message" className="field__input field__textarea" rows={4}
                  placeholder="Noises, warning lights, when it started…" value={form.message} onChange={set('message')} />
              </div>
            </Reveal>

            <Reveal as="div" variant="rise" index={4} step={60} className="quote__submit">
              <div className="quote__actions">
                <button type="button" className="btn btn--ghost btn--lg" onClick={handleClear} disabled={submitBusy}>
                  Clear
                </button>
                <button type="submit" className="btn btn--primary btn--lg" disabled={submitBusy}>
                  {submitBusy && <span className="check-address__spinner" aria-hidden="true" />}
                  {submitBusy ? 'Calculating Your Quote…' : 'Request My Quote'}
                </button>
              </div>
              <p className="quote__note">
                <span aria-hidden="true">*</span> Required. Prefer to talk?{' '}
                <a href={`tel:${PHONE_HREF}`} className="quote__note-link contact-link">Call {PHONE_DISPLAY}</a>.
              </p>
              <p className="quote__pricing-notice">
                Labor rate: $100/hour. Parts are quoted separately. The mobile service fee is calculated
                from round-trip driving mileage, with a $25 minimum. Final pricing depends on the vehicle,
                parts required, accessibility, rust or corrosion, and actual repair requirements.
              </p>
            </Reveal>

            <div aria-live="polite">
              {quoteState === 'estimate' && estimate && (
                <div ref={estimatePanelRef} className={`quote-estimate${estimate.withinStandardServiceArea ? '' : ' quote-estimate--outside'}`}>
                  <span className="quote-estimate__eyebrow">Automated Preliminary Estimate</span>

                  <dl className="quote-estimate__rows">
                    <div className="quote-estimate__row">
                      <dt>Service</dt><dd>{estimate.serviceName}</dd>
                    </div>
                    <div className="quote-estimate__row">
                      <dt>Pricing guidance</dt><dd>{estimate.pricingGuidance}</dd>
                    </div>
                    <div className="quote-estimate__row">
                      <dt>One-way driving distance</dt><dd>{estimate.oneWayDistanceMiles} miles</dd>
                    </div>
                    <div className="quote-estimate__row">
                      <dt>Estimated one-way driving time</dt><dd>About {estimate.oneWayDurationMinutes} minutes</dd>
                    </div>

                    {estimate.withinStandardServiceArea ? (
                      <>
                        <div className="quote-estimate__row">
                          <dt>Round-trip billable mileage</dt><dd>{estimate.roundTripBillableMiles} miles</dd>
                        </div>
                        <div className="quote-estimate__row">
                          <dt>Mobile service fee</dt><dd>${estimate.travelFee.toFixed(2)}</dd>
                        </div>
                        {estimate.estimatedStartingSubtotal != null && (
                          <div className="quote-estimate__row quote-estimate__row--total">
                            <dt>Estimated starting subtotal</dt><dd>${estimate.estimatedStartingSubtotal.toFixed(2)}</dd>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="quote-estimate__row">
                        <dt>Service area</dt><dd>Outside our standard area</dd>
                      </div>
                    )}
                  </dl>

                  {estimate.withinStandardServiceArea ? (
                    <p className="quote-estimate__meta">
                      Standard labor rate: ${estimate.standardLaborRatePerHour.toFixed(0)}/hour. Parts are quoted separately.
                    </p>
                  ) : (
                    <p className="quote-estimate__message">{estimate.message}</p>
                  )}

                  <p className="quote-estimate__disclaimer">
                    Final pricing depends on the vehicle, parts required, accessibility, rust or corrosion,
                    and actual repair requirements.
                  </p>
                  <p className="quote-estimate__verify">Estimate must be verified by Dylan before acceptance.</p>

                  <div className="quote-estimate__actions">
                    <button type="button" className="btn btn--ghost btn--lg" onClick={handleResetEstimate}>Reset</button>
                    <a href={mailHref} className="btn btn--primary btn--lg">Send to Dylan</a>
                  </div>
                </div>
              )}

              {quoteState === 'error' && (
                <div className="quote-error" role="alert">
                  <span className="quote-estimate__eyebrow quote-estimate__eyebrow--muted">Estimate Unavailable</span>
                  <p className="quote-error__message">
                    {QUOTE_ERROR_MESSAGES[quoteErrorCode] || QUOTE_ERROR_MESSAGES.unknown_error}
                  </p>
                  <a href={manualReviewMailHref} className="btn btn--ghost btn--block quote-estimate__send">Send for Manual Review</a>
                  <p className="quote-error__contact">
                    Or reach Dylan directly:{' '}
                    <a href={`tel:${PHONE_HREF}`} className="contact-link">{PHONE_DISPLAY}</a>
                    {' '}&middot;{' '}
                    <a href={`mailto:${EMAIL}`} className="contact-link">{EMAIL}</a>
                  </p>
                </div>
              )}
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
