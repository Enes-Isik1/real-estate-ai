"use client"

import React, { useState, useEffect } from "react"

export interface PropertyDeal {
  readonly id: string
  readonly title: string
  readonly client: string
  readonly email: string
  readonly score?: number
  readonly price: string
  readonly type: "villa" | "penthouse" | "apartment" | "house" | "office"
  readonly status: string
  readonly time: string
  
  // Neue Fokus-Eigenschaften
  readonly focusType: "action" | "blocked" | "neutral"
  readonly focusLabel: string
  readonly statusText: string
}

interface DealRowProps {
  deal: PropertyDeal
}

export default function DealRow({ deal }: DealRowProps) {
  // --- Score-Animation ---
  const fallbackScores: Record<string, number> = { "1": 92, "2": 78, "3": 41 }
  const realScore = typeof deal.score === "number" ? deal.score : (fallbackScores[deal.id] || 50)
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    let startTimestamp: number | null = null
    const duration = 1200
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      setAnimatedScore(Math.floor(progress * realScore))
      if (progress < 1) window.requestAnimationFrame(step)
    }
    window.requestAnimationFrame(step)
  }, [realScore])

  const radius = 20
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference

  // --- Dynamic Focus Styling ---
  let rowBg = "hover:bg-gray-50/80"
  let badgeStyle = "bg-gray-100 text-gray-700"
  let focusLabelStyle = "text-gray-500 bg-gray-50"
  let emoji = "🔹"

  if (deal.focusType === "action") {
    // Sanftes, einladendes Blau/Indigo, das sofort Aufmerksamkeit erregt
    rowBg = "bg-indigo-50/40 hover:bg-indigo-50/70 border-l-4 border-indigo-500 pl-3"
    badgeStyle = "bg-indigo-600 text-white shadow-sm font-bold"
    focusLabelStyle = "text-indigo-700 bg-indigo-100/60 font-semibold px-2.5 py-1 rounded-lg"
    emoji = "🔥"
  } else if (deal.focusType === "blocked") {
    // Alarmierendes Orange/Rot – signalisiert eine Blockade
    rowBg = "bg-amber-50/30 hover:bg-amber-50/60 border-l-4 border-amber-500 pl-3"
    badgeStyle = "bg-amber-100 text-amber-800 border border-amber-200"
    focusLabelStyle = "text-red-600 bg-red-50 font-bold px-2.5 py-1 rounded-lg border border-red-100 animate-pulse"
    emoji = "⏳"
  } else {
    // Schlicht, zurückhaltend und clean für laufende Deals
    rowBg = "hover:bg-gray-50/60 border-l-4 border-transparent pl-3"
    badgeStyle = "bg-gray-100 text-gray-600"
    focusLabelStyle = "text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg"
    emoji = "⚙️"
  }

  // Ring-Farbe
  const isHighValue = realScore >= 80
  const circleColor = isHighValue ? "stroke-indigo-600" : "stroke-gray-400"
  const scoreTextColor = isHighValue ? "text-indigo-600" : "text-gray-600"

  return (
    <div className={`py-4 pr-4 -mx-4 rounded-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100/50 ${rowBg}`}>
      
      {/* 1. Score & Titel (Blickfang) */}
      <div className="flex items-center gap-4 flex-1 min-w-[280px]">
        
        {/* Kreisring */}
        <div className="relative flex items-center justify-center w-12 h-12 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="24" cy="24" r={radius} className="stroke-gray-100" strokeWidth="3" fill="transparent" />
            <circle cx="24" cy="24" r={radius} className={`transition-all duration-75 ease-out ${circleColor}`} strokeWidth="3" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
          </svg>
          <span className={`absolute text-xs font-black ${scoreTextColor}`}>{animatedScore}</span>
        </div>

        {/* Textblock mit dynamischem Emoji */}
        <div>
          <h4 className="font-extrabold text-gray-900 text-[17px] tracking-tight flex items-center gap-2">
  <span className="text-lg">{emoji}</span>
  <span className="hover:text-indigo-600 cursor-pointer transition-colors">
    {deal.title}
  </span>
</h4>
          <p className="text-xs text-gray-400 mt-0.5 font-medium">
            {deal.client} <span className="text-gray-200">|</span> {deal.email}
          </p>
        </div>
      </div>

      {/* 2. Finanz-Info */}
      <div className="flex flex-col md:items-end justify-center min-w-[120px]">
        <span className="text-base font-black text-gray-950 tracking-tight">{deal.price}</span>
        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{deal.type}</span>
      </div>

      {/* 3. DYNAMISCHER SCHWERPUNKT (Das Herzstück!) */}
      <div className="flex flex-col md:items-end justify-center gap-1.5 min-w-[200px]">
        {/* Status-Text (z.B. Hot Lead / Waiting) */}
        <span className={`text-[10px] tracking-wider uppercase px-2.5 py-0.5 rounded-full font-black ${badgeStyle}`}>
          {deal.statusText}
        </span>
        {/* Dringende Aktion / Fehlende Info */}
        <span className={`text-xs ${focusLabelStyle}`}>
          {deal.focusLabel}
        </span>
      </div>

      {/* 4. Zeit */}
      <div className="flex items-center md:justify-end text-xs text-gray-400 font-medium min-w-[100px]">
        <span>{deal.time}</span>
      </div>

    </div>
  )
}