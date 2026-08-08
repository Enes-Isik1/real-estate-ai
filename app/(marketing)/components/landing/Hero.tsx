"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Clock3 } from "lucide-react";
import { Eyebrow, GlassPanel, MonoLabel } from "./LandingPrimitives";

const RAW_LINES = [
  "TOP 4: Beschlussfassung Sonderumlage Fassadensanierung",
  "Die Verwaltung informiert über Kostenvoranschlag",
  "Fa. Dachdecker Nowak GmbH, Rueckstellung unzureichend,",
  "Beschluss mehrheitlich angenommen (18 Ja / 3 Nein / 2 Enth.)",
  "Sonderumlage: EUR 340,00 / m² WFL, faellig zum 01.03.",
  "TOP 5: Wirtschaftsplan 2025, Instandhaltungsruecklage...",
];

const FIELDS = [
  { label: "Objekttyp", value: "ETW, 3 Zimmer" },
  { label: "Sonderumlage", value: "€ 340 / m² · fällig 01.03." },
  { label: "Beschlusslage", value: "Mehrheitlich angenommen" },
  { label: "Risikoflag", value: "Rücklage unterdeckt", flag: true },
];

export function Hero() {
  const [seconds, setSeconds] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    const start = Date.now();
    const id = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      if (elapsed >= 4.7) {
        setSeconds(4.7);
        setDone(true);
        clearInterval(id);
      } else {
        setSeconds(elapsed);
      }
    }, 40);
    return () => clearInterval(id);
  }, [done]);

  return (
    <div className="relative overflow-hidden">
      {/* subtle indigo mesh, kept faint per design system: indigo used sparingly */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(600px circle at 15% 10%, rgba(79,70,229,0.07), transparent 60%), radial-gradient(500px circle at 85% 25%, rgba(79,70,229,0.05), transparent 55%)",
        }}
      />

      <div className="mx-auto max-w-6xl px-6 pt-20 pb-16 md:px-8 md:pt-28 md:pb-24">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
          {/* Copy */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Eyebrow>Exklusives Pilotprogramm · 12 Plätze</Eyebrow>

            <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-tight text-gray-900 md:text-[52px]">
              Jede Anfrage.
              <br />
              Jedes Protokoll.
              <br />
              <span className="text-indigo-600">
                Strukturiert in unter 60&nbsp;Sekunden.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-gray-500">
              DealPilot liest Exposés, Anfragen und WEG-Protokolle, wie es Ihr
              bester Sachbearbeiter tun würde — nur ohne Nachmittage voller
              Copy-Paste. Sie erhalten einen geprüften, strukturierten Deal.
              Kein Rohtext. Keine Nacharbeit.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href="#bewerbung"
                className="group inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white shadow-[0_1px_2px_rgba(79,70,229,0.3)] transition-all hover:bg-indigo-700 hover:shadow-[0_4px_20px_rgba(79,70,229,0.35)]"
              >
                Am Pilotprogramm teilnehmen
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="#produkt"
                className="text-sm font-medium text-gray-600 underline decoration-gray-300 underline-offset-4 hover:text-gray-900"
              >
                Erst die Ansichten sehen
              </a>
            </div>

            <p className="mt-6 font-mono text-xs text-gray-400">
              Kostenlos für Pilotpartner · Kündbar in einem Klick · Keine
              Kreditkarte nötig
            </p>
          </motion.div>

          {/* Signature element: live transformation terminal */}
          <motion.div
            initial={{ opacity: 0, y: 20, rotateX: 4 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ perspective: 1200 }}
          >
            <GlassPanel className="relative overflow-hidden p-0">
              <div className="flex items-center justify-between border-b border-gray-200/70 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                  <MonoLabel>eingang.pdf</MonoLabel>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-gray-900 px-2.5 py-1">
                  <Clock3 className="h-3 w-3 text-white/70" />
                  <span className="font-mono text-[11px] text-white">
                    {seconds.toFixed(1)}s
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 divide-x divide-gray-200/70">
                {/* Raw side */}
                <div className="bg-gray-50/60 p-4">
                  <MonoLabel>Protokoll · Rohtext</MonoLabel>
                  <div className="mt-3 space-y-2">
                    {RAW_LINES.map((line, i) => (
                      <motion.p
                        key={i}
                        initial={{ opacity: 0.3 }}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          duration: 1.6,
                          delay: i * 0.15,
                          repeat: done ? 0 : Infinity,
                          repeatDelay: 2,
                        }}
                        className="truncate font-mono text-[10.5px] leading-relaxed text-gray-400"
                      >
                        {line}
                      </motion.p>
                    ))}
                  </div>
                </div>

                {/* Structured side */}
                <div className="p-4">
                  <MonoLabel>DealPilot · Ergebnis</MonoLabel>
                  <div className="mt-3 space-y-2.5">
                    {FIELDS.map((f, i) => (
                      <motion.div
                        key={f.label}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.45,
                          delay: 0.6 + i * 0.5,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="flex items-start justify-between gap-2 rounded-lg bg-white px-2.5 py-2 shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
                      >
                        <span className="font-mono text-[10px] text-gray-400">
                          {f.label}
                        </span>
                        <span
                          className={`text-right text-[12px] font-medium leading-tight ${
                            f.flag ? "text-amber-600" : "text-gray-800"
                          }`}
                        >
                          {f.value}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: done ? 1 : 0 }}
                    transition={{ duration: 0.4 }}
                    className="mt-3 flex items-center gap-1.5 text-emerald-600"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span className="font-mono text-[10px]">
                      Deal strukturiert · bereit zur Prüfung
                    </span>
                  </motion.div>
                </div>
              </div>
            </GlassPanel>
            <p className="mt-3 text-center font-mono text-[11px] text-gray-400">
              Beispielhafte Darstellung auf Basis eines echten WEG-Protokolls
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
