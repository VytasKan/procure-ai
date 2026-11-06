'use client';

import React from 'react';
import { Bot, Sparkles, Building2, ShieldCheck, Zap } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
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
            <p className="text-[11px] text-slate-400 font-medium">Autonomous Commercial Procurement & PayPal Settlement</p>
          </div>
        </div>

        {/* Live Badges & System State */}
        <div className="flex items-center space-x-2.5">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs shadow-inner">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-200 font-semibold">Acme Tech Labs</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 font-mono text-[11px] font-semibold">Auto-Limit: $350.00</span>
          </div>

          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300 font-semibold text-[11px]">PayPal Sandbox Active</span>
          </div>

          <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-[11px] font-semibold text-indigo-300">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>@paypal/agent-toolkit</span>
          </div>
        </div>
      </div>
    </header>
  );
};
