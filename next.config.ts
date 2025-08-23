import type { NextConfig } from "next";
import nextPwa from "next-pwa";
import { withSentryConfig } from "@sentry/nextjs";
import "./src/env.js";

const withPwa = nextPwa({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
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

  async headers() {
    return [
      {
        source: "/relay-uYWY/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            // Serve from cache for 1 day, then revalidate in background for up to 7 days
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: "/relay-uYWY/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
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
  typedRoutes: true,
};

const configWithSentry = withSentryConfig(withPwa(nextConfig), {
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

export default configWithSentry;
