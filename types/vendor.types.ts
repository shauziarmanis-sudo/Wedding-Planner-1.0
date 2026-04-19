export type VendorCategory = 'VENUE' | 'KATERING' | 'FOTOGRAFER' | 'VIDEOGRAFER' | 'MUA_PENGANTIN' | 'MUA_KELUARGA' | 'BUSANA_PENGANTIN' | 'BUSANA_KELUARGA' | 'DEKORASI' | 'FLORIST' | 'MC' | 'BAND_MUSIK' | 'DJ' | 'WEDDING_ORGANIZER' | 'TRANSPORTASI' | 'WEDDING_CAKE' | 'SOUVENIR' | 'DOKUMENTASI_PREWEDDING' | 'PERCETAKAN_UNDANGAN' | 'PENGHULU' | 'CATERING_PRASMANAN' | 'SOUNDSYSTEM' | 'LIGHTING' | 'PHOTO_BOOTH' | 'LAINNYA';

export type VendorStatus = 'BELUM_BAYAR' | 'DP_LUNAS' | 'PARTIAL' | 'LUNAS' | 'BATAL';
export type ContractStatus = 'YA' | 'TIDAK' | 'PROSES';

export interface Vendor {
  vendor_id: string;
  category: VendorCategory;
  vendor_name: string;
  contact_name: string;
  phone_wa: string;
  instagram: string;
  estimated_cost: number;
  actual_cost: number;
  dp_amount: number;
  dp_date: string | null;
  paid_amount: number;
  remaining_cost: number; // computed
  status: VendorStatus;
  payment_notes: string;
  contract_signed: ContractStatus;
  contract_date: string | null;
  vendor_rating: number | null;
  notes: string;
  created_at: string;
}

export interface BudgetSummary {
  total_estimated: number;
  total_actual: number;
  total_paid: number;
  total_unpaid: number;
  vendors_count: number;
  vendors_lunas: number;
  vendors_belum: number;
  budget_variance: number;
  by_category: { category: VendorCategory; total: number; paid: number }[];
}

export interface VendorFormInput {
  category: VendorCategory;
  vendor_name: string;
  contact_name: string;
  phone_wa: string;
  instagram: string;
  estimated_cost: number;
  actual_cost: number;
  dp_amount: number;
  dp_date: string;
  contract_signed: ContractStatus;
  notes: string;
}
