import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, FileText, ExternalLink, ShieldAlert } from "lucide-react";

interface Risk {
  severity: "High" | "Medium" | "Low";
  title: string;
  whyItMatters: string;
  source?: {
    pageNumber?: number;
    documentType?: string;
  };
}

export function RiskAssessment({ 
  risks, 
  onScrollToSource 
}: { 
  risks: Risk[]; 
  onScrollToSource?: (page: number) => void 
}) {
  if (!risks || risks.length === 0) return null;

  // Hilfsfunktion für Badge-Styling je nach Schweregrad
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "High":
        return <Badge variant="destructive" className="font-bold">High Risk</Badge>;
      case "Medium":
        return <Badge variant="default" className="bg-amber-500 hover:bg-amber-600 text-white font-medium">Medium</Badge>;
      default:
        return <Badge variant="secondary" className="font-normal">Low</Badge>;
    }
  };

  return (
    <Card className="border-gray-200/80 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Risikobewertung & Document Audit
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {risks.map((risk, index) => {
          const pageNum = risk.source?.pageNumber || (risk as any).page || 1;
          const docType = risk.source?.documentType || "Dokument";
          const isHighRisk = risk.severity === "High";

          return (
            <div 
              key={index} 
              className={`flex flex-col gap-2 p-3.5 rounded-xl border transition-all ${
                isHighRisk 
                  ? "bg-rose-50/50 border-rose-200/80 hover:border-rose-300" 
                  : "bg-slate-50 border-gray-100 hover:border-gray-200"
              }`}
            >
              {/* Kopfzeile der Risk Card mit optionalem High-Risk-Linkssymbol */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  {isHighRisk && (
                    <div className="p-1 rounded-md bg-rose-100 text-rose-600 mt-0.5 shrink-0">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                  )}
                  <span className="font-semibold text-sm text-gray-900 leading-snug">
                    {risk.title}
                  </span>
                </div>
                {getSeverityBadge(risk.severity)}
              </div>

              {/* KI-Erklärung (Warum ist das ein Risiko?) */}
              <p className="text-xs text-gray-600 leading-relaxed pl-6">
                {risk.whyItMatters}
              </p>

              {/* Footer der Karte: Belegbarkeit / Seitenzahl & Jump-to-Source */}
              <div className="flex items-center justify-between pt-2 mt-1 border-t border-gray-200/60 text-xs pl-6">
                <div className="flex items-center gap-1.5 text-gray-500 font-medium">
                  <FileText className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Gefunden auf Seite {pageNum} ({docType})</span>
                </div>

                {onScrollToSource && (
                  <button 
                    type="button"
                    onClick={() => onScrollToSource(pageNum)}
                    className="h-7 px-2 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 inline-flex items-center rounded cursor-pointer transition-colors font-medium"
                  >
                    <span>View Source</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}