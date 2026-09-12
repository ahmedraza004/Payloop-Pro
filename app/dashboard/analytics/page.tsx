'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  PieChart as PieIcon,
  Calendar,
} from 'lucide-react';
import { CashFlowChart, SpendingCategoryPieChart } from '@/components/AnalyticsCharts';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

export default function AnalyticsPage() {
  const [user, setUser] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);

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

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Financial Intelligence & Analytics</h1>
        <p className="text-xs text-slate-400">
          Gain granular insights into monthly cash flow, category breakdowns, and liquidity trajectory.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 space-y-1">
          <span className="text-[11px] font-bold uppercase text-slate-400">Monthly Inflow</span>
          <p className="text-2xl font-black text-emerald-400">+$18,200.00</p>
          <span className="text-[10px] text-slate-500">+14% vs last month</span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 space-y-1">
          <span className="text-[11px] font-bold uppercase text-slate-400">Monthly Outflow</span>
          <p className="text-2xl font-black text-rose-400">-$3,349.50</p>
          <span className="text-[10px] text-slate-500">-5% vs last month</span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 space-y-1">
          <span className="text-[11px] font-bold uppercase text-slate-400">Net Savings Rate</span>
          <p className="text-2xl font-black text-cyan-400">81.6%</p>
          <span className="text-[10px] text-slate-500">Top 5% efficiency</span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 space-y-1">
          <span className="text-[11px] font-bold uppercase text-slate-400">Card Spend Volume</span>
          <p className="text-2xl font-black text-indigo-400">$840.25</p>
          <span className="text-[10px] text-slate-500">12 online purchases</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Daily Liquidity & Cash Flow</h3>
              <p className="text-xs text-slate-400">Deposit inflows vs transfer velocity</p>
            </div>
          </div>
          <CashFlowChart />
        </div>

        <div className="lg:col-span-4 p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white">Spending Allocation</h3>
          <SpendingCategoryPieChart />
        </div>
      </div>
    </div>
  );
}
