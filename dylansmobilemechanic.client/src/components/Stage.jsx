import useRevealOnScroll from '../hooks/useRevealOnScroll';

/**
 * Stage — a stop on the dispatch route.
 * Every major section is numbered and pinned to the vertical route rail,
 * so the page reads as one continuous journey rather than stacked blocks.
 * Animates itself once on scroll (label -> heading -> lead), so every
 * section header sitewide enters the same way without being wrapped.
 */
export default function Stage({ num, label, title, lead, children }) {
  const [ref, visible] = useRevealOnScroll();

  return (
    <header ref={ref} className={`stage reveal${visible ? ' is-visible' : ''}`}>
      <div className="stage__mark" aria-hidden="true">
        <span className="stage__node" />
        <span className="stage__num">{num}</span>
      </div>
      <p className="stage__label">{label}</p>
      <h2 className="stage__title">{title}</h2>
      {lead && <p className="stage__lead">{lead}</p>}
      {children}
    </header>
  );
}
