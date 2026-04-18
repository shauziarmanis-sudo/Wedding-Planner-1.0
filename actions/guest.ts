"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { GoogleSheetsService } from "@/lib/googleService";
import { SHEETS_CONFIG } from "@/config/sheets";
import { GuestRecord } from "@/types/wedding";

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now().toString(36);
}

export async function getGuests(): Promise<GuestRecord[]> {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken || !session?.spreadsheetId) return [];

  try {
    const service = new GoogleSheetsService(session.accessToken);
    const rows = await service.readRows(session.spreadsheetId, SHEETS_CONFIG.ranges.guests);
    if (!rows) return [];

    return rows.map((row) => ({
      id: row[0] || "",
      name: row[1] || "",
      category: (row[2] as GuestRecord["category"]) || "REGULAR",
      pax: parseInt(row[3]) || 1,
      status: (row[4] as GuestRecord["status"]) || "PENDING",
      slug: row[5] || "",
      createdAt: row[6] || "",
    }));
  } catch (error) {
    console.error("Error fetching guests:", error);
    return [];
  }
}

export async function addGuest(data: {
  name: string;
  category: string;
  pax: number;
}): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken || !session?.spreadsheetId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const service = new GoogleSheetsService(session.accessToken);
    const id = `guest-${Date.now()}`;
    const slug = generateSlug(data.name);
    const now = new Date().toISOString();

    await service.appendRow(session.spreadsheetId, SHEETS_CONFIG.ranges.guests, [
      id,
      data.name,
      data.category,
      data.pax,
      "PENDING",
      slug,
      now,
    ]);

    return { success: true };
  } catch (error: any) {
    console.error("Error adding guest:", error);
    return { success: false, error: error.message };
  }
}

export async function updateGuestRSVP(
  guestId: string,
  rsvpStatus: "PENDING" | "CONFIRMED" | "DECLINED"
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken || !session?.spreadsheetId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const service = new GoogleSheetsService(session.accessToken);
    const rowIndex = await service.findRowIndex(
      session.spreadsheetId,
      SHEETS_CONFIG.ranges.guests,
      0,
      guestId
    );

    if (rowIndex === null) {
      return { success: false, error: "Guest not found" };
    }

    await service.updateRow(
      session.spreadsheetId,
      `Guests!E${rowIndex}`,
      [rsvpStatus]
    );

    return { success: true };
  } catch (error: any) {
    console.error("Error updating RSVP:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteGuest(guestId: string): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken || !session?.spreadsheetId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const service = new GoogleSheetsService(session.accessToken);
    const rowIndex = await service.findRowIndex(
      session.spreadsheetId,
      SHEETS_CONFIG.ranges.guests,
      0,
      guestId
    );

    if (rowIndex === null) {
      return { success: false, error: "Guest not found" };
    }

    await service.clearRow(session.spreadsheetId, `Guests!A${rowIndex}:G${rowIndex}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting guest:", error);
    return { success: false, error: error.message };
  }
}
