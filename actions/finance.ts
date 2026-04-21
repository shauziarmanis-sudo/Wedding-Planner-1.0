'use server';

import { nanoid } from "nanoid";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { Transaction, SavingGoal } from "@/types/finance";
import { revalidatePath } from "next/cache";

export async function getTransactions(): Promise<Transaction[]> {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });
      
    if (error) throw error;
    return data as Transaction[];
  } catch (error) {
    console.error("Failed to get transactions:", error);
    return [];
  }
}

export async function addTransaction(data: Omit<Transaction, 'tx_id' | 'created_at'>): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    const txId = `tx_${nanoid(8)}`;
    
    const insertData = {
      user_id: user.id,
      tx_id: txId,
      date: data.date,
      amount: data.amount,
      description: data.description,
      type: data.type,
      category: data.category,
      notes: data.notes || '',
    };
    
    const { error } = await supabase.from('transactions').insert(insertData);
    if (error) throw error;

    revalidatePath("/dashboard/finance");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteTransaction(tx_id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('tx_id', tx_id)
      .eq('user_id', user.id);
      
    if (error) throw error;
    
    revalidatePath("/dashboard/finance");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getSavingGoals(): Promise<SavingGoal[]> {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    const { data, error } = await supabase
      .from('saving_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
      
    if (error) throw error;
    return data as SavingGoal[];
  } catch (error) {
    console.error("Failed to get saving goals:", error);
    return [];
  }
}

export async function addSavingGoal(data: Omit<SavingGoal, 'goal_id' | 'created_at'>): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    const goalId = `sg_${nanoid(8)}`;
    
    const insertData = {
      user_id: user.id,
      goal_id: goalId,
      name: data.name,
      target_amount: data.target_amount,
      current_amount: data.current_amount,
      color: data.color || '#C8975A',
      deadline: data.deadline || null,
      notes: data.notes || '',
    };
    
    const { error } = await supabase.from('saving_goals').insert(insertData);
    if (error) throw error;

    revalidatePath("/dashboard/finance");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateSavingGoalAmount(goal_id: string, new_amount: number): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    const { error } = await supabase
      .from('saving_goals')
      .update({ current_amount: new_amount })
      .eq('goal_id', goal_id)
      .eq('user_id', user.id);
      
    if (error) throw error;
    
    revalidatePath("/dashboard/finance");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteSavingGoal(goal_id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    const { error } = await supabase
      .from('saving_goals')
      .delete()
      .eq('goal_id', goal_id)
      .eq('user_id', user.id);
      
    if (error) throw error;
    
    revalidatePath("/dashboard/finance");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getMonthlyChartData(): Promise<{ bulan: string; Pemasukan: number; Pengeluaran: number }[]> {
  try {
    const transactions = await getTransactions();
    
    const monthlyData: Record<string, { Pemasukan: number; Pengeluaran: number }> = {};
    const formatter = new Intl.DateTimeFormat('id-ID', { month: 'short', year: 'numeric' });
    
    for (const tx of transactions) {
      if (!tx.date) continue;
      try {
        const dateObj = new Date(tx.date);
        if (isNaN(dateObj.getTime())) continue;
        
        const label = formatter.format(dateObj);
        if (!monthlyData[label]) {
          monthlyData[label] = { Pemasukan: 0, Pengeluaran: 0 };
        }
        
        if (tx.type === 'INCOME') {
          monthlyData[label].Pemasukan += Number(tx.amount);
        } else {
          monthlyData[label].Pengeluaran += Number(tx.amount);
        }
      } catch (e) {
        continue;
      }
    }
    
    return Object.entries(monthlyData).map(([bulan, data]) => ({
      bulan,
      ...data
    }));
  } catch (error) {
    console.error("Failed to get chart data:", error);
    return [];
  }
}
