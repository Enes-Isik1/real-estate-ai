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
    // 1. Direkt am Anfang authentifizieren und Loggen
    const supabaseClient = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    console.log("🔍 DEBUG AUTH IN ROUTE:", {
      userId: user?.id,
      email: user?.email,
      error: userError,
    });

    if (userError || !user) {
      return NextResponse.json(
        { error: "Nicht autorisiert. Bitte loggen Sie sich ein." },
        { status: 401 },
      );
    }

    const formData = await request.formData();

    // 1. Formulardaten (Titel, Mandant, E-Mail) aus dem FormData auslesen
    const formTitle = formData.get("title")?.toString().trim();
    const formClientName = formData.get("clientName")?.toString().trim();
    const formClientEmail = formData.get("clientEmail")?.toString().trim();

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

    // --- OPTIMIERTES PARALLELES PDF-PARSEN FÜR ENTERPRISE PERFORMANCE ---
    const fileProcessingPromises = files.map(async (file) => {
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`Datei ${file.name} ist zu groß (max 10MB).`);
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
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

    for (const result of results) {
      if (!result) continue;

      const { name, text: rawText } = result;
      fileNames.push(name);

      const pages = rawText.split(/\f/);

      if (pages.length > 1) {
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

    const coreAnalysis = await analyzeCoreData(structuredContext);

    console.log(
      `⚡ KI-Analyse erfolgreich in ${Date.now() - startTime}ms abgeschlossen.`,
    );

    const sanitizedLeadScore = Math.round(Number(coreAnalysis.leadScore) || 50);
    const finalStatus = sanitizedLeadScore > 70 ? "Ready" : "Needs Review";

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

    // Intelligenter Fallback für den Deal-Titel (Nimmt den Formulartitel oder den Dateinamen)
    const fallbackTitle = fileNames[0]
      ? fileNames[0].replace(/\.[^/.]+$/, "")
      : "Neue Immobilie";
    const finalDealTitle = formTitle || fallbackTitle;

    const propertyAsset: PropertyAsset = {
      id: crypto.randomUUID(),
      name: finalDealTitle,
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

    // 2. Neuen Deal in Supabase anlegen INKL. Titel, Kundendaten und user_id
    const { data: newDeal, error: dealError } = await supabaseAdmin
      .from("deals")
      .insert([
        {
          title: finalDealTitle,
          status: "Analyzing",
          user_id: user.id,
          client_name: formClientName || "Mandant",
          client_email: formClientEmail || "kontakt@dealpilot.ai",
        },
      ])
      .select()
      .single();

    if (dealError) {
      console.error(
        "🔥 Fehler beim Speichern des Deals in Supabase:",
        dealError,
      );
      throw new Error(
        "Datenbankfehler beim Anlegen des Deals: " + dealError.message,
      );
    }

    const dealId = newDeal.id;

    if (dealId) {
      // 3. Job-Eintrag registrieren
      await supabaseAdmin.from("jobs").insert([
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

      await supabaseAdmin.from("documents").insert(documentInserts);

      // 5. Versionsnummer ermitteln
      const { count: existingAnalysesCount } = await supabaseAdmin
        .from("analyses")
        .select("*", { count: "exact", head: true })
        .eq("deal_id", dealId);

      const nextVersion = (existingAnalysesCount || 0) + 1;

      // 6. Analyseergebnis speichern
      const { data: savedAnalysis } = await supabaseAdmin
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

        await supabaseAdmin.from("risks").insert(riskInserts);
      }
    }

    propertyAsset.id = dealId;

    await supabaseAdmin
      .from("deals")
      .update({ status: finalStatus })
      .eq("id", dealId);

    propertyAsset.decisionCenter.status = finalStatus;

    return NextResponse.json({
      success: true,
      property: propertyAsset,
      chunks: allChunks,
    });
  } catch (error: any) {
    console.error("🔥 KRITISCHER API-FEHLER:", error);

    let errorMessage =
      "Die Analyse konnte nicht abgeschlossen werden. Bitte versuchen Sie es erneut.";

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
