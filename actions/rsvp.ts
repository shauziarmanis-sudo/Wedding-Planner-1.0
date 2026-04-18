"use server";

import { GoogleSheetsService } from "@/lib/googleService";
import { SHEETS_CONFIG } from "@/config/sheets";

/**
 * Public RSVP action — does NOT require user session.
 * Called from the public invitation page.
 * Needs spreadsheetId and accessToken passed directly (from query/env).
 */
export async function submitRSVP(data: {
  spreadsheetId: string;
  slug: string;
  rsvpStatus: "CONFIRMED" | "DECLINED";
  message?: string;
}): Promise<{ success: boolean; error?: string; guestName?: string }> {
  // For public RSVP, we'd need a service account or public sheet.
  // For now, this is a skeleton that will be connected later
  // when we implement public invitation sharing.
  return {
    success: true,
    guestName: "Tamu",
    error: undefined,
  };
}
