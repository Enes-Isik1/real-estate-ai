"use client";

import React from "react";
import { Sparkles, Zap, ArrowRight } from "lucide-react";

export function DealExaminerCard({
  report,
}: {
  report?: {
    headline: string;
    criticalTakeaways: string[];
    brokerActionItem: string;
  };
}) {
  if (!report) return null;

  return (
    <div className="bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 border border-indigo-500/30 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden space-y-6">
      {/* Hintergrund-Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
            <Zap className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
              DealPilot Killer-Feature
            </span>
            <h2 className="text-xl font-black text-white tracking-tight">
              Der Makler-Briefing-Report
            </h2>
          </div>
        </div>
        <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs font-bold text-indigo-300">
          KI-Executive Briefing
        </span>
      </div>

      <div className="space-y-3">
        <h3 className="text-base font-bold text-indigo-200 leading-snug">
          📌 {report.headline}
        </h3>

        <div className="space-y-2 pt-2">
          {report.criticalTakeaways?.map((takeaway, index) => (
            <div
              key={index}
              className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl p-3.5 text-xs text-gray-300"
            >
              <span className="w-5 h-5 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shrink-0 mt-0.5">
                {index + 1}
              </span>
              <p className="leading-relaxed">{takeaway}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-indigo-900/30 border border-indigo-500/20 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">
            Nächster Schritt für den Makler
          </span>
          <p className="text-xs font-semibold text-white">
            {report.brokerActionItem}
          </p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 text-white">
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
