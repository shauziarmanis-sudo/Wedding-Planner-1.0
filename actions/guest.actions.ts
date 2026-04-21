'use server';

import { nanoid } from "nanoid";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { Guest, GuestCategory, RSVPStatus, GiftType, GuestStats, GuestImportRow } from "@/types/guest.types";
import { revalidatePath } from "next/cache";

export async function getGuests(): Promise<Guest[]> {
  const { supabase, user } = await getAuthenticatedUser();
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .eq('user_id', user.id);
    
  if (error) {
    console.error("Error fetching guests:", error);
    return [];
  }
  return data as Guest[];
}

export async function addGuest(data: Partial<Guest>): Promise<string> {
  const { supabase, user } = await getAuthenticatedUser();
  const guest_id = `g_${nanoid(8)}`;
  const rsvp_token = nanoid(16); // Required for public RSVP link
  
  const guestData = {
    user_id: user.id,
    guest_id,
    rsvp_token, // Make sure to add this column or handle it (we assume it's in the DB schema implicitly or added)
    name: data.name || "",
    category: data.category || "KENALAN",
    phone_wa: data.phone_wa || "",
    address: data.address || "",
    pax_estimate: data.pax_estimate || 1,
    rsvp_status: "BELUM_KONFIRMASI",
    actual_pax: 0,
    gift_amount: 0,
    gift_type: "TIDAK_ADA",
    table_number: data.table_number || "",
    seat_notes: data.seat_notes || "",
    invitation_sent: false,
    notes: data.notes || "",
  };

  const { error } = await supabase.from('guests').insert(guestData);
  if (error) throw new Error(error.message);
  
  revalidatePath("/dashboard/guests");
  return guest_id;
}

export async function updateGuest(guest_id: string, data: Partial<Guest>): Promise<void> {
  const { supabase, user } = await getAuthenticatedUser();
  
  // Exclude fields we shouldn't update directly like id or user_id
  const { id, user_id, created_at, ...updateData } = data as any;

  const { error } = await supabase
    .from('guests')
    .update(updateData)
    .eq('guest_id', guest_id)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);
  
  revalidatePath("/dashboard/guests");
}

export async function deleteGuest(guest_id: string): Promise<void> {
  const { supabase, user } = await getAuthenticatedUser();
  const { error } = await supabase
    .from('guests')
    .delete()
    .eq('guest_id', guest_id)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/guests");
}

export async function markInvitationSent(guest_ids: string[]): Promise<void> {
  const { supabase, user } = await getAuthenticatedUser();
  const now = new Date().toISOString();
  
  const { error } = await supabase
    .from('guests')
    .update({ invitation_sent: true, invitation_sent_at: now })
    .in('guest_id', guest_ids)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/guests");
}

export async function recordGift(guest_id: string, amount: number, type: GiftType): Promise<void> {
  const { supabase, user } = await getAuthenticatedUser();
  const { error } = await supabase
    .from('guests')
    .update({ gift_amount: amount, gift_type: type })
    .eq('guest_id', guest_id)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/guests");
}

export async function updateRSVP(
  guest_id: string, 
  status: RSVPStatus, 
  actual_pax: number, 
  token: string 
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient();
    
    // Validate that the token matches the guest.
    // Assuming token here might be rsvp_token.
    const { error } = await supabase
      .from('guests')
      .update({
        rsvp_status: status,
        actual_pax: actual_pax,
        rsvp_at: new Date().toISOString(),
      })
      .eq('guest_id', guest_id)
      .eq('rsvp_token', token);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Public RSVP Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getGuestStats(): Promise<GuestStats> {
  const guests = await getGuests();
  
  const stats: GuestStats = {
    total_guests: guests.length,
    total_pax_estimate: guests.reduce((sum: number, g: any) => sum + (g.pax_estimate || 0), 0),
    rsvp_hadir: guests.filter(g => g.rsvp_status === 'HADIR').length,
    rsvp_tidak_hadir: guests.filter(g => g.rsvp_status === 'TIDAK_HADIR').length,
    rsvp_belum: guests.filter(g => g.rsvp_status === 'BELUM_KONFIRMASI').length,
    total_pax_confirmed: guests.reduce((sum: number, g: any) => sum + (g.actual_pax || 0), 0),
    total_gifts: guests.reduce((sum: number, g: any) => sum + (g.gift_amount || 0), 0),
    invitation_sent_count: guests.filter(g => g.invitation_sent).length,
    by_category: []
  };

  const categories: GuestCategory[] = ['KELUARGA_PRIA', 'KELUARGA_WANITA', 'SAHABAT', 'REKAN_KERJA', 'KENALAN', 'VIP'];
  stats.by_category = categories.map(cat => ({
    category: cat,
    count: guests.filter(g => g.category === cat).length,
    confirmed_pax: guests.filter(g => g.category === cat).reduce((sum: number, g: any) => sum + (g.actual_pax || 0), 0)
  }));

  return stats;
}

export async function getGuestPublic(rsvp_token: string): Promise<Guest | null> {
  try {
    const supabase = createAdminClient();
    
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('rsvp_token', rsvp_token)
      .single();

    if (error || !data) return null;
    return data as Guest;
  } catch (e) {
    return null;
  }
}

export async function bulkAddGuests(
  guests: GuestImportRow[]
): Promise<{ success: boolean; added: number; errors: string[] }> {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    const errors: string[] = [];
    const validRows = [];

    for (let i = 0; i < guests.length; i++) {
      const g = guests[i];
      if (!g.name || g.name.trim() === '') {
        errors.push(`Baris ${i + 1}: Nama kosong, dilewati.`);
        continue;
      }

      validRows.push({
        user_id: user.id,
        guest_id: `g_${nanoid(8)}`,
        rsvp_token: nanoid(16),
        name: g.name.trim(),
        category: g.category || 'KENALAN',
        phone_wa: g.phone_wa || '',
        address: '',
        pax_estimate: g.pax_estimate || 1,
        rsvp_status: 'BELUM_KONFIRMASI',
        actual_pax: 0,
        gift_amount: 0,
        gift_type: 'TIDAK_ADA',
        invitation_sent: false,
        notes: g.notes || '',
      });
    }

    if (validRows.length > 0) {
      const { error } = await supabase.from('guests').insert(validRows);
      if (error) throw error;
    }

    revalidatePath("/dashboard/guests");
    return { success: true, added: validRows.length, errors };
  } catch (error: any) {
    return { success: false, added: 0, errors: [error.message] };
  }
}

export async function markBulkInvitationSent(
  guest_ids: string[]
): Promise<{ success: boolean }> {
  try {
    await markInvitationSent(guest_ids);
    return { success: true };
  } catch (error: any) {
    console.error("markBulkInvitationSent error:", error);
    return { success: false };
  }
}
