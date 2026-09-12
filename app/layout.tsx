import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'PayLoop Pro — Next-Gen Global Fintech Platform',
  description:
    'Experience high-speed borderless payments, multi-currency wallets, 3D virtual cards, group shared pots, multi-tier KYC, and AI-powered fraud security.',
  keywords: [
    'Fintech',
    'Wallet',
    'Payment SaaS',
    'Virtual Cards',
    'Stripe Checkout',
    'Escrow Pots',
    'P2P Transfers',
    'KYC Verification',
  ],
  authors: [{ name: 'PayLoop Pro Engineering' }],
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans min-h-screen bg-[#090d16] text-slate-100 antialiased`}>
        {children}
        <Toaster
          position="top-right"
          theme="dark"
          toastOptions={{
            style: {
              background: '#111827',
              color: '#f3f4f6',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            },
          }}
        />
      </body>
    </html>
  );
}
