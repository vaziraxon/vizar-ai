import type { ReactNode } from "react";
import { ActiveApplicationProvider, type ActiveApplication } from "@/components/dashboard/ActiveApplication";
import { WelcomeToast } from "@/components/dashboard/WelcomeToast";
import { CURRENT_APPLICATION, CURRENT_USER } from "@/data/mockData";
import { getLatestApplication } from "@/lib/data/applications";
import { getMyProfile } from "@/lib/data/profiles";
import { visaKindFromType } from "@/lib/dashboard/checklist-template";
import { matchDestinationSlug } from "@/lib/site/destination-match";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { firstNameFromMetadata } from "@/lib/profile/display-name";

const active = (id: string, destination: string, visaType: string): ActiveApplication => ({
  id,
  destination,
  visaType,
  dest: matchDestinationSlug(destination),
  visa: visaKindFromType(visaType),
});

/**
 * Every /dashboard page knows the user's current application (demo mode: the
 * sample one), and greets the user by first name on arrival.
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  let value: ActiveApplication | null = null;
  let firstName = "";
  if (isSupabaseConfigured()) {
    const [result, profile] = await Promise.all([getLatestApplication(), getMyProfile()]);
    if (result.ok && result.data) value = active(result.data.id, result.data.destination_country, result.data.visa_type);
    firstName = (profile.ok && profile.data?.first_name?.trim()) || "";
    if (!firstName) {
      // Google sign-ups: the name lives in the auth metadata, not the profile
      const { data } = (await createClient()?.auth.getUser()) ?? { data: { user: null } };
      firstName = firstNameFromMetadata(data.user?.user_metadata);
    }
  } else {
    value = active("demo", CURRENT_APPLICATION.destination, CURRENT_APPLICATION.visaType);
    firstName = CURRENT_USER.firstName;
  }
  return (
    <ActiveApplicationProvider value={value}>
      {children}
      <WelcomeToast name={firstName} />
    </ActiveApplicationProvider>
  );
}
