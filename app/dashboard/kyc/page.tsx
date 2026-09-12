'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Camera,
  Upload,
  Sparkles,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { getStatusBadgeClass } from '@/lib/utils';
import { toast } from 'sonner';

export default function KYCPage() {
  const [kyc, setKyc] = useState<any>(null);
  const [currentLevel, setCurrentLevel] = useState('LEVEL_1');
  const [loading, setLoading] = useState(true);

  // Form
  const [selectedTier, setSelectedTier] = useState('LEVEL_2');
  const [idType, setIdType] = useState('PASSPORT');
  const [idNumber, setIdNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('United States');
  const [instantApprove, setInstantApprove] = useState(true);

  const loadKYC = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/kyc');
      const data = await res.json();
      setKyc(data.kyc);
      setCurrentLevel(data.currentLevel || 'LEVEL_1');
    } catch (err) {
      toast.error('Failed to load KYC record');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKYC();
  }, []);

  const handleSubmitKYC = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: selectedTier,
          idType,
          idNumber,
          address,
          city,
          country,
          instantDemoApprove: instantApprove,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'KYC submitted successfully!');
        loadKYC();
      } else {
        toast.error(data.error || 'Submission failed');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const tiers = [
    {
      level: 'LEVEL_1',
      name: 'Tier 1 • Basic',
      limit: '$1,000 / day',
      status: 'Active by Default',
      reqs: 'Full Name, Email, Address',
    },
    {
      level: 'LEVEL_2',
      name: 'Tier 2 • Verified',
      limit: '$10,000 / day',
      status: currentLevel === 'LEVEL_2' || currentLevel === 'LEVEL_3' ? 'Verified' : 'Recommended',
      reqs: 'Government ID + Live Selfie Upload',
    },
    {
      level: 'LEVEL_3',
      name: 'Tier 3 • Enterprise',
      limit: 'Unlimited Volume',
      status: currentLevel === 'LEVEL_3' ? 'Verified' : 'Manual Compliance',
      reqs: 'Proof of Address & Source of Funds',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Identity & KYC Verification</h1>
        <p className="text-xs text-slate-400">
          Verify your identity to increase daily transfer allowances and unlock unlimited global payout limits.
        </p>
      </div>

      {/* Tier Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {tiers.map((t) => {
          const isCurrent = currentLevel === t.level;
          return (
            <div
              key={t.level}
              className={`p-6 rounded-3xl border flex flex-col justify-between space-y-4 transition-all ${
                isCurrent
                  ? 'bg-gradient-to-b from-indigo-950/80 to-slate-900 border-cyan-400 shadow-xl shadow-cyan-500/10'
                  : 'bg-slate-900/60 border-white/10'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{t.name}</span>
                  {isCurrent && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                </div>
                <p className="text-2xl font-black text-white">{t.limit}</p>
                <p className="text-[11px] text-slate-400">{t.reqs}</p>
              </div>

              <span
                className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full text-center border ${
                  isCurrent
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-slate-800 text-slate-400 border-white/5'
                }`}
              >
                {isCurrent ? 'Current Tier' : t.status}
              </span>
            </div>
          );
        })}
      </div>

      {/* KYC Submission Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Submit Verification Documents</h3>
            <p className="text-xs text-slate-400">Upgrade to Tier 2 or Tier 3 for increased allowances</p>
          </div>
          <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full border ${getStatusBadgeClass(kyc?.status)}`}>
            Status: {kyc?.status || 'UNVERIFIED'}
          </span>
        </div>

        <form onSubmit={handleSubmitKYC} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Target Verification Tier</label>
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white"
              >
                <option value="LEVEL_2">Tier 2 ($10,000 / day)</option>
                <option value="LEVEL_3">Tier 3 (Unlimited Volume)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Document Type</label>
              <select
                value={idType}
                onChange={(e) => setIdType(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white"
              >
                <option value="PASSPORT">Passport</option>
                <option value="NATIONAL_ID">National ID / CNIC</option>
                <option value="DRIVING_LICENSE">Driver&apos;s License</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">ID / Passport Number</label>
              <input
                type="text"
                required
                placeholder="e.g. P88492019"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Residential Address</label>
              <input
                type="text"
                required
                placeholder="e.g. 742 Evergreen Terrace"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white"
              />
            </div>
          </div>

          {/* Document Upload Previews */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-dashed border-white/10 flex flex-col items-center justify-center text-center space-y-2">
              <Upload className="w-6 h-6 text-cyan-400" />
              <span className="text-xs font-bold text-white">Government ID Document</span>
              <span className="text-[10px] text-slate-500">JPG, PNG, PDF up to 10MB</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-dashed border-white/10 flex flex-col items-center justify-center text-center space-y-2">
              <Camera className="w-6 h-6 text-indigo-400" />
              <span className="text-xs font-bold text-white">Live Selfie Verification</span>
              <span className="text-[10px] text-slate-500">Camera snapshot with face centered</span>
            </div>
          </div>

          {/* Instant Demo Pass Checkbox */}
          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="instantApprove"
              checked={instantApprove}
              onChange={(e) => setInstantApprove(e.target.checked)}
              className="rounded bg-slate-900 border-white/20 text-cyan-400 focus:ring-0"
            />
            <label htmlFor="instantApprove" className="text-xs text-slate-300 font-medium">
              ⚡ Instant AI Verification Approval (Demo Mode)
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Submit Verification Application</span>
          </button>
        </form>
      </div>
    </div>
  );
}
