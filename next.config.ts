import type { NextConfig } from "next";
import "./src/env.js";

const config: NextConfig = {
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

export default config;
