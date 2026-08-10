import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, company, portfolioSize } = body;

    // Validierung der Pflichtfelder
    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: "Name und E-Mail sind Pflichtfelder." },
        { status: 400 },
      );
    }

    // In die Datenbank schreiben (wir nutzen supabaseAdmin, da sich Bewerber oft noch im öffentlichen Pre-Auth-Bereich befinden)
    const { error: dbError } = await supabaseAdmin
      .from("pilot_applications")
      .insert([
        {
          full_name: name,
          email: email,
          company: company || null,
          portfolio_size: portfolioSize || null,
        },
      ]);

    if (dbError) {
      console.error("Datenbankfehler bei Pilot-Bewerbung:", dbError);
      return NextResponse.json(
        { success: false, error: "Fehler beim Speichern der Bewerbung." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { success: true, message: "Bewerbung erfolgreich eingegangen." },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("API Pilot-Bewerbung Serverfehler:", error);
    return NextResponse.json(
      { success: false, error: "Interner Serverfehler." },
      { status: 500 },
    );
  }
}
