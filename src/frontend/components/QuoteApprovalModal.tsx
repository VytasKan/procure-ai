'use client';

import React, { useState } from 'react';
import { AgentServiceContract } from '@/backend/types';
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  Lock, 
  ArrowRight, 
  Loader2, 
  Bot, 
  Building, 
  AlertOctagon,
  Clock,
  TrendingDown,
  Bell,
  Sparkles,
  Calendar,
  Truck
} from 'lucide-react';
import { formatCurrency, getTrustScoreBadge } from '../utils/formatters';

interface ContractApprovalCardProps {
  contract: AgentServiceContract;
  onApprove: (contract: AgentServiceContract) => Promise<void>;
}

export const QuoteApprovalCard: React.FC<ContractApprovalCardProps> = ({
  contract,
  onApprove
}) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'instant' | 'delayed'>('instant');
  const [isTrackingPrice, setIsTrackingPrice] = useState(false);

  const isEscrow = contract.requiresEscrow;
  const proposal = contract.sourcingProposal;
  const quantity = proposal?.quantity || contract.quantity || 100;
  
  // Calculate Item-Level Pricing & Delayed Shipping Option
  const baseTotal = contract.totalAmount;
  const itemUnitPrice = baseTotal / quantity;
  
  // 15% discount for 7-day delayed freight consolidation
  const delayedSavings = Math.round(baseTotal * 0.15 * 100) / 100;
  const delayedTotal = Math.round((baseTotal - delayedSavings) * 100) / 100;
  const delayedUnitPrice = delayedTotal / quantity;

  const currentPayAmount = selectedTier === 'delayed' ? delayedTotal : baseTotal;

  const handleApprove = async () => {
    setIsExecuting(true);
    try {
      // Pass the selected tier total to payment execution
      const executedContract = {
        ...contract,
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

  const handleTogglePriceTracking = () => {
    setIsTrackingPrice(prev => !prev);
  };

  return (
    <div className="mt-3 bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm text-xs text-slate-800 space-y-3">
      {/* Header & Item Identity */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
              {contract.contractId}
            </span>
            <span className="text-xs font-bold text-slate-900 tracking-tight">
              {contract.taskTitle}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{contract.description}</p>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold shrink-0 border bg-slate-50 border-slate-200">
          <Bot className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-mono text-slate-800">ProcureAI Fulfillment</span>
        </div>
      </div>

      {/* Item Price & Live Market Intelligence Radar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">ProcureAI Unit Price</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-base font-bold font-mono text-slate-900">${itemUnitPrice.toFixed(2)}</span>
            <span className="text-[10px] text-slate-500 font-mono">/ unit</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">Quantity: {quantity.toLocaleString()} units</span>
        </div>

        <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono text-emerald-800 font-semibold">Price Trend</span>
            <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xs font-bold text-emerald-900">4.2% Below Average</span>
          </div>
          <span className="text-[10px] text-emerald-700 block mt-0.5">14-Day Lowest Price Range</span>
        </div>

        <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono text-blue-800 font-semibold">Price Radar</span>
              <Bell className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <span className="text-[10px] text-blue-700 block mt-0.5">
              {isTrackingPrice ? 'Active: Tracking dip < $0.28' : 'Notify if price drops below target'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleTogglePriceTracking}
            className={`mt-1.5 py-1 px-2 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
              isTrackingPrice 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'bg-white text-blue-700 border border-blue-300 hover:bg-blue-50'
            }`}
          >
            <Bell className="w-3 h-3" />
            <span>{isTrackingPrice ? 'Tracking Active' : 'Track Price'}</span>
          </button>
        </div>
      </div>

      {/* Item Fulfillment Options: Instant Priority vs. Flexible Delay Savings */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
          Select Delivery Schedule & Pricing
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Option 1: Standard Priority Delivery */}
          <div 
            onClick={() => setSelectedTier('instant')}
            className={`p-2.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
              selectedTier === 'instant'
                ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600/30'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    selectedTier === 'instant' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                  }`}>
                    {selectedTier === 'instant' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="font-bold text-slate-900 text-xs">Standard Delivery</span>
                </div>
                <span className="font-mono font-bold text-slate-900 text-xs">{formatCurrency(baseTotal)}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 pl-5">
                Delivers in <strong>3 business days</strong> via Priority Freight. Immediate dispatch.
              </p>
            </div>
            <div className="mt-2 pl-5 flex items-center gap-1 text-[10px] font-mono text-slate-500">
              <Truck className="w-3 h-3 text-blue-600" />
              <span>${itemUnitPrice.toFixed(2)}/unit</span>
            </div>
          </div>

          {/* Option 2: Flexible Delay (15% Savings) */}
          <div 
            onClick={() => setSelectedTier('delayed')}
            className={`p-2.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
              selectedTier === 'delayed'
                ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600/30'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    selectedTier === 'delayed' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                  }`}>
                    {selectedTier === 'delayed' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-slate-900 text-xs">Flexible Delay</span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded font-mono">
                      Save 15%
                    </span>
                  </div>
                </div>
                <span className="font-mono font-bold text-emerald-800 text-xs">{formatCurrency(delayedTotal)}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 pl-5">
                Delivers in <strong>7-10 business days</strong>. Saves <strong>{formatCurrency(delayedSavings)}</strong> via consolidated batch routing.
              </p>
            </div>
            <div className="mt-2 pl-5 flex items-center gap-1 text-[10px] font-mono text-emerald-700">
              <Calendar className="w-3 h-3 text-emerald-600" />
              <span>${delayedUnitPrice.toFixed(2)}/unit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trust & Guarantee Banner */}
      <div className={`p-2.5 rounded-xl border text-[11px] flex items-center justify-between ${
        isEscrow 
          ? 'bg-amber-50/70 border-amber-200 text-amber-900' 
          : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
      }`}>
        <div className="flex items-center gap-2">
          {isEscrow ? <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" /> : <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />}
          <div>
            <span className="font-bold block">
              {isEscrow ? 'PayPal Conditional Escrow Protection' : 'Instant Direct Payout via PayPal'}
            </span>
            <span className="text-[10px] opacity-90">
              {isEscrow 
                ? 'Payment held securely in PayPal Escrow until verified carrier delivery.' 
                : 'Directly verified & guaranteed by ProcureAI Master Distributor.'}
            </span>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white border border-slate-200 shrink-0">
          Trust Score: {contract.sellerAgent.trustScore}/100
        </span>
      </div>

      {/* Checkout Row & One-Click PayPal Payment */}
      <div className="border-t border-slate-100 pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs text-slate-500">Total to Authorize:</span>
            <span className="text-base font-mono font-bold text-blue-700">
              {formatCurrency(currentPayAmount)}
            </span>
            <span className="text-[9px] font-mono bg-blue-50 text-blue-700 px-1 py-0.5 rounded border border-blue-200">
              PayPal Orders v2
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {selectedTier === 'delayed' ? 'Includes 15% flexible freight discount' : 'Includes standard 3-day priority dispatch'}
          </span>
        </div>

        <div>
          {isDone ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{isEscrow ? 'PayPal Escrow Authorized' : 'Paid via PayPal'}</span>
            </div>
          ) : (
            <button
              onClick={handleApprove}
              disabled={isExecuting}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold shadow-xs disabled:opacity-50 transition cursor-pointer ${
                isEscrow ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isExecuting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Committing Order...</span>
                </>
              ) : (
                <>
                  {isEscrow ? <Lock className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  <span>{isEscrow ? `Authorize Escrow (${formatCurrency(currentPayAmount)})` : `Pay via PayPal (${formatCurrency(currentPayAmount)})`}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
