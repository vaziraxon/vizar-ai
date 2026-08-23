import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getSupabaseEnv } from "./config";
import { isAdminEmail } from "./authz";

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
      getAll(): ReturnType<typeof request.cookies.getAll> {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
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

  // Role-gated sections. By this point an unauthenticated request has
  // already been redirected to /login above (both /admin and /agency
  // are in PROTECTED_PREFIXES), so `user` is guaranteed non-null here.
  // See src/lib/supabase/authz.ts for why /admin works the way it does.
  if (user) {
    const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");
    if (isAdminRoute && !isAdminEmail(user.email)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    const isAgencyRoute = pathname === "/agency" || pathname.startsWith("/agency/");
    if (isAgencyRoute) {
      // Access if either: the profile is set to the "agency" account
      // type (self-service via Settings), or the user is listed in
      // agency_members (no UI populates this table today, but honor
      // it if it's ever set directly in Supabase).
      //
      // Typed loosely here (matching the SupabaseClient<any, any, any>
      // convention already used by every src/lib/data/*.ts file via
      // getAuthedContext in _shared.ts) — the strictly Database-typed
      // client's query builder collapses specific-column .select()
      // results to `never` in this supabase-js version, so the rest
      // of the codebase sidesteps it the same way rather than fighting
      // the generics for a query this simple.
      const authzClient = supabase as SupabaseClient<any, any, any>;
      const { data: profile } = await authzClient
        .from("profiles")
        .select("account_type")
        .eq("id", user.id)
        .maybeSingle();

      let allowed = profile?.account_type === "agency";
      if (!allowed) {
        const { data: membership } = await authzClient
          .from("agency_members")
          .select("id")
          .eq("member_user_id", user.id)
          .limit(1)
          .maybeSingle();
        allowed = !!membership;
      }

      if (!allowed) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return response;
}
