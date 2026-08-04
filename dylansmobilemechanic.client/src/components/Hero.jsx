import logo from '../assets/logo-8.png';

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function Hero() {
  return (
    <section id="home" className="hero">
      <div className="hero__bg" />
      <div className="hero__bg-grid" />

      <div className="container hero__inner">
        <div className="hero__content">
          <div className="hero__eyebrow">
            <span className="hero__eyebrow-line" aria-hidden="true" />
            <span className="hero__eyebrow-text">Mobile Mechanic Service</span>
          </div>
          <h1 className="hero__headline">
            Expert Auto Repair<br />
            <span className="hero__headline-accent">That Comes to You</span>
          </h1>
          <p className="hero__sub">
            Skip the shop. Dylan comes directly to your home, office, or wherever your vehicle is —
            delivering honest, professional auto service without the hassle.
          </p>
          <div className="hero__actions">
            <a href="#contact" className="btn btn--primary btn--lg">Request a Quote</a>
            <a href="tel:+15551234567" className="btn btn--outline btn--lg">Call Now</a>
          </div>
          <div className="hero__badges">
            <div className="hero__badge"><CheckIcon /> Licensed &amp; Insured</div>
            <div className="hero__badge"><CheckIcon /> Same-Day Service Available</div>
            <div className="hero__badge"><CheckIcon /> Serving Greater Cincinnati</div>
          </div>
        </div>

        <div className="hero__logo-wrap">
          {/* Corner brackets frame the logo — Technical Precision motif */}
          <span className="hero__corner hero__corner--tl" aria-hidden="true" />
          <span className="hero__corner hero__corner--tr" aria-hidden="true" />
          <span className="hero__corner hero__corner--bl" aria-hidden="true" />
          <span className="hero__corner hero__corner--br" aria-hidden="true" />
          <div className="hero__logo-spotlight" aria-hidden="true" />
          <img src={logo} alt="Dylan's Mobile Mechanic" className="hero__logo" />
        </div>
      </div>

      <div className="hero__scroll-hint" aria-hidden="true">
        <div className="hero__scroll-line" />
        <span>Scroll</span>
      </div>
    </section>
  );
}
