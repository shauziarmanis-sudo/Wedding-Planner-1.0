"use client";

import { useEffect, useState } from "react";
import InvitationDashboardClient from "@/components/invitation/InvitationDashboardClient";
import { getUserInvitation, getInvitationTemplates, getInvitationStats } from "@/actions/invitation.actions";
import { Loader2 } from "lucide-react";

export default function InvitationDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [invitation, templates, stats] = await Promise.all([
          getUserInvitation(),
          getInvitationTemplates(),
          getInvitationStats()
        ]);
        setData({ invitation, templates, stats });
      } catch (error) {
        console.error("Failed to load invitation data", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-white rounded-3xl shadow-sm border border-black/5">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-[#C2185B]" />
          <p className="text-sm font-medium text-gray-500">Memuat modul Undangan Digital...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden">
      <InvitationDashboardClient
        initialInvitation={data?.invitation || null}
        templates={data?.templates || []}
        initialStats={data?.stats || null}
      />
    </div>
  );
}
