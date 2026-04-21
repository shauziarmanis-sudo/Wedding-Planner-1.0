import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Hitung total gifts dari tabel guests
    const { data: guests } = await supabase
      .from('guests')
      .select('gift_amount')
      .eq('user_id', user.id)
    const totalGifts = guests?.reduce((sum, g) => sum + Number(g.gift_amount || 0), 0) ?? 0

    // Hitung total unpaid dari tabel vendors
    const { data: vendors } = await supabase
      .from('vendors')
      .select('actual_cost, estimated_cost, paid_amount')
      .eq('user_id', user.id)
    const totalUnpaid = vendors?.reduce((sum, v) => {
      const total = Number(v.actual_cost) > 0 ? Number(v.actual_cost) : Number(v.estimated_cost || 0)
      return sum + Math.max(0, total - Number(v.paid_amount || 0))
    }, 0) ?? 0

    const initialBalance = totalGifts - totalUnpaid

    // Update status wedding profile ke MARRIED
    await supabase
      .from('wedding_profiles')
      .update({ app_status: 'MARRIED', updated_at: new Date().toISOString() })
      .eq('user_id', user.id)

    // Insert initial transaction
    await supabase.from('transactions').insert({
      user_id: user.id,
      tx_id: `tx-${Date.now()}`,
      amount: initialBalance,
      description: 'Initial Balance (Wedding)',
      type: initialBalance >= 0 ? 'INCOME' : 'EXPENSE',
      notes: `Auto-calculated. Gifts: ${totalGifts}, Unpaid: ${totalUnpaid}`,
    })

    return NextResponse.json({ success: true, details: { totalGifts, totalUnpaid, initialBalance } })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
