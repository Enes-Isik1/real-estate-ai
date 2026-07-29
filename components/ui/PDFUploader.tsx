// components/ui/PDFUploader.tsx
"use client"

import React, { useRef, useState } from "react"
import { UploadCloud, FileText, X } from "lucide-react"

interface PDFUploaderProps {
  onFilesSelected: (files: File[]) => void;
  selectedFiles?: File[];
}

export default function PDFUploader({ onFilesSelected, selectedFiles = [] }: PDFUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false)
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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files)
      onFilesSelected([...selectedFiles, ...newFiles])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      onFilesSelected([...selectedFiles, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    const updated = selectedFiles.filter((_, i) => i !== index)
    onFilesSelected(updated)
  }

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px] ${
          isDragActive ? "border-indigo-500 bg-indigo-50/30" : "border-gray-200 hover:border-indigo-400 bg-white"
        }`}
      >
        <input 
          type="file" 
          multiple 
          accept=".pdf"
          ref={fileInputRef}
          onChange={handleFileChange} 
          className="hidden" 
        />

        <div className="flex flex-col items-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-700">Drag & drop your PDF files here</p>
            <p className="text-xs text-gray-400 mt-1">PDF up to 10MB each</p>
          </div>
          <span className="px-4 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-600">
            Browse Files
          </span>
        </div>
      </div>

      {/* Liste der aktuell ausgewählten Dateien vor dem Absenden */}
      {selectedFiles.length > 0 && (
        <div className="bg-white border border-gray-200/60 rounded-3xl p-6 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-500" /> Selected Documents ({selectedFiles.length})
          </h3>
          <div className="space-y-2">
            {selectedFiles.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50 border border-gray-200/40 rounded-2xl">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  <div>
                    <p className="text-xs font-bold text-gray-700">{file.name}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                  className="p-1 hover:bg-gray-200/60 rounded-full text-gray-400 hover:text-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}