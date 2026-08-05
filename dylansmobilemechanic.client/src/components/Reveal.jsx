import useRevealOnScroll from '../hooks/useRevealOnScroll';

/**
 * The site's single scroll-entrance system. Fires once via
 * IntersectionObserver and never replays. variant: rise | slide-left |
 * slide-right | lock. `index` staggers siblings (capped so a long list
 * never leaves its last item waiting).
 */
export default function Reveal({
  as: Tag = 'div',
  variant = 'rise',
  index = 0,
  delay = 0,
  step = 70,
  threshold,
  rootMargin,
  className = '',
  children,
  ...rest
}) {
  const [ref, visible] = useRevealOnScroll({ threshold, rootMargin });
  const totalDelay = delay + Math.min(index, 6) * step;

  return (
    <Tag
      ref={ref}
      className={`reveal reveal--${variant}${visible ? ' is-visible' : ''}${className ? ` ${className}` : ''}`}
      style={{ '--delay': `${totalDelay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
