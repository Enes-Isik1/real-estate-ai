// lib/types/analysis.ts

/**
 * Enterprise-Level Type Definitions für DealPilot / Real Estate AI Engine.
 * Strikte Absicherung aller KI-Ergebnisse, Quellenbelege und Dashboard-Datenstrukturen.
 */

export type RecommendationType =
  | "Proceed"
  | "Proceed with Conditions"
  | "Delay Closing"
  | "High Risk"
  | "Reject";

export type RiskSeverity = "High" | "Medium" | "Low";
export type ExposureLevel = "Low" | "Medium" | "High";
export type DealStatus =
  | "Draft"
  | "Analyzing"
  | "Ready"
  | "Needs Review"
  | "Archived";

// --- Multi-Faktor Score ---
export interface MultiFactorScoreBreakdownItem {
  score: number;
  weight: string;
  label: string;
  description: string;
}

export interface MultiFactorScore {
  overallScore: number;
  breakdown: {
    documentCompleteness: MultiFactorScoreBreakdownItem;
    riskSafety: MultiFactorScoreBreakdownItem;
    legalCompliance: MultiFactorScoreBreakdownItem;
    financialClarity: MultiFactorScoreBreakdownItem;
  };
}

// --- Quellen & Beweiskette (Evidence) ---
export interface Source {
  documentType?: string;
  pageNumber?: number;
  snippet?: string;
}

// --- Risiken & positive Erkenntnisse ---
export interface Risk {
  id?: string;
  severity: RiskSeverity;
  title: string;
  whyItMatters: string;
  source?: Source;
  confidence?: number;
  pageNumber?: number; // Fallback für flache Strukturen
  originalQuote?: string;
  aiInterpretation?: string;
}

export interface PositiveFinding {
  title: string;
  description: string;
  source?: Source;
}

export interface MissingDocument {
  name: string;
  required: boolean;
  status?: "Missing" | "Available" | "Pending";
  category?: string;
}

export interface NegotiationPoint {
  title: string;
  argument: string;
  leverageScore?: number; // 1-10 Skala
}

export interface SellerQuestion {
  question: string;
  context?: string;
  priority?: "High" | "Medium" | "Low";
}

export interface TimelineEvent {
  event: string;
  date: string;
  importance?: "High" | "Normal";
}

export interface Conflict {
  title: string;
  description: string;
  severity: RiskSeverity;
  sourceA?: Source;
  sourceB?: Source;
}

// --- Neu ergänzte Enterprise-Klassen für UI/Dashboard ---
export interface NextAction {
  id?: string;
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  targetRole?: "Notar" | "Verkäufer" | "Hausverwaltung" | "Käufer";
  completed?: boolean;
}

export interface ClassifiedDocument {
  id?: string;
  filename: string;
  detectedType: string; // z.B. "Teilungserklärung", "WEG-Protokoll", "Wirtschaftsplan"
  confidence: number;
  pageCount?: number;
  relevantParagraphsCount?: number;
}

// --- Haupt-Analyseobjekt ---
export interface AnalysisData {
  leadScore: number;
  multiFactorScore?: MultiFactorScore;
  executiveSummary: string;
  confidence: number;
  overallRecommendation: string;
  aiRecommendation?: RecommendationType;
  verificationRequired: boolean;
  topRisks: Risk[];
  positiveFindings: PositiveFinding[];
  missingDocuments: MissingDocument[];
  negotiationPoints: NegotiationPoint[];
  sellerQuestions: SellerQuestion[];
  timeline: TimelineEvent[];
  crossDocumentConflicts: Conflict[];
  nextActions?: NextAction[];
  classifiedDocuments?: ClassifiedDocument[];
}

// --- Dokumenten- & Chunks-Typen ---
export interface DocumentChunk {
  id?: string;
  page: number;
  text: string;
  documentName?: string;
}

export interface DocumentItem {
  id: string;
  deal_id: string;
  filename: string;
  document_type: string;
  storage_path?: string;
  public_url?: string;
  upload_date: string;
}

// --- API & Property Assets ---
export interface AnalysisResponse {
  success: boolean;
  filesProcessed?: string[];
  pageCount?: number;
  analysis: AnalysisData;
  chunks?: DocumentChunk[];
  property?: PropertyAsset;
  error?: string;
}

export interface PropertyAsset {
  id: string;
  name: string;
  createdAt: string;
  files: string[];
  analysis: AnalysisData;
  timeline: TimelineEvent[];
  decisionCenter: {
    score: number;
    status: DealStatus | "Green" | "Yellow" | "Red";
    summary: string;
  };
}

export interface DealAnalysis {
  propertyName: string;
  leadName: string;
  leadEmail: string;
  executiveSummary: string;
  overallDealScore: number;
  buyerReliability: number;
  legalExposure: string;
  financialExposure: string;
  aiRecommendation: RecommendationType;
  recommendationReason: string;
  risks: Array<{
    id: string;
    level: string;
    title: string;
    page: number;
    confidence: number;
    whyItMatters: string;
    originalQuote: string;
    aiInterpretation: string;
  }>;
  missingDocuments: Array<{
    name: string;
    required: boolean;
    status: string;
  }>;
  suggestedReply: string;
}
