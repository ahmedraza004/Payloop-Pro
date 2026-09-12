'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  KeyRound,
  Lock,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Globe,
  Monitor,
} from 'lucide-react';
import { toast } from 'sonner';

export default function SecurityPage() {
  const [securityData, setSecurityData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 2FA Setup Flow
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [secretCode, setSecretCode] = useState<string | null>(null);
  const [totpInput, setTotpInput] = useState('');

  // Password Update
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // PIN Update
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');

  const loadSecurity = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/security');
      const data = await res.json();
      setSecurityData(data);
    } catch (err) {
      toast.error('Failed to load security settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSecurity();
  }, []);

  const handleGenerate2FA = async () => {
    try {
      const res = await fetch('/api/auth/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'GENERATE_2FA_SECRET' }),
      });
      const data = await res.json();
      if (res.ok) {
        setQrCodeUrl(data.qrCodeUrl);
        setSecretCode(data.secret);
        toast.info('Scan QR Code with Google Authenticator');
      } else {
        toast.error(data.error || 'Failed to generate 2FA');
      }
    } catch (err) {
      toast.error('Error generating 2FA');
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ENABLE_2FA', code: totpInput }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || '2FA Enabled!');
        setQrCodeUrl(null);
        setTotpInput('');
        loadSecurity();
      } else {
        toast.error(data.error || 'Invalid code');
      }
    } catch (err) {
      toast.error('2FA verification failed');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CHANGE_PASSWORD', currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Password updated!');
        setCurrentPassword('');
        setNewPassword('');
      } else {
        toast.error(data.error || 'Failed to update password');
      }
    } catch (err) {
      toast.error('Password change error');
    }
  };

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 6) {
      toast.error('PIN must be 6 digits');
      return;
    }
    try {
      const res = await fetch('/api/auth/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CHANGE_PIN', currentPin, newPin }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'PIN updated!');
        setCurrentPin('');
        setNewPin('');
        loadSecurity();
      } else {
        toast.error(data.error || 'Failed to update PIN');
      }
    } catch (err) {
      toast.error('PIN change error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Security & Device Control</h1>
        <p className="text-xs text-slate-400">
          Manage two-factor authentication, cryptographic PIN authorization, and inspect active sign-in sessions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: 2FA TOTP */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Google Authenticator (2FA)</h3>
              </div>
              <span
                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                  securityData?.twoFactorEnabled
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}
              >
                {securityData?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Require a dynamic 6-digit TOTP code from Google Authenticator or Authy for signing in and high-value transfers.
            </p>

            {qrCodeUrl && (
              <div className="p-4 rounded-2xl bg-white text-center space-y-2">
                <img src={qrCodeUrl} alt="2FA QR Code" className="mx-auto w-40 h-40" />
                <p className="text-[10px] font-mono text-slate-800 break-all">{secretCode}</p>
              </div>
            )}
          </div>

          {qrCodeUrl ? (
            <form onSubmit={handleVerify2FA} className="space-y-2">
              <input
                type="text"
                maxLength={6}
                required
                placeholder="Enter 6-digit code"
                value={totpInput}
                onChange={(e) => setTotpInput(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-center font-mono text-sm text-cyan-400"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-xs font-bold shadow-md"
              >
                Verify & Activate 2FA
              </button>
            </form>
          ) : !securityData?.twoFactorEnabled ? (
            <button
              onClick={handleGenerate2FA}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-xs font-bold shadow-md"
            >
              Setup Two-Factor Authentication
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs text-center font-bold">
              ✅ 2FA Protection Active
            </div>
          )}
        </div>

        {/* Card 2: 6-Digit Transfer PIN */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center space-x-2">
            <KeyRound className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Transfer PIN Authorization</h3>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Your 6-digit numeric PIN is required before sending money or executing withdrawals.
          </p>

          <form onSubmit={handleUpdatePin} className="space-y-3">
            {securityData?.hasPin && (
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400">Current PIN</label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  placeholder="••••••"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white"
                />
              </div>
            )}

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400">New 6-Digit PIN</label>
              <input
                type="password"
                maxLength={6}
                required
                placeholder="123456"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-white/10 transition-all"
            >
              Update Transfer PIN
            </button>
          </form>
        </div>
      </div>

      {/* Security Audit Logs */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/10 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white">Recent Security & Login Telemetry</h3>

        <div className="divide-y divide-white/5">
          {securityData?.securityLogs?.map((log: any) => (
            <div key={log.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
                  <Monitor className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white">
                    {log.event.replace(/_/g, ' ')} • <span className="font-normal text-slate-400">{log.browser} on {log.os}</span>
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    IP: {log.ipAddress} • {log.location}
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-slate-400">{new Date(log.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
