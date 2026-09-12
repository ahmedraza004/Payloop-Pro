import React from 'next/server';
import Link from 'next/link';
import { Zap, ShieldCheck, Lock, Globe, Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#070a12] border-t border-white/5 pt-16 pb-12 relative overflow-hidden text-slate-400">
      {/* Background glow mesh */}
      <div className="glow-mesh -bottom-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-white/5">
          {/* Col 1: Brand & Bio */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-0.5 shadow-md shadow-indigo-500/20">
                <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
                  <Zap className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <span className="text-xl font-black tracking-tight text-white">PayLoop Pro</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              The modern borderless fintech engine. Instant cross-border P2P transfers, 3D customizable virtual cards, group escrow pots, and heuristic fraud detection.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                PCI-DSS Level 1 Ready
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Lock className="w-3.5 h-3.5 mr-1" />
                256-bit AES
              </span>
            </div>
          </div>

          {/* Col 2: Products */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/dashboard/transfer" className="hover:text-white transition-colors">Instant Transfers</Link></li>
              <li><Link href="/dashboard/cards" className="hover:text-white transition-colors">Virtual Cards</Link></li>
              <li><Link href="/dashboard/pots" className="hover:text-white transition-colors">Shared Escrow Pots</Link></li>
              <li><Link href="/dashboard/deposit" className="hover:text-white transition-colors">Stripe Checkout</Link></li>
              <li><Link href="/dashboard/recurring" className="hover:text-white transition-colors">Recurring Autopay</Link></li>
            </ul>
          </div>

          {/* Col 3: Resources & Docs */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Security & KYC</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/dashboard/kyc" className="hover:text-white transition-colors">Tier Verification</Link></li>
              <li><Link href="/dashboard/security" className="hover:text-white transition-colors">2FA & TOTP</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pro Limits</Link></li>
              <li><Link href="/admin" className="hover:text-white transition-colors">Admin Command</Link></li>
            </ul>
          </div>

          {/* Col 4: Company */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">About PayLoop</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing & Plans</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 space-y-4 sm:space-y-0">
          <p>© {new Date().getFullYear()} PayLoop Pro Global Technologies Inc. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <Link href="/contact" className="hover:text-slate-300 transition-colors">Security Audit</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
