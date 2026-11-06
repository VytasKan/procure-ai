'use client';

import React, { useState } from 'react';
import { ProcurementQuote } from '@/backend/types';
import { ShieldAlert, CheckCircle2, CreditCard, FileText, Truck, ArrowRight, Loader2, Tag } from 'lucide-react';
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
    <div className="mt-3 bg-slate-900 border border-slate-700/80 rounded-xl p-4 shadow-xl text-xs">
      {/* Header & Policy Notice */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-sky-400 font-bold border border-slate-700">
              {quote.quoteId}
            </span>
            <span className="text-xs font-bold text-white tracking-tight">
              {quote.title}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{quote.description}</p>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[11px] font-semibold shrink-0">
          {quote.paymentMethod === 'PAYPAL_INVOICE' ? (
            <>
              <FileText className="w-3.5 h-3.5" />
              <span>PayPal Net-15</span>
            </>
          ) : (
            <>
              <CreditCard className="w-3.5 h-3.5" />
              <span>PayPal Order</span>
            </>
          )}
        </div>
      </div>

      {/* Guardrail Policy Notice */}
      {quote.requiresApproval && (
        <div className="my-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-[11px] text-amber-300">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Human-in-the-Loop Guardrail:</span>
            <p className="text-amber-200/90 mt-0.5">
              {quote.approvalReason || 'Order total exceeds company auto-approval limit. Requires manager sign-off.'}
            </p>
          </div>
        </div>
      )}

      {/* Itemized Line Items Table */}
      <div className="my-3 overflow-hidden rounded-lg border border-slate-800 bg-slate-950/60">
        <table className="w-full text-left">
          <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 text-[10px] uppercase">
            <tr>
              <th className="py-2 px-3">Item / Description</th>
              <th className="py-2 px-3 text-center">Qty</th>
              <th className="py-2 px-3 text-right">Unit Price</th>
              <th className="py-2 px-3 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {quote.items.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-800/30">
                <td className="py-2 px-3">
                  <div className="font-medium text-white">{item.product.title}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {item.product.retailer} • SKU: {item.product.sku}
                  </div>
                </td>
                <td className="py-2 px-3 text-center font-mono font-semibold">{item.quantity}</td>
                <td className="py-2 px-3 text-right font-mono text-slate-300">{formatCurrency(item.unitPrice)}</td>
                <td className="py-2 px-3 text-right font-mono font-bold text-white">{formatCurrency(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Price Summary Breakdown */}
      <div className="bg-slate-950/70 rounded-lg p-3 space-y-1.5 border border-slate-800 text-[11px]">
        <div className="flex justify-between text-slate-400">
          <span>Catalog Subtotal:</span>
          <span className="font-mono text-slate-300">{formatCurrency(quote.subtotal)}</span>
        </div>
        {quote.bulkDiscount > 0 && (
          <div className="flex justify-between text-emerald-400 font-medium">
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3" /> B2B Volume Discount (8%):
            </span>
            <span className="font-mono">-{formatCurrency(quote.bulkDiscount)}</span>
          </div>
        )}
        <div className="flex justify-between text-slate-400">
          <span>Priority Freight Shipping:</span>
          <span className="font-mono text-slate-300">
            {quote.shippingCost === 0 ? 'FREE (B2B Waived)' : formatCurrency(quote.shippingCost)}
          </span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Estimated Sales Tax (7.5%):</span>
          <span className="font-mono text-slate-300">{formatCurrency(quote.estimatedTax)}</span>
        </div>
        <div className="border-t border-slate-800 pt-2 mt-1 flex justify-between items-center">
          <span className="font-bold text-white text-xs">Total Authorized Amount:</span>
          <span className="font-mono font-bold text-sky-400 text-sm">{formatCurrency(quote.totalAmount)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <Truck className="w-3.5 h-3.5 text-slate-500" />
          <span>Priority Delivery: <strong className="text-slate-200">{quote.estimatedDeliveryDate}</strong></span>
        </div>

        <div className="w-full sm:w-auto">
          {isDone ? (
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
              <span>PayPal Order Settled</span>
            </div>
          ) : (
            <button
              onClick={handleApprove}
              disabled={isExecuting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-blue-500/25 disabled:opacity-50 transition cursor-pointer"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Authorizing PayPal...</span>
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
