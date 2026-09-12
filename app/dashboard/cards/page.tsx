'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Snowflake,
  Flame,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Zap,
  TrendingUp,
} from 'lucide-react';
import VirtualCard3D from '@/components/VirtualCard3D';
import { toast } from 'sonner';

export default function CardsPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showSwipeModal, setShowSwipeModal] = useState<string | null>(null);

  // Issue Card Form
  const [cardHolder, setCardHolder] = useState('');
  const [cardType, setCardType] = useState('VISA');
  const [cardSkin, setCardSkin] = useState('NEON_CYAN');
  const [spendingLimit, setSpendingLimit] = useState('2500');

  // Swipe Simulation Form
  const [merchant, setMerchant] = useState('Apple Store Online');
  const [swipeAmount, setSwipeAmount] = useState('14.99');
  const [category, setCategory] = useState('Digital Goods');

  const loadCards = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cards');
      const data = await res.json();
      setCards(data.cards || []);
    } catch (err) {
      toast.error('Failed to load virtual cards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  const handleIssueCard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardHolder,
          cardType,
          cardSkin,
          spendingLimit: parseFloat(spendingLimit),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Virtual card issued successfully!');
        setShowIssueModal(false);
        loadCards();
      } else {
        toast.error(data.error || 'Failed to issue card');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const handleToggleFreeze = async (cardId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'FROZEN' : 'ACTIVE';
    try {
      const res = await fetch(`/api/cards/${cardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Card status updated');
        loadCards();
      } else {
        toast.error(data.error || 'Failed to update card status');
      }
    } catch (err) {
      toast.error('Error updating card');
    }
  };

  const handleExecuteSwipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showSwipeModal) return;

    try {
      const res = await fetch(`/api/cards/${showSwipeModal}/swipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantName: merchant,
          amount: parseFloat(swipeAmount),
          merchantCategory: category,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Purchase approved!');
        setShowSwipeModal(null);
        loadCards();
      } else {
        toast.error(data.error || 'Card transaction declined');
      }
    } catch (err) {
      toast.error('Network error during swipe');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Virtual Cards Hub</h1>
          <p className="text-xs text-slate-400">
            Generate 3D customizable Visa & Mastercard virtual cards for secure subscriptions and online checkouts.
          </p>
        </div>

        <button
          onClick={() => setShowIssueModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Issue New Card</span>
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div
            key={card.id}
            className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl space-y-4 flex flex-col justify-between"
          >
            <VirtualCard3D
              card={card}
              onToggleFreeze={handleToggleFreeze}
              onSwipeTest={(id) => setShowSwipeModal(id)}
            />

            {/* Spend limit indicator */}
            <div className="pt-2 border-t border-white/5 space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
                <span>Spent: ${card.currentSpent.toFixed(2)}</span>
                <span>Limit: ${card.spendingLimit.toFixed(2)}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                  style={{
                    width: `${Math.min(100, Math.round((card.currentSpent / card.spendingLimit) * 100))}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Issue New Virtual Card */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-[#111827] border border-white/10 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Issue Virtual Card</h3>
            <form onSubmit={handleIssueCard} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Cardholder Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AHMED RAZA"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Card Network</label>
                <select
                  value={cardType}
                  onChange={(e) => setCardType(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="VISA">Visa Signature</option>
                  <option value="MASTERCARD">Mastercard World Elite</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Card Skin / Aesthetic</label>
                <select
                  value={cardSkin}
                  onChange={(e) => setCardSkin(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="NEON_CYAN">Neon Cyan (Default)</option>
                  <option value="PLATINUM_CARBON">Platinum Carbon</option>
                  <option value="GOLD_LUXURY">Gold Luxury</option>
                  <option value="EMERALD_MATRIX">Emerald Matrix</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Monthly Spending Limit ($ USD)</label>
                <input
                  type="number"
                  required
                  value={spendingLimit}
                  onChange={(e) => setSpendingLimit(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-xs font-bold text-white shadow-md"
                >
                  Issue Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Test Merchant Swipe Simulation */}
      {showSwipeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl bg-[#111827] border border-white/10 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-cyan-400" />
              <span>Merchant Swipe Simulator</span>
            </h3>
            <p className="text-xs text-slate-400">
              Test real-time authorization and wallet deduction against external merchants.
            </p>

            <form onSubmit={handleExecuteSwipe} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Merchant Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix, Amazon, Uber"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Purchase Amount ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={swipeAmount}
                  onChange={(e) => setSwipeAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSwipeModal(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md"
                >
                  Authorize Swipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
