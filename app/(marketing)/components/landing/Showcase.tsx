"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LogIn,
  FilePlus,
  UploadCloud,
  Cpu,
  AlertTriangle,
  FileCheck,
  MessageSquare,
  LayoutDashboard,
  Download,
} from "lucide-react";
import { FadeUp, GlassPanel, MonoLabel, Section } from "./LandingPrimitives";

const DEMO_STEPS = [
  {
    id: 1,
    key: "login",
    title: "Login",
    icon: LogIn,
    caption: "Sicherer Einstieg in das Makler-Portal.",
  },
  {
    id: 2,
    key: "deal",
    title: "Deal erstellen",
    icon: FilePlus,
    caption: "Neues Objekt mit wenigen Klicks anlegen.",
  },
  {
    id: 3,
    key: "upload",
    title: "PDFs hochladen",
    icon: UploadCloud,
    caption: "Exposés & WEG-Protokolle per Drag & Drop reinziehen.",
  },
  {
    id: 4,
    key: "analysis",
    title: "Analyse",
    icon: Cpu,
    caption: "KI scannt Kennzahlen und Objektdaten.",
  },
  {
    id: 5,
    key: "risks",
    title: "Risiken",
    icon: AlertTriangle,
    caption: "Automatische Erkennung von Sonderumlagen.",
  },
  {
    id: 6,
    key: "evidence",
    title: "Evidence",
    icon: FileCheck,
    caption: "Direkter Quellennachweis im Originaldokument.",
  },
  {
    id: 7,
    key: "chat",
    title: "Chat",
    icon: MessageSquare,
    caption: "Fragen an die KI direkt zum WEG-Protokoll.",
  },
  {
    id: 8,
    key: "decision",
    title: "Decision Center",
    icon: LayoutDashboard,
    caption: "Alle harten Fakten auf einen Blick.",
  },
  {
    id: 9,
    key: "export",
    title: "Export",
    icon: Download,
    caption: "Fertigen Investment-Report als PDF exportieren.",
  },
] as const;

type StepKey = (typeof DEMO_STEPS)[number]["key"];

function MockLogin() {
  return (
    <div className="max-w-xs mx-auto space-y-3 py-4 text-center">
      <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
        DP
      </div>
      <p className="text-[13px] font-medium text-gray-900">
        Sicherer Unternehmens-Login
      </p>
      <div className="rounded-lg bg-white px-3 py-2 text-xs text-gray-400 border border-gray-200/60 shadow-sm">
        makler@dealpilot.app
      </div>
    </div>
  );
}

function MockCreateDeal() {
  return (
    <div className="space-y-2 max-w-sm mx-auto">
      <div className="rounded-lg bg-white px-3.5 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.05)] border border-gray-200/60">
        <p className="font-mono text-[10px] text-gray-400">Objektbezeichnung</p>
        <p className="text-[13px] font-medium text-gray-900">
          Mehrfamilienhaus Schwabing
        </p>
      </div>
      <div className="rounded-lg bg-white px-3.5 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.05)] border border-gray-200/60">
        <p className="font-mono text-[10px] text-gray-400">Ankaufsprofil</p>
        <p className="text-[13px] font-medium text-gray-900">
          Bestandsimmobilie / Core-Plus
        </p>
      </div>
    </div>
  );
}

function MockUpload() {
  return (
    <div className="rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 p-6 text-center">
      <UploadCloud className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
      <p className="text-[13px] font-medium text-gray-900">
        Exposé & WEG-Protokoll hier ablegen
      </p>
      <p className="text-[11px] text-gray-400 mt-1">
        PDF bis zu 50 MB · Automatische Texterkennung aktiv
      </p>
    </div>
  );
}

function MockAnalysis() {
  const fields = [
    { k: "Kaufpreis", v: "€ 1.450.000" },
    { k: "Einheiten", v: "8 Wohnungen" },
    { k: "Faktor", v: "18.4 x" },
    { k: "Rendite", v: "5.4 %" },
  ];
  return (
    <div className="grid grid-cols-2 gap-2">
      {fields.map((f) => (
        <div
          key={f.k}
          className="rounded-lg bg-white px-3 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.05)] border border-gray-200/60"
        >
          <p className="font-mono text-[10px] text-gray-400">{f.k}</p>
          <p className="mt-0.5 text-[13px] font-medium text-gray-900">{f.v}</p>
        </div>
      ))}
    </div>
  );
}

function MockRisks() {
  return (
    <div className="space-y-2">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
        <p className="font-mono text-[10px] uppercase tracking-wide text-amber-600">
          Risiko erkannt
        </p>
        <p className="mt-0.5 text-[12.5px] font-medium text-amber-900">
          Sonderumlage für Dachsanierung beschlossen (€ 45.000)
        </p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5">
        <p className="font-mono text-[10px] text-gray-400">
          Instandhaltungsrücklage
        </p>
        <p className="mt-0.5 text-[12.5px] font-medium text-gray-900">
          Knapp kalkuliert (€ 12.400 gesamt)
        </p>
      </div>
    </div>
  );
}

