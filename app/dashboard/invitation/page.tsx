import { getUserInvitation, getInvitationTemplates, getInvitationStats } from "@/actions/invitation.actions";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import InvitationDashboardClient from "@/components/invitation/InvitationDashboardClient";

export default async function InvitationPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signin");

  const [invitation, templates, stats] = await Promise.all([
    getUserInvitation(),
    getInvitationTemplates(),
    getInvitationStats()
  ]);

  return (
    <InvitationDashboardClient
      initialInvitation={invitation}
      templates={templates}
      initialStats={stats}
    />
  );
}
