"use server";

import { nanoid } from "nanoid";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { MASTER_CHECKLIST } from "@/lib/checklist-master-data";
import { ChecklistTask, ChecklistProgress, TaskPhase, TaskStatus, AdatSwitchResult } from "@/types/checklist.types";
import { filterTasksByAdat, AdatType, ADAT_TYPES } from "@/lib/adat-registry";
import { z } from "zod";
import { subDays } from "date-fns";
import { revalidatePath } from "next/cache";

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
  phase_label: z.string().min(1),
  days_before: z.number().int().nonnegative().optional(),
  category: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  is_required: z.boolean(),
  assignee: z.enum(["PENGANTIN_PRIA", "PENGANTIN_WANITA", "BERDUA", "KELUARGA"]),
});

function calculateDeadlineAndOverdue(task: ChecklistTask, weddingDateStr?: string) {
  let deadline_date: Date | undefined = undefined;
  let is_overdue = false;
  
  if (weddingDateStr) {
    deadline_date = subDays(new Date(weddingDateStr), task.days_before);
    if (deadline_date < new Date() && task.status !== "SELESAI") {
      is_overdue = true;
    }
  }
  
  return { ...task, deadline_date, is_overdue };
}

export async function initChecklist(
  profile: z.infer<typeof UserProfileSchema>
): Promise<{ success: boolean; taskCount: number; error?: string }> {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    const parsed = UserProfileSchema.safeParse(profile);
    if (!parsed.success) return { success: false, taskCount: 0, error: "Data profil tidak valid" };

    // Check existing
    const { data: existing, error: fetchError } = await supabase
      .from('checklist_tasks')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);

    if (existing && existing.length > 0) {
      return { success: true, taskCount: existing.length, error: "Checklist sudah ada" };
    }

    const filtered = filterTasksByAdat(MASTER_CHECKLIST, parsed.data.adat_type as AdatType, parsed.data.adat_secondary as AdatType);

    const rowsToAppend = filtered.map((task) => ({
      user_id: user.id,
      task_id: `ck_${nanoid(8)}`,
      phase_label: task.phase_label,
      days_before: task.days_before,
      category: task.category,
      title: task.title,
      description: task.description,
      adat_tags: task.adat_tags,
      is_required: task.is_required,
      source: 'MASTER',
      status: 'BELUM',
      assignee: task.assignee,
      notes: '',
    }));

    const { error: insertError } = await supabase.from('checklist_tasks').insert(rowsToAppend);
    if (insertError) throw insertError;

    // Update metadata (wedding profile)
    await supabase.from('wedding_profiles').upsert({
      user_id: user.id,
      adat_type: parsed.data.adat_type,
      adat_secondary: parsed.data.adat_secondary || null,
      wedding_date: parsed.data.wedding_date,
      guest_count_estimate: parsed.data.guest_count_estimate,
      pasangan_pria_suku: parsed.data.pasangan_pria_suku || null,
      pasangan_wanita_suku: parsed.data.pasangan_wanita_suku || null,
    });

    revalidatePath("/dashboard/checklist");
    return { success: true, taskCount: filtered.length };
  } catch (error: any) {
    console.error("Error init checklist:", error);
    return { success: false, taskCount: 0, error: error.message };
  }
}

export async function getChecklist(
  filters?: {
    phase?: TaskPhase
    assignee?: ChecklistTask['assignee']
    status?: TaskStatus | 'NOT_SELESAI'
    category?: ChecklistTask['category']
    show_custom?: boolean
  }
): Promise<ChecklistTask[]> {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    
    let query = supabase.from('checklist_tasks').select('*').eq('user_id', user.id);
    
    if (filters) {
      if (filters.phase) query = query.eq('phase_label', filters.phase);
      if (filters.assignee) query = query.eq('assignee', filters.assignee);
      if (filters.category) query = query.eq('category', filters.category);
      if (filters.show_custom !== undefined) {
        query = query.eq('source', filters.show_custom ? 'CUSTOM' : 'MASTER');
      }
      if (filters.status) {
        if (filters.status === 'NOT_SELESAI') query = query.neq('status', 'SELESAI');
        else query = query.eq('status', filters.status);
      }
    }
    
    const { data: tasks, error } = await query;
    if (error) throw error;
    
    // Get wedding date to calc deadlines
    const { data: profile } = await supabase
      .from('wedding_profiles')
      .select('wedding_date')
      .eq('user_id', user.id)
      .single();

    return (tasks as any[]).map(t => calculateDeadlineAndOverdue({
      ...t,
      is_custom: t.source === 'CUSTOM',
      added_by_adat_switch: false // Legacy flag, no longer heavily used if we just rebuild the list
    }, profile?.wedding_date)) as ChecklistTask[];
  } catch (error: any) {
    console.error("Error fetching checklist:", error);
    return [];
  }
}

