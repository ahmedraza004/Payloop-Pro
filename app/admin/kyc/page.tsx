'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  Clock,
  Eye,
} from 'lucide-react';
import { getStatusBadgeClass } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminKYCPage() {
  const [pendingKyc, setPendingKyc] = useState<any[]>([]);
  const [recentProcessed, setRecentProcessed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadKYCQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/kyc');
      const data = await res.json();
      setPendingKyc(data.pendingKyc || []);
      setRecentProcessed(data.recentProcessed || []);
    } catch (err) {
      toast.error('Failed to load KYC queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKYCQueue();
  }, []);

  const handleDecision = async (kycId: string, decision: 'APPROVE' | 'REJECT', rejectionReason?: string) => {
    try {
      const res = await fetch('/api/admin/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kycId, decision, rejectionReason }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || `KYC ${decision.toLowerCase()}d!`);
        loadKYCQueue();
      } else {
        toast.error(data.error || 'Failed to process decision');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">KYC Compliance Review Queue</h1>
        <p className="text-xs text-slate-400">
          Inspect submitted government identity documents and facial selfies to approve or deny tier increases.
        </p>
      </div>

      {/* Pending Reviews */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-amber-300 flex items-center space-x-2">
          <Clock className="w-4 h-4" />
          <span>Pending Submissions Awaiting Approval ({pendingKyc.length})</span>
        </h3>

        {pendingKyc.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/10 text-center text-xs text-slate-500">
            No pending KYC submissions in the queue. All clear! 🎉
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingKyc.map((item) => (
              <div
                key={item.id}
                className="p-6 rounded-3xl bg-slate-900/80 border border-amber-500/30 shadow-xl space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/5">
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${item.user?.username}`}
                      alt={item.user?.name}
                      className="w-10 h-10 rounded-full object-cover bg-slate-800"
                    />
                    <div>
                      <p className="text-sm font-bold text-white">{item.user?.name}</p>
                      <p className="text-xs text-slate-400">@{item.user?.username} • {item.user?.email}</p>
                    </div>
                  </div>

                  <span className="text-xs font-bold uppercase font-mono px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    Applying for {item.level?.replace('LEVEL_', 'Tier ')}
                  </span>
                </div>

                {/* Submitted Bio Details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950/60 p-4 rounded-2xl border border-white/5">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Document Type</span>
                    <span className="font-semibold text-white">{item.idType || 'PASSPORT'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">ID Number</span>
                    <span className="font-semibold text-cyan-400 font-mono">{item.idNumber || 'P-992810'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Address</span>
                    <span className="font-semibold text-white truncate block">{item.address || 'San Francisco, CA'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Submitted</span>
                    <span className="font-semibold text-slate-300">
                      {new Date(item.submittedAt || item.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Document & Selfie Image Previews */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Government ID Document</span>
                    <img
                      src={item.idFrontUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600'}
                      alt="ID Document"
                      className="w-full h-44 rounded-2xl object-cover border border-white/10"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Live Selfie Verification</span>
                    <img
                      src={item.selfieUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600'}
                      alt="Live Selfie"
                      className="w-full h-44 rounded-2xl object-cover border border-white/10"
                    />
                  </div>
                </div>

                {/* Decision Actions */}
                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/5">
                  <button
                    onClick={() => handleDecision(item.id, 'REJECT', 'Document illegible or mismatched')}
                    className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/20 transition-all flex items-center space-x-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Submission</span>
                  </button>
                  <button
                    onClick={() => handleDecision(item.id, 'APPROVE')}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Tier Increase</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recently Processed Table */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 space-y-4">
        <h3 className="text-sm font-bold text-white">Recently Processed Compliance Reviews</h3>
        <div className="divide-y divide-white/5">
          {recentProcessed.map((rec) => (
            <div key={rec.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(rec.status)}`}>
                  {rec.status}
                </span>
                <span className="font-bold text-white">@{rec.user?.username}</span>
                <span className="text-slate-400 font-mono text-[11px]">{rec.level}</span>
              </div>
              <span className="text-slate-500 text-[10px]">
                {rec.reviewedAt ? new Date(rec.reviewedAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
