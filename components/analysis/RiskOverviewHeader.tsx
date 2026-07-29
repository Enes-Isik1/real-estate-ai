import * as React from "react";
import { AlertTriangle, CheckCircle2, Layers, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RiskOverviewHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  riskCount?: number;
  recommendationCount?: number;
  pageCount?: number;
  confidence?: number;
}

export const RiskOverviewHeader = React.forwardRef<HTMLDivElement, RiskOverviewHeaderProps>(
  ({
    riskCount = 3,
    recommendationCount = 4,
    pageCount = 214,
    confidence = 96,
    className,
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "w-full bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-5 mb-5",
          "shadow-md border border-slate-800 flex flex-wrap items-center justify-between gap-4",
          className
        )}
        {...props}
      >
        {/* Linker Bereich: Titel / Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold tracking-tight text-white">
              Executive Due-Diligence Audit
            </h4>
            <p className="text-xs text-slate-300">
              Automatisch extrahiert & verifiziert durch DealPilot AI
            </p>
          </div>
        </div>

        {/* Rechter Bereich: Die Metrik-Badges */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          
          {/* Risks Badge */}
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl text-xs font-medium text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span><strong>{riskCount}</strong> Risks</span>
          </div>

          {/* Recommendations Badge */}
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-xs font-medium text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span><strong>{recommendationCount}</strong> Recommendations</span>
          </div>

          {/* Pages Analyzed Badge */}
          <div className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-xl text-xs font-medium text-purple-300">
            <Layers className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span><strong>{pageCount}</strong> Pages analyzed</span>
          </div>

          {/* Confidence Badge */}
          <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-400/20 px-3 py-1.5 rounded-xl text-xs font-medium text-indigo-200">
            <Zap className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span><strong>{confidence}%</strong> confidence</span>
          </div>

        </div>
      </div>
    );
  }
);

RiskOverviewHeader.displayName = "RiskOverviewHeader";