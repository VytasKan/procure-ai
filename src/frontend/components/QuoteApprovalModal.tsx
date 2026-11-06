'use client';

import React, { useState } from 'react';
import { ProcurementQuote } from '@/backend/types';
import { ShieldAlert, CheckCircle2, CreditCard, FileText, Truck, ArrowRight, Loader2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface QuoteApprovalCardProps {
  quote: ProcurementQuote;
  onApprove: (quote: ProcurementQuote) => Promise<void>;
}

export const QuoteApprovalCard: React.FC<QuoteApprovalCardProps> = ({
  quote,
  onApprove
}) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleApprove = async () => {
    setIsExecuting(true);
    try {
      await onApprove(quote);
      setIsDone(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="mt-3 bg-slate-950/90 border border-slate-800 rounded-xl p-4 shadow-xl shadow-black/40">
      {/* Header & Policy Notice */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {quote.quoteId}
            </span>
            <span className="text-sm font-semibold text-white">
              {quote.title}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">{quote.description}</p>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-medium">
          {quote.paymentMethod === 'PAYPAL_INVOICE' ? (
            <>
              <FileText className="w-3.5 h-3.5" />
              <span>PayPal Invoice</span>
            </>
          ) : (
            <>
              <CreditCard className="w-3.5 h-3.5" />
              <span>PayPal Checkout</span>
            </>
          )}
        </div>
      </div>

      {/* Guardrail Policy Notice */}
      {quote.requiresApproval && (
        <div className="my-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-300">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Human-in-the-Loop Guardrail Triggered:</span>
            <p className="text-amber-200/80 mt-0.5">
              {quote.approvalReason || 'This purchase requires manager authorization before PayPal funds are committed.'}
            </p>
          </div>
        </div>
      )}

      {/* Itemized Line Items Table */}
      <div className="my-3 overflow-hidden rounded-lg border border-slate-800/80 bg-slate-900/40">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-800/50 text-slate-400 font-medium border-b border-slate-800/80">
            <tr>
              <th className="py-2 px-3">Item / Description</th>
              <th className="py-2 px-3 text-center">Qty</th>
              <th className="py-2 px-3 text-right">Unit Price</th>
              <th className="py-2 px-3 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-slate-200">
            {quote.items.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-800/20">
                <td className="py-2 px-3">
                  <div className="font-medium text-white">{item.product.title}</div>
                  <div className="text-[10px] text-slate-400">{item.product.retailer} • SKU: {item.product.sku}</div>
                </td>
                <td className="py-2 px-3 text-center font-mono">{item.quantity}</td>
                <td className="py-2 px-3 text-right font-mono">{formatCurrency(item.unitPrice)}</td>
                <td className="py-2 px-3 text-right font-mono font-semibold">{formatCurrency(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Price Summary Breakdown */}
      <div className="bg-slate-900/60 rounded-lg p-3 text-xs space-y-1.5 border border-slate-800/50">
        <div className="flex justify-between text-slate-400">
          <span>Items Subtotal:</span>
          <span className="font-mono text-slate-300">{formatCurrency(quote.subtotal)}</span>
        </div>
        {quote.bulkDiscount > 0 && (
          <div className="flex justify-between text-emerald-400">
            <span>B2B Volume Discount (8%):</span>
            <span className="font-mono">-{formatCurrency(quote.bulkDiscount)}</span>
          </div>
        )}
        <div className="flex justify-between text-slate-400">
          <span>Estimated Shipping:</span>
          <span className="font-mono text-slate-300">
            {quote.shippingCost === 0 ? 'FREE (Orders > $500)' : formatCurrency(quote.shippingCost)}
          </span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Estimated Taxes (7.5%):</span>
          <span className="font-mono text-slate-300">{formatCurrency(quote.estimatedTax)}</span>
        </div>
        <div className="border-t border-slate-800 pt-1.5 flex justify-between text-sm font-bold text-white">
          <span>Total Authorized Amount:</span>
          <span className="font-mono text-sky-400">{formatCurrency(quote.totalAmount)}</span>
        </div>
      </div>

      {/* Delivery Schedule & Actions */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Truck className="w-4 h-4 text-slate-500" />
          <span>Priority Delivery by: <strong className="text-slate-200">{quote.estimatedDeliveryDate}</strong></span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {isDone ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
              <span>PayPal Order Settled</span>
            </div>
          ) : (
            <button
              onClick={handleApprove}
              disabled={isExecuting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Authorizing via PayPal...</span>
                </>
              ) : (
                <>
                  <span>Approve & Execute via PayPal</span>
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
