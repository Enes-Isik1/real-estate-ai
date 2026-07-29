export type RiskSeverity = 'High' | 'Medium' | 'Low';
// Ganz oben in lib/types/analysis.ts einfügen:
export type DealStatus = 'Draft' | 'Analyzing' | 'Ready' | 'Needs Review' | 'Archived';

export interface Source {
  documentType: string;
  pageNumber: number;
  snippet: string;
}

export interface Risk {
  id: string;
  severity: 'High' | 'Medium' | 'Low';
  title: string;
  whyItMatters: string;
  source: Source;
  confidence: number;
}

export interface PositiveFinding {
  title: string;
  description: string;
  source: Source;
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

export interface Conflict {
  title: string;
  description: string;
  severity: RiskSeverity;
  sourceA: Source;
  sourceB: Source;
}

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
  // Hier gehört es rein:
  crossDocumentConflicts: Conflict[];
}

export interface AnalysisResponse {
  success: boolean;
  filesProcessed: string[]; // Geändert von fileName zu Array für Multi-Doc
  pageCount: number;
  analysis: AnalysisData;
  chunks?: { page: number; text: string }[];
}
export interface PropertyAsset {
  id: string; // Eindeutige ID für die Immobilie
  name: string; // z.B. Adresse
  createdAt: string;
  files: string[]; // Liste der verarbeiteten Dokumente
  analysis: AnalysisData; // Das, was wir bisher hatten
  timeline: TimelineEvent[]; // Aus der Analyse extrahiert
  decisionCenter: {
    score: number;
    status: DealStatus | "Green" | "Yellow" | "Red"; // Hier DealStatus ergänzt (optional kannst du Green/Yellow/Red für Rückwärtskompatibilität drin lassen)
    summary: string;
  };
}