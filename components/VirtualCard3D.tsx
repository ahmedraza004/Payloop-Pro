'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Snowflake, Flame, Cpu, Wifi, ShoppingBag, Check, Copy } from 'lucide-react';
import { maskCardNumber } from '@/lib/utils';
import { toast } from 'sonner';

interface VirtualCard3DProps {
  card: any;
  onToggleFreeze?: (cardId: string, currentStatus: string) => void;
  onSwipeTest?: (cardId: string) => void;
}

export default function VirtualCard3D({ card, onToggleFreeze, onSwipeTest }: VirtualCard3DProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const getSkinStyles = (skin: string) => {
    switch (skin) {
      case 'PLATINUM_CARBON':
        return 'from-slate-900 via-neutral-900 to-zinc-800 border-zinc-700/50 text-slate-100 shadow-zinc-950/50';
      case 'GOLD_LUXURY':
        return 'from-amber-900 via-yellow-950 to-amber-800 border-amber-500/40 text-amber-100 shadow-amber-950/50';
      case 'EMERALD_MATRIX':
        return 'from-emerald-950 via-teal-950 to-emerald-900 border-emerald-500/40 text-emerald-100 shadow-emerald-950/50';
      case 'NEON_CYAN':
      default:
        return 'from-indigo-950 via-slate-900 to-cyan-950 border-cyan-500/30 text-cyan-100 shadow-cyan-950/50';
    }
  };

  const handleCopyNumber = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(card.cardNumber.replace(/\s+/g, ''));
    setCopied(true);
    toast.success('Card number copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const isFrozen = card.status === 'FROZEN';

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* 3D Perspective Card Container */}
      <div
        className="perspective-1000 w-full max-w-sm h-56 cursor-pointer select-none group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`relative w-full h-full duration-500 transform-style-preserve-3d transition-transform ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT OF CARD */}
          <div
            className={`absolute inset-0 w-full h-full rounded-3xl p-6 bg-gradient-to-br ${getSkinStyles(
              card.cardSkin
            )} border backdrop-blur-xl shadow-2xl flex flex-col justify-between backface-hidden overflow-hidden ${
              isFrozen ? 'grayscale opacity-75' : ''
            }`}
          >
            {/* Frozen Overlay */}
            {isFrozen && (
              <div className="absolute inset-0 bg-cyan-950/60 backdrop-blur-sm flex items-center justify-center z-20">
                <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-xs font-bold tracking-widest uppercase">
                  <Snowflake className="w-4 h-4 animate-spin" />
                  <span>CARD FROZEN</span>
                </div>
              </div>
            )}

            {/* Glowing Accent Lines */}
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />

            {/* Card Header */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center space-x-2">
                <span className="text-base font-black tracking-wider text-white">PayLoop</span>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-white/10 text-white border border-white/20">
                  {card.cardSkin.replace('_', ' ')}
                </span>
              </div>
              <Wifi className="w-5 h-5 text-slate-400" />
            </div>

            {/* EMV Chip */}
            <div className="flex items-center space-x-3 z-10">
              <div className="w-11 h-8 rounded-lg bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 border border-amber-600/40 shadow-inner flex items-center justify-center relative overflow-hidden">
                <div className="w-full h-0.5 bg-amber-800/30 absolute" />
                <div className="h-full w-0.5 bg-amber-800/30 absolute" />
                <Cpu className="w-4 h-4 text-amber-900/60" />
              </div>
            </div>

            {/* Card Number */}
            <div className="z-10 flex items-center justify-between">
              <span className="font-mono text-lg sm:text-xl font-bold tracking-widest text-white drop-shadow">
                {revealed ? card.cardNumber : maskCardNumber(card.cardNumber)}
              </span>
              <button
                type="button"
                onClick={handleCopyNumber}
                className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                title="Copy Number"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Card Footer */}
            <div className="flex items-end justify-between z-10">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block">CARD HOLDER</span>
                <span className="text-xs font-bold text-white tracking-wider">{card.cardHolder}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block text-right">EXPIRES</span>
                <span className="text-xs font-mono font-bold text-white tracking-wider">
                  {String(card.expiryMonth).padStart(2, '0')}/{String(card.expiryYear).slice(-2)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-black italic tracking-wider text-white">
                  {card.cardType || 'VISA'}
                </span>
              </div>
            </div>
          </div>

          {/* BACK OF CARD */}
          <div
            className={`absolute inset-0 w-full h-full rounded-3xl p-6 bg-gradient-to-br ${getSkinStyles(
              card.cardSkin
            )} border backdrop-blur-xl shadow-2xl flex flex-col justify-between rotate-y-180 backface-hidden overflow-hidden`}
          >
            {/* Magnetic Stripe */}
            <div className="-mx-6 -mt-1 h-10 bg-black/90 border-y border-white/5" />

            {/* CVV Panel */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] text-slate-400 px-1">
                <span>AUTHORIZED SIGNATURE</span>
                <span>SECURITY CODE (CVV)</span>
              </div>
              <div className="flex items-center h-9 bg-slate-800/80 rounded-xl px-3 justify-between border border-white/10">
                <span className="text-[11px] text-slate-400 font-mono italic">Not valid unless signed</span>
                <span className="font-mono font-bold text-white bg-slate-950 px-2 py-0.5 rounded border border-white/20">
                  {revealed ? card.cvv : '•••'}
                </span>
              </div>
            </div>

            {/* Back Notice */}
            <div className="text-[9px] text-slate-400 leading-tight">
              Issued by PayLoop Pro Fintech Partner Bank pursuant to license by Visa/Mastercard International. Click to flip.
            </div>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center space-x-2 w-full max-w-sm justify-between pt-1">
        <button
          onClick={() => setRevealed(!revealed)}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white border border-white/10 flex items-center justify-center space-x-1.5 transition-all"
        >
          {revealed ? <EyeOff className="w-3.5 h-3.5 text-cyan-400" /> : <Eye className="w-3.5 h-3.5 text-cyan-400" />}
          <span>{revealed ? 'Hide Details' : 'Reveal Details'}</span>
        </button>

        {onToggleFreeze && (
          <button
            onClick={() => onToggleFreeze(card.id, card.status)}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center space-x-1.5 transition-all ${
              isFrozen
                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
            }`}
          >
            {isFrozen ? <Flame className="w-3.5 h-3.5" /> : <Snowflake className="w-3.5 h-3.5" />}
            <span>{isFrozen ? 'Unfreeze Card' : 'Freeze Card'}</span>
          </button>
        )}

        {onSwipeTest && !isFrozen && (
          <button
            onClick={() => onSwipeTest(card.id)}
            className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/25 flex items-center space-x-1.5 transition-all"
            title="Simulate Merchant Checkout"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Test Swipe</span>
          </button>
        )}
      </div>
    </div>
  );
}
