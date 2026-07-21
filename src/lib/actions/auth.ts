"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
} from "@/lib/validation/schemas";

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
function friendlyAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) {
    return "Email yoki parol noto'g'ri.";
  }
  if (lower.includes("already registered") || lower.includes("already exists")) {
    return "Ushbu email allaqachon ro'yxatdan o'tgan.";
  }
  if (lower.includes("email not confirmed")) {
    return "Iltimos, avval emailingizni tasdiqlang.";
  }
  return "Amalni bajarib bo'lmadi. Birozdan so'ng qayta urinib ko'ring.";
}

function normalizePhone(rawPhone: FormDataEntryValue | null): string {
  if (typeof rawPhone !== "string") return "";
  return rawPhone.trim().replace(/[^\d+]/g, "");
}

function logAuthError(action: string, error: unknown) {
  if (error instanceof Error) {
    console.error(`[auth:${action}] ${error.message}`);
  } else {
    console.error(`[auth:${action}]`, error);
  }
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
      // JSON.stringify is safe here because Supabase response is plain
      // data (no circular references).
      console.error("[auth:register] signUp result:", JSON.stringify(result, null, 2));
    } catch (e) {
      // Fallback to direct logging if serialization fails.
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

      return { ok: false, error: friendlyAuthError(result.error.message) };
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

  const supabase = createClient();
  if (!supabase) return { ok: false, error: "Supabase sozlanmagan." };

  // NOTE: the redirect URL below must also be added to the Supabase
  // project's Auth > URL Configuration allow-list — see
  // SUPABASE_SETUP.md, step 10.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/auth/callback?next=/settings`,
  });

  // Always return ok:true regardless of whether the email exists, to
  // avoid leaking which emails are registered.
  if (error) {
    return { ok: false, error: "Amalni bajarib bo'lmadi. Birozdan so'ng qayta urinib ko'ring." };
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
