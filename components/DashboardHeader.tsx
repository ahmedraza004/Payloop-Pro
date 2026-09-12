'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Search,
  QrCode,
  ArrowUpRight,
  ArrowDownLeft,
  LogOut,
  User,
  ShieldCheck,
  Crown,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Users,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';

interface DashboardHeaderProps {
  user: any;
  wallets: any[];
  onOpenQrModal?: () => void;
}

export default function DashboardHeader({ user, wallets, onOpenQrModal }: DashboardHeaderProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const switcherRef = useRef<HTMLDivElement>(null);

  const primaryWallet = wallets?.[0] || { balance: 0, currency: 'USD', walletNumber: 'PL-0000-0000' };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Polling every 10s

    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setSwitcherOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      if (res.ok) {
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        toast.success('All notifications marked as read');
      }
    } catch (err) {}
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    toast.success('Signed out successfully');
    router.push('/auth/login');
    router.refresh();
  };

  const handleQuickSwitch = async (email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: email, password: pass }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Switched account to ${email}`);
        setSwitcherOpen(false);
        window.location.reload();
      } else {
        toast.error(data.error || 'Failed to switch account');
      }
    } catch (err) {
      toast.error('Switch failed');
    }
  };

  return (
    <header className="h-16 bg-[#0b0f19]/90 backdrop-blur-md border-b border-white/5 px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Search Bar / Wallet Pill */}
      <div className="flex items-center space-x-4">
        <div className="hidden lg:flex items-center bg-slate-900/80 border border-white/10 rounded-xl px-3.5 py-1.5 w-64 text-slate-400 focus-within:border-indigo-500 focus-within:text-white transition-all">
          <Search className="w-4 h-4 mr-2 text-slate-500" />
          <input
            type="text"
            placeholder="Search transactions, users, pots..."
            className="bg-transparent border-none outline-none text-xs w-full text-slate-200 placeholder:text-slate-500"
          />
          <kbd className="text-[10px] bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-slate-400 font-mono">
            ⌘K
          </kbd>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900/60 border border-white/5 px-3 py-1.5 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-slate-400 font-mono">{primaryWallet.walletNumber}</span>
          <span className="text-xs font-bold text-white">
            ${primaryWallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} {primaryWallet.currency}
          </span>
        </div>
      </div>

      {/* Right Actions & Controls */}
      <div className="flex items-center space-x-3">
        {/* Quick Demo Switcher */}
        <div className="relative" ref={switcherRef}>
          <button
            onClick={() => setSwitcherOpen(!switcherOpen)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-xs font-semibold transition-all"
            title="Switch Demo Persona"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Demo Switcher</span>
            <ChevronDown className="w-3 h-3 text-indigo-400" />
          </button>

          {switcherOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#111827] border border-white/10 shadow-2xl p-2 z-50 space-y-1">
              <div className="px-3 py-2 border-b border-white/5">
                <p className="text-xs font-bold text-white">Instant Switch Demo Persona</p>
                <p className="text-[10px] text-slate-400">One-click testing without retyping</p>
              </div>

              <button
                onClick={() => handleQuickSwitch('admin@payloop.com', 'Admin@12345')}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-white/5 transition-all ${
                  user?.email === 'admin@payloop.com' ? 'bg-indigo-600/20 border border-indigo-500/30' : ''
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white flex items-center space-x-1">
                    <span>Admin (Alexander)</span>
                    <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1 rounded font-mono">ADMIN</span>
                  </span>
                  <span className="text-[10px] text-slate-400">admin@payloop.com</span>
                </div>
                {user?.email === 'admin@payloop.com' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </button>

              <button
                onClick={() => handleQuickSwitch('pro@payloop.com', 'User@12345')}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-white/5 transition-all ${
                  user?.email === 'pro@payloop.com' ? 'bg-indigo-600/20 border border-indigo-500/30' : ''
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white flex items-center space-x-1">
                    <span>Pro User (Ahmed)</span>
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded font-mono">PRO / T2</span>
                  </span>
                  <span className="text-[10px] text-slate-400">pro@payloop.com</span>
                </div>
                {user?.email === 'pro@payloop.com' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </button>

              <button
                onClick={() => handleQuickSwitch('user@payloop.com', 'User@12345')}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-white/5 transition-all ${
                  user?.email === 'user@payloop.com' ? 'bg-indigo-600/20 border border-indigo-500/30' : ''
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white flex items-center space-x-1">
                    <span>Standard User (Sarah)</span>
                    <span className="text-[9px] bg-slate-500/20 text-slate-300 px-1 rounded font-mono">FREE / T1</span>
                  </span>
                  <span className="text-[10px] text-slate-400">user@payloop.com</span>
                </div>
                {user?.email === 'user@payloop.com' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </button>
            </div>
          )}
        </div>

        {/* Quick QR Generator / Scanner button */}
        <button
          onClick={onOpenQrModal}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 transition-all flex items-center space-x-1.5 text-xs font-medium"
          title="Show or Scan Payment QR"
        >
          <QrCode className="w-4 h-4 text-cyan-400" />
          <span className="hidden md:inline">QR Code</span>
        </button>

        {/* Quick Send Action */}
        <Link
          href="/dashboard/transfer"
          className="hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all"
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>Send</span>
        </Link>

        {/* Notifications Tray */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 relative transition-all"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 text-[10px] font-bold text-black flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#111827] border border-white/10 shadow-2xl overflow-hidden z-50">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">No notifications yet</div>
                ) : (
                  notifications.map((notif) => (
                    <Link
                      key={notif.id}
                      href={notif.link || '/dashboard'}
                      onClick={() => setNotifOpen(false)}
                      className={`block p-3.5 hover:bg-white/[0.03] transition-colors ${
                        !notif.isRead ? 'bg-indigo-600/10' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-cyan-400" />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-slate-200">{notif.title}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{notif.message}</p>
                          <span className="text-[9px] text-slate-500 mt-1 block">
                            {new Date(notif.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Dropdown */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center space-x-2 p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-white/10 transition-all"
          >
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username || 'user'}`}
              alt={user?.name || 'User'}
              className="w-7 h-7 rounded-lg object-cover"
            />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#111827] border border-white/10 shadow-2xl p-2 z-50 space-y-1">
              <div className="px-3 py-2 border-b border-white/5">
                <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-400 truncate">@{user?.username}</p>
              </div>

              <Link
                href="/dashboard/settings"
                onClick={() => setUserDropdownOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all"
              >
                <User className="w-4 h-4 text-indigo-400" />
                <span>Account Profile</span>
              </Link>

              <Link
                href="/dashboard/kyc"
                onClick={() => setUserDropdownOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>KYC Tier Status</span>
              </Link>

              {user?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-300 hover:bg-rose-500/10 transition-all"
                >
                  <Crown className="w-4 h-4 text-rose-400" />
                  <span>Admin Panel</span>
                </Link>
              )}

              <div className="pt-1 border-t border-white/5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-all text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
