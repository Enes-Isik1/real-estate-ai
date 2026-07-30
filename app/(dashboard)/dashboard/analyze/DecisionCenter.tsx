"use client"

import React, { useState } from "react"
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  XCircle, 
  TrendingUp, 
  ShieldAlert, 
  ArrowRight,
  Mail,
  FileCheck,
  CalendarDays,
  FileQuestion
} from "lucide-react"

// 1. Definition der möglichen AI Recommendations mit Styling
type RecommendationType = "Proceed" | "Proceed with Conditions" | "Delay Closing" | "High Risk" | "Reject"

interface RecommendationStyle {
  label: string
  bg: string
  border: string
  text: string
  icon: React.ReactNode
  description: string
}

const recommendationConfig: Record<RecommendationType, RecommendationStyle> = {
  "Proceed": {
    label: "Proceed",
    bg: "bg-emerald-50/80",
    border: "border-emerald-200",
    text: "text-emerald-700",
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    description: "The transaction exhibits no critical blockers. Recommended to fast-track contract drafting."
  },
  "Proceed with Conditions": {
    label: "Proceed with Conditions",
    bg: "bg-indigo-50/80",
    border: "border-indigo-200",
    text: "text-indigo-700",
    icon: <Sparkles className="w-5 h-5 text-indigo-600" />,
    description: "Strong deal fundamentals, but requires outstanding documents and specific clause clarifications before closing."
  },
  "Delay Closing": {
    label: "Delay Closing",
    bg: "bg-amber-50/80",
    border: "border-amber-200",
    text: "text-amber-700",
    icon: <Clock className="w-5 h-5 text-amber-600" />,
    description: "Pending structural or legal disclosures. Postpone contract signing until verified."
  },
  "High Risk": {
    label: "High Risk",
    bg: "bg-rose-50/80",
    border: "border-rose-200",
    text: "text-rose-700",
    icon: <AlertTriangle className="w-5 h-5 text-rose-600 animate-pulse" />,
    description: "Severe liabilities or missing core documentation detected. Significant exposure to transaction failure."
  },
  "Reject": {
    label: "Reject",
    bg: "bg-slate-100",
    border: "border-slate-300",
    text: "text-slate-800",
    icon: <XCircle className="w-5 h-5 text-slate-700" />,
    description: "Critical dealbreakers identified in the division declaration or buyer financials. Termination recommended."
  }
}

export default function DecisionCenter({ risks }: { risks: any[] }) {
  // Aktueller AI Status für diesen Deal
  const currentRecommendation: RecommendationType = "Proceed with Conditions"
  const recommendation = recommendationConfig[currentRecommendation]

  // 2. Enterprise Metrics Daten
  const metrics = [
    { 
      label: "Overall Deal Score", 
      value: "92/100", 
      trend: "Excellent", 
      color: "text-emerald-600",
      icon: <TrendingUp className="w-4 h-4" /> 
    },
    { 
      label: "Buyer Reliability", 
      value: "88%", 
      trend: "High Trust", 
      color: "text-indigo-600",
      icon: <CheckCircle2 className="w-4 h-4" /> 
    },
    { 
      label: "Legal Exposure", 
      value: "Low", 
      trend: "3 Warnings", 
      color: "text-amber-600",
      icon: <ShieldAlert className="w-4 h-4" /> 
    },
    { 
      label: "Financial Exposure", 
      value: "Minimal", 
      trend: "Verified", 
      color: "text-emerald-600",
      icon: <FileCheck className="w-4 h-4" /> 
    }
  ]

  // 3. Recommended Actions State
  const [actions, setActions] = useState([
    { id: "action-1", text: "Request Energy Certificate", completed: false, icon: <FileQuestion className="w-4 h-4" /> },
    { id: "action-2", text: "Clarify Garden Rights", completed: false, icon: <AlertTriangle className="w-4 h-4" /> },
    { id: "action-3", text: "Schedule Follow-up", completed: false, icon: <CalendarDays className="w-4 h-4" /> },
    { id: "action-4", text: "Generate Buyer Email", completed: false, icon: <Mail className="w-4 h-4" /> }
  ])

  const toggleAction = (id: string) => {
    setActions(prev => 
      prev.map(action => 
        action.id === id ? { ...action, completed: !action.completed } : action
      )
    )
  }

  return (
    <div className="bg-white border border-gray-200/60 rounded-3xl p-6 shadow-sm space-y-6">
      
      {/* Header & AI Recommendation Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="space-y-1">
          <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            AI Decision Center
          </h3>
          <p className="text-xs text-gray-400 font-medium">
            Real-time risk evaluation and strategic pipeline steering.
          </p>
        </div>

        {/* Dynamisches Farb-Badge */}
        <div className={`flex items-start gap-3 p-3 rounded-2xl border ${recommendation.bg} ${recommendation.border} max-w-md`}>
          <div className="shrink-0 mt-0.5">{recommendation.icon}</div>
          <div className="space-y-0.5">
            <p className={`text-xs font-black uppercase tracking-wider ${recommendation.text}`}>
              {recommendation.label}
            </p>
            <p className="text-[11px] text-gray-600 leading-normal font-medium">
              {recommendation.description}
            </p>
          </div>
        </div>
      </div>

      {/* Grid Layout: Links Metrics, Rechts Interactive Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Die 4 Enterprise Metrics */}
        <div className="lg:col-span-6 grid grid-cols-2 gap-4">
          {metrics.map((metric, idx) => (
            <div 
              key={idx} 
              className="p-4 bg-slate-50/60 border border-gray-150/50 rounded-2xl flex flex-col justify-between hover:bg-slate-50 hover:border-gray-200 transition-all cursor-default"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  {metric.label}
                </span>
                <span className="text-gray-400">{metric.icon}</span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-black text-gray-900 tracking-tight">
                  {metric.value}
                </p>
                <p className={`text-[10px] font-bold mt-0.5 ${metric.color}`}>
                  • {metric.trend}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Recommended Actions */}
        <div className="lg:col-span-6 bg-slate-50/40 border border-gray-150/50 rounded-2xl p-5 space-y-3.5">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">
            Recommended Actions
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={() => toggleAction(action.id)}
                className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all active:scale-[0.98] cursor-pointer group ${
                  action.completed
                    ? "bg-emerald-50/50 border-emerald-200 text-emerald-800"
                    : "bg-white border-gray-200 hover:border-indigo-200 text-gray-700"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className={`p-1.5 rounded-lg transition-colors ${
                    action.completed 
                      ? "bg-emerald-100 text-emerald-700" 
                      : "bg-slate-100 text-gray-400 group-hover:text-indigo-500 group-hover:bg-indigo-50"
                  }`}>
                    {action.icon}
                  </div>
                  <span className={`text-xs font-bold truncate ${action.completed ? "line-through text-emerald-700/70" : ""}`}>
                    {action.text}
                  </span>
                </div>

                <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-all shrink-0 ml-2 ${
                  action.completed
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "border-gray-300 group-hover:border-indigo-500"
                }`}>
                  {action.completed && <span className="text-[9px] font-black">✓</span>}
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>

    </div>
  )
}