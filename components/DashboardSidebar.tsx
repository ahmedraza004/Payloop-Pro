'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Send,
  ArrowDownLeft,
  ArrowUpRight,
  HandCoins,
  PiggyBank,
  CreditCard,
  CalendarClock,
  FileSpreadsheet,
  ShieldAlert,
  ShieldCheck,
  BarChart3,
  Settings,
  Zap,
  Crown,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface DashboardSidebarProps {
  user: any;
  unreadCount?: number;
  pendingRequestsCount?: number;
}

export default function DashboardSidebar({ user, unreadCount = 0, pendingRequestsCount = 0 }: DashboardSidebarProps) {
  const pathname = usePathname();

  const primaryNav = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Send Money', href: '/dashboard/transfer', icon: Send },
    { name: 'Deposit Funds', href: '/dashboard/deposit', icon: ArrowDownLeft },
    { name: 'Withdraw Money', href: '/dashboard/withdraw', icon: ArrowUpRight },
    {
      name: 'Money Requests',
      href: '/dashboard/requests',
      icon: HandCoins,
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : null,
    },
    { name: 'Shared Pots', href: '/dashboard/pots', icon: PiggyBank },
    { name: 'Virtual Cards', href: '/dashboard/cards', icon: CreditCard },
    { name: 'Recurring Autopay', href: '/dashboard/recurring', icon: CalendarClock },
    { name: 'Ledger & Statements', href: '/dashboard/transactions', icon: FileSpreadsheet },
    { name: 'Financial Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  ];

  const securityNav = [
    {
      name: 'KYC Verification',
      href: '/dashboard/kyc',
      icon: ShieldCheck,
      badge: user?.kycLevel ? user.kycLevel.replace('LEVEL_', 'T') : null,
    },
    { name: 'Security & 2FA', href: '/dashboard/security', icon: ShieldAlert },
    { name: 'Account Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0b0f19] border-r border-white/5 flex flex-col h-screen sticky top-0 overflow-y-auto">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-md shadow-indigo-500/20">
            <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
              <Zap className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black tracking-tight text-white">PayLoop</span>
            <span className="text-[10px] text-cyan-400 font-semibold tracking-wider">FINTECH 2.0</span>
          </div>
        </Link>
        {user?.tier === 'PRO' && (
          <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
            <Crown className="w-3 h-3" />
            <span>PRO</span>
          </span>
        )}
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-3 py-4 space-y-6">
        <div>
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Main Banking
          </p>
          <nav className="space-y-1">
            {primaryNav.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600/30 to-cyan-500/10 text-white border border-indigo-500/30 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Trust & Security
          </p>
          <nav className="space-y-1">
            {securityNav.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600/30 to-cyan-500/10 text-white border border-indigo-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Admin Navigation link if admin */}
        {user?.role === 'ADMIN' && (
          <div>
            <p className="px-3 text-[11px] font-semibold text-rose-400 uppercase tracking-wider mb-2">
              Management
            </p>
            <Link
              href="/admin"
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20 transition-all"
            >
              <div className="flex items-center space-x-3">
                <Zap className="w-4 h-4 text-rose-400" />
                <span>Admin Command</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {/* Pro Tier Upgrade Card if FREE */}
      {user?.tier !== 'PRO' && (
        <div className="p-3 mx-3 mb-4 rounded-xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-cyan-950/40 border border-indigo-500/30 p-4 relative overflow-hidden">
          <div className="flex items-center space-x-2 text-indigo-300 text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-spin" />
            <span>UPGRADE TO PRO</span>
          </div>
          <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
            Unlock $100k daily limits, 0% withdrawal fees & 10 virtual cards.
          </p>
          <Link
            href="/pricing"
            className="block text-center w-full py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all"
          >
            Upgrade for $19.99/mo
          </Link>
        </div>
      )}

      {/* User Info Bottom */}
      <div className="p-3 border-t border-white/5 flex items-center justify-between bg-[#080c14]">
        <div className="flex items-center space-x-2.5 min-w-0">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username || 'user'}`}
            alt={user?.name || 'User'}
            className="w-8 h-8 rounded-full border border-white/10 bg-slate-800 object-cover flex-shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-white truncate">{user?.name || 'User'}</span>
            <span className="text-[10px] text-slate-400 truncate">@{user?.username || 'user'}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
