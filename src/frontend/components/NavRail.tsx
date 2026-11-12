'use client';

import React from 'react';
import { Layers, ShoppingBag, ShieldCheck, Terminal, ChevronRight, Zap, LayoutDashboard } from 'lucide-react';

export type ActiveTab = 'catalog' | 'ledger' | 'studio' | 'policy' | 'paypal';

interface NavRailProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isCopilotOpen: boolean;
  onToggleCopilot: () => void;
  currentThreshold: number;
  activePersona: 'buyer' | 'backend';
}

export const NavRail: React.FC<NavRailProps> = ({
  activeTab,
  onTabChange,
  isCopilotOpen,
  onToggleCopilot,
  currentThreshold,
  activePersona
}) => {
  // Tabs for Buyer Agent Portal
  const buyerItems = [
    {
      id: 'catalog' as ActiveTab,
      label: 'Channel3 Sourced Catalog',
      description: 'AG Grid #1: Multi-Merchant Offers',
      icon: ShoppingBag,
      badge: 'Catalog Grid'
    },
    {
      id: 'paypal' as ActiveTab,
      label: 'Agent PayPal Wallet',
      description: 'Vaulted Account & Spend Limits',
      icon: Terminal,
      badge: 'Agent Wallet'
    }
  ];

  // Tabs for ProcureAI Distributor Backend
  const backendItems = [
    {
      id: 'ledger' as ActiveTab,
      label: 'Master Settlement Ledger',
      description: 'AG Grid #2: Two-Sided Accounting',
      icon: Layers,
      badge: 'Audit Ledger'
    },
    {
      id: 'studio' as ActiveTab,
      label: 'AG Studio 3.1 Analytics',
      description: 'Spend, Anomaly & Nudge Bot',
      icon: LayoutDashboard,
      badge: '<AgStudio />'
    },
    {
      id: 'policy' as ActiveTab,
      label: 'Trust & KYB Policies',
      description: `Gate: Score ≥ ${currentThreshold} direct pay`,
      icon: ShieldCheck,
      badge: `≥${currentThreshold}`
    },
    {
      id: 'paypal' as ActiveTab,
      label: 'PayPal Settlement Engine',
      description: 'Authorize, Capture & Refund APIs',
      icon: Terminal,
      badge: 'Orders v2'
    }
  ];

  const currentItems = activePersona === 'buyer' ? buyerItems : backendItems;

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 p-3 h-full">
      {/* Navigation Links */}
      <div className="space-y-4">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 block">
            {activePersona === 'buyer' ? 'Buyer Client Interface' : 'Master Distributor Backend'}
          </span>
          <nav className="space-y-1">
            {currentItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer text-left gap-2 ${
                    isActive
                      ? 'bg-blue-50/80 text-blue-900 border border-blue-200 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <div className="min-w-0 flex-1">
                      <div className="leading-tight truncate">{item.label}</div>
                      <span className="text-[10px] text-slate-400 font-normal mt-0.5 block truncate">
                        {item.description}
                      </span>
                    </div>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold shrink-0 whitespace-nowrap ${
                      isActive ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Persona Context Card (Backend only) */}
        {activePersona === 'backend' && (
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50/80 via-purple-50/40 to-slate-50 border border-indigo-100">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center text-white shrink-0">
                <Layers className="w-3 h-3" />
              </div>
              <span className="text-[11px] font-bold text-slate-900">Master Distributor Ops</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              ProcureAI acts as merchant of record: receives PayPal payments from client agents, fulfills via corporate vendor accounts, and captures spread + affiliate commission.
            </p>
          </div>
        )}
      </div>

      {/* Footer Info & System State */}
      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1">
        <div className="flex items-center justify-between text-slate-600">
          <span>Active Persona</span>
          <span className="font-mono font-bold text-slate-800">
            {activePersona === 'buyer' ? 'Acme Buyer Agent' : 'ProcureAI Distributor'}
          </span>
        </div>
        <div className="flex justify-between text-slate-400 text-[10px]">
          <span>Settlement: PayPal Live</span>
          <span className="font-mono">AG Grid v33</span>
        </div>
      </div>
    </aside>
  );
};
