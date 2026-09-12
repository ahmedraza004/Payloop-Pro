'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowDownLeft,
  CreditCard,
  Building2,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

export default function DepositPage() {
  const router = useRouter();
  const [amount, setAmount] = useState('250');
  const [method, setMethod] = useState<'STRIPE' | 'MOCK_CARD' | 'WIRE'>('MOCK_CARD');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8819');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('892');
  const [loading, setLoading] = useState(false);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid deposit amount');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numAmount,
          method,
          currency: 'USD',
        }),
      });

      const data = await res.json();

      if (res.ok) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        toast.success(`Deposit of $${numAmount.toFixed(2)} completed successfully!`);
        router.push('/dashboard/transactions');
      } else {
        toast.error(data.error || 'Deposit failed');
      }
    } catch (err) {
      toast.error('Deposit request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Deposit Funds to Wallet</h1>
        <p className="text-xs text-slate-400">
          Instantly add balances via Stripe debit/credit card, bank ACH, or test payment simulator.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Deposit Controls */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/10 shadow-2xl backdrop-blur-xl space-y-5">
          <form onSubmit={handleDeposit} className="space-y-5">
            {/* Amount Selection */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Deposit Amount ($ USD)</label>
              <div className="relative">
                <span className="text-xl font-black text-slate-500 absolute left-4 top-2.5">$</span>
                <input
                  type="number"
                  min="5"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-2xl pl-9 pr-4 py-3 text-xl font-black text-white focus:outline-none focus:border-cyan-400 transition-all"
                />
              </div>

              {/* Preset Chips */}
              <div className="grid grid-cols-4 gap-2 mt-2.5">
                {['50', '100', '250', '1000'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      amount === preset
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                        : 'bg-slate-800/60 hover:bg-slate-700 text-slate-300 border-white/5'
                    }`}
                  >
                    +${preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Select Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMethod('MOCK_CARD')}
                  className={`p-3.5 rounded-2xl border text-left flex items-start space-x-3 transition-all ${
                    method === 'MOCK_CARD'
                      ? 'bg-indigo-600/20 border-indigo-500/40 shadow-md'
                      : 'bg-slate-950/60 border-white/5 hover:border-white/10'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-white block">Instant Card Checkout</span>
                    <span className="text-[10px] text-slate-400">0% fee • Instant credit</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('WIRE')}
                  className={`p-3.5 rounded-2xl border text-left flex items-start space-x-3 transition-all ${
                    method === 'WIRE'
                      ? 'bg-indigo-600/20 border-indigo-500/40 shadow-md'
                      : 'bg-slate-950/60 border-white/5 hover:border-white/10'
                  }`}
                >
                  <Building2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-white block">Wire / ACH Transfer</span>
                    <span className="text-[10px] text-slate-400">Direct bank routing</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Card Inputs */}
            {method === 'MOCK_CARD' && (
              <div className="space-y-3 p-4 rounded-2xl bg-slate-950/70 border border-white/5">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full mt-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">Expires</label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full mt-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">CVC</label>
                    <input
                      type="text"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      className="w-full mt-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white text-xs font-bold shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2"
            >
              <Zap className="w-4 h-4" />
              <span>{loading ? 'Processing Deposit...' : `Confirm Deposit of $${parseFloat(amount || '0').toFixed(2)}`}</span>
            </button>
          </form>
        </div>

        {/* Right Summary & Guarantees */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white">Deposit Summary</h3>

            <div className="space-y-2 text-xs divide-y divide-white/5">
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Requested Amount</span>
                <span className="font-bold text-white">${parseFloat(amount || '0').toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-400">Processing Fee</span>
                <span className="font-bold text-emerald-400">$0.00 (Free)</span>
              </div>
              <div className="flex justify-between pt-2 text-sm">
                <span className="font-bold text-white">Total Credited to Wallet</span>
                <span className="font-black text-cyan-400">${parseFloat(amount || '0').toFixed(2)} USD</span>
              </div>
            </div>

            <div className="pt-2 flex items-center space-x-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>256-bit SSL Encrypted Stripe Gateway</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
