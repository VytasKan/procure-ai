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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Executive Metrics Overview */}
        <MetricsBar metrics={metrics} />

        {/* Core Workspace: Agent Console & Live AG Grid Ledger */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Conversational Purchasing Agent (5 Cols) */}
          <div className="lg:col-span-5">
            <AgentChat onOrderExecuted={fetchLedger} />
          </div>

          {/* Right Column: AG Grid Ledger & Architecture Panel (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            <LedgerGrid
              transactions={transactions}
              isLoading={isLoadingLedger}
              onRefresh={fetchLedger}
            />

            {/* Hackathon Architecture & Track Alignment Panel */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-sky-400" />
                  <span>Hackathon Sponsor Integrations & Architecture</span>
                </h4>
                <span className="text-[10px] text-slate-500 font-medium">All systems active</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Track 1: PayPal AI */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 transition">
                  <div className="font-bold text-sky-400 flex items-center justify-between text-xs">
                    <span>PayPal AI Toolkit</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                  </div>
                  <p className="text-slate-400 text-[11px] mt-1.5 leading-relaxed">
                    Uses official <code className="text-sky-300 bg-slate-900 px-1 py-0.5 rounded font-mono">@paypal/agent-toolkit</code> for autonomous <code className="text-slate-300">create_order</code> & <code className="text-slate-300">create_invoice</code> execution.
                  </p>
                </div>

                {/* Track 2: AG Grid */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 transition">
                  <div className="font-bold text-emerald-400 flex items-center justify-between text-xs">
                    <span>AG Grid Ledger</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <p className="text-slate-400 text-[11px] mt-1.5 leading-relaxed">
                    Enterprise data grid with Quartz Dark theme, status cell renderers, and live row selection for order manifests.
                  </p>
                </div>

                {/* Track 3: Channel3 MCP */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 transition">
                  <div className="font-bold text-indigo-400 flex items-center justify-between text-xs">
                    <span>Channel3 MCP Catalog</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <p className="text-slate-400 text-[11px] mt-1.5 leading-relaxed">
                    Searches 100M+ real retailer SKUs across authorized suppliers with B2B volume pricing and delivery schedules.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 mt-8 bg-slate-950/80 text-center text-xs text-slate-500">
        <p>Built for the <strong>Build What&apos;s Next with PayPal and AI</strong> Global Hackathon</p>
      </footer>
    </div>
  );
}
