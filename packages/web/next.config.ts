import type { NextConfig } from "next";
import { join } from "node:path";

const nextConfig: NextConfig = {
  // Pin Turbopack to this monorepo so it doesn't crawl ~/ for file changes.
  // Without this, Turbopack walked up to /home/luism/ (because of a stray
  // package-lock.json) and watched the entire home dir — kills the machine.
  turbopack: {
    root: join(import.meta.dirname, "..", ".."),
  },
};

export default nextConfig;
