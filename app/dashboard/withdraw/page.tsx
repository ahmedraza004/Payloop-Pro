'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowUpRight,
  Building2,
  Plus,
  Trash2,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import PinModal from '@/components/PinModal';
import { toast } from 'sonner';

export default function WithdrawPage() {
  const router = useRouter();
  const [banks, setBanks] = useState<any[]>([]);
  const [selectedBankId, setSelectedBankId] = useState('');
  const [amount, setAmount] = useState('500');
  const [wallet, setWallet] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  // New Bank Modal
  const [showAddBank, setShowAddBank] = useState(false);
  const [newBank, setNewBank] = useState({
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    routingNumber: '',
    iban: '',
  });

  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [meRes, bankRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/banks'),
      ]);
      const [meData, bankData] = await Promise.all([meRes.json(), bankRes.json()]);

      if (meData.authenticated) {
        setUser(meData.user);
        setWallet(meData.wallets?.[0]);
      }
      setBanks(bankData.bankAccounts || []);
      if (bankData.bankAccounts?.length > 0) {
        setSelectedBankId(bankData.bankAccounts[0].id);
      }
    } catch (err) {
      toast.error('Failed to load bank data');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const numAmount = parseFloat(amount) || 0;
  const isPro = user?.tier === 'PRO';
  const fee = isPro ? 0.0 : +(numAmount * 0.015).toFixed(2);
  const totalDeduction = +(numAmount + fee).toFixed(2);

  const handleAddBank = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/banks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBank),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Bank account linked!');
        setShowAddBank(false);
        setNewBank({ bankName: '', accountHolderName: '', accountNumber: '', routingNumber: '', iban: '' });
        loadData();
      } else {
        toast.error(data.error || 'Failed to add bank');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const handleInitiateWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBankId) {
      toast.error('Please select or add a bank account');
      return;
    }

    if (numAmount <= 0) {
      toast.error('Please enter a valid withdrawal amount');
      return;
    }

    if (wallet && totalDeduction > wallet.availableBalance) {
      toast.error(`Insufficient funds. Amount + Fee = $${totalDeduction.toFixed(2)}`);
      return;
    }

    setPinModalOpen(true);
  };

  const executeWithdrawal = async (enteredPin: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numAmount,
          bankAccountId: selectedBankId,
          pin: enteredPin,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setPinModalOpen(false);
        toast.success(`Withdrawal of $${numAmount.toFixed(2)} submitted for processing!`);
        router.push('/dashboard/transactions');
      } else {
        toast.error(data.error || 'Withdrawal failed');
      }
    } catch (err) {
      toast.error('Network error during withdrawal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Withdraw to Bank</h1>
        <p className="text-xs text-slate-400">
          Transfer your wallet funds directly to connected domestic and international bank accounts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/10 shadow-2xl backdrop-blur-xl space-y-5">
          <form onSubmit={handleInitiateWithdrawal} className="space-y-5">
            {/* Amount */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Withdrawal Amount ($ USD)</label>
              <div className="relative">
                <span className="text-xl font-black text-slate-500 absolute left-4 top-2.5">$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-2xl pl-9 pr-4 py-3 text-xl font-black text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Destination Bank Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300">Destination Bank Account</label>
                <button
                  type="button"
                  onClick={() => setShowAddBank(!showAddBank)}
                  className="text-xs text-cyan-400 hover:underline flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Link New Bank</span>
                </button>
              </div>

              {banks.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-950 border border-dashed border-white/10 text-center text-xs text-slate-400">
                  No bank accounts connected yet. Click &quot;Link New Bank&quot; above.
                </div>
              ) : (
                <div className="space-y-2">
                  {banks.map((bank) => (
                    <button
                      key={bank.id}
                      type="button"
                      onClick={() => setSelectedBankId(bank.id)}
                      className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        selectedBankId === bank.id
                          ? 'bg-indigo-600/20 border-indigo-500/40'
                          : 'bg-slate-950/60 border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Building2 className="w-5 h-5 text-cyan-400" />
                        <div>
                          <p className="text-xs font-bold text-white">{bank.bankName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {bank.accountNumber} • {bank.accountHolderName}
                          </p>
                        </div>
                      </div>
                      {selectedBankId === bank.id && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || banks.length === 0}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-xl shadow-indigo-500/25 transition-all flex items-center justify-center space-x-2"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Authorize Withdrawal with PIN</span>
            </button>
          </form>
        </div>

        {/* Right Summary */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white">Fee & Limits Breakdown</h3>

            <div className="space-y-2 text-xs divide-y divide-white/5">
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Withdrawal Amount</span>
                <span className="font-bold text-white">${numAmount.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-400">
                  Platform Fee {isPro ? '(0% Pro Perk)' : '(1.5% Standard)'}
                </span>
                <span className={`font-bold ${isPro ? 'text-emerald-400' : 'text-slate-300'}`}>
                  ${fee.toFixed(2)} USD
                </span>
              </div>
              <div className="flex justify-between pt-2 text-sm">
                <span className="font-bold text-white">Total Wallet Deduction</span>
                <span className="font-black text-cyan-400">${totalDeduction.toFixed(2)} USD</span>
              </div>
            </div>

            {!isPro && (
              <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-[11px] text-indigo-300">
                💡 <strong>Pro Tip:</strong> Upgrade to PayLoop Pro for <strong>0% withdrawal fees</strong> and save on every transfer.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Bank Modal */}
      {showAddBank && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-[#111827] border border-white/10 p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white">Link Bank Account</h3>
            <form onSubmit={handleAddBank} className="space-y-3 text-left">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400">Bank Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. JPMorgan Chase"
                  value={newBank.bankName}
                  onChange={(e) => setNewBank({ ...newBank, bankName: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400">Account Holder</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ahmed Raza"
                  value={newBank.accountHolderName}
                  onChange={(e) => setNewBank({ ...newBank, accountHolderName: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400">Account Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9821839201"
                  value={newBank.accountNumber}
                  onChange={(e) => setNewBank({ ...newBank, accountNumber: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddBank(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-indigo-600 text-xs font-semibold text-white"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PIN Modal */}
      <PinModal
        isOpen={pinModalOpen}
        onClose={() => setPinModalOpen(false)}
        onSuccess={executeWithdrawal}
        title="Authorize Bank Withdrawal"
        description={`Confirm payout of $${numAmount.toFixed(2)} to destination bank`}
      />
    </div>
  );
}
