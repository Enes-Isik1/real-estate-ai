"use client";

import React, { useState } from "react";
import { FileText, Download, Loader2 } from "lucide-react";

export function ExportButton({ dealId }: { dealId?: string }) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!dealId) {
      // Fallback: Direkter Druckdialog (perfekt für saubere Browser-PDFs)
      window.print();
      return;
    }

    setExporting(true);
    try {
      const res = await fetch(`/api/export-pdf?dealId=${dealId}`);
      if (res.ok) {
        window.print(); // Öffnet den nativen Druckdialog mit den generierten Daten
      }
    } catch (err) {
      console.error("Export Fehler:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-800 font-bold rounded-2xl text-xs border border-gray-200/80 transition-all shadow-sm cursor-pointer"
    >
      {exporting ? (
        <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
      ) : (
        <FileText className="w-4 h-4 text-indigo-600" />
      )}
      <span>PDF-Report exportieren</span>
    </button>
  );
}
