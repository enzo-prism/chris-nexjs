type AnimatedFlowDividerProps = {
  className?: string;
  idPrefix?: string;
  decorative?: boolean;
  title?: string;
  desc?: string;
};

export default function AnimatedFlowDivider({
  className,
  idPrefix = "animated-flow-divider",
  decorative = true,
  title = "Animated section divider",
  desc = "A decorative flowing divider between page sections.",
}: AnimatedFlowDividerProps) {
  const titleId = `${idPrefix}-title`;
  const descId = `${idPrefix}-desc`;
  const waveGradientId = `${idPrefix}-wave-gradient`;
  const glowGradientId = `${idPrefix}-glow-gradient`;

  const wrapperClassName = ["svg-divider-wave-wrap", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClassName} aria-hidden={decorative || undefined}>
      <svg
        viewBox="0 0 640 96"
        className="svg-divider-wave"
        role={decorative ? "presentation" : "img"}
        aria-labelledby={decorative ? undefined : `${titleId} ${descId}`}
      >
        {!decorative && <title id={titleId}>{title}</title>}
        {!decorative && <desc id={descId}>{desc}</desc>}

        <defs>
          <linearGradient id={waveGradientId} x1="0" y1="48" x2="640" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="currentColor" stopOpacity="0" />
            <stop offset="0.22" stopColor="currentColor" stopOpacity="0.36" />
            <stop offset="0.5" stopColor="currentColor" stopOpacity="0.88" />
            <stop offset="0.78" stopColor="currentColor" stopOpacity="0.36" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
          <radialGradient id={glowGradientId} cx="320" cy="48" r="180" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="currentColor" stopOpacity="0.26" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
        </defs>

        <ellipse cx="320" cy="48" rx="172" ry="22" fill={`url(#${glowGradientId})`} />

        <path
          className="divider-track"
          d="M24 48C94 16 166 80 236 48C306 16 378 80 448 48C518 16 588 80 616 48"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.14"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          className="divider-wave divider-wave--a"
          d="M24 48C94 16 166 80 236 48C306 16 378 80 448 48C518 16 588 80 616 48"
          fill="none"
          stroke={`url(#${waveGradientId})`}
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          className="divider-wave divider-wave--b"
          d="M24 48C94 16 166 80 236 48C306 16 378 80 448 48C518 16 588 80 616 48"
          fill="none"
          stroke={`url(#${waveGradientId})`}
          strokeWidth="1.4"
          strokeLinecap="round"
        />

        <g>
          <circle className="divider-dot divider-dot--1" cx="94" cy="30" r="3" fill="currentColor" />
          <circle className="divider-dot divider-dot--2" cx="236" cy="52" r="3.5" fill="currentColor" />
          <circle className="divider-dot divider-dot--3" cx="378" cy="34" r="2.5" fill="currentColor" />
          <circle className="divider-dot divider-dot--4" cx="520" cy="56" r="3" fill="currentColor" />
        </g>
      </svg>
    </div>
  );
}
