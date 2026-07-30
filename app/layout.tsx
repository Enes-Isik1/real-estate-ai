import { ReactNode } from "react";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body className="bg-slate-50 min-h-screen text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
