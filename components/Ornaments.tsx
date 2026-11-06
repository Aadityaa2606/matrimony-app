// Decorative gold SVGs shared by the member site. All aria-hidden.

// Brand mark: two interlocked wedding rings under a small kalasam dot.
export function Emblem({ className = "h-8 w-12" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 48 32" className={className} fill="none" stroke="#e5c983" strokeWidth="2.4">
      <circle cx="18" cy="19" r="10" />
      <circle cx="30" cy="19" r="10" />
      <path d="M24 2.5l2.6 3.2L24 9l-2.6-3.3z" fill="#e5c983" stroke="none" />
    </svg>
  );
}

export function GoldDivider({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden width="140" height="12" viewBox="0 0 140 12" className={`mx-auto ${className}`}>
      <path d="M0 6h56M84 6h56" stroke="#c9a24a" strokeWidth="1" />
      <path d="M70 1.5l4.5 4.5-4.5 4.5-4.5-4.5z" fill="none" stroke="#c9a24a" />
      <circle cx="61" cy="6" r="1.6" fill="#c9a24a" />
      <circle cx="79" cy="6" r="1.6" fill="#c9a24a" />
    </svg>
  );
}

// Temple tower between two palms, drawn in faint gold along the bottom of welcome/sign-in screens.
export function TempleSkyline({ className = "" }: { className?: string }) {
  const palm = (x: number, flip = 1) => (
    <g transform={`translate(${x} 0) scale(${flip} 1)`}>
      <path d="M0 120 C2 95 4 80 10 62" strokeWidth="2.5" fill="none" />
      <path d="M10 62 q-14 -6 -26 4 M10 62 q-10 -14 -24 -12 M10 62 q2 -16 -6 -24 M10 62 q14 -10 24 -6 M10 62 q16 0 22 12" fill="none" strokeWidth="2" />
    </g>
  );
  return (
    <svg aria-hidden viewBox="0 0 320 120" preserveAspectRatio="xMidYMax meet" className={`pointer-events-none w-full ${className}`} stroke="#c9a24a" fill="#c9a24a">
      <g opacity=".22" stroke="none">
        {/* gopuram: stacked tiers narrowing upwards */}
        <path d="M128 120V92h64v28z" />
        <path d="M133 92l3-14h48l3 14z" />
        <path d="M138 78l3-13h38l3 13z" />
        <path d="M143 65l3-12h28l3 12z" />
        <path d="M148 53l3-11h18l3 11z" />
        <path d="M150 42q10-12 20 0z" />
        <path d="M158 30h4v-7h-4z" />
        {/* side mandapams */}
        <path d="M86 120v-16h42v16zM192 120v-16h42v16z" />
        <path d="M82 104l10-8h30l10 8zM188 104l10-8h30l10 8z" />
        <path d="M0 120v-4h320v4z" />
      </g>
      <g opacity=".22">
        {palm(30)}
        {palm(290, -1)}
      </g>
      <path d="M152 120v-14q8-8 16 0v14z" fill="#fcf8f0" stroke="none" opacity=".9" />
    </svg>
  );
}
