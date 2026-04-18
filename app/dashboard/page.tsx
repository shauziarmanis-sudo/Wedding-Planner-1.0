import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getAppStatus } from "@/actions/metadata";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const appStatus = await getAppStatus();

  return (
    <DashboardClient
      userName={session?.user?.name || "User"}
      userEmail={session?.user?.email || ""}
      userImage={session?.user?.image || undefined}
      status={appStatus.status as "WEDDING" | "MARRIED"}
    />
  );
}
