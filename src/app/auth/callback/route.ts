import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/auth/safe-next";

/**
 * Handles redirects from Supabase Auth emails (signup confirmation,
 * password reset, magic link) at:
 *   http://localhost:3000/auth/callback  (add production URL later —
 *   see SUPABASE_SETUP.md step 10 for the Auth redirect allow-list)
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // Only ever redirect to a path on this site — never another origin,
  // including the protocol-relative "//host" and "/\host" forms.
  const next = safeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = createClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
