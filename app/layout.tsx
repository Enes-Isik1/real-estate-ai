import { ReactNode } from "react";
import "./globals.css";
import SideBar from "@/components/SideBar"; // Mit großem B!
import TopBar from "@/components/TopBar";   // Mit großem B!

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body className="bg-gray-50/50 min-h-screen text-gray-900 antialiased">
        <div className="flex h-screen overflow-hidden">
          {/* 1. Linke Sidebar */}
          <Sidebar />

          {/* 2. Rechter Hauptbereich (Topbar + Inhalt) */}
          <div className="flex flex-col flex-1 overflow-hidden">
            <Topbar />
            <main className="flex-1 overflow-y-auto p-6 md:p-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}