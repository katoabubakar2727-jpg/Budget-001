import React, { useState } from 'react';
import { Plus, Search, Calendar, Tag, FileText, Trash2, Edit2, Filter, AlertCircle, Sparkles, X } from 'lucide-react';
import { IncomeRecord } from '../types';
import { formatCurrency, generateId } from '../utils/financeHelpers';

interface IncomeManagerProps {
  income: IncomeRecord[];
  currency: string;
  onAdd: (record: IncomeRecord) => void;
  onEdit: (record: IncomeRecord) => void;
  onDelete: (id: string) => void;
}

export default function IncomeManager({ income, currency, onAdd, onEdit, onDelete }: IncomeManagerProps) {
  // Modal & Form States
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<'Salary' | 'Business' | 'Rent' | 'Farming' | 'Gifts' | 'Other'>('Salary');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // Open modal for add
  const handleOpenAdd = () => {
    setEditingId(null);
    setAmount('');
    setCategory('Salary');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setIsOpen(true);
  };

  // Open modal for edit
  const handleOpenEdit = (record: IncomeRecord) => {
    setEditingId(record.id);
    setAmount(record.amount.toString());
    setCategory(record.category);
    setDate(record.date);
    setNotes(record.notes);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please specify a valid numeric amount.");
      return;
    }

    const payload: IncomeRecord = {
      id: editingId || generateId(),
      amount: parseFloat(amount),
      category,
      date,
      notes,
      createdAt: new Date().toISOString()
    };

    if (editingId) {
      onEdit(payload);
    } else {
      onAdd(payload);
    }
    setIsOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to permanently delete this income record? This is irreversible.")) {
      onDelete(id);
    }
  };

  // Sorting & Filtering
  const filteredRecords = income
    .filter(rec => {
      const matchSearch = (rec.notes?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                          rec.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = selectedCategory === 'All' || rec.category === selectedCategory;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortOrder === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortOrder === 'highest') return b.amount - a.amount;
      if (sortOrder === 'lowest') return a.amount - b.amount;
      return 0;
    });

  const totalFilteredValue = filteredRecords.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 text-left">
            Income Records
          </h2>
          <p className="text-xs text-slate-400">Add, track and view your inflows and deposits</p>
        </div>
        <button
          id="btn-add-income-modal"
          onClick={handleOpenAdd}
          className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold py-3 px-5 rounded-xl shadow-md transition inline-flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Income Record</span>
        </button>
      </div>

      {/* Summary Segment */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <div>
          <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Filtered Income Sum</span>
          <h3 className="text-2xl font-black font-mono mt-1 text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalFilteredValue, currency)}
          </h3>
        </div>
        <div className="bg-emerald-50 dark:bg-slate-800 p-2.5 rounded-xl shrink-0">
          <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
      </div>

      {/* Quick Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3.5">
        
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            id="income-search-input"
            type="text"
            placeholder="Search notes or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 outline-none transition"
          />
        </div>

        {/* Categories selector */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            id="income-category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 rounded-xl py-2.5 px-3 text-xs focus:ring-2 focus:ring-emerald-500 outline-none transition font-medium"
          >
            <option value="All">All Categories</option>
            <option value="Salary">Salary</option>
            <option value="Business">Business</option>
            <option value="Rent">Rent</option>
            <option value="Farming">Farming</option>
            <option value="Gifts">Gifts</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Sort Select */}
        <div className="flex items-center space-x-2">
          <select
            id="income-sort-filter"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 rounded-xl py-2.5 px-3 text-xs focus:ring-2 focus:ring-emerald-500 outline-none transition font-medium"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Amount</option>
            <option value="lowest">Lowest Amount</option>
          </select>
        </div>

      </div>

      {/* Income Records List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-xs">No matching income records in system registry.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-950 text-left border-b border-slate-100 dark:border-slate-800 text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/10 transition">
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-500">
                      {rec.date}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-1 text-[10px] font-bold tracking-wider rounded-full uppercase bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
                        {rec.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                      {rec.notes || <span className="text-slate-300 italic">No description</span>}
                    </td>
                    <td className="py-3 px-4 text-right font-black font-mono text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {formatCurrency(rec.amount, currency)}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          id={`btn-edit-income-${rec.id}`}
                          onClick={() => handleOpenEdit(rec)}
                          className="p-1.5 text-slate-400 hover:text-emerald-500 rounded bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition shadow-sm border border-slate-100 dark:border-slate-800"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`btn-del-income-${rec.id}`}
                          onClick={() => handleDelete(rec.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition shadow-sm border border-slate-100 dark:border-slate-800"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Input Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade font-sans">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-emerald-900/10 overflow-hidden transform transition-all duration-300 max-h-[95vh] flex flex-col">
            <div className="sticky top-0 bg-white dark:bg-slate-900 p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2">
                <span>{editingId ? 'Edit Income record' : 'Add Income record'}</span>
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
              {/* Amount */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">
                  Amount ({currency})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-mono font-bold">UGX</span>
                  <input
                    id="income-form-amount"
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 50000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl pl-12 pr-4 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none transition font-semibold"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">
                  Income Category
                </label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <select
                    id="income-form-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-2 focus:ring-emerald-500 outline-none transition"
                  >
                    <option value="Salary">Salary</option>
                    <option value="Business">Business</option>
                    <option value="Rent">Rent</option>
                    <option value="Farming">Farming/Agribusiness</option>
                    <option value="Gifts">Gifts/Grants</option>
                    <option value="Other">Other Miscellaneous</option>
                  </select>
                </div>
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">
                  Date Received
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    id="income-form-date"
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">
                  Optional Notes
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    id="income-form-notes"
                    type="text"
                    maxLength={100}
                    placeholder="e.g. Freelance project bonus"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex space-x-3">
                <button
                  type="button"
                  id="income-form-cancel"
                  onClick={() => setIsOpen(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-705 text-slate-700 dark:text-slate-200 transition py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="income-form-submit"
                  className="w-1/2 bg-emerald-600 hover:bg-emerald-500 text-white transition py-2.5 rounded-xl text-xs font-bold cursor-pointer hover:shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
