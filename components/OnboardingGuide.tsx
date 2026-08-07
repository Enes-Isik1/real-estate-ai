"use client";

import { useState } from "react";
import { FileUp, Search, CheckCircle, X } from "lucide-react";

interface OnboardingGuideProps {
  onComplete?: () => void;
}

const steps = [
  {
    title: "1. Deal anlegen",
    desc: "Erstelle dein erstes Objekt, für das du ein Dokument prüfen möchtest.",
    icon: FileUp,
  },
  {
    title: "2. Dokumente hochladen",
    desc: "Lade Exposés oder WEG-Protokolle hoch – die KI startet sofort.",
    icon: Search,
  },
  {
    title: "3. Ergebnisse prüfen",
    desc: "Risiken & Kennzahlen sind sofort für dich strukturiert.",
    icon: CheckCircle,
  },
];

export function OnboardingGuide({ onComplete }: OnboardingGuideProps) {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="relative bg-[#F2EFE9] border border-[#D5CFC3] rounded-2xl p-6 md:p-8 max-w-4xl mx-auto shadow-sm">
      {/* Optionaler Schließen-Button oben rechts für erfahrene User */}
      {onComplete && (
        <button
          onClick={onComplete}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#65605C] hover:bg-[#EAE5DC] hover:text-[#252322] transition-colors"
          title="Onboarding ausblenden"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <h2 className="text-xl font-bold text-[#252322] mb-6">
        Willkommen beim DealPilot Pilotprogramm 🚀
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((step, index) => {
          const isActive = activeStep === index;
          const StepIcon = step.icon;
          return (
            <div
              key={index}
              className={`p-4 rounded-xl border transition-all ${
                isActive
                  ? "bg-white border-[#B3966D] shadow-sm"
                  : "bg-[#EAE5DC] border-transparent opacity-75"
              }`}
            >
              <StepIcon
                className={`w-6 h-6 mb-3 ${isActive ? "text-[#B3966D]" : "text-[#65605C]"}`}
              />
              <h3 className="font-semibold text-[#252322] text-sm">
                {step.title}
              </h3>
              <p className="text-[11px] text-[#65605C] mt-1 leading-relaxed">
                {step.desc}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <span className="text-xs font-mono text-[#65605C]">
          Schritt {activeStep + 1} von 3
        </span>

        <button
          onClick={() => {
            if (activeStep < 2) {
              setActiveStep((prev) => prev + 1);
            } else {
              if (onComplete) onComplete();
            }
          }}
          className="bg-[#252322] text-[#F2EFE9] px-6 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#3D3A38] transition-all shadow-sm cursor-pointer"
        >
          {activeStep < 2 ? "Nächster Schritt →" : "Starten & Ausblenden ✓"}
        </button>
      </div>
    </div>
  );
}
