import SideBar from "@/components/SideBar";
import DashboardHeader from "@/components/DashboardHeader";
import { createClient } from "@/lib/utils/supabase/server"; // Passe den Pfad zu deiner server.ts an falls nötig!

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Supabase Client über deine server.ts initialisieren
  const supabase = await createClient();

  // 2. Eingeloggten User abrufen
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let currentUserName = "User";

  if (user) {
    // Versuch 1: Schau nach, ob der Name in den Supabase User-Metadaten steht
    if (user.user_metadata?.full_name) {
      currentUserName = user.user_metadata.full_name;
    } else if (user.user_metadata?.name) {
      currentUserName = user.user_metadata.name;
    } else {
      // Versuch 2: Falls du eine "profiles" Tabelle hast, lade den Namen direkt aus der Datenbank
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, name")
        .eq("id", user.id)
        .single();

      if (profile?.full_name) {
        currentUserName = profile.full_name;
      } else if (profile?.name) {
        currentUserName = profile.name;
      } else if (user.email) {
        // Versuch 3: Fallback auf den Teil vor dem @ der E-Mail-Adresse
        currentUserName = user.email.split("@")[0];
      }
    }
  }

  return (
    <div className="flex h-screen bg-stone-100 text-slate-900 overflow-hidden">
      {/* 1. Linke Sidebar */}
      <SideBar />

      {/* 2. Rechter Hauptbereich */}
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        {/* Der Header bekommt den dynamisch ermittelten Namen */}
        <DashboardHeader userName={currentUserName} />

        {/* Nur der Content-Bereich darunter scrollt sauber */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
