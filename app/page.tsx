"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AnimatedRedirectPage() {
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Startet die 3D-Zoom-Animation nach einer kurzen Startverzögerung
    const timer = setTimeout(() => {
      setIsAnimating(true);
    }, 100);

    // Nach exakt 1.2 Sekunden (Dauer der Animation) leiten wir zur echten Landingpage weiter
    const redirectTimer = setTimeout(() => {
      router.push("/pilot"); // Oder direkt zu deiner gewünschten Route
    }, 1200);

    return () => {
      clearTimeout(timer);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <main className="relative w-screen h-screen bg-[#0A0A0C] overflow-hidden flex items-center justify-center perspective-[1200px]">
      {/* Hintergrund-Glow für Tiefe */}
      <div className="absolute w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* 3D-animiertes Portal / Logo-Card */}
      <div
        className={`relative z-10 flex flex-col items-center justify-center p-12 rounded-3xl bg-[#121216] border border-white/10 shadow-2xl transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) ${
          isAnimating
            ? "scale-[3.5] opacity-0 rotate-x-12 translate-z-[500px]"
            : "scale-100 opacity-100 rotate-x-0 translate-z-0"
        }`}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Kleines edles Badge */}
        <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full mb-4 border border-indigo-500/20">
          DealPilot Security & AI
        </span>

        {/* Haupttitel */}
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight text-center">
          Deal<span className="text-indigo-500">Pilot</span>
        </h1>

        <p className="text-xs sm:text-sm text-zinc-400 mt-2 font-medium tracking-wide">
          Sichere Umgebung wird initialisiert...
        </p>

        {/* Minimalistischer High-End Ladebalken */}
        <div className="w-48 h-1 bg-zinc-800 rounded-full mt-8 overflow-hidden">
          <div
            className={`h-full bg-indigo-500 transition-all duration-1000 ease-out ${
              isAnimating ? "w-full" : "w-1/4"
            }`}
          />
        </div>
      </div>
    </main>
  );
}
