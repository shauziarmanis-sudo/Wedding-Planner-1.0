"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { GoogleSheetsService } from "@/lib/googleService";
import { SHEETS_CONFIG } from "@/config/sheets";

export async function getAppStatus(): Promise<{ status: string; createdAt: string }> {
  const metadata = await getMetadata();
  return { 
    status: metadata.app_status || "WEDDING", 
    createdAt: metadata.created_at || new Date().toISOString() 
  };
}

export async function getMetadata(): Promise<any> {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken || !session?.spreadsheetId) {
    return {};
  }

  try {
    const service = new GoogleSheetsService(session.accessToken);
    const rows = await service.readRows(session.spreadsheetId, SHEETS_CONFIG.ranges.metadata);

    if (rows && rows.length > 0) {
      const row = rows[0];
      return {
        userId: row[0],
        email: row[1],
        name: row[2],
        app_status: row[3],
        created_at: row[4],
        updated_at: row[5],
        wedding_date: row[6],
        guest_count: row[7],
        adat_type: row[8],
        adat_secondary: row[9],
      };
    }
  } catch (error) {
    console.error("Error fetching metadata:", error);
  }

  return {};
}
