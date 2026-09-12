'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, CheckCircle2, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 2FA state
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.requires2FA) {
          setRequires2FA(true);
          setTempToken(data.tempToken);
          toast.info('2FA Authenticator Code Required');
        } else {
          toast.success('Welcome back!');
          router.push('/dashboard');
          router.refresh();
        }
      } else {
        toast.error(data.error || 'Login failed');
      }
    } catch (err) {
      toast.error('Network error during login');
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, code: otpCode }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('2FA Verified! Welcome to PayLoop Pro');
        router.push('/dashboard');
        router.refresh();
      } else {
        toast.error(data.error || 'Invalid 2FA code');
      }
    } catch (err) {
      toast.error('2FA verification failed');
    } finally {
      setLoading(false);
    }
  };

  const quickDemoLogin = (email: string, pass: string) => {
    setIdentifier(email);
    setPassword(pass);
    toast.success(`Loaded credentials for ${email}. Click Sign In!`);
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4 relative overflow-hidden text-slate-100">
      {/* Background glow meshes */}
      <div className="glow-mesh top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/20" />
      <div className="glow-mesh bottom-10 right-10 w-[400px] h-[300px] bg-cyan-500/15" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/30">
              <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <span className="text-2xl font-black tracking-tight text-white">PayLoop Pro</span>
          </Link>
          <p className="text-xs text-slate-400">Sign in to your encrypted multi-currency account</p>
        </div>

        {/* Card Container */}
        <div className="p-8 rounded-3xl bg-slate-900/80 border border-white/10 shadow-2xl backdrop-blur-xl">
          {!requires2FA ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Email or @Username</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="pro@payloop.com or ahmedraza"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">Password</label>
                  <Link href="/auth/forgot-password" className="text-[11px] text-cyan-400 hover:underline">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center space-x-2"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handle2FASubmit} className="space-y-4">
              <div className="text-center space-y-2 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-white">Two-Factor Authentication</h3>
                <p className="text-xs text-slate-400">Enter the 6-digit code from Google Authenticator</p>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  placeholder="e.g. 123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 text-center text-lg tracking-widest font-mono font-bold text-cyan-400 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-xs font-bold shadow-lg transition-all"
              >
                <span>{loading ? 'Verifying...' : 'Verify & Continue'}</span>
              </button>

              <button
                type="button"
                onClick={() => setRequires2FA(false)}
                className="w-full text-center text-xs text-slate-400 hover:text-white"
              >
                ← Back to Login
              </button>
            </form>
          )}

          {/* Quick 1-Click Demo Login Personas */}
          <div className="mt-6 pt-5 border-t border-white/5 space-y-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
              ⚡ 1-Click Demo Persona Credentials
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => quickDemoLogin('admin@payloop.com', 'Admin@12345')}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-left border border-white/5 transition-all flex flex-col items-center text-center"
              >
                <span className="text-[11px] font-bold text-rose-300">Admin</span>
                <span className="text-[9px] text-slate-500">Alexander</span>
              </button>
              <button
                type="button"
                onClick={() => quickDemoLogin('pro@payloop.com', 'User@12345')}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-left border border-indigo-500/30 transition-all flex flex-col items-center text-center"
              >
                <span className="text-[11px] font-bold text-amber-300">Pro User</span>
                <span className="text-[9px] text-slate-500">Ahmed ($14k)</span>
              </button>
              <button
                type="button"
                onClick={() => quickDemoLogin('user@payloop.com', 'User@12345')}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-left border border-white/5 transition-all flex flex-col items-center text-center"
              >
                <span className="text-[11px] font-bold text-cyan-300">Standard</span>
                <span className="text-[9px] text-slate-500">Sarah ($2.4k)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer link */}
        <p className="text-center text-xs text-slate-400">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-cyan-400 font-bold hover:underline">
            Register & Claim $100
          </Link>
        </p>
      </div>
    </div>
  );
}
