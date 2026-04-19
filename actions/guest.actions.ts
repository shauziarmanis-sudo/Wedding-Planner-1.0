'use server';

import { nanoid } from "nanoid";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { GoogleSheetsService } from "@/lib/googleService";
import { SHEETS_CONFIG } from "@/config/sheets";
import { Guest, GuestCategory, RSVPStatus, GiftType, GuestStats, GuestImportRow } from "@/types/guest.types";
import { revalidatePath } from "next/cache";

const GUEST_HEADERS = [
  'guest_id', 'name', 'category', 'phone_wa', 'address', 'pax_estimate', 
  'rsvp_status', 'actual_pax', 'gift_amount', 'gift_type', 'rsvp_at', 
  'table_number', 'seat_notes', 'invitation_sent', 'invitation_sent_at', 
  'notes', 'created_at'
];

async function getAuthService() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken || !session?.spreadsheetId) {
    throw new Error("Unauthorized");
  }
  return { 
    service: new GoogleSheetsService(session.accessToken), 
    spreadsheetId: session.spreadsheetId 
  };
}

// Public service (uses a provided access token or service account - but here we use the one from the token)
// For the public RSVP page, we'll need a way to access the sheet.
// Since we don't have a service account in the requirements, 
// we'll assume the token in the URL is a "proxy" or we use a dedicated guest-access logic.
// However, the prompt suggests encoding spreadsheetId in the URL.
// To make it work PUBLICLY without a session, we'd need a service account.
// I'll implement a helper that uses the app's internal service account if available, 
// or I'll use the developer's provided pattern.

