import type { Metadata } from "next";
import { PilotNav } from "@/app/components/Pilotnav";
import { Hero } from "@/app/components/Hero";
import { Definition } from "@/app/components/Definition";
import { Audience } from "@/app/components/Audience";
import { ProblemSolution } from "@/app/components/Problems";
import { ShowcaseTabs } from "@/app/components/Showcase";
import { PilotApplication } from "@/app/components/Pilotapplication";
import { PilotFooter } from "@/app/components/Pilotfooter";

export const metadata: Metadata = {
  title: "DealPilot — Pilotprogramm für Immobilienmakler",
  description:
    "DealPilot verwandelt Anfragen, Exposés und WEG-Protokolle in strukturierte Deals — in unter 60 Sekunden. Jetzt für das exklusive Pilotprogramm bewerben.",
};

export default function PilotLandingPage() {
  return (
    <main className="min-h-screen bg-[#F2EFE9] text-[#252322] antialiased selection:bg-[#B3966D] selection:text-white">
      <PilotNav />
      <Hero />
      <Definition />
      <Audience />
      <ProblemSolution />
      <ShowcaseTabs />
      <PilotApplication />
      <PilotFooter />
    </main>
  );
}
