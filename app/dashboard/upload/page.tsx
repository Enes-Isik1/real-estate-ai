"use client"

import React, { useState } from "react"
import Link from "next/link"
import { UploadCloud, FileText, ArrowRight, Sparkles, ShieldAlert } from "lucide-react"

export default function UploadPage() {
  const [files, setFiles] = useState([
    { name: "Teilungserklaerung.pdf", size: "2.4 MB", status: "Ready" },
    { name: "Protokoll_Eigentuemerversammlung_2022.pdf", size: "4.1 MB", status: "Ready" }
  ])

  return (
    <div className="space-y-8 max-w-[1000px] mx-auto pb-12">
      {/* Header */}
      <div>
        <span className="text-[10px] font-black tracking-widest uppercase text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
          Step 2 of 3
        </span>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight mt-1.5">
          Upload Documents
        </h1>
        <p className="text-gray-400 text-sm mt-0.5 font-medium">
          Upload property files to start the automated AI Audit.
        </p>
      </div>

      {/* Drag & Drop Zone */}
      <div className="bg-white border-2 border-dashed border-gray-200 hover:border-indigo-500/50 rounded-3xl p-12 text-center transition-all cursor-pointer">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-700">Drag & drop your files here</p>
            <p className="text-xs text-gray-400 mt-1">PDF, DOCX up to 10MB each</p>
          </div>
          <button className="px-4 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-slate-100 transition-all">
            Browse Files
          </button>
        </div>
      </div>

      {/* File List */}
      <div className="bg-white border border-gray-200/60 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-500" /> Loaded Documents ({files.length})
        </h3>
        <div className="space-y-2">
          {files.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50 border border-gray-200/40 rounded-2xl">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs font-bold text-gray-700">{file.name}</p>
                  <p className="text-[10px] text-gray-400 font-medium">{file.size}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                {file.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between items-center pt-4">
        <Link 
          href="/dashboard/new-deal" 
          className="px-5 py-2.5 border border-gray-200 hover:bg-slate-50 text-xs font-bold text-gray-600 rounded-xl transition-all"
        >
          Back to Deal Setup
        </Link>

        <Link 
          href="/dashboard/analyze" 
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/10 active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 fill-white/20" />
          Start AI Analysis
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}