'use client';

import React, { useState } from 'react';
import { LedgerTransaction } from '@/backend/types';
import { formatCurrency, formatDate, getStatusBadgeClass, getTrustScoreBadge } from '../utils/formatters';
import { X, ExternalLink, Bot, CheckCircle2, Lock, RotateCcw, AlertTriangle, Loader2, Truck, Building } from 'lucide-react';
import { useToast } from './Toast';

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
  const { showToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTelemetry, setShowTelemetry] = useState(false);

  if (!transaction) return null;

  const handleVerifyAndCapture = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/ledger', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: transaction.id, action: 'VERIFY_AND_CAPTURE' })
      });

      if (res.ok) {
        showToast(
          'Carrier Tracking Verified & Escrow Released',
          `POST /v2/payments/authorizations/{id}/capture executed. Broker reputation +2.`,
          'success'
        );
        onStatusUpdated();
        onClose();
      }
    } catch (err) {
      console.error(err);
      showToast('Capture Failed', 'Could not release escrow capture', 'warning');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDisputeAndRefund = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/ledger', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: transaction.id, 
          action: 'DISPUTE_AND_REFUND',
          reason: 'Supplier carrier tracking returned 0 scans / dropship tracking fraud',
          refundAmount: transaction.totalAmount
        })
      });

      if (res.ok) {
        showToast(
          'Tracking Breach Disputed & Refund Executed',
          `POST /v2/payments/captures/{id}/refund ($${transaction.totalAmount.toFixed(2)}) executed. Broker slashed -15 reputation.`,
          'info'
        );
        onStatusUpdated();
        onClose();
      }
    } catch (err) {
      console.error(err);
      showToast('Refund Failed', 'Could not process refund', 'warning');
    } finally {
      setIsProcessing(false);
    }
  };

  const badge = getTrustScoreBadge(transaction.sellerTrustScore);
  const paypalRef = transaction.paypalRefundId || transaction.paypalCaptureId || transaction.paypalAuthId || transaction.paypalOrderId || 'Pending';
  const f = transaction.fulfillment;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-blue-700">
                {transaction.contractId}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadgeClass(transaction.status)}`}>
                {transaction.status}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1">{transaction.title}</h3>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Procurement Broker & Supplier Info Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-900 text-xs">{transaction.sellerAgentName} (Broker)</span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${badge.bg} ${badge.text} ${badge.border}`}>
                Score: {transaction.sellerTrustScore}/100 ({badge.label})
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-500">
              Merchant: <strong className="text-blue-700">{transaction.merchantDomain || 'staples.com'}</strong> • Collateral Stake: ${transaction.stakeCollateral} USD
            </div>
            <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">
              <strong>Audit Ledger Note:</strong> {transaction.verificationNotes}
            </div>
          </div>

          {/* Carrier Tracking & B2B Fulfillment Verification */}
          {f && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-600 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  <span>B2B Fulfillment & Carrier Tracking Proof</span>
                </span>
                <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                  f.status === 'DELIVERED' || f.status === 'IN_TRANSIT_VERIFIED' 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {f.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-white p-2.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">Supplier PO Number</span>
                  <span className="font-bold text-slate-900">{f.supplierPoNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Carrier / Logistics</span>
                  <span className="font-bold text-slate-900">{f.carrier}</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-slate-400 text-[10px]">Tracking Number:</span>
                  <span className="font-bold text-blue-700">{f.trackingNumber}</span>
                </div>
              </div>
            </div>
          )}

          {/* PayPal Settlement State */}
          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-blue-700">
                PayPal Settlement Engine
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowTelemetry(prev => !prev)}
                  className="text-[11px] text-blue-700 font-semibold underline cursor-pointer"
                >
                  {showTelemetry ? 'Hide Telemetry' : 'View Audit Trail'}
                </button>
                {transaction.paypalPaymentUrl && (
                  <a
                    href={transaction.paypalPaymentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <span>Sandbox Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
            <div className="mt-1 flex items-center justify-between font-mono">
              <span className="text-xs text-slate-800">{paypalRef}</span>
              <span className={`font-bold ${
                transaction.paypalStatus === 'REFUNDED' || transaction.paypalStatus === 'VOIDED'
                  ? 'text-rose-600'
                  : transaction.paypalStatus === 'CAPTURED'
                    ? 'text-emerald-700'
                    : 'text-amber-700'
              }`}>
                {transaction.paypalStatus || 'AUTHORIZED'}
              </span>
            </div>

            {/* Audit Trail Payload Log */}
            {showTelemetry && transaction.auditTrail && (
              <div className="mt-2.5 pt-2 border-t border-blue-200/80 space-y-1.5 font-mono text-[10px]">
                {transaction.auditTrail.map((log, i) => (
                  <div key={i} className="p-1.5 bg-white rounded border border-blue-100 flex items-center justify-between text-slate-700">
                    <div>
                      <span className="font-bold text-blue-800">{log.method}</span> {log.endpoint}
                      <p className="text-slate-500 text-[9px]">{log.summary}</p>
                    </div>
                    <span className="text-emerald-700 font-bold">{log.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total Amount Footer */}
          <div className="pt-2 flex justify-between items-center text-sm font-bold border-t border-slate-200">
            <span className="text-slate-600">Total B2B Contract Value Cleared:</span>
            <span className="font-mono text-blue-700 text-base font-black">
              {formatCurrency(transaction.totalAmount, transaction.currency)}
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            {formatDate(transaction.createdAt)}
          </span>

          <div className="flex items-center gap-2">
            {transaction.status === 'ESCROW_LOCKED' && (
              <>
                <button
                  onClick={handleDisputeAndRefund}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-xs font-bold text-rose-700 border border-rose-300 transition cursor-pointer"
                  title="Dispute invalid tracking and execute PayPal restitution refund"
                >
                  {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5 text-rose-600" />}
                  <span>Dispute & Refund via PayPal</span>
                </button>

                <button
                  onClick={handleVerifyAndCapture}
                  disabled={isProcessing || f?.status === 'INVALID_TRACKING_FRAUD'}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition cursor-pointer shadow-xs disabled:opacity-40"
                  title="Verify carrier tracking and release PayPal escrow hold"
                >
                  {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  <span>Verify Tracking & Release</span>
                </button>
              </>
            )}

            {transaction.status !== 'ESCROW_LOCKED' && (
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-xs font-semibold text-white transition cursor-pointer"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
