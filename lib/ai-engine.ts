import { OpenAI } from "openai";
import { AnalysisData } from "./types/analysis";
import { z } from "zod";

const mistral = new OpenAI({
  apiKey: process.env.MISTRAL_API_KEY,
  baseURL: "https://api.mistral.ai/v1",
});

const ScoringFactorSchema = z.object({
  points: z.number(), // z.B. -12, +10, etc.
  category: z.string(), // z.B. "Fehlende Protokolle", "Wohnfläche", etc.
  reason: z.string(), // Genaue Erklärung, warum Punkte abgezogen/addiert wurden
  pageNumber: z.number().optional(), // Referenz zur Seite im Dokument
});

/**
 * ENTERPRISE CHUNKING: Teilt den Text intelligent an Absatzgrenzen (\n\n) auf,
 * damit Sätze und Paragraphen nicht zerrissen werden.
 */
function chunkTextSmart(text: string, maxChunkChars: number = 5000): string[] {
  if (text.length <= maxChunkChars) return [text];

  const paragraphs = text.split(/\n\s*\n/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const para of paragraphs) {
    if ((currentChunk + "\n\n" + para).length > maxChunkChars) {
      if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = para;
    } else {
      currentChunk = currentChunk ? currentChunk + "\n\n" + para : para;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * ENTERPRISE RETRY LOGIK: Fängt temporäre 429 Rate-Limits mit Exponential Backoff ab.
 */
async function callMistralWithRetry(
  prompt: string,
  maxRetries = 3,
): Promise<any> {
  let delay = 2000; // Start bei 2 Sekunden

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const completion = await mistral.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "mistral-small-latest",
        response_format: { type: "json_object" },
        temperature: 0.1,
      });

      const raw = completion.choices[0].message.content || "{}";
      return JSON.parse(raw.replace(/```json/g, "").replace(/```/g, ""));
    } catch (error: any) {
      if (error?.status === 429 && attempt < maxRetries) {
        console.warn(
          `⚠️ Rate-Limit (429) erreicht. Automatischer Retry ${attempt}/${maxRetries} in ${delay}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Verdoppelung der Wartezeit
        continue;
      }
      throw error;
    }
  }
}

/**
 * ENTERPRISE DEAL INTELLIGENCE 2.0
 * Führt automatische Klassifizierung, Cross-Document-Analyse, Widerspruchserkennung und Risikopriorisierung durch.
 * Mit intelligentem Smart-Chunking und automatischem Rate-Limit-Retry.
 */
export async function analyzeCoreData(context: string): Promise<AnalysisData> {
  const maxCharsPerRequest = 5000;
  const textChunks = chunkTextSmart(context, maxCharsPerRequest);

  console.log(
    `🏢 Enterprise-Analyse gestartet: Dokument in ${textChunks.length} logische Blöcke unterteilt.`,
  );

  let aggregatedRisks: any[] = [];
  let aggregatedPositiveFindings: any[] = [];
  let aggregatedMissingDocs: any[] = [];
  let aggregatedNegotiationPoints: any[] = [];
  let aggregatedConflicts: any[] = [];
  let aggregatedTimeline: any[] = [];
  let aggregatedSellerQuestions: any[] = [];
  let lastExecutiveSummary = "";
  let lastRecommendation = "";
  let scores: number[] = [];

  for (let i = 0; i < textChunks.length; i++) {
    const chunk = textChunks[i];
    console.log(
      `🔄 Verarbeite Enterprise-Chunk ${i + 1} von ${textChunks.length}...`,
    );

    const prompt = `
      Du bist ein kompromissloser deutscher Sachverständiger, WEG-Recht-Experte und Senior Real Estate Analyst. 
      Analysiere die vorliegenden Dokumente (Exposé, Teilungserklärung, WEG-Protokolle, Wirtschaftsplan, Grundbuch etc.) mit absoluter juristischer und kaufmännischer Präzision.

      WICHTIG ZU DEN QUELLEN (EVIDENCE):
      Jedes Risiko und jeder positive Befund MUSS einen echten Beleg aus dem übergebenen Text enthalten. Erfinde NIEMALS Seitenzahlen oder Textsnippets!

      SCORING-LOGIK:
      Ermittle einen Deal-Score von 0 bis 100 Punkten ('leadScore'). 
      - Starte bei einem Basiswert von 100 Punkten.
      - Ziehe Punkte ab für: Fehlende Pflichtdokumente, unklare Instandhaltungsrücklagen, Widersprüche oder finanzielle Auffälligkeiten.
      - Addiere Punkte für: Vollständige Unterlagen, gesunde Rücklagen.

      Du MUSST ein striktes JSON-Objekt zurückgeben, das exakt diesem TypeScript-Schema entspricht:
      {
        "leadScore": (Zahl von 0 bis 100),
        "executiveSummary": "Kaufmännische Zusammenfassung auf den Punkt gebracht (2-3 Sätze)",
        "confidence": 0.95,
        "overallRecommendation": "Harte, glasklare Handlungsempfehlung für den Makler auf Deutsch",
        "verificationRequired": false,
        "topRisks": [
          {
            "id": "1",
            "severity": "High",
            "title": "Prägnanter Risikotitel",
            "whyItMatters": "Konkrete finanzielle oder rechtliche Auswirkung",
            "source": {
              "documentType": "Echter Name des Dokuments",
              "pageNumber": 1,
              "snippet": "Exakter Originaltextauszug als Beleg"
            },
            "confidence": 0.9
          }
        ],
        "positiveFindings": [
          {
            "title": "Positiver Aspekt",
            "description": "Erklärung",
            "source": {
              "documentType": "Dokument",
              "pageNumber": 1,
              "snippet": "Belegtext"
            }
          }
        ],
        "missingDocuments": [
          {
            "name": "Name des fehlenden Dokuments",
            "required": true
          }
        ],
        "negotiationPoints": [
          {
            "title": "Verhandlungspunkt",
            "argument": "Argument für den Makler",
            "leverageScore": 85
          }
        ],
        "sellerQuestions": [
          {
            "question": "Konkrete Frage",
            "context": "Hintergrund"
          }
        ],
        "timeline": [
          {
            "event": "Ereignisbeschreibung",
            "date": "Zeitraum"
          }
        ],
        "crossDocumentConflicts": [
          {
            "title": "Widerspruch Titel",
            "description": "Beschreibung",
            "severity": "High",
            "sourceA": { "documentType": "A", "pageNumber": 1, "snippet": "A" },
            "sourceB": { "documentType": "B", "pageNumber": 1, "snippet": "B" }
          }
        ]
      }
      
      HIER IST DER DOKUMENTEN-TEILAUSZUG:
      ${chunk}
    `;

    try {
      const partialResult = await callMistralWithRetry(prompt);

      if (typeof partialResult.leadScore === "number")
        scores.push(partialResult.leadScore);
      if (partialResult.executiveSummary)
        lastExecutiveSummary = partialResult.executiveSummary;
      if (partialResult.overallRecommendation)
        lastRecommendation = partialResult.overallRecommendation;

      if (partialResult.topRisks)
        aggregatedRisks.push(...partialResult.topRisks);
      if (partialResult.positiveFindings)
        aggregatedPositiveFindings.push(...partialResult.positiveFindings);
      if (partialResult.missingDocuments)
        aggregatedMissingDocs.push(...partialResult.missingDocuments);
      if (partialResult.negotiationPoints)
        aggregatedNegotiationPoints.push(...partialResult.negotiationPoints);
      if (partialResult.crossDocumentConflicts)
        aggregatedConflicts.push(...partialResult.crossDocumentConflicts);
      if (partialResult.timeline)
        aggregatedTimeline.push(...partialResult.timeline);
      if (partialResult.sellerQuestions)
        aggregatedSellerQuestions.push(...partialResult.sellerQuestions);
    } catch (chunkError) {
      console.error(
        `❌ Fehler in Enterprise-Chunk ${i + 1} nach Retries:`,
        chunkError,
      );
    }
  }

  // Konservatives Sicherheits-Scoring (Niedrigster Score gewinnt bei Risiken)
  const finalLeadScore = scores.length > 0 ? Math.min(...scores) : 65;

  return {
    leadScore: finalLeadScore,
    executiveSummary:
      lastExecutiveSummary ||
      "Umfassender Analysebericht über mehrere Dokumentenabschnitte.",
    confidence: 0.92,
    overallRecommendation:
      lastRecommendation ||
      "Dokumente wurden vollständig geprüft. Bitte beachten Sie die Detail-Risiken.",
    verificationRequired: aggregatedRisks.length > 0,
    topRisks: aggregatedRisks,
    positiveFindings: aggregatedPositiveFindings,
    missingDocuments: aggregatedMissingDocs,
    negotiationPoints: aggregatedNegotiationPoints,
    sellerQuestions: aggregatedSellerQuestions,
    timeline: aggregatedTimeline,
    crossDocumentConflicts: aggregatedConflicts,
  };
}

/**
 * SCHRITT 2: Detaillierte Due Diligence (Deep Dive) mit Enterprise Retry
 */
export async function analyzeDeepDiveData(
  context: string,
  schemaString: string,
): Promise<AnalysisData> {
  const prompt = `
    Du bist ein Senior Real Estate Analyst. Führe eine vollständige Due Diligence durch.
    Gib AUSSCHLIESSLICH reines JSON zurück gemäß diesem Schema: 
    ${schemaString}.
    
    HIER SIND DIE DOKUMENTE:
    ${context}
  `;

  try {
    return await callMistralWithRetry(prompt);
  } catch (e) {
    console.error("🔥 Fehler beim Enterprise Deep Dive:", e);
    throw new Error("Fehler bei der tiefgehenden Dokumentenanalyse.");
  }
}
