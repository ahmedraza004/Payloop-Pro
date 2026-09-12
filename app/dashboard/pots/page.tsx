'use client';

import React, { useState, useEffect } from 'react';
import {
  PiggyBank,
  Plus,
  Lock,
  Trophy,
  ShieldCheck,
  Users,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { formatCurrency, getStatusBadgeClass } from '@/lib/utils';
import { toast } from 'sonner';

export default function PotsPage() {
  const [pots, setPots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreatePot, setShowCreatePot] = useState(false);
  const [showContribute, setShowContribute] = useState<any>(null);
  const [contribAmount, setContribAmount] = useState('100');

  // Form State
  const [newPot, setNewPot] = useState({
    title: '',
    description: '',
    targetAmount: '1000',
    potType: 'SAVINGS',
    escrowSellerIdentifier: '',
  });

  const loadPots = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pots');
      const data = await res.json();
      setPots(data.pots || []);
    } catch (err) {
      toast.error('Failed to load shared pots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPots();
  }, []);

  const handleCreatePot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/pots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPot),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Shared Pot created!');
        setShowCreatePot(false);
        setNewPot({ title: '', description: '', targetAmount: '1000', potType: 'SAVINGS', escrowSellerIdentifier: '' });
        loadPots();
      } else {
        toast.error(data.error || 'Failed to create pot');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showContribute) return;

    try {
      const res = await fetch(`/api/pots/${showContribute.id}/contribute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(contribAmount) }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Contribution completed!');
        setShowContribute(null);
        setContribAmount('100');
        loadPots();
      } else {
        toast.error(data.error || 'Contribution failed');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const handleSettle = async (potId: string) => {
    try {
      const res = await fetch(`/api/pots/${potId}/settle`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Pot settled and paid out!');
        loadPots();
      } else {
        toast.error(data.error || 'Settlement failed');
      }
    } catch (err) {
      toast.error('Settlement error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Shared Pots & Escrow Pools</h1>
          <p className="text-xs text-slate-400">
            Create collaborative group savings goals, prediction betting pools, or milestone escrow agreements.
          </p>
        </div>

        <button
          onClick={() => setShowCreatePot(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Pot</span>
        </button>
      </div>

      {/* Pots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pots.map((pot) => {
          const progress = Math.min(100, Math.round((pot.currentAmount / pot.targetAmount) * 100));
          const isSettled = pot.status === 'SETTLED';

          return (
            <div
              key={pot.id}
              className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl flex flex-col justify-between space-y-5 relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    {pot.potType.replace('_', ' ')}
                  </span>
                  <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border ${getStatusBadgeClass(pot.status)}`}>
                    {pot.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{pot.title}</h3>
                  {pot.description && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{pot.description}</p>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-cyan-400">${pot.currentAmount.toFixed(2)} funded</span>
                    <span className="text-slate-400">${pot.targetAmount.toFixed(2)} target ({progress}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Contributors Avatars */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400 mr-1" />
                    <span className="text-[11px] text-slate-400">{pot.contributions?.length || 0} contributors</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Created by @{pot.creator?.username}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 pt-2 border-t border-white/5">
                {!isSettled ? (
                  <>
                    <button
                      onClick={() => setShowContribute(pot)}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all"
                    >
                      Contribute Funds
                    </button>
                    <button
                      onClick={() => handleSettle(pot.id)}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-white/5 transition-all"
                    >
                      {pot.potType === 'ESCROW' ? 'Release Escrow' : 'Settle Pot'}
                    </button>
                  </>
                ) : (
                  <div className="w-full py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-center text-xs font-bold border border-emerald-500/20">
                    🏆 Settlement Completed & Paid Out
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create Pot */}
      {showCreatePot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-[#111827] border border-white/10 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Create New Shared Pot</h3>
            <form onSubmit={handleCreatePot} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Pot Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Europe Trip 2027 or Freelance Milestone 1"
                  value={newPot.title}
                  onChange={(e) => setNewPot({ ...newPot, title: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Pot Type</label>
                <select
                  value={newPot.potType}
                  onChange={(e) => setNewPot({ ...newPot, potType: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="SAVINGS">Savings Goal (Group Pool)</option>
                  <option value="BETTING_SIMULATION">Betting Simulation (Prize Pool)</option>
                  <option value="ESCROW">Escrow Agreement (Buyer/Seller Protection)</option>
                </select>
              </div>

              {newPot.potType === 'ESCROW' && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Seller / Contractor (@username)</label>
                  <input
                    type="text"
                    placeholder="e.g. @alice"
                    value={newPot.escrowSellerIdentifier}
                    onChange={(e) => setNewPot({ ...newPot, escrowSellerIdentifier: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Target Amount ($ USD)</label>
                <input
                  type="number"
                  required
                  value={newPot.targetAmount}
                  onChange={(e) => setNewPot({ ...newPot, targetAmount: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Description / Rules</label>
                <textarea
                  rows={2}
                  placeholder="Describe the pot purpose or release conditions..."
                  value={newPot.description}
                  onChange={(e) => setNewPot({ ...newPot, description: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreatePot(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-xs font-bold text-white shadow-md"
                >
                  Launch Pot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Contribute */}
      {showContribute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl bg-[#111827] border border-white/10 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Contribute to {showContribute.title}</h3>
            <form onSubmit={handleContribute} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Contribution Amount ($ USD)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={contribAmount}
                  onChange={(e) => setContribAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-base font-bold text-cyan-400"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowContribute(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-xs font-bold text-white shadow-md"
                >
                  Contribute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
