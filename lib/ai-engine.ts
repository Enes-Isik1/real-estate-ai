import { AnalysisData } from "./types/analysis";

const API_KEY = process.env.GEMINI_API_KEY;
// Das von Google für deinen Account verbindlich vorgeschriebene Produktionsmodell
const MODEL_NAME = "gemini-3.8-flash";

async function callGeminiDirect(
  prompt: string,
  systemInstruction?: string,
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

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`🔥 Gemini API Fehler (HTTP ${response.status}):`, errorBody);
    throw new Error(
      `Die KI-Schnittstelle hat mit Status ${response.status} geantwortet: ${errorBody}`,
    );
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error("Die KI hat eine leere Antwort zurückgegeben.");
  }

  return JSON.parse(rawText);
}

export async function analyzeCoreData(context: string): Promise<AnalysisData> {
  console.log("🏢 Starte DealPilot Core-Analyse mit gemini-3.8-flash...");

  // Begrenze den Text auf 30.000 Zeichen, um Vercel-Timeouts (60s) absolut sicher zu verhindern
  const safeContext =
    context.length > 30000
      ? context.substring(0, 30000) +
        "\n\n[... Text aus Performancegründen gekürzt ...]"
      : context;

  const systemInstruction = `Du bist ein deutscher Sachverständiger, WEG-Recht-Experte und Senior Real Estate Analyst. Analysiere Immobilienunterlagen präzise und antworte AUSSCHLIESSLICH im validen JSON-Format gemäß Vorgabe.`;

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
    ${safeContext}
  `;

  return await callGeminiDirect(prompt, systemInstruction);
}

export async function analyzeDeepDiveData(
  context: string,
  schemaString: string,
): Promise<AnalysisData> {
  console.log("🔍 Starte Deep Dive Analyse...");

  const safeContext =
    context.length > 30000
      ? context.substring(0, 30000) + "\n\n[... Text gekürzt ...]"
      : context;

  const systemInstruction = `Du bist ein Senior Real Estate Analyst. Führe eine vollständige Due Diligence durch und gib AUSSCHLIESSLICH reines JSON zurück.`;
  const prompt = `Schema: ${schemaString}\n\nDokumente:\n${safeContext}`;

  return await callGeminiDirect(prompt, systemInstruction);
}
