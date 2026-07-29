import * as React from "react";
import { Zap, Clock, FileText, Layers, CheckCircle2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AnalysisFooterStatsProps extends React.HTMLAttributes<HTMLDivElement> {
  confidence?: number;
  processingTime?: string | number;
  documentCount?: number;
  pageCount?: number;
  clauseCount?: number;
  engineVersion?: string;
}

export const AnalysisFooterStats = React.forwardRef<HTMLDivElement, AnalysisFooterStatsProps>(
  ({
    confidence = 92,
    processingTime = "3.4s",
    documentCount = 1,
    pageCount = 42,
    clauseCount = 142,
    engineVersion = "v2.4",
    className,
    ...props
  }, ref) => {
    // Formatierungs-Helfer für Verarbeitungszeiten (falls nur Sekunden als Zahl übergeben werden)
    const formattedTime = typeof processingTime === "number" ? `${processingTime}s` : processingTime;

    return (
      <div
        ref={ref}
        role="region"
        aria-label="Engine Performance Statistics"
        className={cn(
          "w-full bg-slate-50/90 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 rounded-xl px-5 py-3.5 mt-8",
          "flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400",
          "shadow-xs backdrop-blur-xs transition-all duration-200",
          className
        )}
        {...props}
      >
        {/* Linke Seite: Engine Status */}
        <div className="flex items-center gap-2.5 font-medium text-slate-700 dark:text-slate-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="inline-flex items-center gap-1.5 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            DealPilot AI Engine {engineVersion} Active
          </span>
        </div>

        {/* Rechte Seite: Metriken Grid */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          
          <div className="flex items-center gap-1.5" title="AI Confidence Score">
            <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="text-slate-400 dark:text-slate-500">Confidence:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-200">{confidence}%</span>
          </div>

          <div className="flex items-center gap-1.5" title="Processing Time">
            <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="text-slate-400 dark:text-slate-500">Time:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-200">{formattedTime}</span>
          </div>

          <div className="flex items-center gap-1.5" title="Analyzed Documents">
            <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="text-slate-400 dark:text-slate-500">Documents:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-200">
              {documentCount} {documentCount === 1 ? "analyzed" : "analyzed"}
            </span>
          </div>

          <div className="flex items-center gap-1.5" title="Total Pages">
            <Layers className="w-3.5 h-3.5 text-purple-500 shrink-0" />
            <span className="text-slate-400 dark:text-slate-500">Pages:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-200">{pageCount}</span>
          </div>

          <div className="flex items-center gap-1.5" title="Extracted Clauses">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="text-slate-400 dark:text-slate-500">Clauses:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-200">{clauseCount} extracted</span>
          </div>

        </div>
      </div>
    );
  }
);

AnalysisFooterStats.displayName = "AnalysisFooterStats";