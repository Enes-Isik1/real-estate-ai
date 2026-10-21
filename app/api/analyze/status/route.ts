// app/api/analyze/status/route.ts
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
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json(
        { error: "Parameter jobId fehlt." },
        { status: 400 },
      );
    }

    const { data: job, error: jobError } = await supabaseAdmin
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: "Job nicht gefunden." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      status: job.status, // "pending" | "processing" | "completed" | "failed"
      error: job.error_message || null,
      result: job.result || null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Serverfehler" },
      { status: 500 },
    );
  }
}
