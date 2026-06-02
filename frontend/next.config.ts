import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack root configuration for multi-package setups
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;