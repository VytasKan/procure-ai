'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AgentChatMessage, AgentServiceContract, ProductItem, LedgerTransaction } from '@/backend/types';
import { QuoteApprovalCard } from './QuoteApprovalModal';
import { useToast } from './Toast';
import { Send, Bot, User, Sparkles, Loader2, ChevronDown, ChevronRight, CheckCircle2, Cpu, Lock, RotateCcw, Check, X, Truck, ShieldAlert } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface AgentChatProps {
  onOrderExecuted: () => void;
  externalPrompt?: string;
  onClearExternalPrompt?: () => void;
  currentThreshold: number;
  enforceCollateral?: boolean;
  autoSlaSlashing?: boolean;
  transactions?: LedgerTransaction[];
  onContractGenerated?: (contract: AgentServiceContract) => void;
}

const PRESET_PROMPTS = [
  '🚫 Order Herman Miller Aeron chair',
  '🪑 Order Alera Elusion mesh chair ($169.99)',
  '📦 Auto-reorder 30 packs Sharpie S-Gel',
  '🖥️ Quote 5x Dell 4K USB-C monitors',
  '⚠️ Source unverified pens from borntostandout.com'
];

export const AgentChat: React.FC<AgentChatProps> = ({
  onOrderExecuted,
  externalPrompt,
  onClearExternalPrompt,
  currentThreshold,
  enforceCollateral = true,
  autoSlaSlashing = true,
  transactions = [],
  onContractGenerated
}) => {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<AgentChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `Hello! I am your **Autonomous Procurement Agent** (\`agent://treasury-prime.eth\`).\n\nTell me what you need to order (e.g. *"I need 100 Sharpies"* or click a suggestion below), and I will price the item with instant fulfillment and price tracking options.`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({ 'init-1': false });
  const [inlineActionLoading, setInlineActionLoading] = useState<string | null>(null);
  const [resolvedDeliveries, setResolvedDeliveries] = useState<Record<string, 'CAPTURED' | 'REFUNDED'>>({});
  const conversationIdRef = useRef<string | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSend = useCallback(async (textToSend?: string) => {
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
        body: JSON.stringify({
          prompt: query,
          conversation_id: conversationIdRef.current,
          threshold: currentThreshold,
          enforceCollateral
        })
      });

      if (!res.ok) throw new Error('Failed to reach agent API');
      const data: AgentChatMessage = await res.json();

      if (data.conversation_id) {
        conversationIdRef.current = data.conversation_id;
      }

      setMessages(prev => [...prev, data]);
      setExpandedThoughts(prev => ({ ...prev, [data.id]: false }));
      if (data.contract && onContractGenerated) {
        onContractGenerated(data.contract);
      }
      showToast('Sourcing & Due Diligence Complete', 'Procurement Draft configured on right canvas', 'info');
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered an error during procurement evaluation. Please try again.',
          timestamp: new Date().toISOString()
        }
      ]);
      showToast('Agent Error', 'Please try again', 'warning');
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, currentThreshold, enforceCollateral, showToast]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (externalPrompt) {
      handleSend(externalPrompt);
      if (onClearExternalPrompt) onClearExternalPrompt();
    }
  }, [externalPrompt, handleSend, onClearExternalPrompt]);

  const handleApproveContract = async (contract: AgentServiceContract) => {
    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contract })
      });

      if (!res.ok) throw new Error('Execution failed');
      const data = await res.json();
      const isEscrow = contract.requiresEscrow;
      const isRogueFail = contract.sellerAgent.id === 'agent-rogue-synth';
      const fulfillment = data.transaction.fulfillment;

      if (isEscrow) {
        setMessages(prev => [
          ...prev,
          {
            id: `exec-${Date.now()}`,
            role: 'assistant',
            content: `🔒 **Funds Held in PayPal Escrow (AUTHORIZE)!**\n\n• **Contract ID:** \`${data.transaction.contractId}\`\n• **Procurement Broker:** **${contract.sellerAgent.name}**\n• **Supplier B2B Channel:** \`${data.transaction.merchantDomain || 'Supplier B2B'}\`\n• **PayPal Authorization:** \`${data.settlement.authorizationId || data.settlement.orderId}\`\n• **Locked Amount:** $${contract.totalAmount.toFixed(2)} USD\n\nThe Procurement Broker has submitted their B2B PO and carrier tracking proof. Inspect the fulfillment card below to verify tracking or dispute:`,
            timestamp: new Date().toISOString(),
            deliveryPending: {
              contractId: data.transaction.contractId,
              transactionId: data.transaction.id,
              sellerAgent: contract.sellerAgent,
              fulfillment,
              artifacts: isRogueFail ? [] : contract.sampleArtifacts,
              isFailureSimulation: isRogueFail,
              failureReason: isRogueFail ? 'Invalid synthetic tracking number: carrier returns zero package scans. Dropship spoofing detected.' : undefined
            }
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: `exec-${Date.now()}`,
            role: 'assistant',
            content: `⚡ **Direct Settlement Captured via PayPal!**\n\n• **Contract ID:** \`${data.transaction.contractId}\`\n• **Procurement Broker:** **${contract.sellerAgent.name}**\n• **Supplier:** \`${data.transaction.merchantDomain}\`\n• **Tracking Number:** \`${fulfillment?.trackingNumber || 'Active Carrier Tracking'}\`\n• **PayPal Capture Reference:** \`${data.settlement.captureId || data.settlement.orderId}\`\n• **Settled Amount:** $${contract.totalAmount.toFixed(2)} USD\n\nFunds disbursed to the broker; B2B order dispatched to your destination. Transaction recorded in AG Grid #2 (Ledger Grid).`,
            timestamp: new Date().toISOString()
          }
        ]);
      }

      showToast(
        isEscrow ? 'Escrow Hold Created (AUTHORIZE)' : 'Direct Settlement Captured',
        `Contract #${data.transaction.contractId} • ${data.settlement.orderId}`,
        'success'
      );

      onOrderExecuted();
    } catch (err) {
      console.error(err);
      showToast('Execution Failed', 'Could not commit transaction to PayPal sandbox', 'warning');
    }
  };

  const handleInteractiveResolution = async (txId: string, action: 'VERIFY_AND_CAPTURE' | 'DISPUTE_AND_REFUND', reason?: string) => {
    setInlineActionLoading(txId);
    try {
      const res = await fetch('/api/ledger', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: txId, action, reason, autoSlaSlashing })
      });

      if (res.ok) {
        const data = await res.json();
        const isCapture = action === 'VERIFY_AND_CAPTURE';

        setResolvedDeliveries(prev => ({
          ...prev,
          [txId]: isCapture ? 'CAPTURED' : 'REFUNDED'
        }));

        const restitutionAmt = Number(data.transaction?.refundAmount ?? data.transaction?.totalAmount ?? 0).toFixed(2);
        setMessages(prev => [
          ...prev,
          {
            id: `res-${Date.now()}`,
            role: 'assistant',
            content: isCapture
              ? `✅ **Carrier Tracking Confirmed & PayPal Escrow Released!**\n\n• **PayPal Capture ID:** \`${data.result?.captureId}\`\n• **Carrier Status:** \`DELIVERED / IN_TRANSIT\`\n• **Broker Standing:** Awarded **+2 reputation bonus** (Now: **${data.transaction.sellerTrustScore}/100**)\n\nFunds released to the broker via \`POST /v2/payments/authorizations/{id}/capture\`.`
              : `🚨 **Tracking Fraud Disputed & PayPal Restitution Refund Issued!**\n\n• **Refund ID:** \`${data.result?.refundId}\`\n• **Restitution Amount:** $${restitutionAmt} USD\n• **Broker Penalty:** Slashed **-15 reputation score** (Now: **${data.transaction.sellerTrustScore}/100**)\n\nFull refund restitution issued via \`${data.result?.endpoint || 'PayPal Restitution'}\`. Buyer capital protected in AG Grid #2!`,
            timestamp: new Date().toISOString()
          }
        ]);

        showToast(
          isCapture ? 'Escrow Captured via PayPal' : 'PayPal Restitution Refund Executed',
          isCapture ? 'Broker reputation boosted +2' : 'Broker reputation slashed -15',
          isCapture ? 'success' : 'info'
        );

        onOrderExecuted();
      } else {
        const errData = await res.json().catch(() => null);
        showToast('Action Notice', errData?.error || 'Transaction status already updated', 'warning');
        onOrderExecuted();
      }
    } catch (err) {
      console.error(err);
      showToast('Action Failed', 'Could not complete escrow resolution', 'warning');
    } finally {
      setInlineActionLoading(null);
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
                <span className="text-blue-600 font-bold shrink-0">•</span>
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
        return <code key={i} className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-blue-700">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  const toggleThoughts = (id: string) => {
    setExpandedThoughts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Agent Chat Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between text-xs bg-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-xs">ProcureAI Buyer Agent</span>
              <span className="text-[10px] font-mono font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                Online
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 block">agent://treasury-prime.eth</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            PayPal Connected
          </span>
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-slate-50/40">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <div className={`max-w-[90%] ${msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm px-3.5 py-2 text-xs shadow-xs'
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
                      <Cpu className="w-3.5 h-3.5 text-blue-600" />
                      <span>Due Diligence & Qualification ({msg.reasoningSteps.length} checks)</span>
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

              {/* Notice directing user to Right Live Canvas */}
              {msg.contract && (
                <div className="mt-2.5 p-2 rounded-xl bg-blue-50/70 border border-blue-200/80 text-[11px] text-blue-900 flex items-center justify-between">
                  <span className="font-medium">
                    ⚡ Live quote configured on the right canvas.
                  </span>
                  <span className="font-mono font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200 shadow-2xs">
                    {msg.contract.items && msg.contract.items.length > 1
                      ? `${msg.contract.items.length} line items • $${msg.contract.totalAmount.toFixed(2)} total`
                      : `$${(msg.contract.totalAmount / (msg.contract.quantity || msg.contract.items?.[0]?.quantity || 1)).toFixed(2)}/unit`}
                  </span>
                </div>
              )}

              {/* Render Discovered Products */}
              {msg.products && msg.products.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    <span>Discovered Live Catalog Items ({msg.products.length})</span>
                    <span className="text-blue-600 font-mono">Channel3 Verified</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1">
                    {msg.products.slice(0, 4).map((p, pIdx) => (
                      <div
                        key={pIdx}
                        className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-400 transition flex items-center gap-3"
                      >
                        {p.imageUrl && (
                          <img
                            src={p.imageUrl}
                            alt={p.title}
                            className="w-12 h-12 rounded-lg object-cover bg-white border border-slate-200 shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-semibold text-blue-700 uppercase">
                              {p.brand || p.retailer || 'Channel3 Merchant'}
                            </span>
                            <span className="font-bold text-xs text-emerald-700 font-mono">
                              ${p.price.toFixed(2)}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-slate-900 truncate" title={p.title}>
                            {p.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              onClick={() => handleSend(`Purchase 1x ${p.title} for $${p.price.toFixed(2)}`)}
                              className="text-[10px] px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
                            >
                              Configure Order
                            </button>
                            {p.productUrl && (
                              <a
                                href={p.productUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-slate-500 hover:text-slate-800 underline"
                              >
                                Merchant Link ↗
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Follow-up / Suggestions */}
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {msg.suggestions.map((sug, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => handleSend(sug)}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>{sug}</span>
                      <span className="text-slate-400">→</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Interactive In-Chat Carrier Tracking Proof Card */}
              {msg.deliveryPending && (() => {
                const pendingKey = msg.deliveryPending.transactionId || msg.deliveryPending.contractId;
                const existingTx = transactions.find(t => t.id === pendingKey || t.contractId === pendingKey);
                const isAlreadyCaptured = existingTx?.status === 'VERIFIED_CAPTURED';
                const isAlreadyRefunded = existingTx?.status === 'DISPUTED_REFUNDED';
                const resolution = resolvedDeliveries[pendingKey] || (isAlreadyCaptured ? 'CAPTURED' : isAlreadyRefunded ? 'REFUNDED' : undefined);
                const fulfillment = msg.deliveryPending.fulfillment;

                return (
                  <div className="mt-3 p-3 rounded-xl border border-blue-200 bg-blue-50/60 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-[11px] flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-blue-600" />
                        <span>Broker B2B Fulfillment & Tracking Proof</span>
                      </span>
                      <span className="font-mono text-[10px] text-blue-700 bg-blue-100/80 px-1.5 py-0.5 rounded font-bold">
                        {msg.deliveryPending.contractId}
                      </span>
                    </div>

                    {msg.deliveryPending.isFailureSimulation ? (
                      <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] space-y-1">
                        <div className="font-bold flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                          <span>Fulfillment Anomaly Detected:</span>
                        </div>
                        <p>{msg.deliveryPending.failureReason}</p>
                        <div className="text-[10px] font-mono text-rose-700 pt-1">
                          Carrier: {fulfillment?.carrier || 'Unknown'} • Tracking: {fulfillment?.trackingNumber || 'INVALID-TRACKING'}
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-lg bg-white border border-blue-100 text-[11px] space-y-1.5 font-mono">
                        <div className="flex justify-between text-slate-600">
                          <span>Supplier Order:</span>
                          <span className="font-bold text-slate-900">{fulfillment?.supplierPoNumber || 'PO-STAPLES-88492'}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Carrier:</span>
                          <span className="font-bold text-slate-900">{fulfillment?.carrier || 'UPS Freight Ground'}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Tracking Number:</span>
                          <span className="font-bold text-blue-700">{fulfillment?.trackingNumber || '1Z999AA10123456784'}</span>
                        </div>
                        <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-100">
                          <span>Carrier Status:</span>
                          <span className="text-emerald-700 font-bold">✓ IN_TRANSIT (Carrier Verified)</span>
                        </div>
                      </div>
                    )}

                    {resolution ? (
                      <div className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Contract Lifecycle:</span>
                        {resolution === 'CAPTURED' ? (
                          <span className="text-emerald-700 font-bold text-xs flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <Check className="w-3.5 h-3.5" />
                            <span>PayPal Escrow Released (+2 Rep)</span>
                          </span>
                        ) : (
                          <span className="text-rose-700 font-bold text-xs flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>PayPal Refund Issued (-15 Slashed)</span>
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-blue-200/60">
                        <button
                          disabled={Boolean(inlineActionLoading)}
                          onClick={() => handleInteractiveResolution(
                            pendingKey,
                            'DISPUTE_AND_REFUND',
                            msg.deliveryPending?.failureReason || 'Failed carrier tracking verification'
                          )}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 text-xs font-bold flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                        >
                          <RotateCcw className="w-3 h-3 text-rose-600" />
                          <span>Dispute & Refund via PayPal</span>
                        </button>

                        <button
                          disabled={Boolean(inlineActionLoading) || msg.deliveryPending.isFailureSimulation}
                          onClick={() => handleInteractiveResolution(
                            pendingKey,
                            'VERIFY_AND_CAPTURE'
                          )}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-xs disabled:opacity-50"
                        >
                          <Check className="w-3 h-3" />
                          <span>Verify Tracking & Release Escrow</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
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
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-white text-slate-700 rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-xs border border-slate-200 flex items-center gap-2.5 shadow-xs">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>Querying Channel3, vetting suppliers, and configuring Procurement Broker...</span>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Suggested Prompts Toolbar */}
      <div className="px-3 py-2 border-t border-slate-200 bg-white flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold shrink-0">Demo Beats:</span>
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
            placeholder="E.g. 'I need 100 pens' or 'Source 500 units from Staples'..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 transition cursor-pointer shadow-xs"
          >
            <span>Procure</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
