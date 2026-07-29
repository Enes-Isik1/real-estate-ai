// types/analysis.ts

export type RecommendationType = "Proceed" | "Proceed with Conditions" | "Delay Closing" | "High Risk" | "Reject";
export type ExposureLevel = "Low" | "Medium" | "High";

export interface DealRisk {
  id: string;
  level: "High" | "Medium" | "Low";
  title: string;
  page: number;
  confidence: number;           // in % (z.B. 95)
  whyItMatters: string;         // Erklärung für den Makler
  originalQuote: string;        // Textstelle aus der PDF
  aiInterpretation: string;     // Erklärung der KI
}

export interface MissingDocument {
  name: string;
  required: boolean;
  status: "Missing" | "Available" | "Pending";
}

export interface DealAnalysis {
  propertyName: string;
  leadName: string;
  leadEmail: string;
  executiveSummary: string;
  
  // Enterprise Metrics
  overallDealScore: number;       // 0 - 100
  buyerReliability: number;       // 0 - 100
  legalExposure: ExposureLevel;
  financialExposure: ExposureLevel;
  
  // AI Recommendation
  aiRecommendation: RecommendationType;
  recommendationReason: string;

  // Risiken & Beweiskette (Evidence)
  risks: DealRisk[];

  // Fehlende Unterlagen
  missingDocuments: MissingDocument[];

  // Generierter Antwortentwurf
  suggestedReply: string;
}
// lib/types/analysis.ts

export interface DocumentChunk {
  id: string;      // Neu: falls du die UUID-Variante nutzt
  page: number;
  text: string;
}

export interface AnalysisResponse {
  // ... deine bestehenden Felder
  analysis: any; // oder dein spezifisches Analysis-Interface
  fileName: string;
  pageCount: number;
  chunks: DocumentChunk[]; // Hier fügen wir die Chunks explizit zum Response-Typ hinzu
}