'use client';

import React from 'react';
import { DollarSign, PackageCheck, TrendingDown, Layers, ArrowUpRight } from 'lucide-react';
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
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      {/* Metric 1: Total Spend */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 relative overflow-hidden backdrop-blur-sm shadow-lg hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Approved Spend</span>
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-black text-white mt-1.5 tracking-tight font-mono">
          {formatCurrency(metrics.totalSpend)}
        </p>
        <span className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
          <span className="text-emerald-400 font-bold">100%</span> PayPal Authorized
        </span>
      </div>

      {/* Metric 2: Total Orders */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 relative overflow-hidden backdrop-blur-sm shadow-lg hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">PO Executed</span>
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-black text-white mt-1.5 tracking-tight font-mono">
          {metrics.totalOrders}
        </p>
        <span className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
          Across verified suppliers
        </span>
      </div>

      {/* Metric 3: Completed & Fulfilled */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 relative overflow-hidden backdrop-blur-sm shadow-lg hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Fulfillment Rate</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <PackageCheck className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-black text-white mt-1.5 tracking-tight font-mono">
          {metrics.completedOrders} <span className="text-sm font-normal text-slate-500">/ {metrics.totalOrders}</span>
        </p>
        <span className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1.5 font-semibold">
          Active carrier tracking synced
        </span>
      </div>

      {/* Metric 4: AI Bulk Savings */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 relative overflow-hidden backdrop-blur-sm shadow-lg hover:border-slate-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">B2B Volume Savings</span>
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-black text-amber-400 mt-1.5 tracking-tight font-mono">
          {formatCurrency(metrics.b2bSavingsEstimated)}
        </p>
        <span className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
          ~8% avg. volume discount
        </span>
      </div>
    </div>
  );
};
