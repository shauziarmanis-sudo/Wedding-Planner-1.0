"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { GoogleSheetsService } from "@/lib/googleService";
import { SHEETS_CONFIG } from "@/config/sheets";
import { Vendor, VendorFormInput, BudgetSummary, VendorStatus } from "@/types/vendor.types";
import { nanoid } from "nanoid";
import { z } from "zod";

// ── Zod Schemas ──
const VendorFormSchema = z.object({
  category: z.string(),
  vendor_name: z.string().min(1),
  contact_name: z.string(),
  phone_wa: z.string(),
  instagram: z.string(),
  estimated_cost: z.number().min(0),
  actual_cost: z.number().min(0),
  dp_amount: z.number().min(0),
  dp_date: z.string(),
  contract_signed: z.enum(["YA", "TIDAK", "PROSES"]),
  notes: z.string(),
});

function getSessionData() {
  return getServerSession(authOptions);
}

function parseVendor(row: string[]): Vendor {
  const actual = parseFloat(row[7]) || 0;
  const paid = parseFloat(row[10]) || 0;
  return {
    vendor_id: row[0] || "",
    category: row[1] as Vendor["category"],
    vendor_name: row[2] || "",
    contact_name: row[3] || "",
    phone_wa: row[4] || "",
    instagram: row[5] || "",
    estimated_cost: parseFloat(row[6]) || 0,
    actual_cost: actual,
    dp_amount: parseFloat(row[8]) || 0,
    dp_date: row[9] || null,
    paid_amount: paid,
    remaining_cost: actual - paid,
    status: (row[11] || "BELUM_BAYAR") as VendorStatus,
    payment_notes: row[12] || "",
    contract_signed: (row[13] || "TIDAK") as Vendor["contract_signed"],
    contract_date: row[14] || null,
    vendor_rating: parseInt(row[15]) || null,
    notes: row[16] || "",
    created_at: row[17] || "",
  };
}

async function ensureBudgetSheet(service: GoogleSheetsService, spreadsheetId: string) {
  await service.addSheetWithHeaders(
    spreadsheetId,
    SHEETS_CONFIG.tabs.budget,
    [
      "vendor_id", "category", "vendor_name", "contact_name", "phone_wa", "instagram",
      "estimated_cost", "actual_cost", "dp_amount", "dp_date", "paid_amount", "status",
      "payment_notes", "contract_signed", "contract_date", "vendor_rating", "notes", "created_at"
    ]
  );
}

// ── 1. Get Vendors ──
export async function getVendors(): Promise<Vendor[]> {
  const session = await getSessionData();
  if (!session?.accessToken || !session?.spreadsheetId) return [];

  try {
    const service = new GoogleSheetsService(session.accessToken);
    await ensureBudgetSheet(service, session.spreadsheetId);

    const rows = await service.readRows(session.spreadsheetId, SHEETS_CONFIG.ranges.budget);
    if (!rows) return [];

    return rows.filter((r) => r[0] && r[11] !== "BATAL").map(parseVendor);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return [];
  }
}

// ── 2. Get Budget Summary ──
export async function getBudgetSummary(): Promise<BudgetSummary> {
  const vendors = await getVendors();

  let total_estimated = 0;
  let total_actual = 0;
  let total_paid = 0;
  let total_unpaid = 0;
  let vendors_lunas = 0;
  let vendors_belum = 0;

  const catMap = new Map<string, { total: number; paid: number }>();

  vendors.forEach((v) => {
    total_estimated += v.estimated_cost;
    const cost = v.actual_cost > 0 ? v.actual_cost : v.estimated_cost;
    total_actual += cost;
    total_paid += v.paid_amount;
    total_unpaid += Math.max(0, cost - v.paid_amount);

    if (v.status === "LUNAS") vendors_lunas++;
    else if (v.status === "BELUM_BAYAR") vendors_belum++;

    const cat = catMap.get(v.category) || { total: 0, paid: 0 };
    cat.total += cost;
    cat.paid += v.paid_amount;
    catMap.set(v.category, cat);
  });

  return {
    total_estimated,
    total_actual,
    total_paid,
    total_unpaid,
    vendors_count: vendors.length,
    vendors_lunas,
    vendors_belum,
    budget_variance: total_actual - total_estimated,
    by_category: Array.from(catMap.entries()).map(([cat, data]) => ({
      category: cat as Vendor["category"],
      ...data,
    })),
  };
}

