"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { GoogleSheetsService } from "@/lib/googleService";
import { withRateLimit } from "@/lib/rateLimiter";
import { SHEETS_CONFIG } from "@/config/sheets";
import { MASTER_CHECKLIST } from "@/lib/checklistSeed";
import { ChecklistTask, ChecklistProgress, UserProfile, TaskPhase, TaskStatus } from "@/types/checklist.types";
import { nanoid } from "nanoid";
import { z } from "zod";

// ── Zod Schemas ──
const UpdateStatusSchema = z.object({
  task_id: z.string().min(1),
  status: z.enum(["BELUM", "PROSES", "SELESAI", "SKIP"]),
  notes: z.string().optional(),
});

const UserProfileSchema = z.object({
  adat_type: z.enum(["JAWA", "SUNDA", "ISLAMI", "MODERN", "CAMPURAN"]),
  wedding_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guest_count_estimate: z.number().int().positive(),
});

const AddTaskSchema = z.object({
  phase_label: z.enum(["H-6 Bulan", "H-5 Bulan", "H-4 Bulan", "H-3 Bulan", "H-2 Bulan", "H-1 Bulan"]),
  days_before: z.number().int().nonnegative(),
  category: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  adat_filter: z.string(),
  is_required: z.boolean(),
  assignee: z.enum(["PENGANTIN_PRIA", "PENGANTIN_WANITA", "BERDUA", "KELUARGA"]),
});

// ── Helpers ──
function getSessionData() {
  return getServerSession(authOptions);
}

function taskMatchesAdat(adat_filter: string, userAdat: string): boolean {
  if (adat_filter === "ALL") return true;
  const filters = adat_filter.split(",").map((s) => s.trim());
  if (userAdat === "CAMPURAN") return true;
  return filters.includes(userAdat);
}

function parseRow(row: string[]): ChecklistTask {
  return {
    task_id: row[0] || "",
    phase_label: (row[1] || "H-6 Bulan") as TaskPhase,
    days_before: parseInt(row[2]) || 0,
    category: row[3] as ChecklistTask["category"],
    title: row[4] || "",
    description: row[5] || "",
    adat_filter: row[6] || "ALL",
    is_required: row[7] === "TRUE",
    status: (row[8] || "BELUM") as TaskStatus,
    completed_at: row[9] || null,
    assignee: row[10] as ChecklistTask["assignee"],
    notes: row[11] || "",
  };
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
      ['task_id', 'phase_label', 'days_before', 'category', 'title', 'description', 'adat_filter', 'is_required', 'status', 'completed_at', 'assignee', 'notes']
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

    const filtered = MASTER_CHECKLIST.filter((task) =>
      taskMatchesAdat(task.adat_filter, parsed.data.adat_type)
    );

    const rowsToAppend = filtered.map((task) => [
      `ck_${nanoid(8)}`,
      task.phase_label,
      task.days_before,
      task.category,
      task.title,
      task.description,
      task.adat_filter,
      task.is_required ? "TRUE" : "FALSE",
      "BELUM",
      "",
      task.assignee,
      "",
    ]);

    // Batch append all rows at once to avoid timeouts and rate limits
    await service.appendRows(session.spreadsheetId, SHEETS_CONFIG.ranges.checklist, rowsToAppend);

    return { success: true, taskCount: filtered.length };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Error init checklist:", msg);
    return { success: false, taskCount: 0, error: msg };
  }
}

// ── 2. Get Checklist ──
export async function getChecklist(
  phase?: TaskPhase
): Promise<ChecklistTask[]> {
  const session = await getSessionData();
  if (!session?.accessToken || !session?.spreadsheetId) return [];

  try {
    const service = new GoogleSheetsService(session.accessToken);
    const rows = await service.readRows(session.spreadsheetId, SHEETS_CONFIG.ranges.checklist);
    if (!rows) return [];

    let tasks = rows.filter((r) => r[0]).map(parseRow);
    if (phase) {
      tasks = tasks.filter((t) => t.phase_label === phase);
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

    await service.updateRow(
      session.spreadsheetId,
      `Checklist!I${rowIndex}:L${rowIndex}`,
      [parsed.data.status, completedAt, "", notes]
    );

    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: msg };
  }
}

// ── 4. Get Checklist Progress ──
export async function getChecklistProgress(): Promise<ChecklistProgress[]> {
  const session = await getSessionData();
  if (!session?.accessToken || !session?.spreadsheetId) return [];

  try {
    const tasks = await getChecklist();
    // Dynamically get unique phases
    const uniquePhases = Array.from(new Set(tasks.map((t) => t.phase_label)));
    
    // Sort them based on common "H-X" patterns if possible, or just keep their appearance order
    // Since "H-6" should come before "H-1", a simple reverse alphabetical might work for standard,
    // but preserving order of appearance from master data is usually safest if we haven't renamed.
    // For simplicity, we'll just use the unique phases directly.

    return uniquePhases.map((phase) => {
      const phaseTasks = tasks.filter((t) => t.phase_label === phase);
      const completed = phaseTasks.filter((t) => t.status === "SELESAI" || t.status === "SKIP").length;
      const total = phaseTasks.length;
      return {
        phase,
        total,
        completed,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        overdue_count: 0,
      };
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return [];
  }
}

// ── 4b. Rename Phase ──
export async function renamePhase(oldPhase: string, newPhase: string): Promise<{ success: boolean; error?: string }> {
  const session = await getSessionData();
  if (!session?.accessToken || !session?.spreadsheetId) {
    return { success: false, error: "Unauthorized" };
  }

  if (!newPhase || newPhase.trim() === "") {
    return { success: false, error: "Nama fase tidak boleh kosong" };
  }

  try {
    const service = new GoogleSheetsService(session.accessToken);
    const rows = await service.readRows(session.spreadsheetId, SHEETS_CONFIG.ranges.checklist);
    if (!rows) return { success: true };

    const updates = [];
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][1] === oldPhase) {
        updates.push({
          range: `Checklist!B${i + 2}`,
          values: [[newPhase]],
        });
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

    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: msg };
  }
}

// ── 5. Add Custom Task ──
export async function addCustomTask(
  input: z.infer<typeof AddTaskSchema>
): Promise<{ success: boolean; error?: string }> {
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

    await service.appendRow(session.spreadsheetId, SHEETS_CONFIG.ranges.checklist, [
      taskId,
      parsed.data.phase_label,
      parsed.data.days_before,
      parsed.data.category,
      parsed.data.title,
      parsed.data.description,
      parsed.data.adat_filter,
      parsed.data.is_required ? "TRUE" : "FALSE",
      "BELUM",
      "",
      parsed.data.assignee,
      "",
    ]);

    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: msg };
  }
}
