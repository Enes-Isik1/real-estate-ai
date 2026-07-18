"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, FileWarning, FileText, CheckCircle2, ArrowRight, 
  Send, Loader2, Copy, Check, ArrowLeft, FileSearch, 
  Brain, Database, BookOpen, 
} from "lucide-react";

import AuditCard from "./AuditCard";
import EvidenceTimeline from "./EvidenceTimeline";
import PDFUploader from "../../../components/ui/PDFUploader";
import DecisionCenter from "./DecisionCenter";
import { ExecutiveSummary } from "@/components/analysis/ExecutiveSummary"
import { RiskAssessment } from "@/components/analysis/RiskAssessment"
import { PositiveAspects } from "@/components/analysis/PositiveAspects"
import { Recommendations } from "@/components/analysis/Recommendations"
import { SellerQuestions } from "@/components/analysis/SellerQuestions"

import { AnalysisResponse, Risk } from "@/lib/types/analysis";

export default function AnalyzePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [uploadedData, setUploadedData] = useState<AnalysisResponse | null>(null);

  const loadingSteps = [
    { text: "Parsing uploaded PDF documents...", icon: <FileSearch className="w-5 h-5 text-indigo-500" /> },
    { text: "Extracting financial & legal clauses...", icon: <Brain className="w-5 h-5 text-purple-500" /> },
    { text: "Cross-referencing WEG protocols...", icon: <Database className="w-5 h-5 text-amber-500" /> },
    { text: "Generating DealPilot AI Score...", icon: <Sparkles className="w-5 h-5 text-emerald-500" /> }
  ];

  // Daten-Selektoren
  const documents = uploadedData?.documents || [{ name: uploadedData?.fileName || "Document", pages: uploadedData?.pageCount || 1 }];
  const leadScore = uploadedData?.analysis?.leadScore ?? 92;
  const risks: Risk[] = uploadedData?.analysis?.Risks || [];
  const missingDocuments = uploadedData?.analysis?.missingDocuments || [];
  const sellerQuestions = uploadedData?.analysis?.sellerQuestions || [];

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => setLoadingStep((prev) => Math.min(prev + 1, loadingSteps.length - 1)), 800);
    const timeout = setTimeout(() => setIsLoading(false), 3500);
    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [isLoading, loadingSteps.length]);

  const handleCopyText = () => {
    const text = `Sehr geehrte(r) ${uploadedData?.clientName || "Kunde"},\n\nvielen Dank für Ihre Anfrage zu ${uploadedData?.propertyName || "der Immobilie"}.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToTimeline = () => document.getElementById("evidence-timeline-section")?.scrollIntoView({ behavior: "smooth" });

  // 1. Initialer Upload State
  if (!uploadedData && !isLoading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-black text-gray-900">Analyze Your Deal</h1>
          <p className="text-gray-400 mt-2">Upload Real Estate PDFs to start the analysis.</p>
        </div>
        <div className="w-full bg-white p-6 border border-gray-200/60 rounded-3xl shadow-sm">
          <PDFUploader onSuccess={(data) => { setUploadedData(data); setIsLoading(true); }} />
        </div>
      </div>
    );
  }

  // 2. Loading State
  if (isLoading) { /* ... (Dein existierender Loading-Code bleibt hier unverändert) ... */ }

  // 3. Haupt-Analyse Dashboard
  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-24 animate-fade-in-up">
      <button onClick={() => setUploadedData(null)} className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="w-4 h-4" /> Upload another document
      </button>

      <DecisionCenter risks={risks} />

      {/* Die modularen Komponenten */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          
<ExecutiveSummary 
  summary={{ 
    title: "Executive Summary", 
    content: uploadedData?.analysis?.executiveSummary || "" 
  }} 
/>
          <RiskAssessment risks={risks} onScrollToSource={scrollToTimeline} />
          <PositiveAspects aspects={uploadedData?.analysis?.positiveAspects || []} />
          <Recommendations recs={uploadedData?.analysis?.recommendations || []} />
          <SellerQuestions questions={sellerQuestions} />
          
          <div id="evidence-timeline-section">
            <EvidenceTimeline data={uploadedData?.analysis?.timeline} />
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <AuditCard />
          {/* Missing Documents Box */}
          <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold flex items-center gap-2"><FileWarning className="w-5 h-5 text-rose-500" /> Missing Docs</h3>
            <div className="grid grid-cols-2 gap-2">
              {missingDocuments.map((d, i) => <div key={i} className="p-2 bg-rose-50 rounded-xl text-xs font-bold">{d.name}</div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}