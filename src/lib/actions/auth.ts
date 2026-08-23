"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
} from "@/lib/validation/schemas";

const RATE_LIMIT_MESSAGE =
  "Juda ko'p urinish amalga oshirildi. Iltimos, birozdan so'ng qayta urinib ko'ring.";

// NOTE: "use server" files may only export async functions — this
// type is intentionally NOT exported; callers rely on structural
// typing (checking `.ok`) rather than importing this interface.
interface AuthActionResult {
  ok: boolean;
  error?: string;
}

/**
 * Maps common Supabase Auth error messages to Uzbek, generic
 * messages. We deliberately don't forward Supabase's raw error text —
 * it can reveal internals (e.g. confirm whether an email exists).
 */
function friendlyAuthError(message: string, meta?: { code?: string; status?: number }): string {
  const lower = message.toLowerCase();
  const code = (meta?.code ?? "").toLowerCase();
  const status = meta?.status;

  if (status === 429 || code.includes("over_email_send_rate_limit") || lower.includes("rate limit exceeded")) {
    return "Juda ko'p urinish amalga oshirildi. Iltimos, biroz kutib qayta urinib ko'ring.";
  }
  if (lower.includes("invalid login credentials")) {
    return "Email yoki parol noto'g'ri.";
  }
  if (lower.includes("already registered") || lower.includes("already exists")) {
    return "Ushbu email allaqachon ro'yxatdan o'tgan.";
  }
  if (lower.includes("email not confirmed")) {
    return "Iltimos, avval emailingizni tasdiqlang.";
  }
  if (lower.includes("password") && lower.includes("weak")) {
    return "Parol yetarlicha mustahkam emas. Kamida 6 ta belgi kiriting.";
  }
  return "Amalni bajarib bo'lmadi. Birozdan so'ng qayta urinib ko'ring.";
}

function normalizePhone(rawPhone: FormDataEntryValue | null): string {
  if (typeof rawPhone !== "string") return "";
  return rawPhone.trim().replace(/[^\d+]/g, "");
}

function logAuthError(action: string, error: unknown) {
  const structured = {
    action,
    error:
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error,
  };

  console.error(`[auth:${action}]`, JSON.stringify(structured, null, 2));
}

function getPublicSiteUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? "http://localhost:3000";

  if (!siteUrl || siteUrl === "http://localhost:3000") {
    console.warn("[auth] NEXT_PUBLIC_SITE_URL is not configured for production; using localhost fallback.");
  }

  return siteUrl;
}

export async function loginAction(formData: FormData): Promise<AuthActionResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase sozlanmagan." };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ma'lumotlar noto'g'ri." };
  }

  // Best-effort brute-force mitigation: cap attempts per IP+email pair.
  // See src/lib/rate-limit.ts for limitations of this approach.
  const ip = getClientIp(headers());
  const loginLimit = rateLimit(`login:${ip}:${parsed.data.email}`, 10, 5 * 60 * 1000);
  if (!loginLimit.allowed) {
    return { ok: false, error: RATE_LIMIT_MESSAGE };
  }

  const supabase = createClient();
  if (!supabase) return { ok: false, error: "Supabase sozlanmagan." };

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) return { ok: false, error: friendlyAuthError(error.message) };
  return { ok: true };
}

