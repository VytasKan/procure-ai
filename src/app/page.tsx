'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/frontend/components/Header';
import { NavRail, ActiveTab } from '@/frontend/components/NavRail';
import { MetricsBar } from '@/frontend/components/MetricsBar';
import { LedgerGrid } from '@/frontend/components/LedgerGrid';
import { CopilotSidebar } from '@/frontend/components/CopilotSidebar';
import { CatalogView } from '@/frontend/components/CatalogView';
import { PolicyView } from '@/frontend/components/PolicyView';
import { PayPalHubView } from '@/frontend/components/PayPalHubView';
import { SandboxDiagnosticsModal } from '@/frontend/components/SandboxDiagnosticsModal';
import { CatalogBrowserModal } from '@/frontend/components/CatalogBrowserModal';
import { PolicyGuardrailModal } from '@/frontend/components/PolicyGuardrailModal';
import { ToastProvider } from '@/frontend/components/Toast';
import { LedgerTransaction } from '@/backend/types';
import { Cpu, CheckCircle2 } from 'lucide-react';

function DashboardContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('ledger');
  const [isCopilotOpen, setIsCopilotOpen] = useState(true);
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const [metrics, setMetrics] = useState({
    totalSpend: 0,
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    b2bSavingsEstimated: 0
  });
  const [isLoadingLedger, setIsLoadingLedger] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [currentThreshold, setCurrentThreshold] = useState(350);
  const [externalPrompt, setExternalPrompt] = useState<string | undefined>(undefined);

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

  const handleOrderFromCatalog = (productPrompt: string) => {
    setExternalPrompt(productPrompt);
    setIsCopilotOpen(true);
  };

  return (
    <div className="h-screen bg-slate-50 text-slate-900 flex flex-col overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Header
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
        onOpenCatalog={() => setIsCatalogOpen(true)}
        onOpenPolicy={() => setIsPolicyOpen(true)}
        currentThreshold={currentThreshold}
        isCopilotOpen={isCopilotOpen}
        onToggleCopilot={() => setIsCopilotOpen(prev => !prev)}
      />

      {/* Main Workspace with Left Rail & Right Copilot Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Nav Rail */}
        <NavRail
          activeTab={activeTab}
          onTabChange={(t) => setActiveTab(t)}
          isCopilotOpen={isCopilotOpen}
          onToggleCopilot={() => setIsCopilotOpen(prev => !prev)}
          currentThreshold={currentThreshold}
        />

        {/* Center Main Workspace */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* View 1: Settlement Ledger (Centered, Full Width) */}
            {activeTab === 'ledger' && (
              <>
                <MetricsBar metrics={metrics} />

                {/* Centered AG Grid Table */}
                <LedgerGrid
                  transactions={transactions}
                  isLoading={isLoadingLedger}
                  onRefresh={fetchLedger}
                />

                {/* Architecture Highlights Panel */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-blue-600" />
                      <span>Hackathon Sponsor Integrations & Architecture</span>
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium">All systems active</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200">
                      <div className="font-bold text-[#0070ba] flex items-center justify-between text-xs">
                        <span>PayPal AI Toolkit</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0070ba]" />
                      </div>
                      <p className="text-slate-600 text-[11px] mt-1.5 leading-relaxed">
                        Uses official <code className="text-[#0070ba] bg-blue-50 px-1 py-0.5 rounded font-mono">@paypal/agent-toolkit</code> for autonomous <code className="text-slate-800">create_order</code> & <code className="text-slate-800">create_invoice</code> execution.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200">
                      <div className="font-bold text-emerald-700 flex items-center justify-between text-xs">
                        <span>AG Grid Ledger</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <p className="text-slate-600 text-[11px] mt-1.5 leading-relaxed">
                        Enterprise data grid with Quartz light theme, status cell renderers, and live row selection for order manifests.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200">
                      <div className="font-bold text-purple-700 flex items-center justify-between text-xs">
                        <span>Channel3 MCP Catalog</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                      </div>
                      <p className="text-slate-600 text-[11px] mt-1.5 leading-relaxed">
                        Searches 100M+ real retailer SKUs across authorized suppliers with B2B volume pricing and delivery schedules.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* View 2: Channel3 Catalog View */}
            {activeTab === 'catalog' && (
              <CatalogView onOrderProduct={handleOrderFromCatalog} />
            )}

            {/* View 3: Policy Guardrails View */}
            {activeTab === 'policy' && (
              <PolicyView
                currentThreshold={currentThreshold}
                onUpdateThreshold={(t) => setCurrentThreshold(t)}
              />
            )}

            {/* View 4: PayPal Developer Hub View */}
            {activeTab === 'paypal' && (
              <PayPalHubView />
            )}
          </div>
        </main>

        {/* Right Docked AI Copilot Sidebar */}
        <CopilotSidebar
          isOpen={isCopilotOpen}
          onClose={() => setIsCopilotOpen(false)}
          onOrderExecuted={fetchLedger}
          externalPrompt={externalPrompt}
          onClearExternalPrompt={() => setExternalPrompt(undefined)}
          currentThreshold={currentThreshold}
        />
      </div>

      {/* Modals & Dialogs */}
      <SandboxDiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
      />

      <CatalogBrowserModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        onSelectProduct={(prompt) => {
          setExternalPrompt(prompt);
          setIsCopilotOpen(true);
        }}
      />

      <PolicyGuardrailModal
        isOpen={isPolicyOpen}
        onClose={() => setIsPolicyOpen(false)}
        currentThreshold={currentThreshold}
        onUpdateThreshold={(newT) => setCurrentThreshold(newT)}
      />
    </div>
  );
}

export default function Home() {
  return (
    <ToastProvider>
      <DashboardContent />
    </ToastProvider>
  );
}
