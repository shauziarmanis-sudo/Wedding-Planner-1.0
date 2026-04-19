"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { GoogleSheetsService } from "@/lib/googleService";
import { withRateLimit } from "@/lib/rateLimiter";
import { SHEETS_CONFIG } from "@/config/sheets";
import { MASTER_CHECKLIST } from "@/lib/checklist-master-data";
import { ChecklistTask, ChecklistProgress, UserProfile, TaskPhase, TaskStatus, AdatSwitchResult } from "@/types/checklist.types";
import { filterTasksByAdat, AdatType, ADAT_TYPES } from "@/lib/adat-registry";
import { nanoid } from "nanoid";
import { z } from "zod";
import { subDays } from "date-fns";

// ── Zod Schemas ──
const UpdateStatusSchema = z.object({
  task_id: z.string().min(1),
  status: z.enum(["BELUM", "PROSES", "SELESAI", "SKIP"]),
  notes: z.string().optional(),
});

const UserProfileSchema = z.object({
  adat_type: z.enum(ADAT_TYPES as [string, ...string[]]),
  adat_secondary: z.enum(ADAT_TYPES as [string, ...string[]]).optional(),
  wedding_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guest_count_estimate: z.number().int().positive(),
  pasangan_pria_suku: z.string().optional(),
  pasangan_wanita_suku: z.string().optional(),
});

const AddTaskSchema = z.object({
  phase_label: z.enum(["H-6 Bulan", "H-5 Bulan", "H-4 Bulan", "H-3 Bulan", "H-2 Bulan", "H-1 Bulan"]),
  days_before: z.number().int().nonnegative().optional(),
  category: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  is_required: z.boolean(),
  assignee: z.enum(["PENGANTIN_PRIA", "PENGANTIN_WANITA", "BERDUA", "KELUARGA"]),
});

// ── Helpers ──
function getSessionData() {
  return getServerSession(authOptions);
}

function parseRow(row: string[], weddingDate?: string): ChecklistTask {
  const daysBefore = parseInt(row[2]) || 0;
  
  let deadlineDate: Date | undefined = undefined;
  let isOverdue = false;
  if (weddingDate) {
    deadlineDate = subDays(new Date(weddingDate), daysBefore);
    if (deadlineDate < new Date() && row[9] !== "SELESAI") {
      isOverdue = true;
    }
  }

  let adatTags: AdatType[] | ['ALL'] = ['ALL'];
  try {
    if (row[6]) adatTags = JSON.parse(row[6]);
  } catch (e) {
    // Fallback if it's old format (string instead of JSON)
    if (row[6] && row[6] !== 'ALL') {
      adatTags = row[6].split(',') as any;
    }
  }

  return {
    task_id: row[0] || "",
    phase_label: (row[1] || "H-6 Bulan") as TaskPhase,
    days_before: daysBefore,
    category: row[3] as ChecklistTask["category"],
    title: row[4] || "",
    description: row[5] || "",
    adat_tags: adatTags,
    is_required: row[7] === "TRUE",
    is_custom: row[8] === "TRUE",
    status: (row[9] || "BELUM") as TaskStatus,
    completed_at: row[10] || null,
    assignee: row[11] as ChecklistTask["assignee"],
    notes: row[12] || "",
    added_by_adat_switch: row[13] === "TRUE",
    deadline_date: deadlineDate,
    is_overdue: isOverdue,
  };
}

function taskToRow(task: ChecklistTask): string[] {
  return [
    task.task_id,
    task.phase_label,
    task.days_before.toString(),
    task.category,
    task.title,
    task.description,
    JSON.stringify(task.adat_tags),
    task.is_required ? "TRUE" : "FALSE",
    task.is_custom ? "TRUE" : "FALSE",
    task.status,
    task.completed_at || "",
    task.assignee,
    task.notes || "",
    task.added_by_adat_switch ? "TRUE" : "FALSE",
  ];
}

