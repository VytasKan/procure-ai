'use client';

import React from 'react';
import { AgentChat } from './AgentChat';
import { Bot, X, Sparkles, ChevronRight } from 'lucide-react';

interface CopilotSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderExecuted: () => void;
  externalPrompt?: string;
  onClearExternalPrompt?: () => void;
  currentThreshold: number;
}

export const CopilotSidebar: React.FC<CopilotSidebarProps> = ({
  isOpen,
  onClose,
  onOrderExecuted,
  externalPrompt,
  onClearExternalPrompt,
  currentThreshold
}) => {
  if (!isOpen) return null;

  return (
    <aside className="w-[420px] bg-slate-950/95 border-l border-slate-800/80 flex flex-col shrink-0 h-full relative z-30 shadow-2xl backdrop-blur-xl animate-in slide-in-from-right-4 duration-200">
      {/* Sidebar Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/90">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 p-[1.5px] shadow-md shadow-blue-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Bot className="w-4 h-4 text-sky-400" />
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>ProcureAI Copilot</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <p className="text-[10px] text-slate-400">Autonomous PayPal Purchasing Agent</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          title="Collapse Copilot Sidebar"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Embedded Chat */}
      <div className="flex-1 overflow-hidden p-3">
        <AgentChat
          onOrderExecuted={onOrderExecuted}
          externalPrompt={externalPrompt}
          onClearExternalPrompt={onClearExternalPrompt}
          currentThreshold={currentThreshold}
        />
      </div>
    </aside>
  );
};
