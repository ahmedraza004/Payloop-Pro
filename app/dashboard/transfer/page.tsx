'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Send,
  Search,
  User,
  ShieldCheck,
  Zap,
  ArrowRight,
  QrCode,
  CheckCircle2,
  Lock,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import PinModal from '@/components/PinModal';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

export default function TransferPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRecipient = searchParams.get('to') || '';
  const initialAmount = searchParams.get('amount') || '';
  const initialNote = searchParams.get('note') || '';

  const [recipient, setRecipient] = useState(initialRecipient);
  const [amount, setAmount] = useState(initialAmount);
  const [note, setNote] = useState(initialNote);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [wallet, setWallet] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [require2FA, setRequire2FA] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user);
          setWallet(data.wallets?.[0]);
        }
      });
  }, []);

  // Debounced search for recipient users
  useEffect(() => {
    if (!recipient || recipient.length < 2 || selectedUser) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/wallet/search-user?q=${encodeURIComponent(recipient)}`);
        const data = await res.json();
        setSearchResults(data.users || []);
      } catch (err) {
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [recipient, selectedUser]);

  const handleSelectUser = (u: any) => {
    setSelectedUser(u);
    setRecipient(u.username);
    setSearchResults([]);
  };

  const handleInitiateTransfer = (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipient || !amount) {
      toast.error('Recipient and amount are required');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (wallet && numAmount > wallet.availableBalance) {
      toast.error(`Insufficient funds. Available: $${wallet.availableBalance.toFixed(2)}`);
      return;
    }

    // Open PIN modal
    setPinModalOpen(true);
  };

  const executeTransfer = async (enteredPin: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/wallet/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiver: recipient,
          amount: parseFloat(amount),
          note,
          pin: enteredPin,
          twoFactorCode: twoFactorCode || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setPinModalOpen(false);
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
        toast.success(data.message || 'Transfer completed successfully!');
        router.push('/dashboard/transactions');
      } else {
        if (data.require2FA) {
          setRequire2FA(true);
          toast.info('Please enter your 6-digit 2FA Authenticator code');
        } else {
          toast.error(data.error || 'Transfer failed');
        }
      }
    } catch (err) {
      toast.error('Network error during transfer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Send Money Instantly</h1>
        <p className="text-xs text-slate-400">
          Transfer funds with sub-second ledger finality and zero transaction fees.
        </p>
      </div>

      {/* Available Balance Indicator */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-cyan-950/60 border border-indigo-500/20 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-cyan-400 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Available to Transfer</span>
            <span className="text-base font-black text-white">
              ${wallet?.availableBalance?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'} USD
            </span>
          </div>
        </div>
        <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-bold">
          Fee: $0.00 (Free)
        </span>
      </div>

      {/* Transfer Form Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/10 shadow-2xl backdrop-blur-xl">
        <form onSubmit={handleInitiateTransfer} className="space-y-5">
          {/* Recipient Input with Autocomplete */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">Recipient (@username, email, or wallet ID)</label>
              {selectedUser && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUser(null);
                    setRecipient('');
                  }}
                  className="text-[11px] text-cyan-400 hover:underline"
                >
                  Change
                </button>
              )}
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                placeholder="e.g. @alice, bob@payloop.com, PL-1102-5532"
                value={recipient}
                onChange={(e) => {
                  setRecipient(e.target.value);
                  setSelectedUser(null);
                }}
                className="w-full bg-slate-950 border border-white/10 rounded-2xl pl-10 pr-3.5 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition-all"
              />
            </div>

            {/* Live Autocomplete Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-[#111827] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-30 divide-y divide-white/5">
                {searchResults.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSelectUser(u)}
                    className="w-full p-3 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`}
                        alt={u.name}
                        className="w-8 h-8 rounded-full object-cover bg-slate-800"
                      />
                      <div>
                        <p className="text-xs font-bold text-white">{u.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">@{u.username} • {u.wallets?.[0]?.walletNumber}</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded-full font-bold">
                      Select
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Amount Input with Quick Presets */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Transfer Amount ($ USD)</label>
            <div className="relative">
              <span className="text-xl font-black text-slate-500 absolute left-4 top-2.5">$</span>
              <input
                type="number"
                step="0.01"
                min="0.50"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-2xl pl-9 pr-4 py-3 text-xl font-black text-white placeholder:text-slate-700 focus:outline-none focus:border-cyan-400 transition-all"
              />
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-5 gap-2 mt-2.5">
              {['25', '50', '100', '500'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset)}
                  className="py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white border border-white/5 transition-all"
                >
                  ${preset}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmount(wallet?.availableBalance?.toString() || '0')}
                className="py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-xs font-bold text-indigo-300 border border-indigo-500/30 transition-all"
              >
                Max
              </button>
            </div>
          </div>

          {/* Note / Memo */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Payment Memo / Note (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Design deliverables, dinner split, monthly allowance"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition-all"
            />
          </div>

          {/* 2FA Code Input if required */}
          {require2FA && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
              <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold">
                <AlertCircle className="w-4 h-4" />
                <span>Two-Factor Authentication Required</span>
              </div>
              <input
                type="text"
                maxLength={6}
                placeholder="6-digit Authenticator Code"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-center text-sm font-mono font-bold text-cyan-400 tracking-widest focus:outline-none"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-xl shadow-indigo-500/25 transition-all flex items-center justify-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Continue to PIN Authorization</span>
          </button>
        </form>
      </div>

      {/* PIN Keypad Modal */}
      <PinModal
        isOpen={pinModalOpen}
        onClose={() => setPinModalOpen(false)}
        onSuccess={executeTransfer}
        title="Authorize Transfer"
        description={`Confirm transfer of $${parseFloat(amount || '0').toFixed(2)} to ${recipient}`}
      />
    </div>
  );
}
