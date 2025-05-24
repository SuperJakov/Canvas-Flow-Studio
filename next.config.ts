/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import type { NextConfig } from "next";
import "./src/env.js";

const config: NextConfig = {
  experimental: {
    reactCompiler: true,
  },
};

export default config;
