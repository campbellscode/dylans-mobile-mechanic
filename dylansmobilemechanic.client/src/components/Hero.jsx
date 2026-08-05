import logo from '../assets/logo-10.png';

/* Editable proof points — keep these factual. */
const PROOF = ['Licensed & Insured', 'Same-Day Service Available', 'Serving Greater Cincinnati'];

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.18 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export default function Hero() {
  return (
    <section id="home" className="hero">
      <div className="hero__field" aria-hidden="true" />
      <div className="hero__rail" aria-hidden="true" />

      <div className="container hero__inner">
        {/* ---------- Dispatch copy ---------- */}
        <div className="hero__copy">
          <div className="stage__mark" aria-hidden="true">
            <span className="stage__node" />
            <span className="stage__num">01</span>
          </div>

          <p className="stage__label">Dispatch — Mobile Auto Repair</p>

          <h1 className="hero__title">
            Expert Auto Repair
            <span className="hero__title-line">That Comes to You</span>
          </h1>

          <p className="hero__lead">
            Skip the shop. Dylan brings the workshop to your driveway, your office lot, or wherever
            your vehicle sits — honest diagnosis, professional repair, no waiting room.
          </p>

          <div className="hero__actions">
            <a href="#contact" className="btn btn--primary btn--lg">Request a Quote</a>
            <a href="tel:+15551234567" className="btn btn--ghost btn--lg">
              <PhoneIcon />(555) 123-4567
            </a>
          </div>

          {/* Proof strip — an instrument readout, not a row of pill badges */}
          <ul className="proof">
            {PROOF.map((p) => (
              <li key={p} className="proof__item">
                <span className="status-dot" aria-hidden="true" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* ---------- The service bay ---------- */}
        <div className="bay panel">
          <span className="edge" aria-hidden="true" />

          <div className="bay__head">
            <span className="bay__unit">
              <span className="status-dot" aria-hidden="true" />
              Mobile Service Unit
            </span>
            <span className="bay__ref">Cincinnati / N. Kentucky</span>
          </div>

          <div className="bay__stage">
            <span className="bay__depth" aria-hidden="true" />
            <span className="bay__ring bay__ring--a" aria-hidden="true" />
            <span className="bay__ring bay__ring--b" aria-hidden="true" />
            <span className="bay__cross bay__cross--tl" aria-hidden="true" />
            <span className="bay__cross bay__cross--tr" aria-hidden="true" />
            <span className="bay__cross bay__cross--bl" aria-hidden="true" />
            <span className="bay__cross bay__cross--br" aria-hidden="true" />
            <img
              src={logo}
              alt="Dylan's Mobile Mechanic"
              className="bay__logo"
              fetchPriority="high"
              decoding="async"
            />
          </div>

          {/* The route: workshop → customer. The idea the whole site is built on. */}
          <div className="bay__route" aria-hidden="true">
            <span className="bay__pin" />
            <span className="bay__path" />
            <span className="bay__pin bay__pin--dest" />
          </div>
          <p className="bay__legend">
            <span>Dylan&rsquo;s van</span>
            <span>Your driveway</span>
          </p>
        </div>
      </div>
    </section>
  );
}
