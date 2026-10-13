import { AnalysisData } from "./types/analysis";

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = "gemini-3.8-flash";

async function callGeminiWithRetry(
  prompt: string,
  systemInstruction?: string,
  maxRetries = 3,
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
      // 45s Timeout, damit Vercel (60s) nicht hart abbricht, sondern sauber abgefangen wird
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Wenn Google 503 (Overload) meldet und wir noch Versuche haben -> Warten und retry
      if (response.status === 503 && attempt < maxRetries) {
        console.warn(
          `⚠️ Google Server überlastet (503). Versuch ${attempt}/${maxRetries}. Warte 3s...`,
        );
        await new Promise((res) => setTimeout(res, 3000 * attempt));
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
        `⚠️ Versuch ${attempt} fehlgeschlagen (${error.message}). Starte Retry...`,
      );
      await new Promise((res) => setTimeout(res, 2000 * attempt));
    }
  }
}

export async function analyzeCoreData(context: string): Promise<AnalysisData> {
  console.log("🏢 Starte DealPilot Core-Analyse mit gemini-3.8-flash...");

  // Text auf 20.000 Zeichen begrenzen, um den 60s-Vercel-Timeout bei Google-Lastspitzen auszuschließen
  const safeContext =
    context.length > 20000
      ? context.substring(0, 20000) +
        "\n\n[... Text aus Performancegründen gekürzt ...]"
      : context;

  const systemInstruction = `Du bist ein deutscher Sachverständiger, WEG-Recht-Experte und Senior Real Estate Analyst. Analysiere Immobilienunterlagen präzise und antworte AUSSCHLIESSLICH im validen JSON-Format gemäß Vorgabe.`;

  const prompt = `
    Du bist ein kompromissloser deutscher Sachverständiger, WEG-Recht-Experte und Senior Real Estate Analyst. 
    Analysiere die vorliegenden Dokumente mit absoluter juristischer und kaufmännischer Präzision.

    WICHTIG ZU DEN QUELLEN (EVIDENCE):
    Jedes Risiko und jeder positive Befund MUSS einen echten Beleg aus dem übergebenen Text enthalten. Erfinde NIEMALS Seitenzahlen oder Textsnippets!

    SCORING-LOGIK:
    Ermittle einen Deal-Score von 0 bis 100 Punkten ('leadScore'). 
    - Starte bei einem Basiswert von 100 Punkten.
    - Ziehe Punkte ab für: Fehlende Pflichtdokumente, unklare Instandhaltungsrücklagen, Widersprüche oder finanzielle Auffälligkeiten.

    Du MUSST ein striktes JSON-Objekt zurückgeben, das exakt diesem Schema entspricht:
    {
      "leadScore": 85,
      "executiveSummary": "Kaufmännische Zusammenfassung (2-3 Sätze)",
      "confidence": 0.95,
      "overallRecommendation": "Harte Handlungsempfehlung",
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

  const safeContext =
    context.length > 20000
      ? context.substring(0, 20000) + "\n\n[... Text gekürzt ...]"
      : context;

  const systemInstruction = `Du bist ein Senior Real Estate Analyst. Führe eine vollständige Due Diligence durch und gib AUSSCHLIESSLICH reines JSON zurück.`;
  const prompt = `Schema: ${schemaString}\n\nDokumente:\n${safeContext}`;

  return await callGeminiWithRetry(prompt, systemInstruction);
}
