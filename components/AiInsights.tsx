"use client"

import React from "react"

export default function AiInsights() {
  return (
    <div className="bg-slate-950 text-slate-100 p-6 rounded-2xl shadow-xl border border-slate-800/60 h-full flex flex-col justify-between min-h-[450px]">
      
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-400 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096L3 15l5.096-.813L9 9l.813 5.096L15 15l-5.096.813zM19.071 4.929l-.707 1.414-1.414.707 1.414.707.707 1.414.707-1.414 1.414-.707-1.414-.707-.707-1.414z" />
            </svg>
            <h3 className="font-bold text-sm tracking-wide uppercase text-slate-200">
              DealPilot AI Insights
            </h3>
          </div>
          <span className="flex items-center gap-1.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            Live
          </span>
        </div>

        <p className="text-xs text-slate-400 mt-4 leading-relaxed">
          AI has analyzed your 3 active deals. Action is required for a high-value lead.
        </p>
      </div>

      {/* Insights */}
      <div className="flex-1 py-6 space-y-4">
        
        {/* Action 1 */}
        <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
              Urgent Action
            </span>
            <span className="text-[10px] text-slate-400">Lakefront Villa</span>
          </div>
          <p className="text-xs font-semibold text-slate-200">
            Request Missing Documents
          </p>
          <p className="text-[11px] text-slate-400 leading-normal">
            Without the 2 missing documents, the closing probability will drop by <span className="text-red-400 font-bold">12%</span> in the next 48h.
          </p>
        </div>

        {/* Action 2 */}
        <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
              Hot Opportunity
            </span>
            <span className="text-[10px] text-slate-400">Penthouse HH</span>
          </div>
          <p className="text-xs font-semibold text-slate-200">
            Client Opened Email
          </p>
          <p className="text-[11px] text-slate-400 leading-normal">
            Anna S. viewed the exposé 5 minutes ago. This is the perfect time for a follow-up call.
          </p>
        </div>

        {/* Action 3 */}
        <div className="p-3.5 bg-slate-800/40 border border-slate-800/80 rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Market Update
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-200">
            Interest Rates Stable
          </p>
          <p className="text-[11px] text-slate-500 leading-normal">
            Mortgage rates remain steady this week. Great leverage for negotiations on the Loft deal.
          </p>
        </div>

      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-slate-800/50 space-y-3">
        <div className="flex justify-between items-center text-[11px] text-slate-400">
          <span>Last scan:</span>
          <span className="font-medium text-slate-300">Just now</span>
        </div>
        
        <button 
          onClick={() => alert("Scanning inbox for new updates...")}
          className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Rescan Inbox
        </button>
      </div>

    </div>
  )
}