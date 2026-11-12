'use client';

import React from 'react';
import { 
  Shield, 
  ShieldAlert, 
  Activity, 
  Bot, 
  Building2, 
  Zap,
  CheckCircle2
} from 'lucide-react';

interface HeaderProps {
  onOpenDiagnostics: () => void;
  onOpenPolicy: () => void;
  currentThreshold: number;
  isCopilotOpen: boolean;
  onToggleCopilot: () => void;
  activePersona: 'buyer' | 'backend' | 'simulation';
  onPersonaChange: (persona: 'buyer' | 'backend' | 'simulation') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDiagnostics,
  onOpenPolicy,
  currentThreshold,
  isCopilotOpen,
  onToggleCopilot,
  activePersona,
  onPersonaChange
}) => {
  return (
    <header className="border-b border-slate-200/90 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-xs">
      <div className="w-full px-3 sm:px-6 h-14 flex items-center justify-between gap-2 sm:gap-4 overflow-hidden">
        
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
            <Shield className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold tracking-tight text-slate-900">
              ProcureAI
            </span>
            <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50/80 px-1.5 sm:px-2 py-0.5 rounded-md border border-blue-200/70 shrink-0">
              Master Distributor
            </span>
            <span className="hidden 2xl:inline-block text-slate-200 font-light">|</span>
            <span className="text-xs text-slate-500 font-normal hidden 2xl:inline-block truncate max-w-xs">
              Autonomous B2B Merchant of Record
            </span>
          </div>
        </div>

        {/* Center: Clean Segmented Mode Switcher */}
        <div className="flex items-center bg-slate-100/90 p-0.5 sm:p-1 rounded-xl border border-slate-200/90 shadow-2xs shrink-0">
          <button
            onClick={() => onPersonaChange('buyer')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activePersona === 'buyer'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bot className={`w-3.5 h-3.5 ${activePersona === 'buyer' ? 'text-blue-600' : 'text-slate-500'}`} />
            <span>Buyer Portal</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold hidden xl:inline-block ${
              activePersona === 'buyer' ? 'bg-blue-50 text-blue-700' : 'bg-slate-200/80 text-slate-500'
            }`}>
              Acme Bot
            </span>
          </button>

          <button
            onClick={() => onPersonaChange('backend')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activePersona === 'backend'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className={`w-3.5 h-3.5 ${activePersona === 'backend' ? 'text-indigo-600' : 'text-slate-500'}`} />
            <span>Backend Ops</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold hidden xl:inline-block ${
              activePersona === 'backend' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-200/80 text-slate-500'
            }`}>
              Settlement
            </span>
          </button>

          <button
            onClick={() => onPersonaChange('simulation')}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activePersona === 'simulation'
                ? 'bg-white text-amber-800 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${activePersona === 'simulation' ? 'text-amber-600 fill-amber-500' : 'text-slate-500'}`} />
            <span>Simulator</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
              activePersona === 'simulation' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200/80 text-slate-500'
            }`}>
              Live
            </span>
          </button>
        </div>

        {/* Right: Status Pill & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Buyer Mode: Daily Cap Widget */}
          {activePersona === 'buyer' && (
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/90 text-xs shrink-0">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Cap:</span>
              <span className="font-mono font-bold text-slate-800">$500</span>
              <span className="text-slate-300">|</span>
              <span className="text-[10px] uppercase font-mono font-bold text-emerald-600">Left:</span>
              <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                $450
              </span>
            </div>
          )}

          {/* Trust Threshold Gate Button (Backend only) */}
          {activePersona === 'backend' && (
            <button
              onClick={onOpenPolicy}
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-50 border border-slate-200/90 text-xs text-slate-600 transition cursor-pointer shadow-2xs shrink-0"
              title="Configure Minimum Counterparty Trust Threshold"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-normal text-slate-500">Gate:</span>
              <span className="font-mono font-bold text-slate-900">&ge; {currentThreshold}</span>
            </button>
          )}

          {/* PayPal Sandbox Status Badge */}
          <button
            onClick={onOpenDiagnostics}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-50/70 hover:bg-emerald-50 border border-emerald-200/80 text-xs font-semibold text-emerald-800 transition cursor-pointer shadow-2xs shrink-0"
            title="View PayPal Sandbox connection details"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">PayPal Sandbox</span>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
              Orders v2
            </span>
          </button>
        </div>

      </div>
    </header>
  );
};
