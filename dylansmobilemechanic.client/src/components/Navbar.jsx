import { useState, useEffect } from 'react';
import logo from '../assets/logo-9.png';

const LINKS = [
  { href: '#home', label: 'Home' },
  { href: '#services', label: 'Services' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' },
];

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
