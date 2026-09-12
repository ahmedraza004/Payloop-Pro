import React from 'next/server';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar />
      <div className="pt-36 pb-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-4">Privacy Policy & Data Security</h1>
        <p className="text-xs text-slate-400 mb-8">Last Updated: September 2026</p>

        <div className="prose prose-invert max-w-none text-xs text-slate-300 space-y-6 leading-relaxed">
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">1. Information We Collect</h2>
            <p>
              We collect user-provided profile data (legal name, username, email, phone number), uploaded KYC government identity documents, device telemetry (IP address, browser, OS, login session timestamp), and transactional ledger records.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">2. Cryptographic Security & PIN Storage</h2>
            <p>
              All sensitive credentials including account passwords and 6-digit transaction PINs are irreversibly hashed using standard salted bcrypt algorithms. No plaintext authentication secrets are ever stored or accessible to operators.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
