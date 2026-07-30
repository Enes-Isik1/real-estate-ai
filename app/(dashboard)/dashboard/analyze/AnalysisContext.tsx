"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AnalysisResponse, Risk, PropertyAsset } from "@/lib/types/analysis";
import { DocumentChunk } from "@/types/knowledge";
import { FileSearch, Brain, Database, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

interface AnalysisContextType {
  isLoading: boolean;
  error: string | null;
  loadingStep: number;
  loadingSteps: Array<{ text: string; icon: React.ReactNode }>;
  uploadedData: AnalysisResponse | null;
  property: PropertyAsset | null;
  chunks: DocumentChunk[];
  selectedFiles: File[];
  setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
  startAnalysis: () => Promise<void>;
  resetAnalysis: () => void;
  handleScrollToSource: (pageNumber: number) => void;
  analysis: any;
  risks: Risk[];
  missingDocuments: any[];
  sellerQuestions: any[];
  positiveFindingsStrings: string[];
  recommendationStrings: string[];
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(
  undefined,
);

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [uploadedData, setUploadedData] = useState<AnalysisResponse | null>(
    null,
  );
  const [property, setProperty] = useState<PropertyAsset | null>(null);
  const [chunks, setChunks] = useState<DocumentChunk[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const loadingSteps = [
    {
      text: "Parsing uploaded PDF documents...",
      icon: <FileSearch className="w-5 h-5 text-indigo-500" />,
    },
    {
      text: "Extracting financial & legal clauses...",
      icon: <Brain className="w-5 h-5 text-purple-500" />,
    },
    {
      text: "Cross-referencing WEG protocols...",
      icon: <Database className="w-5 h-5 text-amber-500" />,
    },
    {
      text: "Generating DealPilot AI Score...",
      icon: <Sparkles className="w-5 h-5 text-emerald-500" />,
    },
  ];

  const analysis = uploadedData?.analysis;
  const risks: Risk[] = analysis?.topRisks || [];
  const missingDocuments = analysis?.missingDocuments || [];
  const sellerQuestions = analysis?.sellerQuestions || [];

  const positiveFindingsStrings = (analysis?.positiveFindings || []).map(
    (f: any) => (typeof f === "string" ? f : f.text || ""),
  );

  const recommendationStrings = analysis?.overallRecommendation
    ? [analysis.overallRecommendation]
    : [];

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(
      () =>
        setLoadingStep((prev) => Math.min(prev + 1, loadingSteps.length - 1)),
      800,
    );
    return () => clearInterval(interval);
  }, [isLoading, loadingSteps.length]);

  const startAnalysis = async () => {
    if (selectedFiles.length === 0) {
      setError("Bitte wählen Sie mindestens eine PDF-Datei aus.");
      return;
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    for (const file of selectedFiles) {
      if (
        file.type !== "application/pdf" &&
        !file.name.toLowerCase().endsWith(".pdf")
      ) {
        setError(`Die Datei "${file.name}" ist kein gültiges PDF-Format.`);
        return;
      }
      if (file.size > MAX_SIZE) {
        setError(
          `Die Datei "${file.name} " ist zu groß. Das Maximum liegt bei 10 MB.`,
        );
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    setLoadingStep(0);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.error ||
            "Die Analyse konnte nicht abgeschlossen werden. Bitte versuchen Sie es erneut.",
        );
      }

      const data = await response.json();

      setProperty(data.property);
      setChunks(data.chunks || []);
      setUploadedData(data);
      setIsLoading(false);

      // Weiterleitung zur echten Deal-ID aus der Datenbank
      const dealId = data.property?.id || data.id;
      if (dealId) {
        router.push(`/dashboard/deals/${dealId}`);
      }
    } catch (err: any) {
      if (err.message === "Failed to fetch") {
        setError(
          "Netzwerkfehler: Bitte überprüfen Sie Ihre Internetverbindung.",
        );
      } else {
        setError(err.message || "Ein unerwarteter Fehler ist aufgetreten.");
      }
      setIsLoading(false);
    }
  };

  const resetAnalysis = () => {
    setUploadedData(null);
    setSelectedFiles([]);
    setError(null);
    setIsLoading(false);
  };

  const handleScrollToSource = (pageNumber: number) => {
    const targetElement = document.getElementById("evidence-timeline-section");
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    console.log(`Springe zu Seite: ${pageNumber}`);
  };

  return (
    <AnalysisContext.Provider
      value={{
        isLoading,
        error,
        loadingStep,
        loadingSteps,
        uploadedData,
        property,
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
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error(
      "useAnalysis muss innerhalb eines AnalysisProviders verwendet werden.",
    );
  }
  return context;
}
