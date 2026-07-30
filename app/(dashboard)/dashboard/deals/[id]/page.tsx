"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/utils/supabase/client";
import {
  ArrowLeft,
  Sparkles,
  User,
  ShieldAlert,
  FileText,
  CheckCircle2,
  Trash2,
} from "lucide-react";

// Strikte Interfaces statt 'any'
interface RiskItem {
  severity?: string;
  title: string;
  whyItMatters?: string;
  page?: number;
  sourceDoc?: string;
}

interface MissingDoc {
  title: string;
  category: "required" | "recommended" | "optional";
  reason?: string;
}

interface Deal {
  id: string;
  title: string;
  status?: string;
  date?: string;
  client?: string;
  email?: string;
  score?: number;
  files?: string[];
  analysis?: {
    executiveSummary?: string;
    summary?: string;
    risks?: (string | RiskItem)[];
    topRisks?: RiskItem[];
    negotiationPoints?: { title: string; argument: string }[];
    missingDocuments?: MissingDoc[];
  };
}

export default function DealDetailPage() {
  const router = useRouter();
  const params = useParams();
  const dealId = params?.id as string;

  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);

  // Enterprise State: Speichert manuell als erledigt/angefordert markierte Dokumente
  const [resolvedDocs, setResolvedDocs] = useState<string[]>([]);

  // 1. States für die Suggested Reply (Interaktivität & Tonfall)
  const [replyText, setReplyText] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);

  // 2. States & Funktion für den Dokumenten-Upload in der Detailansicht
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  useEffect(() => {
    if (!dealId) return;

    async function initDeal() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // 1. Enterprise Fallback: Prüfen ob der Deal frisch im sessionStorage liegt (z.B. nach direktem Upload)
      const cachedDeal = sessionStorage.getItem(`deal_${dealId}`);
      if (cachedDeal) {
        try {
          const parsedDeal = JSON.parse(cachedDeal);
          setDeal(parsedDeal);
          setLoading(false);
          return; // Sofort abbrechen, da lokaler Cache vorhanden ist
        } catch (e) {
          console.error("Fehler beim Parsen des SessionStorage Deals:", e);
        }
      }

      // 2. Demo-IDs direkt behandeln
      if (
        dealId === "1" ||
        dealId === "lakefront-villa" ||
        !dealId.includes("-")
      ) {
        loadFallback();
        return;
      }

      try {
        // 3. Von der Datenbank-API laden
        const res = await fetch(`/api/deals/${dealId}`);
        const data = await res.json();

        if (data.success && data.property) {
          const prop = data.property;
          const fetchedDeal: Deal = {
            id: prop.id,
            title: prop.name,
            status: prop.decisionCenter?.status || "Reviewing",
            date: new Date(prop.createdAt).toLocaleDateString("de-DE"),
            client: "Mandant",
            email: "kontakt@dealpilot.ai",
            score: prop.decisionCenter?.score || prop.analysis?.leadScore || 50,
            files: prop.files || [],
            analysis: {
              executiveSummary: prop.analysis?.executiveSummary,
              topRisks: prop.analysis?.topRisks || [],
              negotiationPoints: prop.analysis?.negotiationPoints || [],
              missingDocuments: prop.analysis?.missingDocuments || [],
            },
          };
          setDeal(fetchedDeal);
          setLoading(false);
        } else {
          loadFallback();
        }
      } catch (e) {
        console.error("Fehler beim Laden:", e);
        loadFallback();
      } finally {
        setLoading(false);
      }
    }

    function loadFallback() {
      // Letzter Rettungsanker: Versuche den "latest_analyzed_deal" zu nehmen, falls die ID übereinstimmt
      const latest = sessionStorage.getItem("latest_analyzed_deal");
      if (latest) {
        try {
          const parsedLatest = JSON.parse(latest);
          if (parsedLatest.id === dealId) {
            setDeal(parsedLatest);
            setLoading(false);
            return;
          }
        } catch (err) {
          // Ignorieren
        }
      }

      setDeal(null);
      setLoading(false);
    }

    initDeal();
  }, [dealId, router]);

  // Enterprise Funktion: Markiert ein Dokument als erledigt/angefordert und filtert es permanent aus
  const handleResolveDocument = (docTitle: string) => {
    const updatedResolved = [...resolvedDocs, docTitle];
    setResolvedDocs(updatedResolved);
    sessionStorage.setItem(
      `resolved_docs_${dealId}`,
      JSON.stringify(updatedResolved),
    );
  };

  // Funktion zum Löschen des Deals
  // Funktion zum Löschen des Deals
  const handleDeleteDeal = async () => {
    if (!confirm("Möchtest du diesen Deal wirklich unwiderruflich löschen?"))
      return;

    try {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        // --- ENTERPRISE FIX: Cache sofort bereinigen ---
        sessionStorage.removeItem(`deal_${dealId}`);
        sessionStorage.removeItem("latest_analyzed_deal");
        sessionStorage.removeItem(`resolved_docs_${dealId}`);

        // Zurück zum Dashboard und Cache invalidieren
        router.push("/dashboard");
        router.refresh();
      } else {
        alert("Fehler beim Löschen: " + (data.error || "Unbekannter Fehler"));
      }
    } catch (err) {
      console.error("Lösch-Fehler:", err);
      alert("Netzwerkfehler beim Löschen.");
    }
  };

  // 4. Funktion für den Regenerate-Button mit verschiedenen Tonfällen
  const handleRegenerate = async (tone: string) => {
    setIsRegenerating(true);
    setTimeout(() => {
      if (tone === "formell") {
        setReplyText(
          "Sehr geehrte(r) Verkäufer(in), unter Bezugnahme auf die eingereichten Unterlagen bitten wir höflich um Klärung der aufgeführten Punkte...",
        );
      } else if (tone === "direkt") {
        setReplyText(
          "Hallo, bezüglich des Deals gibt es offene Fragen und Risiken, die vor dem weiteren Fortgang geklärt werden müssen:",
        );
      } else {
        setReplyText(
          "Guten Tag, vielen Dank für die Bereitstellung der Dokumente. Nach erster Prüfung haben wir noch folgendes Anliegen...",
        );
      }
      setIsRegenerating(false);
    }, 500);
  };

  // 5. Funktion für den Mandanten-Bericht Export
  const handleExportReport = () => {
    if (!deal) return;

    const reportWindow = window.open("", "_blank");
    if (!reportWindow) {
      alert("Bitte erlaube Pop-ups für den Export.");
      return;
    }

    const risksListHtml = (deal.analysis?.topRisks || [])
      .map(
        (r) =>
          `<li><strong>${typeof r === "string" ? r : r.title}</strong>: ${typeof r === "object" && r.whyItMatters ? r.whyItMatters : ""}</li>`,
      )
      .join("");

    const activeMissing = (deal.analysis?.missingDocuments || []).filter(
      (d) =>
        !resolvedDocs.includes(d.title) &&
        !(deal.files || []).some((f) =>
          f.toLowerCase().includes(d.title.toLowerCase().split(" ")[0]),
        ),
    );

    const missingDocsHtml = activeMissing
      .map(
        (d) =>
          `<li><strong>[${d.category.toUpperCase()}] ${d.title}</strong> - ${d.reason || "Keine Angabe"}</li>`,
      )
      .join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="de">
      <head>
        <meta charset="UTF-8">
        <title>DealPilot Prüfbericht - ${deal.title}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #111; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 20px; }
          h1 { color: #4f46e5; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
          h2 { color: #374151; margin-top: 30px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
          .badge { display: inline-block; padding: 4px 12px; background: #e0e7ff; color: #4f46e5; border-radius: 9999px; font-weight: bold; font-size: 12px; }
          .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
          ul { padding-left: 20px; }
          li { margin-bottom: 8px; }
          @media print { body { margin: 0; padding: 10px; } }
        </style>
      </head>
      <body>
        <h1>DealPilot Due Diligence Bericht</h1>
        <p><strong>Objekt:</strong> ${deal.title}</p>
        <p><strong>Datum:</strong> ${deal.date || new Date().toLocaleDateString("de-DE")}</p>
        <p><strong>Lead Score:</strong> <span class="badge">${deal.score ?? 50} / 100</span></p>

        <div class="card">
          <h2>Executive Summary</h2>
          <p>${deal.analysis?.executiveSummary || deal.analysis?.summary || "Keine Zusammenfassung verfügbar."}</p>
        </div>

        <div class="card">
          <h2>Top-Risiken & Hinweise</h2>
          <ul>${risksListHtml || "<li>Keine kritischen Risiken erkannt.</li>"}</ul>
        </div>

        <div class="card">
          <h2>Fehlende Unterlagen</h2>
          <ul>${missingDocsHtml || "<li>Alle relevanten Dokumente liegen vor.</li>"}</ul>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    reportWindow.document.open();
    reportWindow.document.write(htmlContent);
    reportWindow.document.close();
  };

  // 6. Funktion zum Hochladen neuer Dokumente aus der Detailansicht
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !dealId) return;

    setIsUploading(true);
    setUploadMessage("Lade Dokument hoch & starte KI-Analyse...");

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }
    formData.append("dealId", dealId);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setUploadMessage("Erfolgreich analysiert! Aktualisiere Ansicht...");

        const newFileNames = Array.from(files).map((f) => f.name);
        const updatedFiles = [...(deal?.files || []), ...newFileNames];

        const updatedDealData = {
          ...deal,
          score:
            data.property?.decisionCenter?.score || data.score || deal?.score,
          files: updatedFiles,
          analysis: data.property?.analysis || data?.analysis || deal?.analysis,
        };

        setDeal(updatedDealData);
        sessionStorage.setItem(
          `deal_${dealId}`,
          JSON.stringify(updatedDealData),
        );
        sessionStorage.setItem(
          "latest_analyzed_deal",
          JSON.stringify(updatedDealData),
        );

        const currentMissing = updatedDealData.analysis?.missingDocuments || [];
        const newlyResolved: string[] = [...resolvedDocs];

        currentMissing.forEach((doc) => {
          const matched = newFileNames.some(
            (fn) =>
              fn
                .toLowerCase()
                .includes(doc.title.toLowerCase().split(" ")[0]) ||
              doc.title
                .toLowerCase()
                .includes(fn.toLowerCase().replace(/\.[^/.]+$/, "")),
          );
          if (matched && !newlyResolved.includes(doc.title)) {
            newlyResolved.push(doc.title);
          }
        });

        setResolvedDocs(newlyResolved);
        sessionStorage.setItem(
          `resolved_docs_${dealId}`,
          JSON.stringify(newlyResolved),
        );

        setIsUploading(false);
        setUploadMessage("");
      } else {
        alert(
          "Fehler bei der Analyse: " + (data.error || "Unbekannter Fehler"),
        );
        setIsUploading(false);
      }
    } catch (err) {
      console.error("Upload-Fehler:", err);
      alert("Netzwerkfehler beim Hochladen.");
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 space-y-6 animate-fade-in">
        <div className="relative w-16 h-16 flex items-center justify-center">
          {/* Äußerer pulsierender Ring */}
          <div className="absolute inset-0 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 animate-ping" />

          {/* Innerer rotierender Gradient-Spinner */}
          <div className="absolute inset-0 rounded-2xl border-2 border-transparent border-t-indigo-600 border-r-indigo-500 animate-spin" />

          {/* Zentrales Icon */}
          <Sparkles className="w-6 h-6 text-indigo-600 animate-pulse" />
        </div>

        <div className="text-center space-y-1.5">
          <h3 className="font-extrabold text-gray-900 text-sm tracking-wide">
            DealPilot AI Intelligence
          </h3>
          <p className="text-xs text-gray-400 font-medium animate-pulse">
            Bereite Due-Diligence-Ansicht vor...
          </p>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="max-w-[600px] mx-auto mt-20 p-8 bg-white border border-gray-200/60 rounded-3xl text-center space-y-4 shadow-sm">
        <h3 className="font-bold text-gray-900 text-lg">Deal nicht gefunden</h3>
        <p className="text-gray-500 text-xs">
          Entweder existiert dieser Datensatz nicht, oder er gehört zu einem
          anderen Account.
        </p>
        <button
          onClick={() => router.push("/dashboard/deals")}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md cursor-pointer"
        >
          Zurück zur Deal-Übersicht
        </button>
      </div>
    );
  }

  const risksList = deal.analysis?.topRisks || deal.analysis?.risks || [];

  const rawMissingDocs = deal.analysis?.missingDocuments || [];
  const filteredMissingDocs = rawMissingDocs.filter((doc) => {
    if (resolvedDocs.includes(doc.title)) return false;

    const hasMatchingFile = (deal.files || []).some((filename) => {
      const cleanFn = filename.toLowerCase();
      const cleanDoc = doc.title.toLowerCase();
      const firstWord = cleanDoc.split(" ")[0];
      return (
        cleanFn.includes(firstWord) ||
        cleanDoc.includes(cleanFn.replace(/\.[^/.]+$/, ""))
      );
    });

    if (hasMatchingFile) return false;

    return true;
  });

  return (
    <div className="max-w-[1000px] mx-auto pb-24 p-6 md:p-8 space-y-8 animate-fade-in-up">
      {/* Zurück-Button */}
      <button
        onClick={() => router.push("/dashboard")}
        className="group flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Zurück zum Dashboard
      </button>

      {/* Deal Header */}
      <div className="bg-white border border-gray-200/60 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full text-xs font-bold uppercase tracking-wider">
              {deal.status || "Reviewing"}
            </span>
            <span className="text-xs text-gray-400 font-medium">
              {deal.date || "Gerade eben"}
            </span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            {deal.title}
          </h1>
          <p className="text-gray-500 text-sm flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" /> Kunde:{" "}
            <strong className="text-gray-700">{deal.client}</strong> (
            {deal.email})
          </p>
        </div>

        {/* Lead Score, PDF Export & Lösch-Button */}
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col items-center justify-center min-w-[120px] shadow-md">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Lead Score
            </span>
            <span className="text-3xl font-black text-indigo-400 mt-1">
              {deal.score ?? 50} / 100
            </span>
          </div>

          <button
            onClick={handleExportReport}
            className="h-full px-4 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer flex flex-col items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <FileText className="w-5 h-5" />
            <span>Bericht PDF</span>
          </button>

          {/* HIER WURDE DER LÖSCHEN-BUTTON INTEGRIERT */}
          <button
            onClick={handleDeleteDeal}
            title="Deal löschen"
            className="h-full px-4 py-4 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer flex flex-col items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Trash2 className="w-5 h-5" />
            <span>Löschen</span>
          </button>
        </div>
      </div>

      {/* Analyse Ergebnisse */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200/60 rounded-3xl p-6 shadow-sm space-y-3">
          <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" /> Executive Summary
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {deal.analysis?.executiveSummary ||
              deal.analysis?.summary ||
              "Keine Zusammenfassung verfügbar."}
          </p>
        </div>

        <div className="bg-white border border-gray-200/60 rounded-3xl p-6 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" /> Risiken &
              Hinweise
            </h3>
            <span className="px-2.5 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-full text-[10px] font-bold uppercase tracking-wider">
              {risksList.length} Gefunden
            </span>
          </div>

          <ul className="space-y-2.5">
            {risksList.length > 0 ? (
              risksList.map((risk: string | RiskItem, i: number) => {
                const title = typeof risk === "string" ? risk : risk.title;
                const details =
                  typeof risk === "object" ? risk.whyItMatters : null;
                const sourceDoc =
                  typeof risk === "object" ? risk.sourceDoc : null;
                const page = typeof risk === "object" ? risk.page : null;

                return (
                  <li
                    key={i}
                    className="text-xs text-gray-600 bg-rose-50/40 border border-rose-100/80 p-3 rounded-2xl flex flex-col gap-1.5 transition-all hover:bg-rose-50/70"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <span className="text-rose-500 font-bold mt-0.5">
                          •
                        </span>
                        <strong className="text-gray-900 font-semibold">
                          {title}
                        </strong>
                      </div>

                      {sourceDoc && (
                        <span className="shrink-0 px-2 py-0.5 bg-white border border-rose-200 text-rose-700 rounded-lg text-[10px] font-bold shadow-sm flex items-center gap-1">
                          <FileText className="w-3 h-3 text-rose-400" />
                          {sourceDoc} {page ? `(S. ${page})` : ""}
                        </span>
                      )}
                    </div>
                    {details && (
                      <p className="text-gray-500 pl-4 leading-relaxed">
                        {details}
                      </p>
                    )}
                  </li>
                );
              })
            ) : (
              <p className="text-xs text-gray-400">
                Keine kritischen Risiken erkannt.
              </p>
            )}
          </ul>
        </div>
      </div>

      {/* Fehlende Dokumente & Unterlagen */}
      <div className="bg-white border border-gray-200/60 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-500" /> Fehlende Dokumente
          & Unterlagen
        </h3>

        <div className="space-y-3">
          {filteredMissingDocs.length > 0 ? (
            filteredMissingDocs.map((doc, i) => {
              const isReq = doc.category === "required";
              const isRec = doc.category === "recommended";

              const badgeClass = isReq
                ? "bg-rose-50 text-rose-600 border-rose-200"
                : isRec
                  ? "bg-amber-50 text-amber-600 border-amber-200"
                  : "bg-blue-50 text-blue-600 border-blue-200";

              const badgeText = isReq
                ? "Zwingend (Required)"
                : isRec
                  ? "Empfohlen"
                  : "Optional";

              return (
                <div
                  key={i}
                  className="p-4 bg-gray-50/50 border border-gray-200/80 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 border rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}
                      >
                        {badgeText}
                      </span>
                      <h4 className="font-bold text-gray-800 text-sm">
                        {doc.title}
                      </h4>
                    </div>
                    {doc.reason && (
                      <p className="text-xs text-gray-500 pl-1">{doc.reason}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleResolveDocument(doc.title)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold border border-emerald-200 shadow-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Als erledigt markieren
                    </button>

                    <button
                      onClick={() =>
                        alert(
                          `Anfrage für "${doc.title}" an den Verkäufer generiert!`,
                        )
                      }
                      className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold border border-gray-200 shadow-sm transition-all cursor-pointer whitespace-nowrap"
                    >
                      Bei Verkäufer anfordern
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                Exzellent! Alle relevanten Dokumente liegen vor oder wurden
                erfolgreich verarbeitet. Keine offenen Lücken.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Vorhandene Dokumente & Nachladen */}
      <div className="bg-white border border-gray-200/60 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" /> Vorhandene
            Dokumente & Nachladen
          </h3>

          <label
            className={`px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2 ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
          >
            <Sparkles className="w-4 h-4" />
            {isUploading
              ? uploadMessage
              : "Dokument nachreichen & Analyse aktualisieren"}
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {deal.files && deal.files.length > 0 ? (
            deal.files.map((filename, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200/80 rounded-xl text-xs font-semibold text-gray-700 flex items-center gap-2"
              >
                <FileText className="w-3.5 h-3.5 text-gray-400" />
                {filename}
              </span>
            ))
          ) : (
            <p className="text-xs text-gray-400">
              Keine Dateinamen hinterlegt.
            </p>
          )}
        </div>
      </div>

      {/* Suggested Reply / Verhandlungs-Antwort */}
      <div className="bg-white border border-gray-200/60 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" /> KI-Antwortvorschlag
            an Verkäufer
          </h3>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">Tonfall:</span>
            <button
              onClick={() => handleRegenerate("formell")}
              className="px-2.5 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold border border-gray-200 transition-colors cursor-pointer"
            >
              Formell
            </button>
            <button
              onClick={() => handleRegenerate("direkt")}
              className="px-2.5 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold border border-gray-200 transition-colors cursor-pointer"
            >
              Direkt
            </button>
            <button
              onClick={() => handleRegenerate("standard")}
              className="px-2.5 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold border border-gray-200 transition-colors cursor-pointer"
            >
              Standard
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            disabled={isRegenerating}
            rows={4}
            className="w-full p-4 text-sm text-gray-700 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
            placeholder="Generiere oder bearbeite hier die Antwort..."
          />
          {isRegenerating && (
            <p className="text-xs text-indigo-600 font-medium animate-pulse">
              KI formuliert den Text um...
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => navigator.clipboard.writeText(replyText)}
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            In Zwischenablage kopieren
          </button>
        </div>
      </div>
    </div>
  );
}
