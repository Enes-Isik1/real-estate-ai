import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const supabaseClient = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Nicht autorisiert." },
        { status: 401 },
      );
    }

    const { data: deals, error: dealsError } = await supabaseAdmin
      .from("deals")
      .select(
        `
        *,
        documents (*),
        analyses (*)
      `,
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (dealsError) {
      console.error("Fehler beim Abrufen der Deals:", dealsError);
      return NextResponse.json(
        { success: false, error: dealsError.message },
        { status: 500 },
      );
    }

    const formattedProperties = (deals || []).map((deal) => {
      const analyses = deal.analyses || [];
      const latestAnalysis =
        analyses.length > 0
          ? analyses.reduce((prev: any, current: any) =>
              prev.version > current.version ? prev : current,
            )
          : null;

      const rawJson = latestAnalysis?.raw_json || {};

      const dealTitle =
        deal.title && deal.title !== "Unbenannter Deal"
          ? deal.title
          : rawJson.title || "Immobilien-Deal";

      return {
        id: deal.id,
        title: dealTitle,
        client: deal.client_name || "Mandant",
        email: deal.client_email || "kontakt@dealpilot.ai",
        price: rawJson.estimatedPrice || "€1.000.000",
        score: latestAnalysis?.lead_score || rawJson.leadScore || 50,
        status: deal.status || "Reviewing",
        date: new Date(deal.created_at).toLocaleDateString("de-DE"),
        files: deal.documents ? deal.documents.map((d: any) => d.filename) : [],
        analysis: rawJson,
        decisionCenter: {
          score: latestAnalysis?.lead_score || rawJson.leadScore || 50,
          status: deal.status || "Reviewing",
          summary:
            latestAnalysis?.overall_recommendation ||
            rawJson.overallRecommendation ||
            "",
        },
      };
    });

    return NextResponse.json({
      success: true,
      properties: formattedProperties,
    });
  } catch (error: any) {
    console.error("🔥 Kritischer Fehler in /api/deals:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Serverfehler" },
      { status: 500 },
    );
  }
}
