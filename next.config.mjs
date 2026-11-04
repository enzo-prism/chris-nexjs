const isProd = process.env.NODE_ENV === "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // `page.dev.tsx` is only a route in development so fixture previews never
  // enter the production app-paths manifest.
  pageExtensions: isProd ? ["tsx", "ts"] : ["tsx", "ts", "dev.tsx"],
  compiler: {
    removeConsole: isProd ? { exclude: ["error", "warn"] } : false,
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/dhqpqfw6w/**",
      },
      {
        protocol: "https",
        hostname: "ocq09yvkilexm759.public.blob.vercel-storage.com",
        pathname: "/videos/invisalign/**",
      },
    ],
  },
  poweredByHeader: false,
  reactStrictMode: true,
  trailingSlash: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
