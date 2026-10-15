import { AnalysisData } from "./types/analysis";

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = "gemini-3.8-flash";

/**
 * Extrem kompakter Filter für das Free Tier, um Token-Limits (TPM) nicht zu sprengen.
 */
function smartFilterDocumentContext(rawText: string): string {
  // Free Tier Token-Schutz: Maximal 8.000 Zeichen, um Rate-Limits zu umgehen
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

async function callGeminiFreeTier(
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

  // Sicherheits-Pause vor jedem Request, um RPM-Limits des Free Tiers zu respektieren
  await new Promise((res) => setTimeout(res, 2000));

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error(`❌ GOOGLE API FEHLER (${response.status}):`, responseText);
      throw new Error(`Google API Error ${response.status}: ${responseText}`);
    }

    const data = JSON.parse(responseText);
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error("Die KI hat eine leere Antwort zurückgegeben.");
    }

    return JSON.parse(rawText);
  } catch (error: any) {
    console.error("🔥 KRITISCHER FEHLER IN AI ENGINE:", error.message);
    throw error;
  }
} // <--- Diese schließende Klammer hat gefehlt!

export async function analyzeCoreData(context: string): Promise<AnalysisData> {
  console.log("🏢 Starte Core-Analyse (Free Tier Modus)...");
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

  return await callGeminiFreeTier(prompt, systemInstruction);
}

export async function analyzeDeepDiveData(
  context: string,
  schemaString: string,
): Promise<AnalysisData> {
  console.log("🔍 Starte Deep Dive (Free Tier Modus)...");
  const safeContext = smartFilterDocumentContext(context);

  const systemInstruction = `Du bist ein Senior Real Estate Analyst. Gib AUSSCHLIESSLICH reines JSON zurück.`;
  const prompt = `Schema: ${schemaString}\n\nDokumente:\n${safeContext}`;

  return await callGeminiFreeTier(prompt, systemInstruction);
}