// ── 1. Init Checklist ──
export async function initChecklist(
  profile: z.infer<typeof UserProfileSchema>
): Promise<{ success: boolean; taskCount: number; error?: string }> {
  const session = await getSessionData();
  if (!session?.accessToken || !session?.spreadsheetId) {
    return { success: false, taskCount: 0, error: "Unauthorized" };
  }

  const parsed = UserProfileSchema.safeParse(profile);
  if (!parsed.success) {
    return { success: false, taskCount: 0, error: "Data profil tidak valid" };
  }

  try {
    const service = new GoogleSheetsService(session.accessToken);
    
    // Ensure the sheet exists before trying to read it
    await service.addSheetWithHeaders(
      session.spreadsheetId, 
      SHEETS_CONFIG.tabs.checklist, 
      ['task_id', 'phase_label', 'days_before', 'category', 'title', 'description', 'adat_tags', 'is_required', 'is_custom', 'status', 'completed_at', 'assignee', 'notes', 'added_by_adat_switch']
    );

    let existing: string[][] | null = null;
    try {
      existing = await service.readRows(session.spreadsheetId, SHEETS_CONFIG.ranges.checklist);
    } catch (e) {
      // ignore
    }

    if (existing && existing.length > 0) {
      return { success: true, taskCount: existing.length, error: "Checklist sudah ada" };
    }

    const filtered = filterTasksByAdat(MASTER_CHECKLIST as any, parsed.data.adat_type as AdatType, parsed.data.adat_secondary as AdatType);

    const rowsToAppend = filtered.map((task) => [
      `ck_${nanoid(8)}`,
      task.phase_label,
      task.days_before,
      task.category,
      task.title,
      task.description,
      JSON.stringify(task.adat_tags),
      task.is_required ? "TRUE" : "FALSE",
      "FALSE", // is_custom
      "BELUM", // status
      "", // completed_at
      task.assignee,
      "", // notes
      "FALSE", // added_by_adat_switch
    ]);

    // Batch append all rows at once
    await service.appendRows(session.spreadsheetId, SHEETS_CONFIG.ranges.checklist, rowsToAppend);

    // Update Metadata
    await updateMetadataAfterInit(service, session.spreadsheetId, parsed.data);

    return { success: true, taskCount: filtered.length };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Error init checklist:", msg);
    return { success: false, taskCount: 0, error: msg };
  }
}

async function updateMetadataAfterInit(service: GoogleSheetsService, spreadsheetId: string, data: any) {
  // Try to find if metadata exists and update it, simple append for now.
  // Assuming 'Metadata' sheet has columns: Key, Value
  // We'll append if we can't find it easily. A real app might update properly.
  // Actually, we'll skip complex update for now unless needed, or just append rows if missing.
  try {
     const metadataRows = [
       ["adat_type", data.adat_type],
       ["wedding_date", data.wedding_date],
       ["guest_count_estimate", data.guest_count_estimate.toString()],
     ];
     if (data.adat_secondary) {
        metadataRows.push(["adat_secondary", data.adat_secondary]);
     }
     await service.appendRows(spreadsheetId, "Metadata!A:B", metadataRows);
  } catch (e) {
    console.error("Failed to write metadata", e);
  }
}

// ── 2. Get Checklist ──
export async function getChecklist(
  filters?: {
    phase?: TaskPhase
    assignee?: ChecklistTask['assignee']
    status?: TaskStatus | 'NOT_SELESAI'
    category?: ChecklistTask['category']
    show_custom?: boolean
  }
): Promise<ChecklistTask[]> {
  const session = await getSessionData();
  if (!session?.accessToken || !session?.spreadsheetId) return [];

  try {
    const service = new GoogleSheetsService(session.accessToken);
    const rows = await service.readRows(session.spreadsheetId, SHEETS_CONFIG.ranges.checklist);
    if (!rows) return [];

    // Need wedding date from metadata to calculate deadlines
    let weddingDate: string | undefined;
    try {
      const metadata = await service.readRows(session.spreadsheetId, "Metadata!A:B");
      if (metadata) {
        const dateRow = metadata.find(r => r[0] === 'wedding_date');
        if (dateRow) weddingDate = dateRow[1];
      }
    } catch(e) {}

    let tasks = rows.filter((r) => r[0]).map(r => parseRow(r, weddingDate));
    
    if (filters) {
      if (filters.phase) tasks = tasks.filter((t) => t.phase_label === filters.phase);
      if (filters.assignee) tasks = tasks.filter((t) => t.assignee === filters.assignee);
      if (filters.category) tasks = tasks.filter((t) => t.category === filters.category);
      if (filters.status) {
        if (filters.status === 'NOT_SELESAI') {
          tasks = tasks.filter((t) => t.status !== 'SELESAI');
        } else {
          tasks = tasks.filter((t) => t.status === filters.status);
        }
      }
      if (filters.show_custom !== undefined) {
        tasks = tasks.filter((t) => t.is_custom === filters.show_custom);
      }
    }
    return tasks;
  } catch (error) {
    console.error("Error fetching checklist:", error);
    return [];
  }
}

