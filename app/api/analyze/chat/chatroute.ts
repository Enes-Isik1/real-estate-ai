import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export async function POST(req: Request) {
  try {
    const { question, relevantChunks } = await req.json();

    const context = relevantChunks
      .map((c: { page: number; text: string }) => `[Seite ${c.page}]: ${c.text}`)
      .join("\n\n");

    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt: `Du bist ein Due-Diligence-Experte. Antworte basierend auf diesen Daten:
      
      Kontext: ${context}
      Frage: ${question}
      
      Regel: Antworte faktenorientiert und zitiere die Seitenzahlen.`,
    });

    return Response.json({ answer: text });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}