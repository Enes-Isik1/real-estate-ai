// lib/pdf-sanitizer.ts

/**
 * Enterprise-Level PDF & Text Sanitizer
 * Spezialisiert auf WEG-Protokolle, Teilungserklärungen und Immobilien-Unterlagen.
 * Entfernt OCR-Müll, stellt Worttrennungen wieder her und bewahrt die Dokumentenstruktur.
 */

export interface SanitizerOptions {
  maxLength?: number;
  preserveFinancialKeywords?: boolean;
  preserveDocumentHeader?: boolean;
}

const DEFAULT_OPTIONS: SanitizerOptions = {
  maxLength: 25000, // Token-Sicheres Kontextfenster für moderne LLMs
  preserveFinancialKeywords: true,
  preserveDocumentHeader: true,
};

/**
 * Bereinigt rohen PDF- oder Dokumenten-Text von Binärmüll, OCR-Fehlern und Ligatur-Schäden.
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
    // 3. OCR-Fix: Wörter reparieren, die am Zeilenende mit Bindestrich getrennt wurden
    .replace(/(\b[a-zäöüß]+)-\s*\n\s*([a-zäöüß]+\b)/gi, "$1$2")
    // 4. Entferne unsichtbare Steuerzeichen, Zero-Width-Spaces, Soft-Hyphens und Null-Bytes
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F\u00AD\u200B-\u200D\uFEFF]/g, "")
    // 5. Bereinige typische PDF-Kopf-/Fußzeilen-Artefakte (z.B. "Seite X von Y", Header-Dateipfade)
    .replace(/Seite\s+\d+\s+(von||\/)\s+\d+/gi, "")
    .replace(/[\w.-]+@[\w.-]+\.\w+/g, "[E-MAIL ENTFERNT]") // Schutz sensibler Daten
    // 6. Normalisiere waagerechte Leerzeichen (behält Zeilenumbrüche für Tabellen bei)
    .replace(/[ \t]{2,}/g, " ")
    // 7. Reduziere mehrfache Zeilenumbrüche auf maximal zwei (Absatz-Formatierung erhalten)
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();

  // 8. Intelligentes Smart-Extract, falls die Maximallänge überschritten wird
  const limit = config.maxLength || 25000;
  if (config.preserveFinancialKeywords && cleaned.length > limit) {
    cleaned = smartExtractRelevantParagraphs(
      cleaned,
      limit,
      config.preserveDocumentHeader,
    );
  } else if (cleaned.length > limit) {
    cleaned = cleaned.substring(0, limit);
  }

  console.log(
    `🧹 [Sanitizer] Dokument erfolgreich bereinigt. Finale Länge: ${cleaned.length} Zeichen.`,
  );
  return cleaned;
}

/**
 * Filtert Absätze auf Basis von WEG- und Immobilienspezifischen Metriken,
 * bewahrt jedoch ZWINGEND die ursprüngliche chronologische Reihenfolge im Dokument!
 */
function smartExtractRelevantParagraphs(
  text: string,
  maxLength: number,
  preserveHeader: boolean = true,
): string {
  const paragraphs = text.split(/\n\s*\n/);

  // Enterprise WEG- & Immobilien-Keyword-Satz
  const priorityKeywords = [
    "rücklage",
    "instandhaltung",
    "instandhaltungsrücklage",
    "wirtschaftsplan",
    "beschluss",
    "beschlusssammlung",
    "hausgeld",
    "sondernutzung",
    "sondernutzungsrecht",
    "teilungserklärung",
    "gemeinschaftseigentum",
    "sondereigentum",
    "schaden",
    "sanierung",
    "aufteilung",
    "euro",
    "€",
    "stimmen",
    "genehmigt",
    "abgelehnt",
    "ablehnung",
    "eigentümer",
    "eigentümerversammlung",
    "weg",
    "haftung",
    "kaufpreis",
    "rendite",
    "miete",
    "nebenkosten",
    "fläche",
    "m²",
    "sqm",
    "miteigentumsanteil",
    "mea",
    "sonderumlage",
    "verwalter",
    "beirat",
    "grundbuch",
    "lasten",
    "dienstbarkeit",
    "mietrückstand",
    "klage",
    "gerichtsverfahren",
  ];

  // Scoring jedes Absatzes mit Erfassung des ursprünglichen Index
  const indexedParagraphs = paragraphs.map((para, index) => {
    const lower = para.toLowerCase();
    let score = 0;

    // 🏆 Dokumentenkopf (erste 3 Absätze) automatisch höher gewichten
    if (preserveHeader && index < 3) {
      score += 10;
    }

    for (const keyword of priorityKeywords) {
      if (lower.includes(keyword)) score += 3;
    }

    // Zahlen, Beträge und Schlüsselwerte priorisieren
    if (
      /\d+([.,]\d+)?\s*(€|eur|qm|m²|prozent|%|\bgesamtkosten\b|\banteil\b|\bmea\b)/i.test(
        para,
      )
    ) {
      score += 3;
    }

    // Paragrafen & Beschluss-Nummern erkennen (z.B. "TOP 3", "§ 12")
    if (/(top\s*\d+|§\s*\d+|\bbeschluss\s*\d+)/i.test(para)) {
      score += 4;
    }

    return { index, paragraph: para.trim(), score, length: para.length };
  });

  // Nach Relevanz sortieren, um die WICHTIGSTEN Absätze auszuwählen
  const sortedByScore = [...indexedParagraphs].sort(
    (a, b) => b.score - a.score,
  );

  let accumulatedLength = 0;
  const selectedItems: typeof indexedParagraphs = [];

  for (const item of sortedByScore) {
    if (item.score <= 0 && item.paragraph.length < 30) continue; // Unwichtige Satzfragmente filtern

    if (accumulatedLength + item.length + 2 <= maxLength) {
      selectedItems.push(item);
      accumulatedLength += item.length + 2;
    } else {
      break;
    }
  }

  if (selectedItems.length === 0) {
    return text.substring(0, maxLength);
  }

  // 🛡️ REHYDRIERUNG: Sortiere die ausgewählten Absätze wieder nach ihrem URSPRÜNGLICHEN Index!
  selectedItems.sort((a, b) => a.index - b.index);

  return selectedItems.map((item) => item.paragraph).join("\n\n");
}
