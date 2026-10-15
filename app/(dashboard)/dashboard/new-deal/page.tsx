"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  UploadCloud,
  FileText,
  X,
  Sparkles,
  Mail,
  AlignLeft,
  CheckCircle2,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

// Worker für pdfjs im Browser konfigurieren
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: "pdf" | "image";
}

export default function NewDealPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [emailText, setEmailText] = useState("");
  const [notes, setNotes] = useState("");

  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [rawFiles, setRawFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    const pdfFilesOnly = newFiles.filter(
      (file) => file.type === "application/pdf" || file.name.endsWith(".pdf"),
    );

    if (pdfFilesOnly.length === 0) {
      alert("Bitte lade eine gültige PDF-Datei hoch.");
      return;
    }

    setRawFiles((prev) => [...prev, ...pdfFilesOnly]);

    const formattedFiles: UploadedFile[] = pdfFilesOnly.map((file) => {
      return {
        id: Math.random().toString(36).substring(7),
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
        type: "pdf",
      };
    });
    setFiles((prev) => [...prev, ...formattedFiles]);
  };

  const removeFile = (id: string, index: number) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setRawFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // 🛡️ PDF direkt im Browser parsen (Umgeht das 4,5MB Vercel-Limit zu 100%)
  async function extractTextFromPDF(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;

    let fullText = "";
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += `[DOKUMENT: ${file.name} | SEITE ${i}]\n${pageText}\n\n`;
    }
    return fullText;
  }

  // API-Call & Analyse starten (sendet sauberen JSON-Text statt rohem FormData)
  const handleStartAnalysis = async () => {
    if (rawFiles.length === 0) {
      alert("Bitte lade mindestens eine PDF-Datei hoch.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      console.log("Lese PDF lokal im Browser aus...");
      const extractedText = await extractTextFromPDF(rawFiles[0]);

      console.log("Sende Text-Payload an Backend...");
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          clientName,
          clientEmail,
          emailText,
          notes,
          documentText: extractedText,
          fileName: rawFiles[0].name,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const analysisData = result.property?.analysis;
        const dealId = result.property?.id || Date.now().toString();

        const finishedDeal = {
          id: dealId,
          title: title.trim() || "Unbenannter Deal",
          client: clientName.trim() || "Neuer Kunde",
          email: clientEmail || "keine-email@dealpilot.ai",
          price: "€ 1.500.000",
          score: analysisData?.leadScore || 50,
          status: "Reviewing",
          date: "Gerade eben",
          analysis: analysisData,
        };

        sessionStorage.setItem(`deal_${dealId}`, JSON.stringify(finishedDeal));
        sessionStorage.setItem(
          "latest_analyzed_deal",
          JSON.stringify(finishedDeal),
        );

        router.push(`/dashboard/deals/${dealId}`);
      } else {
        throw new Error(result.error || "Fehler bei der Analyse.");
      }
    } catch (err: any) {
      console.error("Fehler im Frontend:", err);
      setAnalysisError(
        err.message || "Verbindungsfehler zur AI-Schnittstelle.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDone = () => {
    router.push("/dashboard");
  };

  return (
    <div className="max-w-[1000px] mx-auto pb-24 p-6 md:p-8 space-y-8 animate-fade-in-up">
      <button
        onClick={() => router.back()}
        className="group flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Back to Dashboard
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200/60 pb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Create New Deal
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Trage die Details ein, lade Dokumente hoch und lass die KI dein
            Profil sofort analysieren.
          </p>
        </div>
      </div>

      {!isSuccess ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-200/60 rounded-2xl shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-gray-900 text-lg">
                General Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Deal Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="z.B. Penthouse Alster Hamburg, Villa München"
                    className="w-full bg-gray-50 hover:bg-gray-100/50 focus:bg-white text-gray-900 text-sm py-2.5 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      Client Name *
                    </label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="z.B. Maximilian Bauer"
                      className="w-full bg-gray-50 hover:bg-gray-100/50 focus:bg-white text-gray-900 text-sm py-2.5 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      Client Email
                    </label>
                    <input
                      type="text"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="z.B. max@bauer.de"
                      className="w-full bg-gray-50 hover:bg-gray-100/50 focus:bg-white text-gray-900 text-sm py-2.5 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:sticky lg:top-24">
            <div className="bg-white border border-gray-200/60 rounded-2xl shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-gray-900 text-lg">
                Dokumente (PDF)
              </h3>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? "border-indigo-500 bg-indigo-50/50"
                    : "border-gray-200 hover:border-indigo-400 hover:bg-slate-50/50"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  multiple
                  accept="application/pdf"
                  className="hidden"
                />
                <UploadCloud className="w-10 h-10 mx-auto text-gray-400" />
                <p className="mt-2 text-sm font-bold text-gray-700">
                  Zieh die PDF-Datei hierhin
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  oder klicke, um deine Dateien zu durchsuchen
                </p>
              </div>

              {files.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <span>Ausgewählte PDF</span>
                    <span>({files.length})</span>
                  </div>
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {files.map((file, index) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-2.5 bg-slate-50 border border-gray-200/60 rounded-xl text-xs"
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <FileText className="w-4 h-4 text-rose-500 flex-shrink-0" />
                          <span className="font-semibold text-gray-700 truncate">
                            {file.name}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(file.id, index);
                          }}
                          className="p-1 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-700 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {analysisError && (
                <p className="text-red-500 text-xs font-semibold bg-red-50 border border-red-100 rounded-xl p-3">
                  {analysisError}
                </p>
              )}

              <button
                onClick={handleStartAnalysis}
                disabled={isAnalyzing || files.length === 0}
                className={`w-full font-bold py-3 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isAnalyzing
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white"
                }`}
              >
                <Sparkles
                  className={`w-5 h-5 text-indigo-200 ${isAnalyzing ? "animate-spin" : ""}`}
                />
                <span>
                  {isAnalyzing
                    ? "Analysiere Dokument..."
                    : "Analyse jetzt starten"}
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200/60 rounded-3xl shadow-lg p-10 max-w-2xl mx-auto text-center space-y-6 py-16">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Deal erstellt & analysiert!
          </h2>
          <button
            onClick={handleDone}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-2xl shadow-md transition-all cursor-pointer"
          >
            Zurück zum Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
