import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCompactNumber(number: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(number);
}

export function generateReference(prefix = 'TXN'): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${timestamp}-${random}`;
}

export function generateWalletNumber(): string {
  const p1 = Math.floor(1000 + Math.random() * 9000);
  const p2 = Math.floor(1000 + Math.random() * 9000);
  return `PL-${p1}-${p2}`;
}

export function generateCardNumber(): string {
  const p1 = '4' + Math.floor(100 + Math.random() * 900); // Visa starts with 4
  const p2 = Math.floor(1000 + Math.random() * 9000);
  const p3 = Math.floor(1000 + Math.random() * 9000);
  const p4 = Math.floor(1000 + Math.random() * 9000);
  return `${p1} ${p2} ${p3} ${p4}`;
}

export function generateCVV(): string {
  return Math.floor(100 + Math.random() * 900).toString();
}

export function maskCardNumber(cardNumber: string): string {
  const parts = cardNumber.split(' ');
  if (parts.length === 4) {
    return `•••• •••• •••• ${parts[3]}`;
  }
  return `•••• •••• •••• ${cardNumber.slice(-4)}`;
}

export function getStatusBadgeClass(status: string): string {
  switch (status?.toUpperCase()) {
    case 'COMPLETED':
    case 'APPROVED':
    case 'ACTIVE':
    case 'SUCCESS':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'PENDING':
    case 'PROCESSING':
    case 'HOLDING':
    case 'INVESTIGATING':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'FAILED':
    case 'REJECTED':
    case 'BLOCKED':
    case 'FROZEN':
    case 'CANCELLED':
    case 'HIGH':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    case 'MEDIUM':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'LOW':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
}
