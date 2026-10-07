import { OpenAI } from "openai";

const mistral = new OpenAI({
  apiKey: process.env.MISTRAL_API_KEY,
  baseURL: "https://api.mistral.ai/v1",
});

/**
 * ENTERPRISE DEAL INTELLIGENCE 2.0
 * Führt automatische Klassifizierung, Cross-Document-Analyse, Widerspruchserkennung und Risikopriorisierung durch.
 */
export async function analyzeCoreData(context: string) {
  const prompt = `
    Du bist ein kompromissloser deutscher Sachverständiger, WEG-Recht-Experte und Senior Real Estate Analyst. 
    Analysiere die vorliegenden Dokumente (Exposé, Teilungserklärung, WEG-Protokolle, Wirtschaftsplan, Grundbuch etc.) mit absoluter juristischer und kaufmännischer Präzision.

    Deine Aufgabe ist es, den ultimativen "Deal-Prüfer" durchzuführen. Suche aktiv nach versteckten Risiken, finanziellen Fallen und Widersprüchen.

    Gib ein striktes JSON-Objekt zurück mit exakt diesen Feldern:
    {
      "classifiedDocuments": [
        {
          "filename": "Exakter Dateiname aus dem Kontext",
          "detectedType": "Exposé" (Wähle aus: "Exposé", "Teilungserklärung", "WEG-Protokoll", "Wirtschaftsplan", "Grundbuchauszug", "Energieausweis", "Grundriss", "Sonstiges")
        }
      ],
      "leadScore": (Zahl von 0 bis 100. 100 = perfekter, fehlerfreier Deal. Bei ungedeckten Sanierungsrückstauten oder massiven Widersprüchen sofort unter 50 fallen lassen!),
      "overallRecommendation": "Harte, glasklare Handlungsempfehlung für den Makler auf Deutsch (z.B. 'Nicht ohne Nachverhandlung anbieten wegen X')",
      "executiveSummary": "Kaufmännische Zusammenfassung auf Punkt gebracht (2-3 Sätze)",
      "topRisks": [
        {
          "id": "1",
          "severity": "High" (oder "Medium" or "Low"),
          "title": "Prägnanter Risikotitel (z.B. 'Instandhaltungsrücklage unzureichend für beschlossene Dachsanierung')",
          "whyItMatters": "Konkrete finanzielle oder rechtliche Auswirkung auf den Käufer",
          "sourceDoc": "Exakter Name des Quelldokuments",
          "page": 1 (Exakte Seitenzahl als Integer)
        }
      ],
      "crossDocumentConflicts": [
        {
          "field": "Streitpunkt (z.B. Wohnfläche, Baujahr, Stellplatz, Instandhaltungsrücklage)",
          "sourceA": "Aussage in Dokument A mit Quelle (z.B. Exposé: 92 m²)",
          "sourceB": "Abweichende Aussage in Dokument B mit Quelle (z.B. Grundriss: 87,4 m²)",
          "recommendation": "Konkrete Handlungsanweisung zur Klärung"
        }
      ],
      "negotiationPoints": [
        {
          "title": "Harter Verhandlungspunkt",
          "argument": "Konkretes Argument für den Makler zur Kaufpreisreduktion oder Absicherung"
        }
      ],
      "missingDocuments": [
        {
          "title": "Name des fehlenden Dokuments",
          "category": "required" (oder "recommended" or "optional"),
          "reason": "Rechtliche oder wirtschaftliche Notwendigkeit"
        }
      ],
      "nextActions": [
        {
          "action": "Konkreter nächster Schritt für den Makler",
          "priority": "High" (oder "Medium" or "Low")
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
    return {
      classifiedDocuments: [],
      leadScore: 50,
      overallRecommendation: "Solides Objekt, manuelle Prüfung empfohlen.",
      executiveSummary:
        "Die Dokumente konnten nicht vollständig strukturiert eingelesen werden.",
      topRisks: [],
      crossDocumentConflicts: [],
      negotiationPoints: [],
      missingDocuments: [],
      nextActions: [],
    };
  }
}

/**
 * SCHRITT 2: Detaillierte Due Diligence (Deep Dive)
 */
export async function analyzeDeepDiveData(
  context: string,
  schemaString: string,
) {
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
