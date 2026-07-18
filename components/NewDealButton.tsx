"use client"

import React from "react"
import Link from "next/link" // WICHTIG: Importiert die schnelle Next.js-Link-Komponente
import { Plus } from "lucide-react"

export default function NewDealButton() {
  return (
    <Link 
      href="/dashboard/new-deal" // Linkt direkt zur Seite
      className="relative group overflow-hidden bg-gradient-to-b from-indigo-500 via-indigo-600 to-indigo-700 hover:from-indigo-400 hover:to-indigo-600 text-white font-bold text-sm py-2.5 px-5 rounded-2xl transition-all duration-300 shadow-[0_10px_25px_-5px_rgba(79,70,229,0.4)] hover:shadow-[0_14px_30px_-5px_rgba(79,70,229,0.5)] -translate-y-[1px] hover:-translate-y-[3px] active:translate-y-0 flex items-center justify-center gap-2 border-t border-indigo-400/30 active:scale-95 cursor-pointer inline-flex"
    >
      {/* Glanz-Effekt */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-t from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <Plus className="w-4 h-4 stroke-[3] transition-transform duration-300 group-hover:rotate-90" />
      <span className="tracking-wide">New Deal</span>
    </Link>
  )
}