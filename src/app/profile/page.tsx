import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ProfileForm } from "@/components/dashboard/ProfileForm";
import { SupabaseSetupNotice } from "@/components/dev/SupabaseSetupNotice";
import { ErrorState } from "@/components/states/ErrorState";
import { getMyProfile } from "@/lib/data/profiles";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function ProfilePage() {
  if (!isSupabaseConfigured()) {
    return (
      <DashboardShell title="Profil" subtitle="Shaxsiy ma'lumotlaringizni ko'ring va yangilang.">
        <SupabaseSetupNotice />
      </DashboardShell>
    );
  }

  const supabase = createClient();
  const { data: userData } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const result = await getMyProfile();

  return (
    <DashboardShell title="Profil" subtitle="Shaxsiy ma'lumotlaringizni ko'ring va yangilang.">
      {!result.ok ? (
        <ErrorState description={result.error} />
      ) : (
        <ProfileForm
          profile={
            result.data ?? {
              id: userData.user?.id ?? "",
              first_name: "",
              last_name: "",
              phone: "",
              avatar_url: null,
              preferred_language: "uz",
              account_type: "individual",
              onboarding_completed: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          }
          email={userData.user?.email ?? ""}
        />
      )}
    </DashboardShell>
  );
}