export async function updateTaskStatus(
  input: z.infer<typeof UpdateStatusSchema>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    const parsed = UpdateStatusSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "Data tidak valid" };

    const { error } = await supabase
      .from('checklist_tasks')
      .update({
        status: parsed.data.status,
        notes: parsed.data.notes,
        updated_at: new Date().toISOString()
      })
      .eq('task_id', parsed.data.task_id)
      .eq('user_id', user.id);

    if (error) throw error;

    revalidatePath("/dashboard/checklist");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function batchUpdateTaskStatus(
  updates: { task_id: string; status: TaskStatus; notes?: string }[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    
    for (const update of updates) {
      const { error } = await supabase
        .from('checklist_tasks')
        .update({
          status: update.status,
          ...(update.notes !== undefined && { notes: update.notes }),
          updated_at: new Date().toISOString()
        })
        .eq('task_id', update.task_id)
        .eq('user_id', user.id);
        
      if (error) throw error;
    }

    revalidatePath("/dashboard/checklist");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function renamePhase(oldPhase: string, newPhase: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    
    const { error } = await supabase
      .from('checklist_tasks')
      .update({ phase_label: newPhase })
      .eq('phase_label', oldPhase)
      .eq('user_id', user.id);

    if (error) throw error;

    revalidatePath("/dashboard/checklist");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Failed to rename phase" };
  }
}

export async function getChecklistProgress(): Promise<{
  overall: { total: number; completed: number; percentage: number };
  by_phase: ChecklistProgress[];
  by_assignee: Record<string, { total: number; completed: number }>;
  critical_overdue: ChecklistTask[];
}> {
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

    const critical_overdue = tasks.filter(t => t.is_overdue).slice(0, 5);

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
  } catch (error: any) {
    return { overall: {total:0, completed:0, percentage:0}, by_phase: [], by_assignee: {}, critical_overdue: [] };
  }
}

export async function addCustomTask(
  input: z.infer<typeof AddTaskSchema>
): Promise<{ success: boolean; error?: string; task_id?: string }> {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    const parsed = AddTaskSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: "Data tidak valid" };

    const taskId = `ck_${nanoid(8)}`;

    const insertData = {
      user_id: user.id,
      task_id: taskId,
      phase_label: parsed.data.phase_label,
      days_before: parsed.data.days_before || 0,
      category: parsed.data.category,
      title: parsed.data.title,
      description: parsed.data.description,
      adat_tags: ["ALL"],
      is_required: parsed.data.is_required,
      source: 'CUSTOM',
      status: 'BELUM',
      assignee: parsed.data.assignee,
      notes: '',
    };

    const { error } = await supabase.from('checklist_tasks').insert(insertData);
    if (error) throw error;

    revalidatePath("/dashboard/checklist");
    return { success: true, task_id: taskId };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function previewAdatSwitch(
  new_adat: AdatType,
  new_adat_secondary?: AdatType
): Promise<{ success: boolean; data?: AdatSwitchResult; error?: string }> {
  try {
    const tasks = await getChecklist();
    
    const tasks_removed: ChecklistTask[] = [];
    const tasks_kept: ChecklistTask[] = [];
    const tasks_completed_kept: ChecklistTask[] = [];

    for (const task of tasks) {
      if (task.is_custom) {
        tasks_kept.push(task);
        continue;
      }

      const tags = task.adat_tags as readonly string[];
      const matchesNewAdat = tags.includes('ALL') || 
                             tags.includes(new_adat) || 
                             (new_adat_secondary && tags.includes(new_adat_secondary));

      if (matchesNewAdat) {
        tasks_kept.push(task);
      } else {
        if (task.status === 'SELESAI') {
          tasks_completed_kept.push(task);
        } else {
          tasks_removed.push(task);
        }
      }
    }

    const existingTitles = new Set([...tasks_kept, ...tasks_completed_kept].map(t => t.title));
    const potentialNewTasks = filterTasksByAdat(MASTER_CHECKLIST, new_adat, new_adat_secondary);
    
    const tasks_added = potentialNewTasks
      .filter(t => !existingTitles.has(t.title))
      .map(t => ({
        ...t,
        task_id: `ck_${nanoid(8)}`,
        is_custom: false,
        status: 'BELUM' as TaskStatus,
        notes: '',
      }) as ChecklistTask);

    const conflict_warnings: string[] = [
      "Perhatian: Proses ganti adat akan menghapus semua tugas standar saat ini dan menggantinya dengan yang baru.",
      "Tugas Custom (buatan Anda sendiri) akan tetap dipertahankan.",
      "Progress (tugas yang sudah selesai) dari tugas bawaan akan di-reset menjadi 0%."
    ];
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

export async function executeAdatSwitch(
  new_adat: AdatType,
  new_adat_secondary?: AdatType
): Promise<{ success: boolean; data?: AdatSwitchResult; error?: string }> {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    const preview = await previewAdatSwitch(new_adat, new_adat_secondary);
    if (!preview.success || !preview.data) throw new Error(preview.error || "Preview failed");

    // Delete all MASTER tasks
    const { error: delError } = await supabase
      .from('checklist_tasks')
      .delete()
      .eq('user_id', user.id)
      .eq('source', 'MASTER');
      
    if (delError) throw delError;

    // Generate new MASTER tasks
    const allNewAdatTasks = filterTasksByAdat(MASTER_CHECKLIST, new_adat, new_adat_secondary);
    const newAdatRows = allNewAdatTasks.map((task) => ({
      user_id: user.id,
      task_id: `ck_${nanoid(8)}`,
      phase_label: task.phase_label,
      days_before: task.days_before,
      category: task.category,
      title: task.title,
      description: task.description,
      adat_tags: task.adat_tags,
      is_required: task.is_required,
      source: 'MASTER',
      status: 'BELUM',
      assignee: task.assignee,
      notes: '',
    }));

    if (newAdatRows.length > 0) {
      const { error: insertError } = await supabase.from('checklist_tasks').insert(newAdatRows);
      if (insertError) throw insertError;
    }

    // Update metadata
    await supabase.from('wedding_profiles').upsert({
      user_id: user.id,
      adat_type: new_adat,
      adat_secondary: new_adat_secondary || null,
    });

    revalidatePath("/dashboard/checklist");
    return { success: true, data: preview.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function undoAdatSwitch(
  previous_adat: AdatType
): Promise<{ success: boolean; error?: string }> {
  // For a real app, you might want to restore from a backup or re-fetch previous adat.
  // We will just re-execute the adat switch with the previous adat.
  return executeAdatSwitch(previous_adat);
}
