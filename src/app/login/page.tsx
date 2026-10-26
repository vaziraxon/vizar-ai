import React from "react";
import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Kirish",
  alternates: { canonical: "/login" },
};

export default function LoginPage() {
  const configured = isSupabaseConfigured();
  return (
    <React.Suspense fallback={<div />}>
      <LoginClient configured={configured} />
    </React.Suspense>
  );
}
