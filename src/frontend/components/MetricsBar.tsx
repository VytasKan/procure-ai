'use client';

import React from 'react';
import { formatCurrency } from '../utils/formatters';
import { CheckCircle2, Lock, RotateCcw, ShieldCheck, Calendar } from 'lucide-react';

interface MetricsBarProps {
  metrics: {
    totalSettled: number;
    directSettled: number;
    escrowLocked: number;
    disputedRefunded: number;
    activeEscrowCount: number;
    completedCount: number;
    totalContracts: number;
    avgTrustScore: number;
  };
  timeframe: '7d' | '30d' | 'mtd' | 'all';
  onTimeframeChange: (tf: '7d' | '30d' | 'mtd' | 'all') => void;
  currentThreshold: number;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({
  metrics,
  timeframe,
  onTimeframeChange,
  currentThreshold
}) => {
  const timeframeLabels: Record<string, string> = {
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    'mtd': 'Month to Date',
    'all': 'All Time'
  };

  return (
    <div className="mb-6 space-y-3">
      {/* Time Horizon Selector & Horizon Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold text-slate-800">Agent Clearing Horizon</span>
          <span className="text-slate-300">•</span>
          <span className="text-xs font-medium text-slate-500">{timeframeLabels[timeframe]}</span>
        </div>

        {/* Segmented Switcher */}
        <div className="inline-flex items-center gap-0.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 shadow-2xs">
          {(['7d', '30d', 'mtd', 'all'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                timeframe === tf
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tf === '7d' && '7 Days'}
              {tf === '30d' && '30 Days'}
              {tf === 'mtd' && 'MTD'}
              {tf === 'all' && 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-4 gap-4">
        {/* Metric 1: Direct Settled (High-Trust Instant Pay) */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Direct Settled (Trusted)
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          </div>

          <div className="my-2.5 flex items-baseline justify-between gap-3">
            <span className="text-2xl font-bold text-slate-900 tracking-tight font-mono whitespace-nowrap">
              {formatCurrency(metrics.totalSettled)}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md text-emerald-700 bg-emerald-50 shrink-0">
              Instant Capture
            </span>
          </div>

          <div className="text-xs text-slate-500 flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100">
            <span className="whitespace-nowrap shrink-0">
              {metrics.completedCount} contracts cleared
            </span>
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
              Score &ge; {currentThreshold} Verified
            </span>
          </div>
        </div>

        {/* Metric 2: Locked in PayPal Escrow */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Locked in PayPal Escrow
            </span>
            <Lock className="w-4 h-4 text-amber-500 shrink-0" />
          </div>

          <div className="my-2.5 flex items-baseline justify-between gap-3">
            <span className="text-2xl font-bold text-amber-900 tracking-tight font-mono whitespace-nowrap">
              {formatCurrency(metrics.escrowLocked)}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md text-amber-800 bg-amber-50 shrink-0">
              Authorize Hold
            </span>
          </div>

          <div className="text-xs text-slate-500 flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100">
            <span className="whitespace-nowrap shrink-0">
              {metrics.activeEscrowCount} pending verification
            </span>
            <span className="text-xs text-amber-700 font-semibold whitespace-nowrap">
              Counterparty Risk Hold
            </span>
          </div>
        </div>

        {/* Metric 3: Restitution / Disputed & Refunded */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Disputed & Refunded
            </span>
            <RotateCcw className="w-4 h-4 text-rose-500 shrink-0" />
          </div>

          <div className="my-2.5 flex items-baseline justify-between gap-3">
            <span className="text-2xl font-bold text-slate-900 tracking-tight font-mono whitespace-nowrap">
              {formatCurrency(metrics.disputedRefunded)}
            </span>
            <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full shrink-0">
              Capital Protected
            </span>
          </div>

          <div className="text-xs text-slate-500 flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100">
            <span className="whitespace-nowrap shrink-0">
              SLA Restitution Executed
            </span>
            <span className="font-semibold text-rose-700 whitespace-nowrap">
              Auto-Refund on Breach
            </span>
          </div>
        </div>

        {/* Metric 4: Trust Router Policy Gate */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Router Due Diligence Gate
            </span>
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
          </div>

          <div className="my-2.5 flex items-baseline justify-between gap-3">
            <span className="text-2xl font-bold text-blue-900 tracking-tight font-mono whitespace-nowrap">
              {currentThreshold}/100
            </span>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded shrink-0">
              Network Active
            </span>
          </div>

          <div className="text-xs text-slate-500 flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100">
            <span className="whitespace-nowrap shrink-0">
              Min. Trust for Direct Pay
            </span>
            <span className="font-semibold text-emerald-700 shrink-0 whitespace-nowrap">
              Avg Score: {metrics.avgTrustScore}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
