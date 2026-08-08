import { FadeUp, Section } from "./LandingPrimitives";

export function Definition() {
  return (
    <Section className="py-20 md:py-28" id="produkt">
      <FadeUp>
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-indigo-600">
          Was DealPilot ist
        </p>
        <h2 className="mt-4 max-w-3xl text-2xl font-semibold leading-snug tracking-tight text-gray-900 md:text-3xl">
          Eine Analyse-Engine, die eingehende Anfragen, Exposés und
          WEG-Protokolle liest und in geprüfte, strukturierte Deals verwandelt —
          bevor Sie die erste Zeile selbst gelesen haben.
        </h2>
        <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-gray-500">
          Kein Chat-Assistent, kein generischer PDF-Reader. DealPilot ist auf
          deutsche Maklerdokumente trainiert: Wohnungseigentumsprotokolle,
          Grundbuchauszüge, Exposé-PDFs und Anfrage-Mails. Es erkennt
          Sonderumlagen, Beschlusslagen und Rücklagenrisiken zuverlässig genug,
          dass Sie sich auf das Ergebnis verlassen können — nicht nur auf eine
          Zusammenfassung.
        </p>
      </FadeUp>
    </Section>
  );
}
