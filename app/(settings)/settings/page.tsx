// app/settings/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/utils/supabase/client";
import {
  ArrowLeft,
  User,
  Key,
  ShieldCheck,
  LogOut,
  Save,
  Sparkles,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    async function getUserData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUserEmail(user.email || "");

      // Optional: Lese gespeicherten API-Key aus dem localStorage
      const savedKey = localStorage.getItem("dealpilot_custom_api_key");
      if (savedKey) setApiKey(savedKey);

      setLoading(false);
    }
    getUserData();
  }, [router, supabase]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("dealpilot_custom_api_key", apiKey);
    setSavedMessage("Einstellungen erfolgreich gespeichert!");
    setTimeout(() => setSavedMessage(""), 3000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Sparkles className="w-6 h-6 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto pb-24 p-6 md:p-8 space-y-8 animate-fade-in-up">
      {/* Zurück-Button */}
      <button
        onClick={() => router.push("/dashboard")}
        className="group flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Zurück zum Dashboard
      </button>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Account & Einstellungen
        </h1>
        <p className="text-gray-500 text-sm">
          Verwalte deine persönlichen Daten, API-Integrationen und
          Sicherheitsoptionen.
        </p>
      </div>

      {savedMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold animate-fade-in">
          ✨ {savedMessage}
        </div>
      )}

      {/* Profil-Sektion */}
      <div className="bg-white border border-gray-200/60 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-500" /> Profil-Informationen
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              E-Mail-Adresse
            </label>
            <input
              type="email"
              disabled
              value={userEmail}
              className="w-full px-4 py-3 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-xl cursor-not-allowed"
            />
            <span className="text-[11px] text-gray-400 mt-1 block">
              Die E-Mail-Adresse ist mit deinem Login-Account verknüpft.
            </span>
          </div>
        </div>
      </div>

      {/* API-Keys & Integrationen */}
      <form
        onSubmit={handleSaveSettings}
        className="bg-white border border-gray-200/60 rounded-3xl p-6 shadow-sm space-y-4"
      >
        <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
          <Key className="w-5 h-5 text-indigo-500" /> API-Konfiguration
        </h3>
        <p className="text-xs text-gray-500">
          Hinterlege optional deinen eigenen OpenAI- oder Anthropic-Schlüssel,
          falls du erweiterte Token-Kontingente nutzen möchtest.
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Benutzerdefinierter API-Key (Optional)
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-4 py-3 text-xs text-gray-700 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Einstellungen speichern
            </button>
          </div>
        </div>
      </form>

      {/* Sicherheit & Logout */}
      <div className="bg-white border border-gray-200/60 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-500" /> Sitzung &
          Sicherheit
        </h3>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-2">
          <div>
            <h4 className="font-bold text-gray-800 text-sm">Ausloggen</h4>
            <p className="text-xs text-gray-500">
              Beende deine aktuelle Sitzung auf diesem Gerät.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Abmelden
          </button>
        </div>
      </div>
    </div>
  );
}
