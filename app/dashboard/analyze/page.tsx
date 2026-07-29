"use client";

import React from "react";
import {
  Sparkles, FileWarning, ArrowLeft, Loader2, UploadCloud
} from "lucide-react";

import AuditCard from "./AuditCard";
import EvidenceTimeline from "./EvidenceTimeline";
import PDFUploader from "../../../components/ui/PDFUploader";
import DecisionCenter from "./DecisionCenter";
import { ExecutiveSummary } from "@/components/analysis/ExecutiveSummary";
import { RiskAssessment } from "@/components/analysis/RiskAssessment";
import { PositiveAspects } from "@/components/analysis/PositiveAspects";
import { Recommendations } from "@/components/analysis/Recommendations";
import { SellerQuestions } from "@/components/analysis/SellerQuestions";
import { NegotiationPoints } from "@/components/analysis/NegotiationPoints";
import ChatInterface from "@/app/api/analyze/chat/ChatInterface";
import { ConflictAlert } from "@/components/analysis/ConflictAlert";
import { AnalysisProvider, useAnalysis } from "./AnalysisContext";

function AnalyzeContent() {
  const {
    isLoading,
    error,
    loadingStep,
    loadingSteps,
    uploadedData,
    chunks,
    selectedFiles,
    setSelectedFiles,
    startAnalysis,
    resetAnalysis,
    handleScrollToSource,
    analysis,
    risks,
    missingDocuments,
    sellerQuestions,
    positiveFindingsStrings,
    recommendationStrings,
  } = useAnalysis();

  // 1. Initialer Upload State
  if (!uploadedData && !isLoading && !error) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 max-w-2xl mx-auto space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-600 mb-2 shadow-sm">
            <UploadCloud className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Analyze Your Deal</h1>
          <p className="text-gray-500 text-sm font-medium">Upload Real Estate PDFs to start the deep AI analysis.</p>
        </div>
        
        <div className="w-full bg-white p-6 md:p-8 border border-gray-200/80 rounded-3xl shadow-enterprise space-y-6">
          <PDFUploader 
            selectedFiles={selectedFiles}
            onFilesSelected={setSelectedFiles}
          />

          {selectedFiles.length > 0 && (
            <button
              onClick={startAnalysis}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-sm rounded-2xl transition-all shadow-[0_10px_25px_-5px_rgba(79,70,229,0.4)] flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              Analyse starten ({selectedFiles.length} {selectedFiles.length === 1 ? 'Datei' : 'Dateien'})
            </button>
          )}
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center space-y-4 max-w-md mx-auto p-6 text-center animate-fade-in">
        <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-3xl flex items-center justify-center text-rose-500 shadow-sm">
          <FileWarning className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-gray-900">Analyse fehlgeschlagen</h2>
        <p className="text-gray-500 text-sm font-medium">{error}</p>
        <button 
          onClick={resetAnalysis} 
          className="mt-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-2xl shadow-sm transition-all cursor-pointer"
        >
          Zurück zum Upload
        </button>
      </div>
    );
  }

  // 3. Loading State
  if (isLoading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center gap-6 animate-fade-in">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100 animate-pulse" />
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
        <div className="text-center space-y-1">
          <p className="font-bold text-lg text-gray-900">{loadingSteps[loadingStep].text}</p>
          <p className="text-xs text-gray-400 font-medium">Please wait while DealPilot processes your documents.</p>
        </div>
      </div>
    );
  }

  // 4. Haupt-Analyse Dashboard (Vollständig mit allen Komponenten!)
  return (
    <div className="space-y-8 max-w-[1500px] mx-auto pb-24 animate-fade-in">
      <button 
        onClick={resetAnalysis} 
        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-indigo-600 transition-colors cursor-pointer bg-white border border-gray-200/80 px-4 py-2 rounded-xl shadow-sm"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Upload another document
      </button>

      <DecisionCenter risks={risks} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <ExecutiveSummary
            summary={{
              title: "Executive Summary",
              content: analysis?.executiveSummary || ""
            }}
          />
          <ConflictAlert conflicts={analysis?.crossDocumentConflicts || []} />
          
          <RiskAssessment risks={risks} onScrollToSource={handleScrollToSource} />
          <PositiveAspects aspects={positiveFindingsStrings} />
          <Recommendations recs={recommendationStrings} />
          <SellerQuestions questions={sellerQuestions} />
          <NegotiationPoints points={analysis?.negotiationPoints || []} />
          
          <div id="evidence-timeline-section">
            <EvidenceTimeline data={analysis?.timeline} />
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <AuditCard />
          <ChatInterface relevantChunks={chunks} />
          <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-enterprise space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
              <FileWarning className="w-4 h-4 text-rose-500" /> Missing Docs
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {missingDocuments.map((d: any, i: number) => (
                <div key={i} className="p-2.5 bg-rose-50/80 border border-rose-100 rounded-2xl text-xs font-bold text-rose-700">
                  {d.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <AnalysisProvider>
      <AnalyzeContent />
    </AnalysisProvider>
  );
}