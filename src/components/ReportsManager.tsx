import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  TrendingUp, 
  TrendingDown, 
  Coins, 
  PiggyBank, 
  Search, 
  Filter, 
  ChevronRight, 
  Activity, 
  ArrowUpRight, 
  ArrowDownLeft, 
  BarChart,
  HelpCircle
} from 'lucide-react';
import { IncomeRecord, ExpenseRecord, DebtRecord, SavingsGoal } from '../types';
import { formatCurrency, exportToCSV } from '../utils/financeHelpers';

interface ReportsManagerProps {
  income: IncomeRecord[];
  expenses: ExpenseRecord[];
  debts: DebtRecord[];
  savingsGoals: SavingsGoal[];
  currency: string;
}

export default function ReportsManager({ income, expenses, debts, savingsGoals, currency }: ReportsManagerProps) {
  // Report View Settings
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Date calculations
  const today = new Date();
  const getDaysAgo = (days: number) => {
    const d = new Date();
    d.setDate(today.getDate() - days);
    return d.toISOString().split('T')[0];
  };

  // Determine active date range based on slider selection
  const activeStartDate = startDate || (() => {
    if (timeRange === 'daily') return getDaysAgo(1);
    if (timeRange === 'weekly') return getDaysAgo(7);
    if (timeRange === 'monthly') return getDaysAgo(30);
    if (timeRange === 'yearly') return getDaysAgo(365);
    return '1970-01-01';
  })();

  const activeEndDate = endDate || today.toISOString().split('T')[0];

  // Filtering transactions inside date window
  const filteredIncome = income.filter(item => {
    const inRange = item.date >= activeStartDate && item.date <= activeEndDate;
    const matchSearch = item.notes.toLowerCase().includes(searchTerm.toLowerCase()) || item.category.toLowerCase().includes(searchTerm.toLowerCase());
    return inRange && matchSearch;
  });

  const filteredExpenses = expenses.filter(item => {
    const inRange = item.date >= activeStartDate && item.date <= activeEndDate;
    const matchSearch = item.notes.toLowerCase().includes(searchTerm.toLowerCase()) || item.category.toLowerCase().includes(searchTerm.toLowerCase());
    return inRange && matchSearch;
  });

  // Calculate Aggregates inside window
  const totalInc = filteredIncome.reduce((sum, item) => sum + item.amount, 0);
  const totalExp = filteredExpenses.reduce((sum, item) => sum + item.amount, 0);
  const netSavingsDeficit = totalInc - totalExp;

  // Expenditures category breakdowns for audit
  const expenseCategoryBreakdown = filteredExpenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  // Excel Export
  const handleExportExcel = () => {
    const dataset = [
      ...filteredIncome.map(i => ({ Date: i.date, Type: 'INCOME', Category: i.category, Description: i.notes, Amount: i.amount })),
      ...filteredExpenses.map(e => ({ Date: e.date, Type: 'EXPENSE', Category: e.category, Description: e.notes, Amount: e.amount }))
    ].sort((a,b) => a.Date.localeCompare(b.Date));

    if (dataset.length === 0) {
      alert("No printable transactions found in the active date selection to export.");
      return;
    }
    
    exportToCSV(`financial-report-${timeRange}-${activeStartDate}-to-${activeEndDate}`, dataset);
  };

  // Trigger browser print context (Chrome lets you "Save as PDF" instantly)
  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-sans select-text">
      
      {/* Header and Actions Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 text-left">
            Financial Ledger Reports
          </h2>
          <p className="text-xs text-slate-400">Generate custom periodic invoices, export CSV audits and print statements</p>
        </div>
        <div className="flex space-x-3 shrink-0">
          <button
            id="btn-export-excel"
            onClick={handleExportExcel}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold py-3 px-4 rounded-xl shadow-xs transition inline-flex items-center space-x-1.5"
            title="Export Excel worksheet"
          >
            <Download className="w-4 h-4" />
            <span>Excel Export</span>
          </button>
          <button
            id="btn-print-pdf"
            onClick={handlePrintReport}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-md transition inline-flex items-center space-x-1.5"
            title="Download PDF or Print statement"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Criteria Selection Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 space-y-4 print:hidden">
        
        {/* Presets Grid */}
        <div className="grid grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200/20">
          {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((preset) => (
            <button
              id={`preset-range-${preset}`}
              key={preset}
              onClick={() => {
                setTimeRange(preset);
                setStartDate(''); // Clear custom to use calculations
                setEndDate('');
              }}
              className={`py-2 px-1 rounded-lg text-xs font-bold uppercase tracking-wider transition capitalize ${
                timeRange === preset && !startDate
                  ? 'bg-slate-800 dark:bg-slate-800 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Custom date boundaries inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-left">Custom Start Date</span>
            <input
              id="report-custom-start"
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setTimeRange('monthly'); // Reset to default custom
              }}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-slate-500 outline-none transition"
            />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-left">Custom End Date</span>
            <input
              id="report-custom-end"
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setTimeRange('monthly');
              }}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-slate-500 outline-none transition"
            />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-left font-sans">Search Notes</span>
            <div className="relative font-sans">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                id="report-search"
                type="text"
                placeholder="Filter statements notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-slate-500 outline-none transition"
              />
            </div>
          </div>

        </div>

      </div>

      {/* PRINT-ONLY HEADER (Invisible on UI screen but appears on PDF generation) */}
      <div className="hidden print:block text-slate-900 p-4 border-b-2 border-slate-950 text-left font-sans">
        <h1 className="text-2xl font-black">My Income, Expenditures & Debts Report</h1>
        <p className="text-xs text-slate-400 mt-1">Audit statement generated locally offline context</p>
        <div className="grid grid-cols-2 gap-4 mt-4 text-[10px] uppercase font-mono tracking-wider">
          <span>Target Window: {activeStartDate} to {activeEndDate}</span>
          <span className="text-right">Generated Date: {new Date().toISOString().split('T')[0]}</span>
        </div>
      </div>

      {/* Aggregate Report Sheets Card Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Total Inflows */}
        <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-5 rounded-2xl text-left">
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Report period income</span>
          </div>
          <h3 className="text-xl font-black font-mono mt-2 text-slate-800 dark:text-slate-100">
            {formatCurrency(totalInc, currency)}
          </h3>
          <span className="text-[10px] text-slate-400 mt-1 block">Based on {filteredIncome.length} matching sources</span>
        </div>

        {/* Total Outflows */}
        <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-5 rounded-2xl text-left">
          <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400">
            <TrendingDown className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Report period spending</span>
          </div>
          <h3 className="text-xl font-black font-mono mt-2 text-slate-800 dark:text-slate-100">
            {formatCurrency(totalExp, currency)}
          </h3>
          <span className="text-[10px] text-slate-400 mt-1 block">Across {filteredExpenses.length} mapped entries</span>
        </div>

        {/* Period Savings Margin */}
        <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-5 rounded-2xl text-left">
          <div className="flex items-center space-x-2 text-sky-500">
            <Coins className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Net Surplus Balance</span>
          </div>
          <h3 className={`text-xl font-black font-mono mt-2 ${netSavingsDeficit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
            {formatCurrency(netSavingsDeficit, currency)}
          </h3>
          <span className="text-[10px] text-slate-400 mt-1 block">Saved margin for targets</span>
        </div>

      </div>

      {/* Mapped Expenditure allocations chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl text-left">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-slate-800 dark:text-slate-200 flex items-center space-x-2">
          <BarChart className="w-4 h-4 text-emerald-500" />
          <span>Expense category volume distribution</span>
        </h3>
        {filteredExpenses.length === 0 ? (
          <p className="text-xs text-slate-400">No expenditures recorded in this range.</p>
        ) : (
          <div className="space-y-4 font-sans">
            {Object.entries(expenseCategoryBreakdown).map(([cat, val]) => {
              const fractionPercent = Math.min(100, Math.round((val / (totalExp || 1)) * 100));
              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{cat}</span>
                    <span className="font-mono text-slate-500 font-medium">
                      {formatCurrency(val, currency)} ({fractionPercent}%)
                    </span>
                  </div>
                  {/* Category progress segment */}
                  <div className="w-full bg-slate-100 dark:bg-slate-950 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${fractionPercent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Statement tables lists */}
      <div className="bg-white dark:bg-slate-900 border border-slate-101 dark:border-slate-800 rounded-2xl overflow-hidden text-left">
        <div className="p-4 border-b border-slate-105 dark:border-slate-800 flex justify-between items-center print:hidden">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-805 dark:text-slate-200">
            Statement ledger lines
          </h3>
          <span className="text-[10px] bg-slate-100 dark:bg-slate-950 px-2 rounded-lg font-mono text-slate-500">
            Showing {filteredIncome.length + filteredExpenses.length} entries in range
          </span>
        </div>

        {filteredIncome.length === 0 && filteredExpenses.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-sans">
            No entries captured in selected filter parameters to populate statement lines.
          </div>
        ) : (
          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-950 text-left border-b-2 border-slate-100 dark:border-slate-850 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Transaction Type</th>
                  <th className="py-2.5 px-4">Group/Category</th>
                  <th className="py-2.5 px-4">Memo Detail</th>
                  <th className="py-2.5 px-4 text-right">Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {/* Combined transaction sorting by date newest */}
                {[
                  ...filteredIncome.map(i => ({ ...i, txType: 'INFLOW' as const })),
                  ...filteredExpenses.map(e => ({ ...e, txType: 'OUTFLOW' as const }))
                ]
                .sort((a,b) => b.date.localeCompare(a.date))
                .map((tx, idx) => {
                  const isInflow = tx.txType === 'INFLOW';
                  return (
                    <tr key={`${tx.id}-${idx}`} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/10 transition">
                      <td className="py-2.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {tx.date}
                      </td>
                      <td className="py-2.5 px-4 whitespace-nowrap font-sans">
                        <span className={`inline-flex items-center space-x-1 font-bold text-[10px] tracking-wider uppercase ${isInflow ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {isInflow ? <ArrowUpRight className="w-3 px-0.5 shrink-0" /> : <ArrowDownLeft className="w-3 px-0.5 shrink-0" />}
                          <span>{tx.txType}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {tx.category}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 italic">
                        {tx.notes || <span className="text-slate-300">No notes</span>}
                      </td>
                      <td className={`py-2.5 px-4 text-right font-black font-mono whitespace-nowrap ${isInflow ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {isInflow ? '+' : '-'}{formatCurrency(tx.amount, currency).replace('UGX', '').trim()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
