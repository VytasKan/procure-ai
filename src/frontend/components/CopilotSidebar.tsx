'use client';

import React from 'react';
import { AgentChat } from './AgentChat';
import { Shield, X } from 'lucide-react';

import { LedgerTransaction } from '@/backend/types';

interface CopilotSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderExecuted: () => void;
  externalPrompt?: string;
  onClearExternalPrompt?: () => void;
  currentThreshold: number;
  enforceCollateral?: boolean;
  autoSlaSlashing?: boolean;
  transactions?: LedgerTransaction[];
}

export const CopilotSidebar: React.FC<CopilotSidebarProps> = ({
  isOpen,
  onClose,
  onOrderExecuted,
  externalPrompt,
  onClearExternalPrompt,
  currentThreshold,
  enforceCollateral = true,
  autoSlaSlashing = true,
  transactions = []
}) => {
  if (!isOpen) return null;

  return (
    <aside className="w-[420px] bg-white border-l border-slate-200 flex flex-col shrink-0 h-full relative z-30 shadow-xl duration-200">
      {/* Sidebar Header */}
      <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>ProcureAI Buyer Console</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </h3>
            <p className="text-[10px] text-slate-500 font-mono">agent://treasury-prime.eth</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
          title="Collapse Buyer Console"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Embedded Chat */}
      <div className="flex-1 overflow-hidden">
        <AgentChat
          onOrderExecuted={onOrderExecuted}
          externalPrompt={externalPrompt}
          onClearExternalPrompt={onClearExternalPrompt}
          currentThreshold={currentThreshold}
          enforceCollateral={enforceCollateral}
          autoSlaSlashing={autoSlaSlashing}
          transactions={transactions}
        />
      </div>
    </aside>
  );
};
