import { getGuests, getGuestStats } from "@/actions/guest.actions";
import { getMetadata } from "@/actions/metadata";
import GuestDashboardClient from "@/components/guests/GuestDashboardClient";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function GuestsPage() {
  const session = await getServerSession(authOptions);
  const guests = await getGuests();
  const stats = await getGuestStats();
  const metadata = await getMetadata();

  // Create token for invitation links (Base64 spreadsheetId)
  const token = Buffer.from(session?.spreadsheetId || "").toString('base64');

  return (
    <GuestDashboardClient 
      initialGuests={guests} 
      initialStats={stats} 
      token={token}
      metadata={metadata}
    />
  );
}
