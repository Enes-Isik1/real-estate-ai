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
  MessageSquare,
  Send,
} from "lucide-react";

// Strikte Interfaces statt 'any'
interface RiskItem {
  severity?: string;
  title: string;
  whyItMatters?: string;
  page?: number;
  sourceDoc?: string;
  source?: {
    documentType?: string;
    pageNumber?: number;
    snippet?: string;
  };
  snippet?: string;
}

interface ConflictItem {
  field: string;
  sourceA: string;
  sourceB: string;
  recommendation: string;
}

interface NextActionItem {
  action: string;
  priority: string;
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
    crossDocumentConflicts?: ConflictItem[];
    nextActions?: NextActionItem[];
    negotiationPoints?: { title: string; argument: string }[];
    missingDocuments?: MissingDoc[];
    timeline?: { event: string; date: string }[];
  };
}

export default function DealDetailPage() {
  const router = useRouter();
  const params = useParams();
  const dealId = params?.id as string;

  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);

  const [resolvedDocs, setResolvedDocs] = useState<string[]>([]);
  const [replyText, setReplyText] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  // Copilot States
  const [copilotMessages, setCopilotMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([
    {
      role: "assistant",
      content:
        "Hallo! Ich bin dein DealPilot Copilot. Frag mich alles zu diesem Deal – z. B. 'Was spricht momentan gegen den Deal?' oder 'Welche Risiken gibt es in den Verträgen?'",
    },
  ]);
  const [copilotInput, setCopilotInput] = useState("");
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);

  const handleSendCopilotMessage = async (customQuery?: string) => {
    const textToSend = customQuery || copilotInput;
    if (!textToSend.trim() || isCopilotLoading) return;

    const newMessages = [
      ...copilotMessages,
      { role: "user" as const, content: textToSend },
    ];
    setCopilotMessages(newMessages);
    if (!customQuery) setCopilotInput("");
    setIsCopilotLoading(true);

    try {
      const res = await fetch(`/api/deals/${dealId}/copilot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          dealContext: deal,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCopilotMessages([
          ...newMessages,
          { role: "assistant", content: data.answer },
        ]);
      } else {
        setCopilotMessages([
          ...newMessages,
          {
            role: "assistant",
            content:
              "Entschuldigung, es gab einen Fehler bei der Verarbeitung.",
          },
        ]);
      }
    } catch (err) {
      console.error("Copilot Fehler:", err);
      setCopilotMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Netzwerkfehler beim Anfragen des Copiloten.",
        },
      ]);
    } finally {
      setIsCopilotLoading(false);
    }
  };

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

      const cachedDeal = sessionStorage.getItem(`deal_${dealId}`);
      if (cachedDeal) {
        try {
          const parsedDeal = JSON.parse(cachedDeal);
          setDeal(parsedDeal);
          setLoading(false);
          return;
        } catch (e) {
          console.error("Fehler beim Parsen des SessionStorage Deals:", e);
        }
      }

      if (
        dealId === "1" ||
        dealId === "lakefront-villa" ||
        !dealId.includes("-")
      ) {
        loadFallback();
        return;
      }

      try {
        const res = await fetch(`/api/deals/${dealId}`);
        const data = await res.json();

        if (data.success && data.property) {
          const prop = data.property;
          const fetchedDeal: Deal = {
            id: prop.id,
            title: prop.name,
            status: prop.decisionCenter?.status || "Reviewing",
            date: new Date(prop.createdAt).toLocaleDateString("de-DE"),
            client: prop.clientName || "Mandant",
            email: prop.clientEmail || "kontakt@dealpilot.ai",
            score: prop.decisionCenter?.score || prop.analysis?.leadScore || 50,
            files: prop.files || [],
            analysis: {
              executiveSummary: prop.analysis?.executiveSummary,
              topRisks: prop.analysis?.topRisks || [],
              crossDocumentConflicts:
                prop.analysis?.crossDocumentConflicts || [],
              nextActions: prop.analysis?.nextActions || [],
              negotiationPoints: prop.analysis?.negotiationPoints || [],
              missingDocuments: prop.analysis?.missingDocuments || [],
              timeline: prop.analysis?.timeline || [],
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

  const handleResolveDocument = (docTitle: string) => {
    const updatedResolved = [...resolvedDocs, docTitle];
    setResolvedDocs(updatedResolved);
    sessionStorage.setItem(
      `resolved_docs_${dealId}`,
      JSON.stringify(updatedResolved),
    );
  };

  const handleDeleteDeal = async () => {
    if (!confirm("Möchtest du diesen Deal wirklich unwiderruflich löschen?"))
      return;

    try {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        sessionStorage.removeItem(`deal_${dealId}`);
        sessionStorage.removeItem("latest_analyzed_deal");
        sessionStorage.removeItem(`resolved_docs_${dealId}`);

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
          <div className="absolute inset-0 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 animate-ping" />
          <div className="absolute inset-0 rounded-2xl border-2 border-transparent border-t-indigo-600 border-r-indigo-500 animate-spin" />
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

  // 👇 HIER DEN FALLBACK FÜR NEXT ACTIONS EINFÜGEN:
  const derivedNextActions =
    deal.analysis?.nextActions && deal.analysis.nextActions.length > 0
      ? deal.analysis.nextActions
      : [
          ...(deal.analysis?.topRisks || []).slice(0, 2).map((risk: any) => ({
            action: `Klärung von: ${typeof risk === "string" ? risk : risk.title}`,
            priority: risk.severity || risk.level || "High",
          })),
          ...(filteredMissingDocs || []).slice(0, 2).map((doc: any) => ({
            action: `Fehlendes Dokument anfordern: ${doc.title || doc.name}`,
            priority: doc.required ? "High" : "Medium",
          })),
        ];

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

      {/* Analyse Ergebnisse (2-Spalten-Grid) */}
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

        <div className="bg-white border border-gray-200/60 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" /> Risiken &
              Evidenz-Prüfung
            </h3>
            <span className="px-2.5 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-full text-[10px] font-bold uppercase tracking-wider">
              {risksList.length} Gefunden
            </span>
          </div>

          <div className="space-y-4">
            {risksList.length > 0 ? (
              risksList.map((risk: any, i: number) => {
                const severity = risk.severity || "Medium";
                const badgeColor =
                  severity === "High"
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : severity === "Medium"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-blue-50 text-blue-700 border-blue-200";

                const sourceDoc =
                  risk.source?.documentType || risk.sourceDoc || "Dokument";
                const pageNum = risk.source?.pageNumber || risk.page || 1;
                const snippet = risk.source?.snippet || risk.snippet;

                return (
                  <div
                    key={i}
                    className="bg-gray-50/60 border border-gray-200/80 p-5 rounded-2xl space-y-3 transition-all hover:border-indigo-200"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`px-2.5 py-0.5 border rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeColor}`}
                        >
                          Relevanz: {severity}
                        </span>
                        <h4 className="font-bold text-gray-900 text-sm">
                          {risk.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 shadow-xs">
                        <FileText className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{sourceDoc}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-indigo-600">Seite {pageNum}</span>
                      </div>
                    </div>

                    {risk.whyItMatters && (
                      <p className="text-xs text-gray-600 leading-relaxed">
                        <strong className="text-gray-900">Bedeutung:</strong>{" "}
                        {risk.whyItMatters}
                      </p>
                    )}

                    {snippet && (
                      <div className="p-3 bg-white border-l-4 border-indigo-500 border-y border-r border-gray-200/60 rounded-r-xl text-xs text-gray-600 italic">
                        „{snippet}“
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-gray-400 py-2">
                Keine kritischen Risiken in den Dokumenten erkannt.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* WIDERSPRUCHSERKENNUNG (Cross-Document Conflicts)                           */}
      {/* ========================================================================= */}
      {deal.analysis?.crossDocumentConflicts &&
        deal.analysis.crossDocumentConflicts.length > 0 && (
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-amber-900 text-lg flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" /> Erkannte
              Widersprüche zwischen Dokumenten
            </h3>
            <div className="space-y-3">
              {deal.analysis.crossDocumentConflicts.map((conflict, i) => (
                <div
                  key={i}
                  className="bg-white border border-amber-200/60 p-4 rounded-2xl space-y-2"
                >
                  <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Betroffen: {conflict.field}
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <span className="font-bold text-gray-700 block">
                        Dokument A:
                      </span>
                      <span className="text-gray-600">{conflict.sourceA}</span>
                    </div>
                    <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <span className="font-bold text-gray-700 block">
                        Dokument B:
                      </span>
                      <span className="text-gray-600">{conflict.sourceB}</span>
                    </div>
                  </div>
                  <p className="text-xs text-amber-900 font-medium pt-1">
                    💡 <strong>Empfehlung:</strong> {conflict.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* ========================================================================= */}
      {/* PROAKTIVE NEXT ACTIONS                                                    */}
      {/* ========================================================================= */}
      {deal.analysis?.nextActions && deal.analysis.nextActions.length > 0 && (
        <div className="bg-white border border-gray-200/60 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-500" /> Nächste
            Schritte (Next Actions)
          </h3>
          <ul className="space-y-2.5">
            {deal.analysis.nextActions.map((act, i) => (
              <li
                key={i}
                className="p-3.5 bg-indigo-50/40 border border-indigo-100 rounded-2xl flex items-center justify-between text-xs"
              >
                <span className="font-semibold text-gray-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  {act.action}
                </span>
                <span className="px-2 py-0.5 bg-white border border-indigo-200 text-indigo-700 rounded-lg text-[10px] font-bold uppercase">
                  {act.priority}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DYNAMISCHE EVIDENCE TIMELINE                                              */}
      {/* ========================================================================= */}
      {deal.analysis?.timeline && deal.analysis.timeline.length > 0 && (
        <div className="bg-white border border-gray-200/60 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" /> Ereignis-Timeline &
            Meilensteine
          </h3>
          <div className="space-y-3 border-l-2 border-indigo-100 pl-4 ml-2">
            {deal.analysis.timeline.map((item: any, i: number) => (
              <div key={i} className="space-y-1 relative">
                <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-white"></span>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                  {item.date}
                </span>
                <p className="text-xs text-gray-700 font-medium">
                  {item.event}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* ========================================================================= */}
      {/* FULL-CONTEXT COPILOT CHAT (Punkt 13)                                      */}
      {/* ========================================================================= */}
      <div className="bg-white border border-gray-200/60 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" /> DealPilot
            Full-Context Copilot
          </h3>
          <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
            Live Deal-State
          </span>
        </div>

        <p className="text-xs text-gray-500">
          Stelle komplexe Fragen zur Due Diligence, zu Risiken oder zur
          Dokumentenlage dieses Deals.
        </p>

        {/* Schnellstart-Fragen */}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() =>
              handleSendCopilotMessage("Was spricht momentan gegen den Deal?")
            }
            className="px-3 py-1.5 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 text-gray-700 border border-gray-200 rounded-xl text-xs font-medium transition-all cursor-pointer"
          >
            💬 Was spricht momentan gegen den Deal?
          </button>
          <button
            onClick={() =>
              handleSendCopilotMessage(
                "Gibt es kritische Widersprüche in den Unterlagen?",
              )
            }
            className="px-3 py-1.5 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 text-gray-700 border border-gray-200 rounded-xl text-xs font-medium transition-all cursor-pointer"
          >
            ⚠️ Kritische Widersprüche prüfen
          </button>
          <button
            onClick={() =>
              handleSendCopilotMessage(
                "Welche Unterlagen fehlen noch zwingend?",
              )
            }
            className="px-3 py-1.5 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 text-gray-700 border border-gray-200 rounded-xl text-xs font-medium transition-all cursor-pointer"
          >
            📋 Fehlende Unterlagen zusammenfassen
          </button>
        </div>

        {/* Chatverlauf */}
        <div className="bg-gray-50/60 border border-gray-200/80 rounded-2xl p-4 max-h-[350px] overflow-y-auto space-y-3">
          {copilotMessages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-xs"
                    : "bg-white text-gray-700 border border-gray-200/80 rounded-bl-xs shadow-xs"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isCopilotLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-indigo-600 border border-gray-200/80 p-3.5 rounded-2xl text-xs font-medium animate-pulse">
                Copilot analysiert den Deal-Kontext...
              </div>
            </div>
          )}
        </div>

        {/* Eingabefeld */}
        <div className="flex gap-2">
          <input
            type="text"
            value={copilotInput}
            onChange={(e) => setCopilotInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendCopilotMessage()}
            placeholder="Frage eingeben (z.B. 'Welche Risiken hat das Grundbuch?')..."
            className="flex-1 px-4 py-3 text-xs text-gray-700 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          <button
            onClick={() => handleSendCopilotMessage()}
            disabled={isCopilotLoading || !copilotInput.trim()}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            Senden
          </button>
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
