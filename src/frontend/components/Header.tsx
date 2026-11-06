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
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-xs">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0070ba] to-blue-600 p-[1px] shadow-sm shadow-blue-500/20">
            <div className="w-full h-full bg-blue-600 rounded-[11px] flex items-center justify-center text-white">
              <Bot className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-black tracking-tight text-slate-900">
                ProcureAI
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Agentic B2B
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Autonomous Commercial Procurement & PayPal Settlement
            </p>
          </div>
        </div>

        {/* Action Controls & Live State */}
        <div className="flex items-center space-x-2.5">
          {/* Policy Guardrails Button */}
          <button
            onClick={onOpenPolicy}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 transition cursor-pointer shadow-xs"
            title="Configure spending guardrails"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden md:inline font-medium">Policy Cap:</span>
            <span className="text-blue-700 font-mono font-bold">${currentThreshold}</span>
          </button>

          {/* Catalog Browser Button */}
          <button
            onClick={onOpenCatalog}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-xs font-semibold text-purple-700 transition cursor-pointer shadow-xs"
            title="Inspect Channel3 multi-merchant catalog"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden sm:inline">Channel3 Catalog</span>
          </button>

          {/* PayPal Diagnostics Button */}
          <button
            onClick={onOpenDiagnostics}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold text-emerald-800 transition cursor-pointer shadow-xs"
            title="View PayPal Sandbox connection details"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-xs" />
            <span>PayPal Sandbox Live</span>
          </button>

          {/* AI Copilot Toggle Button */}
          <button
            onClick={onToggleCopilot}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs ${
              isCopilotOpen
                ? 'bg-[#0070ba] hover:bg-[#003087] text-white shadow-blue-500/20'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
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
                <PanelRightOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>AI Copilot</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
