import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes — no auth required
  const publicPaths = ["/", "/races", "/auth", "/faq", "/privacy", "/terms", "/responsible-gambling"];
  const isPublic =
    publicPaths.includes(pathname) ||
    pathname.startsWith("/races/") ||
    pathname.startsWith("/courses/") ||
    pathname.startsWith("/horses/") ||
    pathname.startsWith("/trainers/") ||
    pathname.startsWith("/jockeys/") ||
    pathname.startsWith("/festivals/") ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/") ||
    pathname.includes(".");

  if (isPublic) return NextResponse.next();

  // Auth routes
  if (pathname.startsWith("/auth/callback")) return NextResponse.next();

  // Protected routes
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const redirectUrl = new URL("/auth/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|og-image.png).*)"],
};