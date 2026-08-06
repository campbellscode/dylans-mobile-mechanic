import { useState } from 'react';
import Stage from './Stage';
import Reveal from './Reveal';

const AREAS = [
  'Cincinnati, OH',
  'Northern Kentucky',
  'Covington, KY',
  'Florence, KY',
  'Mason, OH',
  'Loveland, OH',
  'Milford, OH',
];

/* Same values used by Contact/Footer/Navbar */
const PHONE_DISPLAY = '(513) 846-1958';
const PHONE_HREF = '+15138461958';
const EMAIL = 'dyfrey94@gmail.com';

const STATUS = {
  IDLE: 'idle',
  LOCATING: 'locating',
  CHECKING: 'checking',
  WITHIN: 'within',
  OUTSIDE: 'outside',
  DENIED: 'denied',
  UNAVAILABLE: 'unavailable',
  SERVICE_DOWN: 'service-down',
};

const BUSY_STATES = [STATUS.LOCATING, STATUS.CHECKING];
const RESULT_STATES = [STATUS.WITHIN, STATUS.OUTSIDE, STATUS.DENIED, STATUS.UNAVAILABLE, STATUS.SERVICE_DOWN];

const BUTTON_LABEL = {
  [STATUS.IDLE]: 'Check My Address',
  [STATUS.LOCATING]: 'Getting Your Location…',
  [STATUS.CHECKING]: 'Checking Driving Distance…',
};

