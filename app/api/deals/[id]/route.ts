// app/api/deals/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // In Next.js 15+ müssen params gepatched/awaitet werden
    const resolvedParams = await params;
    const dealId = resolvedParams.id;

    if (!dealId) {
      return NextResponse.json({ error: "Keine Deal-ID übergeben." }, { status: 400 });
    }

    // 1. Deal abrufen
    const { data: deal, error: dealError } = await supabaseAdmin
      .from('deals')
      .select('*')
      .eq('id', dealId)
      .single();

    if (dealError || !deal) {
      return NextResponse.json({ error: "Deal nicht gefunden." }, { status: 404 });
    }

    // 2. Zugehörige Analyse abrufen (neueste Version zuerst)
    const { data: analysis } = await supabaseAdmin
      .from('analyses')
      .select('*')
      .eq('deal_id', dealId)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    // 3. Zugehörige Dokumente abrufen
    const { data: documents } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('deal_id', dealId);

    // 4. In unser gewohntes PropertyAsset-Format mappen
    const aiAnalysis = analysis?.raw_json || {
      leadScore: 50,
      executiveSummary: analysis?.executive_summary || "",
      overallRecommendation: analysis?.overall_recommendation || "",
      topRisks: [],
      positiveFindings: [],
      missingDocuments: [],
      sellerQuestions: [],
    };

    const propertyAsset = {
      id: deal.id,
      name: deal.title,
      createdAt: deal.created_at,
      files: documents ? documents.map((d: any) => d.filename) : [],
      analysis: aiAnalysis,
      timeline: [],
      decisionCenter: {
        score: analysis?.lead_score || 50,
        status: deal.status || "Reviewing",
        summary: deal.status
      }
    };

    return NextResponse.json({ success: true, property: propertyAsset });

  } catch (error: any) {
    console.error("🔥 Fehler beim Laden des Deals:", error);
    return NextResponse.json({ error: error?.message || "Serverfehler" }, { status: 500 });
  }
}