/**
 * Stage — a stop on the dispatch route.
 * Every major section is numbered and pinned to the vertical route rail,
 * so the page reads as one continuous journey rather than stacked blocks.
 */
export default function Stage({ num, label, title, lead, children }) {
  return (
    <header className="stage">
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
