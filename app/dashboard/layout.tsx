'use client';

import React, { useState, useEffect } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import QRModal from '@/components/QRModal';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [wallets, setWallets] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({ unreadNotifications: 0, pendingRequests: 0 });
  const [loading, setLoading] = useState(true);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setWallets(data.wallets || []);
        setMetrics(data.metrics || {});
      } else {
        router.push('/auth/login');
      }
    } catch (err) {
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-0.5 animate-spin">
            <div className="w-full h-full bg-[#0b0f19] rounded-[14px]" />
          </div>
          <span className="text-xs font-semibold text-slate-400">Loading PayLoop Pro Engine...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex">
      {/* Sidebar */}
      <DashboardSidebar
        user={user}
        unreadCount={metrics.unreadNotifications}
        pendingRequestsCount={metrics.pendingRequests}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <DashboardHeader
          user={user}
          wallets={wallets}
          onOpenQrModal={() => setQrModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Global QR Code Modal */}
      <QRModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        user={user}
        wallets={wallets}
      />
    </div>
  );
}
