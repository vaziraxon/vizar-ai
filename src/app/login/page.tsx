import React from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  const configured = isSupabaseConfigured();
  return (
    <React.Suspense fallback={<div />}>
      <LoginClient configured={configured} />
    </React.Suspense>
  );
}
