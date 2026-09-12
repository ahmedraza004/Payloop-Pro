'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarClock,
  Plus,
  Play,
  Pause,
  Zap,
  CheckCircle2,
  Trash2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

export default function RecurringPage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [showCreate, setShowCreate] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [recipientIdentifier, setRecipientIdentifier] = useState('');
  const [amount, setAmount] = useState('100');
  const [frequency, setFrequency] = useState('MONTHLY');

  const loadSchedules = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/recurring');
      const data = await res.json();
      setSchedules(data.schedules || []);
    } catch (err) {
      toast.error('Failed to load recurring schedules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/recurring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName,
          recipientIdentifier,
          amount: parseFloat(amount),
          frequency,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Recurring rule created!');
        setShowCreate(false);
        setRecipientName('');
        setRecipientIdentifier('');
        setAmount('100');
        loadSchedules();
      } else {
        toast.error(data.error || 'Failed to create schedule');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      const res = await fetch('/api/recurring', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: nextStatus }),
      });
      if (res.ok) {
        toast.success(`Schedule ${nextStatus.toLowerCase()}`);
        loadSchedules();
      }
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const handleExecuteNow = async (scheduleId: string) => {
    try {
      const res = await fetch('/api/recurring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'EXECUTE_NOW', scheduleId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Payment executed successfully!');
        loadSchedules();
      } else {
        toast.error(data.error || 'Execution failed');
      }
    } catch (err) {
      toast.error('Execution error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Recurring Autopay & Schedules</h1>
          <p className="text-xs text-slate-400">
            Automate routine transfers, rent allowances, and monthly invoices with automatic ledger execution.
          </p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Standing Order</span>
        </button>
      </div>

      {/* Schedules List */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white">Active Payment Rules</h3>

        <div className="divide-y divide-white/5">
          {schedules.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">No scheduled recurring payments yet</div>
          ) : (
            schedules.map((sch) => (
              <div key={sch.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-cyan-400 flex items-center justify-center flex-shrink-0">
                    <CalendarClock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-xs font-bold text-white">{sch.recipientName}</p>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold">
                        {sch.frequency}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Target: {sch.recipientIdentifier} • Next run: {new Date(sch.nextExecution).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 self-end sm:self-center">
                  <span className="text-base font-black text-white">{formatCurrency(sch.amount, sch.currency)}</span>

                  <button
                    onClick={() => handleExecuteNow(sch.id)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold border border-white/5 transition-all flex items-center space-x-1"
                    title="Trigger Manual Execution Now"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Run Now</span>
                  </button>

                  <button
                    onClick={() => handleToggleStatus(sch.id, sch.status)}
                    className={`p-2 rounded-xl text-xs font-semibold border transition-all ${
                      sch.status === 'ACTIVE'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                    }`}
                  >
                    {sch.status === 'ACTIVE' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal: Create Standing Order */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-[#111827] border border-white/10 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Create Standing Order Rule</h3>
            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Recipient / Purpose Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Cloud Hosting or Rent Payment"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Recipient Identifier (@username / email)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. @alice or billing@vendor.com"
                  value={recipientIdentifier}
                  onChange={(e) => setRecipientIdentifier(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Amount ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="YEARLY">Yearly</option>
                </select>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-xs font-bold text-white shadow-md"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
