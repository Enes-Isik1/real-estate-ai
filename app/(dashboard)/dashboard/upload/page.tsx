// app/upload/page.tsx
"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Sparkles, Loader2, AlertCircle } from "lucide-react"
import PDFUploader from "@/components/ui/PDFUploader"

export default function UploadPage() {
  const router = useRouter()
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Funktion, die beim Klick auf "Start AI Analysis" ausführt
  const handleStartAnalysis = async () => {
    if (files.length === 0) {
      setError("Keine Dateien hochgeladen. Bitte wähle mindestens eine PDF aus.")
      return
    }

    setLoading(true)
    setError(null)

    const formData = new FormData()
    files.forEach((file) => {
      formData.append("files", file) // <--- Exakt der Key, den deine route.ts erwartet!
    })

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Fehler bei der Analyse.")
      }

      // Bei Erfolg leiten wir zum Dashboard oder der Detailseite weiter
      router.push("/dashboard")
      
    } catch (err: any) {
      console.error("Frontend Upload Fehler:", err)
      setError(err.message || "Ein unerwarteter Fehler ist aufgetreten.")
      setLoading(false)
    }
  }

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

      {/* Uploader Komponente */}
      <PDFUploader 
        selectedFiles={files} 
        onFilesSelected={(newFiles) => {
          setFiles(newFiles)
          setError(null)
        }} 
      />

      {/* Fehler-Anzeige */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-800 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-xs font-bold">{error}</p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-between items-center pt-4">
        <Link 
          href="/dashboard/new-deal" 
          className="px-5 py-2.5 border border-gray-200 hover:bg-slate-50 text-xs font-bold text-gray-600 rounded-xl transition-all"
        >
          Back to Deal Setup
        </Link>

        <button 
          type="button"
          onClick={handleStartAnalysis}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/10 active:scale-95 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analysiere Dokumente...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-white/20" />
              <span>Start AI Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}