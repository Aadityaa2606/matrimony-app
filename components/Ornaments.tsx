// Decorative SVGs for the member site, mostly the onboarding screens. All aria-hidden.

const GOLD = "#c9a24a";
const GOLD_LIGHT = "#e5c983";
const BAND_END = "#6a1422"; // must match the bottom stop of .band in globals.css

// Brand mark: two interlocked wedding rings under a small kalasam dot.
export function Emblem({ className = "h-8 w-12" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 48 32" className={className} fill="none" stroke={GOLD_LIGHT} strokeWidth="2.4">
      <circle cx="18" cy="19" r="10" />
      <circle cx="30" cy="19" r="10" />
      <path d="M24 2.5l2.6 3.2L24 9l-2.6-3.3z" fill={GOLD_LIGHT} stroke="none" />
    </svg>
  );
}

export function GoldDivider({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden width="180" height="16" viewBox="0 0 180 16" className={`mx-auto ${className}`} fill="none" stroke={GOLD}>
      <path d="M0 8h58M122 8h58" strokeWidth="1" />
      {/* swirls either side of the centre bud */}
      <path d="M58 8c6 0 8-5 13-5 4 0 5 3 3 5M122 8c-6 0-8-5-13-5-4 0-5 3-3 5" strokeWidth="1.2" />
      <path d="M58 8c6 0 8 5 13 5 4 0 5-3 3-5M122 8c-6 0-8 5-13 5-4 0-5-3-3-5" strokeWidth="1.2" />
      <path d="M90 2l5 6-5 6-5-6z" fill={GOLD} />
      <circle cx="80" cy="8" r="1.6" fill={GOLD} stroke="none" />
      <circle cx="100" cy="8" r="1.6" fill={GOLD} stroke="none" />
    </svg>
  );
}

// Mango-leaf toran with marigolds, hung along the top of the band.
export function Toran({ className = "" }: { className?: string }) {
  const leaves = Array.from({ length: 12 }, (_, i) => 15 + i * 30);
  return (
    <svg aria-hidden viewBox="0 0 360 44" preserveAspectRatio="none" className={`pointer-events-none w-full ${className}`}>
      <path d="M0 5 Q90 11 180 5 T360 5" stroke={GOLD} strokeWidth="1.5" fill="none" />
      {leaves.map((x, i) => (
        <g key={x}>
          <path d={`M${x} 7 q-7 13 0 ${i % 2 ? 24 : 30} q7 -15 0 -${i % 2 ? 24 : 30}z`} fill="#6f8f4e" stroke={GOLD_LIGHT} strokeWidth=".6" />
          <path d={`M${x} 8 v${i % 2 ? 20 : 26}`} stroke={GOLD_LIGHT} strokeWidth=".5" opacity=".7" />
          {i < leaves.length - 1 && (
            <>
              <circle cx={x + 15} cy="12" r="5.2" fill="#e8890c" />
              <circle cx={x + 15} cy="12" r="3.2" fill="#f7b32b" />
              <circle cx={x + 15} cy="12" r="1.2" fill="#c2410c" />
            </>
          )}
        </g>
      ))}
    </svg>
  );
}

// Faint gold mandala, used as a watermark behind the brand.
export function Mandala({ className = "" }: { className?: string }) {
  const n = 16;
  return (
    <svg aria-hidden viewBox="0 0 200 200" className={`pointer-events-none ${className}`} fill="none" stroke={GOLD_LIGHT} strokeWidth=".8">
      <circle cx="100" cy="100" r="28" />
      <circle cx="100" cy="100" r="58" />
      <circle cx="100" cy="100" r="96" strokeDasharray="1 4" strokeLinecap="round" strokeWidth="1.6" />
      {Array.from({ length: n }, (_, i) => (
        <g key={i} transform={`rotate(${(360 / n) * i} 100 100)`}>
          <path d="M100 6 Q113 28 100 44 Q87 28 100 6z" />
          <path d="M100 44 Q106 56 100 70 Q94 56 100 44z" transform={`rotate(${180 / n} 100 100)`} />
          <circle cx="100" cy="17" r="1.6" fill={GOLD_LIGHT} />
        </g>
      ))}
    </svg>
  );
}

