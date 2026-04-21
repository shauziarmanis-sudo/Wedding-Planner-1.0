import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getAppStatus, getMetadata } from "@/actions/metadata";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const appStatus = await getAppStatus();
  const metadata = await getMetadata();

  return (
    <DashboardClient
      userName={user?.user_metadata?.full_name || user?.email || "User"}
      userEmail={user?.email || ""}
      userImage={user?.user_metadata?.avatar_url || undefined}
      status={appStatus.status as "WEDDING" | "MARRIED"}
      initialReligion={metadata.religion || null}
    />
  );
}
