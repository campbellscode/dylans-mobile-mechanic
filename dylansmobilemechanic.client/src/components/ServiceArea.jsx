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
          <Reveal as="p" variant="rise" delay={120} className="coverage__note">
            Not sure if we reach your street? Call and we&rsquo;ll tell you straight away.
          </Reveal>
          {/* Neutral wrapper: the button keeps its own hover transition
              untouched, the wrapper only handles the entrance */}
          <Reveal as="div" variant="rise" delay={180} className="reveal-inline">
            <a href="tel:+15551234567" className="btn btn--ghost">Check My Address</a>
          </Reveal>
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
