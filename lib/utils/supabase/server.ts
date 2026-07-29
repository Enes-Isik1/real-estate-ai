import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Erstellt einen Supabase-Client für den serverseitigen Einsatz (Server Components, Server Actions, API Routes).
 *
 * Enterprise Features:
 * - Sichere Token-Validierung im Server-Kontext
 * - Automatisches Cookie-Handling für Mandanten-Sessions
 * - Graceful Error Handling bei Schreiboperationen in Read-Only Server-Phasen
 */
export async function createClient() {
  const cookieStore = await cookies();

  // Validierung der Umgebungsvariablen für Fail-Fast-Prinzip im Build/Runtime
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Kritischer Enterprise-Fehler: Supabase URL oder Anon Key sind in den Umgebungsvariablen nicht definiert.",
    );
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        try {
          return cookieStore.getAll();
        } catch (error) {
          console.error("Enterprise Auth Error [Cookie Get All]:", error);
          return [];
        }
      },
      setAll(
        cookiesToSet: { name: string; value: string; options: CookieOptions }[],
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch (error) {
          // Next.js wirft einen Fehler, wenn `set` in reinen Server Components aufgerufen wird.
          // Dies wird absichtlich abgefangen, da die Session-Erneuerung primär über die Middleware läuft.
          // In Server Actions oder Route Handlers funktioniert das Setzen weiterhin einwandfrei.
          process.env.NODE_ENV === "development" &&
            console.warn(
              "Enterprise Notice: Cookie set skipped in read-only server component context (handled by middleware).",
            );
        }
      },
    },
  });
}
