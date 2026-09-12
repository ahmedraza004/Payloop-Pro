import React from 'next/server';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar />
      <div className="pt-36 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-4">Terms of Service</h1>
        <p className="text-xs text-slate-400 mb-8">Last Updated: September 2026</p>

        <div className="prose prose-invert max-w-none text-xs text-slate-300 space-y-6 leading-relaxed">
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">1. Account Eligibility & KYC Compliance</h2>
            <p>
              By accessing PayLoop Pro, you agree to provide authentic and accurate identifying credentials in compliance with applicable anti-money laundering (AML) and Know Your Customer (KYC) regulatory standards. Accounts found using forged documentation will be subject to immediate asset freezing and reporting.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">2. Transaction Finality & Double-Entry Ledgers</h2>
            <p>
              All internal peer-to-peer transfers, deposit credits, and pot contributions are executed in real time against our atomic database ledger. Confirmed transfers cannot be unilaterally cancelled by the sender once settled.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">3. Virtual Cards & Merchant Settlements</h2>
            <p>
              Virtual card numbers issued on the PayLoop platform are tied to user available wallet balances. Cardholders are responsible for authorizing recurring charges and freezing cards when not in active use.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
