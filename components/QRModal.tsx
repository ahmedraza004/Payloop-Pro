'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, QrCode, Scan, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  wallets: any[];
}

export default function QRModal({ isOpen, onClose, user, wallets }: QRModalProps) {
  const router = useRouter();
  const [tab, setTab] = useState<'my_qr' | 'scan'>('my_qr');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [scanInput, setScanInput] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const wallet = wallets?.[0] || { walletNumber: 'PL-0000-0000' };

  // QR Payload
  const qrPayload = JSON.stringify({
    type: 'PAYLOOP_PAYMENT_V2',
    recipient: user?.username || 'user',
    walletNumber: wallet.walletNumber,
    amount: amount ? parseFloat(amount) : null,
    note: note || null,
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(wallet.walletNumber);
    setCopied(true);
    toast.success('Wallet number copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProcessScanned = () => {
    if (!scanInput) {
      toast.error('Please enter or scan a QR payload');
      return;
    }

    try {
      let parsed = JSON.parse(scanInput);
      if (parsed.recipient) {
        onClose();
        router.push(
          `/dashboard/transfer?to=${parsed.recipient}&amount=${parsed.amount || ''}&note=${encodeURIComponent(
            parsed.note || ''
          )}`
        );
        return;
      }
    } catch (e) {
      // Plain text username or wallet
      onClose();
      router.push(`/dashboard/transfer?to=${scanInput.trim()}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-[#111827] border border-white/10 p-6 shadow-2xl relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab Header */}
        <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-white/5 mb-6 max-w-xs mx-auto">
          <button
            onClick={() => setTab('my_qr')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
              tab === 'my_qr'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>My QR Code</span>
          </button>
          <button
            onClick={() => setTab('scan')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
              tab === 'scan'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Scan className="w-3.5 h-3.5" />
            <span>Scan / Input</span>
          </button>
        </div>

        {tab === 'my_qr' ? (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-3xl inline-block shadow-xl shadow-cyan-500/10 border-4 border-white/10">
              <QRCodeSVG
                value={qrPayload}
                size={180}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: user?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=payloop',
                  x: undefined,
                  y: undefined,
                  height: 32,
                  width: 32,
                  excavate: true,
                }}
              />
            </div>

            <div className="flex flex-col items-center">
              <span className="text-sm font-bold text-white">@{user?.username}</span>
              <button
                onClick={handleCopy}
                className="mt-1 inline-flex items-center space-x-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20"
              >
                <span>{wallet.walletNumber}</span>
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Optional Request Amount inputs */}
            <div className="grid grid-cols-2 gap-2 text-left pt-2">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400">Custom Amount ($)</label>
                <input
                  type="number"
                  placeholder="e.g. 50.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400">Memo / Note</label>
                <input
                  type="text"
                  placeholder="e.g. Lunch"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Other PayLoop Pro users can scan this QR code to transfer money directly into your account instantly.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-full h-44 rounded-2xl bg-slate-900/90 border border-dashed border-cyan-500/40 flex flex-col items-center justify-center p-4 relative overflow-hidden">
              <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-2 animate-pulse">
                <Scan className="w-8 h-8" />
              </div>
              <p className="text-xs font-semibold text-slate-300">Live Camera QR Scanner Active</p>
              <p className="text-[10px] text-slate-500 mt-1">Or paste decoded QR code payload / wallet handle below</p>
            </div>

            <div className="text-left">
              <label className="text-xs font-semibold text-slate-300 mb-1 block">
                QR Payload or Recipient (@username / PL-XXXX-XXXX)
              </label>
              <textarea
                rows={3}
                placeholder='e.g. {"type":"PAYLOOP_PAYMENT_V2","recipient":"alice","amount":50}'
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              onClick={handleProcessScanned}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center space-x-2"
            >
              <span>Proceed to Transfer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
