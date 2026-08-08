import { Building2, Users2, FileSearch } from "lucide-react";
import { FadeUp, GlassPanel, Section } from "./LandingPrimitives";

const PROFILES = [
  {
    icon: Building2,
    title: "Makler mit hohem Anfragevolumen",
    body: "20+ Anfragen pro Woche über Portale, Website und E-Mail. Sie brauchen eine Vorqualifizierung, die Zeit spart, nicht nur Zeit verlagert.",
  },
  {
    icon: FileSearch,
    title: "ETW-Spezialisten",
    body: "Sie verkaufen Eigentumswohnungen und öffnen jedes Mal ein WEG-Protokoll auf Risiken. DealPilot markiert Sonderumlagen und Rücklagenlücken automatisch.",
  },
  {
    icon: Users2,
    title: "Teams & Maklerbüros",
    body: "Mehrere Makler, ein Posteingang. Sie brauchen eine einheitliche, nachvollziehbare Struktur für jeden Deal — unabhängig davon, wer ihn bearbeitet.",
  },
];

export function Audience() {
  return (
    <Section className="py-16 md:py-20">
      <FadeUp>
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-indigo-600">
          Für wen
        </p>
        <h2 className="mt-4 max-w-xl text-2xl font-semibold tracking-tight text-gray-900 md:text-3xl">
          Gebaut für professionelle Makler, nicht für Gelegenheitsnutzer
        </h2>
      </FadeUp>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {PROFILES.map((p, i) => (
          <FadeUp key={p.title} delay={i * 0.08}>
            <GlassPanel className="h-full p-6 transition-shadow hover:shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
                <p.icon
                  className="h-4.5 w-4.5 text-indigo-600"
                  strokeWidth={1.75}
                />
              </div>
              <h3 className="mt-4 text-[15px] font-semibold text-gray-900">
                {p.title}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-gray-500">
                {p.body}
              </p>
            </GlassPanel>
          </FadeUp>
        ))}
      </div>
    </Section>
  );
}
