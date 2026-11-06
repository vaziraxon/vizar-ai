import type { ReactNode } from "react";
import { ActiveApplicationProvider, type ActiveApplication } from "@/components/dashboard/ActiveApplication";
import { CURRENT_APPLICATION } from "@/data/mockData";
import { getLatestApplication } from "@/lib/data/applications";
import { visaKindFromType } from "@/lib/dashboard/checklist-template";
import { matchDestinationSlug } from "@/lib/site/destination-match";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const active = (id: string, destination: string, visaType: string): ActiveApplication => ({
  id,
  destination,
  visaType,
  dest: matchDestinationSlug(destination),
  visa: visaKindFromType(visaType),
});

/** Every /dashboard page knows the user's current application (demo mode: the sample one). */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  let value: ActiveApplication | null = null;
  if (isSupabaseConfigured()) {
    const result = await getLatestApplication();
    if (result.ok && result.data) value = active(result.data.id, result.data.destination_country, result.data.visa_type);
  } else {
    value = active("demo", CURRENT_APPLICATION.destination, CURRENT_APPLICATION.visaType);
  }
  return <ActiveApplicationProvider value={value}>{children}</ActiveApplicationProvider>;
}
