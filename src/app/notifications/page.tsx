import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { NotificationsList } from "@/components/dashboard/NotificationsList";
import { SupabaseSetupNotice } from "@/components/dev/SupabaseSetupNotice";
import { ErrorState } from "@/components/states/ErrorState";
import { listMyNotifications } from "@/lib/data/notifications";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function NotificationsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <DashboardShell
        title="Bildirishnomalar"
        subtitle="Barcha tizim bildirishnomalarini shu yerdan kuzatib boring."
      >
        <SupabaseSetupNotice />
      </DashboardShell>
    );
  }

  const result = await listMyNotifications();

  return (
    <DashboardShell
      title="Bildirishnomalar"
      subtitle="Barcha tizim bildirishnomalarini shu yerdan kuzatib boring."
    >
      {!result.ok ? (
        <ErrorState description={result.error} />
      ) : (
        <NotificationsList notifications={result.data} />
      )}
    </DashboardShell>
  );
}
