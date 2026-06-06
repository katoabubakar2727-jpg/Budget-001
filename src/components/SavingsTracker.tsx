import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Calendar, 
  PiggyBank, 
  TrendingUp, 
  Trash2, 
  X, 
  Tag, 
  Sparkles, 
  AlertCircle, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  HelpCircle,
  FileText
} from 'lucide-react';
import { SavingsGoal, SavingsTransaction } from '../types';
import { formatCurrency, generateId } from '../utils/financeHelpers';

interface SavingsTrackerProps {
  goals: SavingsGoal[];
  transactions: SavingsTransaction[];
  currency: string;
  onAddGoal: (goal: SavingsGoal) => void;
  onEditGoal: (goal: SavingsGoal) => void;
  onDeleteGoal: (id: string) => void;
  onAddTransaction: (tx: SavingsTransaction) => void;
}

export default function SavingsTracker({ goals, transactions, currency, onAddGoal, onEditGoal, onDeleteGoal, onAddTransaction }: SavingsTrackerProps) {
  // Modal states
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);

  // Form Fields for Goal
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalDate, setGoalDate] = useState('');

  // Form Fields for Savings Transaction (Deposit/Withdrawal)
  const [txType, setTxType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [txAmount, setTxAmount] = useState('');
  const [txGoalId, setTxGoalId] = useState('general');
  const [txNotes, setTxNotes] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);

  // Calculations
  const totalSavedAll = goals.reduce((sum, g) => sum + g.currentAmount, 0);

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) {
      alert("Please provide a title for your goal.");
      return;
    }
    const target = parseFloat(goalTarget);
    if (isNaN(target) || target <= 0) {
      alert("Target amount must be a positive number.");
      return;
    }

    const newGoal: SavingsGoal = {
      id: generateId(),
      title: goalTitle,
      targetAmount: target,
      targetDate: goalDate || new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
      currentAmount: 0,
      createdAt: new Date().toISOString()
    };

    onAddGoal(newGoal);
    setIsGoalModalOpen(false);
    setGoalTitle('');
    setGoalTarget('');
    setGoalDate('');
  };

  const handleTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(txAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Please provide a valid numeric transaction amount.");
      return;
    }

    // Determine goal and update
    let targetGoal: SavingsGoal | undefined = goals.find(g => g.id === txGoalId);
    
    if (txGoalId !== 'general') {
      if (!targetGoal) {
        alert("Selected savings target is invalid.");
        return;
      }
      
      if (txType === 'withdrawal' && targetGoal.currentAmount < amt) {
        alert(`Insufficient savings in selected target! Maximum withdrawable: UGX ${targetGoal.currentAmount}`);
        return;
      }
    }

    const newTx: SavingsTransaction = {
      id: generateId(),
      goalId: txGoalId,
      type: txType,
      amount: amt,
      date: txDate,
      notes: txNotes || (txType === 'deposit' ? 'General deposit' : 'General withdrawal'),
      createdAt: new Date().toISOString()
    };

    // Trigger parent storage update for the specific goal
    if (targetGoal) {
      const updatedAmount = txType === 'deposit' 
        ? targetGoal.currentAmount + amt 
        : targetGoal.currentAmount - amt;

      onEditGoal({
        ...targetGoal,
        currentAmount: updatedAmount
      });
    }

    onAddTransaction(newTx);
    setIsTxModalOpen(false);
    setTxAmount('');
    setTxNotes('');
    setTxGoalId('general');
  };

  const handleDeleteGoal = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the goal "${name}"? It will permanently release details and current progress balances.`)) {
      onDeleteGoal(id);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 font-sans">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 text-left">
            Savings Planner
          </h2>
          <p className="text-xs text-slate-400">Lock deposits and track progress towards financial targets</p>
        </div>
        <div className="flex space-x-3 shrink-0">
          <button
            id="btn-add-savings-goal"
            onClick={() => setIsGoalModalOpen(true)}
            className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-md transition inline-flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Saving Target</span>
          </button>
          <button
            id="btn-savings-action"
            onClick={() => setIsTxModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-md transition inline-flex items-center space-x-2 animate-pulse"
          >
            <PiggyBank className="w-4 h-4" />
            <span>Deposit / Withdraw Plan</span>
          </button>
        </div>
      </div>

      {/* Quick Savings metrics overview */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-6 shadow-md border border-emerald-500/10 flex flex-col justify-between overflow-hidden relative font-sans">
        <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full -mr-6 -mt-6 pointer-events-none"></div>
        <div>
          <div className="flex items-center justify-between">
            <span className="text-emerald-100 text-xs font-semibold uppercase tracking-wider">Consolidated Savings Reserve</span>
            <span className="bg-white/10 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide">Secure</span>
          </div>
          <h2 className="text-3xl font-extrabold font-mono tracking-tight mt-3">
            {formatCurrency(totalSavedAll, currency)}
          </h2>
          <p className="text-11px text-emerald-100 font-medium mt-1 select-none">
            Total of all active savings folders and general cash reserves
          </p>
        </div>
      </div>

      {/* Goals Segment List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 text-left font-sans">
          Your active goal portfolios ({goals.length})
        </h3>

        {goals.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-400">No active plans configured. Click &ldquo;Create New Saving Target&rdquo; to launch your first budget goal!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {goals.map(goal => {
              const progressPercent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
              const isCompleted = goal.currentAmount >= goal.targetAmount;

              return (
                <div 
                  key={goal.id} 
                  className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm transition flex flex-col justify-between ${
                    isCompleted 
                      ? 'border-emerald-300 dark:border-emerald-950/45 bg-gradient-to-br from-emerald-50/20 to-transparent' 
                      : 'border-slate-105 dark:border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <div className="text-left">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide truncate max-w-[200px]" title={goal.title}>
                          {goal.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono inline-flex items-center space-x-1 mt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-350" />
                          <span>Target Limit: {goal.targetDate}</span>
                        </span>
                      </div>
                      
                      <button
                        id={`btn-del-goal-${goal.id}`}
                        onClick={() => handleDeleteGoal(goal.id, goal.title)}
                        className="text-slate-350 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-lg transition"
                        title="Delete savings target"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Progress details */}
                    <div className="mt-5 space-y-1 text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>Current Pool Saved:</span>
                        <span className="font-bold text-slate-650 dark:text-slate-300 font-mono text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(goal.currentAmount, currency)}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-450">
                        <span>Overall Target:</span>
                        <span className="font-bold text-slate-500 font-mono">{formatCurrency(goal.targetAmount, currency)}</span>
                      </div>
                      {goal.targetAmount - goal.currentAmount > 0 && (
                        <div className="flex justify-between text-slate-400">
                          <span>Remaining Balance deficit:</span>
                          <span className="font-bold text-amber-500 font-mono">
                            {formatCurrency(goal.targetAmount - goal.currentAmount, currency)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Completion indicators */}
                    <div className="mt-4 pt-1 flex items-center justify-between border-t border-slate-50 dark:border-slate-800/10 text-[11px] font-sans">
                      <span className="text-slate-450">Target Completion Status:</span>
                      <span className={`font-bold ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                        {progressPercent}% Complete
                      </span>
                    </div>

                    {/* Big visible progress bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-950 h-3 rounded-full mt-3 overflow-hidden shadow-inner border border-slate-200/10">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-gradient-to-r from-emerald-500 to-teal-500 animate-pulse' : 'bg-emerald-500'}`}
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Savings Logs histories */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-xs font-sans">
        <div className="p-5 border-b border-slate-105 dark:border-slate-800 text-left">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
            Savings transaction histories
          </h3>
          <p className="text-[11px] text-slate-400">Historical summary tracker of deposits and withdrawals</p>
        </div>

        {transactions.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-xs">
            No deposits/withdrawals recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-950 text-left border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Associated Target Portfolio</th>
                  <th className="py-2.5 px-4">Notes</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {transactions.slice().reverse().map((tx) => {
                  const correlatedGoal = goals.find(g => g.id === tx.goalId);
                  const isDeposit = tx.type === 'deposit';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/20 transition">
                      <td className="py-2.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {tx.date}
                      </td>
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center space-x-1 font-bold text-[10px] uppercase ${isDeposit ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {isDeposit ? <ArrowUpCircle className="w-3.5 h-3.5 shrink-0" /> : <ArrowDownCircle className="w-3.5 h-3.5 shrink-0" />}
                          <span>{tx.type}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {correlatedGoal ? correlatedGoal.title : <span className="text-slate-400 italic">General surplus fund</span>}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 italic">
                        {tx.notes}
                      </td>
                      <td className={`py-2.5 px-4 text-right font-black font-mono whitespace-nowrap ${isDeposit ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {isDeposit ? '+' : '-'}{formatCurrency(tx.amount, currency).replace('UGX', '').trim()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Goal creation modal */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade font-sans">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transform transition-all duration-300">
            <div className="bg-white dark:bg-slate-900 p-5 border-b border-slate-105 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Setup new Savings Target
              </h3>
              <button onClick={() => setIsGoalModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGoalSubmit} className="p-5 space-y-4">
              
              {/* Title */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">
                  Savings Target Title / Name
                </label>
                <div className="relative font-sans">
                  <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    id="goal-form-title"
                    type="text"
                    required
                    placeholder="e.g. Mukono Land installment"
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs focus:ring-2 focus:ring-slate-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Target numeric sum */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-bold text-slate-400">
                  Target Amount ({currency})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2 text-xs text-slate-450 font-mono font-bold">UGX</span>
                  <input
                    id="goal-form-target"
                    type="number"
                    required
                    min="1000"
                    placeholder="e.g. 15000000"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl pl-12 pr-4 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none transition font-semibold"
                  />
                </div>
              </div>

              {/* Target Limit Date */}
              <div className="space-y-1 text-left font-sans">
                <label className="block text-xs font-bold text-slate-400">
                  Target Due Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
                  <input
                    id="goal-form-date"
                    type="date"
                    required
                    value={goalDate}
                    onChange={(e) => setGoalDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-105 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs focus:ring-2 focus:ring-slate-500 outline-none transition font-medium"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex space-x-3 text-xs">
                <button
                  type="button"
                  id="goal-form-cancel"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 transition py-2.5 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="goal-form-submit"
                  className="w-1/2 bg-slate-800 hover:bg-slate-700 text-white transition py-2.5 rounded-xl font-bold cursor-pointer shadow-md"
                >
                  Save Target
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Transaction modal (Deposit / Withdraw) */}
      {isTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade font-sans animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-2xl border border-slate-101 dark:border-slate-800 overflow-hidden transform transition-all duration-300">
            <div className="bg-white dark:bg-slate-900 p-5 border-b border-slate-105 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Savings plan action
              </h3>
              <button onClick={() => setIsTxModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTxSubmit} className="p-5 space-y-4">
              
              {/* Type toggle deposit vs withdraw */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider text-left">
                  Action Type
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100/60 dark:bg-slate-950 p-1 rounded-xl">
                  <button
                    type="button"
                    id="savings-tx-deposit"
                    onClick={() => setTxType('deposit')}
                    className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 ${
                      txType === 'deposit' 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <ArrowUpCircle className="w-3.5 h-3.5" />
                    <span>Deposit Pool</span>
                  </button>
                  <button
                    type="button"
                    id="savings-tx-withdrawal"
                    onClick={() => setTxType('withdrawal')}
                    className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 ${
                      txType === 'withdrawal' 
                        ? 'bg-rose-600 text-white shadow-xs' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <ArrowDownCircle className="w-3.5 h-3.5" />
                    <span>Withdraw cost</span>
                  </button>
                </div>
              </div>

              {/* Goal targeted */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-450">
                  Target Savings Folder
                </label>
                <select
                  id="savings-tx-goalId"
                  value={txGoalId}
                  onChange={(e) => setTxGoalId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl py-2.5 px-3 text-xs focus:ring-2 focus:ring-slate-500 outline-none transition font-semibold"
                >
                  <option value="general">General Surplus Pool</option>
                  {goals.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.title} (Bal: {formatCurrency(g.currentAmount, currency).replace('UGX', '').trim()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 font-sans">
                  Transaction Amount ({currency})
                </label>
                <div className="relative font-mono">
                  <span className="absolute left-3.5 top-2.5 text-xs text-slate-450 font-bold">UGX</span>
                  <input
                    id="savings-tx-amount"
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 150000"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl pl-12 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 outline-none transition font-semibold"
                  />
                </div>
              </div>

              {/* Date */}
              <div className="space-y-1.5 text-left font-sans">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">
                  Transaction Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    id="savings-tx-date"
                    type="date"
                    required
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Memo */}
              <div className="space-y-1 text-left font-sans">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">
                  Brief Memo Notes
                </label>
                <div className="relative font-sans">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
                  <input
                    id="savings-tx-notes"
                    type="text"
                    required
                    placeholder="e.g. Monthly agribusiness savings deposit"
                    value={txNotes}
                    onChange={(e) => setTxNotes(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-102 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs focus:ring-2 focus:ring-slate-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-101 dark:border-slate-850 flex space-x-3 text-xs">
                <button
                  type="button"
                  id="savings-tx-cancel"
                  onClick={() => setIsTxModalOpen(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 transition py-2.5 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="savings-tx-submit"
                  className="w-1/2 bg-emerald-600 hover:bg-emerald-500 text-white transition py-2.5 rounded-xl font-bold cursor-pointer shadow-md"
                >
                  Save Transaction
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
