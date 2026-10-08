import { NextResponse } from "next/server";
import { createClient } from "@/lib/utils/supabase/server"; // oder dein Server-Client

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { message, dealContext } = await req.json();

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Keine Nachricht übergeben." },
        { status: 400 },
      );
    }

    // Hier nutzen wir denselben KI-Provider, den du für die Analyse nutzt (z.B. Mistral / OpenAI)
    // Wir füttern das System-Prompt mit dem gesamten Deal-State:
    const systemPrompt = `Du bist DealPilot Copilot, ein hochintelligenter KI-Assistent für deutsche Immobilienmakler und Due-Diligence-Experten. 
Du hast vollständigen Zugriff auf den aktuellen Deal-State. 
Beantworte die Fragen des Maklers präzise, professionell und datenbasiert auf Basis dieses Kontexts.

Deal-Kontext:
Titel: ${dealContext?.title}
Lead Score: ${dealContext?.score}/100
Executive Summary: ${dealContext?.analysis?.executiveSummary || dealContext?.analysis?.summary}
Top-Risiken: ${JSON.stringify(dealContext?.analysis?.topRisks || dealContext?.analysis?.risks || [])}
Widersprüche: ${JSON.stringify(dealContext?.analysis?.crossDocumentConflicts || [])}
Fehlende Dokumente: ${JSON.stringify(dealContext?.analysis?.missingDocuments || [])}
Dateien: ${JSON.stringify(dealContext?.files || [])}
`;

    // Beispiel für den API-Aufruf an deinen KI-Provider (analog zu deiner Analyse-Route):
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY || process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "mistral-large-latest", // oder dein bevorzugtes Modell
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const answer =
      data.choices?.[0]?.message?.content ||
      "Entschuldigung, ich konnte dazu keine Antwort generieren.";

    return NextResponse.json({ success: true, answer });
  } catch (error: any) {
    console.error("Copilot API Fehler:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
