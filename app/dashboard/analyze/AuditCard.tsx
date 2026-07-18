"use client"

import React, { useState } from "react"
import { 
  AlertTriangle, 
  Sparkles, 
  HelpCircle, 
  Copy, 
  Check, 
  ShieldAlert,
  FileWarning,
  CheckCircle2,
  Send,
  Loader2
} from "lucide-react"

function AuditCard() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [isSent, setIsSent] = useState(false)

  // Dokumenten-Audit-Daten (Passend zur Übersicht)
  const auditItems = [
    { name: "Teilungserklärung", status: "present", label: "Present" },
    { name: "Eigentümerversammlung 2024", status: "present", label: "Present" },
    { name: "Energieausweis", status: "missing", label: "Missing" },
    { name: "Grundbuchauszug", status: "present", label: "Present" },
    { name: "Grundriss", status: "missing", label: "Missing" }
  ]

  // Berechnung des Fortschritts
  const presentDocs = auditItems.filter(item => item.status === "present").length
  const totalDocs = auditItems.length
  const completionPercentage = Math.round((presentDocs / totalDocs) * 100)

  const risks = [
    {
      id: 1,
      title: "Roof renovation mentioned",
      detail: "Referenced in 2022 protocol. High probability of upcoming special levy.",
      badge: "Financial Risk",
    },
    {
      id: 2,
      title: "Garden usage rights unclear",
      detail: "Declaration of division does not explicitly assign exclusive rights to unit 4.",
      badge: "Legal Risk",
    },
    {
      id: 3,
      title: "Facade maintenance planned",
      detail: "Resolution draft #4 indicates mandatory painting project within 18 months.",
      badge: "Maintenance",
    }
  ]

  const questions = [
    "Are there outstanding renovation costs from the 2022 roof decision?",
    "Has the energy certificate been renewed to comply with latest standards?",
    "Are there unresolved disputes within the owners' association regarding garden access?"
  ]

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  // Email-Versand simulieren
  const handleRequestDocuments = () => {
    setIsSending(true)
    setTimeout(() => {
      setIsSending(false)
      setIsSent(true)
      setTimeout(() => setIsSent(false), 3000)
    }, 1500)
  }

  return (
    <div className="bg-[#0b0c14] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl text-white relative">
      {/* Subtile Hintergrund-Glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-rose-500/5 rounded-full blur-[80px] pointer-events-none" />

      {/* HEADER SECTION */}
      <div className="p-6 md:p-8 border-b border-gray-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest uppercase text-indigo-400">
                PRO FEATURE
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h2 className="text-xl font-black tracking-tight text-white mt-0.5">
              Document Audit
            </h2>
          </div>
        </div>

        {/* Confidence Progress Ring */}
        <div className="flex items-center gap-3 bg-gray-900/40 border border-gray-800/80 px-4 py-2 rounded-2xl">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <svg className="absolute w-full h-full transform -rotate-90">
              <circle cx="20" cy="20" r="16" className="stroke-gray-800 fill-none" strokeWidth="3" />
              <circle 
                cx="20" 
                cy="20" 
                r="16" 
                className="stroke-emerald-500 fill-none transition-all duration-1000" 
                strokeWidth="3" 
                strokeDasharray={100}
                strokeDashoffset={100 - completionPercentage}
                strokeLinecap="round"
              />
            </svg>
            <span className="text-[10px] font-black text-emerald-400">{completionPercentage}%</span>
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Audit Score</div>
            <div className="text-xs font-bold text-white">
              {completionPercentage >= 80 ? "Excellent" : completionPercentage >= 50 ? "Stable Progress" : "Needs Review"}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        
        {/* LIVE DOCUMENT LIST & PROGRESS */}
        <div className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
            File Completeness Status ({presentDocs}/{totalDocs})
          </span>
          <div className="grid grid-cols-1 gap-2.5">
            {auditItems.map((item, index) => {
              const isPresent = item.status === "present"
              return (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-colors ${
                    isPresent 
                      ? "bg-emerald-500/5 border-emerald-500/20" 
                      : "bg-rose-500/5 border-rose-500/20"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isPresent ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <FileWarning className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
                    )}
                    <span className="text-xs font-bold text-gray-300 truncate">{item.name}</span>
                  </div>

                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    isPresent 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  }`}>
                    {item.label}
                  </span>
                </div>
              )
            })}
          </div>

          {/* BUTTON ZUM ANFORDERN */}
          <button
            onClick={handleRequestDocuments}
            disabled={isSending || isSent}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer mt-2 ${
              isSent 
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                : "bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-500/40 shadow-lg shadow-indigo-600/15"
            }`}
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Requesting files...</span>
              </>
            ) : isSent ? (
              <>
                <Check className="w-4 h-4" />
                <span>Request Email Sent!</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Request Missing Files</span>
              </>
            )}
          </button>
        </div>

        {/* 1. RISKS FOUND */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Risks Identified ({risks.length})
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {risks.map((risk) => (
              <div 
                key={risk.id}
                className="group relative bg-gray-950/40 hover:bg-gray-900/30 border border-gray-800/60 rounded-2xl p-4 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                        {risk.title}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed max-w-xl">
                      {risk.detail}
                    </p>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full uppercase tracking-wider shrink-0">
                    {risk.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. AI RECOMMENDATION */}
        <div className="relative bg-gradient-to-r from-indigo-950/30 via-indigo-900/10 to-transparent border border-indigo-500/30 rounded-2xl p-5 overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold tracking-widest text-indigo-400 uppercase">
                AI Agent Recommendation
              </span>
              <h4 className="text-sm font-bold text-white">
                Secure exclusive garden status
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed max-w-2xl">
                Clarify the special usage rights (Sondernutzungsrechte) before listing the property. Clear rights can protect up to <span className="text-emerald-400 font-extrabold">€45,000 of the valuation</span>.
              </p>
            </div>
          </div>
        </div>

        {/* 3. QUESTIONS FOR SELLER */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Suggested Questions for the Seller
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {questions.map((q, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between gap-4 bg-gray-950/20 hover:bg-gray-950/50 border border-gray-800/40 hover:border-gray-800 rounded-xl p-3.5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-indigo-500/80 bg-indigo-500/5 border border-indigo-500/10 w-5 h-5 rounded-md flex items-center justify-center">
                    0{idx + 1}
                  </span>
                  <p className="text-xs text-gray-200 font-medium group-hover:text-white transition-colors">
                    {q}
                  </p>
                </div>
                <button 
                  onClick={() => handleCopy(q, idx)}
                  className="p-2 hover:bg-gray-800/80 rounded-lg text-gray-500 hover:text-white transition-all active:scale-95 shrink-0 animate-fade-in"
                  title="Copy question to clipboard"
                >
                  {copiedIndex === idx ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuditCard;