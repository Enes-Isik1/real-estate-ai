import { ReactNode } from "react";
import "./globals.css";
import SideBar from "../components/SideBar"; 
import TopBar from "../components/TopBar";   

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      {/* OPTIMIERT: bg-slate-50 statt bg-gray-50/50 für besseren Kontrast zu den weißen Karten */}
      <body className="bg-slate-50 min-h-screen text-gray-900 antialiased">
        <div className="flex h-screen overflow-hidden">
          {/* 1. Linke Sidebar */}
          <SideBar />

          {/* 2. Rechter Hauptbereich (Topbar + Inhalt) */}
          <div className="flex flex-col flex-1 overflow-hidden">
            <TopBar />
            <main className="flex-1 overflow-y-auto p-6 md:p-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}