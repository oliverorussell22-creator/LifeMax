import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const appRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  experimental: {
    cpus: 1
  },
  poweredByHeader: false,
  turbopack: {
    root: appRoot
  }
};

export default nextConfig;
