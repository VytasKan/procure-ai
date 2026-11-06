'use client';

import React from 'react';
import { DollarSign, PackageCheck, TrendingDown, Layers, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface MetricsBarProps {
  metrics: {
    totalSpend: number;
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    b2bSavingsEstimated: number;
  };
}

export const MetricsBar: React.FC<MetricsBarProps> = ({ metrics }) => {
  const budgetLimit = 10000;
  const budgetUsedPct = Math.min(100, Math.round((metrics.totalSpend / budgetLimit) * 100));

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      {/* Metric 1: Total Spend with Budget Progress */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4.5 relative overflow-hidden shadow-xs hover:shadow-sm hover:border-slate-300 transition">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Approved Spend</span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0070ba]">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-black text-slate-900 mt-1.5 tracking-tight font-mono">
          {formatCurrency(metrics.totalSpend)}
        </p>
        <div className="mt-2 space-y-1">
          <div className="flex justify-between text-[10px] text-slate-500 font-medium">
            <span>Monthly Cap: $10,000</span>
            <span className="text-blue-700 font-semibold">{budgetUsedPct}% used</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200">
            <div 
              className="bg-gradient-to-r from-[#0070ba] to-sky-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${budgetUsedPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Metric 2: Total Orders */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4.5 relative overflow-hidden shadow-xs hover:shadow-sm hover:border-slate-300 transition">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">POs Executed</span>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mt-1.5">
          <p className="text-2xl font-black text-slate-900 tracking-tight font-mono">
            {metrics.totalOrders}
          </p>
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>Active</span>
          </span>
        </div>
        <span className="text-[11px] text-slate-500 mt-2 block font-medium">
          Multi-vendor audit stream live
        </span>
      </div>

      {/* Metric 3: Fulfillment Rate */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4.5 relative overflow-hidden shadow-xs hover:shadow-sm hover:border-slate-300 transition">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fulfillment Rate</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <PackageCheck className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-black text-slate-900 mt-1.5 tracking-tight font-mono">
          {metrics.completedOrders} <span className="text-sm font-normal text-slate-400">/ {metrics.totalOrders}</span>
        </p>
        <span className="text-[11px] text-emerald-700 mt-2 flex items-center gap-1.5 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Priority tracking synced</span>
        </span>
      </div>

      {/* Metric 4: AI Bulk Savings */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4.5 relative overflow-hidden shadow-xs hover:shadow-sm hover:border-slate-300 transition">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">B2B Volume Savings</span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-black text-amber-800 mt-1.5 tracking-tight font-mono">
          {formatCurrency(metrics.b2bSavingsEstimated)}
        </p>
        <span className="text-[11px] text-slate-500 mt-2 block font-medium">
          ~8% avg. automated bundle discount
        </span>
      </div>
    </div>
  );
};
