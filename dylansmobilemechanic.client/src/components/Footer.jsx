import logo from '../assets/logo-9.png';
import Reveal from './Reveal';

const PHONE_DISPLAY = '(555) 123-4567';
const PHONE_HREF = '+15551234567';
const EMAIL = 'dylan@dylansmobilemechanic.com';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="foot">
      <div className="container foot__inner">
        <Reveal as="div" variant="rise" index={0} step={80} className="foot__brand">
          <img
            src={logo}
            alt="Dylan's Mobile Mechanic"
            className="foot__logo"
            loading="lazy"
            decoding="async"
          />
          <p className="foot__desc">
            Professional mobile mechanic service across Cincinnati and Northern Kentucky.
            The workshop comes to you — no shop visit required.
          </p>
          <div className="foot__social">
            <a href={`tel:${PHONE_HREF}`} className="foot__social-link" aria-label="Call Dylan's Mobile Mechanic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.18 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </a>
            {/* Placeholder href — no Facebook URL exists in the project yet */}
            <a href="#" target="_blank" rel="noopener noreferrer" className="foot__social-link" aria-label="Dylan's Mobile Mechanic on Facebook">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            {/* Placeholder href — no Instagram URL exists anywhere in the project */}
            <a href="#" target="_blank" rel="noopener noreferrer" className="foot__social-link" aria-label="Dylan's Mobile Mechanic on Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a href={`mailto:${EMAIL}`} className="foot__social-link" aria-label="Email Dylan's Mobile Mechanic">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </a>
          </div>
        </Reveal>

        <Reveal as="nav" variant="rise" index={1} step={80} className="foot__col" aria-label="Footer">
          <h2 className="foot__col-title">Site</h2>
          <ul className="foot__links">
            <li><a href="#home">Home</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Request a Quote</a></li>
          </ul>
        </Reveal>

        <Reveal as="div" variant="rise" index={2} step={80} className="foot__col">
          <h2 className="foot__col-title">Dispatch</h2>
          <ul className="foot__links">
            <li><a href={`tel:${PHONE_HREF}`}>{PHONE_DISPLAY}</a></li>
            <li><a href={`mailto:${EMAIL}`}>{EMAIL}</a></li>
          </ul>
          <p className="foot__meta">Cincinnati &amp; Northern Kentucky</p>
          <p className="foot__meta">Mon–Sat, 7am – 7pm</p>
        </Reveal>
      </div>

      <div className="container foot__bar">
        <p>&copy; {year} Dylan&rsquo;s Mobile Mechanic</p>
        <p className="foot__bar-tag">
          <span className="status-dot" aria-hidden="true" />
          Serving Greater Cincinnati & Northern KY
        </p>
      </div>
    </footer>
  );
}
