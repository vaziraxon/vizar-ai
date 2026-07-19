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
    phone: formData.get("phone"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    termsAccepted: formData.get("termsAccepted") === "true",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Ma'lumotlar noto'g'ri." };
  }

  const supabase = createClient();
  if (!supabase) return { ok: false, error: "Supabase sozlanmagan." };

  const { error } = await supabase.auth.signUp({
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

  // The `handle_new_user` trigger in supabase/schema.sql creates the
  // matching profiles row automatically once auth.users gets the new
  // row — no separate profile-creation call is needed here.

  if (error) return { ok: false, error: friendlyAuthError(error.message) };
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
