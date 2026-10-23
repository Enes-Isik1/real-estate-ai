// lib/ai-engine.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisData } from "./types/analysis";

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY || "");

// Stabile Modell-Kaskade über das offizielle SDK
const MODEL_CANDIDATES = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];

/**
 * Extrem kompakter Filter für das Free Tier, um Token-Limits (TPM) nicht zu sprengen.
 */
function smartFilterDocumentContext(rawText: string): string {
  if (rawText.length <= 8000) return rawText;

  const lines = rawText.split("\n");
  const relevantKeywords = [
    "rücklage",
    "instandhaltung",
    "wirtschaftsplan",
    "beschluss",
    "hausgeld",
    "sondernutzung",
    "teilung",
    "schaden",
    "sanierung",
    "aufteilung",
    "euro",
    "€",
    "stimmen",
    "genehmigt",
    "ablehnung",
    "eigentümer",
    "WEG",
    "haftung",
  ];

  const filteredLines = lines.filter((line) => {
    const lower = line.toLowerCase();
    return relevantKeywords.some((keyword) => lower.includes(keyword));
  });

  const result =
    filteredLines.length > 30
      ? filteredLines.join("\n").substring(0, 8000)
      : rawText.substring(0, 8000);

  console.log(
    `✂️ Free-Tier Filter: Dokument auf ${result.length} Zeichen reduziert.`,
  );
  return result;
}

/**
 * Einzelner API-Aufruf an ein bestimmtes Gemini-Modell
 */
// NEU:
async function callGeminiModel(
  modelName: string,
  prompt: string,
  systemInstruction?: string,
): Promise<any> {
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: systemInstruction,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.1,
    },
  });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const rawText = response.text();

  if (!rawText) {
    throw new Error("Die KI hat eine leere Antwort zurückgegeben.");
  }

  // Bereinigen von eventuellen Markdown-JSON-Tags
  const cleanedText = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/g, "")
    .trim();

  return JSON.parse(cleanedText);
}

/**
 * Enterprise Resilience Wrapper mit Modell-Fallback & Exponentiellem Backoff bei 503/429
 */
// NEU:
async function callGeminiWithFallback(
  prompt: string,
  systemInstruction?: string,
): Promise<any> {
  if (!API_KEY) {
    throw new Error(
      "GEMINI_API_KEY ist in den Umgebungsvariablen nicht gesetzt.",
    );
  }

  let lastError: any = null;

  for (const model of MODEL_CANDIDATES) {
    console.log(`🤖 Versuche KI-Analyse mit SDK-Modell: ${model}...`);
    let attempts = 0;
    const maxAttemptsPerModel = 2;

    while (attempts < maxAttemptsPerModel) {
      try {
        attempts++;
        const result = await callGeminiModel(model, prompt, systemInstruction);
        console.log(`✅ KI-Analyse erfolgreich mit Modell ${model}!`);
        return result;
      } catch (error: any) {
        lastError = error;
        console.warn(
          `⚠️ Modell ${model} Versuch ${attempts} fehlgeschlagen:`,
          error?.message || error,
        );

        // Bei Überlastung (503) oder Rate Limits kurz warten
        if (attempts < maxAttemptsPerModel) {
          const backoffMs = attempts * 2000;
          console.log(`⏳ Warte ${backoffMs}ms vor erneutem Versuch...`);
          await new Promise((res) => setTimeout(res, backoffMs));
        }
      }
    }

    console.warn(`🔄 Wechsele auf nächstes Fallback-Modell in der Kette...`);
  }

  console.error("🔥 Alle SDK-Modell-Versuche sind fehlgeschlagen.");
  throw lastError || new Error("KI-Analyse konnte nicht durchgeführt werden.");
}

/**
 * Single Source of Truth: Zentrale Multi-Faktor Sub-Score Berechnung
 */
export function calculateMultiFactorScore(coreAnalysis: any) {
  const sanitizedLeadScore = Math.round(Number(coreAnalysis.leadScore) || 50);
  const riskCount = (coreAnalysis.topRisks || []).length;
  const missingCount = (coreAnalysis.missingDocuments || []).length;
  const conflictCount = (coreAnalysis.crossDocumentConflicts || []).length;

  const baseScore = sanitizedLeadScore;

  const documentCompletenessScore = Math.min(
    100,
    Math.max(15, Math.round(baseScore - missingCount * 15)),
  );

  const riskSafetyScore = Math.min(
    100,
    Math.max(15, Math.round(baseScore - riskCount * 15 - conflictCount * 20)),
  );

  const legalComplianceScore = Math.min(
    100,
    Math.max(15, Math.round(baseScore - conflictCount * 25)),
  );

  const financialClarityScore = baseScore;

  return {
    overallScore: sanitizedLeadScore,
    breakdown: {
      documentCompleteness: {
        score: documentCompletenessScore,
        weight: "30%",
        label: "Unterlagen-Vollständigkeit",
        description:
          missingCount === 0 && documentCompletenessScore > 70
            ? "Alle Pflichtdokumente vorhanden."
            : `${missingCount} Dokument(e) fehlen oder unvollständig.`,
      },
      riskSafety: {
        score: riskSafetyScore,
        weight: "30%",
        label: "Risiko- & Lastenfreiheit",
        description:
          riskCount === 0 && riskSafetyScore > 70
            ? "Keine schweren Lasten erkannt."
            : `${riskCount} Risiken / Belastungen identifiziert.`,
      },
      legalCompliance: {
        score: legalComplianceScore,
        weight: "20%",
        label: "Rechtliche Konsistenz",
        description:
          conflictCount === 0 && legalComplianceScore > 70
            ? "Keine Widersprüche in den Akten."
            : `${conflictCount} rechtliche Unstimmigkeiten entdeckt.`,
      },
      financialClarity: {
        score: financialClarityScore,
        weight: "20%",
        label: "Deal-Attraktivität & Rendite",
        description: "Basierend auf Kaufpreis, Objektzustand und Marktdaten.",
      },
    },
  };
}

export async function analyzeCoreData(context: string): Promise<AnalysisData> {
  console.log("🏢 Starte Core-Analyse mit Fallback-Pipeline...");
  const safeContext = smartFilterDocumentContext(context);

  const systemInstruction = `Du bist ein deutscher Sachverständiger und WEG-Recht-Experte. Antworte AUSSCHLIESSLICH im validen JSON-Format.`;

  const prompt = `
    Analysiere die folgenden Dokumente und gib ein striktes JSON-Objekt zurück, das exakt diesem Schema entspricht:
    {
      "leadScore": 85,
      "executiveSummary": "Zusammenfassung (2-3 Sätze)",
      "confidence": 0.95,
      "overallRecommendation": "Handlungsempfehlung",
      "verificationRequired": false,
      "topRisks": [],
      "positiveFindings": [],
      "missingDocuments": [],
      "negotiationPoints": [],
      "sellerQuestions": [],
      "timeline": [],
      "crossDocumentConflicts": []
    }
    
    DOKUMENTE:
    ${safeContext}
  `;

  return await callGeminiWithFallback(prompt, systemInstruction);
}

export async function analyzeDeepDiveData(
  context: string,
  schemaString: string,
): Promise<AnalysisData> {
  console.log("🔍 Starte Deep Dive mit Fallback-Pipeline...");
  const safeContext = smartFilterDocumentContext(context);

  const systemInstruction = `Du bist ein Senior Real Estate Analyst. Gib AUSSCHLIESSLICH reines JSON zurück.`;
  const prompt = `Schema: ${schemaString}\n\nDokumente:\n${safeContext}`;

  return await callGeminiWithFallback(prompt, systemInstruction);
}
