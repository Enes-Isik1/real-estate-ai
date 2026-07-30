"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
// Falls du NextAuth nutzt, aktiviere diesen Import:
// import { useSession } from "next-auth/react";

interface DashboardHeaderProps {
  userName?: string;
}

export default function DashboardHeader({ userName }: DashboardHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  // NextAuth Hook (falls aktiv)
  // const { data: session } = useSession();

  // Ermittle den finalen Usernamen mit Priorität:
  // 1. Per Prop übergeben -> 2. Aus Session/Backend -> 3. Fallback
  const displayName =
    userName ||
    // session?.user?.name ||
    "Enes";

  useEffect(() => {
    const mainContainer = document.querySelector("main");
    if (!mainContainer) return;

    const handleScroll = () => {
      if (mainContainer.scrollTop > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    mainContainer.addEventListener("scroll", handleScroll, { passive: true });
    return () => mainContainer.removeEventListener("scroll", handleScroll);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <header
      className={`shrink-0 z-40 transition-all duration-200 py-4 px-6 md:px-10 max-w-[1600px] mx-auto w-full border-b flex items-center justify-between ${
        isScrolled
          ? "bg-stone-100/90 backdrop-blur-md shadow-sm border-stone-300/60"
          : "bg-transparent border-transparent"
      }`}
    >
      <div>
        <h1
          className={`font-black tracking-tight text-gray-900 transition-all duration-200 flex items-center gap-2 ${
            isScrolled ? "text-lg" : "text-3xl"
          }`}
        >
          {getGreeting()}, {displayName}{" "}
          <span className="animate-bounce-slow">👋</span>
        </h1>
        {!isScrolled && (
          <p className="text-gray-500 text-sm mt-1 font-medium">
            You have{" "}
            <span className="text-indigo-600 font-bold">3 hot leads</span>{" "}
            waiting for your review today.
          </p>
        )}
      </div>

      {/* New Deal Button */}
      <button
        onClick={() => router.push("/dashboard/new-deal")}
        className="relative group overflow-hidden bg-gradient-to-b from-indigo-500 via-indigo-600 to-indigo-700 hover:from-indigo-400 hover:to-indigo-600 text-white font-bold text-sm py-2.5 px-5 rounded-2xl transition-all duration-300 shadow-[0_10px_25px_-5px_rgba(79,70,229,0.4)] hover:shadow-[0_14px_30px_-5px_rgba(79,70,229,0.5)] flex items-center justify-center gap-2 border-t border-indigo-400/30 active:scale-95 cursor-pointer"
      >
        <span className="absolute inset-0 w-full h-full bg-gradient-to-t from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        <Plus className="w-4 h-4 stroke-[3] transition-transform duration-300 group-hover:rotate-90" />
        <span className="tracking-wide">New Deal</span>
      </button>
    </header>
  );
}
