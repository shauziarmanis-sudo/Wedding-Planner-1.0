'use server';

import { nanoid } from "nanoid";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { GoogleSheetsService } from "@/lib/googleService";
import { SHEETS_CONFIG } from "@/config/sheets";
import { Transaction, SavingGoal } from "@/types/finance";
import { revalidatePath } from "next/cache";

async function getAuthService() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken || !session?.spreadsheetId) {
    throw new Error('Unauthorized');
  }
  return {
    service: new GoogleSheetsService(session.accessToken as string),
    spreadsheetId: session.spreadsheetId as string
  };
}

export async function ensureFinanceSheets(): Promise<{ success: boolean; error?: string }> {
  try {
    const { service, spreadsheetId } = await getAuthService();
    
    // Ensure transactions
    await service.addSheet(
      spreadsheetId, 
      SHEETS_CONFIG.tabs.transactions, 
      ['tx_id', 'date', 'amount', 'description', 'type', 'category', 'notes', 'created_at']
    );
    
    // Ensure saving_goals
    await service.addSheet(
      spreadsheetId, 
      SHEETS_CONFIG.tabs.savings, 
      ['goal_id', 'name', 'target_amount', 'current_amount', 'color', 'deadline', 'notes', 'created_at']
    );
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getTransactions(): Promise<Transaction[]> {
  try {
    const { service, spreadsheetId } = await getAuthService();
    const rows = await service.readRows(spreadsheetId, SHEETS_CONFIG.ranges.transactions);
    
    if (!rows) return [];
    
    return rows.map(row => ({
      tx_id: row[0] || '',
      date: row[1] || '',
      amount: parseFloat(row[2]) || 0,
      description: row[3] || '',
      type: (row[4] === 'INCOME' ? 'INCOME' : 'EXPENSE') as 'INCOME' | 'EXPENSE',
      category: row[5] || '',
      notes: row[6] || '',
      created_at: row[7] || '',
    })).filter(tx => tx.tx_id);
  } catch (error) {
    console.error("Failed to get transactions:", error);
    return [];
  }
}

export async function addTransaction(data: Omit<Transaction, 'tx_id' | 'created_at'>): Promise<{ success: boolean; error?: string }> {
  try {
    const { service, spreadsheetId } = await getAuthService();
    const now = new Date().toISOString();
    const txId = `tx_${nanoid(8)}`;
    
    const rowData = [
      txId,
      data.date,
      data.amount,
      data.description,
      data.type,
      data.category,
      data.notes || '',
      now
    ];
    
    await service.appendRow(spreadsheetId, SHEETS_CONFIG.ranges.transactions, rowData);
    revalidatePath("/dashboard/finance");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteTransaction(tx_id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { service, spreadsheetId } = await getAuthService();
    const rows = await service.readRows(spreadsheetId, SHEETS_CONFIG.ranges.transactions);
    if (!rows) throw new Error("No transactions found");
    
    const rowIndex = rows.findIndex(r => r[0] === tx_id);
    if (rowIndex === -1) throw new Error("Transaction not found");
    
    const sheetId = await service.getSheetId(spreadsheetId, SHEETS_CONFIG.tabs.transactions);
    await service.deleteRow(spreadsheetId, sheetId, rowIndex + 1);
    
    revalidatePath("/dashboard/finance");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getSavingGoals(): Promise<SavingGoal[]> {
  try {
    const { service, spreadsheetId } = await getAuthService();
    const rows = await service.readRows(spreadsheetId, SHEETS_CONFIG.ranges.savings);
    
    if (!rows) return [];
    
    return rows.map(row => ({
      goal_id: row[0] || '',
      name: row[1] || '',
      target_amount: parseFloat(row[2]) || 0,
      current_amount: parseFloat(row[3]) || 0,
      color: row[4] || '#C8975A',
      deadline: row[5] || '',
      notes: row[6] || '',
      created_at: row[7] || '',
    })).filter(g => g.goal_id);
  } catch (error) {
    console.error("Failed to get saving goals:", error);
    return [];
  }
}

export async function addSavingGoal(data: Omit<SavingGoal, 'goal_id' | 'created_at'>): Promise<{ success: boolean; error?: string }> {
  try {
    const { service, spreadsheetId } = await getAuthService();
    const now = new Date().toISOString();
    const goalId = `sg_${nanoid(8)}`;
    
    const rowData = [
      goalId,
      data.name,
      data.target_amount,
      data.current_amount,
      data.color,
      data.deadline || '',
      data.notes || '',
      now
    ];
    
    await service.appendRow(spreadsheetId, SHEETS_CONFIG.ranges.savings, rowData);
    revalidatePath("/dashboard/finance");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateSavingGoalAmount(goal_id: string, new_amount: number): Promise<{ success: boolean; error?: string }> {
  try {
    const { service, spreadsheetId } = await getAuthService();
    const rows = await service.readRows(spreadsheetId, SHEETS_CONFIG.ranges.savings);
    if (!rows) throw new Error("No saving goals found");
    
    const rowIndex = rows.findIndex(r => r[0] === goal_id);
    if (rowIndex === -1) throw new Error("Goal not found");
    
    // Column index for current_amount is 3 (D column)
    await service.updateRow(spreadsheetId, `${SHEETS_CONFIG.tabs.savings}!D${rowIndex + 2}`, [new_amount]);
    
    revalidatePath("/dashboard/finance");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteSavingGoal(goal_id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { service, spreadsheetId } = await getAuthService();
    const rows = await service.readRows(spreadsheetId, SHEETS_CONFIG.ranges.savings);
    if (!rows) throw new Error("No saving goals found");
    
    const rowIndex = rows.findIndex(r => r[0] === goal_id);
    if (rowIndex === -1) throw new Error("Goal not found");
    
    const sheetId = await service.getSheetId(spreadsheetId, SHEETS_CONFIG.tabs.savings);
    await service.deleteRow(spreadsheetId, sheetId, rowIndex + 1);
    
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
          monthlyData[label].Pemasukan += tx.amount;
        } else {
          monthlyData[label].Pengeluaran += tx.amount;
        }
      } catch (e) {
        continue;
      }
    }
    
    // Sort by date technically requires parsing the label or sorting before mapping, 
    // but object keys usually preserve insertion order in a chronological sense if appended.
    // For proper sorting, we should parse 'MMM YYYY'.
    return Object.entries(monthlyData).map(([bulan, data]) => ({
      bulan,
      ...data
    }));
  } catch (error) {
    console.error("Failed to get chart data:", error);
    return [];
  }
}
