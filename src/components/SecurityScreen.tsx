import React, { useState } from 'react';
import { Lock, Smartphone, ShieldCheck, HelpCircle } from 'lucide-react';

interface SecurityScreenProps {
  correctPin: string;
  onUnlock: () => void;
  userEmail?: string;
}

export default function SecurityScreen({ correctPin, onUnlock, userEmail }: SecurityScreenProps) {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [hintVisible, setHintVisible] = useState<boolean>(false);

  const handleKeyPress = (num: string) => {
    setError(false);
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      
      // Auto-submit when 4 digits are entered
      if (newPin === correctPin) {
        setTimeout(() => {
          onUnlock();
        }, 300);
      } else if (newPin.length === 4) {
        // Incorrect Pin feedback
        setTimeout(() => {
          setError(true);
          setPin('');
        }, 200);
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const triggerMockBiometric = () => {
    // Elegant simulation of biometrics (TouchID / FaceID)
    const success = confirm("Simulated Biometrics: Lock verified via system FaceID / Fingerprint scan?");
    if (success) {
      onUnlock();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-white font-sans selection:bg-emerald-500">
      <div className="w-full max-w-md px-6 py-8 flex flex-col items-center">
        {/* Shield Icon */}
        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center shadow-lg border border-slate-700/60 mb-6 relative">
          <ShieldCheck className="w-10 h-10 text-emerald-400" />
          <div className="absolute top-0 right-0 w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold tracking-tight text-center text-slate-150 mb-1">
          My Income, Expenditures & Debts
        </h1>
        <p className="text-sm text-slate-400 mb-8 font-medium">
          Workspace Secure Sandbox (PIN code locked)
        </p>

        {/* PIN Indicators */}
        <div className="flex space-x-5 justify-center mb-10">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                index < pin.length
                  ? 'bg-emerald-500 border-emerald-500 scale-110 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                  : 'border-slate-600 bg-transparent'
              } ${error ? 'bg-rose-500 border-rose-500 animate-bounce' : ''}`}
            />
          ))}
        </div>

        {/* Error Feedback */}
        {error && (
          <p className="text-sm font-semibold text-rose-400 mb-4 animate-pulse">
            Incorrect PIN. Please try again!
          </p>
        )}

        {/* Numeric Keypad Grid */}
        <div className="grid grid-cols-3 gap-4 w-72 mb-10">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              id={`pin-btn-${num}`}
              key={num}
              onClick={() => handleKeyPress(num)}
              type="button"
              className="w-16 h-16 rounded-full bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-700/40 text-2xl font-semibold transition-all flex items-center justify-center cursor-pointer shadow-md"
            >
              {num}
            </button>
          ))}
          <button
            id="pin-btn-bio"
            onClick={triggerMockBiometric}
            type="button"
            className="w-16 h-16 rounded-full bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-700/40 text-sm font-medium transition-all flex items-center justify-center cursor-pointer text-emerald-400 shadow-md"
            title="Biometric scan option"
          >
            <Smartphone className="w-6 h-6" />
          </button>
          <button
            id="pin-btn-0"
            onClick={() => handleKeyPress('0')}
            type="button"
            className="w-16 h-16 rounded-full bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-700/40 text-2xl font-semibold transition-all flex items-center justify-center cursor-pointer shadow-md"
          >
            0
          </button>
          <button
            id="pin-btn-del"
            onClick={handleDelete}
            type="button"
            className="w-16 h-16 rounded-full bg-slate-800/60 hover:bg-slate-700 border border-slate-700/30 text-lg font-medium transition-all flex items-center justify-center cursor-pointer text-slate-300 active:bg-slate-600"
          >
            Del
          </button>
        </div>

        {/* Developer / Visual Sandbox Bypasses */}
        <div className="text-center">
          <button
            id="help-pin-btn"
            onClick={() => setHintVisible(!hintVisible)}
            className="text-xs text-slate-400 hover:text-white transition inline-flex items-center space-x-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Need support? Click for PIN hint</span>
          </button>
          
          {hintVisible && (
            <div className="mt-3 p-3 bg-slate-800 rounded-lg border border-slate-700 max-w-xs mx-auto animate-fade">
              <p className="text-xs text-emerald-300">
                PIN lock is active. The set code is <strong className="text-white text-sm bg-slate-950 px-2 py-0.5 rounded font-mono">{correctPin}</strong>.
              </p>
              <button
                id="developer-bypass-btn"
                onClick={onUnlock}
                className="mt-2 block w-full bg-emerald-600 text-white text-[10px] md:text-xs py-1.5 px-3 rounded font-semibold hover:bg-emerald-500 active:bg-emerald-700"
              >
                Sandbox Quick Bypass (Developer Mode)
              </button>
            </div>
          )}

          {userEmail && (
            <p className="text-[10px] text-slate-500 mt-6 select-none leading-relaxed">
              Securely synchronized to: <br />
              <span className="font-mono text-slate-400">{userEmail}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
