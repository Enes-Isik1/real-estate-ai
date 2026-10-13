import { AnalysisData } from "./types/analysis";

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = "gemini-3.8-flash";

/**
 * Ultrakompakter Smart-Filter: Reduziert das Dokument aggressiv auf max. 10.000 Zeichen,
 * damit Vercel (60s Limit) niemals erreicht wird.
 */
function smartFilterDocumentContext(rawText: string): string {
  if (rawText.length <= 10000) return rawText;

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
    "miete",
    "rendite",
  ];

  const filteredLines = lines.filter((line) => {
    const lower = line.toLowerCase();
    return relevantKeywords.some((keyword) => lower.includes(keyword));
  });

  const result =
    filteredLines.length > 50
      ? filteredLines.join("\n").substring(0, 10000)
      : rawText.substring(0, 10000);

  console.log(
    `✂️ Smart-Filter: Dokument von ${rawText.length} auf ${result.length} Zeichen komprimiert.`,
  );
  return result;
}

async function callGeminiWithRetry(
  prompt: string,
  systemInstruction?: string,
  maxRetries = 2, // Auf 2 Versuche reduziert, um Vercel-Limits einzuhalten
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

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Strenger 25s Timeout pro Versuch, damit Vercel (60s) niemals voll läuft
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 503 && attempt < maxRetries) {
        console.warn(
          `⚠️ Google Server überlastet (503). Versuch ${attempt}/${maxRetries}. Kurzer Retry...`,
        );
        await new Promise((res) => setTimeout(res, 1000));
        continue;
      }

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorBody}`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new Error("Die KI hat eine leere Antwort zurückgegeben.");
      }

      return JSON.parse(rawText);
    } catch (error: any) {
      if (attempt === maxRetries) {
        throw error;
      }
      console.warn(
        `⚠️ Versuch ${attempt} fehlgeschlagen (${error.message}). Starte sofortigen Retry...`,
      );
      await new Promise((res) => setTimeout(res, 1000));
    }
  }
}

export async function analyzeCoreData(context: string): Promise<AnalysisData> {
  console.log("🏢 Starte DealPilot Core-Analyse...");

  const safeContext = smartFilterDocumentContext(context);

  const systemInstruction = `Du bist ein deutscher Sachverständiger und WEG-Recht-Experte. Analysiere präzise und antworte AUSSCHLIESSLICH im validen JSON-Format.`;

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

  return await callGeminiWithRetry(prompt, systemInstruction);
}

export async function analyzeDeepDiveData(
  context: string,
  schemaString: string,
): Promise<AnalysisData> {
  console.log("🔍 Starte Deep Dive Analyse...");

  const safeContext = smartFilterDocumentContext(context);

  const systemInstruction = `Du bist ein Senior Real Estate Analyst. Führe eine vollständige Due Diligence durch und gib AUSSCHLIESSLICH reines JSON zurück.`;
  const prompt = `Schema: ${schemaString}\n\nDokumente:\n${safeContext}`;

  return await callGeminiWithRetry(prompt, systemInstruction);
}
