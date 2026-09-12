'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Search,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import { formatCurrency, getStatusBadgeClass } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/transactions?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      toast.error('Failed to load global ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleRefund = async (transactionId: string, reference: string) => {
    if (!confirm(`Are you sure you want to issue an administrative refund for ${reference}?`)) return;

    try {
      const res = await fetch('/api/admin/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId, reason: 'Admin Dispute Resolution' }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Refund issued successfully!');
        loadTransactions();
      } else {
        toast.error(data.error || 'Refund failed');
      }
    } catch (err) {
      toast.error('Error processing refund');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Global Transaction Ledger & Disputes</h1>
          <p className="text-xs text-slate-400">Complete multi-account financial ledger with administrative rollback powers.</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadTransactions();
          }}
          className="w-full sm:w-80 relative"
        >
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search reference, user, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-400"
          />
        </form>
      </div>

      <div className="rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-white/5">
              <tr>
                <th className="p-4">Reference / Time</th>
                <th className="p-4">User</th>
                <th className="p-4">Type</th>
                <th className="p-4">Description</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.map((tx) => {
                const canRefund = tx.status === 'COMPLETED' && tx.type !== 'REFUND';
                return (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <p className="font-mono font-bold text-white">{tx.reference}</p>
                      <p className="text-[10px] text-slate-500">{new Date(tx.createdAt).toLocaleString()}</p>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-slate-200">{tx.user?.name}</p>
                      <p className="text-[10px] text-slate-400">@{tx.user?.username}</p>
                    </td>

                    <td className="p-4 font-mono font-bold text-[10px] text-cyan-400 uppercase">
                      {tx.type.replace('_', ' ')}
                    </td>

                    <td className="p-4 text-slate-300 max-w-xs truncate">{tx.description}</td>

                    <td className="p-4 font-bold text-white">{formatCurrency(tx.amount, tx.currency)}</td>

                    <td className="p-4">
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(tx.status)}`}>
                        {tx.status}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      {canRefund ? (
                        <button
                          onClick={() => handleRefund(tx.id, tx.reference)}
                          className="px-3 py-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[11px] font-semibold border border-rose-500/20 transition-all flex items-center space-x-1 ml-auto"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Refund</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-600 font-mono italic">Settled</span>
                      )}
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
