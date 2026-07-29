// lib/ai-engine.ts
import { OpenAI } from 'openai';

const mistral = new OpenAI({
  apiKey: process.env.MISTRAL_API_KEY,
  baseURL: 'https://api.mistral.ai/v1',
});

/**
 * SCHRITT 1: Turbo-Kernanalyse (Score, Empfehlung, Executive Summary, Risiken + SourceDocs)
 */
export async function analyzeCoreData(context: string) {
  const prompt = `
    Du bist ein erfahrener deutscher Immobilienmakler und Senior Real Estate Analyst. 
    Analysiere die vorliegenden Dokumente (Exposé, Teilungserklärung, Protokolle etc.) und gib ein striktes JSON-Objekt zurück mit exakt diesen Feldern:
    {
      "leadScore": (Zahl von 0 bis 100),
      "overallRecommendation": "Kurze, prägnante Handlungsempfehlung für den Makler oder Investor auf Deutsch",
      "executiveSummary": "Professionelle Zusammenfassung in 2-3 Sätzen auf Deutsch",
      "topRisks": [
        {
          "id": "1",
          "severity": "High" (oder "Medium" oder "Low"),
          "title": "Kurzer Titel des Risikos",
          "whyItMatters": "Warum das für den Kauf relevant ist",
          "sourceDoc": "Name oder Art des Quelldokuments (z.B. 'Teilungserklärung', 'Protokoll 2023.pdf' oder 'Energieausweis')",
          "page": 1 (Zahl oder null, falls eine Seitenzahl aus den Dokumenten erkennbar ist)
        }
      ],
      "negotiationPoints": [
        {
          "title": "Verhandlungspunkt",
          "argument": "Argumentationshilfe für den Makler"
        }
      ],
      "missingDocuments": [
        {
          "title": "Name des fehlenden Dokuments (z.B. Energieausweis, Wohngeldabrechnung)",
          "category": "required" (oder "recommended" oder "optional"),
          "reason": "Warum dieses Dokument benötigt wird"
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
      leadScore: 50,
      overallRecommendation: "Solides Objekt, manuelle Prüfung empfohlen.",
      executiveSummary: "Die Dokumente konnten nicht vollständig strukturiert eingelesen werden.",
      topRisks: [],
      negotiationPoints: [],
      missingDocuments: []
    };
  }
}

/**
 * SCHRITT 2: Detaillierte Due Diligence
 */
export async function analyzeDeepDiveData(context: string, schemaString: string) {
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