export type Currency = 'UGX' | 'USD' | 'EUR' | 'GBP' | 'KES' | 'TZS';

export interface IncomeRecord {
  id: string;
  amount: number;
  category: 'Salary' | 'Business' | 'Rent' | 'Farming' | 'Gifts' | 'Other';
  date: string;
  notes: string;
  createdAt: string;
}

export interface ExpenseRecord {
  id: string;
  amount: number;
  category: 'Food' | 'Transport' | 'Rent' | 'Utilities' | 'School Fees' | 'Medical' | 'Shopping' | 'Other';
  date: string;
  notes: string;
  createdAt: string;
}

export interface DebtPayment {
  id: string;
  amount: number;
  date: string;
  notes: string;
}

export interface DebtRecord {
  id: string;
  type: 'borrowed' | 'lent'; // borrowed = owed by me, lent = owed to me
  partnerName: string;
  phoneNumber: string;
  amount: number;
  dueDate: string;
  notes: string;
  payments: DebtPayment[];
  status: 'Paid' | 'Partial' | 'Unpaid' | 'Overdue';
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  targetDate: string;
  currentAmount: number;
  createdAt: string;
}

export interface SavingsTransaction {
  id: string;
  goalId: string; // "general" or a specific goal ID
  type: 'deposit' | 'withdrawal';
  amount: number;
  date: string;
  notes: string;
  createdAt: string;
}

export interface AppSettings {
  currency: Currency;
  theme: 'light' | 'dark';
  pinEnabled: boolean;
  pinCode: string; // 4-digit numeric string
  requirePinOnStartup: boolean;
}

export interface FinancialData {
  income: IncomeRecord[];
  expenses: ExpenseRecord[];
  debts: DebtRecord[];
  savingsGoals: SavingsGoal[];
  savingsTransactions: SavingsTransaction[];
  settings: AppSettings;
}
