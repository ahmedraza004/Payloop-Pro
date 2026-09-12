'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  CreditCard,
  PiggyBank,
  Lock,
  Globe2,
  Cpu,
  HandCoins,
  QrCode,
  CheckCircle2,
  TrendingUp,
  ChevronRight,
  DollarSign,
  Send,
  Eye,
} from 'lucide-react';

export default function LandingPage() {
  const [calcAmount, setCalcAmount] = useState('1000');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');

  const rates: Record<string, number> = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.78,
    CAD: 1.35,
    AED: 3.67,
  };

  const calculateConverted = () => {
    const num = parseFloat(calcAmount) || 0;
    const inUSD = num / (rates[fromCurrency] || 1);
    const converted = inUSD * (rates[toCurrency] || 1);
    return converted.toFixed(2);
  };

  const featureCards = [
    {
      icon: Send,
      title: 'Sub-Second P2P Transfers',
      description: 'Transfer funds across borders by @username, email, or dynamic QR code with zero internal friction and instant ledger settlements.',
      badge: 'Core Banking',
      color: 'from-blue-500/20 to-indigo-500/20',
      borderColor: 'border-blue-500/30',
    },
    {
      icon: CreditCard,
      title: '3D Virtual Visa & Mastercard',
      description: 'Issue disposable or reloadable virtual cards with custom cyberpunk skins, one-click freeze toggles, and interactive CVV security reveal.',
      badge: 'Virtual Cards',
      color: 'from-cyan-500/20 to-teal-500/20',
      borderColor: 'border-cyan-500/30',
    },
    {
      icon: PiggyBank,
      title: 'Shared Pots & Escrow Pools',
      description: 'Collaborative group savings goals, prediction tournament betting pools, and buyer-seller milestone escrow with mutual release arbitration.',
      badge: 'Unique Engine',
      color: 'from-emerald-500/20 to-green-500/20',
      borderColor: 'border-emerald-500/30',
    },
    {
      icon: ShieldCheck,
      title: 'Multi-Tier KYC Verification',
      description: 'Automated Tier 1 (Bio), Tier 2 (Government ID + Camera Selfie Snapshot), and Tier 3 Compliance review unlocking up to unlimited daily limits.',
      badge: 'Compliance',
      color: 'from-violet-500/20 to-purple-500/20',
      borderColor: 'border-violet-500/30',
    },
    {
      icon: Lock,
      title: 'AI & Heuristic Fraud Detection',
      description: 'Real-time velocity monitoring, abnormal volume thresholds, multi-device tracking, and automated risk scoring (Low / Med / High).',
      badge: 'Risk Engine',
      color: 'from-amber-500/20 to-orange-500/20',
      borderColor: 'border-amber-500/30',
    },
    {
      icon: QrCode,
      title: 'Instant QR Code Payments',
      description: 'Generate static or dynamic payment request QR codes with pre-filled amounts and memo tags for frictionless point-of-sale checkout.',
      badge: 'Modern Pay',
      color: 'from-rose-500/20 to-pink-500/20',
      borderColor: 'border-rose-500/30',
    },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        {/* Glowing background meshes */}
        <div className="glow-mesh top-20 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-600/20" />
        <div className="glow-mesh top-60 right-10 w-[400px] h-[300px] bg-cyan-500/15" />
        <div className="glow-mesh top-96 left-10 w-[400px] h-[300px] bg-purple-600/15" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Headline */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-indigo-500/30 text-xs font-semibold text-indigo-300 shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>Next-Gen Fintech Platform 2.0</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span className="text-cyan-400 font-bold">$100 Welcome Bonus Active</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-white">
                The Financial Engine for the{' '}
                <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                  Borderless Economy
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                PayLoop Pro combines the simplicity of CashApp, the global power of Wise, and the modular security of Revolut into one high-velocity fintech SaaS.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
                <Link
                  href="/auth/register"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-base shadow-xl shadow-indigo-500/25 transition-all duration-200 hover:scale-[1.02] flex items-center justify-center space-x-2"
                >
                  <span>Open Free Account</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  href="/auth/login"
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-base border border-white/10 transition-all flex items-center justify-center space-x-2"
                >
                  <Eye className="w-5 h-5 text-indigo-400" />
                  <span>Explore Live Demo</span>
                </Link>
              </div>

              {/* Trust Metric Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/5 max-w-lg mx-auto lg:mx-0">
                <div>
                  <p className="text-2xl font-black text-white">$14.8M+</p>
                  <p className="text-xs text-slate-500">Volume Processed</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-cyan-400">&lt; 0.4s</p>
                  <p className="text-xs text-slate-500">P2P Settlement</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-emerald-400">99.99%</p>
                  <p className="text-xs text-slate-500">Audit Uptime</p>
                </div>
              </div>
            </div>

            {/* Right Interactive Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md rounded-3xl p-6 bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/10 shadow-2xl backdrop-blur-2xl space-y-6">
                {/* Top Balance Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-medium block">Total Active Balance</span>
                    <span className="text-3xl font-black text-white tracking-tight">$14,850.50</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center space-x-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+12.8%</span>
                  </span>
                </div>

                {/* Cyber Card Visual Preview */}
                <div className="h-44 rounded-2xl bg-gradient-to-tr from-indigo-900 via-slate-900 to-cyan-900 p-5 border border-cyan-500/30 flex flex-col justify-between shadow-xl relative overflow-hidden">
                  <div className="flex justify-between items-center z-10">
                    <span className="text-xs font-bold text-white tracking-widest uppercase">PayLoop Virtual</span>
                    <span className="text-xs font-bold text-cyan-400 font-mono">VISA</span>
                  </div>
                  <div className="z-10 font-mono text-sm font-bold text-white tracking-widest">
                    4532 •••• •••• 7731
                  </div>
                  <div className="flex justify-between items-end z-10 text-[10px] text-slate-300">
                    <div>
                      <span className="block text-slate-400">HOLDER</span>
                      <span className="font-bold text-white">AHMED RAZA</span>
                    </div>
                    <div>
                      <span className="block text-slate-400">EXPIRES</span>
                      <span className="font-bold text-white">08/29</span>
                    </div>
                  </div>
                </div>

                {/* Quick Interactive Actions */}
                <div className="grid grid-cols-3 gap-2">
                  <Link
                    href="/dashboard/transfer"
                    className="py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-white/5 text-center text-xs font-semibold text-slate-200 transition-all flex flex-col items-center space-y-1"
                  >
                    <Send className="w-4 h-4 text-cyan-400" />
                    <span>Send</span>
                  </Link>
                  <Link
                    href="/dashboard/deposit"
                    className="py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-white/5 text-center text-xs font-semibold text-slate-200 transition-all flex flex-col items-center space-y-1"
                  >
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>Deposit</span>
                  </Link>
                  <Link
                    href="/dashboard/pots"
                    className="py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-white/5 text-center text-xs font-semibold text-slate-200 transition-all flex flex-col items-center space-y-1"
                  >
                    <PiggyBank className="w-4 h-4 text-indigo-400" />
                    <span>Escrow</span>
                  </Link>
                </div>

                {/* Recent activity micro-feed */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-slate-300">Payment from @bobm</span>
                    </div>
                    <span className="font-bold text-emerald-400">+$3,200.00</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                      <span className="text-slate-300">Pot: Tokyo Summer Trip</span>
                    </div>
                    <span className="font-bold text-slate-300">-$1,500.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE CURRENCY CONVERTER & FEE CALCULATOR */}
      <section className="py-16 bg-[#070a12] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Transparent Global Exchange & Zero Hidden Fees
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              See exact mid-market exchange rates with 0% markup for verified Pro accounts.
            </p>
          </div>

          <div className="max-w-3xl mx-auto rounded-3xl p-6 sm:p-8 bg-slate-900/60 border border-white/10 shadow-xl backdrop-blur-xl">
            <div className="grid grid-cols-1 sm:grid-cols-11 gap-4 items-center">
              {/* Send Amount */}
              <div className="sm:col-span-5 space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">You Send</label>
                <div className="flex bg-slate-950 border border-white/10 rounded-2xl p-2 focus-within:border-cyan-400 transition-all">
                  <input
                    type="number"
                    value={calcAmount}
                    onChange={(e) => setCalcAmount(e.target.value)}
                    className="w-full bg-transparent text-lg font-bold text-white px-2 outline-none"
                  />
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="bg-slate-800 text-xs font-bold text-white rounded-xl px-3 py-1 outline-none border border-white/10"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="AED">AED (د.إ)</option>
                  </select>
                </div>
              </div>

              {/* Arrow */}
              <div className="sm:col-span-1 text-center flex justify-center">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-cyan-400">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>

              {/* Receive Amount */}
              <div className="sm:col-span-5 space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Recipient Gets (Estimated)</label>
                <div className="flex bg-slate-950 border border-white/10 rounded-2xl p-2">
                  <input
                    type="text"
                    readOnly
                    value={calculateConverted()}
                    className="w-full bg-transparent text-lg font-bold text-emerald-400 px-2 outline-none"
                  />
                  <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                    className="bg-slate-800 text-xs font-bold text-white rounded-xl px-3 py-1 outline-none border border-white/10"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="AED">AED (د.إ)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Fee Breakdown */}
            <div className="mt-6 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>PayLoop Internal Transfer Fee: <strong className="text-white">$0.00 (Free)</strong></span>
              </div>
              <div>
                <span>Standard Delivery: <strong className="text-cyan-400">Instant (&lt; 1 sec)</strong></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE BENTO GRID */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
            Engineered For Scale
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white mt-4 tracking-tight">
            Six Pillars of Modern Financial Architecture
          </h2>
          <p className="text-base text-slate-400 mt-3 leading-relaxed">
            Everything you need from high-frequency ledger accounting to 3D virtual cards and compliance review workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className={`p-7 rounded-3xl bg-gradient-to-b from-slate-900/80 to-slate-950/80 border ${feat.borderColor} hover:border-cyan-400/50 transition-all duration-300 hover:-translate-y-1 shadow-lg group relative overflow-hidden`}
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feat.color} border ${feat.borderColor} flex items-center justify-center mb-5 text-cyan-400 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">
                  {feat.badge}
                </span>
                <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 relative overflow-hidden">
        <div className="glow-mesh top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-indigo-600/25" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-br from-indigo-950/90 via-slate-900 to-cyan-950/90 border border-indigo-500/30 shadow-2xl backdrop-blur-2xl">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Ready to Upgrade Your Financial Experience?
            </h2>
            <p className="text-base text-slate-300 max-w-xl mx-auto mt-4 leading-relaxed">
              Create your account today, verify your identity in minutes, and receive an instant $100 welcome credit directly in your multi-currency wallet.
            </p>
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Link
                href="/auth/register"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-base shadow-xl shadow-indigo-500/30 transition-all hover:scale-[1.02]"
              >
                Claim $100 & Create Wallet
              </Link>
              <Link
                href="/auth/login"
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold text-base border border-white/10 transition-all"
              >
                Sign In with Demo Persona
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
