import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Aktiviert den React Strict Mode für bessere Fehlererkennung in der Entwicklung
  reactStrictMode: true,

  // Verbessert die Performance durch SWC-Minimierung
  swcMinify: true,

  // Pakete transpilieren
  transpilePackages: ["@apm-js-collab/tracing-hooks"],

  // Server-External-Packages zur Behebung des ESM-Fehlers
  experimental: {
    serverExternalPackages: ["@apm-js-collab/tracing-hooks"],
  },

  // Professionelle HTTP-Header für Sicherheit und SEO
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: "agencyx-9q",
  project: "javascript-nextjs",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  webpack: {
    automaticVercelMonitors: true,
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