// Curved, gold-rimmed bottom edge for the band, with beads along the curve.
export function BandEdge({ className = "" }: { className?: string }) {
  // Quadratic curve 0,4 → 360,4 via control 180,44; beads sampled along it.
  const beads = Array.from({ length: 17 }, (_, i) => {
    const t = (i + 1) / 18;
    return { x: 360 * t, y: 4 + 2 * t * (1 - t) * 40 + 9 };
  });
  return (
    <svg aria-hidden viewBox="0 0 360 40" preserveAspectRatio="none" className={`pointer-events-none block h-10 w-full ${className}`}>
      <path d="M0 0H360V4Q180 44 0 4Z" fill={BAND_END} />
      <path d="M0 4Q180 44 360 4" stroke={GOLD} strokeWidth="2.5" fill="none" vectorEffect="non-scaling-stroke" />
      <path d="M0 9Q180 49 360 9" stroke={GOLD} strokeWidth="1" fill="none" opacity=".6" vectorEffect="non-scaling-stroke" />
      {beads.map((b) => (
        <circle key={b.x} cx={b.x} cy={b.y} r="1.5" fill={GOLD} />
      ))}
    </svg>
  );
}

// Brass kuthuvilakku (oil lamp) with lit wicks.
export function Lamp({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 60 160" overflow="visible" className={className}>
      <defs>
        <linearGradient id="brass" x1="0" x2="1">
          <stop offset="0" stopColor="#a8792a" />
          <stop offset=".45" stopColor="#f3d68a" />
          <stop offset="1" stopColor="#9a6c22" />
        </linearGradient>
        <radialGradient id="glow">
          <stop offset="0" stopColor="#ffd77a" stopOpacity=".75" />
          <stop offset="1" stopColor="#ffd77a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="9" cy="52" r="16" fill="url(#glow)" />
      <circle cx="51" cy="52" r="16" fill="url(#glow)" />
      <circle cx="30" cy="48" r="14" fill="url(#glow)" />
      {[9, 30, 51].map((x) => (
        <path key={x} d={`M${x} ${x === 30 ? 40 : 46} q-4 7 0 11 q4 -4 0 -11z`} fill="#ffb02e" stroke="#fff3c4" strokeWidth=".6" />
      ))}
      <g fill="url(#brass)">
        <path d="M30 4l4 6-4 8-4-8z" />
        <rect x="28" y="17" width="4" height="34" rx="1.5" />
        <path d="M4 57 Q30 74 56 57 Q30 64 4 57z" />
        <rect x="27.5" y="66" width="5" height="62" rx="2" />
        <ellipse cx="30" cy="84" rx="7" ry="3.5" />
        <ellipse cx="30" cy="104" rx="8" ry="4" />
        <path d="M12 152 Q30 122 48 152z" />
        <ellipse cx="30" cy="153" rx="24" ry="5" />
      </g>
    </svg>
  );
}

// Temple tower (gopuram) with tier lines and a kalasam.
export function Gopuram({ className = "", fill = GOLD, opacity = 1 }: { className?: string; fill?: string; opacity?: number }) {
  const tiers = [
    [10, 150, 70, 132],
    [14, 132, 66, 114],
    [18, 114, 62, 97],
    [22, 97, 58, 81],
    [26, 81, 54, 66],
  ];
  return (
    <svg aria-hidden viewBox="0 0 80 160" className={className} opacity={opacity}>
      <g fill={fill}>
        <rect x="4" y="150" width="72" height="10" />
        {tiers.map(([l, b, r, t]) => (
          <path key={b} d={`M${l} ${b}L${l + 3} ${t}H${r - 3}L${r} ${b}z`} />
        ))}
        <path d="M27 66 Q40 44 53 66z" />
        <path d="M38 36h4v12h-4z" />
        <circle cx="40" cy="33" r="3.5" />
      </g>
      <g stroke={BAND_END} strokeWidth=".8" opacity=".55">
        {tiers.map(([l, b, r]) => (
          <path key={b} d={`M${l + 3} ${b - 3}H${r - 3}`} />
        ))}
      </g>
      <path d="M33 160v-16q7-8 14 0v16z" fill={BAND_END} opacity=".7" />
    </svg>
  );
}

// Cluster of jasmine buds.
export function Jasmine({ className = "" }: { className?: string }) {
  const flowers = [
    [14, 18, 7], [30, 12, 8], [46, 19, 6.5], [24, 27, 5.5], [38, 27, 5],
  ];
  return (
    <svg aria-hidden viewBox="0 0 60 36" className={className}>
      <path d="M2 30 Q30 20 58 30" stroke="#6f8f4e" strokeWidth="2" fill="none" />
      {flowers.map(([cx, cy, r]) => (
        <g key={`${cx}-${cy}`}>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx={cx} cy={cy - r / 2} rx={r / 3.2} ry={r / 2} fill="#fffdf6" stroke="#e8dcc0" strokeWidth=".4" transform={`rotate(${a} ${cx} ${cy})`} />
          ))}
          <circle cx={cx} cy={cy} r={r / 5} fill="#f2c94c" />
        </g>
      ))}
    </svg>
  );
}

