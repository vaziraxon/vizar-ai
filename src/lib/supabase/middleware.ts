import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { getSupabaseEnv } from "./config";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/assessment",
  "/documents",
  "/readiness-score",
  "/ai-interview",
  "/refusal-analysis",
  "/recommendations",
  "/consultation",
  "/applications",
  "/notifications",
  "/reports",
  "/profile",
  "/settings",
  "/agency",
  "/admin",
  "/investor-analytics",
];

const AUTH_ONLY_WHEN_LOGGED_OUT = ["/login", "/register"];

/**
 * Refreshes the Supabase auth session on every request and enforces
 * route protection. Called from the root `src/middleware.ts`.
 *
 * If Supabase isn't configured, this deliberately does nothing (no
 * redirect, no crash) — the app falls back to its demo/setup-notice
 * behavior instead of locking every route behind a login that can't
 * possibly succeed yet.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const env = getSupabaseEnv();
  if (!env) {
    return response;
  }

  const supabase = createServerClient<Database>(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: do not run any code between createServerClient and
  // getUser() — this call refreshes the session token and must happen
  // on every request for SSR auth to keep working.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  const isAuthOnlyWhenLoggedOut = AUTH_ONLY_WHEN_LOGGED_OUT.some(
    (p) => pathname === p
  );

  if (isProtected && !user) {
    const redirectUrl = new URL("/login", request.url);
    // Only ever redirect back to a same-origin path we generated
    // ourselves — never trust a client-supplied absolute URL here.
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthOnlyWhenLoggedOut && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}
