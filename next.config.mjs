/** @type {import('next').NextConfig} */
const nextConfig = {
  // Aktiviert den React Strict Mode für bessere Fehlererkennung in der Entwicklung
  reactStrictMode: true,

  // Verbessert die Performance, indem die extrem schnelle, Rust-basierte SWC-Minimierung erzwungen wird
  swcMinify: true,

  // Verhindert, dass fehlerhafter TypeScript-Code oder ESLint-Fehler den Production-Build blockieren.
  // (Empfohlen, um beim Deployen nicht wegen Kleinigkeiten hängenzubleiben; Fehler siehst du im Editor)
  typescript: {
    ignoreBuildErrors: false, // Auf "true" setzen, falls der Build auf Vercel o.ä. trotz kleinerer Typ-Fehler durchgehen soll
  },
  eslint: {
    ignoreDuringBuilds: false,
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

export default nextConfig;