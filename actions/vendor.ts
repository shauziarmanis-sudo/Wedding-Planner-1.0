"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { GoogleSheetsService } from "@/lib/googleService";
import { SHEETS_CONFIG } from "@/config/sheets";
import { VendorRecord } from "@/types/wedding";

export async function getVendors(): Promise<VendorRecord[]> {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken || !session?.spreadsheetId) return [];

  try {
    const service = new GoogleSheetsService(session.accessToken);
    const rows = await service.readRows(session.spreadsheetId, SHEETS_CONFIG.ranges.vendors);
    if (!rows) return [];

    return rows
      .filter((row) => row[0])
      .map((row) => ({
        id: row[0] || "",
        category: row[1] || "",
        name: row[2] || "",
        totalCost: parseFloat(row[3]) || 0,
        paidAmount: parseFloat(row[4]) || 0,
        status: (row[5] as VendorRecord["status"]) || "UNPAID",
        dueDate: row[6] || "",
        notes: row[7] || "",
      }));
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return [];
  }
}

export async function addVendor(data: {
  category: string;
  name: string;
  totalCost: number;
  paidAmount: number;
  dueDate: string;
  notes?: string;
}): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken || !session?.spreadsheetId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const service = new GoogleSheetsService(session.accessToken);
    const id = `vendor-${Date.now()}`;
    const unpaid = data.totalCost - data.paidAmount;
    const status = unpaid <= 0 ? "PAID" : data.paidAmount > 0 ? "PARTIAL" : "UNPAID";

    await service.appendRow(session.spreadsheetId, SHEETS_CONFIG.ranges.vendors, [
      id,
      data.category,
      data.name,
      data.totalCost,
      data.paidAmount,
      status,
      data.dueDate,
      data.notes || "",
    ]);

    return { success: true };
  } catch (error: any) {
    console.error("Error adding vendor:", error);
    return { success: false, error: error.message };
  }
}

export async function updateVendorPayment(
  vendorId: string,
  newPaidAmount: number
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken || !session?.spreadsheetId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const service = new GoogleSheetsService(session.accessToken);
    const rows = await service.readRows(session.spreadsheetId, SHEETS_CONFIG.ranges.vendors);
    if (!rows) return { success: false, error: "No vendor data" };

    let rowIndex: number | null = null;
    let totalCost = 0;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] === vendorId) {
        rowIndex = i + 2;
        totalCost = parseFloat(rows[i][3]) || 0;
        break;
      }
    }

    if (rowIndex === null) return { success: false, error: "Vendor not found" };

    const remaining = totalCost - newPaidAmount;
    const status = remaining <= 0 ? "PAID" : newPaidAmount > 0 ? "PARTIAL" : "UNPAID";

    await service.updateRow(
      session.spreadsheetId,
      `Vendors!E${rowIndex}:F${rowIndex}`,
      [newPaidAmount, status]
    );

    return { success: true };
  } catch (error: any) {
    console.error("Error updating vendor payment:", error);
    return { success: false, error: error.message };
  }
}
