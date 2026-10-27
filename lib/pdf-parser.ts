// lib/pdf-parser.ts
import pdf from "pdf-parse-fork";

export interface ParsedDocumentResult {
  filename: string;
  rawText: string;
  chunks: Array<{
    id: string;
    documentName: string;
    text: string;
    pageNumber: number;
  }>;
  pageCount: number;
}

/**
 * Enterprise-Level PDF Parser
 * Prüft den Puffer, extrahiert Text seitenbasiert und erzeugt strukturierte Chunks für die RAG/KI-Analyse.
 */
export async function parsePdfBuffer(
  buffer: Buffer,
  filename: string,
): Promise<ParsedDocumentResult> {
  if (!buffer || buffer.length === 0) {
    throw new Error(`Der Puffer für die Datei "${filename}" ist leer.`);
  }

  // Sanity Check: Handelt es sich um ein echtes PDF?
  const fileHeader = buffer.toString("utf8", 0, 20);
  if (!fileHeader.toLowerCase().includes("pdf")) {
    throw new Error(`Die Datei "${filename}" ist kein gültiges PDF-Format.`);
  }

  let parsedText = "";
  let pageCount = 1;

  try {
    const pdfData = await pdf(buffer);
    parsedText = pdfData.text || "";
    pageCount = pdfData.numpages || 1;
  } catch (pdfErr: any) {
    console.warn(
      `⚠️ [PDF-Parser] Fehler beim Parsen von ${filename}:`,
      pdfErr?.message || pdfErr,
    );
    throw new Error(
      `Fehler beim Extrahieren des Textes aus "${filename}". Die Datei ist möglicherweise beschädigt.`,
    );
  }

  // Fallback für reine Bild-Scans ohne OCR-Ebene
  if (!parsedText || parsedText.trim().length < 20) {
    parsedText = `[HINWEIS: Aus der Datei ${filename} konnte kein Fließtext extrahiert werden. Es handelt sich voraussichtlich um einen reinen Bild-Scan ohne erkennbare Texterbene.]`;
  }

  const chunks: Array<{
    id: string;
    documentName: string;
    text: string;
    pageNumber: number;
  }> = [];

  // Seitenbasiertes Aufteilen über Form-Feed (\f) oder Fallback-Blöcke
  const pages = parsedText.split(/\f/);

  if (pages.length > 1) {
    pages.forEach((pageText, pageIndex) => {
      const trimmed = pageText.trim();
      if (trimmed.length > 0) {
        chunks.push({
          id: crypto.randomUUID(),
          documentName: filename,
          text: trimmed,
          pageNumber: pageIndex + 1,
        });
      }
    });
  } else {
    const chunkSize = 2000;
    for (let i = 0; i < parsedText.length; i += chunkSize) {
      const chunkText = parsedText.substring(i, i + chunkSize);
      const estimatedPage = Math.floor(i / chunkSize) + 1;
      chunks.push({
        id: crypto.randomUUID(),
        documentName: filename,
        text: chunkText,
        pageNumber: estimatedPage,
      });
    }
  }

  return {
    filename,
    rawText: parsedText,
    chunks,
    pageCount,
  };
}
