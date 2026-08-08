import { ArrowRight } from "lucide-react";
import { FadeUp, GlassPanel, Section } from "./LandingPrimitives";

const ROWS = [
  {
    problem: "45 Minuten pro WEG-Protokoll, nur um Risiken zu finden",
    solution:
      "Sonderumlagen & Rücklagenrisiken automatisch markiert, in Sekunden",
  },
  {
    problem: "Anfragen versanden zwischen Portal, E-Mail und WhatsApp",
    solution: "Ein Posteingang, ein Format — jede Anfrage strukturiert erfasst",
  },
  {
    problem: "Fehler beim manuellen Abtippen von Exposé-Daten",
    solution: "Direkte Übernahme aus dem Original-PDF, geprüft statt getippt",
  },
  {
    problem: "Kein Überblick, welcher Deal wirklich Priorität hat",
    solution: "Lead-Score pro Anfrage, sofort sichtbar im Dashboard",
  },
];

export function ProblemSolution() {
  return (
    <Section className="py-16 md:py-20">
      <FadeUp>
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-indigo-600">
          Was sich ändert
        </p>
        <h2 className="mt-4 max-w-xl text-2xl font-semibold tracking-tight text-gray-900 md:text-3xl">
          Die Arbeit, die niemand sehen will — automatisiert
        </h2>
      </FadeUp>

      <GlassPanel className="mt-10 divide-y divide-gray-200/70 overflow-hidden">
        {ROWS.map((row, i) => (
          <FadeUp key={i} delay={i * 0.05}>
            <div className="grid items-center gap-3 px-6 py-5 md:grid-cols-[1fr_auto_1fr] md:gap-6 md:px-8">
              <p className="text-[14px] leading-relaxed text-gray-400 line-through decoration-gray-300">
                {row.problem}
              </p>
              <ArrowRight className="hidden h-4 w-4 shrink-0 text-indigo-400 md:block" />
              <p className="text-[14px] font-medium leading-relaxed text-gray-900">
                {row.solution}
              </p>
            </div>
          </FadeUp>
        ))}
      </GlassPanel>
    </Section>
  );
}
