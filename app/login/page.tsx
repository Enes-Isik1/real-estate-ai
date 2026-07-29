"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/utils/supabase/client";
import {
  Lock,
  Mail,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";

// Innere Komponente, die useSearchParams sicher innerhalb einer Suspense-Grenze nutzt
function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect_to") || "/dashboard";
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg("Anmeldung fehlgeschlagen: " + error.message);
      setLoading(false);
    } else {
      router.push(redirectTo);
      router.refresh();
    }
  };

  return (
    <div className="max-w-[420px] w-full bg-slate-900 border border-slate-800/80 rounded-3xl p-8 shadow-2xl shadow-indigo-950/20 space-y-6">
      <div className="space-y-2 text-center lg:text-left">
        <div className="inline-flex lg:hidden p-3 bg-indigo-600 text-white rounded-2xl mb-1 shadow-lg shadow-indigo-500/20">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">
          Willkommen zurück
        </h2>
        <p className="text-xs text-slate-400 font-medium">
          Geben Sie Ihre Anmeldedaten ein, um auf Ihr Dashboard zuzugreifen.
        </p>
      </div>

      {errorMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-xs font-semibold leading-relaxed"
        >
          {errorMsg}
        </motion.div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            E-Mail-Adresse
          </label>
          <div className="relative group">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 transition-colors group-focus-within:text-indigo-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@unternehmen.de"
              className="w-full pl-10 pr-4 py-3 text-sm text-slate-200 bg-slate-950/60 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-600"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Passwort
            </label>
            <a
              href="#"
              className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Passwort vergessen?
            </a>
          </div>
          <div className="relative group">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5 transition-colors group-focus-within:text-indigo-400" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 text-sm text-slate-200 bg-slate-950/60 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-600"
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/25 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Wird angemeldet...</span>
            </div>
          ) : (
            <>
              <span>Anmelden</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </form>

      <div className="pt-4 border-t border-slate-800/60 text-center">
        <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 256-Bit SSL
          Verschlüsselung aktiv
        </p>
      </div>
    </div>
  );
}

// Hauptseite mit Suspense-Boundary (Lösung für den Build-Fehler)
export default function LoginPage() {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-slate-950 font-sans text-slate-100 overflow-hidden">
      {/* LINKE SEITE: Brand Showcase */}
      <div className="hidden lg:flex lg:col-span-7 relative bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-12 flex-col justify-between border-r border-slate-800/60">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3 z-10"
        >
          <div className="p-2.5 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/20 text-white">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-xl font-black tracking-tight text-white">
            DealPilot <span className="text-indigo-400">Enterprise</span>
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-8 z-10 max-w-lg"
        >
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5" /> ISO 27001 & DSGVO Konform
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white leading-tight">
              KI-gestützte Immobilien-Audits auf Enterprise-Niveau.
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Analysieren Sie WEG-Protokolle, Teilungserklärungen und
              Mietverträge in Sekunden.
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800/80">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200">
                  Vollautomatischer Dokumenten-Check
                </h4>
                <p className="text-xs text-slate-400">
                  Erkennt Risiken in Sanierungsplänen sofort.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-xs text-slate-500 z-10"
        >
          © {new Date().getFullYear()} DealPilot Systems Inc. Alle Rechte
          vorbehalten.
        </motion.div>
      </div>

      {/* RECHTE SEITE: Login Form mit Suspense gewrappt */}
      <div className="col-span-1 lg:col-span-5 flex items-center justify-center p-8 bg-slate-900/50 backdrop-blur-xl">
        <Suspense
          fallback={<div className="text-slate-400 text-sm">Lade Login...</div>}
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
