const AREAS = [
  'Cincinnati, OH',
  'Northern Kentucky',
  'Covington, KY',
  'Florence, KY',
  'Mason, OH',
  'Loveland, OH',
  'Milford, OH',
  'And Surrounding Areas',
];

export default function ServiceArea() {
  return (
    <section className="section service-area">
      <div className="container">
        <div className="service-area__inner">
          <div className="service-area__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
          </div>

          <span className="section-label">Coverage</span>
          <span className="accent-line" style={{ margin: '10px auto 0' }} />
          <h2 className="service-area__title">Service Area</h2>
          <p className="service-area__desc">
            Dylan's Mobile Mechanic proudly serves Cincinnati, Northern Kentucky, and the surrounding communities.
            No shop visit required — we bring professional auto service directly to you.
          </p>
          <p className="service-area__note">
            Not sure if we cover your area? Give us a call and we'll let you know.
          </p>

          <div className="service-area__tags">
            {AREAS.map((a) => (
              <span key={a} className="area-tag">{a}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
