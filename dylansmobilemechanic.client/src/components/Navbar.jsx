import { useState, useEffect } from 'react';
import logo from '../assets/logo-9.png';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const close = () => setMenuOpen(false);

  return (
    <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        <a href="#home" className="navbar__logo" onClick={close}>
          <img src={logo} alt="Dylan's Mobile Mechanic" />
        </a>

        <ul className={`navbar__links${menuOpen ? ' navbar__links--open' : ''}`}>
          <li><a href="#home" onClick={close}>Home</a></li>
          <li><a href="#services" onClick={close}>Services</a></li>
          <li><a href="#about" onClick={close}>About</a></li>
          <li><a href="#contact" onClick={close}>Contact</a></li>
          <li className="navbar__cta-mobile">
            <a href="#contact" className="btn btn--primary" onClick={close}>Request a Quote</a>
          </li>
        </ul>

        <a href="#contact" className="btn btn--primary navbar__cta-desktop">Request a Quote</a>

        <button
          className={`navbar__toggle${menuOpen ? ' navbar__toggle--open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle navigation menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {menuOpen && <div className="navbar__backdrop" onClick={close} />}
    </nav>
  );
}
