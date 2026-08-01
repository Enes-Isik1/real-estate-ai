// app/(dashboard)/dashboard/decision-center/page.tsx
import { createClient } from "@/lib/utils/supabase/server";
import { redirect } from "next/navigation";
import DecisionCenter from "@/app/(dashboard)/dashboard/analyze/DecisionCenter";
import { Sparkles, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DecisionCenterPage() {
  const supabase = await createClient();

  // 1. Authentifizierung prüfen
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect("/login");
  }

  // 2. Den neuesten Deal + Analysen + Risiken für den User aus Supabase laden
  const { data: deals, error: dealsError } = await supabase
    .from("deals")
    .select("*, analyses(*, risks(*)), documents(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (dealsError) {
    console.error("Fehler beim Laden der Deals:", dealsError);
  }

  const latestDeal = deals && deals.length > 0 ? deals[0] : null;
  const latestAnalysis = latestDeal?.analyses?.[0] || null;
  const risks = latestAnalysis?.risks || [];

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-24 animate-fade-in">
      {/* Oberer Enterprise Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800/80 p-8 rounded-3xl shadow-xl shadow-indigo-950/10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" /> AI Decision Center
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            {latestDeal ? latestDeal.title : "Kein aktiver Deal"}
          </h1>
          <p className="text-slate-400 text-sm">
            Zentrale Management-Übersicht, Risikobewertung und strategische Pipeline-Steuerung.
          </p>
        </div>

        {latestDeal && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider text-slate-400">Deal Status</span>
              <span className="inline-block px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold rounded-full mt-0.5">
                {latestDeal.status || "Analyzing"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Deine originale DecisionCenter Komponente mit echten Risiken */}
      {latestDeal ? (
        <DecisionCenter risks={risks} />
      ) : (
        <div className="bg-white border border-gray-200/80 p-12 rounded-3xl text-center space-y-4 shadow-sm">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="text-lg font-bold text-gray-900">Keine Immobiliendaten vorhanden</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Lade im Analyse-Bereich ein Dokument hoch, damit das Decision Center die Kennzahlen berechnen kann.
          </p>
        </div>
      )}
    </div>
  );
}