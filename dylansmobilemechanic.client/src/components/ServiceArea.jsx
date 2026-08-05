import Stage from './Stage';

const AREAS = [
  'Cincinnati, OH',
  'Northern Kentucky',
  'Covington, KY',
  'Florence, KY',
  'Mason, OH',
  'Loveland, OH',
  'Milford, OH',
];

export default function ServiceArea() {
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
          <p className="coverage__note">
            Not sure if we reach your street? Call and we&rsquo;ll tell you straight away.
          </p>
          <a href="tel:+15551234567" className="btn btn--ghost">Check My Address</a>
        </div>

        {/* Coverage board — concentric range rings, drawn in CSS */}
        <div className="coverage__board panel">
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
            {AREAS.map((a) => (
              <li key={a} className="coverage__item">
                <span className="status-dot" aria-hidden="true" />
                {a}
              </li>
            ))}
            <li className="coverage__item coverage__item--more">+ surrounding communities</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
