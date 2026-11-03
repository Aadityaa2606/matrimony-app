const LEAVES = [22, 52, 82, 112, 142, 172, 202, 232, 262, 292];
const leafY = (x: number) => 10 + 12 * (1 - ((x - 155) / 155) ** 2);
const FLOWERS = [37, 97, 157, 217, 277];
const STRAND = [120, 132, 144, 156, 168, 180, 192];

export function Garland({ variant = "full" }: { variant?: "full" | "thin" }) {
  const full = variant === "full";
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 w-full"
      style={{ height: full ? "100%" : 48 }}
      viewBox={full ? "0 0 310 600" : "0 0 310 48"}
      preserveAspectRatio="none"
    >
      <path d="M0 6 Q155 30 310 6" stroke="#c9a24a" strokeWidth="1.2" fill="none" opacity=".55" />
      <g fill="#6f8f4e" opacity=".3">
        {LEAVES.map((x) => (
          <path key={x} d={`M${x} ${leafY(x)} q-5 14 0 24 q5 -10 0 -24z`} />
        ))}
      </g>
      <g fill="#e9a21a" opacity=".4">
        {FLOWERS.map((x) => (
          <circle key={x} cx={x} cy={leafY(x) + 4} r="3" />
        ))}
      </g>
      {full && (
        <>
          <g fill="#fff" stroke="#d8c7a0" strokeWidth=".6" opacity=".8">
            {STRAND.flatMap((y, i) => [
              <circle key={`l${y}`} cx={8 + (i % 2)} cy={y} r="3" />,
              <circle key={`r${y}`} cx={302 - (i % 2)} cy={y} r="3" />,
            ])}
          </g>
          <circle cx="8" cy="204" r="4" fill="#c4161c" opacity=".35" />
          <circle cx="302" cy="204" r="4" fill="#c4161c" opacity=".35" />
        </>
      )}
    </svg>
  );
}

export function GoldDivider() {
  return (
    <svg aria-hidden width="140" height="12" viewBox="0 0 140 12" className="mx-auto">
      <path d="M0 6h56M84 6h56" stroke="#c9a24a" strokeWidth="1" />
      <circle cx="70" cy="6" r="4" fill="none" stroke="#c9a24a" />
      <circle cx="62" cy="6" r="1.6" fill="#c9a24a" />
      <circle cx="78" cy="6" r="1.6" fill="#c9a24a" />
    </svg>
  );
}
