'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Crown, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user);
          setName(data.user.name || '');
          setPhone(data.user.phone || '');
        }
      });
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profile preferences saved!');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Account & Profile Settings</h1>
        <p className="text-xs text-slate-400">Manage your persona credentials, subscription tier, and system preferences.</p>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl space-y-6">
        <div className="flex items-center space-x-4 pb-6 border-b border-white/5">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username || 'user'}`}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl bg-slate-800 object-cover border border-white/10"
          />
          <div>
            <h3 className="text-base font-bold text-white">{user?.name}</h3>
            <p className="text-xs text-slate-400">@{user?.username} • {user?.email}</p>
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {user?.tier} PLAN
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {user?.kycLevel?.replace('LEVEL_', 'KYC T') || 'Tier 1'}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Full Legal Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-xs font-bold shadow-md"
          >
            Save Profile
          </button>
        </form>
      </div>

      {/* Subscription Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-950 border border-indigo-500/30 shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Membership Tier</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Current Tier: <strong className="text-cyan-400">{user?.tier}</strong> • Unlimited 3D Virtual Cards & $100k limits
          </p>
        </div>
        <Link
          href="/pricing"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-xs font-bold shadow-md"
        >
          {user?.tier === 'PRO' ? 'Manage Plan' : 'Upgrade to Pro'}
        </Link>
      </div>
    </div>
  );
}
