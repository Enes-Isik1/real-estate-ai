// app/components/ui/PDFUploader.tsx
"use client"

import React, { useState, useRef } from "react"
import { UploadCloud, FileText, Loader2, AlertCircle, CheckCircle } from "lucide-react"

interface PDFUploaderProps {
  onSuccess?: (data: any) => void;
}

export default function PDFUploader({ onSuccess }: PDFUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true)
    } else if (e.type === "dragleave") {
      setIsDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0])
    }
  }

  const uploadFile = async (file: File) => {
    setLoading(true)
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong during PDF upload.")
      }

      setResult(data)

      // Signalisiere der Hauptseite (Dashboard) den Erfolg
      if (onSuccess) {
        onSuccess(data)
      }
      
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      {/* Upload Box */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => !loading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px] ${
          isDragActive 
            ? "border-indigo-500 bg-indigo-50/30" 
            : "border-gray-200 hover:border-indigo-400 bg-white"
        } ${loading ? "pointer-events-none opacity-80" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
          disabled={loading}
        />

        {loading ? (
          <div className="space-y-3">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto" />
            <p className="text-sm font-bold text-gray-700">Reading PDF & extracting text...</p>
            <p className="text-xs text-gray-400 font-medium">This won't take long.</p>
          </div>
        ) : (
          <div className="space-y-4 group">
            <div className="p-3 bg-slate-50 rounded-2xl w-fit mx-auto border border-gray-100 group-hover:scale-105 transition-transform">
              <UploadCloud className="w-8 h-8 text-indigo-500" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-black text-gray-900 tracking-tight">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-400 font-medium">
                Standard Property PDFs (max. 15MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Feedback */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="text-xs font-black uppercase tracking-wider">Upload Failed</p>
            <p className="text-xs font-medium text-rose-600/90 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Success Feedback */}
      {result && (
        <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800 animate-fade-in">
          <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
          <div className="space-y-1 w-full">
            <p className="text-xs font-black uppercase tracking-wider text-emerald-700">
              Extraction Successful
            </p>
            <div className="text-[11px] font-medium text-emerald-800/80 space-y-1">
              <p>• <strong>File:</strong> {result.fileName} ({result.fileSize})</p>
              <p>• <strong>Pages detected:</strong> {result.pageCount}</p>
              <div className="mt-2 p-2.5 bg-white/70 rounded-lg border border-emerald-200/50">
                <span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Text Preview:</span>
                <p className="italic font-mono text-[10px] text-gray-600 line-clamp-2">
                  "{result.extractedText}"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}