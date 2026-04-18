"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { GoogleSheetsService } from "@/lib/googleService";
import { SHEETS_CONFIG } from "@/config/sheets";

export async function getAppStatus(): Promise<{ status: string; createdAt: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken || !session?.spreadsheetId) {
    return { status: "WEDDING", createdAt: new Date().toISOString() };
  }

  try {
    const service = new GoogleSheetsService(session.accessToken);
    const rows = await service.readRows(session.spreadsheetId, SHEETS_CONFIG.ranges.metadata);

    if (rows && rows.length > 0) {
      return {
        status: rows[0][3] || "WEDDING",
        createdAt: rows[0][4] || new Date().toISOString(),
      };
    }
  } catch (error) {
    console.error("Error fetching app status:", error);
  }

  return { status: "WEDDING", createdAt: new Date().toISOString() };
}
