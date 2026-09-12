'use client';

import React, { useState, useEffect } from 'react';
import {
  HandCoins,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Send,
  User,
} from 'lucide-react';
import { formatCurrency, getStatusBadgeClass } from '@/lib/utils';
import PinModal from '@/components/PinModal';
import { toast } from 'sonner';

export default function RequestsPage() {
  const [tab, setTab] = useState<'incoming' | 'outgoing' | 'create'>('incoming');
  const [incoming, setIncoming] = useState<any[]>([]);
  const [outgoing, setOutgoing] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // New Request Form
  const [target, setTarget] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  // Pin modal for paying
  const [payRequestId, setPayRequestId] = useState<string | null>(null);
  const [pinModalOpen, setPinModalOpen] = useState(false);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/requests');
      const data = await res.json();
      setIncoming(data.incoming || []);
      setOutgoing(data.outgoing || []);
    } catch (err) {
      toast.error('Failed to load money requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target,
          amount: parseFloat(amount),
          note,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Money request dispatched!');
        setTarget('');
        setAmount('');
        setNote('');
        setTab('outgoing');
        loadRequests();
      } else {
        toast.error(data.error || 'Failed to create request');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const handlePayRequest = (requestId: string) => {
    setPayRequestId(requestId);
    setPinModalOpen(true);
  };

  const executePay = async (pin: string) => {
    if (!payRequestId) return;
    try {
      const res = await fetch(`/api/requests/${payRequestId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (res.ok) {
        setPinModalOpen(false);
        toast.success(data.message || 'Request paid successfully!');
        loadRequests();
      } else {
        toast.error(data.error || 'Payment failed');
      }
    } catch (err) {
      toast.error('Error paying request');
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      const res = await fetch(`/api/requests/${requestId}/decline`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        toast.success('Request declined');
        loadRequests();
      } else {
        toast.error(data.error || 'Failed to decline');
      }
    } catch (err) {
      toast.error('Error declining request');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Money & Split Requests</h1>
          <p className="text-xs text-slate-400">
            Request funds, split bills, and settle peer-to-peer invoice requests with atomic ledger movement.
          </p>
        </div>

        <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-white/5">
          <button
            onClick={() => setTab('incoming')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              tab === 'incoming'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Incoming ({incoming.filter((r) => r.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setTab('outgoing')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              tab === 'outgoing'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sent Requests
          </button>
          <button
            onClick={() => setTab('create')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-all ${
              tab === 'create'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Request</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Incoming */}
      {tab === 'incoming' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white">Pending Requests for You</h3>

          <div className="divide-y divide-white/5">
            {incoming.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">No incoming payment requests</div>
            ) : (
              incoming.map((req) => (
                <div key={req.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3">
                    <img
                      src={req.requester?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${req.requester?.username}`}
                      alt={req.requester?.name}
                      className="w-10 h-10 rounded-full object-cover bg-slate-800 flex-shrink-0"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">
                        @{req.requester?.username}{' '}
                        <span className="text-slate-400 font-normal">requested</span>{' '}
                        <span className="text-cyan-400 font-bold">{formatCurrency(req.amount, req.currency)}</span>
                      </p>
                      {req.note && <p className="text-[11px] text-slate-300 mt-0.5">&quot;{req.note}&quot;</p>}
                      <span className="text-[9px] text-slate-500 mt-1 block">
                        Received {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    {req.status === 'PENDING' ? (
                      <>
                        <button
                          onClick={() => handleDeclineRequest(req.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-white/5 transition-all"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handlePayRequest(req.id)}
                          className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition-all"
                        >
                          Pay {formatCurrency(req.amount, req.currency)}
                        </button>
                      </>
                    ) : (
                      <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border ${getStatusBadgeClass(req.status)}`}>
                        {req.status}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Outgoing */}
      {tab === 'outgoing' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white">Your Sent Payment Requests</h3>

          <div className="divide-y divide-white/5">
            {outgoing.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">No outgoing requests created</div>
            ) : (
              outgoing.map((req) => (
                <div key={req.id} className="py-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">
                      Requested {formatCurrency(req.amount, req.currency)} from{' '}
                      <span className="text-cyan-400 font-mono">
                        {req.payer?.username ? `@${req.payer.username}` : req.payerEmail}
                      </span>
                    </p>
                    {req.note && <p className="text-[11px] text-slate-300 mt-0.5">&quot;{req.note}&quot;</p>}
                    <span className="text-[9px] text-slate-500 mt-1 block">
                      Sent {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border ${getStatusBadgeClass(req.status)}`}>
                    {req.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Create */}
      {tab === 'create' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl space-y-5 max-w-xl mx-auto">
          <h3 className="text-sm font-bold text-white">Create New Payment Request</h3>

          <form onSubmit={handleCreateRequest} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Target (@username, email, or wallet ID)</label>
              <input
                type="text"
                required
                placeholder="e.g. @bobm or sarah@payloop.com"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Request Amount ($ USD)</label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                placeholder="e.g. 75.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Reason / Invoice Note</label>
              <input
                type="text"
                placeholder="e.g. Uber split, design assets, dinner bill"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Dispatch Money Request</span>
            </button>
          </form>
        </div>
      )}

      {/* PIN Modal */}
      <PinModal
        isOpen={pinModalOpen}
        onClose={() => setPinModalOpen(false)}
        onSuccess={executePay}
        title="Authorize Request Payment"
        description="Enter your 6-digit Transfer PIN to fulfill this money request"
      />
    </div>
  );
}
