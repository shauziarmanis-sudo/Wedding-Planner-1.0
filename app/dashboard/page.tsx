import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <DashboardClient
      userName={session?.user?.name || "User"}
      userEmail={session?.user?.email || ""}
      userImage={session?.user?.image || undefined}
      status="WEDDING"
    />
  );
}
