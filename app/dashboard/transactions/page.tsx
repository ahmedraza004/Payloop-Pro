'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { formatCurrency, getStatusBadgeClass } from '@/lib/utils';
import { generateStatementPDF } from '@/lib/pdf';
import { toast } from 'sonner';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [meRes, txRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch(`/api/wallet/transactions?type=${typeFilter}&status=${statusFilter}&search=${encodeURIComponent(search)}`),
      ]);
      const [meData, txData] = await Promise.all([meRes.json(), txRes.json()]);

      if (meData.authenticated) {
        setUser(meData.user);
        setWallet(meData.wallets?.[0]);
      }
      setTransactions(txData.transactions || []);
    } catch (err) {
      toast.error('Failed to load transaction ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [typeFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleExportPDF = () => {
    if (!transactions.length) {
      toast.error('No transactions to export');
      return;
    }
    generateStatementPDF({
      userName: user?.name || 'User',
      userEmail: user?.email || 'user@payloop.com',
      walletNumber: wallet?.walletNumber || 'PL-0000-0000',
      balance: wallet?.balance || 0,
      currency: wallet?.currency || 'USD',
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

  const handleExportCSV = () => {
    if (!transactions.length) {
      toast.error('No transactions to export');
      return;
    }

    const headers = 'Date,Reference,Type,Description,Amount,Fee,Currency,Status\n';
    const rows = transactions
      .map((t) =>
        [
          `"${new Date(t.createdAt).toISOString()}"`,
          `"${t.reference}"`,
          `"${t.type}"`,
          `"${t.description.replace(/"/g, '""')}"`,
          t.amount,
          t.fee,
          `"${t.currency}"`,
          `"${t.status}"`,
        ].join(',')
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `PayLoop_Ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Spreadsheet exported!');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Immutable Transaction Ledger</h1>
          <p className="text-xs text-slate-400">
            Cryptographically logged audit trail of all deposits, withdrawals, transfers, and card purchases.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-semibold text-slate-300 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>PDF Statement</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-slate-900/80 border border-white/10 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search reference, description, wallet number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
          />
        </form>

        <div className="flex items-center space-x-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950 border border-white/10 rounded-2xl px-3 py-2 text-xs text-white outline-none"
          >
            <option value="ALL">All Transaction Types</option>
            <option value="DEPOSIT">Deposits</option>
            <option value="WITHDRAWAL">Withdrawals</option>
            <option value="TRANSFER_SENT">Transfers Sent</option>
            <option value="TRANSFER_RECEIVED">Transfers Received</option>
            <option value="CARD_PURCHASE">Virtual Card Swipes</option>
            <option value="POT_CONTRIBUTION">Shared Pots</option>
            <option value="REFUND">Refunds</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-white/10 rounded-2xl px-3 py-2 text-xs text-white outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PROCESSING">Processing</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </div>

      {/* Ledger Table Card */}
      <div className="rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-white/5">
              <tr>
                <th className="p-4">Transaction / Date</th>
                <th className="p-4">Reference</th>
                <th className="p-4">Type</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No transactions match your search criteria.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isCredit =
                    tx.type.includes('RECEIVED') ||
                    tx.type === 'DEPOSIT' ||
                    tx.type === 'BONUS' ||
                    tx.type === 'POT_PAYOUT' ||
                    tx.type === 'REFUND';

                  return (
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              isCredit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                            }`}
                          >
                            {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-bold text-white">{tx.description}</p>
                            <p className="text-[10px] text-slate-500">
                              {new Date(tx.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-mono text-[11px] text-slate-300">{tx.reference}</td>

                      <td className="p-4 font-mono text-[10px] uppercase font-bold text-cyan-400">
                        {tx.type.replace('_', ' ')}
                      </td>

                      <td className="p-4 font-bold">
                        <span className={isCredit ? 'text-emerald-400' : 'text-slate-200'}>
                          {isCredit ? '+' : '-'}
                          {formatCurrency(tx.amount, tx.currency)}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(tx.status)}`}>
                          {tx.status}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(tx.riskScore)}`}>
                          {tx.riskScore}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
