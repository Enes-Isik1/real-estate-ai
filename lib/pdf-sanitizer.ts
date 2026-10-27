/**
 * Enterprise-Level PDF & Text Sanitizer
 * Entfernt visuelle Artefakte, Bild-Metadaten, Base64-Reste, Unicode-Müll
 * und optimiert den rohen Dokumenten-Text für hochpräzise und schnelle LLM-Analysen.
 */

export interface SanitizerOptions {
  maxLength?: number;
  preserveFinancialKeywords?: boolean;
}

const DEFAULT_OPTIONS: SanitizerOptions = {
  maxLength: 15000, // Maximales Token-Sicheres Limit für den Kontext
  preserveFinancialKeywords: true,
};

/**
 * Bereinigt rohen PDF- oder Dokumenten-Text von Binärmüll, Unicode-Anomalien und Bild-Headern.
 */
export function sanitizeDocumentText(
  rawText: string,
  options: SanitizerOptions = {},
): string {
  if (!rawText || typeof rawText !== "string") {
    console.warn("⚠️ [Sanitizer] Leerer oder ungültiger Text übergeben.");
    return "";
  }

  const config = { ...DEFAULT_OPTIONS, ...options };

  let cleaned = rawText
    // 1. Unicode-Normalisierung (gleicht kaputte PDF-Zeichensätze & Ligaturen aus)
    .normalize("NFKC")
    // 2. Entferne Base64-Codierungen und Bild-Stream-Reste aus PDFs
    .replace(/\/Im\d+\s+Do/g, "")
    .replace(/data:image\/[a-zA-Z]+;base64,[^\s]+/g, "[BILD-DATEN ENTFERNT]")
    // 3. Entferne unsichtbare Steuerzeichen, Zero-Width-Spaces, Soft-Hyphens und Null-Bytes
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F\u00AD\u200B-\u200D\uFEFF]/g, "")
    // 4. Bereinige typische PDF-Kopf-/Fußzeilen-Artefakte (z.B. "Seite X von Y")
    .replace(/Seite\s+\d+\s+von\s+\d+/gi, "")
    // 5. Normalisiere mehrfache Leerzeichen und horizontale Tabs
    .replace(/[ \t]+/g, " ")
    // 6. Reduziere mehrfache Zeilenumbrüche auf maximal zwei
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();

  // 7. Intelligenter Keyword-Filter auf Absatz-Basis, falls das Dokument das Limit überschreitet
  const limit = config.maxLength || 15000;
  if (config.preserveFinancialKeywords && cleaned.length > limit) {
    cleaned = smartExtractRelevantParagraphs(cleaned, limit);
  } else if (cleaned.length > limit) {
    cleaned = cleaned.substring(0, limit);
  }

  console.log(
    `🧹 [Sanitizer] Dokument erfolgreich bereinigt. Finale Länge: ${cleaned.length} Zeichen.`,
  );
  return cleaned;
}

/**
 * Filtert ganze Absätze (Paragraphs) heraus, die für Immobilien-, WEG- und Finanzanalysen
 * relevant sind, anstatt willkürlich Zeilen zu zerreißen.
 */
function smartExtractRelevantParagraphs(
  text: string,
  maxLength: number,
): string {
  // Unterteilung in logische Absätze (getrennt durch Leerzeilen)
  const paragraphs = text.split(/\n\s*\n/);

  const priorityKeywords = [
    "rücklage",
    "instandhaltung",
    "wirtschaftsplan",
    "beschluss",
    "hausgeld",
    "sondernutzung",
    "teilung",
    "schaden",
    "sanierung",
    "aufteilung",
    "euro",
    "€",
    "stimmen",
    "genehmigt",
    "ablehnung",
    "eigentümer",
    "weg",
    "haftung",
    "kaufpreis",
    "rendite",
    "miete",
    "nebenkosten",
    "fläche",
    "m²",
  ];

  const scoredParagraphs = paragraphs.map((para) => {
    const lower = para.toLowerCase();
    let score = 0;

    for (const keyword of priorityKeywords) {
      if (lower.includes(keyword)) score += 3;
    }

    // Zahlen, Währungen und Prozentwerte erhöhen die Relevanz (z. B. Beträge, Anteile)
    if (
      /\d+([.,]\d+)?\s*(€|eur|qm|m²|prozent|%|\bgesamtkosten\b|\banteil\b)/i.test(
        para,
      )
    ) {
      score += 2;
    }

    // Längere Absätze mit Kontext behalten einen Sockelwert
    if (para.length > 100) {
      score += 1;
    }

    return { paragraph: para.trim(), score };
  });

  // Sortiere primär nach Relevanz-Score (höchste zuerst)
  scoredParagraphs.sort((a, b) => b.score - a.score);

  let accumulatedLength = 0;
  const selectedParagraphs: string[] = [];

  for (const item of scoredParagraphs) {
    if (item.score <= 0 && item.paragraph.length < 40) continue; // Unwichtigen Müll verwerfen

    if (accumulatedLength + item.paragraph.length + 2 <= maxLength) {
      selectedParagraphs.push(item.paragraph);
      accumulatedLength += item.paragraph.length + 2;
    } else {
      break;
    }
  }

  // Falls durch das Filtern zu wenig übrig blieb, Fallback auf den Anfang des Textes
  if (selectedParagraphs.length === 0) {
    return text.substring(0, maxLength);
  }

  return selectedParagraphs.join("\n\n");
}
