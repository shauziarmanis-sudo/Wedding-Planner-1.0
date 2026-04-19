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
        if (row[0] === 'religion') result.religion = row[1];
      }

      return result;
    }
  } catch (error) {
    console.error("Error fetching metadata:", error);
  }

  return {};
}

export async function getMetadataPublic(spreadsheetId: string): Promise<any> {
  try {
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, '\n');
    
    if (!serviceAccountEmail || !serviceAccountKey) return {};

    const { google } = require('googleapis');
    const auth = new google.auth.JWT(
      serviceAccountEmail,
      null,
      serviceAccountKey,
      ['https://www.googleapis.com/auth/spreadsheets']
    );
    const sheets = google.sheets({ version: 'v4', auth });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: SHEETS_CONFIG.ranges.metadata,
    });
    
    const rows = response.data.values;
    if (rows && rows.length > 0) {
      const firstRow = rows[0];
      const result: any = {
        bride_name: firstRow[2]?.split(' & ')[0] || "Bride",
        groom_name: firstRow[2]?.split(' & ')[1] || "Groom",
        wedding_date: firstRow[6],
        venue_name: "Venue Name", // Should be in metadata sheet
        venue_address: "Venue Address",
      };
      
      for (const row of rows) {
        if (row[0] === 'bride_name') result.bride_name = row[1];
        if (row[0] === 'groom_name') result.groom_name = row[1];
        if (row[0] === 'wedding_date') result.wedding_date = row[1];
        if (row[0] === 'venue_name') result.venue_name = row[1];
        if (row[0] === 'venue_address') result.venue_address = row[1];
        if (row[0] === 'akad_time') result.akad_time = row[1];
        if (row[0] === 'resepsi_time') result.resepsi_time = row[1];
      }
      return result;
    }
  } catch (error) {
    console.error("Error fetching public metadata:", error);
  }
  return {};
}

