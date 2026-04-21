'use server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function submitRSVP(data: {
  rsvp_token: string
  rsvp_status: 'HADIR' | 'TIDAK_HADIR'
  actual_pax?: number
  message?: string
}): Promise<{ success: boolean; error?: string; guestName?: string }> {
  const supabase = createAdminClient()
  const { data: guest, error: fetchError } = await supabase
    .from('guests')
    .select('id, name, user_id')
    .eq('rsvp_token', data.rsvp_token)
    .single()

  if (fetchError || !guest) return { success: false, error: 'Tamu tidak ditemukan' }

  const { error } = await supabase
    .from('guests')
    .update({
      rsvp_status: data.rsvp_status,
      actual_pax: data.actual_pax ?? 1,
      rsvp_at: new Date().toISOString(),
      notes: data.message ? data.message : undefined // Jika ada notes
    })
    .eq('rsvp_token', data.rsvp_token)

  if (error) return { success: false, error: error.message }
  return { success: true, guestName: guest.name }
}
