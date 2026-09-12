'use client';

import React, { useState, useEffect } from 'react';
import { Lock, X, Delete } from 'lucide-react';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (pin: string) => void;
  title?: string;
  description?: string;
}

export default function PinModal({
  isOpen,
  onClose,
  onSuccess,
  title = 'Authorize Transaction',
  description = 'Enter your 6-digit Transfer PIN to authorize this operation',
}: PinModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      if (nextPin.length === 6) {
        onSuccess(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-[#111827] border border-white/10 p-6 shadow-2xl relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-cyan-400 mx-auto flex items-center justify-center mb-3">
          <Lock className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">{description}</p>

        {/* 6 Digit Indicators */}
        <div className="flex justify-center items-center space-x-3 mb-8">
          {[0, 1, 2, 3, 4, 5].map((idx) => {
            const filled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                  filled
                    ? 'bg-cyan-400 border-cyan-400 scale-110 shadow-lg shadow-cyan-500/40'
                    : 'border-slate-700 bg-slate-900/50'
                }`}
              />
            );
          })}
        </div>

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="py-3.5 rounded-2xl bg-slate-800/60 hover:bg-slate-700/80 active:scale-95 text-lg font-bold text-white border border-white/5 transition-all"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPin('')}
            className="py-3.5 rounded-2xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/40 transition-all"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="py-3.5 rounded-2xl bg-slate-800/60 hover:bg-slate-700/80 active:scale-95 text-lg font-bold text-white border border-white/5 transition-all"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="py-3.5 rounded-2xl bg-slate-800/60 hover:bg-slate-700/80 active:scale-95 text-slate-400 hover:text-white flex items-center justify-center border border-white/5 transition-all"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5">
          <p className="text-[10px] text-slate-500">Demo accounts default PIN: 123456</p>
        </div>
      </div>
    </div>
  );
}
