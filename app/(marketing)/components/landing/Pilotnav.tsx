"use client";

import { Sparkles } from "lucide-react";

export function PilotNav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/60 bg-[#FAFAFA]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
            <Sparkles className="h-4 w-4 text-white" strokeWidth={2.25} />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-gray-900">
            DealPilot
          </span>
          <span className="ml-1 rounded-full border border-gray-200 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-gray-500">
            Pilotprogramm
          </span>
        </div>

        <a
          href="#bewerbung"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          Early Access sichern
        </a>
      </div>
    </header>
  );
}
