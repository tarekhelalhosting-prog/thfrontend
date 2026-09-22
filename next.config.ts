import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The API proxy route handler (src/app/api/[...path]/route.ts) needs the
  // exact trailing slash Django expects (e.g. /api/products/) preserved -
  // Next's default trailing-slash redirect would strip it before the route
  // handler even runs.
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
