'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, Lock, Mail, User, KeyRound, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    pin: '123456',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (formData.pin.length !== 6) {
      toast.error('PIN must be exactly 6 digits');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Account created! $100 Welcome Bonus deposited.');
        router.push('/dashboard');
        router.refresh();
      } else {
        toast.error(data.error || 'Registration failed');
      }
    } catch (err) {
      toast.error('Network error during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4 relative overflow-hidden text-slate-100">
      {/* Glow meshes */}
      <div className="glow-mesh top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/20" />
      <div className="glow-mesh bottom-10 left-10 w-[400px] h-[300px] bg-cyan-500/15" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/30">
              <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <span className="text-2xl font-black tracking-tight text-white">PayLoop Pro</span>
          </Link>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Claim $100 Instant Welcome Bonus</span>
          </div>
        </div>

        {/* Card */}
        <div className="p-8 rounded-3xl bg-slate-900/80 border border-white/10 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Full Legal Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ahmed Raza"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Unique Username</label>
              <div className="relative">
                <span className="text-xs font-bold text-cyan-400 absolute left-3.5 top-2.5">@</span>
                <input
                  type="text"
                  required
                  placeholder="ahmedraza"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="ahmed@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">6-Digit Transfer PIN</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  maxLength={6}
                  required
                  placeholder="123456"
                  value={formData.pin}
                  onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-3.5 py-2.5 text-xs font-mono tracking-widest text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Creating Wallet...' : 'Create Account & Claim $100'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400">
          Already registered?{' '}
          <Link href="/auth/login" className="text-cyan-400 font-bold hover:underline">
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
}
