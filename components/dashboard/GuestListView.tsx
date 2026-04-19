"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { Guest, GuestStats } from "@/types/guest.types";
import { getGuests, getGuestStats, ensureGuestSheet } from "@/actions/guest.actions";
import { getMetadata } from "@/actions/metadata";
import GuestDashboardClient from "../guests/GuestDashboardClient";

export default function GuestListView() {
  const { data: session } = useSession();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [stats, setStats] = useState<GuestStats | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        setLoading(true);
        await ensureGuestSheet();
        const [gData, sData, mData] = await Promise.all([
          getGuests(),
          getGuestStats(),
          getMetadata()
        ]);
        if (mounted) {
          setGuests(gData);
          setStats(sData);
          setMetadata(mData);
        }
      } catch (error) {
        console.error("Error loading guests:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    init();
    return () => { mounted = false; };
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-[#C8975A]" />
      </div>
    );
  }

  // Create token for invitation links
  const spreadsheetId = (session as any)?.spreadsheetId || "";
  const token = typeof window !== 'undefined' ? window.btoa(spreadsheetId) : "";

  return (
    <GuestDashboardClient 
      initialGuests={guests}
      initialStats={stats}
      token={token}
      metadata={metadata}
    />
  );
}

