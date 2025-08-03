import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import "./src/env.js";

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
    ppr: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.convex.cloud",
        pathname: "/api/storage/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/relay-uYWY/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            // This value tells browsers to cache the asset for 5 days.
            // 'immutable' means the file will not change, so no re-validation is needed.
            value: "public, max-age=432000, immutable",
          },
        ],
      },
      {
        source: "/relay-uYWY/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
      {
        source: "/relay-uYWY/flags",
        destination: "https://eu.i.posthog.com/flags",
      },
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

export default withSentryConfig(nextConfig, {
  org: "y-fq",
  project: "ai-flow-studio",
  // Only print logs for uploading source maps in CI
  // Set to `true` to suppress logs
  silent: !process.env.CI,
  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,
  reactComponentAnnotation: {
    enabled: true,
  },
});
