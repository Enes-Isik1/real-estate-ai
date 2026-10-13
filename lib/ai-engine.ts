import { AnalysisData } from "./types/analysis";

const API_KEY = process.env.GEMINI_API_KEY;
// Das einzige verbindliche, stabile Produktionsmodell
const MODEL_NAME = "gemini-2.5-flash";

async function callGemini(
  prompt: string,
  systemInstruction?: string,
): Promise<any> {
  if (!API_KEY) {
    throw new Error(
      "GEMINI_API_KEY ist in den Umgebungsvariablen nicht gesetzt.",
    );
  }

  const url = `https://generativelanguage.googleapis.com/v1/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

  const payload: Record<string, any> = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.1,
    },
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`🔥 Gemini API Fehler (HTTP ${response.status}):`, errorBody);
    throw new Error(
      `Die KI-Schnittstelle hat mit Status ${response.status} geantwortet: ${errorBody}`,
    );
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error("Die KI hat eine leere Antwort zurückgegeben.");
  }

  return JSON.parse(rawText);
}

export async function analyzeCoreData(context: string): Promise<AnalysisData> {
  console.log("🏢 Starte DealPilot Core-Analyse mit gemini-2.5-flash...");

  const systemInstruction = `Du bist ein deutscher Sachverständiger, WEG-Recht-Experte und Senior Real Estate Analyst. Analysiere Immobilienunterlagen präzise und antworte AUSSCHLIESSLICH im validen JSON-Format gemäß Vorgabe.`;

  const prompt = `
Analysiere die folgenden Dokumente und gib ein striktes JSON-Objekt zurück, das exakt diesem Schema entspricht:

{
  "leadScore": 85,
  "executiveSummary": "Kaufmännische Zusammenfassung auf den Punkt gebracht (2-3 Sätze)",
  "confidence": 0.95,
  "overallRecommendation": "Harte, glasklare Handlungsempfehlung für den Makler auf Deutsch",
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
${context}
`;

  return await callGemini(prompt, systemInstruction);
}

export async function analyzeDeepDiveData(
  context: string,
  schemaString: string,
): Promise<AnalysisData> {
  console.log("🔍 Starte Deep Dive Analyse...");

  const systemInstruction = `Du bist ein Senior Real Estate Analyst. Führe eine vollständige Due Diligence durch und gib AUSSCHLIESSLICH reines JSON zurück.`;
  const prompt = `Schema: ${schemaString}\n\nDokumente:\n${context}`;

  return await callGemini(prompt, systemInstruction);
}
