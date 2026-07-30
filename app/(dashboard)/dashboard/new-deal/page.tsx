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

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: "pdf" | "image";
}

export default function NewDealPage() {
  const router = useRouter();

  // Form States
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [emailText, setEmailText] = useState("");
  const [notes, setNotes] = useState("");

  // Upload States
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [rawFiles, setRawFiles] = useState<File[]>([]); // Speichert die echten File-Objekte für die API
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Analysis & Loading States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Handle drag and drop styling
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
    // Für die Analyse lassen wir primär PDFs zu
    const pdfFilesOnly = newFiles.filter(
      (file) => file.type === "application/pdf" || file.name.endsWith(".pdf"),
    );

    if (pdfFilesOnly.length === 0) {
      alert("Bitte lade eine gültige PDF-Datei hoch.");
      return;
    }

    // Speichere die echten File-Objekte für den späteren API-Upload
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

  // API-Call & Analyse starten
  const handleStartAnalysis = async () => {
    if (rawFiles.length === 0) {
      alert(
        "Bitte lade mindestens eine PDF-Datei hoch, um die Analyse zu starten.",
      );
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const formData = new FormData();
      // Wir senden die erste hochgeladene PDF-Datei an die API
      formData.append("file", rawFiles[0]);
      formData.append("title", title);
      formData.append("clientName", clientName);
      formData.append("clientEmail", clientEmail);

      // Wir geben dem Request einen großzügigen Timeout von 45 Sekunden
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const result = await response.json();

      // Ersetze diesen Block in handleStartAnalysis:
      if (response.ok && result.success) {
        const analysisData = result.property?.analysis || result.analysis;

        if (!analysisData) {
          throw new Error("Die KI-Antwort enthielt keine Analysedaten.");
        }

        console.log("KI-Analyse erfolgreich:", analysisData);

        // HIER LIEGT DIE LÖSUNG: Nimm die echte ID aus der API-Antwort (z.B. result.property.id)
        // Fallback auf Date.now() falls die API keine ID liefert
        const dealId =
          result.property?.id || result.id || Date.now().toString();
        const finalTitle = title.trim() || "Unbenannter Deal";
        const finalClient = clientName.trim() || "Neuer Kunde";

        const finishedDeal = {
          id: dealId,
          title: finalTitle,
          client: finalClient,
          email: clientEmail || "keine-email@dealpilot.ai",
          price: analysisData.estimatedPrice || "€ 1.500.000",
          score: analysisData.leadScore || 50,
          status: "Reviewing",
          date: "Gerade eben",
          analysis: analysisData,
        };

        // Im SessionStorage speichern
        sessionStorage.setItem(`deal_${dealId}`, JSON.stringify(finishedDeal));
        sessionStorage.setItem(
          "latest_analyzed_deal",
          JSON.stringify(finishedDeal),
        );

        // Weiterleitung zur Detailseite mit der echten UUID!
        router.push(`/dashboard/deals/${dealId}`);
      } else {
        throw new Error(
          result.error || "Fehler bei der Analyse der Dokumente.",
        );
      }
    } catch (err: any) {
      console.error("Netzwerkfehler im Frontend:", err);
      if (err.name === "AbortError") {
        setAnalysisError(
          "Die Analyse hat zu lange gedauert (Timeout). Bitte versuche es mit einer etwas kleineren PDF.",
        );
      } else {
        setAnalysisError(
          err.message || "Verbindungsfehler zur AI-Schnittstelle.",
        );
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDone = () => {
    router.push("/dashboard");
  };

  return (
    <div className="max-w-[1000px] mx-auto pb-24 p-6 md:p-8 space-y-8 animate-fade-in-up">
      {/* Back to Dashboard Link */}
      <button
        onClick={() => router.back()}
        className="group flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Back to Dashboard
      </button>

      {/* Header */}
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
          {/* Linke Spalte: Formular-Daten */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sektion 1: Basic Information */}
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

            {/* Sektion 2: Email Copy/Paste */}
            <div className="bg-white border border-gray-200/60 rounded-2xl shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-gray-400" />
                <h3 className="font-bold text-gray-900 text-lg">
                  Inquiry Email einfügen
                </h3>
              </div>
              <p className="text-xs text-gray-400">
                Füge hier die ursprüngliche Anfrage-E-Mail ein. (Optional)
              </p>
              <div>
                <textarea
                  value={emailText}
                  onChange={(e) => setEmailText(e.target.value)}
                  rows={6}
                  placeholder="Inhalt der E-Mail hier einfügen..."
                  className="w-full bg-gray-50 hover:bg-gray-100/50 focus:bg-white text-gray-900 text-sm py-3 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                />
              </div>
            </div>

            {/* Sektion 3: Internal Notes */}
            <div className="bg-white border border-gray-200/60 rounded-2xl shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2">
                <AlignLeft className="w-5 h-5 text-gray-400" />
                <h3 className="font-bold text-gray-900 text-lg">
                  Interne Notizen
                </h3>
              </div>
              <div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Interne Gedanken oder Notizen aus Telefongesprächen..."
                  className="w-full bg-gray-50 hover:bg-gray-100/50 focus:bg-white text-gray-900 text-sm py-3 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Rechte Spalte */}
          <div className="space-y-6 lg:sticky lg:top-24">
            {/* Sektion 4: File Upload Container */}
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
                <UploadCloud
                  className={`w-10 h-10 mx-auto transition-transform duration-200 ${
                    isDragging ? "text-indigo-600 scale-110" : "text-gray-400"
                  }`}
                />
                <p className="mt-2 text-sm font-bold text-gray-700">
                  Zieh die PDF-Datei hierhin
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  oder klicke, um deine Dateien zu durchsuchen
                </p>
              </div>

              {/* Uploaded Files List */}
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
                        className="flex items-center justify-between p-2.5 bg-slate-50 border border-gray-200/60 rounded-xl text-xs hover:border-gray-300 transition-colors"
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

            {/* Sektion 5: Analyse Trigger Button */}
            <div className="space-y-4">
              {analysisError && (
                <p className="text-red-500 text-xs font-semibold bg-red-50 border border-red-100 rounded-xl p-3">
                  {analysisError}
                </p>
              )}

              <button
                onClick={handleStartAnalysis}
                disabled={isAnalyzing || files.length === 0}
                className={`w-full font-bold py-3 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer group ${
                  isAnalyzing
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-indigo-600/10"
                }`}
              >
                <Sparkles
                  className={`w-5 h-5 text-indigo-200 ${isAnalyzing ? "animate-spin" : "group-hover:scale-110 transition-transform"}`}
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
        /* Sektion 6: AI-Success Screen */
        <div className="bg-white border border-gray-200/60 rounded-3xl shadow-lg p-10 max-w-2xl mx-auto text-center space-y-6 py-16">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Deal erstellt & analysiert!
            </h2>
            <p className="text-gray-400 text-sm">
              Die KI hat das PDF-Dokument erfolgreich ausgelesen und
              strukturiert.
            </p>
          </div>
          <div className="pt-4">
            <button
              onClick={handleDone}
              className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold py-3 px-8 rounded-2xl shadow-md transition-all cursor-pointer"
            >
              Zurück zum Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
