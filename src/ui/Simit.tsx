export function Simit({ size = 200 }: { size?: number }) {
  const seeds = Array.from({ length: 30 }, (_, i) => {
    const a = (i / 30) * Math.PI * 2;
    const r = 25 + (i % 3) * 6;
    const x = 50 + Math.cos(a) * r;
    const y = 50 + Math.sin(a) * r;
    return <ellipse key={i} cx={x} cy={y} rx="3.4" ry="1.5" fill="#fff1cf" transform={`rotate(${(a * 180) / Math.PI + 40} ${x} ${y})`} />;
  });
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <defs>
        <radialGradient id="crust" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#f7c877" />
          <stop offset="45%" stopColor="#e8a64a" />
          <stop offset="80%" stopColor="#b8642a" />
          <stop offset="100%" stopColor="#6e3012" />
        </radialGradient>
        <mask id="hole">
          <rect width="100" height="100" fill="white" />
          <circle cx="50" cy="50" r="20" fill="black" />
        </mask>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#crust)" mask="url(#hole)" />
      {seeds}
    </svg>
  );
}
