import { ADAT_REGISTRY } from '@/lib/adat-registry'
export type AdatType = keyof typeof ADAT_REGISTRY

export type TaskStatus = 'BELUM' | 'PROSES' | 'SELESAI' | 'SKIP'
export type TaskAssignee = 'PENGANTIN_PRIA' | 'PENGANTIN_WANITA' | 'BERDUA' | 'KELUARGA'
export type TaskPhase = 'H-6 Bulan' | 'H-5 Bulan' | 'H-4 Bulan' | 'H-3 Bulan' | 'H-2 Bulan' | 'H-1 Bulan'
export type TaskCategory =
  | 'VENUE' | 'KATERING' | 'DOKUMENTASI' | 'BUSANA_RIAS' | 'UNDANGAN'
  | 'ADAT_PROSESI' | 'DOKUMEN_KUA' | 'VENDOR_HIBURAN' | 'DEKOR_FLORIST'
  | 'TRANSPORTASI' | 'SESERAHAN_MAHAR' | 'HONEYMOON' | 'KESEHATAN'
  | 'SOUVENIR' | 'RUNDOWN' | 'KEUANGAN'

export interface ChecklistTask {
  task_id: string
  phase_label: TaskPhase
  days_before: number
  category: TaskCategory
  title: string
  description: string
  adat_tags: AdatType[] | ['ALL']   // typed array, bukan string biasa
  is_required: boolean
  is_custom: boolean                  // task buatan user sendiri
  status: TaskStatus
  completed_at: string | null
  assignee: TaskAssignee
  notes: string
  added_by_adat_switch: boolean       // ditambahkan saat user ganti adat
  // computed fields (tidak disimpan di Sheets):
  deadline_date?: string | Date
  is_overdue?: boolean
  adat_label?: string                 // nama adat yang di-display
}

export interface AdatSwitchResult {
  tasks_added: ChecklistTask[]        // task baru dari adat baru
  tasks_removed: ChecklistTask[]      // task lama yang tidak relevan (belum SELESAI)
  tasks_kept: ChecklistTask[]         // task yang tetap relevan (ALL + universal)
  tasks_completed_kept: ChecklistTask[] // task dari adat lama yang sudah SELESAI — JANGAN hapus
  conflict_warnings: string[]          // peringatan jika ganti adat berdampak signifikan
}

export interface ChecklistProgress {
  phase: TaskPhase
  total: number
  completed: number
  percentage: number
  overdue_count: number
}

export interface UserProfile {
  adat_type: AdatType
  adat_secondary?: AdatType           // adat kedua jika campuran (pasangan beda adat)
  wedding_date: string
  guest_count_estimate: number
  pasangan_pria_suku?: string         // info tambahan untuk campuran adat
  pasangan_wanita_suku?: string
}

export interface ChecklistSeedTask {
  phase_label: TaskPhase;
  days_before: number;
  category: TaskCategory;
  title: string;
  description: string;
  adat_tags: AdatType[] | ['ALL'];
  is_required: boolean;
  assignee: TaskAssignee;
}
