import type { NextConfig } from "next";

// Server-side only (no NEXT_PUBLIC_ prefix) origin of the Django backend.
// Proxying /api/* through the Next.js server makes every API call same-origin
// from the browser's point of view, so the auth cookies Django sets become
// first-party instead of cross-site - this avoids browsers/in-app webviews
// (e.g. Facebook/Instagram's in-app browser) silently dropping or refusing to
// send the session cookie back on the next request, which was causing users
// to get bounced back to the login screen in an infinite loop after checkout.
const API_PROXY_TARGET = process.env.API_PROXY_TARGET || process.env.NEXT_PUBLIC_API_URL;

const nextConfig: NextConfig = {
  async rewrites() {
    if (!API_PROXY_TARGET) {
      return [];
    }

    return {
      beforeFiles: [],
      afterFiles: [
        {
          source: "/api/:path*",
          destination: `${API_PROXY_TARGET}/:path*`,
        },
      ],
      fallback: [],
    };
  },
};

export default nextConfig;
