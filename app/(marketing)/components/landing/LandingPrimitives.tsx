"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

/**
 * Shared primitives for the pilot landing page.
 * Follows the established Clean Tech Light Mode system:
 * - Background: #FAFAFA
 * - Accent: Indigo #4F46E5, used sparingly
 * - Cards: white, rounded-2xl, subtle shadow
 * Here extended with a light glass treatment (bg-white/60 + backdrop-blur)
 * for the pilot page specifically — not the app's internal screens.
 */

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/80 px-3 py-1 text-xs font-medium tracking-wide text-indigo-700">
      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
      {children}
    </span>
  );
}

export function GlassPanel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-gray-200/70 bg-white/60 backdrop-blur-xl shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}

export function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`mx-auto w-full max-w-6xl px-6 md:px-8 ${className}`}
    >
      {children}
    </section>
  );
}

export function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function MonoLabel({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-gray-400">
      {children}
    </span>
  );
}
