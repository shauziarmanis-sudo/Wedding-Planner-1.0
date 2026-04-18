export interface TransactionRecord {
  id: string;
  date: string;
  amount: number;
  category: string;
  type: 'INCOME' | 'EXPENSE';
  notes?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
}
