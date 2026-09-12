'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Snowflake,
  User,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { getStatusBadgeClass } from '@/lib/utils';
import { toast } from 'sonner';

export default function AdminFraudPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/fraud');
      const data = await res.json();
      setAlerts(data.alerts || []);
    } catch (err) {
      toast.error('Failed to load fraud alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleAction = async (alertId: string, action: 'RESOLVE' | 'DISMISS', freezeUser = false) => {
    try {
      const res = await fetch('/api/admin/fraud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, action, freezeUser }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Alert updated');
        loadAlerts();
      } else {
        toast.error(data.error || 'Failed to update alert');
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">AI & Heuristic Fraud Monitoring</h1>
        <p className="text-xs text-slate-400">
          Surveil real-time velocity anomalies, geographic jumps, and automated high-risk transaction flags.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-rose-400 flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4" />
          <span>Active Flagged Incidents ({alerts.filter((a) => a.status === 'OPEN').length})</span>
        </h3>

        {alerts.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/10 text-center text-xs text-slate-500">
            No fraud incidents or anomalies detected. Platform health optimal! 🛡️
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {alerts.map((alert) => {
              const isOpen = alert.status === 'OPEN';
              return (
                <div
                  key={alert.id}
                  className={`p-6 rounded-3xl border shadow-xl space-y-4 transition-all ${
                    isOpen
                      ? 'bg-slate-900/90 border-rose-500/40 shadow-rose-950/20'
                      : 'bg-slate-900/60 border-white/5 opacity-75'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-bold text-white font-mono">{alert.ruleTriggered}</p>
                          <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(alert.riskScore)}`}>
                            {alert.riskScore} RISK
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Account: @{alert.user?.username} ({alert.user?.email}) • Status: {alert.user?.status}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] text-slate-500">
                      Logged {new Date(alert.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-950/60 p-4 rounded-2xl border border-white/5 leading-relaxed font-mono">
                    {alert.details}
                  </p>

                  {isOpen && (
                    <div className="flex items-center justify-end space-x-2.5 pt-2">
                      <button
                        onClick={() => handleAction(alert.id, 'DISMISS')}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-white/5 transition-all"
                      >
                        Dismiss False Alarm
                      </button>

                      <button
                        onClick={() => handleAction(alert.id, 'RESOLVE', true)}
                        className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-500/25 transition-all flex items-center space-x-1.5"
                      >
                        <Snowflake className="w-3.5 h-3.5" />
                        <span>Freeze User & Mark Resolved</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
