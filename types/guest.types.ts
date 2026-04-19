export type GuestCategory = 'KELUARGA_PRIA' | 'KELUARGA_WANITA' | 'SAHABAT' | 'REKAN_KERJA' | 'KENALAN' | 'VIP';
export type RSVPStatus = 'BELUM_KONFIRMASI' | 'HADIR' | 'TIDAK_HADIR' | 'RAGU';
export type GiftType = 'CASH' | 'TRANSFER' | 'BARANG' | 'TIDAK_ADA';

export interface Guest {
  guest_id: string;
  name: string;
  category: GuestCategory;
  phone_wa: string;
  address: string;
  pax_estimate: number;
  rsvp_status: RSVPStatus;
  actual_pax: number;
  gift_amount: number;
  gift_type: GiftType;
  rsvp_at: string | null;
  table_number: string;
  seat_notes: string;
  invitation_sent: boolean;
  invitation_sent_at: string | null;
  notes: string;
  created_at: string;
}

export interface GuestStats {
  total_guests: number;
  total_pax_estimate: number;
  rsvp_hadir: number;
  rsvp_tidak_hadir: number;
  rsvp_belum: number;
  total_pax_confirmed: number;
  total_gifts: number;
  invitation_sent_count: number;
  by_category: { category: GuestCategory; count: number; confirmed_pax: number }[];
}
