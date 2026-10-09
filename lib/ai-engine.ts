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
 * ENTERPRISE DEAL INTELLIGENCE 2.0
 * Führt automatische Klassifizierung, Cross-Document-Analyse, Widerspruchserkennung und Risikopriorisierung durch.
 * Gibt strikt das vereinheitlichte AnalysisData-Schema zurück.
 */
export async function analyzeCoreData(context: string): Promise<AnalysisData> {
  const prompt = `
    Du bist ein kompromissloser deutscher Sachverständiger, WEG-Recht-Experte und Senior Real Estate Analyst. 
    Analysiere die vorliegenden Dokumente (Exposé, Teilungserklärung, WEG-Protokolle, Wirtschaftsplan, Grundbuch etc.) mit absoluter juristischer und kaufmännischer Präzision.

    WICHTIG ZU DEN QUELLEN (EVIDENCE):
    Jedes Risiko und jeder positive Befund MUSS einen echten Beleg aus dem übergebenen Text enthalten. Erfinde NIEMALS Seitenzahlen oder Textsnippets (keine Platzhalter wie "Dokumentname" oder "Belegtext"). Wenn eine genaue Seite nicht ersichtlich ist, trage 1 ein, aber das Snippet muss ein echter, wörtlicher Zitat-Auszug aus dem Text sein!

    SCORING-LOGIK:
    Ermittle einen Deal-Score von 0 bis 100 Punkten ('leadScore'). Du musst die Vergabe transparent aufschlüsseln:
    - Starte bei einem Basiswert von 100 Punkten.
    - Ziehe Punkte ab für: Fehlende Pflichtdokumente (z.B. Wirtschaftsplan, WEG-Protokolle), unklare Instandhaltungsrücklagen, Widersprüche zwischen Exposé und Teilungserklärung, oder finanzielle Auffälligkeiten.
    - Addiere Punkte für: Vollständige Unterlagen, gesunde Rücklagen, klare Sonderumlagen-Freiheit.
    - Jede Abweichung muss im Array 'scoringBreakdown' mit exakter Punktzahl (z.B. -12), Kategorie, Begründung und Seitenzahl dokumentiert werden.

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
            "documentType": "Echter Name des Dokuments aus dem Kontext",
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
            "documentType": "Echter Name des Dokuments",
            "pageNumber": 1,
            "snippet": "Echter Belegtext"
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
  // Neuer Prompt-Baustein für den Deal-Prüfer
  const DEAL_EXAMINER_PROMPT = `
  Du bist der leitende Deal-Prüfer von DealPilot. Erstelle einen kompakten, hochfokussierten Executive Briefing Report für den Immobilienmakler.
  Beantworte in diesem Report präzise und unerbittlich folgende Kernfrage:
  "Was muss ich als Makler über diesen Deal unbedingt wissen, bevor ich ihn meinem Kunden empfehle?"

  Strukturiere das Ergebnis in folgenden JSON-Block:
  {
    "dealExaminerReport": {
      "headline": "Ein prägnanter Satz, der den Zustand des Deals zusammenfasst (z.B. 'Solides Objekt mit verstecktem Sanierungsstau im Dachbereich')",
      "criticalTakeaways": [
        "Die 3 wichtigsten harten Fakten oder Risiken, die der Makler sofort kennen muss."
      ],
      "brokerActionItem": "Die wichtigste Handlungsempfehlung für den nächsten Anruf beim Verkäufer."
    }
  }
`;

  const completion = await mistral.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "mistral-small-latest",
    response_format: { type: "json_object" },
    temperature: 0.1,
  });

  const raw = completion.choices[0].message.content || "{}";
  try {
    const parsed = JSON.parse(raw.replace(/```json/g, "").replace(/```/g, ""));
    return parsed;
  } catch (e) {
    console.error("🔥 Kritischer Fehler beim Parsen der KI-Antwort:", raw);
    // Wir werfen einen echten Fehler, damit der Job-Status auf "failed" gesetzt wird
    // und der Nutzer im Frontend einen Retry-Button erhält.
    throw new Error(
      "Die KI konnte die Dokumente nicht strukturieren. Bitte versuchen Sie es erneut.",
    );
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
  try {
    return JSON.parse(raw.replace(/```json/g, "").replace(/```/g, ""));
  } catch (e) {
    console.error("🔥 Fehler beim Deep Dive Parsen:", raw);
    throw new Error("Fehler bei der tiefgehenden Dokumentenanalyse.");
  }
}
