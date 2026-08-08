import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DealPilot",
  description: "DealPilot — Pilotprogramm für Immobilienmakler",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
