const VALUES = [
  'Convenience — service that works around your life',
  'Integrity — honest assessments, fair pricing',
  'Quality — professional tools, quality parts',
  'Reliability — on time, every time',
  "Communication — you're always in the loop",
];

export default function About() {
  return (
    <section id="about" className="section about">
      <div className="container">
        <div className="about__inner">
          <div className="about__content">
            <span className="section-label">Our Story</span>
            <span className="accent-line" />
            <h2 className="section-title">About Dylan's Mobile Mechanic</h2>
            <p className="about__body">
              Dylan's Mobile Mechanic was founded on a simple idea: auto repair shouldn't mean
              losing your entire day to a shop waiting room. Whether you're at home, at work,
              or stuck somewhere unexpected, we come to you.
            </p>
            <p className="about__highlight">
              With professional training, quality tools, and a passion for doing the job right,
              Dylan delivers dealership-quality service at a fair price — without the overhead
              or the runaround.
            </p>

            <div className="about__stat-row">
              <div className="about__stat">
                <span className="about__stat-num">100%</span>
                <span className="about__stat-label">Mobile Service</span>
              </div>
              <div className="about__stat">
                <span className="about__stat-num">5★</span>
                <span className="about__stat-label">Customer Satisfaction</span>
              </div>
              <div className="about__stat">
                <span className="about__stat-num">0</span>
                <span className="about__stat-label">Hidden Fees</span>
              </div>
            </div>
          </div>

          <div className="about__card">
            <h3 className="about__card-title">Our Commitment to You</h3>
            <div className="about__values">
              {VALUES.map((v) => (
                <div key={v} className="about__value">
                  <span className="about__value-dot" />
                  {v}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
