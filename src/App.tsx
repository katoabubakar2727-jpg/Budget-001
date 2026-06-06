import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Coins, 
  PiggyBank, 
  FileText, 
  Settings as SettingsIcon, 
  Briefcase, 
  Wifi, 
  WifiOff, 
  Bell, 
  Lock, 
  Menu, 
  X,
  CreditCard,
  CheckCircle,
  HelpCircle,
  UserCheck
} from 'lucide-react';

import { FinancialData, IncomeRecord, ExpenseRecord, DebtRecord, SavingsGoal, SavingsTransaction, AppSettings } from './types';
import { seedInitialData } from './utils/financeHelpers';

// Module Components
import Dashboard from './components/Dashboard';
import IncomeManager from './components/IncomeManager';
import ExpenditureManager from './components/ExpenditureManager';
import DebtManager from './components/DebtManager';
import SavingsTracker from './components/SavingsTracker';
import ReportsManager from './components/ReportsManager';
import SettingsManager from './components/SettingsManager';
import SecurityScreen from './components/SecurityScreen';

const STORAGE_KEY = 'my_finance_pwa_database';

export default function App() {
  // Database State Initialization
  const [db, setDb] = useState<FinancialData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.income && parsed.expenses && parsed.debts && parsed.settings) {
          return parsed as FinancialData;
        }
      }
    } catch (e) {
      console.error("Local database read mismatch, seeding sample presets.", e);
    }
    return seedInitialData();
  });

  // Navigation states
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Connectivity alerts toast states
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [networkToast, setNetworkToast] = useState<string | null>(null);

  // Security Unlocked status
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    // PIN triggers on start if enabled
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as FinancialData;
        return !parsed.settings?.pinEnabled;
      } catch {}
    }
    return true; // Unlocked by default till PIN gets armed
  });

  // Track state changes to synchronize with durable local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (e) {
      console.error("Failed to sync state to browser database.", e);
    }
  }, [db]);

  // Network offline/online listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setNetworkToast("Online status synchronized. Mapped entries backing up locally.");
      setTimeout(() => setNetworkToast(null), 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setNetworkToast("Running offline. Your entries are safely cached in standalone mode.");
      setTimeout(() => setNetworkToast(null), 4000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Quick check on shortcuts from PWA launch conditions
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shortcut = urlParams.get('shortcut');
    if (shortcut === 'income') {
      setActiveTab('income');
    } else if (shortcut === 'expense') {
      setActiveTab('expenses');
    }
  }, []);

  // Updaters for Children Components
  const updateSettings = (newSettings: AppSettings) => {
    setDb(prev => ({
      ...prev,
      settings: newSettings
    }));
  };

  const handleAddIncome = (rec: IncomeRecord) => {
    setDb(prev => ({
      ...prev,
      income: [rec, ...prev.income]
    }));
  };

  const handleEditIncome = (rec: IncomeRecord) => {
    setDb(prev => ({
      ...prev,
      income: prev.income.map(item => item.id === rec.id ? rec : item)
    }));
  };

  const handleDeleteIncome = (id: string) => {
    setDb(prev => ({
      ...prev,
      income: prev.income.filter(item => item.id !== id)
    }));
  };

  const handleAddExpense = (rec: ExpenseRecord) => {
    setDb(prev => ({
      ...prev,
      expenses: [rec, ...prev.expenses]
    }));
  };

  const handleEditExpense = (rec: ExpenseRecord) => {
    setDb(prev => ({
      ...prev,
      expenses: prev.expenses.map(item => item.id === rec.id ? rec : item)
    }));
  };

  const handleDeleteExpense = (id: string) => {
    setDb(prev => ({
      ...prev,
      expenses: prev.expenses.filter(item => item.id !== id)
    }));
  };

  const handleAddDebt = (rec: DebtRecord) => {
    setDb(prev => ({
      ...prev,
      debts: [rec, ...prev.debts]
    }));
  };

  const handleEditDebt = (rec: DebtRecord) => {
    setDb(prev => ({
      ...prev,
      debts: prev.debts.map(item => item.id === rec.id ? rec : item)
    }));
  };

  const handleDeleteDebt = (id: string) => {
    setDb(prev => ({
      ...prev,
      debts: prev.debts.filter(item => item.id !== id)
    }));
  };

  const handleAddGoal = (goal: SavingsGoal) => {
    setDb(prev => ({
      ...prev,
      savingsGoals: [goal, ...prev.savingsGoals]
    }));
  };

  const handleEditGoal = (goal: SavingsGoal) => {
    setDb(prev => ({
      ...prev,
      savingsGoals: prev.savingsGoals.map(item => item.id === goal.id ? goal : item)
    }));
  };

  const handleDeleteGoal = (id: string) => {
    setDb(prev => ({
      ...prev,
      savingsGoals: prev.savingsGoals.filter(item => item.id !== id),
      savingsTransactions: prev.savingsTransactions.filter(item => item.goalId !== id)
    }));
  };

  const handleAddSavingsTransaction = (tx: SavingsTransaction) => {
    setDb(prev => ({
      ...prev,
      savingsTransactions: [tx, ...prev.savingsTransactions]
    }));
  };

  // Restore completely from backup imported profile files
  const handleRestoreBackup = (restored: FinancialData) => {
    setDb(restored);
  };

  // Completely wipe storage database logs
  const handleClearAllData = () => {
    const freshSeeded = seedInitialData();
    localStorage.removeItem(STORAGE_KEY);
    setDb(freshSeeded);
  };

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  // Menu Options Definitions
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Briefcase },
    { id: 'income', label: 'Income', icon: Coins },
    { id: 'expenses', label: 'Expenditures', icon: TrendingDown },
    { id: 'debts', label: 'Debts & Loans', icon: CreditCard },
    { id: 'savings', label: 'Savings Goals', icon: PiggyBank },
    { id: 'reports', label: 'Ledger Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  // Shield view if secure passcode screen overlay is loaded
  if (db.settings.pinEnabled && !isUnlocked) {
    return (
      <SecurityScreen 
        correctPin={db.settings.pinCode} 
        onUnlock={() => setIsUnlocked(true)} 
        userEmail="katoabubakar2727@gmail.com"
      />
    );
  }

  return (
    <div className={`h-screen w-screen flex transition-colors duration-300 overflow-hidden ${
      db.settings.theme === 'dark' ? 'bg-slate-950 text-slate-100 dark' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Dynamic Connectivity & sync notification Toasts */}
      {networkToast && (
        <div id="connection-toast" className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center space-x-2.5 px-4.5 py-3 rounded-xl text-xs font-bold shadow-lg animate-bounce ${
          isOnline 
            ? 'bg-emerald-600 text-white shadow-emerald-900/10' 
            : 'bg-rose-600 text-white shadow-rose-900/10'
        }`}>
          {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          <span>{networkToast}</span>
        </div>
      )}

      {/* Sidebar Navigation - Left Panel on Desktop (Professional Polish Design) */}
      <aside className="hidden lg:flex w-64 bg-slate-900 text-slate-300 flex-col shrink-0 border-r border-slate-800">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-base font-sans select-none">
              M
            </div>
            <div className="text-left font-sans">
              <h1 className="text-sm font-bold text-white leading-tight">My Income</h1>
              <span className="text-[10px] text-slate-400 font-normal">& Expenditures</span>
            </div>
          </div>
        </div>
        <nav className="flex-1 py-4 text-left overflow-y-auto no-scrollbar">
          <div className="px-6 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider select-none">Main Menu</div>
          <div className="space-y-1 px-3">
            {navigationItems.map(item => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  id={`nav-tab-sidebar-${item.id}`}
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold transition-all text-left cursor-pointer ${
                    isActive 
                      ? 'bg-slate-800 text-white border-r-4 border-blue-500 font-extrabold shadow-sm' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <IconComp className="w-4.5 h-4.5 shrink-0 opacity-80" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
        <div className="p-4 bg-slate-950">
          <div className="flex items-center gap-3 p-2 bg-slate-900 rounded-lg border border-slate-800/50">
            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-extrabold font-sans text-xs border border-slate-700">
              SK
            </div>
            <div className="flex-1 overflow-hidden text-left">
              <p className="text-xs font-semibold text-white truncate">S. Kato</p>
              <p className="text-[9px] text-slate-500 truncate">Premium Account</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 dark:bg-slate-950">
        
        {/* Header (styled professionally according to Design HTML elements) */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 lg:px-8 shrink-0">
          <div className="flex items-center gap-3.5">
            {/* Mobile menu trigger button */}
            <button
              id="mobile-nav-trigger"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white bg-slate-105/70 dark:bg-slate-800/70 rounded-xl outline-none cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="text-left flex items-center gap-2">
              <h2 className="text-base lg:text-lg font-bold text-slate-805 dark:text-slate-100 select-none">
                {activeTab === 'dashboard' ? 'Financial Dashboard' : activeTab === 'income' ? 'Income' : activeTab === 'expenses' ? 'Expenditures' : activeTab === 'debts' ? 'Debts & Loans' : activeTab === 'savings' ? 'Savings' : activeTab === 'reports' ? 'Reports' : 'Settings'}
              </h2>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isOnline ? 'bg-green-100 text-green-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-rose-100 text-rose-700'}`}>
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Action button inside header */}
            {activeTab === 'dashboard' && (
              <button 
                onClick={() => handleNavigate('expenses')}
                className="hidden sm:inline-flex px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
              >
                + Add Transaction
              </button>
            )}
            <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-slate-800"></div>
            <div className="text-right hidden sm:block font-sans select-none">
              <p className="text-[9px] text-slate-400 uppercase font-mono tracking-wider">Current Date</p>
              <p className="text-xs font-bold font-mono">2026-06-06</p>
            </div>
            {/* Locked state indicator */}
            {db.settings.pinEnabled && (
              <button
                id="btn-lock-session"
                onClick={() => setIsUnlocked(false)}
                className="p-2 rounded-lg text-slate-500 hover:text-rose-500 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition shadow-xs cursor-pointer"
                title="Lock session workspace"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </header>

        {/* Scrollable content container with polished styling */}
        <div className="flex-1 p-5 md:p-8 overflow-y-auto no-scrollbar">
          
          {activeTab === 'dashboard' && (
            <Dashboard 
              income={db.income} 
              expenses={db.expenses} 
              debts={db.debts} 
              savingsGoals={db.savingsGoals}
              currency={db.settings.currency} 
              onNavigate={handleNavigate}
            />
          )}

          {activeTab === 'income' && (
            <IncomeManager 
              income={db.income}
              currency={db.settings.currency}
              onAdd={handleAddIncome}
              onEdit={handleEditIncome}
              onDelete={handleDeleteIncome}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpenditureManager 
              expenses={db.expenses}
              currency={db.settings.currency}
              onAdd={handleAddExpense}
              onEdit={handleEditExpense}
              onDelete={handleDeleteExpense}
            />
          )}

          {activeTab === 'debts' && (
            <DebtManager 
              debts={db.debts}
              currency={db.settings.currency}
              onAdd={handleAddDebt}
              onEdit={handleEditDebt}
              onDelete={handleDeleteDebt}
            />
          )}

          {activeTab === 'savings' && (
            <SavingsTracker 
              goals={db.savingsGoals}
              transactions={db.savingsTransactions}
              currency={db.settings.currency}
              onAddGoal={handleAddGoal}
              onEditGoal={handleEditGoal}
              onDeleteGoal={handleDeleteGoal}
              onAddTransaction={handleAddSavingsTransaction}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsManager 
              income={db.income} 
              expenses={db.expenses} 
              debts={db.debts}
              savingsGoals={db.savingsGoals}
              currency={db.settings.currency}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsManager 
              settings={db.settings}
              onUpdateSettings={updateSettings}
              onRestoreBackup={handleRestoreBackup}
              onClearAllData={handleClearAllData}
              rawFinancialData={db}
            />
          )}

        </div>

        {/* System Footer embedded inside major content sheet wrapper */}
        <footer className="py-4 border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-900 shrink-0 print:hidden text-[10px] md:text-xs text-slate-400 select-none">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-2.5 font-sans">
            <span>&copy; My Income, Expenditures & Debts Tracker PWA. Default currency UGX.</span>
            <div className="flex space-x-3">
              <span className="hover:text-slate-650 cursor-help" onClick={() => alert("All details are stored on this device. You can download safe encrypted backup txt files at any point via settings.")}>Offline Secure Data Assurance</span>
              <span>&bull;</span>
              <span>Local Sync Active</span>
            </div>
          </div>
        </footer>

      </div>

      {/* Mobile Responsive Navigation Drawer Slider */}
      {mobileMenuOpen && (
        <div id="mobile-nav-drawer" className="lg:hidden fixed inset-0 z-50 flex font-sans">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="relative bg-slate-900 text-slate-300 w-64 max-w-xs h-full flex flex-col justify-between py-6 px-4 shadow-2xl z-10 animate-fade">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">Navigation menu</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-1">
                {navigationItems.map(item => {
                  const IconComp = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      id={`mobile-nav-${item.id}`}
                      key={item.id}
                      onClick={() => handleNavigate(item.id)}
                      className={`w-full text-left py-3 px-4 rounded-xl text-xs font-bold transition flex items-center space-x-3 cursor-pointer ${
                        isActive 
                          ? 'bg-slate-800 text-white font-extrabold shadow-md border-r-4 border-blue-500' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <IconComp className="w-4.5 h-4.5 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3.5 pt-4 border-t border-slate-800">
              <div className="text-[10px] text-slate-400 font-medium leading-relaxed">
                PWA Local App Mode Enabled <br />
                User Email: <span className="font-mono text-slate-350">katoabubakar2727</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
