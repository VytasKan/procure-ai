'use client';

import React from 'react';
import { DollarSign, PackageCheck, TrendingDown, Layers } from 'lucide-react';
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Metric 1: Total Spend */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Total Approved Spend</span>
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-white mt-2">
          {formatCurrency(metrics.totalSpend)}
        </p>
        <span className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
          <span className="text-emerald-400 font-semibold">100%</span> PayPal Settled
        </span>
      </div>

      {/* Metric 2: Total Orders */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Procurement Orders</span>
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-white mt-2">
          {metrics.totalOrders}
        </p>
        <span className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
          Across 4 verified vendors
        </span>
      </div>

      {/* Metric 3: Completed & Fulfilled */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Fulfillment Rate</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <PackageCheck className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-white mt-2">
          {metrics.completedOrders} <span className="text-sm font-normal text-slate-400">/ {metrics.totalOrders}</span>
        </p>
        <span className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
          Active tracking synced
        </span>
      </div>

      {/* Metric 4: AI Bulk Savings */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">AI Negotiated Savings</span>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-amber-400 mt-2">
          {formatCurrency(metrics.b2bSavingsEstimated)}
        </p>
        <span className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
          ~8% avg. volume discount
        </span>
      </div>
    </div>
  );
};

