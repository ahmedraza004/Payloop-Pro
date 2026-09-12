'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldAlert,
  Users,
  FileSpreadsheet,
  ShieldCheck,
  Zap,
  BarChart3,
  ArrowLeft,
  Crown,
  AlertTriangle,
  LayoutDashboard,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated || data.user?.role !== 'ADMIN') {
          toast.error('Admin access required');
          router.push('/dashboard');
        } else {
          setUser(data.user);
        }
      })
      .catch(() => router.push('/dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center animate-spin">
            <Zap className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-400">Verifying Admin Clearance...</span>
        </div>
      </div>
    );
  }

  const adminNav = [
    { name: 'Command Hub', href: '/admin', icon: LayoutDashboard },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'KYC Review Queue', href: '/admin/kyc', icon: ShieldCheck },
    { name: 'Global Ledger & Disputes', href: '/admin/transactions', icon: FileSpreadsheet },
    { name: 'Fraud & Risk Engine', href: '/admin/fraud', icon: ShieldAlert },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-[#0a0710] border-r border-rose-500/20 flex flex-col h-screen sticky top-0 overflow-y-auto">
        <div className="p-5 border-b border-rose-500/10 flex items-center justify-between">
          <Link href="/admin" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 p-0.5 shadow-md shadow-rose-500/20">
              <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
                <Crown className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-tight text-white">PayLoop Admin</span>
              <span className="text-[9px] text-rose-400 font-bold uppercase tracking-widest">Master Console</span>
            </div>
          </Link>
        </div>

        <div className="flex-1 px-3 py-4 space-y-6">
          <div>
            <p className="px-3 text-[11px] font-bold text-rose-400/80 uppercase tracking-wider mb-2">
              Management Modules
            </p>
            <nav className="space-y-1">
              {adminNav.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-rose-400' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="p-3 border-t border-rose-500/10">
          <Link
            href="/dashboard"
            className="flex items-center justify-center space-x-2 w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-white/10 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to User Portal</span>
          </Link>
        </div>
      </aside>

      {/* Admin Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <header className="h-16 bg-[#0a0710]/90 backdrop-blur-md border-b border-rose-500/20 px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-mono font-bold text-rose-300 uppercase tracking-wider">
              ADMIN MODE • ROOT CLEARANCE
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-white">{user?.name} (Admin)</span>
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt="Admin"
              className="w-7 h-7 rounded-lg object-cover"
            />
          </div>
        </header>

        <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}
