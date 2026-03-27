import { ImageResponse } from "next/og";
import {
  getBlogArtSpec,
  hexToRgba,
} from "@shared/blogArt";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage({
  params,
}: {
  params: { slug: string };
}) {
  const spec = getBlogArtSpec(params.slug);

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          background: `linear-gradient(${spec.angle}deg, ${spec.palette.backgroundStart} 0%, ${spec.palette.backgroundMid} 48%, ${spec.palette.backgroundEnd} 100%)`,
        }}
      >
        {spec.blobs.map((blob, index) => (
          <div
            key={`blob-${index}`}
            style={{
              position: "absolute",
              left: blob.cx - blob.rx,
              top: blob.cy - blob.ry,
              width: blob.rx * 2,
              height: blob.ry * 2,
              borderRadius: 9999,
              opacity: blob.opacity,
              transform: `rotate(${blob.rotate}deg)`,
              background: `linear-gradient(135deg, rgba(255,255,255,0.94), ${hexToRgba(blob.color, 0.94)})`,
            }}
          />
        ))}

        {spec.wavePaths.map((_, index) => (
          <div
            key={`wave-${index}`}
            style={{
              position: "absolute",
              inset: 0,
              borderTop:
                index === 0
                  ? `3px solid ${hexToRgba(spec.palette.stroke, 0.34)}`
                  : `2px solid ${hexToRgba(spec.palette.stroke, 0.22)}`,
              borderRadius: `${180 + index * 48}px / ${84 + index * 22}px`,
              transform: `translate(${index * 120 - 80}px, ${138 + index * 96}px)`,
              opacity: 0.9 - index * 0.18,
            }}
          />
        ))}

        <div
          style={{
            position: "absolute",
            left: spec.panel.x,
            top: spec.panel.y,
            width: spec.panel.width,
            height: spec.panel.height,
            borderRadius: 44,
            border: `1px solid ${hexToRgba(spec.palette.panelBorder, 0.92)}`,
            background: hexToRgba(spec.palette.panel, 0.3),
            transform: `rotate(${spec.panel.rotate}deg)`,
          }}
        />

        <div
          style={{
            position: "absolute",
            left: spec.accent.x,
            top: spec.accent.y,
            width: spec.accent.width,
            height: spec.accent.height,
            borderRadius: 64,
            border: "1px solid rgba(255,255,255,0.58)",
            background: "rgba(255,255,255,0.16)",
            transform: `rotate(${spec.accent.rotate}deg)`,
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(135deg, rgba(255,255,255,0.42) 0 1px, transparent 1px 26px)",
            opacity: 0.28,
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top right, rgba(255,255,255,0.9), transparent 42%), linear-gradient(180deg, rgba(255,255,255,0.16), transparent 72%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 72,
            bottom: 68,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            padding: "24px 30px",
            borderRadius: 34,
            border: "1px solid rgba(255,255,255,0.82)",
            background: "rgba(255,255,255,0.38)",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 24,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#36648f",
            }}
          >
            Dental Health Blog
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 52,
              fontWeight: 700,
              lineHeight: 1.1,
              maxWidth: 620,
              color: "#16324f",
            }}
          >
            Christopher B. Wong, DDS
          </div>
        </div>
      </div>
    ),
    size,
  );
}
