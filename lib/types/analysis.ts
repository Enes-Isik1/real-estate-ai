// lib/types/analysis.ts

export type RiskSeverity = 'High' | 'Medium' | 'Low';

export interface Risk {
  id: string;
  severity: RiskSeverity;
  title: string;
  whyItMatters: string;
  sourcePages: number[];
  sourceDocument: string;
  confidence: number;
}

export interface PositiveFinding {
  title: string;
  description: string;
  sourcePages: number[];
}

export interface MissingDocument {
  name: string;
  required: boolean;
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

// Der Container, der von der Logik und page.tsx erwartet wird
export interface AnalysisData {
  leadScore: number;
  executiveSummary: string;
  confidence: number;
  overallRecommendation: string;
  verificationRequired: boolean;
  topRisks: Risk[];
  positiveFindings: PositiveFinding[];
  missingDocuments: MissingDocument[];
  negotiationPoints: NegotiationPoint[];
  sellerQuestions: SellerQuestion[];
  timeline: TimelineEvent[];
}

export interface AnalysisResponse {
  success: boolean;
  fileName: string;
  fileSize: string;
  pageCount: number;
  propertyName?: string;
  clientName?: string;
  analysis: AnalysisData;
  chunks?: { page: number; text: string }[];
}