// Gold filigree in the four corners of the nearest relative parent.
export function Corners({ inset = 6 }: { inset?: number }) {
  const pos = [
    { top: inset, left: inset, transform: "" },
    { top: inset, right: inset, transform: "scaleX(-1)" },
    { bottom: inset, left: inset, transform: "scaleY(-1)" },
    { bottom: inset, right: inset, transform: "scale(-1)" },
  ];
  return (
    <>
      {pos.map(({ transform, ...p }, i) => (
        <svg key={i} aria-hidden viewBox="0 0 40 40" className="pointer-events-none absolute size-9" style={{ ...p, transform }} fill="none" stroke={GOLD}>
          <path d="M2 38V14Q2 2 14 2H38" strokeWidth="1.4" />
          <path d="M7 30V17Q7 7 17 7H30" strokeWidth=".8" />
          <path d="M12 12c4-4 9-2 8 2-1 3-5 2-4-1" strokeWidth="1" />
          <circle cx="12" cy="12" r="1.8" fill={GOLD} stroke="none" />
        </svg>
      ))}
    </>
  );
}

// Round icon tile ringed with petals.
export function Medallion({ d, className = "size-20" }: { d: string; className?: string }) {
  return (
    <span className={`relative flex shrink-0 items-center justify-center ${className}`}>
      <svg aria-hidden viewBox="0 0 80 80" className="absolute inset-0 size-full">
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d="M40 1 Q45 6 40 11 Q35 6 40 1z" fill={GOLD} opacity=".75" transform={`rotate(${i * 30} 40 40)`} />
        ))}
        <circle cx="40" cy="40" r="28.5" fill="#fffdf8" stroke={GOLD} strokeWidth="1.5" />
        <circle cx="40" cy="40" r="25" fill="none" stroke={GOLD_LIGHT} strokeWidth=".7" />
      </svg>
      <svg aria-hidden viewBox="0 0 24 24" className="relative size-[38%] text-primary" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
      </svg>
    </span>
  );
}

// Temple between palms with a scalloped gold ground line, along the foot of onboarding screens.
export function TempleSkyline({ className = "" }: { className?: string }) {
  const palm = (x: number, flip = 1) => (
    <g transform={`translate(${x} 0) scale(${flip} 1)`} fill="none" strokeLinecap="round">
      <path d="M0 112 C2 92 5 78 11 62" strokeWidth="3" />
      <path d="M11 62 q-14 -7 -27 4 M11 62 q-10 -15 -25 -12 M11 62 q2 -17 -7 -25 M11 62 q14 -11 25 -6 M11 62 q17 0 23 13" strokeWidth="2" />
    </g>
  );
  return (
    <svg aria-hidden viewBox="0 0 360 120" preserveAspectRatio="xMidYMax meet" className={`pointer-events-none w-full ${className}`} stroke={GOLD} fill={GOLD}>
      <g opacity=".35" stroke="none">
        <path d="M96 112v-18h46v18zM218 112v-18h46v18z" />
        <path d="M91 94l11-9h34l11 9zM213 94l11-9h34l11 9z" />
      </g>
      <g opacity=".35">
        {palm(34)}
        {palm(326, -1)}
      </g>
      <svg x="145" y="2" width="70" height="112" viewBox="0 0 80 160" preserveAspectRatio="xMidYMax meet">
        <Gopuram fill={GOLD} opacity={0.45} />
      </svg>
      <path d="M0 113 Q15 107 30 113 T60 113 T90 113 T120 113 T150 113 T180 113 T210 113 T240 113 T270 113 T300 113 T330 113 T360 113" fill="none" strokeWidth="1.2" opacity=".6" />
      <path d="M0 118H360" strokeWidth="1" opacity=".4" />
    </svg>
  );
}
