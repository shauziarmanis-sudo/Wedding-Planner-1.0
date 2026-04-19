'use server';

import { nanoid } from "nanoid";
import { getSessionData } from "@/lib/auth";
import { GoogleSheetsService } from "@/lib/googleService";
import { SHEETS_CONFIG } from "@/config/sheets";
import { ChecklistDocument, Religion, DocParty, DocStatus } from "@/types/document.types";
import { DOCUMENT_MASTER_DATA } from "@/lib/kua-master-data";
import { withRateLimit } from "@/lib/rateLimiter";

const DOC_HEADERS = [
  'doc_id', 'religion', 'party', 'category', 'doc_name', 
  'is_required', 'status', 'note', 'created_at', 'updated_at'
];

async function getService() {
  const session = await getSessionData();
  if (!session?.accessToken || !session?.spreadsheetId) {
    throw new Error("Unauthorized");
  }
  return { 
    service: new GoogleSheetsService(session.accessToken), 
    spreadsheetId: session.spreadsheetId 
  };
}

export async function ensureDocumentSheet() {
  try {
    const { service, spreadsheetId } = await getService();
    await service.addSheet(spreadsheetId, SHEETS_CONFIG.tabs.documents, DOC_HEADERS);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

function rowToDoc(row: string[]): ChecklistDocument {
  return {
    doc_id: row[0] || "",
    religion: row[1] || "",
    party: (row[2] as DocParty) || "BERSAMA",
    category: row[3] || "",
    doc_name: row[4] || "",
    is_required: row[5] === "TRUE",
    status: (row[6] as DocStatus) || "PENDING",
    note: row[7] || "",
    created_at: row[8] || "",
    updated_at: row[9] || "",
  };
}

export async function getDocuments(): Promise<{ success: boolean; data?: ChecklistDocument[]; error?: string }> {
  try {
    const { service, spreadsheetId } = await getService();
    const rows = await service.readRows(spreadsheetId, SHEETS_CONFIG.ranges.documents);
    
    if (!rows) return { success: true, data: [] };
    
    const docs = rows.map(rowToDoc).filter(d => d.doc_id !== "");
    return { success: true, data: docs };
  } catch (error: any) {
    // If range not found, it means sheet doesn't exist yet
    if (error.message?.includes('Unable to parse range')) {
      return { success: true, data: [] };
    }
    return { success: false, error: error.message };
  }
}

export async function initDocuments(religion: Religion): Promise<{ success: boolean; error?: string }> {
  try {
    const { service, spreadsheetId } = await getService();
    
    // 1. Ensure sheet exists
    await service.addSheet(spreadsheetId, SHEETS_CONFIG.tabs.documents, DOC_HEADERS);

    // 2. Clear existing standard docs (keep custom if any)
    const existingRows = await service.readRows(spreadsheetId, SHEETS_CONFIG.ranges.documents) || [];
    const customRows = existingRows.filter(row => row[2] === "CUSTOM");
    await service.clearRange(spreadsheetId, SHEETS_CONFIG.ranges.documents);

    // 3. Prepare new docs
    const seedData = DOCUMENT_MASTER_DATA[religion];
    const now = new Date().toISOString();
    
    const newRows = seedData.map(doc => [
      `doc_${nanoid(8)}`,
      religion,
      doc.party,
      doc.category,
      doc.doc_name,
      doc.is_required ? "TRUE" : "FALSE",
      "PENDING",
      "", // note
      now,
      now
    ]);

    const finalRows = [...newRows, ...customRows];

    // 4. Save to sheet
    if (finalRows.length > 0) {
      await service.appendRows(spreadsheetId, SHEETS_CONFIG.ranges.documents, finalRows);
    }

    // 5. Update metadata religion
    const metaRows = await service.readRows(spreadsheetId, SHEETS_CONFIG.ranges.metadata);
    let updatedMetadata = false;
    if (metaRows) {
      for (let i = 0; i < metaRows.length; i++) {
        if (metaRows[i][0] === 'religion') {
           await service.updateRow(spreadsheetId, `Metadata!B${i+2}`, [religion]);
           updatedMetadata = true;
           break;
        }
      }
      if (!updatedMetadata) {
        await service.appendRow(spreadsheetId, "Metadata!A:B", ["religion", religion]);
      }
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function batchUpdateDocumentStatus(updates: { id: string; status: DocStatus }[]): Promise<{ success: boolean; error?: string }> {
  try {
    const { service, spreadsheetId } = await getService();
    const rows = await service.readRows(spreadsheetId, SHEETS_CONFIG.ranges.documents);
    if (!rows) throw new Error("Sheet documents kosong.");

    const batchUpdates: { range: string; values: string[][] }[] = [];
    const now = new Date().toISOString();

    for (const update of updates) {
      const rowIndex = rows.findIndex(r => r[0] === update.id);
      if (rowIndex !== -1) {
        batchUpdates.push({
          range: `${SHEETS_CONFIG.tabs.documents}!G${rowIndex + 2}`,
          values: [[update.status]]
        });
        batchUpdates.push({
          range: `${SHEETS_CONFIG.tabs.documents}!J${rowIndex + 2}`,
          values: [[now]]
        });
      }
    }

    if (batchUpdates.length > 0) {
      await withRateLimit(async () => {
        await service['sheets'].spreadsheets.values.batchUpdate({
          spreadsheetId,
          requestBody: {
            valueInputOption: 'USER_ENTERED',
            data: batchUpdates,
          },
        });
      });
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addCustomDocument(
  data: Omit<ChecklistDocument, 'doc_id' | 'created_at' | 'updated_at' | 'status'>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { service, spreadsheetId } = await getService();
    const now = new Date().toISOString();
    const newDocId = `doc_c_${nanoid(8)}`;

    const rowData = [
      newDocId,
      data.religion,
      "CUSTOM", // force party to CUSTOM
      data.category,
      data.doc_name,
      data.is_required ? "TRUE" : "FALSE",
      "PENDING",
      data.note || "",
      now,
      now
    ];

    await service.appendRow(spreadsheetId, SHEETS_CONFIG.ranges.documents, rowData);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteDocument(doc_id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { service, spreadsheetId } = await getService();
    const rows = await service.readRows(spreadsheetId, SHEETS_CONFIG.ranges.documents);
    if (!rows) throw new Error("No documents found.");

    const rowIndex = rows.findIndex(r => r[0] === doc_id);
    if (rowIndex === -1) throw new Error("Document not found.");

    // It is a custom document if party is CUSTOM, but let's allow deleting any for flexibility.
    await service.clearRow(spreadsheetId, `${SHEETS_CONFIG.tabs.documents}!A${rowIndex + 2}:J${rowIndex + 2}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
