"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

interface Conflict {
  title: string;
  description: string;
  severity: "High" | "Medium" | "Low";
}

interface ConflictAlertProps {
  conflicts: Conflict[];
}

export const ConflictAlert = ({ conflicts }: ConflictAlertProps) => {
  if (!conflicts || conflicts.length === 0) return null;

  return (
    <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-3 text-rose-700">
        <AlertTriangle className="w-6 h-6" />
        <h3 className="text-lg font-black">Cross-Document Conflicts ({conflicts.length})</h3>
      </div>
      <div className="space-y-3">
        {conflicts.map((c, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-rose-100">
            <p className="font-bold text-rose-900">{c.title}</p>
            <p className="text-sm text-gray-600 mt-1">{c.description}</p>
            <span className={`inline-block mt-2 text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
              c.severity === "High" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
            }`}>
              {c.severity} Priority
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};