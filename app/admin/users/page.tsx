'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  ShieldCheck,
  Snowflake,
  Flame,
  Crown,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { formatCurrency, getStatusBadgeClass } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleUpdateUser = async (userId: string, updateData: any) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...updateData }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'User updated successfully');
        loadUsers();
      } else {
        toast.error(data.error || 'Failed to update user');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">User Moderation & Access Control</h1>
          <p className="text-xs text-slate-400">Inspect user accounts, freeze compromised wallets, and modify clearance tiers.</p>
        </div>

        <div className="w-full sm:w-72 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-400"
          />
        </div>
      </div>

      <div className="rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-white/5">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role & Tier</th>
                <th className="p-4">KYC Clearance</th>
                <th className="p-4">Wallet Balance</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((u) => {
                const primaryWallet = u.wallets?.[0] || { balance: 0, currency: 'USD' };
                const isFrozen = u.status === 'FROZEN';

                return (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover bg-slate-800"
                        />
                        <div>
                          <p className="font-bold text-white">{u.name}</p>
                          <p className="text-[10px] text-slate-400">@{u.username} • {u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-white font-mono">
                          {u.role}
                        </span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded font-mono ${
                          u.tier === 'PRO' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {u.tier}
                        </span>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {u.kycLevel?.replace('LEVEL_', 'Tier ') || 'Tier 1'}
                      </span>
                    </td>

                    <td className="p-4 font-bold text-white">
                      {formatCurrency(primaryWallet.balance, primaryWallet.currency)}
                    </td>

                    <td className="p-4">
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(u.status)}`}>
                        {u.status}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {isFrozen ? (
                          <button
                            onClick={() => handleUpdateUser(u.id, { status: 'ACTIVE' })}
                            className="px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20"
                          >
                            Unfreeze
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateUser(u.id, { status: 'FROZEN' })}
                            className="px-2.5 py-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[11px] font-semibold border border-rose-500/20"
                          >
                            Freeze
                          </button>
                        )}

                        {u.tier !== 'PRO' ? (
                          <button
                            onClick={() => handleUpdateUser(u.id, { tier: 'PRO' })}
                            className="px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[11px] font-semibold border border-amber-500/20"
                          >
                            Upgrade Pro
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateUser(u.id, { tier: 'FREE' })}
                            className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-400 text-[11px] font-semibold"
                          >
                            Downgrade
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