export async function ensureGuestSheet(): Promise<{ success: boolean; error?: string }> {
  try {
    const { service, spreadsheetId } = await getAuthService();
    await service.addSheet(spreadsheetId, SHEETS_CONFIG.tabs.guests, GUEST_HEADERS);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

function rowToGuest(row: string[]): Guest {
  return {
    guest_id: row[0] || "",
    name: row[1] || "",
    category: (row[2] as GuestCategory) || "KENALAN",
    phone_wa: row[3] || "",
    address: row[4] || "",
    pax_estimate: parseInt(row[5]) || 0,
    rsvp_status: (row[6] as RSVPStatus) || "BELUM_KONFIRMASI",
    actual_pax: parseInt(row[7]) || 0,
    gift_amount: parseFloat(row[8]) || 0,
    gift_type: (row[9] as GiftType) || "TIDAK_ADA",
    rsvp_at: row[10] || null,
    table_number: row[11] || "",
    seat_notes: row[12] || "",
    invitation_sent: row[13] === "YA",
    invitation_sent_at: row[14] || null,
    notes: row[15] || "",
    created_at: row[16] || "",
  };
}

export async function getGuests(): Promise<Guest[]> {
  const { service, spreadsheetId } = await getAuthService();
  const rows = await service.readRows(spreadsheetId, SHEETS_CONFIG.ranges.guests);
  if (!rows) return [];
  return rows.map(rowToGuest).filter(g => g.guest_id !== "");
}

export async function addGuest(data: Partial<Guest>): Promise<string> {
  const { service, spreadsheetId } = await getAuthService();
  const guest_id = `g_${nanoid(8)}`;
  const now = new Date().toISOString();
  
  const rowData = [
    guest_id,
    data.name || "",
    data.category || "KENALAN",
    data.phone_wa || "",
    data.address || "",
    data.pax_estimate || 1,
    "BELUM_KONFIRMASI",
    0, // actual_pax
    0, // gift_amount
    "TIDAK_ADA",
    "", // rsvp_at
    data.table_number || "",
    data.seat_notes || "",
    "TIDAK", // invitation_sent
    "", // invitation_sent_at
    data.notes || "",
    now
  ];

  await service.appendRow(spreadsheetId, SHEETS_CONFIG.ranges.guests, rowData);
  revalidatePath("/dashboard/guests");
  return guest_id;
}

export async function updateGuest(guest_id: string, data: Partial<Guest>): Promise<void> {
  const { service, spreadsheetId } = await getAuthService();
  const rows = await service.readRows(spreadsheetId, SHEETS_CONFIG.ranges.guests);
  if (!rows) return;

  const rowIndex = rows.findIndex(r => r[0] === guest_id);
  if (rowIndex === -1) return;

  // Map fields to columns
  // 0: guest_id, 1: name, 2: category, 3: phone_wa, 4: address, 5: pax_estimate, ...
  const updates: { col: number; val: any }[] = [];
  if (data.name !== undefined) updates.push({ col: 1, val: data.name });
  if (data.category !== undefined) updates.push({ col: 2, val: data.category });
  if (data.phone_wa !== undefined) updates.push({ col: 3, val: data.phone_wa });
  if (data.address !== undefined) updates.push({ col: 4, val: data.address });
  if (data.pax_estimate !== undefined) updates.push({ col: 5, val: data.pax_estimate });
  if (data.table_number !== undefined) updates.push({ col: 11, val: data.table_number });
  if (data.seat_notes !== undefined) updates.push({ col: 12, val: data.seat_notes });
  if (data.notes !== undefined) updates.push({ col: 15, val: data.notes });

  for (const update of updates) {
    const colLetter = String.fromCharCode(65 + update.col);
    await service.updateRow(spreadsheetId, `guests!${colLetter}${rowIndex + 2}`, [update.val]);
  }
  
  revalidatePath("/dashboard/guests");
}

export async function deleteGuest(guest_id: string): Promise<void> {
  const { service, spreadsheetId } = await getAuthService();
  const rows = await service.readRows(spreadsheetId, SHEETS_CONFIG.ranges.guests);
  if (!rows) return;

  const rowIndex = rows.findIndex(r => r[0] === guest_id);
  if (rowIndex === -1) return;

  // Get numeric sheetId for the guests tab
  const sheetId = await service.getSheetId(spreadsheetId, SHEETS_CONFIG.tabs.guests);
  
  // +1 because rowIndex is 0-based from data rows (after header), 
  // so actual sheet row is rowIndex + 1 (header is row 0 in 0-based)
  await service.deleteRow(spreadsheetId, sheetId, rowIndex + 1);
  revalidatePath("/dashboard/guests");
}

export async function markInvitationSent(guest_ids: string[]): Promise<void> {
  const { service, spreadsheetId } = await getAuthService();
  const rows = await service.readRows(spreadsheetId, SHEETS_CONFIG.ranges.guests);
  if (!rows) return;

  const now = new Date().toISOString();
  for (const id of guest_ids) {
    const rowIndex = rows.findIndex(r => r[0] === id);
    if (rowIndex !== -1) {
      await service.updateRow(spreadsheetId, `guests!N${rowIndex + 2}`, ["YA"]);
      await service.updateRow(spreadsheetId, `guests!O${rowIndex + 2}`, [now]);
    }
  }
  revalidatePath("/dashboard/guests");
}

export async function recordGift(guest_id: string, amount: number, type: GiftType): Promise<void> {
  const { service, spreadsheetId } = await getAuthService();
  const rows = await service.readRows(spreadsheetId, SHEETS_CONFIG.ranges.guests);
  if (!rows) return;

  const rowIndex = rows.findIndex(r => r[0] === guest_id);
  if (rowIndex === -1) return;

  await service.updateRow(spreadsheetId, `guests!I${rowIndex + 2}`, [amount]);
  await service.updateRow(spreadsheetId, `guests!J${rowIndex + 2}`, [type]);
  revalidatePath("/dashboard/guests");
}

/**
 * PUBLIC ACTION: updateRSVP
 * Since this is public, we need the spreadsheetId from the token.
 * We also need a way to use the API without a user session.
 * In a real "Zero Infra" app, we'd use the service account credentials from env vars.
 */
export async function updateRSVP(
  guest_id: string, 
  status: RSVPStatus, 
  actual_pax: number, 
  token: string // Base64 encoded spreadsheetId (or JWT)
): Promise<{ success: boolean; error?: string }> {
  try {
    // Decode spreadsheetId from token
    const spreadsheetId = Buffer.from(token, 'base64').toString();
    
    // We need an API key or service account to write to the sheet publicly.
    // For this implementation, we assume GoogleSheetsService can use a 
    // service account if no token is provided, or we use a global admin token.
    // SECURE WAY: Use a Service Account (JSON in ENV)
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, '\n');
    
    if (!serviceAccountEmail || !serviceAccountKey) {
      throw new Error("Public access not configured (Service Account missing)");
    }

    const { google } = require('googleapis');
    const auth = new google.auth.JWT(
      serviceAccountEmail,
      null,
      serviceAccountKey,
      ['https://www.googleapis.com/auth/spreadsheets']
    );
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Find guest row
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'guests!A2:Q',
    });
    
    const rows = response.data.values;
    if (!rows) throw new Error("Guest list empty");

    const rowIndex = rows.findIndex((r: any) => r[0] === guest_id);
    if (rowIndex === -1) throw new Error("Guest not found");

    const now = new Date().toISOString();
    
    // Update RSVP Status (G), Actual Pax (H), RSVP At (K)
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `guests!G${rowIndex + 2}:H${rowIndex + 2}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[status, actual_pax]] },
    });
    
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `guests!K${rowIndex + 2}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[now]] },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Public RSVP Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getGuestStats(): Promise<GuestStats> {
  const guests = await getGuests();
  
  const stats: GuestStats = {
    total_guests: guests.length,
    total_pax_estimate: guests.reduce((sum, g) => sum + g.pax_estimate, 0),
    rsvp_hadir: guests.filter(g => g.rsvp_status === 'HADIR').length,
    rsvp_tidak_hadir: guests.filter(g => g.rsvp_status === 'TIDAK_HADIR').length,
    rsvp_belum: guests.filter(g => g.rsvp_status === 'BELUM_KONFIRMASI').length,
    total_pax_confirmed: guests.reduce((sum, g) => sum + g.actual_pax, 0),
    total_gifts: guests.reduce((sum, g) => sum + g.gift_amount, 0),
    invitation_sent_count: guests.filter(g => g.invitation_sent).length,
    by_category: []
  };

  const categories: GuestCategory[] = ['KELUARGA_PRIA', 'KELUARGA_WANITA', 'SAHABAT', 'REKAN_KERJA', 'KENALAN', 'VIP'];
  stats.by_category = categories.map(cat => ({
    category: cat,
    count: guests.filter(g => g.category === cat).length,
    confirmed_pax: guests.filter(g => g.category === cat).reduce((sum, g) => sum + g.actual_pax, 0)
  }));

  return stats;
}

