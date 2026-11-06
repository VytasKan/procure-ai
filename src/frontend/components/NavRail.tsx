'use client';

import React from 'react';
import { Layers, ShoppingBag, ShieldAlert, Terminal, Bot, Settings, ChevronRight, Activity } from 'lucide-react';

export type ActiveTab = 'ledger' | 'catalog' | 'policy' | 'paypal';

interface NavRailProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isCopilotOpen: boolean;
  onToggleCopilot: () => void;
  currentThreshold: number;
}

export const NavRail: React.FC<NavRailProps> = ({
  activeTab,
  onTabChange,
  isCopilotOpen,
  onToggleCopilot,
  currentThreshold
}) => {
  const navItems = [
    {
      id: 'ledger' as ActiveTab,
      label: 'Settlement Ledger',
      description: 'AG Grid audit trail & settlement',
      icon: Layers,
      badge: 'Live'
    },
    {
      id: 'catalog' as ActiveTab,
      label: 'Catalog Intelligence',
      description: 'Channel3 100M+ retail SKUs',
      icon: ShoppingBag,
      badge: 'MCP'
    },
    {
      id: 'policy' as ActiveTab,
      label: 'Policy Guardrails',
      description: `Cap: $${currentThreshold} auto-approve`,
      icon: ShieldAlert,
      badge: `$${currentThreshold}`
    },
    {
      id: 'paypal' as ActiveTab,
      label: 'PayPal Sandbox Hub',
      description: 'REST APIs & Developer Tools',
      icon: Terminal,
      badge: 'Active'
    }
  ];

  return (
    <aside className="w-64 bg-slate-950/90 border-r border-slate-800/80 flex flex-col justify-between shrink-0 p-3 h-full">
      {/* Navigation Links */}
      <div className="space-y-6">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2 block">
            Navigation
          </span>
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
                    isActive
                      ? 'bg-blue-600/10 text-white border border-blue-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                    <div>
                      <div className="leading-none">{item.label}</div>
                      <span className="text-[10px] text-slate-500 font-normal mt-0.5 block">
                        {item.description}
                      </span>
                    </div>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-blue-500/20 text-sky-300' : 'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* AI Copilot Quick Launcher */}
        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-900/20 via-slate-900 to-indigo-950/30 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center text-sky-400">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-white">AI Procurement Copilot</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
            Autonomous agent ready to parse specs, compare prices, and execute via PayPal Sandbox.
          </p>
          <button
            onClick={onToggleCopilot}
            className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm ${
              isCopilotOpen 
                ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/20' 
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <span>{isCopilotOpen ? 'Docked on Right' : 'Open Copilot'}</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Footer Info & System State */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] space-y-1.5">
        <div className="flex items-center justify-between text-slate-400">
          <span>Sandbox Gateway</span>
          <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Connected
          </span>
        </div>
        <div className="flex justify-between text-slate-500 text-[10px]">
          <span>Company: Acme Tech Labs</span>
          <span className="font-mono">v1.2</span>
        </div>
      </div>
    </aside>
  );
};
