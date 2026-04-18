"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function getAppMetadata() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  
  // Skeleton: Later fetch from Google Sheets
  return {
    status: "WEDDING",
    createdAt: new Date().toISOString(),
  };
}
