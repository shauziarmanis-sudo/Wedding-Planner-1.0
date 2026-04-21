'use server';

import { nanoid } from "nanoid";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { ChecklistDocument, Religion, DocParty, DocStatus } from "@/types/document.types";
import { DOCUMENT_MASTER_DATA } from "@/lib/kua-master-data";
import { revalidatePath } from "next/cache";

export async function getDocuments(): Promise<{ success: boolean; data?: ChecklistDocument[]; error?: string }> {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
      
    if (error) throw error;
    
    return { success: true, data: data as ChecklistDocument[] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function initDocuments(religion: Religion): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    
    // Delete existing standard docs (keep custom if any)
    const { error: delError } = await supabase
      .from('documents')
      .delete()
      .eq('user_id', user.id)
      .neq('party', 'CUSTOM');
      
    if (delError) throw delError;

    // Prepare new docs
    const seedData = DOCUMENT_MASTER_DATA[religion];
    
    const newRows = seedData.map(doc => ({
      user_id: user.id,
      doc_id: `doc_${nanoid(8)}`,
      religion,
      party: doc.party,
      category: doc.category,
      doc_name: doc.doc_name,
      is_required: doc.is_required ?? true,
      status: 'PENDING'
    }));

    if (newRows.length > 0) {
      const { error: insertError } = await supabase.from('documents').insert(newRows);
      if (insertError) throw insertError;
    }

    // Update metadata religion
    await supabase
      .from('wedding_profiles')
      .update({ religion })
      .eq('user_id', user.id);

    revalidatePath("/dashboard/documents");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function batchUpdateDocumentStatus(updates: { id: string; status: DocStatus }[]): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    
    for (const update of updates) {
      const { error } = await supabase
        .from('documents')
        .update({ status: update.status, updated_at: new Date().toISOString() })
        .eq('doc_id', update.id)
        .eq('user_id', user.id);
        
      if (error) throw error;
    }

    revalidatePath("/dashboard/documents");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addCustomDocument(
  data: Omit<ChecklistDocument, 'doc_id' | 'created_at' | 'updated_at' | 'status'>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    const newDocId = `doc_c_${nanoid(8)}`;

    const insertData = {
      user_id: user.id,
      doc_id: newDocId,
      religion: data.religion,
      party: "CUSTOM",
      category: data.category,
      doc_name: data.doc_name,
      is_required: data.is_required,
      status: "PENDING",
      note: data.note || "",
    };

    const { error } = await supabase.from('documents').insert(insertData);
    if (error) throw error;

    revalidatePath("/dashboard/documents");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteDocument(doc_id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('doc_id', doc_id)
      .eq('user_id', user.id);
      
    if (error) throw error;

    revalidatePath("/dashboard/documents");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
