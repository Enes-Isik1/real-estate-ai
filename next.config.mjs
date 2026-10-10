import * as Sentry from "@sentry/nextjs";

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

// Sichere Ermittlung der mitSentryConfig-Funktion für alle Sentry-Versionen
const withSentryConfig =
  Sentry.withSentryConfig ||
  Sentry.default?.withSentryConfig ||
  ((config) => config);

export default withSentryConfig(nextConfig, {
  org: "agencyx-9q",
  project: "javascript-nextjs",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",

  webpack: (config) => {
    config.externals.push({
      "@apm-js-collab/tracing-hooks": "commonjs @apm-js-collab/tracing-hooks",
    });
    return config;
  },
});
