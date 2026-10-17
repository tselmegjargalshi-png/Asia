/** The ASIA mark: a ring with an offset disc, an abstract eclipse. */
export function Emblem({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden="true" focusable="false">
      <circle cx="20" cy="20" r="16.5" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <circle cx="23.4" cy="19.4" r="9.6" fill="currentColor" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Emblem size={22} className="text-gold" />
      <span className="text-[1.05rem] font-light tracking-[0.42em] text-ivory">ASIA</span>
    </span>
  );
}
