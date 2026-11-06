'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AgentChatMessage, ProcurementQuote } from '@/backend/types';
import { QuoteApprovalCard } from './QuoteApprovalModal';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';

interface AgentChatProps {
  onOrderExecuted: () => void;
}

const PRESET_PROMPTS = [
  'Equip 3 new engineers: dual 4K monitors, standing desks, docks (Austin office)',
  'Order 2 CalDigit TS4 Thunderbolt 4 docks for executive team',
  'Procure 4 wireless noise-isolating headsets under $250 for sales calls',
  'Find 2 ergonomic mesh office chairs with lumbar support'
];

export const AgentChat: React.FC<AgentChatProps> = ({ onOrderExecuted }) => {
  const [messages, setMessages] = useState<AgentChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `Hello! I am **ProcureAI**, your autonomous B2B purchasing agent.\n\nI can search multi-vendor catalogs (Channel3), verify company spending limits, calculate bulk discounts, and execute approved orders directly through **PayPal Sandbox** (Orders & Invoicing).\n\nWhat would you like to procure today?`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
          content: `✅ **PayPal Authorization Successful!**\n\n• **Reference ID:** \`${data.paypalResult.id}\`\n• **Amount Captured:** $${quote.totalAmount.toFixed(2)} USD\n• **Ledger Entry:** Logged as **${data.transaction.orderNumber}**\n\nThe transaction has been automatically added to your enterprise audit ledger below.`,
          timestamp: new Date().toISOString()
        }
      ]);

      onOrderExecuted();
    } catch (err) {
      console.error(err);
      alert('Failed to execute PayPal order. Check console.');
    }
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl flex flex-col h-[600px] shadow-xl overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Autonomous Procurement Agent</h3>
            <p className="text-[11px] text-slate-400">Powered by `@paypal/agent-toolkit` & Channel3 Catalog</p>
          </div>
        </div>

        <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          Guardrail Active: Max $350 auto-approve
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
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-sky-400 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-[85%] ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-xs' : 'bg-slate-800/80 text-slate-200 rounded-2xl rounded-tl-sm p-4 text-xs border border-slate-700/60'}`}>
              <div className="whitespace-pre-wrap leading-relaxed">
                {msg.content}
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
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-800/80 text-slate-300 rounded-2xl rounded-tl-sm px-4 py-3 text-xs border border-slate-700/60 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              <span>Searching supplier catalogs & evaluating B2B pricing...</span>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Suggested Prompts */}
      <div className="px-4 py-2 border-t border-slate-800/60 bg-slate-950/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold shrink-0">Suggestions:</span>
        {PRESET_PROMPTS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer shrink-0"
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
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 transition cursor-pointer"
          >
            <span>Run Agent</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
