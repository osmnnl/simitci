interface SimitProps {
  size?: number;
  className?: string;
}

/**
 * A stylised simit ring. Deliberately simple SVG rather than a raster
 * asset, so it stays crisp at any size and costs nothing to license.
 */
export function Simit({ size = 96, className }: SimitProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Simit"
    >
      <defs>
        <radialGradient id="simit-crust" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#f7c877" />
          <stop offset="45%" stopColor="#e8a64a" />
          <stop offset="80%" stopColor="#b8642a" />
          <stop offset="100%" stopColor="#6e3012" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#simit-crust)" />
      <circle cx="50" cy="50" r="21" fill="var(--page, #efe4d2)" />
      {Array.from({ length: 28 }).map((_, i) => {
        const angle = (i / 28) * Math.PI * 2;
        const r = 24 + (i % 3) * 6;
        const x = 50 + Math.cos(angle) * r;
        const y = 50 + Math.sin(angle) * r;
        return (
          <ellipse
            key={i}
            cx={x}
            cy={y}
            rx="3.4"
            ry="1.5"
            fill="#fff1cf"
            transform={`rotate(${(angle * 180) / Math.PI + 40} ${x} ${y})`}
          />
        );
      })}
    </svg>
  );
}
