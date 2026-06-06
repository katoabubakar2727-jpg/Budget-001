import React, { useState } from 'react';
import { 
  Settings, 
  Download, 
  Upload, 
  Trash2, 
  ShieldAlert, 
  Moon, 
  Sun, 
  DollarSign, 
  Key, 
  Smartphone, 
  Check, 
  AlertTriangle,
  Download as DownloadCloud,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { AppSettings, FinancialData, Currency } from '../types';
import { encryptBackup, decryptBackup } from '../utils/financeHelpers';

interface SettingsManagerProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onRestoreBackup: (data: FinancialData) => void;
  onClearAllData: () => void;
  rawFinancialData: FinancialData;
}

export default function SettingsManager({ 
  settings, 
  onUpdateSettings, 
  onRestoreBackup, 
  onClearAllData,
  rawFinancialData
}: SettingsManagerProps) {
  // PWA installation states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinViewOpen, setPinViewOpen] = useState(false);

  // Monitor chrome installation prompt
  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const triggerPWAInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        setDeferredPrompt(null);
      });
    } else {
      // Custom helpful instruction overlay
      alert(
        "PWA Installation Guide:\n\n" +
        "1. On Chrome (Android): Click the top-right 3-dots menu and select 'Add to Home screen' or 'Install app'.\n" +
        "2. On Chrome (Windows): Click the 'Install App' icon on the right side of the browser search address bar.\n" +
        "3. On Safari (iOS): Click the 'Share' folder icon and tap 'Add to Home Screen'.\n\n" +
        "Your financial ledger runs 100% offline once added!"
      );
    }
  };

  // Toggle Theme
  const handleToggleTheme = () => {
    onUpdateSettings({
      ...settings,
      theme: settings.theme === 'light' ? 'dark' : 'light'
    });
  };

  // Manage Currency
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateSettings({
      ...settings,
      currency: e.target.value as Currency
    });
  };

  // Save PIN config
  const handleSavePin = () => {
    if (pinInput.length !== 4 || isNaN(parseInt(pinInput))) {
      alert("PIN must be exactly 4 numeric digits.");
      return;
    }
    
    onUpdateSettings({
      ...settings,
      pinEnabled: true,
      pinCode: pinInput,
      requirePinOnStartup: true
    });
    setPinInput('');
    setPinViewOpen(false);
    alert("Passcode PIN Protection successfully updated and armed. Remember your PIN for security overlay unlocks.");
  };

  const handleDisablePin = () => {
    if (confirm("Are you sure you want to disable secure PIN security? Anyone with access to this device will be able to review your financial logs.")) {
      onUpdateSettings({
        ...settings,
        pinEnabled: false,
        pinCode: '',
        requirePinOnStartup: false
      });
      alert("PIN lock successfully disabled.");
    }
  };

  // Backup file export
  const handleDownloadBackupFile = () => {
    const backupText = encryptBackup(rawFinancialData);
    const blob = new Blob([backupText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `my-income-backup-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Backup file import restore
  const handleUploadBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const decrypted = decryptBackup(text);
        if (decrypted) {
          if (confirm("Valid backup file recognized. Restore now? This will overwrite current entries and configurations in this cache.")) {
            onRestoreBackup(decrypted);
            alert("Application data successfully restored!");
          }
        } else {
          alert("Invalid backup payload. Ensure the uploaded txt file represents a genuine format copy.");
        }
      }
    };
    reader.readAsText(file);
  };

  // Clear all logs with defense criteria to prevent accidental deletion
  const handleClearDatabase = () => {
    const step1 = confirm("CRITICAL ACCIDENTAL DELETION GUARD:\n\nAre you absolutely sure you want to completely erase your database entries? This deletes everything—incomes, expenses, debt histories, and saving targets.");
    if (step1) {
      const step2 = prompt("To confirm deletion, type the word 'ERASE' in all caps inside the prompt box:");
      if (step2 === 'ERASE') {
        onClearAllData();
        alert("Your financial cache logs have been completely reset to pristine levels.");
      } else {
        alert("Validation mismatch. Operations cancelled, your logs are perfectly safe.");
      }
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 text-left">
          Application Settings
        </h2>
        <p className="text-xs text-slate-400">Configure personal finance presets, backups, and lock safeguards</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
        
        {/* Left Side: Layout preferences & PWA */}
        <div className="space-y-5">
          
          {/* Theme & Currencies Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-101 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800 dark:text-slate-200 mb-4 flex items-center space-x-2">
              <Sun className="w-4 h-4 text-emerald-500" />
              <span>General preferences settings</span>
            </h3>

            <div className="space-y-4">
              {/* Currency Select */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Currency System</h4>
                  <p className="text-[10px] text-slate-400">Default displays center Uganda Shilling (UGX)</p>
                </div>
                <select
                  id="settings-currency-select"
                  value={settings.currency}
                  onChange={handleCurrencyChange}
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-205/30 py-2 px-3 rounded-lg text-xs font-bold focus:ring-2 focus:ring-slate-400 outline-none"
                >
                  <option value="UGX">UGX (Uganda Shilling)</option>
                  <option value="USD">USD ($ Dollar)</option>
                  <option value="KES">KES (Kenya Shilling)</option>
                  <option value="TZS">TZS (Tanzania Shilling)</option>
                  <option value="EUR">EUR (&euro; Euro)</option>
                  <option value="GBP">GBP (&pound; Sterling)</option>
                </select>
              </div>

              {/* Theme Toggle */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800/30">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Styling Visual Theme</h4>
                  <p className="text-[10px] text-slate-400">Adjust the workspace skin colors</p>
                </div>
                <button
                  id="settings-theme-toggle"
                  onClick={handleToggleTheme}
                  className="bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-205/30 px-3 py-2 rounded-lg text-xs font-bold inline-flex items-center space-x-1.5 transition"
                >
                  {settings.theme === 'light' ? (
                    <>
                      <Moon className="w-3.5 h-3.5 text-slate-500" />
                      <span>Dark Theme</span>
                    </>
                  ) : (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <span>Light Theme</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* PWA Installer Button */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-5 border border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wide text-emerald-400 mb-2 flex items-center space-x-2">
              <DownloadCloud className="w-4 h-4" />
              <span>Offline Progressive Web App (PWA)</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Lock in instantaneous launch capability offline, stand-alone title window views, and quick Android/Windows launcher icons safely.
            </p>
            <button
              id="btn-pwa-install-app"
              onClick={triggerPWAInstall}
              className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold py-3 px-5 rounded-xl transition inline-flex items-center space-x-2 cursor-pointer shadow-md"
            >
              <Smartphone className="w-4 h-4" />
              <span>Install to desktop / Home screen</span>
            </button>
          </div>

        </div>

        {/* Right Side: Security PIN locks & backup */}
        <div className="space-y-5">
          
          {/* Passcode Security PIN Lock */}
          <div className="bg-white dark:bg-slate-900 border border-slate-101 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800 dark:text-slate-200 mb-4 flex items-center space-x-2">
              <Key className="w-4 h-4 text-emerald-500" />
              <span>Confidentiality PIN Locks</span>
            </h3>

            {settings.pinEnabled ? (
              <div className="space-y-4">
                <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 rounded-xl">
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                    PIN Lock Safeguard is active. The application will prompt for your passcode PIN pin code on session launches.
                  </p>
                </div>
                <button
                  id="settings-pin-deactivate"
                  onClick={handleDisablePin}
                  className="w-full bg-rose-50 hover:bg-rose-100 dark:bg-slate-950 dark:hover:bg-rose-950/20 text-rose-600 border border-rose-200/20 py-2.5 rounded-lg text-xs font-bold transition"
                >
                  Deactivate Secure PIN lock
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Toggle numeric key guard locks to shield details from nearby glances.
                </p>

                {pinViewOpen ? (
                  <div className="space-y-3.5 pt-2 border-t border-slate-50 dark:border-slate-800/20">
                    <input
                      id="settings-pin-setup-input"
                      type="password"
                      maxLength={4}
                      placeholder="Enter 4-digit PIN..."
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl py-2 px-3 text-xs tracking-widest text-center focus:ring-2 focus:ring-slate-400 outline-none font-bold"
                    />
                    <div className="flex space-x-3 text-xs font-bold">
                      <button
                        type="button"
                        id="settings-pin-setup-cancel"
                        onClick={() => setPinViewOpen(false)}
                        className="w-1/2 bg-slate-100 py-2 rounded-lg text-slate-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        id="settings-pin-setup-confirm"
                        onClick={handleSavePin}
                        className="w-1/2 bg-slate-800 text-white py-2 rounded-lg"
                      >
                        Arm Security PIN
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    id="settings-pin-activate"
                    onClick={() => setPinViewOpen(true)}
                    className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 border border-slate-205/30 py-2.5 rounded-lg text-xs font-bold transition"
                  >
                    Set numeric PIN Lock passcode
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Backup, Restore & Wipe databases */}
          <div className="bg-white dark:bg-slate-900 border border-slate-101 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800 dark:text-slate-200 mb-4 flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 text-emerald-500" />
              <span>Data backups & cache maintenance</span>
            </h3>

            <div className="space-y-3.5">
              {/* Export backup */}
              <button
                id="btn-settings-export-bk"
                onClick={handleDownloadBackupFile}
                className="w-full inline-flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 transition select-none cursor-pointer"
              >
                <div className="text-left">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Download system backup</h4>
                  <p className="text-[10px] text-slate-400 font-sans">Saves encrypted ledger parameters inside a txt file</p>
                </div>
                <Download className="w-4 h-4 text-slate-400" />
              </button>

              {/* Import backup */}
              <label
                tabIndex={0}
                className="w-full inline-flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 transition cursor-pointer select-none"
              >
                <div className="text-left">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Restore from local file</h4>
                  <p className="text-[10px] text-slate-400 font-sans">Upload your downloaded .txt backup to recover data</p>
                </div>
                <Upload className="w-4 h-4 text-slate-400" />
                <input
                  id="settings-import-file-uploader"
                  type="file"
                  accept=".txt"
                  onChange={handleUploadBackupFile}
                  className="hidden shrink-0"
                />
              </label>

              {/* Wipe cash logs */}
              <button
                id="btn-settings-wipe-data"
                onClick={handleClearDatabase}
                className="w-full inline-flex items-center justify-between p-3 rounded-xl border border-rose-100 dark:border-rose-950/20 hover:bg-rose-50/20 text-rose-600 dark:text-rose-400 transition cursor-pointer select-none"
              >
                <div className="text-left">
                  <h4 className="text-xs font-bold font-sans">Wipe all system data</h4>
                  <p className="text-[10px] text-rose-450 dark:text-rose-500/80 font-sans">Completely purge logs and settings securely</p>
                </div>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
