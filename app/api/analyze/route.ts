// app/api/analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-parse-fork";
import { PropertyAsset } from "@/lib/types/analysis";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { analyzeCoreData, calculateMultiFactorScore } from "@/lib/ai-engine";
import { createClient } from "@/lib/utils/supabase/server";
import * as Sentry from "@sentry/nextjs";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB Limit

/**
 * Enterprise Asynchrones Background-Processing für Analysen
 */
async function processAnalysisInBackground(
  jobId: string,
  dealId: string,
  structuredContext: string,
  fileBuffers: { name: string; buffer: Buffer; type: string }[],
  user: any,
  fileNames: string[],
  allChunks: any[],
  finalDealTitle: string,
) {
  try {
    console.log(`[Job ${jobId}] 🚀 Starte Hintergrund-Analyse...`);

    // 1. Job-Status auf "processing" setzen
    await supabaseAdmin
      .from("jobs")
      .update({ status: "processing", updated_at: new Date().toISOString() })
      .eq("id", jobId);

    // 2. KI-Analyse mit sicherem Context aufrufen
    const safeStructuredContext =
      structuredContext.length > 8000
        ? structuredContext.substring(0, 8000)
        : structuredContext;

    console.log(
      `[Job ${jobId}] 📄 Sende Context mit Länge ${safeStructuredContext.length} an KI...`,
    );

    const coreAnalysis = await analyzeCoreData(safeStructuredContext);

    if (!coreAnalysis || typeof coreAnalysis.leadScore !== "number") {
      throw new Error("Valide KI-Analyse konnte nicht generiert werden.");
    }

    const sanitizedLeadScore = Math.round(Number(coreAnalysis.leadScore));
    const finalStatus = sanitizedLeadScore > 70 ? "Ready" : "Needs Review";

    // 3. Multi-Faktor Sub-Scores zentral berechnen (Single Source of Truth)
    const multiFactorScore = calculateMultiFactorScore(coreAnalysis);

    const aiAnalysis = {
      leadScore: sanitizedLeadScore,
      multiFactorScore,
      executiveSummary:
        coreAnalysis.executiveSummary || "Keine Zusammenfassung verfügbar.",
      overallRecommendation:
        coreAnalysis.overallRecommendation || "Solides Objekt.",
      confidence: coreAnalysis.confidence || 0.9,
      verificationRequired: coreAnalysis.verificationRequired || false,
      topRisks: coreAnalysis.topRisks || [],
      crossDocumentConflicts: coreAnalysis.crossDocumentConflicts || [],
      nextActions: coreAnalysis.nextActions || [],
      positiveFindings: coreAnalysis.positiveFindings || [],
      missingDocuments: coreAnalysis.missingDocuments || [],
      negotiationPoints: coreAnalysis.negotiationPoints || [],
      sellerQuestions: coreAnalysis.sellerQuestions || [],
      timeline: coreAnalysis.timeline || [],
    };

    // 4. Dokumente in Storage & DB verankern
    const documentInserts = [];
    const bucketName = "deal-documents";

    for (const fileObj of fileBuffers) {
      const uniqueFileName = `${dealId}/${Date.now()}_${fileObj.name}`;

      const { error: storageError } = await supabaseAdmin.storage
        .from(bucketName)
        .upload(uniqueFileName, fileObj.buffer, {
          contentType: fileObj.type,
          upsert: true,
        });

      let publicUrl = null;
      if (!storageError) {
        const { data: urlData } = supabaseAdmin.storage
          .from(bucketName)
          .getPublicUrl(uniqueFileName);
        publicUrl = urlData?.publicUrl || null;
      }

      const matchedDoc = coreAnalysis.classifiedDocuments?.find(
        (d: any) => d.filename === fileObj.name,
      );

      documentInserts.push({
        deal_id: dealId,
        filename: fileObj.name,
        document_type: matchedDoc?.detectedType || "Sonstiges",
        storage_path: uniqueFileName,
        public_url: publicUrl,
        upload_date: new Date().toISOString(),
      });
    }

    if (documentInserts.length > 0) {
      await supabaseAdmin.from("documents").insert(documentInserts);
    }

    // 5. Analyse in DB speichern
    const { count: existingAnalysesCount } = await supabaseAdmin
      .from("analyses")
      .select("*", { count: "exact", head: true })
      .eq("deal_id", dealId);

    const nextVersion = (existingAnalysesCount || 0) + 1;

    const { data: savedAnalysis, error: analysisError } = await supabaseAdmin
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

    if (analysisError) throw analysisError;

    // 6. Risiken speichern
    if (
      aiAnalysis.topRisks &&
      aiAnalysis.topRisks.length > 0 &&
      savedAnalysis
    ) {
      const riskInserts = aiAnalysis.topRisks.map((risk: any) => {
        const rawPage = risk.source?.pageNumber || risk.page || 1;
        const parsedPage =
          typeof rawPage === "number" ? rawPage : parseInt(rawPage);

        return {
          analysis_id: savedAnalysis.id,
          deal_id: dealId,
          severity: risk.severity || "Medium",
          title: risk.title,
          why_it_matters: risk.whyItMatters,
          confidence: risk.confidence || 90,
          page_number: isNaN(parsedPage) ? 1 : parsedPage,
        };
      });

      await supabaseAdmin.from("risks").insert(riskInserts);
    }

    // 7. Deal Status aktualisieren
    await supabaseAdmin
      .from("deals")
      .update({ status: finalStatus })
      .eq("id", dealId);

    // 8. Job als abgeschlossen markieren
    await supabaseAdmin
      .from("jobs")
      .update({
        status: "completed",
        result: {
          dealId,
          leadScore: sanitizedLeadScore,
          status: finalStatus,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    console.log(
      `[Job ${jobId}] ✅ Hintergrund-Analyse ERFOLGREICH abgeschlossen mit Score: ${sanitizedLeadScore}`,
    );
  } catch (err: any) {
    console.error(`[Job ${jobId}] 🔥 FEHLER in Hintergrund-Analyse:`, err);
    Sentry.captureException(err);

    await supabaseAdmin
      .from("deals")
      .update({ status: "Error" })
      .eq("id", dealId);

    await supabaseAdmin
      .from("jobs")
      .update({
        status: "failed",
        error_message: err?.message || "Analyse fehlgeschlagen.",
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabaseClient = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Nicht autorisiert. Bitte loggen Sie sich ein." },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const formTitle = formData.get("title")?.toString().trim();
    const formClientName = formData.get("clientName")?.toString().trim();
    const formClientEmail = formData.get("clientEmail")?.toString().trim();
    const existingDealId = formData.get("dealId")?.toString().trim();

    const rawFiles =
      formData.getAll("file").length > 0
        ? formData.getAll("file")
        : formData.getAll("files");

    const files = rawFiles as File[];

    if (files.length === 0) {
      return NextResponse.json(
        { error: "Keine Dateien hochgeladen." },
        { status: 400 },
      );
    }

    let structuredContext = "";
    const fileNames: string[] = [];
    const allChunks: any[] = [];
    const fileBuffers: { name: string; buffer: Buffer; type: string }[] = [];

    // Paralleles PDF-Parsing
    const fileProcessingPromises = files.map(async (file) => {
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`Datei ${file.name} ist zu groß (max 10MB).`);
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileHeader = buffer.toString("utf8", 0, 20);

      if (!fileHeader.includes("PDF") && !fileHeader.includes("pdf")) {
        return null;
      }

      let parsedText = "";
      try {
        const pdfData = await pdf(buffer);
        parsedText = pdfData.text || "";
      } catch (pdfErr) {
        console.warn(`⚠️ Warnung beim Lesen von ${file.name}:`, pdfErr);
      }

      // Falls kein Text extrahiert werden konnte (z.B. reiner Scan oder schreibgeschützt)
      if (!parsedText || parsedText.trim().length < 20) {
        parsedText = `[HINWEIS: Aus der Datei ${file.name} konnte kein Fließtext extrahiert werden. Es handelt sich möglicherweise um einen Bild-Scan.]`;
      }

      return {
        name: file.name,
        buffer,
        type: file.type || "application/pdf",
        text: parsedText,
      };
    });

    const results = await Promise.all(fileProcessingPromises);

    for (const result of results) {
      if (!result) continue;

      const { name, buffer, type, text: rawText } = result;
      fileNames.push(name);
      fileBuffers.push({ name, buffer, type });

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

    let dealId = existingDealId || null;
    let finalDealTitle = formTitle || "Neue Immobilie";

    if (dealId) {
      const { data: existingDeal, error: fetchError } = await supabaseAdmin
        .from("deals")
        .select("title")
        .eq("id", dealId)
        .single();

      if (fetchError || !existingDeal) {
        return NextResponse.json(
          { error: "Der angegebene Deal wurde nicht gefunden." },
          { status: 404 },
        );
      }

      finalDealTitle = existingDeal.title;

      await supabaseAdmin
        .from("deals")
        .update({ status: "Analyzing" })
        .eq("id", dealId);
    } else {
      const fallbackTitle = fileNames[0]
        ? fileNames[0].replace(/\.[^/.]+$/, "")
        : "Neue Immobilie";
      finalDealTitle = formTitle || fallbackTitle;

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
        throw new Error("Datenbankfehler: " + dealError.message);
      }

      dealId = newDeal.id;
    }

    // 🚀 Job in Supabase anlegen
    const { data: job, error: jobError } = await supabaseAdmin
      .from("jobs")
      .insert([
        {
          deal_id: dealId,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (jobError) throw jobError;

    // ⚡ Vercel / Node echtes non-blocking Asynchronous Execution (OHNE await!)
    processAnalysisInBackground(
      job.id,
      dealId!,
      structuredContext,
      fileBuffers,
      user,
      fileNames,
      allChunks,
      finalDealTitle,
    ).catch((err) => {
      console.error(`[Job ${job.id}] Unhandled background error:`, err);
    });

    // 💥 Sofortige HTTP-Antwort in ~1 Sekunde an den Browser
    return NextResponse.json(
      {
        success: true,
        async: true,
        jobId: job.id,
        dealId: dealId,
        message: "Analyse wurde im Hintergrund gestartet.",
      },
      { status: 202 },
    );
  } catch (error: any) {
    console.error("🔥 KRITISCHER API-FEHLER:", error);
    Sentry.captureException(error);

    return NextResponse.json(
      { error: error?.message || "Fehler beim Starten der Analyse." },
      { status: 500 },
    );
  }
}
