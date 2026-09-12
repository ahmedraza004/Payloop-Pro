'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  FileSpreadsheet,
  TrendingUp,
  DollarSign,
  Zap,
  CreditCard,
  PiggyBank,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => setStats(data.stats))
      .catch(() => toast.error('Failed to load admin stats'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Admin Command Center</h1>
        <p className="text-xs text-slate-400">
          Global platform surveillance, transaction ledger auditing, KYC compliance queues, and AI fraud monitoring.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Platform Volume</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-white">{formatCurrency(stats?.totalVolume || 178500)}</p>
          <span className="text-[10px] text-emerald-400 font-semibold">+24.5% this month</span>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Total Users</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-3xl font-black text-white">{stats?.totalUsers || 5}</p>
          <span className="text-[10px] text-slate-400 font-semibold">Active multi-currency wallets</span>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/80 border border-rose-500/30 space-y-2">
          <div className="flex items-center justify-between text-rose-300">
            <span className="text-xs font-bold uppercase">Open Fraud Alerts</span>
            <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
          </div>
          <p className="text-3xl font-black text-rose-400">{stats?.openFraudAlertsCount || 1}</p>
          <Link href="/admin/fraud" className="text-[10px] text-rose-300 hover:underline flex items-center">
            <span>Investigate Anomaly</span>
            <ArrowRight className="w-3 h-3 ml-0.5" />
          </Link>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/80 border border-amber-500/30 space-y-2">
          <div className="flex items-center justify-between text-amber-300">
            <span className="text-xs font-bold uppercase">Pending KYC Reviews</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-amber-400">{stats?.pendingKycCount || 1}</p>
          <Link href="/admin/kyc" className="text-[10px] text-amber-300 hover:underline flex items-center">
            <span>Review Documents</span>
            <ArrowRight className="w-3 h-3 ml-0.5" />
          </Link>
        </div>
      </div>

      {/* Quick Action Navigation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/users"
          className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 hover:border-cyan-400/40 transition-all space-y-3 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">User Moderation & Wallets</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Inspect all registered users, freeze or suspend wallets, and manually update KYC compliance tiers.
          </p>
        </Link>

        <Link
          href="/admin/kyc"
          className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 hover:border-amber-400/40 transition-all space-y-3 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">KYC Compliance Queue</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Review uploaded passport credentials, compare live selfies, and approve or reject Tier 2/3 upgrades.
          </p>
        </Link>

        <Link
          href="/admin/transactions"
          className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 hover:border-rose-400/40 transition-all space-y-3 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Global Ledger & Refunds</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Surveil every transaction across the entire system and execute immediate administrative refunds.
          </p>
        </Link>
      </div>
    </div>
  );
}
