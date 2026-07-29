// app/api/analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-parse-fork";
import { PropertyAsset } from "@/lib/types/analysis";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { analyzeCoreData } from "@/lib/ai-engine";
import { createClient } from "@/lib/utils/supabase/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Sicherheitspuffer für Next.js

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB Limit

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Wir fangen sowohl "file" als auch "files" ab, um jegliche Diskrepanzen zu verhindern
    const rawFiles =
      formData.getAll("file").length > 0
        ? formData.getAll("file")
        : formData.getAll("files");

    const files = rawFiles as File[];
    console.log("🔍 Anzahl gefundener Dateien im Backend:", files.length);

    if (files.length === 0) {
      return NextResponse.json(
        { error: "Keine Dateien hochgeladen." },
        { status: 400 },
      );
    }

    let structuredContext = "";
    const fileNames = [];
    const allChunks: any[] = []; // Hier sammeln wir alle echten Chunks mit Seitennummer

    // --- PARALLELES PDF-PARSEN FÜR MAXIMALE GESCHWINDIGKEIT ---
    const fileProcessingPromises = files.map(async (file) => {
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`Datei ${file.name} ist zu groß (max 10MB).`);
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const fileHeader = buffer.toString("utf8", 0, 20);

      if (!fileHeader.includes("PDF") && !fileHeader.includes("pdf")) {
        console.warn(
          `Überspringe Datei ${file.name}, da kein PDF-Header gefunden wurde.`,
        );
        return null;
      }

      const pdfData = await pdf(buffer);
      return {
        name: file.name,
        text: pdfData.text || "",
      };
    });

    const results = await Promise.all(fileProcessingPromises);

    // Ergebnisse verarbeiten und Chunks aufbauen
    for (const result of results) {
      if (!result) continue;

      const { name, text: rawText } = result;
      fileNames.push(name);

      // --- ENTERPRISE CHUNKING & SEITENERKENNUNG ---
      const pages = rawText.split(/\f/); // Trennung nach PDF-Seitenumbruch, falls vorhanden

      if (pages.length > 1) {
        // Echte seitenbasierte Schleife
        pages.forEach((pageText, pageIndex) => {
          const trimmed = pageText.trim();
          if (trimmed.length > 0) {
            const pageNum = pageIndex + 1;
            allChunks.push({
              id: crypto.randomUUID(),
              documentName: name,
              text: trimmed,
              pageNumber: pageNum,
            });
            structuredContext += `[DOKUMENT: ${name} | SEITE ${pageNum}]\n${trimmed}\n\n`;
          }
        });
      } else {
        // Fallback: Intelligentes Block-Chunking, falls keine harten Seitenumbrüche da sind
        const chunkSize = 2000;
        for (let i = 0; i < rawText.length; i += chunkSize) {
          const chunkText = rawText.substring(i, i + chunkSize);
          const estimatedPage = Math.floor(i / chunkSize) + 1;
          allChunks.push({
            id: crypto.randomUUID(),
            documentName: name,
            text: chunkText,
            pageNumber: estimatedPage,
          });
          structuredContext += `[DOKUMENT: ${name} | BLOCK ${estimatedPage}]\n${chunkText}\n\n`;
        }
      }
    }

    if (fileNames.length === 0) {
      return NextResponse.json(
        { error: "Keine gültigen PDFs gefunden." },
        { status: 400 },
      );
    }

    console.log("🚀 Starte Blitz-Analyse mit der KI...");
    const startTime = Date.now();

    // KI-AUFRUF mit dem vollständigen, strukturierten Kontext aller Seiten
    const coreAnalysis = await analyzeCoreData(structuredContext);

    console.log(
      `⚡ KI-Analyse erfolgreich in ${Date.now() - startTime}ms abgeschlossen.`,
    );

    const sanitizedLeadScore = Math.round(Number(coreAnalysis.leadScore) || 50);
    const finalStatus = sanitizedLeadScore > 70 ? "Ready" : "Needs Review";

    // Einheitliches Analyse-Objekt für das Frontend
    const aiAnalysis = {
      leadScore: sanitizedLeadScore,
      executiveSummary:
        coreAnalysis.executiveSummary || "Keine Zusammenfassung verfügbar.",
      overallRecommendation:
        coreAnalysis.overallRecommendation || "Solides Objekt.",
      confidence: 8,
      verificationRequired: false,
      topRisks: coreAnalysis.topRisks || [],
      crossDocumentConflicts: [],
      positiveFindings: coreAnalysis.positiveFindings || [],
      missingDocuments: coreAnalysis.missingDocuments || [],
      negotiationPoints: coreAnalysis.negotiationPoints || [],
      sellerQuestions: [],
      timeline: [],
    };

    const propertyAsset: PropertyAsset = {
      id: crypto.randomUUID(),
      name: fileNames[0]
        ? fileNames[0].replace(/\.[^/.]+$/, "")
        : "Neue Immobilie",
      createdAt: new Date().toISOString(),
      files: fileNames,
      analysis: aiAnalysis,
      timeline: [],
      decisionCenter: {
        score: sanitizedLeadScore,
        status: finalStatus,
        summary: aiAnalysis.overallRecommendation,
      },
    };

    // 1. Supabase Server-Client initialisieren, um den eingeloggten User zu ermitteln
    const supabase = await createClient(); // (Stelle sicher, dass du createClient von "@/utils/supabase/server" oben importierst)

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Nicht autorisiert. Bitte loggen Sie sich ein." },
        { status: 401 },
      );
    }

    // 2. Neuen Deal in Supabase anlegen INKL. user_id
    const { data: newDeal, error: dealError } = await supabase
      .from("deals")
      .insert([
        {
          title: propertyAsset.name,
          status: "Analyzing",
          user_id: user.id, // <-- HIER WIRD DIE USER-ID JETZT SAUBER GESPEICHERT!
        },
      ])
      .select()
      .single();

    if (dealError) {
      console.error("Fehler beim Speichern des Deals:", dealError);
    }

    const dealId = newDeal?.id;

    if (dealId) {
      // 3. Job-Eintrag registrieren
      await supabase.from("jobs").insert([
        {
          deal_id: dealId,
          status: "completed",
        },
      ]);

      // 4. Zugehörige Dokumente speichern
      const documentInserts = fileNames.map((fileName) => ({
        deal_id: dealId,
        filename: fileName,
        document_type: "Unbekannt",
        upload_date: new Date().toISOString(),
      }));

      await supabase.from("documents").insert(documentInserts);

      // 5. Versionsnummer ermitteln
      const { count: existingAnalysesCount } = await supabase
        .from("analyses")
        .select("*", { count: "exact", head: true })
        .eq("deal_id", dealId);

      const nextVersion = (existingAnalysesCount || 0) + 1;

      // 6. Analyseergebnis speichern
      const { data: savedAnalysis } = await supabase
        .from("analyses")
        .insert([
          {
            deal_id: dealId,
            version: nextVersion,
            lead_score: sanitizedLeadScore,
            executive_summary: aiAnalysis.executiveSummary,
            overall_recommendation: aiAnalysis.overallRecommendation,
            raw_json: aiAnalysis,
          },
        ])
        .select()
        .single();

      // 7. Risiken abspeichern
      if (
        aiAnalysis.topRisks &&
        aiAnalysis.topRisks.length > 0 &&
        savedAnalysis
      ) {
        const riskInserts = aiAnalysis.topRisks.map((risk: any) => ({
          analysis_id: savedAnalysis.id,
          deal_id: dealId,
          severity: risk.severity || "Medium",
          title: risk.title,
          why_it_matters: risk.whyItMatters,
          confidence: risk.confidence || 90,
          page_number: risk.source?.pageNumber || risk.page || 1,
        }));

        await supabase.from("risks").insert(riskInserts);
      }
    }

    propertyAsset.id = dealId || propertyAsset.id;

    await supabase
      .from("deals")
      .update({ status: finalStatus })
      .eq("id", dealId);

    propertyAsset.decisionCenter.status = finalStatus;

    return NextResponse.json({
      success: true,
      property: propertyAsset,
      chunks: allChunks, // Hier werden nun die echten, seitenbasierten Chunks übergeben
    });
  } catch (error: any) {
    console.error("🔥 KRITISCHER API-FEHLER:", error);

    let errorMessage =
      "Die Analyse konnte nicht abgeschlossen werden. Bitte versuchen Sie es erneut.";

    // Spezifische Übersetzung technischer Fehler für den Nutzer
    if (
      error?.message?.includes("API_KEY") ||
      error?.message?.includes("Gemini") ||
      error?.status === 429
    ) {
      errorMessage =
        "Der KI-Dienst ist derzeit überlastet oder nicht erreichbar. Bitte versuchen Sie es in wenigen Minuten erneut.";
    } else if (
      error?.message?.includes("Supabase") ||
      error?.code?.startsWith("PGRST")
    ) {
      errorMessage =
        "Datenbankfehler: Die Analyseergebnisse konnten nicht gespeichert werden.";
    } else if (
      error?.message &&
      !error.message.includes("JSON") &&
      !error.message.includes("fetch")
    ) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
