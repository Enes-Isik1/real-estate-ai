"use client"

import React from "react"
import Link from "next/link"
import { FileText, Plus, ArrowRight, Download } from "lucide-react"

const INITIAL_DOCUMENTS = [
  { id: "1", title: "Kaufvertrag_Lakefront_Villa.pdf", type: "PDF", size: "2.4 MB", date: "2026-07-15" },
  { id: "2", title: "Grundbuchauszug_Penthouse.pdf", type: "PDF", size: "1.1 MB", date: "2026-07-12" },
  { id: "3", title: "Energieausweis_Apartment.pdf", type: "PDF", size: "850 KB", date: "2026-07-10" },
]

export default function DocumentsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <FileText className="w-7 h-7 text-indigo-600" />
            Documents Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Übersicht aller hochgeladenen Verträge, Exposés und Dokumente.
          </p>
        </div>

        <button
          onClick={() => alert("Dokument-Upload Funktion")}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-sm shadow-indigo-100"
        >
          <Plus className="w-4 h-4" />
          Dokument hochladen
        </button>
      </div>

      {/* DOCUMENT GRID / TABLE */}
      <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100 font-bold text-gray-900">
          Vorhandene Dokumente
        </div>
        <div className="divide-y divide-gray-100">
          {INITIAL_DOCUMENTS.map((doc) => (
            <div key={doc.id} className="p-4 px-6 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Typ: {doc.type} • Größe: {doc.size} • Hochgeladen am: {doc.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg">
                  Verifiziert
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}