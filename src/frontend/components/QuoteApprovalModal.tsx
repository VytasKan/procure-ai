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
    <div className="mt-3 bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm text-xs text-slate-800">
      {/* Header & Policy Notice */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 text-[#0070ba] font-bold border border-blue-200">
              {quote.quoteId}
            </span>
            <span className="text-xs font-bold text-slate-900 tracking-tight">
              {quote.title}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{quote.description}</p>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold shrink-0">
          {quote.paymentMethod === 'PAYPAL_INVOICE' ? (
            <>
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>PayPal Net-15</span>
            </>
          ) : (
            <>
              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              <span>PayPal Order</span>
            </>
          )}
        </div>
      </div>

      {/* Guardrail Policy Notice */}
      {quote.requiresApproval && (
        <div className="my-2.5 p-2 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2 text-[11px] text-amber-800">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-900">Human-in-the-Loop Guardrail:</span>
            <p className="text-amber-800 mt-0.5">
              {quote.approvalReason || 'Order total exceeds company auto-approval limit. Requires manager sign-off.'}
            </p>
          </div>
        </div>
      )}

      {/* Itemized Line Items Table */}
      <div className="my-2.5 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[10px] uppercase">
            <tr>
              <th className="py-2 px-3">Item / Description</th>
              <th className="py-2 px-3 text-center">Qty</th>
              <th className="py-2 px-3 text-right">Unit Price</th>
              <th className="py-2 px-3 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {quote.items.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/70">
                <td className="py-2 px-3">
                  <div className="font-medium text-slate-900">{item.product.title}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {item.product.retailer} • SKU: {item.product.sku}
                  </div>
                </td>
                <td className="py-2 px-3 text-center font-mono font-semibold text-slate-800">{item.quantity}</td>
                <td className="py-2 px-3 text-right font-mono text-slate-600">{formatCurrency(item.unitPrice)}</td>
                <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">{formatCurrency(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Price Summary Breakdown */}
      <div className="bg-slate-50 rounded-lg p-2.5 space-y-1.5 border border-slate-200 text-[11px] text-slate-600">
        <div className="flex justify-between">
          <span>Catalog Subtotal:</span>
          <span className="font-mono text-slate-800">{formatCurrency(quote.subtotal)}</span>
        </div>
        {quote.bulkDiscount > 0 && (
          <div className="flex justify-between text-emerald-700 font-medium">
            <span className="flex items-center gap-1">
              <Tag className="w-3 h-3 text-emerald-600" /> B2B Volume Discount (8%):
            </span>
            <span className="font-mono">-{formatCurrency(quote.bulkDiscount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Priority Freight Shipping:</span>
          <span className="font-mono text-slate-800">
            {quote.shippingCost === 0 ? 'FREE (B2B Waived)' : formatCurrency(quote.shippingCost)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Estimated Sales Tax (7.5%):</span>
          <span className="font-mono text-slate-800">{formatCurrency(quote.estimatedTax)}</span>
        </div>
        <div className="border-t border-slate-200 pt-2 mt-1 flex justify-between items-center text-slate-900 font-bold text-xs">
          <span>Total Authorized Amount:</span>
          <span className="font-mono text-[#0070ba] text-sm">{formatCurrency(quote.totalAmount)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <Truck className="w-3.5 h-3.5 text-slate-400" />
          <span>Priority Delivery: <strong className="text-slate-800">{quote.estimatedDeliveryDate}</strong></span>
        </div>

        <div className="w-full sm:w-auto">
          {isDone ? (
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>PayPal Order Settled</span>
            </div>
          ) : (
            <button
              onClick={handleApprove}
              disabled={isExecuting}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#0070ba] hover:bg-[#003087] text-white text-xs font-bold shadow-xs disabled:opacity-50 transition cursor-pointer"
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