export default function ServiceArea() {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [result, setResult] = useState(null);

  const busy = BUSY_STATES.includes(status);
  const buttonLabel = BUTTON_LABEL[status] ?? (RESULT_STATES.includes(status) ? 'Check Again' : BUTTON_LABEL[STATUS.IDLE]);

  const handleCheck = () => {
    if (!('geolocation' in navigator)) {
      setStatus(STATUS.UNAVAILABLE);
      return;
    }

    setResult(null);
    setStatus(STATUS.LOCATING);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setStatus(STATUS.CHECKING);
        try {
          const response = await fetch('/api/service-area/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            }),
          });

          if (!response.ok) {
            setStatus(STATUS.SERVICE_DOWN);
            return;
          }

          const data = await response.json();
          setResult(data);
          setStatus(data.withinServiceArea ? STATUS.WITHIN : STATUS.OUTSIDE);
        } catch {
          setStatus(STATUS.SERVICE_DOWN);
        }
      },
      (error) => {
        setStatus(error.code === error.PERMISSION_DENIED ? STATUS.DENIED : STATUS.UNAVAILABLE);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 },
    );
  };

  return (
    <section className="section section--routed coverage">
      <div className="container coverage__inner">
        <div className="coverage__copy">
          <Stage
            num="04"
            label="Coverage"
            title="Where the Van Runs"
            lead="Dylan's Mobile Mechanic serves Cincinnati, Northern Kentucky, and the surrounding communities. No shop visit required — professional auto service arrives at your address."
          />
          <Reveal as="p" variant="rise" delay={120} className="coverage__note">
            Not sure if we reach your street? Check your address below, or call and we&rsquo;ll tell you straight away.
          </Reveal>

          {/* Neutral wrapper: the button keeps its own hover transition
              untouched, the wrapper only handles the entrance */}
          <Reveal as="div" variant="rise" delay={180} className="reveal-inline">
            <button
              type="button"
              className="btn btn--ghost check-address__btn"
              onClick={handleCheck}
              disabled={busy}
              aria-describedby="check-address-note"
            >
              {busy && <span className="check-address__spinner" aria-hidden="true" />}
              {buttonLabel}
            </button>
          </Reveal>

          <p id="check-address-note" className="check-address__note">
            We only use your location to check driving distance — it isn&rsquo;t stored.
          </p>

          <div className="check-address__result" role="status" aria-live="polite">
            {status === STATUS.WITHIN && result && (
              <div className="check-address__panel check-address__panel--within">
                <span className="check-address__label">
                  <span className="status-dot" aria-hidden="true" />
                  Within Service Area
                </span>
                <p className="check-address__message">Great news! You&rsquo;re within our standard service area.</p>
                <p className="check-address__detail">{result.distanceMiles} driving miles away</p>
                <p className="check-address__detail">About {result.durationMinutes} minutes</p>
                <a href="#contact" className="btn btn--primary check-address__cta">Request a Quote</a>
              </div>
            )}

            {status === STATUS.OUTSIDE && result && (
              <div className="check-address__panel check-address__panel--outside">
                <span className="check-address__label check-address__label--muted">Outside Service Area</span>
                <p className="check-address__message">
                  Your location is approximately {result.distanceMiles} driving miles away and is outside our standard {result.radiusMiles}-mile service area.
                </p>
                <p className="check-address__detail">Contact Dylan to ask whether service may still be available.</p>
                <div className="check-address__actions">
                  <a href={`tel:${PHONE_HREF}`} className="contact-link">{PHONE_DISPLAY}</a>
                  <a href={`mailto:${EMAIL}`} className="contact-link">{EMAIL}</a>
                </div>
                <a href="#contact" className="btn btn--ghost check-address__cta">Request a Quote Anyway</a>
              </div>
            )}

            {status === STATUS.DENIED && (
              <div className="check-address__panel check-address__panel--outside">
                <span className="check-address__label check-address__label--muted">Location Unavailable</span>
                <p className="check-address__message">
                  We couldn&rsquo;t access your location. Enable location access or contact Dylan to confirm service availability.
                </p>
                <div className="check-address__actions">
                  <a href={`tel:${PHONE_HREF}`} className="contact-link">{PHONE_DISPLAY}</a>
                  <a href={`mailto:${EMAIL}`} className="contact-link">{EMAIL}</a>
                </div>
              </div>
            )}

            {status === STATUS.UNAVAILABLE && (
              <div className="check-address__panel check-address__panel--outside">
                <span className="check-address__label check-address__label--muted">Location Unavailable</span>
                <p className="check-address__message">
                  We couldn&rsquo;t determine your location on this device. Contact Dylan to confirm service availability.
                </p>
                <div className="check-address__actions">
                  <a href={`tel:${PHONE_HREF}`} className="contact-link">{PHONE_DISPLAY}</a>
                  <a href={`mailto:${EMAIL}`} className="contact-link">{EMAIL}</a>
                </div>
              </div>
            )}

            {status === STATUS.SERVICE_DOWN && (
              <div className="check-address__panel check-address__panel--outside">
                <span className="check-address__label check-address__label--muted">Check Unavailable</span>
                <p className="check-address__message">
                  The automatic distance check is unavailable right now. Contact Dylan to confirm service availability.
                </p>
                <div className="check-address__actions">
                  <a href={`tel:${PHONE_HREF}`} className="contact-link">{PHONE_DISPLAY}</a>
                  <a href={`mailto:${EMAIL}`} className="contact-link">{EMAIL}</a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Coverage board — concentric range rings, drawn in CSS. Slides
            in from its own side, opposite the copy, for directional
            contrast with the rest of the page's vertical rises. */}
        <Reveal variant="slide-right" delay={100} className="coverage__board panel">
          <span className="edge" aria-hidden="true" />

          <div className="radius" aria-hidden="true">
            <span className="radius__ring radius__ring--3" />
            <span className="radius__ring radius__ring--2" />
            <span className="radius__ring radius__ring--1" />
            <span className="radius__core" />
            <span className="radius__axis radius__axis--x" />
            <span className="radius__axis radius__axis--y" />
          </div>

          <p className="coverage__board-label">Active service area</p>

          <ul className="coverage__list">
            {AREAS.map((a, i) => (
              <Reveal key={a} as="li" variant="rise" index={i} step={40} delay={280} className="coverage__item">
                <span className="status-dot" aria-hidden="true" />
                {a}
              </Reveal>
            ))}
            <li className="coverage__item coverage__item--more">+ surrounding communities</li>
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
