export type Religion = 'ISLAM' | 'KRISTEN_PROTESTAN' | 'KATOLIK' | 'HINDU' | 'BUDDHA' | 'KONGHUCU';
export type DocParty = 'PRIA' | 'WANITA' | 'BERSAMA' | 'CUSTOM';
export type DocStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'NOT_APPLICABLE';

export interface ChecklistDocument {
  doc_id: string;
  religion: string;
  party: DocParty;
  category: string;
  doc_name: string;
  is_required: boolean;
  status: DocStatus;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentCategoryGroup {
  category: string;
  documents: ChecklistDocument[];
}
