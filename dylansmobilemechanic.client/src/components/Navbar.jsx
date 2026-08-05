import { useState, useEffect } from 'react';
import logo from '../assets/logo-9.png';

const LINKS = [
  { href: '#home', label: 'Home' },
  { href: '#services', label: 'Services' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' },
];

/* Same values and order as the footer's social/contact icon row */
const PHONE_HREF = '+15551234567';
const EMAIL = 'dylan@dylansmobilemechanic.com';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <nav className={`nav${scrolled ? ' nav--scrolled' : ''}`} aria-label="Main">
      <div className="nav__inner container">
        <a href="#home" className="nav__brand" onClick={close} aria-label="Dylan's Mobile Mechanic — home">
          <img src={logo} alt="" />
        </a>

        <div id="nav-menu" className={`nav__menu${open ? ' nav__menu--open' : ''}`}>
          <ul className="nav__links">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="nav__link" onClick={close}>{l.label}</a>
              </li>
            ))}
          </ul>

          <div className="foot__social nav__social">
            <a href={`tel:${PHONE_HREF}`} className="foot__social-link" aria-label="Call Dylan's Mobile Mechanic" onClick={close}>
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
            <a href={`mailto:${EMAIL}`} className="foot__social-link" aria-label="Email Dylan's Mobile Mechanic" onClick={close}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </a>
          </div>

          <a href="#contact" className="btn btn--primary nav__cta nav__cta--mobile" onClick={close}>
            Request a Quote
          </a>
        </div>

        <a href="#contact" className="btn btn--primary nav__cta nav__cta--desktop">Request a Quote</a>

        <button
          type="button"
          className={`nav__toggle${open ? ' nav__toggle--open' : ''}`}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="nav-menu"
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>

      {open && <button type="button" className="nav__scrim" aria-label="Close navigation menu" onClick={close} />}
    </nav>
  );
}
