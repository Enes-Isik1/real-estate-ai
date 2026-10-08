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

    // Formulardaten auslesen
    const formTitle = formData.get("title")?.toString().trim();
    const formClientName = formData.get("clientName")?.toString().trim();
    const formClientEmail = formData.get("clientEmail")?.toString().trim();
    const existingDealId = formData.get("dealId")?.toString().trim();

    // Wir fangen sowohl "file" als auch "files" ab
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
    const fileNames: string[] = [];
    const allChunks: any[] = [];
    const fileBuffers: { name: string; buffer: Buffer; type: string }[] = [];

    // --- OPTIMIERTES PARALLELES PDF-PARSEN & BUFFER SPEICHERN ---
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
        buffer,
        type: file.type || "application/pdf",
        text: pdfData.text || "",
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

    console.log("🚀 Starte Blitz-Analyse mit der KI...");
    const startTime = Date.now();

    let coreAnalysis;
    try {
      coreAnalysis = await analyzeCoreData(structuredContext);
    } catch (aiError: any) {
      console.error("🔥 KI-Modell Fehler:", aiError);
      return NextResponse.json(
        {
          error:
            "Die KI-Analyse ist fehlgeschlagen. Bitte versuchen Sie es erneut.",
        },
        { status: 500 },
      );
    }

    if (!coreAnalysis || typeof coreAnalysis.leadScore !== "number") {
      return NextResponse.json(
        {
          error:
            "Die KI konnte kein valides Analyseergebnis generieren. Bitte versuchen Sie es erneut.",
        },
        { status: 500 },
      );
    }

    console.log(
      `⚡ KI-Analyse erfolgreich in ${Date.now() - startTime}ms abgeschlossen.`,
    );

    const sanitizedLeadScore = Math.round(Number(coreAnalysis.leadScore) || 50);
    const finalStatus = sanitizedLeadScore > 70 ? "Ready" : "Needs Review";

    // --- PUNKT 15: TRANSPARENTER MULTI-FAKTOR DEAL SCORE ---
    // Berechnung der Teil-Scores basierend auf den Analyseergebnissen
    const riskCount = (coreAnalysis.topRisks || []).length;
    const missingCount = (coreAnalysis.missingDocuments || []).length;
    const conflictCount = (coreAnalysis.crossDocumentConflicts || []).length;

    const documentCompletenessScore = Math.max(20, 100 - missingCount * 20);
    const riskSafetyScore = Math.max(
      10,
      100 - riskCount * 15 - conflictCount * 25,
    );
    const legalComplianceScore =
      conflictCount === 0 ? 95 : Math.max(30, 95 - conflictCount * 30);
    const financialClarityScore = sanitizedLeadScore; // Basiswert

    const multiFactorScore = {
      overallScore: sanitizedLeadScore,
      breakdown: {
        documentCompleteness: {
          score: documentCompletenessScore,
          weight: "30%",
          label: "Unterlagen-Vollständigkeit",
          description:
            missingCount === 0
              ? "Alle Pflichtdokumente vorhanden."
              : `${missingCount} Dokument(e) fehlen noch.`,
        },
        riskSafety: {
          score: riskSafetyScore,
          weight: "30%",
          label: "Risiko- & Lastenfreiheit",
          description:
            riskCount === 0
              ? "Keine schweren Lasten oder Risiken."
              : `${riskCount} potenzielle Risiken identifiziert.`,
        },
        legalCompliance: {
          score: legalComplianceScore,
          weight: "20%",
          label: "Rechtliche Konsistenz",
          description:
            conflictCount === 0
              ? "Keine Widersprüche in den Akten."
              : `${conflictCount} Widerspruch/-sprüche zwischen Dokumenten.`,
        },
        financialClarity: {
          score: financialClarityScore,
          weight: "20%",
          label: "Deal-Attraktivität & Rendite",
          description: "Basierend auf Kaufpreis, Objektzustand und Marktdaten.",
        },
      },
    };

    const aiAnalysis = {
      leadScore: sanitizedLeadScore,
      multiFactorScore, // Hinzugefügt für Punkt 15
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

    let dealId = existingDealId || null;
    let finalDealTitle = formTitle || "Neue Immobilie";

    if (dealId) {
      console.log(`🔄 Aktualisiere bestehenden Deal ID: ${dealId}`);
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

      // Status während der neuen Analyse auf "Analyzing" setzen
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
        console.error(
          "🔥 Fehler beim Speichern des Deals in Supabase:",
          dealError,
        );
        throw new Error(
          "Datenbankfehler beim Anlegen des Deals: " + dealError.message,
        );
      }

      dealId = newDeal.id;

      await supabaseAdmin.from("jobs").insert([
        {
          deal_id: dealId,
          status: "completed",
        },
      ]);
    }

    if (dealId) {
      // --- PUNKT 14: SUPABASE STORAGE UPLOAD FÜR ORIGINAL-PDFs ---
      const documentInserts = [];
      const bucketName = "deal-documents"; // Stelle sicher, dass dieser Bucket in Supabase existiert

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
        } else {
          console.warn(
            `⚠️ Supabase Storage Upload Warnung für ${fileObj.name}:`,
            storageError.message,
          );
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

      await supabaseAdmin.from("documents").insert(documentInserts);

      // Versionsnummer ermitteln
      const { count: existingAnalysesCount } = await supabaseAdmin
        .from("analyses")
        .select("*", { count: "exact", head: true })
        .eq("deal_id", dealId);

      const nextVersion = (existingAnalysesCount || 0) + 1;

      // Analyseergebnis speichern
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

      if (analysisError) {
        console.error("🔥 Fehler beim Speichern der Analyse:", analysisError);
        throw analysisError;
      }

      // Risiken abspeichern
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
    }

    await supabaseAdmin
      .from("deals")
      .update({ status: finalStatus })
      .eq("id", dealId);

    const propertyAsset: PropertyAsset = {
      id: dealId!,
      name: finalDealTitle,
      createdAt: new Date().toISOString(),
      files: fileNames,
      analysis: aiAnalysis,
      timeline: aiAnalysis.timeline || [],
      decisionCenter: {
        score: sanitizedLeadScore,
        status: finalStatus,
        summary: aiAnalysis.overallRecommendation,
      },
    };

    return NextResponse.json({
      success: true,
      property: propertyAsset,
      chunks: allChunks,
    });
  } catch (error: any) {
    console.error("🔥 KRITISCHER API-FEHLER:", error);

    let errorMessage =
      "Die Analyse konnte nicht abgeschlossen werden. Bitte versuchen Sie es erneut.";

    if (error?.status === 429) {
      errorMessage =
        "Der KI-Dienst ist derzeit überlastet. Bitte versuchen Sie es in wenigen Minuten erneut.";
    } else if (error?.message) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
