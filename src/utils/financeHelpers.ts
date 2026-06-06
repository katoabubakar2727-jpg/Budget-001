import { FinancialData, IncomeRecord, ExpenseRecord, DebtRecord, SavingsGoal, SavingsTransaction } from '../types';

// Format currency values exquisitely
export function formatCurrency(amount: number, currency: string = 'UGX'): string {
  try {
    if (currency === 'UGX') {
      return `UGX ${Math.round(amount).toLocaleString('en-UG')}`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(amount);
  } catch (e) {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

// Generate unique IDs
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

// Simulate standard encryption/decryption for local backups
export function encryptBackup(data: FinancialData): string {
  try {
    const rawString = JSON.stringify(data);
    // Safe base64 obfuscation for offline storage text file backups
    return btoa(unescape(encodeURIComponent(rawString)));
  } catch (error) {
    console.error('Failed to encrypt backup', error);
    return JSON.stringify(data);
  }
}

export function decryptBackup(encryptedStr: string): FinancialData | null {
  try {
    const decoded = decodeURIComponent(escape(atob(encryptedStr)));
    const parsed = JSON.parse(decoded);
    if (parsed.income && parsed.expenses && parsed.debts && parsed.settings) {
      return parsed as FinancialData;
    }
    return null;
  } catch (error) {
    // If it is regular JSON format
    try {
      const parsed = JSON.parse(encryptedStr);
      if (parsed.income && parsed.expenses) return parsed as FinancialData;
    } catch {}
    console.error('Failed to decrypt backup', error);
    return null;
  }
}

// Export array of objects to standard CSV file (Excel readable)
export function exportToCSV(filename: string, rows: object[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]).join(',');
  const content = rows.map(r => 
    Object.values(r).map(v => {
      const strVal = typeof v === 'object' ? JSON.stringify(v) : String(v);
      return `"${strVal.replace(/"/g, '""')}"`;
    }).join(',')
  ).join('\n');
  
  const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + content;
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Check for overdue debts
export function checkDebtAlerts(debts: DebtRecord[]): DebtRecord[] {
  const today = new Date().toISOString().split('T')[0];
  return debts.filter(debt => {
    if (debt.status === 'Paid') return false;
    return debt.dueDate < today;
  });
}

// Mock initial financial data to engage the user immediately with realistic UgX metrics
export const seedInitialData = (): FinancialData => {
  const now = new Date();
  const formatOffset = (days: number) => {
    const date = new Date(now);
    date.setDate(now.getDate() - days);
    return date.toISOString().split('T')[0];
  };

  const initialIncome: IncomeRecord[] = [
    {
      id: "inc-1",
      amount: 4500000,
      category: "Salary",
      date: formatOffset(12),
      notes: "Main tech consultancy monthly wages",
      createdAt: new Date().toISOString()
    },
    {
      id: "inc-2",
      amount: 1200000,
      category: "Business",
      date: formatOffset(5),
      notes: "Retail store inventory sales profit",
      createdAt: new Date().toISOString()
    },
    {
      id: "inc-3",
      amount: 650000,
      category: "Farming",
      date: formatOffset(1),
      notes: "Matooke and coffee beans distribution sales",
      createdAt: new Date().toISOString()
    }
  ];

  const initialExpenses: ExpenseRecord[] = [
    {
      id: "exp-1",
      amount: 800000,
      category: "Rent",
      date: formatOffset(10),
      notes: "Apartment rental payment Kampala Suburban",
      createdAt: new Date().toISOString()
    },
    {
      id: "exp-2",
      amount: 150000,
      category: "Transport",
      date: formatOffset(8),
      notes: "Fuel and boda-boda weekly travel",
      createdAt: new Date().toISOString()
    },
    {
      id: "exp-3",
      amount: 950000,
      category: "School Fees",
      date: formatOffset(4),
      notes: "Children primary term tuition contribution",
      createdAt: new Date().toISOString()
    },
    {
      id: "exp-4",
      amount: 180000,
      category: "Utilities",
      date: formatOffset(2),
      notes: "Umeme power reload and National Water",
      createdAt: new Date().toISOString()
    },
    {
      id: "exp-5",
      amount: 220000,
      category: "Food",
      date: formatOffset(1),
      notes: "Grocery batch from Nakasero market",
      createdAt: new Date().toISOString()
    }
  ];

  const initialDebts: DebtRecord[] = [
    {
      id: "debt-1",
      type: "borrowed", // owed by me
      partnerName: "Nsubuga Brian (Centenary Bank Agent)",
      phoneNumber: "+256 702 445588",
      amount: 1500000,
      dueDate: formatOffset(-5), // 5 days overdue
      notes: "Commercial shop expansion loan",
      payments: [
        { id: "p-1", amount: 500000, date: formatOffset(-1), notes: "First cash deposit" }
      ],
      status: "Overdue",
      createdAt: new Date().toISOString()
    },
    {
      id: "debt-2",
      type: "lent", // owed to me
      partnerName: "Nankya Sarah",
      phoneNumber: "+256 772 112233",
      amount: 600000,
      dueDate: formatOffset(-10), // Overdue
      notes: "Farm supply supplies credit line",
      payments: [],
      status: "Overdue",
      createdAt: new Date().toISOString()
    },
    {
      id: "debt-3",
      type: "borrowed",
      partnerName: "MobiLoan Uganda",
      phoneNumber: "+256 312 999999",
      amount: 300000,
      dueDate: formatOffset(10), // 10 days in future
      notes: "Quick mobile emergency float recharge",
      payments: [],
      status: "Unpaid",
      createdAt: new Date().toISOString()
    }
  ];

  const initialGoals: SavingsGoal[] = [
    {
      id: "goal-1",
      title: "Land Acquisition Mukono",
      targetAmount: 15000000,
      targetDate: "2026-12-15",
      currentAmount: 4000000,
      createdAt: new Date().toISOString()
    },
    {
      id: "goal-2",
      title: "Emergency Capital Cash cushion",
      targetAmount: 2500000,
      targetDate: "2026-08-01",
      currentAmount: 1200000,
      createdAt: new Date().toISOString()
    }
  ];

  const initialTransactions: SavingsTransaction[] = [
    {
      id: "s-t1",
      goalId: "goal-1",
      type: "deposit",
      amount: 3000000,
      date: formatOffset(9),
      notes: "Bonus payout savings",
      createdAt: new Date().toISOString()
    },
    {
      id: "s-t2",
      goalId: "goal-1",
      type: "deposit",
      amount: 1000000,
      date: formatOffset(3),
      notes: "Store excess contribution",
      createdAt: new Date().toISOString()
    },
    {
      id: "s-t3",
      goalId: "goal-2",
      type: "deposit",
      amount: 1200000,
      date: formatOffset(6),
      notes: "Emergency account opening deposit",
      createdAt: new Date().toISOString()
    }
  ];

  return {
    income: initialIncome,
    expenses: initialExpenses,
    debts: initialDebts,
    savingsGoals: initialGoals,
    savingsTransactions: initialTransactions,
    settings: {
      currency: "UGX",
      theme: "light",
      pinEnabled: false,
      pinCode: "",
      requirePinOnStartup: false
    }
  };
};
