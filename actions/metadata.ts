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
      const firstRow = rows[0];
      const result: any = {
        userId: firstRow[0],
        email: firstRow[1],
        name: firstRow[2],
        app_status: firstRow[3],
        created_at: firstRow[4],
        updated_at: firstRow[5],
        wedding_date: firstRow[6],
        guest_count: firstRow[7],
        adat_type: firstRow[8],
        adat_secondary: firstRow[9],
      };

      // Also scan all rows for key-value pairs (to support legacy append mode)
      for (const row of rows) {
        if (row[0] === 'adat_type') result.adat_type = row[1];
        if (row[0] === 'adat_secondary') result.adat_secondary = row[1];
        if (row[0] === 'wedding_date') result.wedding_date = row[1];
        if (row[0] === 'guest_count_estimate') result.guest_count = row[1];
      }

      return result;
    }
  } catch (error) {
    console.error("Error fetching metadata:", error);
  }

  return {};
}
