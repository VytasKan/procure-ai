'use client';

import React from 'react';
import { Bot, Sparkles, ShoppingBag, ShieldAlert, ChevronRight, PanelRightClose, PanelRightOpen } from 'lucide-react';

interface HeaderProps {
  onOpenDiagnostics: () => void;
  onOpenCatalog: () => void;
  onOpenPolicy: () => void;
  currentThreshold: number;
  isCopilotOpen: boolean;
  onToggleCopilot: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDiagnostics,
  onOpenCatalog,
  onOpenPolicy,
  currentThreshold,
  isCopilotOpen,
  onToggleCopilot
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 p-[1.5px] shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                ProcureAI
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                Agentic B2B
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Autonomous Commercial Procurement & PayPal Settlement
            </p>
          </div>
        </div>

        {/* Action Controls & Live State */}
        <div className="flex items-center space-x-2.5">
          {/* Policy Guardrails Button */}
          <button
            onClick={onOpenPolicy}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition cursor-pointer shadow-sm"
            title="Configure spending guardrails"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline font-medium">Policy:</span>
            <span className="text-emerald-400 font-mono font-bold">${currentThreshold}</span>
          </button>

          {/* Catalog Browser Button */}
          <button
            onClick={onOpenCatalog}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/30 text-xs font-semibold text-purple-300 transition cursor-pointer shadow-sm"
            title="Inspect Channel3 multi-merchant catalog"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Channel3 Catalog</span>
          </button>

          {/* PayPal Diagnostics Button */}
          <button
            onClick={onOpenDiagnostics}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-semibold text-emerald-300 transition cursor-pointer shadow-sm"
            title="View PayPal Sandbox connection details"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
            <span>PayPal Sandbox</span>
          </button>

          {/* AI Copilot Toggle Button */}
          <button
            onClick={onToggleCopilot}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-md ${
              isCopilotOpen
                ? 'bg-blue-600 text-white shadow-blue-500/25'
                : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800'
            }`}
            title="Toggle AI Copilot Sidebar"
          >
            {isCopilotOpen ? (
              <>
                <PanelRightClose className="w-3.5 h-3.5" />
                <span>Hide Copilot</span>
              </>
            ) : (
              <>
                <PanelRightOpen className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-white">AI Copilot</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
