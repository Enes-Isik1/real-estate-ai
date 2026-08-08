// app/api/chat/route.ts
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Das Schema stellt sicher, dass wir Antwort und Quelle sauber trennen
const ChatResponseSchema = z.object({
  answer: z.string(),
  reasoning: z.string(),
  sourceSnippet: z.string(),
  pageNumber: z.number(),
  confidence: z.number().min(0).max(10),
});

export async function POST(req: Request) {
  try {
    // 1. Authentifizierung über Authorization-Header prüfen (IDOR-Schutz)
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json(
        { error: "Nicht autorisiert. Kein Token übergeben." },
        { status: 401 },
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return Response.json(
        { error: "Ungültiges oder abgelaufenes Token." },
        { status: 401 },
      );
    }

    const { question, dealId, relevantChunks } = await req.json();

    let context = "";

    // 2. Wenn eine dealId übergeben wurde, erst Berechtigung prüfen, dann Daten laden
    if (dealId) {
      // Sicherheitscheck: Geht der Deal wirklich an diesen User?
      const { data: deal, error: dealError } = await supabaseAdmin
        .from("deals")
        .select("id, user_id")
        .eq("id", dealId)
        .eq("user_id", user.id) // <--- Verhindert das Auslesen fremder Deal-Chats
        .single();

      if (dealError || !deal) {
        return Response.json(
          { error: "Deal nicht gefunden oder keine Berechtigung." },
          { status: 403 },
        );
      }

      // Jetzt ist der Zugriff sicher: Analyse abrufen
      const { data: analysis, error: analysisError } = await supabaseAdmin
        .from("analyses")
        .select("*")
        .eq("deal_id", dealId)
        .order("version", { ascending: false })
        .maybeSingle();

      if (analysisError || !analysis) {
        return Response.json(
          { error: "Keine gespeicherte Analyse für diesen Deal gefunden." },
          { status: 404 },
        );
      }

      const { data: documents } = await supabaseAdmin
        .from("documents")
        .select("*")
        .eq("deal_id", dealId);

      context = `
        EXECUTIVE SUMMARY:
        ${analysis.executive_summary}

        GESAMTEMPFEHLUNG:
        ${analysis.overall_recommendation}

        ROHDATEN / ANALYSE-ERGEBNISSE:
        ${JSON.stringify(analysis.raw_json)}

        VORHANDENE DOKUMENTE:
        ${JSON.stringify(documents)}
      `;
    }
    // 3. Fallback auf direkt übergebene Chunks
    else if (relevantChunks && Array.isArray(relevantChunks)) {
      context = relevantChunks
        .map(
          (c: { page: number; text: string }) => `[Seite ${c.page}]: ${c.text}`,
        )
        .join("\n\n");
    } else {
      return Response.json(
        { error: "Weder dealId noch relevantChunks übergeben." },
        { status: 400 },
      );
    }

    const { object } = await generateObject({
      model: google("gemini-1.5-flash"),
      schema: ChatResponseSchema,
      prompt: `
  Du bist ein Due-Diligence-Experte. Antworte auf die Frage des Nutzers ausschließlich basierend auf den bereitgestellten Daten.

  DATEN:
  ${context}

  FRAGE:
  ${question}

  REGELN:
  1. Antworte faktenorientiert und präzise.
  2. Wenn die Information nicht in den Daten steht, schreibe "Information nicht im Dokument gefunden" und setze confidence auf 0.
  3. 'reasoning': Erkläre in einem Satz, wie du aus dem Quelltext auf die Antwort kommst (Dein logischer Schluss).
  4. 'sourceSnippet': Kopiere den exakten Wortlaut aus dem Kontext, der deine Antwort belegt (oder fasse den relevanten Beleg präzise zusammen, falls kein Rohtext-Chunk vorliegt).
  5. 'pageNumber': Nenne die Seitenzahl aus dem Kontext (Standard 1, falls keine Seitennummer vorliegt).
`,
    });

    return Response.json(object);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
