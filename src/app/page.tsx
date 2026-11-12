'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/frontend/components/Header';
import { NavRail, ActiveTab } from '@/frontend/components/NavRail';
import { MetricsBar } from '@/frontend/components/MetricsBar';
import { LedgerGrid } from '@/frontend/components/LedgerGrid';
import { CopilotSidebar } from '@/frontend/components/CopilotSidebar';
import { CatalogView } from '@/frontend/components/CatalogView';
import { BuyerPortalView } from '@/frontend/components/BuyerPortalView';
import { StudioAnalyticsView } from '@/frontend/components/StudioAnalyticsView';
import { PolicyView } from '@/frontend/components/PolicyView';
import { PayPalHubView } from '@/frontend/components/PayPalHubView';
import { AgentSimulationView } from '@/frontend/components/AgentSimulationView';
import { SandboxDiagnosticsModal } from '@/frontend/components/SandboxDiagnosticsModal';
import { ToastProvider } from '@/frontend/components/Toast';
import { LedgerTransaction, SellerAgentProfile } from '@/backend/types';
import { ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

function DashboardContent() {
  const [activePersona, setActivePersona] = useState<'buyer' | 'backend' | 'simulation'>('buyer');
  const [activeTab, setActiveTab] = useState<ActiveTab>('catalog');
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const [agents, setAgents] = useState<SellerAgentProfile[]>([]);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | 'mtd' | 'all'>('30d');
  const [metrics, setMetrics] = useState({
    totalSettled: 0,
    directSettled: 0,
    escrowLocked: 0,
    disputedRefunded: 0,
    activeEscrowCount: 0,
    completedCount: 0,
    totalContracts: 0,
    avgTrustScore: 84
  });
  const [isLoadingLedger, setIsLoadingLedger] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [currentThreshold, setCurrentThreshold] = useState(75);
  const [enforceCollateral, setEnforceCollateral] = useState(true);
  const [autoSlaSlashing, setAutoSlaSlashing] = useState(true);
  const [externalPrompt, setExternalPrompt] = useState<string | undefined>(undefined);

  const handlePersonaChange = (persona: 'buyer' | 'backend' | 'simulation') => {
    setActivePersona(persona);
    if (persona === 'buyer') {
      setActiveTab('catalog');
      setIsCopilotOpen(false); // In Buyer Portal, the chat is embedded directly inside BuyerPortalView
    } else if (persona === 'backend') {
      setActiveTab('ledger');
      setIsCopilotOpen(false);
    } else {
      setIsCopilotOpen(false);
    }
  };

  const fetchLedger = useCallback(async (selectedTimeframe?: string) => {
    setIsLoadingLedger(true);
    const tf = selectedTimeframe || timeframe;
    try {
      const res = await fetch(`/api/ledger?timeframe=${tf}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
        if (data.agents) setAgents(data.agents);
        setMetrics(data.metrics || {
          totalSettled: 0,
          directSettled: 0,
          escrowLocked: 0,
          disputedRefunded: 0,
          activeEscrowCount: 0,
          completedCount: 0,
          totalContracts: 0,
          avgTrustScore: 84
        });
      }
    } catch (err) {
      console.error('Failed to load ledger data:', err);
    } finally {
      setIsLoadingLedger(false);
    }
  }, [timeframe]);

  const handleTimeframeChange = (newTf: '7d' | '30d' | 'mtd' | 'all') => {
    setTimeframe(newTf);
    fetchLedger(newTf);
  };

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  const handleSelectOfferFromCatalog = (productPrompt: string) => {
    setExternalPrompt(productPrompt);
    setIsCopilotOpen(true);
  };

  const handleOrderExecuted = () => {
    fetchLedger();
    // Prompt buyer that order was executed and offer 1-click switch to Distributor Backend
    setActivePersona('backend');
    setActiveTab('ledger');
    setIsCopilotOpen(false);
  };

  return (
    <div className="h-screen bg-slate-50 text-slate-900 flex flex-col overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Top Header with Persona Switcher */}
      <Header
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
        onOpenPolicy={() => {
          setActivePersona('backend');
          setActiveTab('policy');
        }}
        currentThreshold={currentThreshold}
        isCopilotOpen={isCopilotOpen}
        onToggleCopilot={() => setIsCopilotOpen(prev => !prev)}
        activePersona={activePersona}
        onPersonaChange={handlePersonaChange}
      />

      {/* Main Workspace with Left Rail & Center Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Nav Rail (Only for Distributor Backend operations) */}
        {activePersona === 'backend' && (
          <NavRail
            activeTab={activeTab}
            onTabChange={(t) => setActiveTab(t)}
            isCopilotOpen={isCopilotOpen}
            onToggleCopilot={() => setIsCopilotOpen(prev => !prev)}
            currentThreshold={currentThreshold}
            activePersona={activePersona}
          />
        )}

        {/* Center Main Workspace (Full viewport height without awkward bottom white space) */}
        <main className={`flex-1 overflow-hidden ${activePersona === 'buyer' || activePersona === 'simulation' ? 'p-4 w-full h-[calc(100vh-3.5rem)]' : 'p-6 overflow-y-auto'}`}>
          <div className="h-full">
            {/* View C: Autonomous Multi-Agent Fleet Simulator */}
            {activePersona === 'simulation' && (
              <AgentSimulationView />
            )}

            {/* View A: Buyer Agent Portal (Interactive Chat + My Active Orders + Verified Catalog) */}
            {activePersona === 'buyer' && (
              <BuyerPortalView
                transactions={transactions}
                onRefreshLedger={() => fetchLedger()}
                currentThreshold={currentThreshold}
                enforceCollateral={enforceCollateral}
                autoSlaSlashing={autoSlaSlashing}
                externalPrompt={externalPrompt}
                onClearExternalPrompt={() => setExternalPrompt(undefined)}
                onSelectProductPrompt={(p) => setExternalPrompt(p)}
              />
            )}

            {/* View B: ProcureAI Distributor Backend Operations */}
            {activePersona === 'backend' && activeTab === 'catalog' && (
              <CatalogView 
                onOrderProduct={handleSelectOfferFromCatalog} 
                agents={agents} 
                currentThreshold={currentThreshold}
                enforceCollateral={enforceCollateral}
              />
            )}

            {/* View 2: Step 4 — Procurement Audit & Escrow Ledger Grid (What we bought & settled) */}
            {activePersona === 'backend' && activeTab === 'ledger' && (
              <>
                <MetricsBar
                  metrics={metrics}
                  timeframe={timeframe}
                  onTimeframeChange={handleTimeframeChange}
                  currentThreshold={currentThreshold}
                />

                {/* AG Grid #2: Ledger Grid */}
                <LedgerGrid
                  transactions={transactions}
                  isLoading={isLoadingLedger}
                  onRefresh={() => fetchLedger()}
                />

                {/* Architecture Highlights Panel */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Hackathon Sponsor Alignment & Protocol Architecture</span>
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium">All systems active</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200">
                      <div className="font-bold text-blue-700 flex items-center justify-between text-xs">
                        <span>PayPal Escrow & Refunds</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <p className="text-slate-600 text-[11px] mt-1.5 leading-relaxed">
                        Load-bearing PayPal API execution: conditional escrow hold (<code className="text-blue-700 font-mono">intent: AUTHORIZE</code>), deliverable release (<code className="text-blue-700 font-mono">capture</code>), and dispute restitution (<code className="text-blue-700 font-mono">refund</code>).
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200">
                      <div className="font-bold text-emerald-700 flex items-center justify-between text-xs">
                        <span>Dual AG Grid Architecture</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <p className="text-slate-600 text-[11px] mt-1.5 leading-relaxed">
                        Two distinct AG Grids: <strong>Catalog Grid</strong> for multi-merchant offer qualification, and <strong>Ledger Grid</strong> for broker transaction and carrier tracking audit.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200">
                      <div className="font-bold text-indigo-700 flex items-center justify-between text-xs">
                        <span>Channel3 Discovery Graph</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                      </div>
                      <p className="text-slate-600 text-[11px] mt-1.5 leading-relaxed">
                        Raw multi-merchant commerce discovery reduced into qualified B2B procurement contracts via specialized Procurement Broker Agents.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* View 3: AG Studio Custom Widgets & Analytics */}
            {activePersona === 'backend' && activeTab === 'studio' && (
              <StudioAnalyticsView
                transactions={transactions}
                onOrderProduct={handleSelectOfferFromCatalog}
                onRefreshLedger={() => fetchLedger()}
              />
            )}

            {/* View 4: Trust Router Due Diligence Policy View */}
            {activePersona === 'backend' && activeTab === 'policy' && (
              <PolicyView
                currentThreshold={currentThreshold}
                enforceCollateral={enforceCollateral}
                autoSlaSlashing={autoSlaSlashing}
                onUpdatePolicy={(t, coll, slash) => {
                  setCurrentThreshold(t);
                  setEnforceCollateral(coll);
                  setAutoSlaSlashing(slash);
                }}
              />
            )}

            {/* View 5: PayPal Developer Escrow Hub */}
            {activePersona === 'backend' && activeTab === 'paypal' && (
              <PayPalHubView />
            )}
          </div>
        </main>

        {/* Right Docked AI Buying Console Sidebar (Only shown in backend mode if explicitly toggled) */}
        {activePersona === 'backend' && isCopilotOpen && (
          <CopilotSidebar
            isOpen={isCopilotOpen}
            onClose={() => setIsCopilotOpen(false)}
            onOrderExecuted={handleOrderExecuted}
            externalPrompt={externalPrompt}
            onClearExternalPrompt={() => setExternalPrompt(undefined)}
            currentThreshold={currentThreshold}
            enforceCollateral={enforceCollateral}
            autoSlaSlashing={autoSlaSlashing}
            transactions={transactions}
          />
        )}
      </div>

      {/* Diagnostics Modal */}
      <SandboxDiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
        currentThreshold={currentThreshold}
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
