import { createClient } from '@supabase/supabase-js'

// Gunakan HANYA di Server Actions atau API routes — jangan expose ke client
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
