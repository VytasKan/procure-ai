'use client';

import React, { useState } from 'react';
import { LedgerTransaction } from '@/backend/types';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../utils/formatters';
import { X, ExternalLink, Package, Truck, CheckCircle2, Clock, Building2, User, Loader2 } from 'lucide-react';

interface OrderDetailsModalProps {
  transaction: LedgerTransaction | null;
  onClose: () => void;
  onStatusUpdated: () => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  transaction,
  onClose,
  onStatusUpdated
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  if (!transaction) return null;

  const handleAdvanceStatus = async () => {
    setIsUpdating(true);
    try {
      const nextStatus = transaction.status === 'APPROVED' ? 'COMPLETED' : 'SHIPPED';
      const res = await fetch('/api/ledger', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: transaction.id, status: nextStatus })
      });

      if (res.ok) {
        onStatusUpdated();
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const paypalRef = transaction.paypalOrderId || transaction.paypalInvoiceId || 'Pending';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-sky-400">
                {transaction.orderNumber}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadgeClass(transaction.status)}`}>
                {transaction.status}
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">{transaction.title}</h3>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-semibold flex items-center gap-1">
                <Building2 className="w-3 h-3" /> Department
              </span>
              <p className="text-slate-200 font-medium mt-0.5">{transaction.department}</p>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-semibold flex items-center gap-1">
                <User className="w-3 h-3" /> Requested By
              </span>
              <p className="text-slate-200 font-medium mt-0.5">{transaction.requestedBy}</p>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-semibold flex items-center gap-1">
                <Package className="w-3 h-3" /> Supplier
              </span>
              <p className="text-slate-200 font-medium mt-0.5">{transaction.supplier}</p>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3" /> Date Placed
              </span>
              <p className="text-slate-200 font-medium mt-0.5">{formatDate(transaction.createdAt)}</p>
            </div>
          </div>

          {/* PayPal Settlement Info */}
          <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-semibold text-blue-400">
                PayPal Sandbox Authorization
              </span>
              {transaction.paypalPaymentUrl && (
                <a
                  href={transaction.paypalPaymentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium"
                >
                  <span>Verify in Sandbox</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="font-mono text-xs text-slate-300">{paypalRef}</span>
              <span className="text-emerald-400 font-semibold">{transaction.paypalStatus || 'CAPTURED'}</span>
            </div>
          </div>

          {/* Shipment Tracking Info */}
          {transaction.trackingNumber && (
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">
                    {transaction.carrier || 'Priority Carrier'} Tracking
                  </div>
                  <div className="font-mono text-xs text-slate-200 font-semibold">
                    {transaction.trackingNumber}
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>In Transit</span>
              </span>
            </div>
          )}

          {/* Line Items Table */}
          <div>
            <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Itemized Order Contents ({transaction.itemCount} items)
            </h4>
            <div className="rounded-lg border border-slate-800 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 text-[10px]">
                  <tr>
                    <th className="py-2 px-3">Item Description</th>
                    <th className="py-2 px-3 text-center">Qty</th>
                    <th className="py-2 px-3 text-right">Unit Price</th>
                    <th className="py-2 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {transaction.items?.map((it, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/20">
                      <td className="py-2 px-3 font-medium text-slate-200">{it.name}</td>
                      <td className="py-2 px-3 text-center font-mono">{it.quantity}</td>
                      <td className="py-2 px-3 text-right font-mono">{formatCurrency(it.unitPrice)}</td>
                      <td className="py-2 px-3 text-right font-mono font-semibold">
                        {formatCurrency(it.quantity * it.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total Amount Footer */}
          <div className="pt-2 flex justify-between items-center text-sm font-bold border-t border-slate-800">
            <span className="text-slate-400">Total Charged to PayPal:</span>
            <span className="font-mono text-sky-400 text-base">
              {formatCurrency(transaction.totalAmount, transaction.currency)}
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Audited & Timestamped: {formatDate(transaction.updatedAt)}
          </span>

          <div className="flex items-center gap-2">
            {transaction.status !== 'SHIPPED' && (
              <button
                onClick={handleAdvanceStatus}
                disabled={isUpdating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition cursor-pointer"
              >
                {isUpdating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Truck className="w-3.5 h-3.5 text-blue-400" />
                )}
                <span>Simulate Carrier Dispatch</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

