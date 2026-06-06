import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertTriangle, 
  Activity, 
  TrendingUp as GainIcon, 
  ShieldCheck, 
  Users, 
  Inbox,
  PiggyBank
} from 'lucide-react';
import { IncomeRecord, ExpenseRecord, DebtRecord, SavingsGoal } from '../types';
import { formatCurrency } from '../utils/financeHelpers';

interface DashboardProps {
  income: IncomeRecord[];
  expenses: ExpenseRecord[];
  debts: DebtRecord[];
  savingsGoals: SavingsGoal[];
  currency: string;
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ income, expenses, debts, savingsGoals, currency, onNavigate }: DashboardProps) {
  // Calculations
  const totalIncome = income.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  
  // Debts owed by me (borrowed) remaining balance
  const totalOwedByMe = debts
    .filter(d => d.type === 'borrowed')
    .reduce((acc, d) => {
      const paid = d.payments.reduce((sum, p) => sum + p.amount, 0);
      return acc + (d.amount - paid);
    }, 0);

  // Debts owed to me (lent) remaining balance
  const totalOwedToMe = debts
    .filter(d => d.type === 'lent')
    .reduce((acc, d) => {
      const paid = d.payments.reduce((sum, p) => sum + p.amount, 0);
      return acc + (d.amount - paid);
    }, 0);

  // Current Liquid Balance = (Income + Debts Borrowed) - (Expenses + Debts Owed to me? Or simply Income - Expenses)
  // Let's use standard Liquid balance = Total Income - Total Expenditures
  const currentBalance = totalIncome - totalExpenses;

  // Overdue Debts Calculation
  const today = new Date().toISOString().split('T')[0];
  const overdueDebts = debts.filter(d => {
    const paid = d.payments.reduce((sum, p) => sum + p.amount, 0);
    const hasBalance = d.amount - paid > 0;
    return hasBalance && d.dueDate < today && d.status !== 'Paid';
  });

  // Recent combined transactions
  const combinedTransactions = [
    ...income.map(i => ({ ...i, type: 'income' as const })),
    ...expenses.map(e => ({ ...e, type: 'expense' as const }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
   .slice(0, 5);

  // Savings progress
  const totalSavings = savingsGoals.reduce((acc, g) => acc + g.currentAmount, 0);

  // SVGs charts: compute percentages for relative chart
  const maxVolume = Math.max(totalIncome, totalExpenses, 1);
  const incomeHeightPercent = Math.min(100, Math.round((totalIncome / maxVolume) * 100));
  const expenseHeightPercent = Math.min(100, Math.round((totalExpenses / maxVolume) * 100));

  return (
    <div className="space-y-6 font-sans">
      {/* Dynamic Overdue Debts Banner */}
      {overdueDebts.length > 0 && (
        <div id="overdue-debt-alert-banner" className="bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm flex items-start space-x-3.5 animate-attention">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300">
              Immediate Debt Reminders ({overdueDebts.length})
            </h4>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
              You have {overdueDebts.length} unresolved debt items past their scheduled pay-by dates. Keep your standing healthy!
            </p>
            <button 
              id="alert-manage-debts-btn"
              onClick={() => onNavigate('debts')} 
              className="text-xs font-bold text-amber-900 dark:text-amber-200 underline mt-2 hover:text-amber-700 block transition"
            >
              Take Action on Debts &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Main Grid Metrics with Premium Glassmorphism Look */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: Main Balance Sheet */}
        <div id="current-balance-widget" className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-6 shadow-md border border-emerald-500/10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-8 -mt-8 pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-emerald-100 text-xs font-semibold uppercase tracking-wider">Net Solid Balance</span>
              <span className="bg-white/10 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide">Ready Cash</span>
            </div>
            <h2 className="text-3xl font-extrabold font-mono tracking-tight mt-3">
              {formatCurrency(currentBalance, currency)}
            </h2>
            <p className="text-[11px] text-emerald-100 font-medium mt-1">
              Consolidated earnings minus costs
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-6 pt-4 border-t border-white/10 text-xs text-emerald-100">
            <div className={`w-2.5 h-2.5 rounded-full ${currentBalance >= 0 ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400 animate-pulse'}`}></div>
            <span>Status: {currentBalance >= 0 ? 'Surplus Reserve' : 'Deficit Watch'}</span>
          </div>
        </div>

        {/* Card 2: Income and Expenditure Quick View */}
        <div id="quick-income-exp-widget" className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div className="grid grid-cols-2 gap-4 divide-x divide-slate-100 dark:divide-slate-800">
            <div>
              <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="w-4 h-4 shrink-0" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Income</span>
              </div>
              <h3 className="text-lg font-bold font-mono text-slate-800 dark:text-slate-200 mt-2">
                {formatCurrency(totalIncome, currency)}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {income.length} records in system
              </p>
            </div>
            <div className="pl-4">
              <div className="flex items-center space-x-1.5 text-rose-600 dark:text-rose-400">
                <ArrowDownLeft className="w-4 h-4 shrink-0" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Expenditures</span>
              </div>
              <h3 className="text-lg font-bold font-mono text-slate-800 dark:text-slate-200 mt-2">
                {formatCurrency(totalExpenses, currency)}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {expenses.length} records logged
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-800/50">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Budget Consumed</span>
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                {totalIncome > 0 ? Math.round((totalExpenses / totalIncome) * 100) : 0}%
              </span>
            </div>
            {/* Elegant visual progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Card 3: Debt Balances Summary */}
        <div id="debts-widget" className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div className="grid grid-cols-2 gap-4 divide-x divide-slate-100 dark:divide-slate-800">
            <div>
              <div className="flex items-center space-x-1.5 text-rose-500">
                <TrendingDown className="w-4 h-4 shrink-0" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Owed By Me</span>
              </div>
              <h3 className="text-lg font-bold font-mono text-slate-800 dark:text-slate-200 mt-2 text-rose-600 dark:text-rose-400">
                {formatCurrency(totalOwedByMe, currency)}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5 select-none">
                Liabilities to settle
              </p>
            </div>
            <div className="pl-4">
              <div className="flex items-center space-x-1.5 text-sky-500">
                <TrendingUp className="w-4 h-4 shrink-0" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Owed To Me</span>
              </div>
              <h3 className="text-lg font-bold font-mono text-slate-800 dark:text-slate-200 mt-2 text-sky-600 dark:text-sky-400">
                {formatCurrency(totalOwedToMe, currency)}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5 select-none font-medium text-sky-500/90">
                Receivables due soon
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800/50 flex justify-between items-center">
            <span className="text-xs text-slate-400">Net Loan Standing</span>
            <span className={`text-xs font-mono font-bold ${totalOwedToMe - totalOwedByMe >= 0 ? 'text-sky-500' : 'text-rose-500'}`}>
              {(totalOwedToMe - totalOwedByMe >= 0 ? '+' : '') + formatCurrency(totalOwedToMe - totalOwedByMe, currency)}
            </span>
          </div>
        </div>

      </div>

      {/* Main Row: Advanced Custom SVG Graphs and Recent Activity split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Native Interactive Chart Graphics (7 Columns) */}
        <div id="financial-analysis-widget" className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 text-left">
                Financial overview analysis
              </h3>
              <p className="text-xs text-slate-400">Income relative comparison against expenditures</p>
            </div>
            <div className="flex space-x-4 text-xs font-semibold">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-slate-500">Income</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="text-slate-500">Spending</span>
              </span>
            </div>
          </div>

          {/* SVG representation of Bar graphs with beautiful gradients */}
          <div className="h-60 flex items-end justify-around border-b border-l border-slate-100 dark:border-slate-800 p-2 relative">
            
            {/* Grid Helper lines */}
            <div className="absolute inset-x-0 top-1/4 border-t border-slate-50 dark:border-slate-800/100 pointer-events-none"></div>
            <div className="absolute inset-x-0 top-2/4 border-t border-slate-50 dark:border-slate-800/100 pointer-events-none"></div>
            <div className="absolute inset-x-0 top-3/4 border-t border-slate-50 dark:border-slate-800/100 pointer-events-none"></div>

            {/* Income Bar */}
            <div className="flex flex-col items-center w-24 z-10">
              <span className="text-xs font-semibold text-emerald-600 mb-2 font-mono">
                {incomeHeightPercent}%
              </span>
              <div 
                className="w-16 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg shadow-md transition-all duration-700"
                style={{ height: `${Math.max(20, incomeHeightPercent * 1.5)}px` }}
              ></div>
              <span className="text-xs text-slate-400 dark:text-slate-400 mt-2 font-medium">Inflows</span>
            </div>

            {/* Expenses Bar */}
            <div className="flex flex-col items-center w-24 z-10">
              <span className="text-xs font-semibold text-rose-600 mb-2 font-mono">
                {expenseHeightPercent}%
              </span>
              <div 
                className="w-16 bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-lg shadow-md transition-all duration-700"
                style={{ height: `${Math.max(20, expenseHeightPercent * 1.5)}px` }}
              ></div>
              <span className="text-xs text-slate-400 dark:text-slate-400 mt-2 font-medium font-sans">Outflows</span>
            </div>

            {/* Savings Goal progress circular summary inside bar column */}
            <div className="flex flex-col items-center w-36 z-10 text-center select-none">
              <div className="w-16 h-16 rounded-full border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center relative p-1 bg-slate-50 dark:bg-slate-950">
                <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                  {formatCurrency(totalSavings, currency).replace('UGX', '').trim()}
                </div>
                {/* SVG Ring outline */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle 
                    cx="32" cy="32" r="30" 
                    fill="transparent" 
                    stroke="#10b981" 
                    strokeWidth="3"
                    strokeDasharray={`${2 * Math.PI * 30}`}
                    strokeDashoffset={`${2 * Math.PI * 30 * 0.3}`} // hardcode visual ring demo
                  />
                </svg>
              </div>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-2">Saved Balance</span>
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-3 px-2">
            <span>Graph base scale: relative volume matching {formatCurrency(maxVolume, currency)}</span>
            <span>Refreshed live offline</span>
          </div>
        </div>

        {/* Right Side: Recent Transactions combined (5 Columns) */}
        <div id="recent-transactions-widget" className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Recent Activities
              </h3>
              <p className="text-xs text-emerald-500 font-semibold cursor-pointer hover:underline" onClick={() => onNavigate('reports')}>
                View Reports
              </p>
            </div>

            {combinedTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Inbox className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs text-slate-400">No records entered yet.</p>
                <div className="flex space-x-2 mt-4">
                  <button onClick={() => onNavigate('income')} className="px-3 py-1 text-[10px] bg-emerald-500 text-white rounded font-bold hover:bg-emerald-600">
                    + Income
                  </button>
                  <button onClick={() => onNavigate('expenses')} className="px-3 py-1 text-[10px] bg-rose-500 text-white rounded font-bold hover:bg-rose-600">
                    + Expense
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[260px] overflow-y-auto pr-1">
                {combinedTransactions.map((tx) => (
                  <div 
                    key={tx.id} 
                    className="flex justify-between items-center p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition border border-transparent hover:border-slate-100 dark:hover:border-slate-800/50"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        tx.type === 'income' 
                          ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                      }`}>
                        {tx.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                      </div>
                      <div className="truncate text-left">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                          {tx.notes || tx.category}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {tx.category} &bull; {tx.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-2">
                      <span className={`text-xs font-bold font-mono ${
                        tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency).replace('UGX', '').trim()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800/50 flex space-x-3">
            <button 
              id="dash-add-inc-btn"
              onClick={() => onNavigate('income')} 
              className="flex-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 py-2.5 rounded-xl text-xs font-bold border border-emerald-200/20 active:scale-95 transition"
            >
              Add Income
            </button>
            <button 
              id="dash-add-exp-btn"
              onClick={() => onNavigate('expenses')} 
              className="flex-1 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 py-2.5 rounded-xl text-xs font-bold border border-rose-200/20 active:scale-95 transition"
            >
              Log Expense
            </button>
          </div>
        </div>

      </div>

      {/* Savings Goals Widgets */}
      <div id="savings-dashboard-grid" className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 text-left">
              Active Savings Targets
            </h3>
            <p className="text-xs text-slate-400">Keep contributing persistently to secure your financial target milestones</p>
          </div>
          <button 
            id="dash-savings-btn"
            onClick={() => onNavigate('savings')} 
            className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center space-x-1"
          >
            <PiggyBank className="w-3.5 h-3.5" />
            <span>Manage Savings</span>
          </button>
        </div>

        {savingsGoals.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-xs text-slate-400 mb-3">No active financial goal set.</p>
            <button onClick={() => onNavigate('savings')} className="inline-flex bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-1.5 px-4 rounded-lg">
              Set Savings Target
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savingsGoals.map(goal => {
              const progressPercent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
              return (
                <div key={goal.id} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate pr-2">{goal.title}</h4>
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">
                      {progressPercent}% Settled
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 font-mono mt-1">
                    <span>Now: {formatCurrency(goal.currentAmount, currency)}</span>
                    <span>Target: {formatCurrency(goal.targetAmount, currency)}</span>
                  </div>
                  <div className="w-full bg-slate-250 dark:bg-slate-700 h-2 rounded-full mt-3 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
