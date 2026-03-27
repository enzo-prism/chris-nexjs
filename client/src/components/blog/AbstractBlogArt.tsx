import { getBlogArtSpec, BLOG_ART_VIEWBOX } from "@shared/blogArt";
import { cn } from "@/lib/utils";

type AbstractBlogArtProps = {
  slug: string;
  className?: string;
};

function sanitizeId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-");
}

export default function AbstractBlogArt({
  slug,
  className,
}: AbstractBlogArtProps) {
  const spec = getBlogArtSpec(slug);
  const idPrefix = sanitizeId(slug || "blog-art");

  return (
    <div className={cn("relative isolate overflow-hidden bg-[#f8fbff]", className)} aria-hidden="true">
      <svg
        viewBox={`0 0 ${BLOG_ART_VIEWBOX.width} ${BLOG_ART_VIEWBOX.height}`}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient
            id={`${idPrefix}-bg`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={spec.palette.backgroundStart} />
            <stop offset="50%" stopColor={spec.palette.backgroundMid} />
            <stop offset="100%" stopColor={spec.palette.backgroundEnd} />
          </linearGradient>
          {spec.blobs.map((blob, index) => (
            <radialGradient
              id={`${idPrefix}-blob-${index}`}
              key={`${idPrefix}-blob-gradient-${index}`}
              cx="35%"
              cy="35%"
              r="70%"
            >
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
              <stop offset="50%" stopColor={blob.color} stopOpacity="0.88" />
              <stop offset="100%" stopColor={blob.color} stopOpacity="0.28" />
            </radialGradient>
          ))}
        </defs>

        <rect
          width={BLOG_ART_VIEWBOX.width}
          height={BLOG_ART_VIEWBOX.height}
          fill={`url(#${idPrefix}-bg)`}
        />

        <g opacity="0.72">
          {spec.blobs.map((blob, index) => (
            <ellipse
              key={`${idPrefix}-blob-${index}`}
              cx={blob.cx}
              cy={blob.cy}
              rx={blob.rx}
              ry={blob.ry}
              fill={`url(#${idPrefix}-blob-${index})`}
              opacity={blob.opacity}
              transform={`rotate(${blob.rotate} ${blob.cx} ${blob.cy})`}
            />
          ))}
        </g>

        <g opacity="0.55">
          {spec.wavePaths.map((pathData, index) => (
            <path
              key={`${idPrefix}-wave-${index}`}
              d={pathData}
              fill="none"
              stroke={spec.palette.stroke}
              strokeOpacity={0.38 - index * 0.08}
              strokeWidth={index === 0 ? 3 : 2}
              strokeLinecap="round"
            />
          ))}
        </g>

        <g opacity="0.46">
          <path
            d={`M ${spec.gridOffset} 0 V ${BLOG_ART_VIEWBOX.height}`}
            stroke="#ffffff"
            strokeOpacity="0.42"
            strokeWidth="1.4"
          />
          <path
            d={`M ${BLOG_ART_VIEWBOX.width - spec.gridOffset} 0 V ${BLOG_ART_VIEWBOX.height}`}
            stroke="#ffffff"
            strokeOpacity="0.32"
            strokeWidth="1"
          />
          <path
            d={`M 0 ${spec.gridOffset * 1.2} H ${BLOG_ART_VIEWBOX.width}`}
            stroke="#ffffff"
            strokeOpacity="0.28"
            strokeWidth="1"
          />
        </g>

        <g
          transform={`translate(${spec.panel.x} ${spec.panel.y}) rotate(${spec.panel.rotate})`}
        >
          <rect
            width={spec.panel.width}
            height={spec.panel.height}
            rx="40"
            fill={spec.palette.panel}
            fillOpacity="0.36"
            stroke={spec.palette.panelBorder}
            strokeOpacity="0.84"
            strokeWidth="1.5"
          />
          <rect
            x="24"
            y="28"
            width={spec.panel.width - 48}
            height="14"
            rx="999"
            fill="#ffffff"
            fillOpacity="0.72"
          />
          <rect
            x="24"
            y="56"
            width={spec.panel.width * 0.46}
            height="12"
            rx="999"
            fill="#ffffff"
            fillOpacity="0.46"
          />
        </g>

        <g
          transform={`translate(${spec.accent.x} ${spec.accent.y}) rotate(${spec.accent.rotate})`}
          opacity="0.42"
        >
          <rect
            width={spec.accent.width}
            height={spec.accent.height}
            rx="60"
            fill="#ffffff"
            fillOpacity="0.2"
          />
          <rect
            x="22"
            y="22"
            width={spec.accent.width - 44}
            height={spec.accent.height - 44}
            rx="48"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.44"
            strokeWidth="1.2"
          />
        </g>
      </svg>

      <div
        className="pointer-events-none absolute inset-0 opacity-35 mix-blend-screen"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(255,255,255,0.58) 0 1px, transparent 1px 24px)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at top right, rgba(255,255,255,0.84), transparent 40%), linear-gradient(180deg, rgba(255,255,255,0.18), transparent 68%)",
        }}
      />
    </div>
  );
}