// ── 3. Add Vendor ──
export async function addVendor(data: VendorFormInput): Promise<{ success: boolean; error?: string }> {
  const session = await getSessionData();
  if (!session?.accessToken || !session?.spreadsheetId) return { success: false, error: "Unauthorized" };

  const parsed = VendorFormSchema.safeParse(data);
  if (!parsed.success) {
    console.error("Vendor validation error:", parsed.error.format());
    return { success: false, error: "Data tidak valid: " + parsed.error.issues[0].message };
  }

  try {
    const service = new GoogleSheetsService(session.accessToken);
    await ensureBudgetSheet(service, session.spreadsheetId);

    const vendor_id = `v_${nanoid(8)}`;
    const d = parsed.data;
    
    // Auto status
    let status = "BELUM_BAYAR";
    if (d.dp_amount > 0) {
      if (d.dp_amount >= (d.actual_cost || d.estimated_cost)) status = "LUNAS";
      else status = "DP_LUNAS";
    }

    await service.appendRow(session.spreadsheetId, SHEETS_CONFIG.ranges.budget, [
      vendor_id,
      d.category,
      d.vendor_name,
      d.contact_name,
      d.phone_wa,
      d.instagram,
      d.estimated_cost,
      d.actual_cost,
      d.dp_amount,
      d.dp_date,
      d.dp_amount, // initially paid_amount = dp_amount
      status,
      "",
      d.contract_signed,
      "",
      "",
      d.notes,
      new Date().toISOString()
    ]);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ── 4. Record Payment ──
export async function recordPayment(vendor_id: string, amount: number, notes: string): Promise<{ success: boolean; error?: string }> {
  const session = await getSessionData();
  if (!session?.accessToken || !session?.spreadsheetId) return { success: false, error: "Unauthorized" };

  try {
    const service = new GoogleSheetsService(session.accessToken);
    const rowIndex = await service.findRowIndex(session.spreadsheetId, SHEETS_CONFIG.ranges.budget, 0, vendor_id);
    if (rowIndex === null) return { success: false, error: "Vendor tidak ditemukan" };

    const rows = await service.readRows(session.spreadsheetId, SHEETS_CONFIG.ranges.budget);
    const row = rows![rowIndex - 2];
    
    const actual_cost = parseFloat(row[7]) || parseFloat(row[6]) || 0;
    const dp_amount = parseFloat(row[8]) || 0;
    const current_paid = parseFloat(row[10]) || 0;
    
    const new_paid = current_paid + amount;
    
    // Auto-update status
    let status = "BELUM_BAYAR";
    if (new_paid >= actual_cost) status = "LUNAS";
    else if (new_paid > dp_amount && new_paid < actual_cost) status = "PARTIAL";
    else if (new_paid === dp_amount && new_paid > 0) status = "DP_LUNAS";

    // Update paid_amount, status, payment_notes
    await service.updateRow(session.spreadsheetId, `Budget!K${rowIndex}:M${rowIndex}`, [
      new_paid,
      status,
      notes
    ]);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ── 5. Delete Vendor (Soft Delete) ──
export async function deleteVendor(vendor_id: string): Promise<{ success: boolean; error?: string }> {
  const session = await getSessionData();
  if (!session?.accessToken || !session?.spreadsheetId) return { success: false, error: "Unauthorized" };

  try {
    const service = new GoogleSheetsService(session.accessToken);
    const rowIndex = await service.findRowIndex(session.spreadsheetId, SHEETS_CONFIG.ranges.budget, 0, vendor_id);
    if (rowIndex === null) return { success: false, error: "Vendor tidak ditemukan" };

    // Set status to BATAL (column L is 12th column -> index 11)
    await service.updateRow(session.spreadsheetId, `Budget!L${rowIndex}`, ["BATAL"]);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ── 6. Get Unpaid Vendors (For Bridge Logic) ──
export async function getUnpaidVendors(): Promise<Vendor[]> {
  const vendors = await getVendors();
  return vendors.filter(v => v.remaining_cost > 0 && v.status !== "LUNAS" && v.status !== "BATAL");
}
