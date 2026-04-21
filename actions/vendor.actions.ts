"use server";

import { nanoid } from "nanoid";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { Vendor, VendorFormInput, BudgetSummary, VendorStatus } from "@/types/vendor.types";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const VendorFormSchema = z.object({
  category: z.string(),
  vendor_name: z.string().min(1),
  contact_name: z.string(),
  phone_wa: z.string(),
  instagram: z.string(),
  estimated_cost: z.number().min(0),
  actual_cost: z.number().min(0),
  dp_amount: z.number().min(0),
  dp_date: z.string(),
  contract_signed: z.enum(["YA", "TIDAK", "PROSES"]),
  notes: z.string(),
});

export async function getVendors(): Promise<Vendor[]> {
  const { supabase, user } = await getAuthenticatedUser();
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('user_id', user.id)
    .neq('status', 'BATAL');
    
  if (error) {
    console.error("Error fetching vendors:", error);
    return [];
  }
  
  // Map remaining_cost since it's not a physical column
  return (data as any[]).map(v => ({
    ...v,
    remaining_cost: (v.actual_cost > 0 ? v.actual_cost : v.estimated_cost) - v.paid_amount
  })) as Vendor[];
}

export async function getBudgetSummary(): Promise<BudgetSummary> {
  const vendors = await getVendors();

  let total_estimated = 0;
  let total_actual = 0;
  let total_paid = 0;
  let total_unpaid = 0;
  let vendors_lunas = 0;
  let vendors_belum = 0;

  const catMap = new Map<string, { total: number; paid: number }>();

  vendors.forEach((v) => {
    total_estimated += Number(v.estimated_cost || 0);
    const cost = v.actual_cost > 0 ? Number(v.actual_cost) : Number(v.estimated_cost || 0);
    total_actual += cost;
    total_paid += Number(v.paid_amount || 0);
    total_unpaid += Math.max(0, cost - Number(v.paid_amount || 0));

    if (v.status === "LUNAS") vendors_lunas++;
    else if (v.status === "BELUM_BAYAR") vendors_belum++;

    const cat = catMap.get(v.category) || { total: 0, paid: 0 };
    cat.total += cost;
    cat.paid += Number(v.paid_amount || 0);
    catMap.set(v.category, cat);
  });

  return {
    total_estimated,
    total_actual,
    total_paid,
    total_unpaid,
    vendors_count: vendors.length,
    vendors_lunas,
    vendors_belum,
    budget_variance: total_actual - total_estimated,
    by_category: Array.from(catMap.entries()).map(([cat, data]) => ({
      category: cat as Vendor["category"],
      ...data,
    })),
  };
}

export async function addVendor(data: VendorFormInput): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    
    const parsed = VendorFormSchema.safeParse(data);
    if (!parsed.success) {
      console.error("Vendor validation error:", parsed.error.format());
      return { success: false, error: "Data tidak valid: " + parsed.error.issues[0].message };
    }

    const d = parsed.data;
    const vendor_id = `v_${nanoid(8)}`;
    
    let status = "BELUM_BAYAR";
    if (d.dp_amount > 0) {
      if (d.dp_amount >= (d.actual_cost || d.estimated_cost)) status = "LUNAS";
      else status = "DP_LUNAS";
    }

    const insertData = {
      user_id: user.id,
      vendor_id,
      category: d.category,
      vendor_name: d.vendor_name,
      contact_name: d.contact_name,
      phone_wa: d.phone_wa,
      instagram: d.instagram,
      estimated_cost: d.estimated_cost,
      actual_cost: d.actual_cost,
      dp_amount: d.dp_amount,
      dp_date: d.dp_date || null,
      paid_amount: d.dp_amount,
      status,
      contract_signed: d.contract_signed,
      notes: d.notes,
    };

    const { error } = await supabase.from('vendors').insert(insertData);
    if (error) throw error;

    revalidatePath("/dashboard/budget");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function recordPayment(vendor_id: string, amount: number, notes: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    
    // Fetch current vendor state
    const { data: vendor, error: fetchError } = await supabase
      .from('vendors')
      .select('*')
      .eq('vendor_id', vendor_id)
      .eq('user_id', user.id)
      .single();
      
    if (fetchError || !vendor) return { success: false, error: "Vendor tidak ditemukan" };

    const actual_cost = Number(vendor.actual_cost) > 0 ? Number(vendor.actual_cost) : Number(vendor.estimated_cost);
    const dp_amount = Number(vendor.dp_amount || 0);
    const current_paid = Number(vendor.paid_amount || 0);
    
    const new_paid = current_paid + amount;
    
    let status = "BELUM_BAYAR";
    if (new_paid >= actual_cost && actual_cost > 0) status = "LUNAS";
    else if (new_paid > dp_amount && new_paid < actual_cost) status = "PARTIAL";
    else if (new_paid === dp_amount && new_paid > 0) status = "DP_LUNAS";

    const { error: updateError } = await supabase
      .from('vendors')
      .update({
        paid_amount: new_paid,
        status,
        payment_notes: notes
      })
      .eq('vendor_id', vendor_id)
      .eq('user_id', user.id);

    if (updateError) throw updateError;

    revalidatePath("/dashboard/budget");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateVendor(vendor_id: string, data: Partial<VendorFormInput>): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await getAuthenticatedUser();

    const { data: vendor, error: fetchError } = await supabase
      .from('vendors')
      .select('*')
      .eq('vendor_id', vendor_id)
      .eq('user_id', user.id)
      .single();
      
    if (fetchError || !vendor) return { success: false, error: "Vendor tidak ditemukan" };

    const updatedActualCost = data.actual_cost !== undefined ? data.actual_cost : Number(vendor.actual_cost || 0);
    const updatedEstimatedCost = data.estimated_cost !== undefined ? data.estimated_cost : Number(vendor.estimated_cost || 0);
    const updatedDpAmount = data.dp_amount !== undefined ? data.dp_amount : Number(vendor.dp_amount || 0);
    
    const current_paid = Number(vendor.paid_amount || 0);
    const new_actual = updatedActualCost > 0 ? updatedActualCost : updatedEstimatedCost;
    
    let status = vendor.status;
    if (current_paid >= new_actual && new_actual > 0) status = "LUNAS";
    else if (current_paid > updatedDpAmount && current_paid < new_actual) status = "PARTIAL";
    else if (current_paid === updatedDpAmount && current_paid > 0) status = "DP_LUNAS";
    else if (current_paid === 0) status = "BELUM_BAYAR";

    const updateData = {
      ...data,
      status,
    };

    const { error: updateError } = await supabase
      .from('vendors')
      .update(updateData)
      .eq('vendor_id', vendor_id)
      .eq('user_id', user.id);

    if (updateError) throw updateError;

    revalidatePath("/dashboard/budget");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteVendor(vendor_id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    
    // Soft delete per prompt
    const { error } = await supabase
      .from('vendors')
      .update({ status: 'BATAL' })
      .eq('vendor_id', vendor_id)
      .eq('user_id', user.id);

    if (error) throw error;

    revalidatePath("/dashboard/budget");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getUnpaidVendors(): Promise<Vendor[]> {
  const vendors = await getVendors();
  return vendors.filter(v => v.remaining_cost > 0 && v.status !== "LUNAS" && v.status !== "BATAL");
}
