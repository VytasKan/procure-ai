'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/frontend/components/Header';
import { MetricsBar } from '@/frontend/components/MetricsBar';
import { AgentChat } from '@/frontend/components/AgentChat';
import { LedgerGrid } from '@/frontend/components/LedgerGrid';
import { LedgerTransaction } from '@/backend/types';
import { Cpu, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const [metrics, setMetrics] = useState({
    totalSpend: 0,
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    b2bSavingsEstimated: 0
  });
  const [isLoadingLedger, setIsLoadingLedger] = useState(false);

  const fetchLedger = useCallback(async () => {
    setIsLoadingLedger(true);
    try {
      const res = await fetch('/api/ledger');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
        setMetrics(data.metrics || {
          totalSpend: 0,
          totalOrders: 0,
          completedOrders: 0,
          pendingOrders: 0,
          b2bSavingsEstimated: 0
        });
      }
    } catch (err) {
      console.error('Failed to load ledger data:', err);
    } finally {
      setIsLoadingLedger(false);
    }
  }, []);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Spend & Activity KPIs */}
        <MetricsBar metrics={metrics} />

        {/* Core Workspace: Agent Console & Live Ledger */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Conversational Purchasing Agent */}
          <div className="lg:col-span-5">
            <AgentChat onOrderExecuted={fetchLedger} />
          </div>

          {/* Right Column: AG Grid Ledger & Technical Transparency */}
          <div className="lg:col-span-7 space-y-6">
            <LedgerGrid
              transactions={transactions}
              isLoading={isLoadingLedger}
              onRefresh={fetchLedger}
            />

            {/* Technical Integration Highlights */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-sky-400" />
                <span>Architecture & Hackathon Track Alignment</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="font-semibold text-blue-400 flex items-center justify-between">
                    <span>PayPal AI Toolkit</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <p className="text-slate-400 text-[11px] mt-1">
                    Uses `@paypal/agent-toolkit` actions: `create_order`, `create_invoice`, and `get_shipment_tracking`.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="font-semibold text-emerald-400 flex items-center justify-between">
                    <span>AG Grid Integration</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <p className="text-slate-400 text-[11px] mt-1">
                    Powers the enterprise audit ledger with real-time status binding, sort, filter, and theme customization.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="font-semibold text-purple-400 flex items-center justify-between">
                    <span>Channel3 MCP Catalog</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <p className="text-slate-400 text-[11px] mt-1">
                    Discovers inventory across 100M+ real retailer SKUs to optimize bundles and calculate B2B volume discounts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 mt-8 bg-slate-950/60 text-center text-xs text-slate-500">
        <p>Built for the <strong>Build What&apos;s Next with PayPal and AI</strong> Global Hackathon</p>
      </footer>
    </div>
  );
}
