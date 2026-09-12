import React from 'next/server';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck, Zap, Globe2, Lock, Users, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar />

      <div className="pt-36 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
            Our Mission & DNA
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-white mt-4 tracking-tight">
            Building the Infrastructure for Global Financial Freedom
          </h1>
          <p className="text-base text-slate-400 mt-3 leading-relaxed">
            PayLoop Pro was engineered from first principles to remove borders, eliminate hidden remittance markups, and provide developers and power users with complete control over digital money.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/10 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Sub-Second Execution</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Traditional banking networks take 3-5 business days. Our double-entry transactional ledger moves balances instantly 24/7/365.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/10 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Uncompromising Security</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every financial mutation requires cryptographic PIN authentication, TOTP second-factor enforcement, and AI-powered heuristic velocity anomaly scans.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/10 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <Globe2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Borderless Multi-Currency</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hold, convert, and route USD, EUR, GBP, and regional currencies in isolated wallets with real-time mid-market rate execution.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
