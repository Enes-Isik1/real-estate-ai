// lib/types/analysis.ts

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

// --- Multi-Faktor Score (Punkt 15) ---
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
  documentType: string;
  pageNumber: number;
  snippet: string;
}

// --- Risiken ---
export interface Risk {
  id?: string;
  severity: RiskSeverity;
  title: string;
  whyItMatters: string;
  source?: Source;
  confidence: number;
  pageNumber?: number; // Fallback für flache Strukturen
  originalQuote?: string;
  aiInterpretation?: string;
}

export interface PositiveFinding {
  title: string;
  description: string;
  source: Source;
}

export interface MissingDocument {
  name: string;
  required: boolean;
  status?: "Missing" | "Available" | "Pending";
}

export interface NegotiationPoint {
  title: string;
  argument: string;
  leverageScore: number;
}

export interface SellerQuestion {
  question: string;
  context: string;
}

export interface TimelineEvent {
  event: string;
  date: string;
}

export interface Conflict {
  title: string;
  description: string;
  severity: RiskSeverity;
  sourceA: Source;
  sourceB: Source;
}

// --- Haupt-Analyseobjekt ---
export interface AnalysisData {
  leadScore: number;
  multiFactorScore?: MultiFactorScore; // NEU: Multi-Faktor Aufschlüsselung
  executiveSummary: string;
  confidence: number;
  overallRecommendation: string;
  aiRecommendation?: RecommendationType; // Optional für Kompatibilität
  verificationRequired: boolean;
  topRisks: Risk[];
  positiveFindings: PositiveFinding[];
  missingDocuments: MissingDocument[];
  negotiationPoints: NegotiationPoint[];
  sellerQuestions: SellerQuestion[];
  timeline: TimelineEvent[];
  crossDocumentConflicts: Conflict[];
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