/**
 * Public Data Fetch for Invitation Page
 */
export async function getGuestPublic(guest_id: string, token: string): Promise<Guest | null> {
  try {
    const spreadsheetId = Buffer.from(token, 'base64').toString();
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, '\n');
    
    if (!serviceAccountEmail || !serviceAccountKey) return null;

    const { google } = require('googleapis');
    const auth = new google.auth.JWT(serviceAccountEmail, null, serviceAccountKey, ['https://www.googleapis.com/auth/spreadsheets']);
    const sheets = google.sheets({ version: 'v4', auth });
    
    const response = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'guests!A2:Q' });
    const rows = response.data.values;
    if (!rows) return null;

    const row = rows.find((r: any) => r[0] === guest_id);
    return row ? rowToGuest(row) : null;
  } catch (e) {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// BATCH OPERATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Batch insert guests from Excel import.
 * Validates that name is not empty, builds rows, and calls appendRows().
 */
export async function bulkAddGuests(
  guests: GuestImportRow[]
): Promise<{ success: boolean; added: number; errors: string[] }> {
  try {
    const { service, spreadsheetId } = await getAuthService();
    const now = new Date().toISOString();
    const errors: string[] = [];
    const validRows: (string | number)[][] = [];

    for (let i = 0; i < guests.length; i++) {
      const g = guests[i];
      if (!g.name || g.name.trim() === '') {
        errors.push(`Baris ${i + 1}: Nama kosong, dilewati.`);
        continue;
      }

      const guest_id = `g_${nanoid(8)}`;
      validRows.push([
        guest_id,
        g.name.trim(),
        g.category || 'KENALAN',
        g.phone_wa || '',
        '', // address
        g.pax_estimate || 1,
        'BELUM_KONFIRMASI',
        0, // actual_pax
        0, // gift_amount
        'TIDAK_ADA',
        '', // rsvp_at
        '', // table_number
        '', // seat_notes
        'TIDAK', // invitation_sent
        '', // invitation_sent_at
        g.notes || '',
        now,
      ]);
    }

    if (validRows.length > 0) {
      await service.appendRows(spreadsheetId, SHEETS_CONFIG.ranges.guests, validRows);
    }

    revalidatePath("/dashboard/guests");
    return { success: true, added: validRows.length, errors };
  } catch (error: any) {
    return { success: false, added: 0, errors: [error.message] };
  }
}

/**
 * Mark multiple guests as invitation sent using batchUpdateValues.
 * Updates column N (invitation_sent = YA) and O (invitation_sent_at = timestamp).
 */
export async function markBulkInvitationSent(
  guest_ids: string[]
): Promise<{ success: boolean }> {
  try {
    const { service, spreadsheetId } = await getAuthService();
    const rows = await service.readRows(spreadsheetId, SHEETS_CONFIG.ranges.guests);
    if (!rows) return { success: false };

    const now = new Date().toISOString();
    const batchData: { range: string; values: (string | number)[][] }[] = [];

    for (const id of guest_ids) {
      const rowIndex = rows.findIndex(r => r[0] === id);
      if (rowIndex !== -1) {
        batchData.push({
          range: `guests!N${rowIndex + 2}:O${rowIndex + 2}`,
          values: [['YA', now]],
        });
      }
    }

    if (batchData.length > 0) {
      await service.batchUpdateValues(spreadsheetId, batchData);
    }

    revalidatePath("/dashboard/guests");
    return { success: true };
  } catch (error: any) {
    console.error("markBulkInvitationSent error:", error);
    return { success: false };
  }
}

