export type AdatType = 'JAWA' | 'SUNDA' | 'ISLAMI' | 'MODERN' | 'CAMPURAN';
export type TaskStatus = 'BELUM' | 'PROSES' | 'SELESAI' | 'SKIP';
export type TaskAssignee = 'PENGANTIN_PRIA' | 'PENGANTIN_WANITA' | 'BERDUA' | 'KELUARGA';
export type TaskPhase = 'H-6 Bulan' | 'H-5 Bulan' | 'H-4 Bulan' | 'H-3 Bulan' | 'H-2 Bulan' | 'H-1 Bulan';

export type TaskCategory =
  | 'VENUE' | 'KATERING' | 'DOKUMENTASI' | 'BUSANA_RIAS' | 'UNDANGAN'
  | 'ADAT_PROSESI' | 'DOKUMEN_KUA' | 'VENDOR_HIBURAN' | 'DEKOR_FLORIST'
  | 'TRANSPORTASI' | 'SESERAHAN_MAHAR' | 'HONEYMOON' | 'KESEHATAN'
  | 'SOUVENIR' | 'RUNDOWN' | 'KEUANGAN';

export interface ChecklistTask {
  task_id: string;
  phase_label: TaskPhase;
  days_before: number;
  category: TaskCategory;
  title: string;
  description: string;
  adat_filter: string;
  is_required: boolean;
  status: TaskStatus;
  completed_at: string | null;
  assignee: TaskAssignee;
  notes: string;
  deadline_date?: string;
  is_overdue?: boolean;
}

export interface ChecklistProgress {
  phase: TaskPhase;
  total: number;
  completed: number;
  percentage: number;
  overdue_count: number;
}

export interface UserProfile {
  adat_type: AdatType;
  wedding_date: string;
  guest_count_estimate: number;
}

export interface ChecklistSeedTask {
  phase_label: TaskPhase;
  days_before: number;
  category: TaskCategory;
  title: string;
  description: string;
  adat_filter: string;
  is_required: boolean;
  assignee: TaskAssignee;
}
