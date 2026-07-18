"use client"

import React from "react"

export default function KpiCards() {
  const kpis = [
    {
      title: "Total Volume",
      value: "3,250,000 €",
      change: "+12.4%",
      changeType: "positive",
      desc: "vs. last month"
    },
    {
      title: "Active Deals",
      value: "12",
      change: "+3 new",
      changeType: "positive",
      desc: "this week"
    },
    {
      title: "Avg. Deal Cycle",
      value: "18 days",
      change: "-4 days",
      changeType: "positive",
      desc: "faster closing"
    },
    {
      title: "Win Rate",
      value: "84%",
      change: "-1.2%",
      changeType: "negative",
      desc: "vs. last year"
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => (
        <div 
          key={index} 
          className="bg-slate-50/30 border border-gray-200/60 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-6 py-5.5 hover:shadow-[0_8px_16px_rgba(0,0,0,0.06)] hover:bg-white hover:border-gray-200 transition-all duration-300"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {kpi.title}
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
              kpi.changeType === "positive" 
                ? "text-emerald-700 bg-emerald-50" 
                : "text-rose-700 bg-rose-50"
            }`}>
              {kpi.change}
            </span>
          </div>
          
          <div className="mt-4">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">
              {kpi.value}
            </h3>
            <p className="text-xs text-gray-400 mt-1 font-medium">
              {kpi.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}