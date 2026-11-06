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
              <div key={idx} className="flex items-start gap-1.5 pl-1 text-slate-700">
                <span className="text-[#0070ba] font-bold shrink-0">•</span>
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
        return <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[#0070ba]">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  const toggleThoughts = (id: string) => {
    setExpandedThoughts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Secondary Status Sub-header */}
      <div className="px-3.5 py-2 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span>Active Context: Acme Tech Labs</span>
        </div>

        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200 shadow-2xs">
          Cap: ${currentThreshold} auto-approve
        </span>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-slate-50/40">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0070ba] shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <div className={`max-w-[90%] ${
              msg.role === 'user' 
                ? 'bg-[#0070ba] text-white rounded-2xl rounded-tr-sm px-3.5 py-2 text-xs shadow-xs' 
                : 'bg-white text-slate-800 rounded-2xl rounded-tl-sm p-3.5 text-xs border border-slate-200 shadow-xs'
            }`}>
              {/* Optional Expandable Agent Thoughts */}
              {msg.reasoningSteps && msg.reasoningSteps.length > 0 && (
                <div className="mb-2.5 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
                  <button
                    onClick={() => toggleThoughts(msg.id)}
                    className="w-full px-2.5 py-1.5 flex items-center justify-between text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-slate-100/70 transition cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-[#0070ba]" />
                      <span>Agent Thought Process ({msg.reasoningSteps.length} steps)</span>
                    </span>
                    {expandedThoughts[msg.id] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>

                  {expandedThoughts[msg.id] && (
                    <div className="p-2.5 space-y-1.5 text-[11px] font-mono text-slate-700 border-t border-slate-200 bg-white">
                      {msg.reasoningSteps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
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
              <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0070ba] shrink-0 mt-0.5">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-white text-slate-700 rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-xs border border-slate-200 flex items-center gap-2.5 shadow-xs">
              <Loader2 className="w-4 h-4 animate-spin text-[#0070ba]" />
              <span>Searching Channel3 MCP catalog & compiling PayPal quote...</span>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Suggested Prompts Toolbar */}
      <div className="px-3 py-2 border-t border-slate-200 bg-white flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold shrink-0">Prompts:</span>
        {PRESET_PROMPTS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 transition cursor-pointer shrink-0"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-slate-200 bg-white">
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
            placeholder="Type procurement request (e.g. 'Equip 3 engineers')..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-3.5 py-2 rounded-xl bg-[#0070ba] hover:bg-[#003087] text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 transition cursor-pointer shadow-xs"
          >
            <span>Run Agent</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
