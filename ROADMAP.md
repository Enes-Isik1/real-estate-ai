# DealPilot - Roadmap Phase 2 (Manager Feedback)

## ✉️ 1. Suggested Reply (Interaktivität)
- **Edit-Modus:** Text direkt in einer Textarea bearbeitbar machen.
- **Regenerate-Button:** KI-Anweisung für andere Tonfälle (z. B. "Formeller", "Direkter").

## 🏷️ 2. Missing Documents (Granularität)
- **Confidence Score:** Prozentuale Sicherheit der KI anzeigen.
- **Kategorisierung:** - 🛑 `Required` (Energieausweis etc.)
  - ⚠️ `Recommended` (Grundriss etc.)
  - ℹ️ `Optional`

## 🛡️ 3. Document Audit (Belegbarkeit / Anti-Halluzination)
- **Risk Cards** ausbauen mit:
  - Exakter Seitenzahl im PDF (z. B. *"Gefunden auf Seite 42"*).
  - Schweregrad (`High`, `Medium`, `Low`).
  - KI-Erklärung (Warum ist das ein Risiko?).

## 📊 4. Engine-Leistungsleiste (Footer-Statistiken)
- Kleine Statistik-Leiste unter der Analyse hinzufügen:
  - AI Confidence: `92%`
  - Processing Time: `3.4 s`
  - Documents: `8 analyzed`
  - Pages: `214`
  - Clauses: `142 extracted`
  Kleine Verbesserungen (nicht Blocker)

Ich würde später ergänzen:

1.

Bei jedem Risiko

einen kleinen Button

View Source →

Später springt der Benutzer direkt auf Seite 84.

2.

Oben

über den Risks

eine kleine Zusammenfassung

AI found

3 Risks

4 Recommendations

214 Pages analyzed

96% confidence

Das erhöht den Premium-Eindruck.

3.

High Risk

könnte links zusätzlich

ein kleines Warnsymbol bekommen.

Nicht notwendig.

Nur Feinschliff.

# 🗺️ DealPilot Technical Roadmap: Vom UI-Mockup zur echten AI-Pipeline

## 🎯 Tagesziel: Real-World Data Flow
**Ein Makler lädt eine echte PDF hoch -> DealPilot extrahiert den Text -> Die KI analysiert den Inhalt -> Die KI gibt strukturiertes JSON zurück -> Dashboard & Analyse-Seite zeigen diese echten Daten an.**

---

## 🛠️ To-Do-Liste & Technische Meilensteine

### 1. Backend-Infrastruktur & API-Route aufbauen
* [ ] **API-Route erstellen:** Einen API-Endpunkt unter `app/api/analyze/route.ts` anlegen, der `multipart/form-data` (PDF-Uploads) entgegennehmen kann.
* [ ] **PDF-Parser installieren:** Ein verlässliches Node.js-Paket zur Textextraktion hinzufügen (z. B. `pdf-parse` oder `pdf-to-text`).
* [ ] **Textextraktions-Logik schreiben:** Den hochgeladenen Puffer (Buffer) auslesen, in rohen String-Text konvertieren und Validierungen einbauen (z. B. Dateigrößen-Limit, Prüfung auf leere/verschlüsselte PDFs).

### 2. LLM-Integration & JSON-Strukturierung (Structured Outputs)
* [ ] **AI-SDK einbinden:** OpenAI- oder Anthropic-Client im Backend initialisieren.
* [ ] **System-Prompt definieren:** Einen präzisen Prompt verfassen, der die AI anweist, Immobilien-Dokumente (WEG-Protokolle, Energieausweise, etc.) gezielt nach Risiken, fehlenden Dokumenten und Deal-Faktoren zu durchsuchen.
* [ ] **JSON-Schema festlegen:** Die API zwingen (z. B. via `response_format: { type: "json_object" }` oder Zod-Validierung), exakt die Datenstruktur zurückzugeben, die das UI benötigt:
  ```json
  {
    "title": "Extrahierter Objektname",
    "price": "Extrahierter Preis",
    "score": 92,
    "status": "Reviewing",
    "summary": "Executive Summary Text...",
    "risks": [
      { "level": "High", "title": "...", "page": 84, "confidence": 96, "whyItMatters": "..." }
    ],
    "missingDocuments": ["Energy Certificate", "Floor Plan"],
    "sellerQuestions": [
      { "question": "...", "context": "..." }
    ]
  }
  ## Roadmap & Refactoring Plan

### 1. Datenverarbeitung (Optimization)
*   **Aktueller Stand:** `substring(0, 40000)` als einfacher Workaround.
*   **Geplante Upgrades:**
    *   Implementierung von intelligentem **Chunking** zur besseren Segmentierung langer Dokumente.
    *   Einführung von **Embeddings** für semantisches Verständnis.
    *   Aufbau einer **RAG-Pipeline** (Retrieval-Augmented Generation), um kontextabhängig auf Dokumententeile zuzugreifen.

### 2. Schema-Erweiterung (`AnalysisSchema`)
*   Das `AnalysisSchema` in `route.ts` ist solide, soll aber um folgende Felder erweitert werden, um Skalierbarkeit für zukünftige Features zu gewährleisten:
    *   `confidenceScore` (Gesamtbewertung der Sicherheit der Analyse)
    *   `sourcePages` (Referenzierung der genutzten Seitenzahlen im gesamten Schema)
    *   `missingInformation` (Explizite Auflistung nicht auffindbarer, aber relevanter Daten)
    *   `verificationRequired` (Flag, ob ein Mensch über die Daten schauen muss)
    *   `overallRecommendation` (Zusammenfassende Handlungsempfehlung)

### 3. Architektur & State Management
*   **`analysis.ts`:** Fokus liegt hier auf dem Übergang von reinem Frontend-Handling hin zu einer robusten Produktlogik.
*   **`page.tsx`:** 
    *   Geplante Entkopplung: Derzeit kennt die Seite zu viele Details der Datenstruktur.
    *   **Ziel:** Einführung eines `AnalysisProvider` oder `AnalysisContext`, um die `page.tsx` zu entschlacken und das State Management zentral zu steuern.

---
*Status: In Bearbeitung. Fokus liegt derzeit auf Stabilität der API-Analyse.*