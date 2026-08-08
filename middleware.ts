import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/utils/supabase/middleware";

// Routen, die NICHT geschützt werden sollen
const PUBLIC_ROUTES = ["/", "/pilot", "/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Ist die aktuelle Seite öffentlich?
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // 2. Wenn es eine öffentliche Route ist, machen wir KEINE Session-Prüfung
  // (das verhindert den ungewollten Redirect zum Login)
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // 3. Wenn es keine öffentliche Route ist, führen wir erst jetzt die
  // Supabase Session-Prüfung durch
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
