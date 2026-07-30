import { createClient } from "@/lib/utils/supabase/server";
import Link from "next/link";
import {
  FolderKanban,
  Plus,
  ArrowRight,
  Building2,
  ShieldCheck,
  Clock,
  AlertCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

// TypeScript Interface für enterprise-grade Typsicherheit
interface Deal {
  id: string;
  title: string;
  created_at: string;
  status?: string;
  risk_level?: string;
}

export default async function DealsPage() {
  // 1. Supabase Server Client initialisieren
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2. Daten serverseitig abrufen (strikt gefiltert auf den eingeloggten User)
  let dealsQuery = supabase
    .from("deals")
    .select("*")
    .order("created_at", { ascending: false });

  if (user) {
    dealsQuery = dealsQuery.eq("user_id", user.id);
  }

  const { data: deals, error } = await dealsQuery;

  if (error) {
    console.error("Enterprise Audit Error [Deals Fetch]:", error.message);
  }

  const safeDeals: Deal[] = deals || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* ENTERPRISE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5" /> ISO 27001 Isoliert
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <FolderKanban className="w-8 h-8 text-indigo-600" />
            Deals Management
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Mandantenkonforme Übersicht aller analysierten Immobilien-Portfolios
            und Audit-Projekte.
          </p>
        </div>

        <Link
          href="/dashboard/analyze"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Neuen Deal analysieren</span>
        </Link>
      </div>

      {/* ERROR STATE */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-sm font-semibold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>
            Fehler beim Laden der Mandanten-Daten. Bitte versuchen Sie es später
            erneut.
          </span>
        </div>
      )}

      {/* EMPTY STATE */}
      {!error && safeDeals.length === 0 ? (
        <div className="text-center py-24 bg-white border border-slate-200/80 rounded-3xl p-8 space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="font-black text-slate-900 text-lg">
              Keine aktiven Deals
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              In Ihrem isolierten Mandantenbereich befinden sich noch keine
              Datensätze. Starten Sie jetzt Ihre erste automatisierte
              KI-Prüfung.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/dashboard/analyze"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Ersten Deal starten
            </Link>
          </div>
        </div>
      ) : (
        /* GRID SYSTEM */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeDeals.map((deal) => (
            <Link
              key={deal.id}
              href={`/dashboard/deals/${deal.id}`}
              className="group bg-white border border-slate-200/80 hover:border-indigo-500/50 rounded-3xl p-6 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/5 flex flex-col justify-between cursor-pointer relative overflow-hidden"
            >
              {/* Subtiler oberer Akzent-Streifen beim Hover */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform shadow-sm">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg border border-slate-200/60">
                    Aktiv
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-lg line-clamp-1">
                    {deal.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono tracking-wide flex items-center gap-1">
                    <span>ID: {deal.id.slice(0, 8)}...</span>
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                <span className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(deal.created_at).toLocaleDateString("de-DE")}
                </span>
                <span className="text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Audit öffnen</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
