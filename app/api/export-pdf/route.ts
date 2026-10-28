import { NextResponse } from "next/server";
import { createClient } from "@/lib/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dealId = searchParams.get("dealId");

  if (!dealId) {
    return NextResponse.json({ error: "Deal ID fehlt" }, { status: 400 });
  }

  // 1. Authentifizierung: Eingeloggten User über den Server-Client ermitteln
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Nicht autorisiert. Bitte loggen Sie sich ein." },
      { status: 401 },
    );
  }

  // 2. IDOR-Schutz: Deal abrufen UND explizit auf user_id des eingeloggten Nutzers prüfen
  const { data: deal, error } = await supabase
    .from("deals")
    .select("id, title, user_id")
    .eq("id", dealId)
    .eq("user_id", user.id)
    .single();

  if (error || !deal) {
    return NextResponse.json(
      { error: "Deal nicht gefunden oder Zugriff verweigert." },
      { status: 404 },
    );
  }

  // Hier wird das PDF generiert (oder als HTML-Druckversion formatiert)
  // Für den Start nutzen wir einen sauberen Print-HTML-Endpoint, den der Browser direkt als PDF speichert.
  return NextResponse.json({
    success: true,
    message: "PDF-Export vorbereitet",
    dealTitle: deal.title,
  });
}
