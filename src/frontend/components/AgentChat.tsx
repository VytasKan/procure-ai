'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AgentChatMessage, ProcurementQuote } from '@/backend/types';
import { QuoteApprovalCard } from './QuoteApprovalModal';
import { useToast } from './Toast';
import { Send, Bot, User, Sparkles, Loader2, ChevronDown, ChevronRight, CheckCircle2, Cpu } from 'lucide-react';

interface AgentChatProps {
  onOrderExecuted: () => void;
  externalPrompt?: string;
  onClearExternalPrompt?: () => void;
  currentThreshold: number;
}

const PRESET_PROMPTS = [
  'Equip 3 new engineers: dual 4K monitors, standing desks, docks',
  'Order 2 CalDigit TS4 Thunderbolt 4 docks for executive team',
  'Procure 4 wireless noise-isolating headsets under $250 for sales calls',
  'Find 2 ergonomic mesh office chairs with lumbar support'
];

export const AgentChat: React.FC<AgentChatProps> = ({ 
  onOrderExecuted,
  externalPrompt,
  onClearExternalPrompt,
  currentThreshold
}) => {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<AgentChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `Hello! I am **ProcureAI**, your autonomous B2B purchasing agent.\n\nI search multi-merchant supplier catalogs (Channel3), verify corporate budget policies, negotiate volume discounts, and execute approved orders directly through **PayPal Sandbox** (Orders & Invoicing).\n\nWhat would you like to procure today?`,
      timestamp: new Date().toISOString(),
      reasoningSteps: [
        'Agent Initialized: PayPal Sandbox integration verified via @paypal/agent-toolkit.',
        `Policy Boundary: Auto-approval threshold currently set to $${currentThreshold}.00 USD.`,
        'Catalog Feed: Channel3 normalized retail inventory synchronized across 6 certified vendors.'
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({ 'init-1': false });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (externalPrompt) {
      handleSend(externalPrompt);
      if (onClearExternalPrompt) onClearExternalPrompt();
    }
  }, [externalPrompt]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: AgentChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query })
      });

      if (!res.ok) throw new Error('Failed to reach agent API');
      const data: AgentChatMessage = await res.json();
      setMessages(prev => [...prev, data]);
      setExpandedThoughts(prev => ({ ...prev, [data.id]: true }));
      showToast('Agent reasoning complete', 'Catalog evaluated & PayPal quote prepared', 'info');
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered an error while searching supplier catalogs. Please try again.',
          timestamp: new Date().toISOString()
        }
      ]);
      showToast('Catalog search error', 'Please try again', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveQuote = async (quote: ProcurementQuote) => {
    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote })
      });

      if (!res.ok) throw new Error('Execution failed');
      const data = await res.json();

      setMessages(prev => [
        ...prev,
        {
          id: `exec-${Date.now()}`,
          role: 'assistant',
          content: `✅ **PayPal Authorization Successful!**\n\n• **Reference ID:** \`${data.paypalResult.id}\`\n• **Amount Captured:** $${quote.totalAmount.toFixed(2)} USD\n• **Ledger Entry:** Logged as **${data.transaction.orderNumber}**\n\nThe transaction has been automatically added to your enterprise audit ledger with tracking **${data.transaction.trackingNumber}**.`,
          timestamp: new Date().toISOString()
        }
      ]);

      showToast(
        'PayPal Sandbox Order Captured!', 
        `PO #${data.transaction.orderNumber} • ${data.paypalResult.id}`,
        'success'
      );

      onOrderExecuted();
    } catch (err) {
      console.error(err);
      showToast('Authorization Failed', 'Could not commit transaction to PayPal sandbox', 'warning');
    }
  };

  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-1.5 leading-relaxed text-xs">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1" />;
          
          if (line.startsWith('• ') || line.startsWith('* ')) {
            const text = line.substring(2);
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1 text-slate-200">
                <span className="text-sky-400 font-bold shrink-0">•</span>
                <span>{renderInlineBold(text)}</span>
              </div>
            );
          }

          return <p key={idx}>{renderInlineBold(line)}</p>;
        })}
      </div>
    );
  };

  const renderInlineBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700/80 text-sky-300">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  const toggleThoughts = (id: string) => {
    setExpandedThoughts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col h-[580px] shadow-2xl backdrop-blur-sm overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 p-[1.5px] shadow-md shadow-blue-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Bot className="w-4 h-4 text-sky-400" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Autonomous Procurement Agent</h3>
            <p className="text-[11px] text-slate-400">Multi-Agent Commerce Engine with Human-in-the-Loop Safety</p>
          </div>
        </div>

        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/80 shadow-sm">
          Guardrail: Max ${currentThreshold} auto-approve
        </span>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <div className={`max-w-[88%] ${
              msg.role === 'user' 
                ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-xs shadow-md shadow-blue-600/20' 
                : 'bg-slate-950/80 text-slate-200 rounded-2xl rounded-tl-sm p-4 text-xs border border-slate-800 shadow-md'
            }`}>
              {/* Optional Expandable Agent Thoughts */}
              {msg.reasoningSteps && msg.reasoningSteps.length > 0 && (
                <div className="mb-3 rounded-lg border border-slate-800/80 bg-slate-900/60 overflow-hidden">
                  <button
                    onClick={() => toggleThoughts(msg.id)}
                    className="w-full px-3 py-1.5 flex items-center justify-between text-[11px] font-medium text-slate-400 hover:text-slate-200 bg-slate-900/80 transition cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-sky-400" />
                      <span>Agent Thought Process ({msg.reasoningSteps.length} steps)</span>
                    </span>
                    {expandedThoughts[msg.id] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>

                  {expandedThoughts[msg.id] && (
                    <div className="p-3 space-y-1.5 text-[11px] font-mono text-slate-300 border-t border-slate-800/60 bg-slate-950/40">
                      {msg.reasoningSteps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{step}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="leading-relaxed">
                {renderFormattedContent(msg.content)}
              </div>

              {/* Embed Quote Approval Card if quote exists */}
              {msg.quote && (
                <QuoteApprovalCard
                  quote={msg.quote}
                  onApprove={handleApproveQuote}
                />
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-slate-950/80 text-slate-300 rounded-2xl rounded-tl-sm px-4 py-3 text-xs border border-slate-800 flex items-center gap-2.5 shadow-md">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              <span className="text-slate-300">Searching Channel3 MCP catalog & compiling PayPal quote...</span>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Suggested Prompts Toolbar */}
      <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/50 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold shrink-0">Prompts:</span>
        {PRESET_PROMPTS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="text-[11px] whitespace-nowrap px-3 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition cursor-pointer shrink-0 shadow-sm"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type procurement request (e.g. 'Equip 3 engineers with dual 4K monitors')..."
            className="flex-1 bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 transition cursor-pointer shadow-md shadow-blue-500/20"
          >
            <span>Run Agent</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
