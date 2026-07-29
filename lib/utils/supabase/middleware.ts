import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function updateSession(request: NextRequest) {
  // 1. Eindeutige Request-ID für Audit-Logging & Fehlerverfolgung generieren
  const requestId = crypto.randomUUID();

  let supabaseResponse = NextResponse.next({
    request: {
      headers: new Headers(request.headers),
    },
  });

  // Request-ID an den Response heften, damit der Client / Server sie matchen kann
  supabaseResponse.headers.set("X-Request-ID", requestId);

  // 2. Supabase Server Client für die Edge-Umgebung initialisieren
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Token serverseitig über den Auth-Server validieren
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // 3. Sicherheits-Header (Enterprise Security Baseline) einziehen
  supabaseResponse.headers.set("X-Frame-Options", "DENY");
  supabaseResponse.headers.set("X-Content-Type-Options", "nosniff");
  supabaseResponse.headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin",
  );
  supabaseResponse.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  );

  // Öffentliche Routen definieren
  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api/public");

  // 4. Strikter Authentifizierungs-Check
  if (!user && !isPublicRoute) {
    url.pathname = "/login";
    // Die originale Ziel-URL für nahtlosen Redirect nach Login speichern
    url.searchParams.set("redirect_to", pathname);

    const redirectResponse = NextResponse.redirect(url);
    redirectResponse.headers.set("X-Request-ID", requestId);
    return redirectResponse;
  }

  // 5. Bereits eingeloggt -> Weg von Auth-Seiten ins Dashboard
  if (
    user &&
    (pathname.startsWith("/login") || pathname.startsWith("/signup"))
  ) {
    url.pathname = "/dashboard";

    const redirectResponse = NextResponse.redirect(url);
    redirectResponse.headers.set("X-Request-ID", requestId);
    return redirectResponse;
  }

  // 6. Enterprise Logging (Optional für Debugging in der Konsole)
  if (process.env.NODE_ENV === "development") {
    console.log(
      `[Middleware] [${requestId}] User: ${user?.email || "Guest"} | Path: ${pathname}`,
    );
  }

  return supabaseResponse;
}

// Konfiguration des Matchers
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
