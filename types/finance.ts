export interface Transaction {
  tx_id: string;
  date: string;
  amount: number;
  description: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  notes?: string;
  created_at: string;
}

export interface SavingGoal {
  goal_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  color: string;
  deadline?: string;
  notes?: string;
  created_at: string;
}
