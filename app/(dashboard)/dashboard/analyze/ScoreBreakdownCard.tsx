"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

export function ScoreBreakdownCard({
  score,
  breakdown,
}: {
  score: number;
  breakdown: Array<{
    points: number;
    category: string;
    reason: string;
    pageNumber?: number;
  }>;
}) {
  return (
    <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900 text-base">
            DealPilot Decision Score
          </h3>
          <p className="text-xs text-gray-500">
            Transparente Aufschlüsselung der Kaufentscheidung
          </p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          <span className="text-xl font-black text-indigo-700">
            {score}/100
          </span>
        </div>
      </div>

      <div className="space-y-2.5">
        {breakdown && breakdown.length > 0 ? (
          breakdown.map((item, index) => (
            <div
              key={index}
              className="flex items-start justify-between p-3.5 bg-gray-50 rounded-2xl text-xs border border-gray-100"
            >
              <div className="space-y-1 pr-4">
                <p className="font-bold text-gray-900 flex items-center gap-1.5">
                  {item.points >= 0 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  )}
                  {item.category}
                </p>
                <p className="text-gray-600">
                  {item.reason}{" "}
                  {item.pageNumber && (
                    <span className="text-indigo-600 font-semibold">
                      (S. {item.pageNumber})
                    </span>
                  )}
                </p>
              </div>
              <span
                className={`font-black px-2.5 py-1 rounded-xl shrink-0 h-fit ${item.points >= 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"}`}
              >
                {item.points > 0 ? `+${item.points}` : item.points} Pkt.
              </span>
            </div>
          ))
        ) : (
          <p className="text-xs text-gray-400 italic text-center py-2">
            Keine abweichenden Faktoren dokumentiert.
          </p>
        )}
      </div>
    </div>
  );
}
