"use client"

import React, { useState } from "react"
import { 
  FileText, 
  MapPin, 
  BrainCircuit, 
  Target, 
  ChevronRight, 
  Quote,
  Activity
} from "lucide-react"

// Typ-Definition für unsere Beweiskette
interface EvidenceItem {
  id: string
  docName: string
  page: number
  originalQuote: string
  aiInterpretation: string
  relevance: "High" | "Medium" | "Low"
  targetRiskId: number // Verknüpfung zum Risiko in der Hauptliste
}

export default function EvidenceTimeline({ data }: { data: any }) {
  const [activeItem, setActiveItem] = useState<string>("ev-1")

  const evidenceData: EvidenceItem[] = [
    {
      id: "ev-1",
      docName: "Eigentümerversammlung 2024",
      page: 84,
      originalQuote: "„Unter TOP 4 beschließt die Wohnungseigentümergemeinschaft mehrheitlich die vollflächige Sanierung des Flachdachs im kommenden Geschäftsjahr. Die Kosten hierfür werden über eine Sonderumlage erhoben...“",
      aiInterpretation: "Die beschlossene Dachsanierung ist rechtlich bindend. Da die Finanzierung über eine Sonderumlage (special levy) erfolgt, kommen auf den zukünftigen Käufer unmittelbar nach Erwerb erhebliche unvorhergesehene Kosten zu.",
      relevance: "High",
      targetRiskId: 1
    },
    {
      id: "ev-2",
      docName: "Teilungserklärung (Declaration of Division)",
      page: 42,
      originalQuote: "„Dem jeweiligen Eigentümer der Einheit Nr. 4 steht das Recht zu, den im Aufteilungsplan als 'Gartenfläche G4' gekennzeichneten Bereich zu nutzen, sofern keine anderweitigen Beschlüsse der Gemeinschaft entgegenstehen...“",
      aiInterpretation: "Die Formulierung 'sofern keine anderweitigen Beschlüsse entgegenstehen' schwächt das Sondernutzungsrecht massiv ab. Es handelt sich nicht um ein uneingeschränktes, dinglich gesichertes Recht. Dies muss im Kaufvertrag geheilt werden.",
      relevance: "Medium",
      targetRiskId: 2
    },
    {
      id: "ev-3",
      docName: "Wirtschaftsplan & Beschlusssammlung",
      page: 12,
      originalQuote: "„Für die anstehende Fassadeninstandhaltung wird eine Erhöhung der Erhaltungsrücklage um monatlich 45,- € je Miteigentumsanteil ab dem 01.10.2024 empfohlen.“",
      aiInterpretation: "Auch wenn noch kein finaler Sanierungsbeschluss vorliegt, zeigt die empfohlene Erhöhung der Rücklagen eine klare Tendenz zu anstehenden Instandhaltungskosten an der Außenhülle.",
      relevance: "Low",
      targetRiskId: 3
    }
  ]

  return (
    <div className="bg-[#0b0c14] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl text-white relative">
      {/* Glow-Effekte passend zur AuditCard */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Header */}
      <div className="p-6 md:p-8 border-b border-gray-800/80 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-widest uppercase text-indigo-400 block">
              Traceability Engine
            </span>
            <h3 className="text-xl font-black tracking-tight text-white mt-0.5">
              AI Evidence Timeline
            </h3>
          </div>
        </div>
        <span className="hidden sm:inline-block text-[10px] font-bold text-gray-400 bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-full">
          Click items to inspect source
        </span>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-gray-800/80">
        
        {/* Linke Seite: Navigations-Timeline */}
        <div className="lg:col-span-5 p-6 space-y-3 max-h-[420px] overflow-y-auto">
          {evidenceData.map((item) => {
            const isActive = activeItem === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveItem(item.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 relative group cursor-pointer ${
                  isActive 
                    ? "bg-indigo-600/10 border-indigo-500/40 shadow-lg shadow-indigo-500/5" 
                    : "bg-gray-950/20 border-gray-800/60 hover:bg-gray-950/50 hover:border-gray-800"
                }`}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <div className="absolute left-0 top-4 bottom-4 w-1 bg-indigo-500 rounded-r-full" />
                )}

                <div className="flex items-start justify-between gap-2 pl-2">
                  <div className="space-y-1 min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                      <FileText className="w-3 h-3 text-indigo-400" />
                      {item.docName.length > 25 ? `${item.docName.slice(0, 25)}...` : item.docName}
                    </span>
                    <h4 className={`text-sm font-bold truncate transition-colors ${isActive ? "text-white" : "text-gray-300 group-hover:text-white"}`}>
                      Page {item.page}
                    </h4>
                  </div>
                  
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                      item.relevance === "High" 
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                        : item.relevance === "Medium"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    }`}>
                      {item.relevance}
                    </span>
                    <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isActive ? "translate-x-1 text-indigo-400" : "group-hover:translate-x-0.5"}`} />
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Rechte Seite: Detail-Inspektion */}
        <div className="lg:col-span-7 p-6 md:p-8 flex flex-col justify-between bg-gray-950/25 min-h-[350px]">
          {(() => {
            const selected = evidenceData.find(i => i.id === activeItem)
            if (!selected) return null

            return (
              <div className="space-y-6 animate-fade-in">
                {/* Document & Page Badge */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="flex items-center gap-1.5 text-xs text-indigo-400 font-bold bg-indigo-500/10 px-3 py-1.5 border border-indigo-500/20 rounded-xl">
                    <FileText className="w-3.5 h-3.5" />
                    {selected.docName}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 border border-emerald-500/20 rounded-xl">
                    <MapPin className="w-3.5 h-3.5" />
                    Page {selected.page}
                  </span>
                </div>

                {/* Original Quote */}
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold tracking-widest text-gray-500 uppercase flex items-center gap-1.5">
                    <Quote className="w-3 h-3" />
                    Original Text Extract
                  </span>
                  <div className="bg-gray-900/40 border border-gray-800/80 rounded-2xl p-4 text-xs italic text-gray-300 leading-relaxed relative">
                    {selected.originalQuote}
                  </div>
                </div>

                {/* AI Interpretation */}
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold tracking-widest text-indigo-400 uppercase flex items-center gap-1.5">
                    <BrainCircuit className="w-3.5 h-3.5 animate-pulse" />
                    AI Reasoning & Risk Impact
                  </span>
                  <p className="text-xs text-gray-200 leading-relaxed pl-1">
                    {selected.aiInterpretation}
                  </p>
                </div>

                {/* Footnote / Action */}
                <div className="pt-4 border-t border-gray-800/60 flex items-center justify-between text-[10px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-indigo-500" />
                    Relevance Score: <strong className="text-white">{selected.relevance} Impact</strong>
                  </span>
                  <span className="font-semibold text-gray-500">
                    Source Verified ✓
                  </span>
                </div>
              </div>
            )
          })()}
        </div>

      </div>
    </div>
  )
}