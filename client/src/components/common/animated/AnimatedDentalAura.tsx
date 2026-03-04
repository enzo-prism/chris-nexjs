type AnimatedDentalAuraProps = {
  className?: string;
  idPrefix?: string;
  decorative?: boolean;
  title?: string;
  desc?: string;
};

export default function AnimatedDentalAura({
  className,
  idPrefix = "animated-dental-aura",
  decorative = true,
  title = "Subtle orbital dental accent",
  desc = "A decorative animated orbital pattern used as a visual accent.",
}: AnimatedDentalAuraProps) {
  const titleId = `${idPrefix}-title`;
  const descId = `${idPrefix}-desc`;
  const ringGradientId = `${idPrefix}-ring-gradient`;
  const centerGlowId = `${idPrefix}-center-glow`;

  const wrapperClassName = ["svg-aura-orbital-wrap", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClassName} aria-hidden={decorative || undefined}>
      <svg
        viewBox="0 0 320 320"
        className="svg-aura-orbital"
        role={decorative ? "presentation" : "img"}
        aria-labelledby={decorative ? undefined : `${titleId} ${descId}`}
      >
        {!decorative && <title id={titleId}>{title}</title>}
        {!decorative && <desc id={descId}>{desc}</desc>}

        <defs>
          <linearGradient id={ringGradientId} x1="40" y1="40" x2="280" y2="280">
            <stop offset="0" stopColor="currentColor" stopOpacity="0.86" />
            <stop offset="0.55" stopColor="currentColor" stopOpacity="0.22" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0.74" />
          </linearGradient>
          <radialGradient id={centerGlowId} cx="160" cy="160" r="96" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="currentColor" stopOpacity="0.24" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g id={`${idPrefix}-base`}>
          <circle className="aura-wave" cx="160" cy="160" r="104" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle className="aura-ring aura-ring--slow" cx="160" cy="160" r="86" fill="none" stroke={`url(#${ringGradientId})`} strokeWidth="2" />
          <circle className="aura-ring aura-ring--mid" cx="160" cy="160" r="64" fill="none" stroke={`url(#${ringGradientId})`} strokeWidth="1.5" />
          <circle className="aura-ring aura-ring--fast" cx="160" cy="160" r="42" fill="none" stroke={`url(#${ringGradientId})`} strokeWidth="1.5" />
        </g>

        <g id={`${idPrefix}-nodes`}>
          <circle className="aura-node aura-node--1" cx="78" cy="160" r="4.5" fill="currentColor" />
          <circle className="aura-node aura-node--2" cx="242" cy="160" r="4" fill="currentColor" />
          <circle className="aura-node aura-node--3" cx="160" cy="74" r="3.5" fill="currentColor" />
          <circle className="aura-node aura-node--4" cx="160" cy="246" r="3" fill="currentColor" />
        </g>

        <circle className="aura-center-glow" cx="160" cy="160" r="98" fill={`url(#${centerGlowId})`} />
      </svg>
    </div>
  );
}