// ── 3. Update Task Status ──
export async function updateTaskStatus(
  input: z.infer<typeof UpdateStatusSchema>
): Promise<{ success: boolean; error?: string }> {
  const session = await getSessionData();
  if (!session?.accessToken || !session?.spreadsheetId) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = UpdateStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Data tidak valid" };
  }

  try {
    const service = new GoogleSheetsService(session.accessToken);
    const rowIndex = await service.findRowIndex(
      session.spreadsheetId,
      SHEETS_CONFIG.ranges.checklist,
      0,
      parsed.data.task_id
    );

    if (rowIndex === null) {
      return { success: false, error: "Task tidak ditemukan" };
    }

    const completedAt = parsed.data.status === "SELESAI" ? new Date().toISOString() : "";
    const notes = parsed.data.notes ?? "";

    // Columns: J is status (index 9), K is completed_at (index 10), L is assignee (11), M is notes (12).
    // Wait, let's verify columns:
    // A=0: task_id, B=1: phase_label, C=2: days_before, D=3: category, E=4: title, F=5: description
    // G=6: adat_tags, H=7: is_required, I=8: is_custom, J=9: status, K=10: completed_at, L=11: assignee, M=12: notes, N=13: added_by_adat_switch
    
    // We want to update status, completed_at, and notes. Notes is column M.
    // However, googleSheetsService.updateRow only accepts one array. Let's read the row first to update safely, or just update the specific cells.
    
    // Better to fetch row, modify, and update the whole row to prevent column offset issues.
    const allRows = await service.readRows(session.spreadsheetId, SHEETS_CONFIG.ranges.checklist);
    const targetRowArray = allRows ? allRows[rowIndex - 2] : null; // rowIndex is 1-based + header
    
    if (!targetRowArray) {
      return { success: false, error: "Task data not found" };
    }
    
    targetRowArray[9] = parsed.data.status;
    targetRowArray[10] = completedAt;
    targetRowArray[12] = notes;
    
    await service.updateRow(
      session.spreadsheetId,
      `Checklist!A${rowIndex}:N${rowIndex}`,
      targetRowArray
    );

    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: msg };
  }
}

// ── 4. Get Checklist Progress ──
export async function getChecklistProgress(): Promise<{
  overall: { total: number; completed: number; percentage: number };
  by_phase: ChecklistProgress[];
  by_assignee: Record<string, { total: number; completed: number }>;
  critical_overdue: ChecklistTask[];
}> {
  const session = await getSessionData();
  if (!session?.accessToken || !session?.spreadsheetId) return { overall: {total:0, completed:0, percentage:0}, by_phase: [], by_assignee: {}, critical_overdue: [] };

  try {
    const tasks = await getChecklist();
    const uniquePhases = Array.from(new Set(tasks.map((t) => t.phase_label)));
    
    const by_phase = uniquePhases.map((phase) => {
      const phaseTasks = tasks.filter((t) => t.phase_label === phase);
      const completed = phaseTasks.filter((t) => t.status === "SELESAI" || t.status === "SKIP").length;
      const total = phaseTasks.length;
      return {
        phase,
        total,
        completed,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        overdue_count: phaseTasks.filter(t => t.is_overdue).length,
      };
    });

    const overallTotal = tasks.length;
    const overallCompleted = tasks.filter((t) => t.status === "SELESAI" || t.status === "SKIP").length;

    const assignees = ["PENGANTIN_PRIA", "PENGANTIN_WANITA", "BERDUA", "KELUARGA"];
    const by_assignee: Record<string, {total: number; completed: number}> = {};
    assignees.forEach(a => {
      const aTasks = tasks.filter(t => t.assignee === a);
      by_assignee[a] = {
        total: aTasks.length,
        completed: aTasks.filter(t => t.status === "SELESAI" || t.status === "SKIP").length
      }
    });

    const critical_overdue = tasks.filter(t => t.is_overdue).slice(0, 5); // top 5 overdue

    return {
      overall: {
        total: overallTotal,
        completed: overallCompleted,
        percentage: overallTotal > 0 ? Math.round((overallCompleted / overallTotal) * 100) : 0
      },
      by_phase,
      by_assignee,
      critical_overdue
    };
  } catch (error) {
    console.error("Error fetching progress:", error);
    return { overall: {total:0, completed:0, percentage:0}, by_phase: [], by_assignee: {}, critical_overdue: [] };
  }
}


