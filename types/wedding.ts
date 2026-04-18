export interface GuestRecord {
  id: string;
  name: string;
  category: 'VIP' | 'REGULAR' | 'FAMILY' | 'FRIEND';
  pax: number;
  status: 'PENDING' | 'CONFIRMED' | 'DECLINED';
  slug: string;
  createdAt: string;
}

export interface VendorRecord {
  id: string;
  category: string;
  name: string;
  totalCost: number;
  paidAmount: number;
  status: 'UNPAID' | 'PARTIAL' | 'PAID';
  dueDate: string;
  notes?: string;
}

export interface GiftRecord {
  id: string;
  guestName: string;
  amount: number;
  notes?: string;
  createdAt: string;
}
