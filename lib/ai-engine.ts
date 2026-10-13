import { AnalysisData } from "./types/analysis";

const API_KEY = process.env.GEMINI_API_KEY;
const API_BASE_URL = "https://generativelanguage.googleapis.com/v1/models";

// Einziges stabiles Production-Modell + Ausweichmodell auf v1 API
const PRIMARY_MODEL = "gemini-1.5-flash";
const FALLBACK_MODEL = "gemini-1.5-pro";

interface CallApiOptions {
  model: string;
  prompt: string;
  systemInstruction?: string;
  timeoutMs?: number;
}

/**
 * Reiner Native Fetch direkt gegen die stabile Google GenAI v1 API.
 * Umgeht alle SDK-Deprecations und v1beta-Routing-Fehler vollständig.
 */
async function callGeminiApiDirect({
  model,
  prompt,
  systemInstruction,
  timeoutMs = 45000,
}: CallApiOptions): Promise<any> {
  if (!API_KEY) {
    throw new Error(
      "GEMINI_API_KEY ist in den Umgebungsvariablen nicht gesetzt.",
    );
  }

  const url = `${API_BASE_URL}/${model}:generateContent?key=${API_KEY}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

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

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text();
      const err = new Error(`Gemini API HTTP ${response.status}: ${errorBody}`);
      (err as any).status = response.status;
      throw err;
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error("Leere Antwort von der Gemini API erhalten.");
    }

    return JSON.parse(candidateText);
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      const timeoutErr = new Error(
        `Request Timeout (${timeoutMs}ms) für Modell ${model}`,
      );
      (timeoutErr as any).status = 504;
      throw timeoutErr;
    }
    throw err;
  }
}

/**
 * Enterprise Resilience Runner:
 * Versucht Primärmodell mit Exponential Backoff (3 Versuche), schaltet erst bei Dauerfehler auf Fallbackmodell.
 */
async function executeResilientAiTask(
  prompt: string,
  systemInstruction: string,
): Promise<any> {
  const modelsToTry = [PRIMARY_MODEL, FALLBACK_MODEL];
  let lastError: any = null;

  for (const model of modelsToTry) {
    const maxRetries = 2;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(
          `🤖 [AI Engine] Ausführung gestartet (Modell: ${model}, Versuch: ${attempt}/${maxRetries})...`,
        );
        return await callGeminiApiDirect({ model, prompt, systemInstruction });
      } catch (error: any) {
        lastError = error;
        const status = error?.status;

        console.warn(
          `⚠️ [AI Engine] Modell '${model}' fehlgeschlagen (Status ${status}):`,
          error.message,
        );

        // Bei 404 (Modell im Endpoint nicht verankert): Sofort zum nächsten Modell wechseln
        if (status === 404) {
          break;
        }

        // Bei 503 (Overload) oder 429 (Rate Limit): Kurzes Backoff vor Retry
        if (
          (status === 503 || status === 429 || status === 504) &&
          attempt < maxRetries
        ) {
          const delay = attempt * 2000;
          console.log(
            `⏳ [AI Engine] Ratelimit/Overload (${status}). Warte ${delay}ms...`,
          );
          await new Promise((res) => setTimeout(res, delay));
          continue;
        }

        // Andere Fehler: Modell wechseln
        break;
      }
    }
  }

  console.error(
    "🔥 [AI Engine] Alle KI-Modelle & Retries fehlgeschlagen.",
    lastError,
  );
  throw new Error(
    "Der KI-Analysedienst ist derzeit nicht erreichbar. Bitte versuchen Sie es in wenigen Sekunden erneut.",
  );
}

export async function analyzeCoreData(context: string): Promise<AnalysisData> {
  const systemInstruction = `Du bist ein deutscher Sachverständiger, WEG-Recht-Experte und Senior Real Estate Analyst.
Analysiere Immobilienunterlagen präzise.
Antworte AUSSCHLIESSLICH im validen JSON-Format gemäß Vorgabe.`;

  const prompt = `
Analysiere die folgenden Dokumente und gib ein striktes JSON-Objekt zurück.

JSON Schema:
{
  "leadScore": number (0-100),
  "executiveSummary": string,
  "confidence": number (0.0-1.0),
  "overallRecommendation": string,
  "verificationRequired": boolean,
  "topRisks": Array<{ id: string, severity: string, title: string, whyItMatters: string, confidence: number }>,
  "positiveFindings": Array<{ title: string, description: string }>,
  "missingDocuments": Array<{ name: string, required: boolean }>,
  "negotiationPoints": Array<{ title: string, argument: string, leverageScore: number }>,
  "sellerQuestions": Array<{ question: string, context: string }>,
  "timeline": Array<{ event: string, date: string }>,
  "crossDocumentConflicts": Array<{ title: string, description: string, severity: string }>
}

DOKUMENTE:
${context}
`;

  return await executeResilientAiTask(prompt, systemInstruction);
}

export async function analyzeDeepDiveData(
  context: string,
  schemaString: string,
): Promise<AnalysisData> {
  const systemInstruction = `Du bist ein Senior Real Estate Analyst. Gib ausschließlich reines JSON gemäß vorgegebenem Schema zurück.`;
  const prompt = `Schema: ${schemaString}\n\nDokumente:\n${context}`;

  return await executeResilientAiTask(prompt, systemInstruction);
}
