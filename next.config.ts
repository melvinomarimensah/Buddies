import type { NextConfig } from "next";

// Baseline security response headers applied to every route. These are the
// unambiguously-safe hardening headers (they don't affect app behaviour):
//  - HSTS: force HTTPS for 2 years, incl. subdomains (safe on Vercel, which is
//    HTTPS-only). Enables preload-list eligibility.
//  - X-Frame-Options + frame-ancestors: block the site from being iframed
//    (clickjacking). The app is never embedded, so DENY is safe.
//  - X-Content-Type-Options: stop MIME sniffing.
//  - Referrer-Policy: don't leak full URLs (which can carry ids) cross-origin.
//  - Permissions-Policy: deny powerful features the app never uses.
// NOTE: a full Content-Security-Policy is intentionally left as a separate,
// nonce-based pass — a rushed CSP either breaks Next's inline scripts or is too
// weak to matter, and it needs careful preview testing (see SECURITY.md).
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
