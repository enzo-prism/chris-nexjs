import { ImageResponse } from "next/og";
import { getBlogArtSpec } from "@shared/blogArt";
import { getStorage } from "../../../server/storage/repository";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

const truncate = (value: string, max: number): string =>
  value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value;

// "Rooted" share card: evergreen field, gold growth rings, cream headline.
// Keep the styles to what @vercel/og supports (flex layout, solid borders,
// linear/radial gradients) — an unsupported background once crashed every
// blog card at render time.
const EVERGREEN_950 = "#061A14";
const EVERGREEN_800 = "#10382C";
const CREAM_50 = "#FDFBF7";
const CREAM_200 = "#EFE8DA";
const GOLD_300 = "#EBCB83";

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // The seeded spec only nudges where the rings sit, so each post's card differs.
  const spec = getBlogArtSpec(slug);
  const ringX = 860 + (spec.angle % 90);
  const ringY = 120 + (spec.gridOffset % 120);
  const storage = await getStorage();
  const post = await storage.getBlogPostBySlug(slug);
  const headline = truncate(post?.title ?? "Dental Health Blog", 96);

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          background: `radial-gradient(circle at 78% 22%, ${EVERGREEN_800} 0%, ${EVERGREEN_950} 70%)`,
        }}
      >
        {[120, 200, 290, 390, 500].map((radius, index) => (
          <div
            key={radius}
            style={{
              position: "absolute",
              left: ringX - radius,
              top: ringY - radius,
              width: radius * 2,
              height: radius * 2,
              borderRadius: 9999,
              border: `${index === 0 ? 3 : 2}px solid ${GOLD_300}`,
              opacity: 0.42 - index * 0.07,
            }}
          />
        ))}

        <div
          style={{
            position: "absolute",
            left: 80,
            top: 72,
            right: 80,
            bottom: 72,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 24,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: GOLD_300,
            }}
          >
            Christopher B. Wong, DDS · Palo Alto
          </div>
          <div
            style={{
              display: "flex",
              fontSize: headline.length > 52 ? 52 : 62,
              fontWeight: 700,
              lineHeight: 1.12,
              maxWidth: 900,
              color: CREAM_50,
            }}
          >
            {headline}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              color: CREAM_200,
            }}
          >
            Dental health blog · chriswongdds.com
          </div>
        </div>
      </div>
    ),
    size,
  );
}
