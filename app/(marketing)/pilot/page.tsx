import type { Metadata } from "next";
import { PilotNav } from "@/app/(marketing)/components/landing/Pilotnav";
import { Hero } from "@/app/(marketing)/components/landing/Hero";
import { Definition } from "@/app/(marketing)/components/landing/Definition";
import { Audience } from "@/app/(marketing)/components/landing/Audience";
import { ProblemSolution } from "@/app/(marketing)/components/landing/Problems";
import { ShowcaseTabs } from "@/app/(marketing)/components/landing/Showcase";
import { PilotApplication } from "@/app/(marketing)/components/landing/Pilotapplication";
import { PilotFooter } from "@/app/(marketing)/components/landing/Pilotfooter";

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
