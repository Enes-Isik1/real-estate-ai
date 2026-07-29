import { createClient } from '@supabase/supabase-js';

// 1. Variablen explizit aus process.env abrufen
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 2. Robuste Prüfung mit detaillierter Fehlermeldung
if (!supabaseUrl) {
  throw new Error("Fehler: NEXT_PUBLIC_SUPABASE_URL ist in der .env.local nicht definiert.");
}

if (!supabaseServiceKey) {
  throw new Error("Fehler: SUPABASE_SERVICE_ROLE_KEY ist in der .env.local nicht definiert.");
}

// 3. Client sicher initialisieren
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});