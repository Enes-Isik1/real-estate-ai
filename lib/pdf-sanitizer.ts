/**
 * Enterprise-Level PDF & Text Sanitizer
 * Entfernt visuelle Artefakte, Bild-Metadaten, Base64-Reste und optimiert
 * den rohen Dokumenten-Text für hochpräzise und schnelle LLM-Analysen.
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
 * Bereinigt rohen PDF- oder Dokumenten-Text von Binärmüll, Bild-Headern und Grafiktags.
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
    // 1. Entferne Base64-Codierungen oder Bild-Stream-Reste aus PDFs
    .replace(/\/Im\d+\s+Do/g, "")
    .replace(/data:image\/[a-zA-Z]+;base64,[^\s]+/g, "[BILD-DATEN ENTFERNT]")
    // 2. Entferne überschüssige Steuerzeichen, Hex-Artefakte und Null-Bytes
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    // 3. Normalisiere mehrfache Leerzeichen und Zeilenumbrüche (reduziert Dateigröße drastisch)
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n/g, "\n")
    .trim();

  // 4. Intelligenter Keyword-Filter, falls das Dokument zu groß ist
  if (
    config.preserveFinancialKeywords &&
    cleaned.length > (config.maxLength || 15000)
  ) {
    cleaned = smartExtractRelevantSections(cleaned, config.maxLength || 15000);
  } else if (cleaned.length > (config.maxLength || 15000)) {
    cleaned = cleaned.substring(0, config.maxLength);
  }

  console.log(
    `🧹 [Sanitizer] Dokument erfolgreich bereinigt. Finale Länge: ${cleaned.length} Zeichen.`,
  );
  return cleaned;
}

/**
 * Filtert Abschnitte heraus, die für Immobilien- und WEG-Analysen relevant sind,
 * um den Text bei riesigen PDFs präzise zu straffen.
 */
function smartExtractRelevantSections(text: string, maxLength: number): string {
  const lines = text.split("\n");
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
    "WEG",
    "haftung",
    "kaufpreis",
    "rendite",
    "miete",
  ];

  const scoredLines = lines.map((line) => {
    const lower = line.toLowerCase();
    let score = 0;
    for (const keyword of priorityKeywords) {
      if (lower.includes(keyword)) score += 2;
    }
    // Allgemeine Sätze mit Zahlen bekommen ebenfalls Priorität (z.B. Beträge, Flächen)
    if (/\d+([.,]\d+)?\s*(€|eur|qm|m²|prozent|%)?/i.test(line)) {
      score += 1;
    }
    return { line, score };
  });

  // Sortiere nach Relevanz, behalte aber die Reihenfolge grob bei oder nimm Top-Treffer
  const filtered = scoredLines
    .filter((item) => item.score > 0 || item.line.length > 50)
    .map((item) => item.line);

  const result = filtered.join("\n");

  if (result.length > maxLength) {
    return result.substring(0, maxLength);
  }

  return result.length > 500 ? result : text.substring(0, maxLength);
}
