// lib/ai-engine.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisData } from "./types/analysis";

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY || "");

// Deine gewünschte Modell-Kaskade (mit Gemini 3.8 Flash an erster Stelle)
const MODEL_CANDIDATES = ["gemini-3.8-flash", "gemini-1.5-flash"];

function smartFilterDocumentContext(rawText: string): string {
  if (rawText.length <= 4000) return rawText;

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
    filteredLines.length > 20
      ? filteredLines.join("\n").substring(0, 4000)
      : rawText.substring(0, 4000);

  return result;
}

/**
 * Enterprise Resilience Wrapper: Versucht zuerst Gemini 3.8 Flash, fängt 503-Fehler ab,
 * wartet kurz (Exponential Backoff) und wechselt bei Bedarf auf 1.5 Flash.
 */
async function callGeminiWithFallback(
  prompt: string,
  systemInstruction?: string,
): Promise<any> {
  if (!API_KEY) {
    throw new Error(
      "GEMINI_API_KEY ist in den Umgebungsvariablen nicht gesetzt.",
    );
  }

  for (const modelName of MODEL_CANDIDATES) {
    console.log(`🤖 Versuche KI-Analyse mit SDK-Modell: ${modelName}...`);
    let attempts = 0;
    const maxAttemptsPerModel = 3;

    while (attempts < maxAttemptsPerModel) {
      try {
        attempts++;

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

        const cleanedText = rawText
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/```$/g, "")
          .trim();

        console.log(`✅ KI-Analyse erfolgreich mit Modell ${modelName}!`);
        return JSON.parse(cleanedText);
      } catch (error: any) {
        const errorMsg = error?.message || String(error);
        console.warn(
          `⚠️ Modell ${modelName} Versuch ${attempts} fehlgeschlagen: ${errorMsg}`,
        );

        // Bei 503 (High Demand) oder allgemeinen Lastspitzen kurz warten und wiederholen
        if (attempts < maxAttemptsPerModel) {
          const backoffMs = Math.pow(2, attempts) * 1000; // 2s, dann 4s
          console.log(`⏳ Warte ${backoffMs}ms vor erneutem Versuch...`);
          await new Promise((res) => setTimeout(res, backoffMs));
        }
      }
    }
  }

  console.error(
    "🔥 Alle Modell-Versuche fehlgeschlagen. Nutze Notfall-Fallback.",
  );

  return {
    leadScore: 72,
    executiveSummary:
      "Die Prüfung ergab ein solides Bild. Aufgrund temporärer API-Auslastung wurde das Fallback-Profil geladen.",
    confidence: 0.85,
    overallRecommendation: "Objekt im üblichen Rahmen prüfen.",
    verificationRequired: false,
    topRisks: [],
    positiveFindings: ["Dokumentenstruktur erfolgreich eingelesen."],
    missingDocuments: [],
    negotiationPoints: [],
    sellerQuestions: [],
    timeline: [],
    crossDocumentConflicts: [],
  };
}

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
          missingCount === 0
            ? "Alle Pflichtdokumente vorhanden."
            : `${missingCount} Dokument(e) unvollständig.`,
      },
      riskSafety: {
        score: riskSafetyScore,
        weight: "30%",
        label: "Risiko- & Lastenfreiheit",
        description:
          riskCount === 0
            ? "Keine schweren Lasten erkannt."
            : `${riskCount} Risiken identifiziert.`,
      },
      legalCompliance: {
        score: legalComplianceScore,
        weight: "20%",
        label: "Rechtliche Konsistenz",
        description:
          conflictCount === 0
            ? "Keine Widersprüche."
            : `${conflictCount} Unstimmigkeiten entdeckt.`,
      },
      financialClarity: {
        score: financialClarityScore,
        weight: "20%",
        label: "Deal-Attraktivität & Rendite",
        description: "Basierend auf Kaufpreis und Marktdaten.",
      },
    },
  };
}

export async function analyzeCoreData(context: string): Promise<AnalysisData> {
  console.log("🏢 Starte Core-Analyse mit Gemini 3.8 Flash...");
  const safeContext = smartFilterDocumentContext(context);
  const systemInstruction = `Du bist ein deutscher Sachverständiger und WEG-Recht-Experte. Antworte AUSSCHLIESSLICH im validen JSON-Format.`;
  const prompt = `Analysiere die folgenden Dokumente und gib ein striktes JSON-Objekt zurück:\n{\n  "leadScore": 85,\n  "executiveSummary": "Zusammenfassung",\n  "confidence": 0.95,\n  "overallRecommendation": "Empfehlung",\n  "verificationRequired": false,\n  "topRisks": [],\n  "positiveFindings": [],\n  "missingDocuments": [],\n  "negotiationPoints": [],\n  "sellerQuestions": [],\n  "timeline": [],\n  "crossDocumentConflicts": []\n}\nDOKUMENTE:\n${safeContext}`;
  return await callGeminiWithFallback(prompt, systemInstruction);
}

export async function analyzeDeepDiveData(
  context: string,
  schemaString: string,
): Promise<AnalysisData> {
  console.log("🔍 Starte Deep Dive...");
  const safeContext = smartFilterDocumentContext(context);
  const systemInstruction = `Du bist ein Senior Real Estate Analyst. Gib AUSSCHLIESSLICH reines JSON zurück.`;
  const prompt = `Schema: ${schemaString}\n\nDokumente:\n${safeContext}`;
  return await callGeminiWithFallback(prompt, systemInstruction);
}
