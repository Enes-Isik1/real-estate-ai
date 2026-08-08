"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/utils/supabase/client";
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  Settings,
  FolderKanban,
  LogOut,
  MessageSquareText,
} from "lucide-react";

const INITIAL_DEALS = [
  { id: "1", title: "Lakefront Villa Munich" },
  { id: "2", title: "Penthouse Hamburg" },
  { id: "3", title: "Cozy Apartment Berlin" },
  { id: "4", title: "Commercial Loft Cologne" },
];

export default function SideBar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [deals, setDeals] = useState(INITIAL_DEALS);

  // Lädt neu analysierte Deals aus dem SessionStorage
  useEffect(() => {
    const storedDeal = sessionStorage.getItem("latest_analyzed_deal");
    if (storedDeal) {
      try {
        const parsedDeal = JSON.parse(storedDeal);
        setDeals((prevDeals) => {
          const exists = prevDeals.some((d) => d.id === parsedDeal.id);
          if (exists) return prevDeals;
          return [parsedDeal, ...prevDeals];
        });
      } catch (e) {
        console.error("Fehler beim Laden des Deals in der Sidebar:", e);
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      // 1. Bei Supabase abmelden
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Fehler beim Supabase SignOut:", e);
    }

    // 2. Lokale Speicher und Session-Caches komplett leeren (entfernt veraltete Deal-Zustände & Tokens)
    if (typeof window !== "undefined") {
      localStorage.clear();
      sessionStorage.clear();
    }

    // 3. Erzwinge einen harten Neuladen der Seite direkt zur Login-Route mit Cache-Busting
    window.location.href = "/login?t=" + Date.now();
  };

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Deals", href: "/dashboard/deals", icon: FolderKanban },
    { name: "AI Analytics", href: "/dashboard/analyze", icon: Sparkles },
    { name: "Documents", href: "/dashboard/documents", icon: FileText },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-zinc-300 bg-zinc-200/70 h-screen flex flex-col p-4 shrink-0 justify-between">
      {/* LOGO & NAVIGATION */}
      <div className="space-y-6 flex flex-col overflow-y-auto pr-1">
        {/* LOGO */}
        <div className="flex items-center gap-2 px-2 py-1.5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
            D
          </div>
          <span className="font-black text-gray-900 tracking-tight text-lg">
            Deal<span className="text-indigo-600">Pilot</span>
          </span>
        </div>

        {/* NAVIGATION */}
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.name === "Deals" &&
                pathname.startsWith("/dashboard/deals")) ||
              (item.name === "Documents" &&
                pathname.startsWith("/dashboard/documents"));

            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-500 hover:bg-slate-50 hover:text-gray-900"
                }`}
              >
                <Icon
                  className={`w-4.5 h-4.5 ${isActive ? "text-indigo-600" : "text-gray-400"}`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* UNTERER BEREICH: FEEDBACK, LOGOUT & ENGINE STATUS */}
      <div className="mt-auto pt-6 border-t border-gray-200/50 shrink-0 space-y-3">
        {/* FEEDBACK BUTTON */}
        <Link
          href="/dashboard/feedback"
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group ${
            pathname === "/dashboard/feedback"
              ? "bg-indigo-50 text-indigo-600"
              : "text-gray-500 hover:bg-slate-50 hover:text-gray-900"
          }`}
        >
          <MessageSquareText
            className={`w-4.5 h-4.5 ${
              pathname === "/dashboard/feedback"
                ? "text-indigo-600"
                : "text-gray-400 group-hover:text-gray-900"
            } transition-colors`}
          />
          <span>Feedback & Ideen</span>
        </Link>

        {/* LOGOUT BUTTON */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-150 cursor-pointer group"
        >
          <LogOut className="w-4.5 h-4.5 text-gray-400 group-hover:text-rose-500 transition-colors" />
          <span>Abmelden</span>
        </button>

        {/* ENGINE STATUS */}
        <div className="bg-slate-50 border border-gray-200/40 rounded-xl p-3 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
              Engine Status
            </span>
            <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Pilot Mode v1.0
            </span>
          </div>
          <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded border border-indigo-100">
            AI Active
          </span>
        </div>
      </div>
    </aside>
  );
}