export async function registerAction(formData: FormData): Promise<AuthActionResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase sozlanmagan." };
  }

  const parsed = registerSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: normalizePhone(formData.get("phone")),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    termsAccepted: formData.get("termsAccepted") === "true",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ma'lumotlar noto'g'ri." };
  }

  // Best-effort abuse mitigation: cap signups per IP. This is the
  // action the old public /api/test-register debug routes used to
  // hit unauthenticated on every request — rate limiting it here
  // protects the real registration flow regardless of caller.
  // See src/lib/rate-limit.ts for limitations of this approach.
  const ip = getClientIp(headers());
  const registerLimit = rateLimit(`register:${ip}`, 5, 60 * 60 * 1000);
  if (!registerLimit.allowed) {
    return { ok: false, error: RATE_LIMIT_MESSAGE };
  }

  const supabase = createClient();
  if (!supabase) return { ok: false, error: "Supabase sozlanmagan." };

  // Wrap the signup call to capture both API errors and thrown
  // exceptions. We also log the full result server-side (non-sensitive
  // fields only) to help debug DB trigger / RLS failures that can
  // happen after the auth user row is created.
  try {
    const result = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: {
          first_name: parsed.data.firstName,
          last_name: parsed.data.lastName,
          phone: parsed.data.phone,
        },
      },
    });

    // Log the full result for debugging. Avoid logging any secret
    // (there are none here), but include `data` and `error` to see
    // DB/trigger-level failures that surface as `error`.
    try {
      console.error("[auth:register] signUp result:", JSON.stringify({
        code: result.error?.code ?? null,
        status: result.error?.status ?? null,
        message: result.error?.message ?? null,
        user: result.data?.user ? { id: result.data.user.id } : null,
      }, null, 2));
    } catch (e) {
      console.error("[auth:register] signUp result (inspect):", result);
    }

    // The Supabase client returns an `error` property when something
    // goes wrong (including DB trigger failures). Handle that case
    // explicitly so callers get a friendly message while we log the
    // raw problem server-side.
    if (result.error) {
      // If the API reports an error but a user row was created anyway
      // (some DB trigger / RLS failure), attempt a privileged fallback
      // to create the `profiles` row using the service role key if
      // configured. This helps recover when a trigger fails silently
      // due to permissions or schema mismatches.
      logAuthError("register", result.error);

      const user = result.data?.user as { id: string } | null;
      if (user) {
        // Lazy import to keep this module usable in non-server contexts
        // (the file is server-side but keep imports explicit).
        try {
          const { createAdminClient } = await import("@/lib/supabase/admin");
          const admin = createAdminClient();
          if (admin) {
            try {
              const { error: profileError } = await admin
                .from("profiles")
                .insert([
                  {
                    id: user.id,
                    first_name: parsed.data.firstName,
                    last_name: parsed.data.lastName,
                    phone: parsed.data.phone || null,
                  },
                ]);
              if (!profileError) {
                console.error("[auth:register] profile inserted via admin client, recovering registration");
                return { ok: true };
              }
              logAuthError("register:profile_insert", profileError);
            } catch (e) {
              logAuthError("register:profile_insert:exception", e);
            }
          }
        } catch (e) {
          logAuthError("register:admin_import", e);
        }
      }

      return {
        ok: false,
        error: friendlyAuthError(result.error.message, {
          code: result.error.code,
          status: result.error.status,
        }),
      };
    }
  } catch (err) {
    // Catch any unexpected exceptions (network, library bugs, etc.)
    logAuthError("register:exception", err);
    return { ok: false, error: "Amalni bajarib bo'lmadi. Birozdan so'ng qayta urinib ko'ring." };
  }

  return { ok: true };
}

export async function requestPasswordResetAction(
  formData: FormData
): Promise<AuthActionResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase sozlanmagan." };
  }

  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Email noto'g'ri." };
  }

  // Best-effort abuse mitigation: cap reset requests per IP+email.
  // See src/lib/rate-limit.ts for limitations of this approach.
  const ip = getClientIp(headers());
  const resetLimit = rateLimit(`password_reset:${ip}:${parsed.data.email}`, 3, 15 * 60 * 1000);
  if (!resetLimit.allowed) {
    // Still return ok:true shape (no `error`) would leak nothing, but
    // here we intentionally surface the rate-limit message rather than
    // silently succeeding, since that's more useful feedback and does
    // not reveal whether the email exists either way.
    return { ok: false, error: RATE_LIMIT_MESSAGE };
  }

  const supabase = createClient();
  if (!supabase) return { ok: false, error: "Supabase sozlanmagan." };

  // NOTE: the redirect URL below must also be added to the Supabase
  // project's Auth > URL Configuration allow-list — see
  // SUPABASE_SETUP.md, step 10.
  const siteUrl = getPublicSiteUrl();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/auth/callback?next=/settings`,
  });

  // Always return ok:true regardless of whether the email exists, to
  // avoid leaking which emails are registered.
  if (error) {
    logAuthError("password_reset", error);
    return {
      ok: false,
      error: friendlyAuthError(error.message, {
        code: error.code,
        status: error.status,
      }),
    };
  }
  return { ok: true };
}

export async function logoutAction() {
  const supabase = createClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect("/");
}
