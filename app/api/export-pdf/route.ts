import { NextResponse } from "next/server";
import { createClient } from "@/lib/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dealId = searchParams.get("dealId");

  if (!dealId) {
    return NextResponse.json({ error: "Deal ID fehlt" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: deal, error } = await supabase
    .from("deals")
    .select("*")
    .eq("id", dealId)
    .single();

  if (error || !deal) {
    return NextResponse.json({ error: "Deal nicht gefunden" }, { status: 404 });
  }

  // Hier wird das PDF generiert (oder als HTML-Druckversion formatiert)
  // Für den Start nutzen wir einen sauberen Print-HTML-Endpoint, den der Browser direkt als PDF speichert.
  return NextResponse.json({
    success: true,
    message: "PDF-Export vorbereitet",
    dealTitle: deal.title,
  });
}
