// app/api/deals/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/utils/supabase/server"; // Server-Client für Auth-Kontext
import { supabaseAdmin } from "@/lib/supabase-admin"; // Nur für Admin-Operationen, falls nötig

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const dealId = resolvedParams.id;

    if (!dealId) {
      return NextResponse.json(
        { error: "Keine Deal-ID übergeben." },
        { status: 400 },
      );
    }

    // 1. Authentifizierung: Eingeloggten User über den Server-Client ermitteln
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Nicht autorisiert (Unauthorized)." },
        { status: 401 },
      );
    }

    // 2. IDOR-Schutz: Deal abrufen UND zwingend gegen die user_id des Users prüfen
    const { data: deal, error: dealError } = await supabaseAdmin
      .from("deals")
      .select("*")
      .eq("id", dealId)
      .eq("user_id", user.id) // <-- Enterprise IDOR-Schutz
      .single();

    if (dealError || !deal) {
      return NextResponse.json(
        { error: "Zugriff verweigert oder Deal nicht gefunden." },
        { status: 403 },
      );
    }

    // 3. Zugehörige Analyse abrufen (da der Deal dem User gehört, sind diese verknüpften Daten sicher)
    const { data: analysis } = await supabaseAdmin
      .from("analyses")
      .select("*")
      .eq("deal_id", dealId)
      .order("version", { ascending: false })
      .maybeSingle();

    // 4. Zugehörige Dokumente abrufen
    const { data: documents } = await supabaseAdmin
      .from("documents")
      .select("*")
      .eq("deal_id", dealId);

    // 5. In dein gewohntes PropertyAsset-Format mappen
    const aiAnalysis = analysis?.raw_json || {
      leadScore: 50,
      executiveSummary:
        analysis?.executive_summary ||
        "Analyse wird vorbereitet oder liegt noch nicht vor.",
      overallRecommendation: analysis?.overall_recommendation || "",
      topRisks: [],
      positiveFindings: [],
      missingDocuments: [],
      sellerQuestions: [],
    };

    const propertyAsset = {
      id: deal.id,
      name: deal.title || "Unbenannter Deal",
      createdAt: deal.created_at,
      files: documents ? documents.map((d: any) => d.filename) : [],
      analysis: aiAnalysis,
      timeline: [],
      decisionCenter: {
        score: analysis?.lead_score || 50,
        status: deal.status || "Reviewing",
        summary: deal.status || "",
      },
    };

    return NextResponse.json({ success: true, property: propertyAsset });
  } catch (error: any) {
    console.error("🔥 Fehler beim Laden des Deals:", error);
    return NextResponse.json(
      { error: error?.message || "Serverfehler" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const dealId = resolvedParams.id;

    if (!dealId) {
      return NextResponse.json(
        { success: false, error: "Keine Deal-ID übergeben." },
        { status: 400 },
      );
    }

    // 1. Authentifizierung: Eingeloggten User ermitteln
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Nicht autorisiert (Unauthorized)." },
        { status: 401 },
      );
    }

    // 2. IDOR-Schutz: Prüfen, ob der Deal existiert UND dem eingeloggten User gehört
    const { data: existingDeal, error: fetchError } = await supabaseAdmin
      .from("deals")
      .select("id")
      .eq("id", dealId)
      .eq("user_id", user.id) // <-- Verhindert das Löschen fremder Deals
      .single();

    if (fetchError || !existingDeal) {
      return NextResponse.json(
        {
          success: false,
          error: "Zugriff verweigert oder Deal nicht gefunden.",
        },
        { status: 403 },
      );
    }

    // 3. Zugehörige Analysen löschen
    await supabaseAdmin.from("analyses").delete().eq("deal_id", dealId);

    // 4. Zugehörige Dokumente löschen
    await supabaseAdmin.from("documents").delete().eq("deal_id", dealId);

    // 5. Deal selbst löschen (jetzt absolut sicher mit ID- und User-Prüfung)
    const { error } = await supabaseAdmin
      .from("deals")
      .delete()
      .eq("id", dealId)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("🔥 Fehler beim Löschen des Deals:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Serverfehler" },
      { status: 500 },
    );
  }
}
