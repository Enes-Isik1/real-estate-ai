"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import { FadeUp, GlassPanel, Section } from "./LandingPrimitives";

type FormState = "idle" | "submitting" | "done";

export function PilotApplication() {
  const [state, setState] = useState<FormState>("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("submitting");

    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      // Replace with the real endpoint, e.g. /api/pilot-application
      await fetch("/api/pilot-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // Fail silently for the pilot form; surface a toast in production
    } finally {
      setState("done");
    }
  }

  return (
    <Section id="bewerbung" className="py-20 md:py-28">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1fr]">
        <FadeUp>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-indigo-600">
            Pilotprogramm
          </p>
          <h2 className="mt-4 text-2xl font-semibold leading-snug tracking-tight text-gray-900 md:text-3xl">
            12 Plätze für Makler, die als Erste testen wollen
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-gray-500">
            Kein Self-Service-Signup. Wir richten DealPilot gemeinsam mit Ihnen
            auf Ihre Dokumente ein und begleiten die ersten Wochen persönlich.
            Eine kurze Bewerbung genügt.
          </p>

          <ul className="mt-8 space-y-3">
            {[
              "Persönliches Onboarding, kein Self-Service",
              "Kostenlos für die gesamte Pilotphase",
              "Direkter Draht ins Produktteam",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-2.5 text-[14px] text-gray-600"
              >
                <CheckCircle2
                  className="h-4 w-4 shrink-0 text-indigo-500"
                  strokeWidth={1.75}
                />
                {item}
              </li>
            ))}
          </ul>
        </FadeUp>

        <FadeUp delay={0.1}>
          <GlassPanel className="p-6 md:p-8">
            {state === "done" ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-10 text-center"
              >
                <CheckCircle2
                  className="h-8 w-8 text-emerald-500"
                  strokeWidth={1.5}
                />
                <p className="mt-4 text-[15px] font-medium text-gray-900">
                  Bewerbung eingegangen
                </p>
                <p className="mt-1.5 max-w-xs text-[13.5px] text-gray-500">
                  Wir melden uns innerhalb von zwei Werktagen mit den nächsten
                  Schritten.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Name" name="name" required />
                  <Field label="Maklerbüro" name="company" required />
                </div>
                <Field label="E-Mail" name="email" type="email" required />
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-gray-700">
                    Anfragen pro Woche
                  </label>
                  <select
                    name="volume"
                    required
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-[14px] text-gray-800 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="">Bitte wählen</option>
                    <option value="1-10">1–10</option>
                    <option value="10-30">10–30</option>
                    <option value="30+">30+</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-gray-700">
                    Worauf möchten Sie DealPilot zuerst ansetzen?
                    <span className="ml-1 font-normal text-gray-400">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    name="message"
                    rows={3}
                    className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-[14px] text-gray-800 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    placeholder="z. B. WEG-Protokolle für ETW-Verkäufe"
                  />
                </div>

                <button
                  type="submit"
                  disabled={state === "submitting"}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-70"
                >
                  {state === "submitting" && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {state === "submitting"
                    ? "Wird gesendet…"
                    : "Bewerbung senden"}
                </button>
                <p className="text-center text-[11.5px] text-gray-400">
                  Keine Zahlungsdaten erforderlich. Antwort in 2 Werktagen.
                </p>
              </form>
            )}
          </GlassPanel>
        </FadeUp>
      </div>
    </Section>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-medium text-gray-700">
        {label}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-[14px] text-gray-800 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
      />
    </div>
  );
}
