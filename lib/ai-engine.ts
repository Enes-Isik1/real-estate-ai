import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisData } from "./types/analysis";

// Initialisierung mit dem klassischen, stabilen SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-3.8-flash" });
export async function analyzeCoreData(context: string): Promise<AnalysisData> {
  console.log("🏢 Starte Google Gemini Enterprise-Analyse für DealPilot...");

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

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const rawText = result.response.text() || "{}";
    const parsed = JSON.parse(rawText);
    return parsed as AnalysisData;
  } catch (error) {
    console.error("🔥 Kritischer Fehler bei der Gemini-Analyse:", error);
    throw new Error(
      "Die KI konnte die Dokumente nicht strukturieren. Bitte versuchen Sie es erneut.",
    );
  }
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

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    return JSON.parse(result.response.text() || "{}");
  } catch (e) {
    console.error("🔥 Fehler beim Gemini Deep Dive:", e);
    throw new Error("Fehler bei der tiefgehenden Dokumentenanalyse.");
  }
}
