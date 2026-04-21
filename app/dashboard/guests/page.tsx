import { getGuests, getGuestStats } from "@/actions/guest.actions";
import { getMetadata } from "@/actions/metadata";
import GuestDashboardClient from "@/components/guests/GuestDashboardClient";
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from "next/navigation";

export default async function GuestsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signin");
  const guests = await getGuests();
  const stats = await getGuestStats();
  const metadata = await getMetadata();

  return (
    <GuestDashboardClient 
      initialGuests={guests} 
      initialStats={stats} 
      metadata={metadata}
    />
  );
}
