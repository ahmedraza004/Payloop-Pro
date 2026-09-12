'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  ArrowDownLeft,
  HandCoins,
  PiggyBank,
  CreditCard,
  TrendingUp,
  ShieldCheck,
  Zap,
  Sparkles,
  Download,
  CalendarClock,
  ChevronRight,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { formatCurrency, getStatusBadgeClass } from '@/lib/utils';
import { CashFlowChart, SpendingCategoryPieChart } from '@/components/AnalyticsCharts';
import VirtualCard3D from '@/components/VirtualCard3D';
import { generateStatementPDF } from '@/lib/pdf';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [pots, setPots] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [meRes, cardsRes, potsRes, txRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/cards'),
        fetch('/api/pots'),
        fetch('/api/wallet/transactions?limit=6'),
      ]);

      const [meData, cardsData, potsData, txData] = await Promise.all([
        meRes.json(),
        cardsRes.json(),
        potsRes.json(),
        txRes.json(),
      ]);

      setData(meData);
      setCards(cardsData.cards || []);
      setPots(potsData.pots || []);
      setTransactions(txData.transactions || []);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const user = data?.user;
  const wallet = data?.wallets?.[0] || {
    balance: 0,
    availableBalance: 0,
    lockedBalance: 0,
    currency: 'USD',
    dailyTransferLimit: 1000,
    dailySpentToday: 0,
    walletNumber: 'PL-0000-0000',
  };

  const handleExportPDF = () => {
    if (!transactions.length) {
      toast.error('No transactions to export');
      return;
    }
    generateStatementPDF({
      userName: user?.name || 'User',
      userEmail: user?.email || 'user@payloop.com',
      walletNumber: wallet.walletNumber,
      balance: wallet.balance,
      currency: wallet.currency,
      transactions: transactions.map((t) => ({
        date: new Date(t.createdAt).toLocaleDateString(),
        reference: t.reference,
        type: t.type,
        description: t.description,
        amount: t.amount,
        fee: t.fee,
        status: t.status,
      })),
    });
    toast.success('Account statement PDF downloaded!');
  };

  const limitPercentage = Math.min(
    100,
    Math.round(((wallet.dailySpentToday || 0) / (wallet.dailyTransferLimit || 1000)) * 100)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Hello, {user?.name?.split(' ')[0] || 'Member'} 👋
            </h1>
            {user?.tier === 'PRO' && (
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                PRO
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Wallet ID: <span className="font-mono text-cyan-400 font-semibold">{wallet.walletNumber}</span> • Tier:{' '}
            <span className="text-emerald-400 font-semibold">{user?.kycLevel?.replace('LEVEL_', 'Tier ') || 'Tier 1'}</span>
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={loadDashboardData}
            className="p-2.5 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-semibold text-slate-200 transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export Statement</span>
          </button>
        </div>
      </div>

      {/* 3 Main Balance Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Total Active Balance */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-950 border border-indigo-500/30 shadow-xl relative overflow-hidden">
          <div className="glow-mesh top-0 right-0 w-32 h-32 bg-indigo-500/20" />
          <div className="flex items-center justify-between relative z-10 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Total Balance</span>
            <span className="p-2 rounded-xl bg-indigo-500/10 text-cyan-400">
              <Zap className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-black text-white tracking-tight relative z-10">
            {formatCurrency(wallet.balance, wallet.currency)}
          </p>
          <div className="flex items-center space-x-2 mt-4 text-[11px] text-slate-400 relative z-10">
            <span className="inline-flex items-center text-emerald-400 font-bold space-x-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Available: {formatCurrency(wallet.availableBalance, wallet.currency)}</span>
            </span>
          </div>
        </div>

        {/* Card 2: Locked / Escrow Funds */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Locked in Pots / Escrow</span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <PiggyBank className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-black text-slate-200 tracking-tight">
            {formatCurrency(wallet.lockedBalance, wallet.currency)}
          </p>
          <div className="flex items-center justify-between mt-4 text-[11px] text-slate-400">
            <span>{pots.filter((p) => p.status === 'ACTIVE').length} active pots</span>
            <Link href="/dashboard/pots" className="text-cyan-400 hover:underline flex items-center">
              <span>View Pots</span>
              <ChevronRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
        </div>

        {/* Card 3: Daily Limit Tracker */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Daily Transfer Limit</span>
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <p className="text-3xl font-black text-white tracking-tight">
            {formatCurrency(wallet.dailyTransferLimit - (wallet.dailySpentToday || 0), wallet.currency)}
          </p>
          <div className="space-y-1.5 mt-3">
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Spent Today: {formatCurrency(wallet.dailySpentToday || 0, wallet.currency)}</span>
              <span>Max: {formatCurrency(wallet.dailyTransferLimit, wallet.currency)}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500"
                style={{ width: `${limitPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Fast Quick Actions Hub */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <Link
          href="/dashboard/transfer"
          className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-indigo-500/30 hover:border-cyan-400 hover:-translate-y-0.5 transition-all text-center flex flex-col items-center space-y-2 group shadow-lg"
        >
          <div className="w-11 h-11 rounded-xl bg-indigo-600/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">Send Money</span>
            <span className="text-[10px] text-slate-400">Instant P2P</span>
          </div>
        </Link>

        <Link
          href="/dashboard/deposit"
          className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/30 hover:border-emerald-400 hover:-translate-y-0.5 transition-all text-center flex flex-col items-center space-y-2 group shadow-lg"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">Deposit</span>
            <span className="text-[10px] text-slate-400">Stripe & Wire</span>
          </div>
        </Link>

        <Link
          href="/dashboard/requests"
          className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 hover:border-amber-400 hover:-translate-y-0.5 transition-all text-center flex flex-col items-center space-y-2 group shadow-lg"
        >
          <div className="w-11 h-11 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <HandCoins className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">Request Pay</span>
            <span className="text-[10px] text-slate-400">Split Invoices</span>
          </div>
        </Link>

        <Link
          href="/dashboard/withdraw"
          className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-violet-500/30 hover:border-violet-400 hover:-translate-y-0.5 transition-all text-center flex flex-col items-center space-y-2 group shadow-lg"
        >
          <div className="w-11 h-11 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">Withdraw</span>
            <span className="text-[10px] text-slate-400">Bank & ACH</span>
          </div>
        </Link>

        <Link
          href="/dashboard/pots"
          className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/30 hover:border-cyan-400 hover:-translate-y-0.5 transition-all text-center flex flex-col items-center space-y-2 group shadow-lg"
        >
          <div className="w-11 h-11 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <PiggyBank className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">Shared Pots</span>
            <span className="text-[10px] text-slate-400">Escrow & Group</span>
          </div>
        </Link>

        <Link
          href="/dashboard/cards"
          className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-rose-500/30 hover:border-rose-400 hover:-translate-y-0.5 transition-all text-center flex flex-col items-center space-y-2 group shadow-lg"
        >
          <div className="w-11 h-11 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">Virtual Cards</span>
            <span className="text-[10px] text-slate-400">3D Simulation</span>
          </div>
        </Link>
      </div>

      {/* Middle Section: Cash Flow Chart & Virtual Card Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Cash Flow Area Chart */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Cash Flow & Velocity Trajectory</h3>
              <p className="text-[11px] text-slate-400">Real-time deposit inflows vs outbound transfers</p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-xl border border-cyan-500/20">
              7-Day Net: +$10,240.00
            </span>
          </div>
          <CashFlowChart />
        </div>

        {/* Right: Active 3D Virtual Card */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Active Virtual Card</h3>
            <Link href="/dashboard/cards" className="text-xs text-cyan-400 hover:underline flex items-center">
              <span>Manage Cards</span>
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          {cards.length > 0 ? (
            <VirtualCard3D card={cards[0]} />
          ) : (
            <div className="h-56 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center p-6 text-center space-y-3">
              <CreditCard className="w-8 h-8 text-slate-500" />
              <p className="text-xs text-slate-400">No active virtual cards yet</p>
              <Link
                href="/dashboard/cards"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
              >
                Issue Virtual Card
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Recent Ledger Activity & Shared Pots */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Transactions Ledger */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Recent Immutable Ledger Entries</h3>
              <p className="text-[11px] text-slate-400">Audit records updated in real-time</p>
            </div>
            <Link
              href="/dashboard/transactions"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center"
            >
              <span>Full Audit Trail</span>
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          <div className="divide-y divide-white/5 overflow-hidden">
            {transactions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">No transactions recorded yet</div>
            ) : (
              transactions.map((tx) => {
                const isCredit =
                  tx.type.includes('RECEIVED') || tx.type === 'DEPOSIT' || tx.type === 'BONUS' || tx.type === 'POT_PAYOUT' || tx.type === 'REFUND';
                return (
                  <div key={tx.id} className="py-3.5 flex items-center justify-between hover:bg-white/[0.02] px-2 rounded-xl transition-colors">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isCredit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{tx.description}</p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {tx.reference} • {new Date(tx.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`text-xs font-bold ${isCredit ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {isCredit ? '+' : '-'}
                        {formatCurrency(tx.amount, tx.currency)}
                      </p>
                      <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold border ${getStatusBadgeClass(tx.status)}`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Active Shared Pots */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Active Shared Pots</h3>
            <Link href="/dashboard/pots" className="text-xs text-cyan-400 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {pots.slice(0, 3).map((pot) => {
              const progress = Math.min(100, Math.round((pot.currentAmount / pot.targetAmount) * 100));
              return (
                <div key={pot.id} className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate max-w-[160px]">{pot.title}</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold">
                      {pot.potType}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>${pot.currentAmount.toFixed(2)}</span>
                    <span className="font-bold text-slate-300">${pot.targetAmount.toFixed(2)} target</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
