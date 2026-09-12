'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Check, Sparkles, Zap, ShieldCheck, Crown, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const router = useRouter();
  const [billing, setBilling] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billing }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Upgraded to Pro!');
        router.push('/dashboard');
      } else {
        toast.error(data.error || 'Please sign in to upgrade');
        if (res.status === 401) {
          router.push('/auth/login?redirect=/pricing');
        }
      }
    } catch (err) {
      toast.error('Upgrade request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar />

      <div className="pt-36 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
            Transparent Monetization
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-white mt-4 tracking-tight">
            Predictable Pricing for Global Scale
          </h1>
          <p className="text-base text-slate-400 mt-3 leading-relaxed">
            Start for free with basic limits or power up to PayLoop Pro for zero withdrawal fees, 10 virtual cards, and $100k daily transfers.
          </p>

          {/* Billing Switch */}
          <div className="mt-8 inline-flex items-center bg-slate-900/90 border border-white/10 p-1.5 rounded-2xl">
            <button
              onClick={() => setBilling('MONTHLY')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                billing === 'MONTHLY'
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBilling('YEARLY')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                billing === 'YEARLY'
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
          {/* FREE TIER */}
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/10 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Standard Plan</span>
                <h3 className="text-2xl font-bold text-white mt-1">Free Account</h3>
                <p className="text-xs text-slate-400 mt-2">Essential wallet and P2P payments for individuals.</p>
              </div>

              <div className="flex items-baseline space-x-1">
                <span className="text-4xl font-black text-white">$0</span>
                <span className="text-xs text-slate-400 font-medium">/ forever</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Free P2P Transfers by username & QR</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>$1,000 / day default transfer limit</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Up to 3 Active Virtual Cards</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Shared Savings Pots</span>
                </li>
                <li className="flex items-center space-x-2 text-slate-500">
                  <span className="w-4 h-4 text-center font-bold text-slate-600">✕</span>
                  <span>Standard 1.5% bank withdrawal fee</span>
                </li>
              </ul>
            </div>

            <Link
              href="/auth/register"
              className="mt-8 block text-center w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-white/10 transition-all"
            >
              Get Started Free
            </Link>
          </div>

          {/* PRO TIER */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-900/90 via-indigo-950/40 to-slate-950/90 border border-indigo-500/40 shadow-2xl relative flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-indigo-500 to-cyan-500 text-white text-[10px] font-extrabold uppercase px-4 py-1 rounded-bl-xl tracking-wider shadow-md">
              RECOMMENDED
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-1">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>PayLoop Pro</span>
                </span>
                <h3 className="text-2xl font-bold text-white mt-1">Power Member</h3>
                <p className="text-xs text-slate-400 mt-2">Unlimited power for power users, creators, and freelancers.</p>
              </div>

              <div className="flex items-baseline space-x-1">
                <span className="text-4xl font-black text-white">
                  ${billing === 'YEARLY' ? '16.58' : '19.99'}
                </span>
                <span className="text-xs text-slate-400 font-medium">/ month ({billing === 'YEARLY' ? 'billed $199/yr' : 'billed monthly'})</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-200">
                <li className="flex items-center space-x-2 font-medium">
                  <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span><strong>$100,000 / day</strong> elevated transfer limit</span>
                </li>
                <li className="flex items-center space-x-2 font-medium">
                  <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span><strong>0% fee</strong> on all bank & IBAN withdrawals</span>
                </li>
                <li className="flex items-center space-x-2 font-medium">
                  <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Up to <strong>10 Virtual Cards</strong> with custom skins</span>
                </li>
                <li className="flex items-center space-x-2 font-medium">
                  <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Escrow & Multi-party Betting Pots with arbitration</span>
                </li>
                <li className="flex items-center space-x-2 font-medium">
                  <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Recurring Autopay & Smart Standing Orders</span>
                </li>
                <li className="flex items-center space-x-2 font-medium">
                  <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Priority KYC verification review within 15 min</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="mt-8 w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-xl shadow-indigo-500/25 transition-all flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-cyan-200" />
              <span>{loading ? 'Processing...' : 'Upgrade Account to Pro'}</span>
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