function MockEvidence() {
  return (
    <div className="rounded-lg bg-white p-3.5 shadow-sm border border-gray-200/60 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
          WEG-Protokoll_2025.pdf (Seite 14)
        </span>
        <span className="text-[10px] text-gray-400">Originalbeleg</span>
      </div>
      <p className="text-[12px] italic text-gray-600 bg-gray-50 p-2.5 rounded border-l-2 border-indigo-500">
        „...es wird beschlossen, die Maßnahme im Frühjahr 2026 durch
        Sonderumlage zu finanzieren...“
      </p>
    </div>
  );
}

function MockChat() {
  return (
    <div className="space-y-2 text-xs">
      <div className="bg-white p-2.5 rounded-lg border border-gray-200/60 max-w-[85%] text-gray-800">
        Welche Beschlüsse gab es bezüglich der Aufzugsanlage?
      </div>
      <div className="bg-indigo-50 p-2.5 rounded-lg border border-indigo-100 max-w-[85%] ml-auto text-indigo-900">
        Laut Protokoll vom 12.11. wurde die Teilsanierung des Aufzugs für 18.000
        € bereits vollständig aus Rücklagen bezahlt.
      </div>
    </div>
  );
}

function MockDecision() {
  return (
    <div className="grid grid-cols-3 gap-2 text-center">
      <div className="rounded-lg bg-white p-3 border border-gray-200/60 shadow-sm">
        <p className="font-mono text-[10px] text-gray-400">Deal-Score</p>
        <p className="text-base font-bold text-indigo-600 mt-1">88 / 100</p>
      </div>
      <div className="rounded-lg bg-white p-3 border border-gray-200/60 shadow-sm">
        <p className="font-mono text-[10px] text-gray-400">Empfehlung</p>
        <p className="text-xs font-semibold text-emerald-600 mt-1.5">
          Kauf prüfen
        </p>
      </div>
      <div className="rounded-lg bg-white p-3 border border-gray-200/60 shadow-sm">
        <p className="font-mono text-[10px] text-gray-400">Zeitgewinn</p>
        <p className="text-base font-bold text-gray-900 mt-1">45 Min.</p>
      </div>
    </div>
  );
}

function MockExport() {
  return (
    <div className="text-center py-4 space-y-3">
      <div className="w-10 h-10 mx-auto rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
        ✓
      </div>
      <p className="text-[13px] font-medium text-gray-900">
        Investment-Report erfolgreich generiert
      </p>
      <button className="bg-indigo-600 text-white text-xs font-medium px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-500 transition-colors">
        PDF-Report herunterladen
      </button>
    </div>
  );
}

const MOCKS: Record<StepKey, () => React.ReactNode> = {
  login: MockLogin,
  deal: MockCreateDeal,
  upload: MockUpload,
  analysis: MockAnalysis,
  risks: MockRisks,
  evidence: MockEvidence,
  chat: MockChat,
  decision: MockDecision,
  export: MockExport,
};

export function ShowcaseTabs() {
  const [activeId, setActiveId] = useState<number>(1);
  const activeStep = DEMO_STEPS.find((s) => s.id === activeId) || DEMO_STEPS[0];
  const ActiveMock = MOCKS[activeStep.key];

  return (
    <Section className="py-16 md:py-20">
      <FadeUp>
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-indigo-600">
          5-Minuten Live-Demo
        </p>
        <h2 className="mt-4 max-w-xl text-2xl font-semibold tracking-tight text-gray-900 md:text-3xl">
          Vom Dokument zum Deal in Rekordzeit.
        </h2>
      </FadeUp>

      <FadeUp delay={0.1}>
        {/* Horizontal scrollbar für alle 9 Schritte */}
        <div className="mt-9 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {DEMO_STEPS.map((step) => {
            const isActive = step.id === activeId;
            return (
              <button
                key={step.id}
                onClick={() => setActiveId(step.id)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-[12.5px] font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                    : "border-gray-200 bg-white text-gray-500 hover:text-gray-800"
                }`}
              >
                <step.icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span>
                  {step.id}. {step.title}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative mt-6">
          <div
            className="pointer-events-none absolute -inset-4 -z-10 rounded-[28px] opacity-60 blur-2xl"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 20%, rgba(79,70,229,0.10), transparent 70%)",
            }}
          />
          <GlassPanel className="overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-gray-200/70 px-5 py-3">
              <MonoLabel>
                dealpilot.app / demo / schritt-{activeId}-{activeStep.key}
              </MonoLabel>
              <p className="text-[12.5px] text-gray-400">
                {activeStep.caption}
              </p>
            </div>
            <div className="min-h-[220px] bg-gray-50/50 p-6 flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ActiveMock />
                </motion.div>
              </AnimatePresence>
            </div>
          </GlassPanel>
        </div>
      </FadeUp>
    </Section>
  );
}
