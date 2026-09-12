'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export function CashFlowChart({ data }: { data?: any[] }) {
  const chartData = data || [
    { name: 'Mon', income: 4200, expense: 2400 },
    { name: 'Tue', income: 3000, expense: 1398 },
    { name: 'Wed', income: 6000, expense: 3800 },
    { name: 'Thu', income: 2780, expense: 1908 },
    { name: 'Fri', income: 5890, expense: 4800 },
    { name: 'Sat', income: 2390, expense: 3800 },
    { name: 'Sun', income: 7490, expense: 2300 },
  ];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#00f2fe" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
          <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#111827',
              borderColor: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontSize: '12px',
              color: '#fff',
            }}
            formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
          />
          <Area
            type="monotone"
            dataKey="income"
            stroke="#00f2fe"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#incomeGrad)"
            name="Income / Deposits"
          />
          <Area
            type="monotone"
            dataKey="expense"
            stroke="#6366f1"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#expenseGrad)"
            name="Spending / Transfers"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SpendingCategoryPieChart({ data }: { data?: any[] }) {
  const chartData = data || [
    { name: 'Transfers & P2P', value: 45, color: '#6366f1' },
    { name: 'Virtual Card Shopping', value: 25, color: '#00f2fe' },
    { name: 'Shared Pots & Escrow', value: 20, color: '#10b981' },
    { name: 'Recurring Subscriptions', value: 10, color: '#f59e0b' },
  ];

  return (
    <div className="w-full h-64 flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="#090d16" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#111827',
              borderColor: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontSize: '12px',
              color: '#fff',
            }}
            formatter={(val: any) => [`${val}%`, 'Allocation']}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-2 w-full pt-2">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center space-x-2 text-[11px] text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
            <span className="truncate">{item.name}</span>
            <span className="font-bold text-slate-400 ml-auto">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