// ── 5. Add Custom Task ──
export async function addCustomTask(
  input: z.infer<typeof AddTaskSchema>
): Promise<{ success: boolean; error?: string; task_id?: string }> {
  const session = await getSessionData();
  if (!session?.accessToken || !session?.spreadsheetId) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = AddTaskSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Data tidak valid" };
  }

  try {
    const service = new GoogleSheetsService(session.accessToken);
    const taskId = `ck_${nanoid(8)}`;

    const newTaskRow = [
      taskId,
      parsed.data.phase_label,
      (parsed.data.days_before || 0).toString(),
      parsed.data.category,
      parsed.data.title,
      parsed.data.description,
      JSON.stringify(["ALL"]), // adat_tags
      parsed.data.is_required ? "TRUE" : "FALSE",
      "TRUE", // is_custom
      "BELUM", // status
      "", // completed_at
      parsed.data.assignee,
      "", // notes
      "FALSE", // added_by_adat_switch
    ];

    await service.appendRow(session.spreadsheetId, SHEETS_CONFIG.ranges.checklist, newTaskRow);

    return { success: true, task_id: taskId };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: msg };
  }
}

// ── 6. Preview Adat Switch ──
export async function previewAdatSwitch(
  new_adat: AdatType,
  new_adat_secondary?: AdatType
): Promise<{ success: boolean; data?: AdatSwitchResult; error?: string }> {
  const session = await getSessionData();
  if (!session?.accessToken || !session?.spreadsheetId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const tasks = await getChecklist();
    
    const tasks_removed: ChecklistTask[] = [];
    const tasks_kept: ChecklistTask[] = [];
    const tasks_completed_kept: ChecklistTask[] = [];

    // 1. Analyze existing tasks
    for (const task of tasks) {
      if (task.is_custom) {
        tasks_kept.push(task);
        continue;
      }

      const matchesNewAdat = task.adat_tags.includes('ALL' as any) || 
                             task.adat_tags.includes(new_adat) || 
                             (new_adat_secondary && task.adat_tags.includes(new_adat_secondary));

      if (matchesNewAdat) {
        tasks_kept.push(task);
      } else {
        // Doesn't match new adat. Should be removed unless it's completed.
        if (task.status === 'SELESAI') {
          tasks_completed_kept.push(task);
        } else {
          tasks_removed.push(task);
        }
      }
    }

    // 2. Identify new tasks to add
    const existingTitles = new Set([...tasks_kept, ...tasks_completed_kept].map(t => t.title));
    const potentialNewTasks = filterTasksByAdat(MASTER_CHECKLIST as any, new_adat, new_adat_secondary);
    
    const tasks_added = potentialNewTasks
      .filter(t => !existingTitles.has(t.title))
      .map(t => ({
        ...t,
        task_id: `ck_${nanoid(8)}`,
        is_custom: false,
        status: 'BELUM' as TaskStatus,
        completed_at: null,
        notes: '',
        added_by_adat_switch: true
      }) as ChecklistTask);

    // 3. Generate Warnings
    const conflict_warnings: string[] = [];
    const inProgressRemoved = tasks_removed.filter(t => t.status === 'PROSES');
    if (inProgressRemoved.length > 0) {
      conflict_warnings.push(`Terdapat ${inProgressRemoved.length} task yang sedang dalam status PROSES namun akan dinonaktifkan.`);
    }

    if (new_adat === 'BATAK') {
      conflict_warnings.push("Pernikahan adat Batak membutuhkan koordinasi keluarga besar. Pastikan untuk merencanakan Martonggo Raja sejak awal.");
    }
    if (new_adat === 'BALI') {
      conflict_warnings.push("Adat Bali mewajibkan penentuan Dewasa Ayu (hari baik) oleh Sulinggih. Lakukan ini sebelum memesan vendor lain.");
    }

    return { 
      success: true, 
      data: {
        tasks_added,
        tasks_removed,
        tasks_kept,
        tasks_completed_kept,
        conflict_warnings
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ── 7. Execute Adat Switch ──
export async function executeAdatSwitch(
  new_adat: AdatType,
  new_adat_secondary?: AdatType
): Promise<{ success: boolean; data?: AdatSwitchResult; error?: string }> {
  const session = await getSessionData();
  if (!session?.accessToken || !session?.spreadsheetId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const preview = await previewAdatSwitch(new_adat, new_adat_secondary);
    if (!preview.success || !preview.data) throw new Error(preview.error || "Preview failed");

    const service = new GoogleSheetsService(session.accessToken);
    const allRows = await service.readRows(session.spreadsheetId, SHEETS_CONFIG.ranges.checklist);
    if (!allRows) throw new Error("Could not read checklist data");

    const updates: { range: string; values: string[][] }[] = [];
    
    // 1. Set removed tasks to 'SKIP'
    const removedIds = new Set(preview.data.tasks_removed.map(t => t.task_id));
    for (let i = 0; i < allRows.length; i++) {
      const rowId = allRows[i][0];
      if (removedIds.has(rowId)) {
        allRows[i][9] = 'SKIP'; // status
        updates.push({
          range: `Checklist!J${i + 2}`, // 1-based + 1 for header
          values: [['SKIP']]
        });
      }
    }

    // 2. Batch update statuses
    if (updates.length > 0) {
      await withRateLimit(async () => {
        await service['sheets'].spreadsheets.values.batchUpdate({
          spreadsheetId: session.spreadsheetId,
          requestBody: {
            valueInputOption: 'USER_ENTERED',
            data: updates,
          },
        });
      });
    }

    // 3. Append new tasks
    if (preview.data.tasks_added.length > 0) {
      const rowsToAppend = preview.data.tasks_added.map(taskToRow);
      await service.appendRows(session.spreadsheetId, SHEETS_CONFIG.ranges.checklist, rowsToAppend);
    }

    // 4. Update Metadata
    const metadataUpdates: { range: string; values: string[][] }[] = [];
    const metaRows = await service.readRows(session.spreadsheetId, "Metadata!A:B");
    if (metaRows) {
      for (let i = 0; i < metaRows.length; i++) {
        if (metaRows[i][0] === 'adat_type') {
          metadataUpdates.push({ range: `Metadata!B${i+1}`, values: [[new_adat]] });
        }
        if (metaRows[i][0] === 'adat_secondary') {
          metadataUpdates.push({ range: `Metadata!B${i+1}`, values: [[new_adat_secondary || ""]] });
        }
      }
      
      // If adat_secondary didn't exist before and we have it now, append it.
      if (new_adat_secondary && !metaRows.some(r => r[0] === 'adat_secondary')) {
          await service.appendRow(session.spreadsheetId, "Metadata!A:B", ["adat_secondary", new_adat_secondary]);
      }
      
      if (metadataUpdates.length > 0) {
        await withRateLimit(async () => {
          await service['sheets'].spreadsheets.values.batchUpdate({
            spreadsheetId: session.spreadsheetId,
            requestBody: {
              valueInputOption: 'USER_ENTERED',
              data: metadataUpdates,
            },
          });
        });
      }
    }

    return { success: true, data: preview.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ── 8. Undo Adat Switch ──
export async function undoAdatSwitch(
  previous_adat: AdatType
): Promise<{ success: boolean; error?: string }> {
  // A simplified undo: we can just delete all tasks where added_by_adat_switch = TRUE,
  // and set any SKIP tasks back to BELUM. This is a naive implementation based on the prompt's instructions.
  const session = await getSessionData();
  if (!session?.accessToken || !session?.spreadsheetId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const service = new GoogleSheetsService(session.accessToken);
    const allRows = await service.readRows(session.spreadsheetId, SHEETS_CONFIG.ranges.checklist);
    if (!allRows) throw new Error("Could not read checklist data");

    const updates: { range: string; values: string[][] }[] = [];

    for (let i = 0; i < allRows.length; i++) {
      const addedBySwitch = allRows[i][13] === 'TRUE';
      const status = allRows[i][9];

      if (addedBySwitch && status !== 'SELESAI') {
        // Rather than deleting the row entirely which can be tricky with sheets API, 
        // setting to SKIP hides it. Or we can clear it. The prompt says "hapus (status = SKIP)".
        allRows[i][9] = 'SKIP';
        updates.push({ range: `Checklist!J${i + 2}`, values: [['SKIP']] });
      } else if (status === 'SKIP' && !addedBySwitch) {
        // Restore skipped tasks
        allRows[i][9] = 'BELUM';
        updates.push({ range: `Checklist!J${i + 2}`, values: [['BELUM']] });
      }
    }

    if (updates.length > 0) {
      await withRateLimit(async () => {
        await service['sheets'].spreadsheets.values.batchUpdate({
          spreadsheetId: session.spreadsheetId,
          requestBody: {
            valueInputOption: 'USER_ENTERED',
            data: updates,
          },
        });
      });
    }

    // Restore metadata
    const metaRows = await service.readRows(session.spreadsheetId, "Metadata!A:B");
    if (metaRows) {
      for (let i = 0; i < metaRows.length; i++) {
        if (metaRows[i][0] === 'adat_type') {
           await service.updateRow(session.spreadsheetId, `Metadata!B${i+1}`, [previous_adat]);
        }
      }
    }

    return { success: true };
  } catch(e: any) {
    return { success: false, error: e.message };
  }
}
