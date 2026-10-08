import { OpenAI } from "openai";
import { AnalysisData } from "./types/analysis";

const mistral = new OpenAI({
  apiKey: process.env.MISTRAL_API_KEY,
  baseURL: "https://api.mistral.ai/v1",
});

/**
 * ENTERPRISE DEAL INTELLIGENCE 2.0
 * Führt automatische Klassifizierung, Cross-Document-Analyse, Widerspruchserkennung und Risikopriorisierung durch.
 * Gibt strikt das vereinheitlichte AnalysisData-Schema zurück.
 */
export async function analyzeCoreData(context: string): Promise<AnalysisData> {
  const prompt = `
    Du bist ein kompromissloser deutscher Sachverständiger, WEG-Recht-Experte und Senior Real Estate Analyst. 
    Analysiere die vorliegenden Dokumente (Exposé, Teilungserklärung, WEG-Protokolle, Wirtschaftsplan, Grundbuch etc.) mit absoluter juristischer und kaufmännischer Präzision.

    Deine Aufgabe ist es, den ultimativen "Deal-Prüfer" durchzuführen. Suche aktiv nach versteckten Risiken, finanziellen Fallen und Widersprüchen zwischen den Dokumenten.

    Du MUSST ein striktes JSON-Objekt zurückgeben, das exakt diesem TypeScript-Schema entspricht:
    {
      "leadScore": (Zahl von 0 bis 100. 100 = perfekter Deal. Bei ungedeckten Sanierungsrückstauten oder massiven Widersprüchen sofort unter 50 fallen lassen!),
      "executiveSummary": "Kaufmännische Zusammenfassung auf den Punkt gebracht (2-3 Sätze)",
      "confidence": (Zahl von 0 bis 1, z.B. 0.95 für hohe Sicherheit bei der Texterkennung),
      "overallRecommendation": "Harte, glasklare Handlungsempfehlung für den Makler auf Deutsch",
      "verificationRequired": (boolean: true, falls kritische manuelle Prüfungen nötig sind),
      "topRisks": [
        {
          "id": "1",
          "severity": "High" (oder "Medium" or "Low"),
          "title": "Prägnanter Risikotitel",
          "whyItMatters": "Konkrete finanzielle oder rechtliche Auswirkung",
          "source": {
            "documentType": "Exposé oder Teilungserklärung etc.",
            "pageNumber": 1 (Integer),
            "snippet": "Exakter Originaltextauszug als Beleg"
          },
          "confidence": 0.9
        }
      ],
      "positiveFindings": [
        {
          "title": "Positiver Aspekt",
          "description": "Erklärung warum das gut für den Käufer ist",
          "source": {
            "documentType": "Dokumentname",
            "pageNumber": 1,
            "snippet": "Belegtext"
          }
        }
      ],
      "missingDocuments": [
        {
          "name": "Name des fehlenden Dokuments",
          "required": true (oder false)
        }
      ],
      "negotiationPoints": [
        {
          "title": "Verhandlungspunkt",
          "argument": "Argument für den Makler zur Kaufpreisreduktion",
          "leverageScore": 85 (Zahl von 0 bis 100)
        }
      ],
      "sellerQuestions": [
        {
          "question": "Konkrete Frage an den Verkäufer",
          "context": "Hintergrund der Frage"
        }
      ],
      "timeline": [
        {
          "event": "Ereignisbeschreibung",
          "date": "Datum oder Zeitraum (z.B. Q3 2026)"
        }
      ],
      "crossDocumentConflicts": [
        {
          "title": "Titel des Widerspruchs (z.B. Wohnfläche weicht ab)",
          "description": "Detaillierte Beschreibung des Widerspruchs",
          "severity": "High" (oder "Medium" or "Low"),
          "sourceA": {
            "documentType": "Dokument A",
            "pageNumber": 2,
            "snippet": "Aussage A"
          },
          "sourceB": {
            "documentType": "Dokument B",
            "pageNumber": 5,
            "snippet": "Aussage B"
          }
        }
      ]
    }
    
    HIER SIND DIE DOKUMENTE:
    ${context}
  `;

  const completion = await mistral.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "mistral-small-latest",
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const raw = completion.choices[0].message.content || "{}";
  try {
    return JSON.parse(raw.replace(/```json/g, "").replace(/```/g, ""));
  } catch (e) {
    console.error("Fehler beim Parsen der KI-Antwort:", raw);
    // Strikter Fallback, der dem AnalysisData-Schema entspricht
    return {
      leadScore: 50,
      executiveSummary:
        "Die Dokumente konnten nicht vollständig strukturiert eingelesen werden.",
      confidence: 0.5,
      overallRecommendation: "Manuelle Prüfung erforderlich.",
      verificationRequired: true,
      topRisks: [],
      positiveFindings: [],
      missingDocuments: [],
      negotiationPoints: [],
      sellerQuestions: [],
      timeline: [],
      crossDocumentConflicts: [],
    };
  }
}

/**
 * SCHRITT 2: Detaillierte Due Diligence (Deep Dive)
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

  const completion = await mistral.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "mistral-small-latest",
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const raw = completion.choices[0].message.content || "{}";
  return JSON.parse(raw.replace(/```json/g, "").replace(/```/g, ""));
}
