import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
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

  // Enterprise-Lösung: Zwingt Webpack, das ESM-Modul sauber zu externalisieren
  webpack: (config) => {
    config.externals.push({
      "@apm-js-collab/tracing-hooks": "commonjs @apm-js-collab/tracing-hooks",
    });
    return config;
  },
});
