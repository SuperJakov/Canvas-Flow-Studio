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
