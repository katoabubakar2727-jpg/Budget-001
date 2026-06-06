import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Calendar, 
  User, 
  Phone, 
  DollarSign, 
  Trash2, 
  Edit2, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  X, 
  Coins, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History,
  HelpCircle,
  FileText
} from 'lucide-react';
import { DebtRecord, DebtPayment } from '../types';
import { formatCurrency, generateId } from '../utils/financeHelpers';

interface DebtManagerProps {
  debts: DebtRecord[];
  currency: string;
  onAdd: (record: DebtRecord) => void;
  onEdit: (record: DebtRecord) => void;
  onDelete: (id: string) => void;
}

export default function DebtManager({ debts, currency, onAdd, onEdit, onDelete }: DebtManagerProps) {
  // Modal states
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeDebtForPayment, setActiveDebtForPayment] = useState<DebtRecord | null>(null);

  // Form Fields for Debt
  const [type, setType] = useState<'borrowed' | 'lent'>('borrowed');
  const [partnerName, setPartnerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  // Form Fields for Payment
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'borrowed' | 'lent'>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Paid' | 'Partial' | 'Unpaid' | 'Overdue'>('All');

  // Open Add Debt Modal
  const handleOpenAddDebt = () => {
    setEditingId(null);
    setType('borrowed');
    setPartnerName('');
    setPhoneNumber('');
    setAmount('');
    setDueDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // 14 days default
    setNotes('');
    setIsDebtModalOpen(true);
  };

  // Open Edit Debt Modal
  const handleOpenEditDebt = (debt: DebtRecord) => {
    setEditingId(debt.id);
    setType(debt.type);
    setPartnerName(debt.partnerName);
    setPhoneNumber(debt.phoneNumber);
    setAmount(debt.amount.toString());
    setDueDate(debt.dueDate);
    setNotes(debt.notes);
    setIsDebtModalOpen(true);
  };

  const handleDebtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName.trim()) {
      alert("Name is required.");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please specify a valid numeric amount.");
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    let calculatedStatus: DebtRecord['status'] = 'Unpaid';
    if (dueDate < todayStr) {
      calculatedStatus = 'Overdue';
    }

    const payload: DebtRecord = {
      id: editingId || generateId(),
      type,
      partnerName,
      phoneNumber,
      amount: parseFloat(amount),
      dueDate,
      notes,
      payments: editingId ? (debts.find(d => d.id === editingId)?.payments || []) : [],
      status: calculatedStatus,
      createdAt: new Date().toISOString()
    };

    // Calculate status considering existing payments
    if (editingId) {
      const existingDebt = debts.find(d => d.id === editingId);
      if (existingDebt) {
        const totalPaid = existingDebt.payments.reduce((sum, p) => sum + p.amount, 0);
        const remaining = payload.amount - totalPaid;
        if (remaining <= 0) {
          payload.status = 'Paid';
        } else if (totalPaid > 0) {
          payload.status = remaining > 0 && dueDate < todayStr ? 'Overdue' : 'Partial';
        } else if (dueDate < todayStr) {
          payload.status = 'Overdue';
        }
      }
    }

    if (editingId) {
      onEdit(payload);
    } else {
      onAdd(payload);
    }
    setIsDebtModalOpen(false);
  };

  // Open Payment dialog
  const handleOpenPayment = (debt: DebtRecord) => {
    setActiveDebtForPayment(debt);
    const totalPaid = debt.payments.reduce((sum, p) => sum + p.amount, 0);
    const balance = debt.amount - totalPaid;
    setPaymentAmount(balance.toString());
    setPaymentNotes('Installment Repayment');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDebtForPayment) return;

    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    const totalPaidCalculated = activeDebtForPayment.payments.reduce((sum, p) => sum + p.amount, 0);
    const balanceRemaining = activeDebtForPayment.amount - totalPaidCalculated;

    if (amt > balanceRemaining) {
      alert(`Paid amount exceeds outstanding balance. Maximum allowable: UGX ${balanceRemaining}`);
      return;
    }

    const newPayment: DebtPayment = {
      id: generateId(),
      amount: amt,
      date: paymentDate,
      notes: paymentNotes
    };

    const updatedPayments = [...activeDebtForPayment.payments, newPayment];
    const newTotalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
    const newRemaining = activeDebtForPayment.amount - newTotalPaid;
    
    // Determine status
    let newStatus: DebtRecord['status'] = 'Unpaid';
    const todayStr = new Date().toISOString().split('T')[0];

    if (newRemaining <= 0) {
      newStatus = 'Paid';
    } else if (newTotalPaid > 0) {
      newStatus = activeDebtForPayment.dueDate < todayStr ? 'Overdue' : 'Partial';
    } else if (activeDebtForPayment.dueDate < todayStr) {
      newStatus = 'Overdue';
    }

    const updatedDebt: DebtRecord = {
      ...activeDebtForPayment,
      payments: updatedPayments,
      status: newStatus
    };

    onEdit(updatedDebt);
    setIsPaymentModalOpen(false);
    setActiveDebtForPayment(null);
  };

  const handleDeleteDebt = (id: string) => {
    if (confirm("Are you sure you want to permanently delete this debt registry item? It clears associated payment histories too.")) {
      onDelete(id);
    }
  };

  // Calculate dynamic status for display and filter
  const todayStr = new Date().toISOString().split('T')[0];
  const processedDebts = debts.map(debt => {
    const totalPaid = debt.payments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = debt.amount - totalPaid;
    let status: DebtRecord['status'] = debt.status;

    if (remaining <= 0) {
      status = 'Paid';
    } else if (totalPaid > 0) {
      status = debt.dueDate < todayStr ? 'Overdue' : 'Partial';
    } else if (debt.dueDate < todayStr) {
      status = 'Overdue';
    } else {
      status = 'Unpaid';
    }

    return {
      ...debt,
      totalPaid,
      remaining,
      status
    };
  });

  // Filter and Search logic
  const filteredDebts = processedDebts.filter(debt => {
    const matchSearch = debt.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (debt.phoneNumber && debt.phoneNumber.includes(searchTerm)) ||
                        (debt.notes?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchType = filterType === 'All' || debt.type === filterType;
    const matchStatus = filterStatus === 'All' || debt.status === filterStatus;

    return matchSearch && matchType && matchStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 text-left">
            Debt Management
          </h2>
          <p className="text-xs text-slate-400 font-sans">Track liabilities borrowing, lending files, and collection terms</p>
        </div>
        <button
          id="btn-add-debt"
          onClick={handleOpenAddDebt}
          className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-white text-xs font-bold py-3 px-5 rounded-xl transition inline-flex items-center space-x-2 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Record Borrow/Lend Term</span>
        </button>
      </div>

      {/* Debt Balance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Owed by Me Summary */}
        <div id="borrow-summary-card" className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Liabilities Owed by Me (Borrowed)</span>
            <h3 className="text-xl font-black font-mono text-rose-500 mt-1">
              {formatCurrency(processedDebts.filter(d => d.type === 'borrowed').reduce((acc, curr) => acc + curr.remaining, 0), currency)}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-500 flex items-center justify-center shrink-0">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>

        {/* Total Owed to Me Summary */}
        <div id="lend-summary-card" className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">Receivables Owed to Me (Lent)</span>
            <h3 className="text-xl font-black font-mono text-sky-500 mt-1">
              {formatCurrency(processedDebts.filter(d => d.type === 'lent').reduce((acc, curr) => acc + curr.remaining, 0), currency)}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/20 text-sky-500 flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-3">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            id="debt-search-input"
            type="text"
            placeholder="Search debtor name, phone, notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:ring-2 focus:ring-slate-500 outline-none transition"
          />
        </div>

        {/* Type Selector borrowed vs lent */}
        <select
          id="debt-type-filter"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 rounded-xl py-2.5 px-3 text-xs focus:ring-2 focus:ring-slate-500 outline-none transition font-medium"
        >
          <option value="All">All Transactions (Lent & Borrowed)</option>
          <option value="borrowed">Borrowed Only (Owed by Me)</option>
          <option value="lent">Lent Only (Owed to Me)</option>
        </select>

        {/* Status Selector */}
        <select
          id="debt-status-filter"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 rounded-xl py-2.5 px-3 text-xs focus:ring-2 focus:ring-slate-500 outline-none transition font-medium"
        >
          <option value="All">All statuses (Paid, Overdue, etc)</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Partial">Partial Paid</option>
          <option value="Paid">Fully Paid</option>
          <option value="Overdue">Overdue</option>
        </select>

      </div>

      {/* Debt Cards list layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredDebts.length === 0 ? (
          <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-400">No matching debt portfolios recorded.</p>
          </div>
        ) : (
          filteredDebts.map(debt => {
            const hasOverdue = debt.status === 'Overdue';
            const percentSettled = Math.round((debt.totalPaid / debt.amount) * 100);

            return (
              <div 
                key={debt.id} 
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm flex flex-col justify-between transition relative overflow-hidden ${
                  hasOverdue 
                    ? 'border-amber-400/60 bg-gradient-to-br from-amber-50/20 to-transparent dark:border-amber-600/30' 
                    : debt.status === 'Paid'
                    ? 'border-emerald-250 dark:border-emerald-900/10'
                    : 'border-slate-100 dark:border-slate-800'
                }`}
              >
                {/* Header item: Borrower info */}
                <div>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        debt.type === 'borrowed' 
                          ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-500' 
                          : 'bg-sky-50 dark:bg-sky-950/20 text-sky-500'
                      }`}>
                        {debt.type === 'borrowed' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div className="text-left truncate">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate flex items-center space-x-1.5">
                          <span>{debt.partnerName}</span>
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono inline-flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-slate-300" />
                          <span>{debt.phoneNumber || "No Phone"}</span>
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full select-none uppercase ${
                      debt.status === 'Paid' 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' 
                        : debt.status === 'Overdue'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 animate-pulse'
                        : debt.status === 'Partial'
                        ? 'bg-sky-100 text-sky-850 dark:bg-sky-950/40 dark:text-sky-400'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350'
                    }`}>
                      {debt.status}
                    </span>
                  </div>

                  {/* Pricing detail */}
                  <div className="mt-5 space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Total Principal Owed:</span>
                      <span className="font-bold text-slate-600 dark:text-slate-300 font-mono">{formatCurrency(debt.amount, currency)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Repayments Settled:</span>
                      <span className="font-bold text-emerald-500 font-mono">-{formatCurrency(debt.totalPaid, currency)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold border-t border-slate-50 dark:border-slate-800/60 pt-1.5 mt-1.5">
                      <span className="text-slate-700 dark:text-slate-300">Remaining Balance:</span>
                      <span className="text-rose-600 dark:text-rose-400 font-mono">{formatCurrency(debt.remaining, currency)}</span>
                    </div>
                  </div>

                  {/* Notes / Due Date */}
                  <div className="mt-4 p-3 bg-slate-50/60 dark:bg-slate-950/60 rounded-xl space-y-1.5 text-[11px]">
                    <div className="flex justify-between text-slate-400">
                      <span className="font-medium">Repayment Due Date:</span>
                      <span className="font-mono font-bold text-slate-600 dark:text-slate-300 inline-flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-slate-300" />
                        <span>{debt.dueDate}</span>
                      </span>
                    </div>
                    {debt.notes && (
                      <p className="text-slate-500 dark:text-slate-400 text-left truncate italic pt-1">
                        &ldquo;{debt.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Payment history summaries collapsible visual */}
                  {debt.payments.length > 0 && (
                    <div className="mt-3.5 space-y-1 text-[10px]">
                      <span className="text-slate-400 font-bold uppercase tracking-wider block text-left">Repayment installments history:</span>
                      {debt.payments.map((p, i) => (
                        <div key={p.id} className="flex justify-between items-center py-1 border-b border-dashed border-slate-100 dark:border-slate-800/30 text-slate-500 font-mono">
                          <span>Installment #{i+1} ({p.date}):</span>
                          <span className="font-bold text-emerald-500">+{formatCurrency(p.amount, currency)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions bottom bar */}
                <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800/40 flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button
                      id={`btn-edit-debt-${debt.id}`}
                      onClick={() => handleOpenEditDebt(debt)}
                      className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 rounded-lg transition"
                      title="Edit portfolio properties"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`btn-del-debt-${debt.id}`}
                      onClick={() => handleDeleteDebt(debt.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 rounded-lg transition"
                      title="Clear portfolio item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {debt.remaining > 0 && (
                    <button
                      id={`btn-pay-debt-${debt.id}`}
                      onClick={() => handleOpenPayment(debt)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-sm transition active:scale-95 flex items-center space-x-1.5"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>{debt.type === 'borrowed' ? 'Pay liability' : 'Log collection'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Debt Creation Modal */}
      {isDebtModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade font-sans">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transform transition-all duration-300 max-h-[95vh] flex flex-col">
            <div className="sticky top-0 bg-white dark:bg-slate-900 p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                {editingId ? 'Modify Debt registration' : 'Record new Debt contract'}
              </h3>
              <button onClick={() => setIsDebtModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDebtSubmit} className="p-5 space-y-4 overflow-y-auto">
              
              {/* Type Switch Selector (Borrowed vs Lent) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Select Portfolio Type
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100/60 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-250/20">
                  <button
                    type="button"
                    id="debt-form-type-borrowed"
                    onClick={() => setType('borrowed')}
                    className={`py-2 rounded-lg text-xs font-bold transition ${
                      type === 'borrowed' 
                        ? 'bg-rose-600 text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Borrowed (Liabilities)
                  </button>
                  <button
                    type="button"
                    id="debt-form-type-lent"
                    onClick={() => setType('lent')}
                    className={`py-2 rounded-lg text-xs font-bold transition ${
                      type === 'lent' 
                        ? 'bg-sky-600 text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Lent (Receivables)
                  </button>
                </div>
              </div>

              {/* Creditor / Debtor Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">
                  Debtor / Creditor Name
                </label>
                <div className="relative font-sans">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    id="debt-form-partnerName"
                    type="text"
                    required
                    placeholder="e.g. Centenary Bank / John Mukasa"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-slate-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Phone contact */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">
                  Phone Number
                </label>
                <div className="relative font-sans">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    id="debt-form-phoneNumber"
                    type="tel"
                    placeholder="e.g. +256 702 123456"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-slate-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Debt Principal Amount */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">
                  Principal Amount ({currency})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-mono font-bold">UGX</span>
                  <input
                    id="debt-form-amount"
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 1000000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl pl-12 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-slate-500 outline-none transition font-semibold"
                  />
                </div>
              </div>

              {/* Repayment Limit Date */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">
                  Contract Due Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    id="debt-form-dueDate"
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-slate-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">
                  Optional Terms/Descriptions
                </label>
                <div className="relative font-sans">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    id="debt-form-notes"
                    type="text"
                    maxLength={100}
                    placeholder="e.g. Bought feed stock on credit"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs focus:ring-2 focus:ring-slate-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex space-x-3 text-xs">
                <button
                  type="button"
                  id="debt-form-cancel"
                  onClick={() => setIsDebtModalOpen(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-705 text-slate-700 dark:text-slate-200 transition py-2.5 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="debt-form-submit"
                  className="w-1/2 bg-slate-800 hover:bg-slate-700 text-white transition py-2.5 rounded-xl font-bold cursor-pointer shadow-md"
                >
                  Save Contract
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Repayment Log Modal */}
      {isPaymentModalOpen && activeDebtForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade font-sans animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transform transition-all duration-300">
            <div className="bg-white dark:bg-slate-900 p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Log Repayment Installment
              </h3>
              <button onClick={() => { setIsPaymentModalOpen(false); setActiveDebtForPayment(null); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="p-5 space-y-4">
              <p className="text-[11px] text-slate-400 leading-relaxed text-left">
                Recording payment towards contract with <strong className="text-slate-600 dark:text-slate-200">{activeDebtForPayment.partnerName}</strong>. 
                Outstanding: <span className="font-mono font-bold text-rose-500">{formatCurrency(activeDebtForPayment.amount - activeDebtForPayment.payments.reduce((sum, p) => sum + p.amount, 0), currency)}</span>
              </p>

              {/* Installment Repay Amount */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">
                  Payment Amount ({currency})
                </label>
                <div className="relative font-mono">
                  <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-bold">UGX</span>
                  <input
                    id="payment-form-amount"
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 50000"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl pl-12 pr-4 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none transition font-semibold"
                  />
                </div>
              </div>

              {/* Repayment Date */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">
                  Installment Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    id="payment-form-date"
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Installment note */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">
                  Short Memo Note
                </label>
                <div className="relative font-sans">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    id="payment-form-notes"
                    type="text"
                    required
                    placeholder="e.g. Paid via MTN Mobile Money"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex space-x-3 text-xs">
                <button
                  type="button"
                  id="payment-form-cancel"
                  onClick={() => { setIsPaymentModalOpen(false); setActiveDebtForPayment(null); }}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 transition py-2.5 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="payment-form-submit"
                  className="w-1/2 bg-emerald-600 hover:bg-emerald-500 text-white transition py-2.5 rounded-xl font-bold cursor-pointer shadow-md"
                >
                  Save Payment
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
