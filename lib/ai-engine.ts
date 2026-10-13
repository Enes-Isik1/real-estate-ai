import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisData } from "./types/analysis";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Enterprise-Fallback-Kette: Von blitzschnell zu maximal robust
const MODEL_FALLBACK_CHAIN = [
  "gemini-2.5-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
];

async function executeWithEnterpriseResilience(prompt: string): Promise<any> {
  let lastError: any = null;

  for (const modelName of MODEL_FALLBACK_CHAIN) {
    let attempts = 0;
    const maxRetries = 2;

    while (attempts < maxRetries) {
      try {
        attempts++;
        console.log(
          `🤖 [Enterprise AI] Versuche Modell '${modelName}' (Versuch ${attempts}/${maxRetries})...`,
        );

        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1,
          },
        });

        const rawText = result.response.text() || "{}";
        return JSON.parse(rawText);
      } catch (error: any) {
        lastError = error;
        const statusCode =
          error?.status ||
          (error?.message?.includes("503")
            ? 503
            : error?.message?.includes("404")
              ? 404
              : 500);

        console.warn(
          `⚠️ Modell '${modelName}' fehlgeschlagen (Status: ${statusCode}): ${error?.message || "Unbekannter Fehler"}`,
        );

        // Bei 404 (Modell nicht gefunden) sofort zum nächsten Modell in der Kette wechseln
        if (statusCode === 404) {
          break;
        }

        // Bei 503 (Überlastung) kurz 1,5 Sekunden warten und Retry innerhalb desselben Modells versuchen
        if (statusCode === 503 && attempts < maxRetries) {
          console.log(
            `⏳ Server überlastet (503). Warte 1.5s vor erneutem Versuch mit '${modelName}'...`,
          );
          await new Promise((resolve) => setTimeout(resolve, 1500));
          continue;
        }

        // Bei anderen Fehlern oder aufbrauchenden Retries direkt das nächste Modell in der Kette testen
        break;
      }
    }
  }

  // Absoluter Notfall-Fallback, falls alle Modelle und Retries fehlschlagen
  console.error(
    "🔥 KRITISCH: Alle Modelle in der Enterprise-Kette sind fehlgeschlagen.",
    lastError,
  );
  throw new Error(
    "Die KI-Server sind derzeit stark ausgelastet oder nicht erreichbar. Bitte versuchen Sie es in wenigen Augenblicken erneut.",
  );
}

export async function analyzeCoreData(context: string): Promise<AnalysisData> {
  console.log("🏢 Starte Google Gemini Enterprise Core-Analyse...");

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
    
    HIER SIND DIE GESAMTEN DOKUMENTE:
    ${context}
  `;

  return await executeWithEnterpriseResilience(prompt);
}

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

  return await executeWithEnterpriseResilience(prompt);
}
