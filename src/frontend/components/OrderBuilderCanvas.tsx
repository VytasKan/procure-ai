'use client';

import React, { useState } from 'react';
import { AgentServiceContract, BasketItem } from '@/backend/types';
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  Lock, 
  ArrowRight, 
  Loader2, 
  Package,
  Truck,
  TrendingDown,
  Bell,
  Sparkles,
  Calendar,
  Layers,
  FileCheck,
  Building,
  Plus,
  Trash2,
  ShoppingCart
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface OrderBuilderCanvasProps {
  contract?: AgentServiceContract;
  onApprove: (contract: AgentServiceContract) => Promise<void>;
  onSelectPrompt: (prompt: string) => void;
  onUpdateBasket?: (updatedItems: BasketItem[]) => void;
}

export const OrderBuilderCanvas: React.FC<OrderBuilderCanvasProps> = ({
  contract,
  onApprove,
  onSelectPrompt,
  onUpdateBasket
}) => {
  const [selectedTier, setSelectedTier] = useState<'instant' | 'delayed'>('instant');
  const [isTrackingPrice, setIsTrackingPrice] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // If no contract active yet, show live ready state with quick product seeds
  if (!contract) {
    return (
      <div className="h-full bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-xs mb-4">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800 tracking-tight">Active Order Basket & Canvas</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
          Ask the Buyer Agent on the left to add items to your order (e.g. <em>&quot;I need a standing desk&quot;</em> or <em>&quot;Add 100 Sharpie pens&quot;</em>). Your multi-item basket, batch freight consolidation, and commercial invoice will assemble here in real time.
        </p>

        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => onSelectPrompt('Source an ergonomic standing desk')}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 text-slate-700 shadow-2xs transition cursor-pointer"
          >
            🖥️ Electric Standing Desk
          </button>
          <button
            onClick={() => onSelectPrompt('I need 100 Sharpie S-Gel pens')}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 text-slate-700 shadow-2xs transition cursor-pointer"
          >
            🖊️ 100x Sharpie S-Gel Pens
          </button>
          <button
            onClick={() => onSelectPrompt('Order 4 ergonomic office chairs')}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 text-slate-700 shadow-2xs transition cursor-pointer"
          >
            🪑 4x Ergonomic Mesh Chairs
          </button>
          <button
            onClick={() => onSelectPrompt('Request quote for Dell 4K monitors')}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 text-slate-700 shadow-2xs transition cursor-pointer"
          >
            🔵 Dell 4K Workstation Display
          </button>
        </div>
      </div>
    );
  }

  const isEscrow = contract.requiresEscrow;
  const items: BasketItem[] = contract.items && contract.items.length > 0 
    ? contract.items 
    : [
        {
          id: 'item-primary',
          title: contract.taskTitle.replace(/ProcureAI B2B Order: \d+x /i, ''),
          sku: 'PROC-B2B-ITEM',
          unitPrice: Math.round((contract.totalAmount / (contract.quantity || 1)) * 100) / 100,
          quantity: contract.quantity || 1,
          subtotal: contract.totalAmount,
          leadTimeDays: 3
        }
      ];

  const subtotalAll = items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // 15% discount for 7-day delayed freight consolidation
  const delayedSavings = Math.round(subtotalAll * 0.15 * 100) / 100;
  const delayedTotal = Math.round((subtotalAll - delayedSavings) * 100) / 100;
  const currentPayAmount = selectedTier === 'delayed' ? delayedTotal : subtotalAll;

  const handleApprove = async () => {
    setIsExecuting(true);
    try {
      const executedContract: AgentServiceContract = {
        ...contract,
        items,
        totalAmount: currentPayAmount,
        estimatedDeliveryTime: selectedTier === 'delayed' 
          ? '7-10 Business Days (Consolidated Freight)' 
          : contract.estimatedDeliveryTime
      };
      await onApprove(executedContract);
      setIsDone(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    const updated = items.filter(it => it.id !== itemId);
    if (onUpdateBasket) {
      onUpdateBasket(updated);
    }
  };

  return (
    <div className="h-full bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between overflow-hidden">
      {/* Top Header Card */}
      <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/60 via-slate-50 to-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 tracking-tight">Procurement Basket</span>
              <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                {items.length} {items.length === 1 ? 'Line Item' : 'Line Items'}
              </span>
            </div>
            <span className="text-xs text-slate-500 font-medium">Consolidated B2B Shipment • PO #{contract.contractId}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400">Merchant of Record:</span>
          <span className="text-xs font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
            ProcureAI Certified
          </span>
        </div>
      </div>

      {/* Main Body: Line Items Basket & Delivery Selector */}
      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        {/* Section 1: Line Items in Basket */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
              Items in Order ({items.length})
            </span>
            <span className="text-[11px] text-blue-600 font-semibold cursor-pointer hover:underline" onClick={() => onSelectPrompt('Add another item to order')}>
              + Add another item via chat
            </span>
          </div>

          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-slate-50/40 overflow-hidden">
            {items.map((item, idx) => (
              <div key={item.id || idx} className="p-3 flex items-center justify-between hover:bg-white transition bg-white/60">
                <div className="flex items-center gap-3 flex-1 min-w-0 pr-3">
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0 bg-white"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 font-bold text-xs">
                      #{idx + 1}
                    </div>
                  )}
                  <div className="truncate">
                    <span className="font-bold text-slate-900 text-xs block truncate">{item.title}</span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Qty: <strong>{item.quantity.toLocaleString()}</strong> @ ${item.unitPrice.toFixed(2)}/unit
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right font-mono">
                    <span className="font-bold text-slate-900 text-xs block">{formatCurrency(item.subtotal)}</span>
                    <span className="text-[10px] text-emerald-700">In Stock</span>
                  </div>
                  {items.length > 1 && (
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Delivery Speed & Flexible Delay Option */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
            Select Fulfillment Schedule & Freight Terms
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Option 1: Standard Delivery */}
            <div 
              onClick={() => setSelectedTier('instant')}
              className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                selectedTier === 'instant'
                  ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600/30 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedTier === 'instant' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                    }`}>
                      {selectedTier === 'instant' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="font-bold text-slate-900 text-xs">Standard Priority</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 text-sm">{formatCurrency(subtotalAll)}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 pl-6 leading-relaxed">
                  Delivers in <strong>3 business days</strong> via Priority Freight. Immediate dispatch from warehouse.
                </p>
              </div>
              <div className="mt-3 pl-6 flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                <Truck className="w-3.5 h-3.5 text-blue-600" />
                <span>{items.length} line {items.length === 1 ? 'item' : 'items'} • Standard freight</span>
              </div>
            </div>

            {/* Option 2: Flexible Delay (15% Savings) */}
            <div 
              onClick={() => setSelectedTier('delayed')}
              className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                selectedTier === 'delayed'
                  ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600/30 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedTier === 'delayed' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                    }`}>
                      {selectedTier === 'delayed' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 text-xs">Consolidated Batch</span>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded font-mono">
                        Save 15%
                      </span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-emerald-800 text-sm">{formatCurrency(delayedTotal)}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 pl-6 leading-relaxed">
                  Delivers in <strong>7-10 business days</strong>. Saves <strong>{formatCurrency(delayedSavings)}</strong> via single-pallet consolidation.
                </p>
              </div>
              <div className="mt-3 pl-6 flex items-center gap-1.5 text-[10px] font-mono text-emerald-700">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Consolidated shipment discount applied</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Trust & Commercial Invoice Protection */}
        <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
          isEscrow 
            ? 'bg-amber-50/70 border-amber-200 text-amber-900' 
            : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
        }`}>
          <div className="flex items-center gap-2.5">
            {isEscrow ? <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" /> : <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />}
            <div>
              <span className="font-bold block text-xs">
                {isEscrow ? 'Commercial Escrow: Funds Auto-Settled Post-Delivery' : 'Commercial Invoice: Auto-Settled via PayPal Post-Delivery'}
              </span>
              <span className="text-[11px] opacity-90">
                ProcureAI issues corporate invoice. Outstanding balance collected autonomously via connected PayPal Agent Wallet upon delivery.
              </span>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs shrink-0">
            Trust: {contract.sellerAgent.trustScore}/100
          </span>
        </div>
      </div>

      {/* Bottom Sticky Footer Checkout */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-slate-500 font-medium">Invoice Total:</span>
            <span className="text-xl font-mono font-bold text-slate-900">
              {formatCurrency(currentPayAmount)}
            </span>
            <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 font-medium">
              Due on Delivery
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            {selectedTier === 'delayed' ? 'Includes 15% flexible delay discount' : 'Includes standard priority dispatch'}
          </span>
        </div>

        <div>
          {isDone ? (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-100/80 px-4 py-2.5 rounded-xl border border-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Order Submitted & Invoice Issued</span>
            </div>
          ) : (
            <button
              onClick={handleApprove}
              disabled={isExecuting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-xs disabled:opacity-50 transition cursor-pointer bg-blue-600 hover:bg-blue-700"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting Order...</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4" />
                  <span>Submit Order ({formatCurrency(currentPayAmount)})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
