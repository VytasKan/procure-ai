import React, { useState } from 'react';
import { 
  CreditCard, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Download, 
  ArrowUpRight, 
  ShieldCheck, 
  Building2, 
  DollarSign, 
  ChevronRight,
  Receipt,
  RotateCcw,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { LedgerTransaction } from '@/backend/types';
import { formatCurrency } from '../utils/formatters';

interface BuyerInvoicesTabProps {
  transactions: LedgerTransaction[];
  onRefresh?: () => void;
  onSelectOrder?: (tx: LedgerTransaction) => void;
}

export const BuyerInvoicesTab: React.FC<BuyerInvoicesTabProps> = ({
  transactions,
  onRefresh,
  onSelectOrder
}) => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'INVOICED' | 'ESCROW' | 'SETTLED'>('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<LedgerTransaction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Buyer relevant transactions (filter treasury prime / acme)
  const buyerTx = transactions.filter(t => 
    t.buyerAgent.includes('treasury-prime') || 
    t.buyerAgent.includes('acme') || 
    !t.buyerAgent.includes('rogue')
  );

  // Financial aggregates
  const totalSettledUsd = buyerTx
    .filter(t => t.status === 'DIRECT_SETTLED' || t.status === 'VERIFIED_CAPTURED')
    .reduce((sum, t) => sum + (t.clientPaidUsd || t.totalAmount || 0), 0);

  const activeEscrowLockedUsd = buyerTx
    .filter(t => t.status === 'ESCROW_LOCKED')
    .reduce((sum, t) => sum + (t.clientPaidUsd || t.totalAmount || 0), 0);

  const upcomingInvoices = buyerTx.filter(t => t.status === 'DIRECT_SETTLED');
  const activeEscrows = buyerTx.filter(t => t.status === 'ESCROW_LOCKED');
  const settledPayments = buyerTx.filter(t => t.status === 'VERIFIED_CAPTURED' || t.status === 'DIRECT_SETTLED');

  // Filtered list
  const filteredList = buyerTx.filter(t => {
    if (filterMode === 'INVOICED' && t.status !== 'DIRECT_SETTLED') return false;
    if (filterMode === 'ESCROW' && t.status !== 'ESCROW_LOCKED') return false;
    if (filterMode === 'SETTLED' && t.status !== 'VERIFIED_CAPTURED') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchItem = (t.procuredItem || t.title || '').toLowerCase().includes(q);
      const matchPO = t.contractId.toLowerCase().includes(q);
      const matchPaypal = (t.paypalOrderId || t.paypalCaptureId || '').toLowerCase().includes(q);
      return matchItem || matchPO || matchPaypal;
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full space-y-4 overflow-y-auto pr-1">
      {/* Financial Health Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 shrink-0">
        <div className="p-3.5 bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-2xl shadow-xs relative overflow-hidden border border-blue-800">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-medium text-blue-200">PayPal Agent Wallet</span>
            <span className="p-1 rounded-md bg-white/10 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 text-xl font-bold font-mono tracking-tight">$4,250.00</div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-blue-200/80">
            <span>acme-buyer@business</span>
            <span className="text-emerald-400 font-semibold">Active Ready</span>
          </div>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-medium text-slate-500">Active Escrow Holds</span>
            <span className="p-1 rounded-md bg-amber-50 text-amber-600 border border-amber-200">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-amber-700 tracking-tight">
            ${activeEscrowLockedUsd.toFixed(2)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>{activeEscrows.length} POs pending delivery</span>
            <span className="text-amber-600 font-bold">AUTHORIZE</span>
          </div>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-medium text-slate-500">Settled Procurement</span>
            <span className="p-1 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-emerald-700 tracking-tight">
            ${totalSettledUsd.toFixed(2)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Past 30 Days</span>
            <span className="text-emerald-600 font-bold">CAPTURED</span>
          </div>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-medium text-slate-500">Autonomous Spend Cap</span>
            <span className="p-1 rounded-md bg-blue-50 text-blue-600 border border-blue-200">
              <DollarSign className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-slate-900 tracking-tight">
            $500.00 <span className="text-xs text-slate-400 font-normal">/ day</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Single &le; $50 Auto-Pay</span>
            <span className="text-blue-600 font-semibold">&gt; $50 Escrow</span>
          </div>
        </div>
      </div>

      {/* Main Transactions & Invoices Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col flex-1 min-h-[460px] overflow-hidden">
        {/* Controls Toolbar */}
        <div className="p-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
          <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-xl">
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition ${
                filterMode === 'ALL'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Activity ({buyerTx.length})
            </button>
            <button
              onClick={() => setFilterMode('INVOICED')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 ${
                filterMode === 'INVOICED'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3 h-3 text-blue-600" />
              <span>Invoiced / Due ({upcomingInvoices.length})</span>
            </button>
            <button
              onClick={() => setFilterMode('ESCROW')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 ${
                filterMode === 'ESCROW'
                  ? 'bg-white text-amber-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3 h-3 text-amber-600" />
              <span>Escrow Holds ({activeEscrows.length})</span>
            </button>
            <button
              onClick={() => setFilterMode('SETTLED')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 ${
                filterMode === 'SETTLED'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-3 h-3 text-emerald-600" />
              <span>Settled Receipts</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search PO #, items, or PayPal IDs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 w-56 font-mono"
              />
            </div>
            {onRefresh && (
              <button
                onClick={onRefresh}
                title="Refresh Ledger"
                className="p-1.5 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Invoices & Payments Table / List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredList.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-semibold">No transactions match your search filter.</p>
            </div>
          ) : (
            filteredList.map((tx) => {
              const isSettled = tx.status === 'VERIFIED_CAPTURED' || tx.status === 'DIRECT_SETTLED';
              const isEscrow = tx.status === 'ESCROW_LOCKED';
              const isDisputed = tx.status === 'DISPUTED_REFUNDED';
              const amount = tx.clientPaidUsd || tx.totalAmount || 0;
              const dateStr = new Date(tx.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <div
                  key={tx.id}
                  className="p-3.5 hover:bg-slate-50/80 transition flex items-center justify-between gap-4 cursor-pointer group"
                  onClick={() => setSelectedInvoice(tx)}
                >
                  {/* Left: Invoice Badge & Details */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        isDisputed
                          ? 'bg-rose-50 border-rose-200 text-rose-600'
                          : isEscrow
                          ? 'bg-amber-50 border-amber-200 text-amber-600'
                          : 'bg-blue-50 border-blue-200 text-blue-600'
                      }`}
                    >
                      {isDisputed ? (
                        <RotateCcw className="w-4 h-4" />
                      ) : isEscrow ? (
                        <ShieldCheck className="w-4 h-4" />
                      ) : (
                        <Receipt className="w-4 h-4" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {tx.contractId}
                        </span>
                        <span className="text-[10px] text-slate-400">• {dateStr}</span>
                        {tx.paypalCaptureId && (
                          <span className="text-[9px] font-mono bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded border border-emerald-200">
                            Capture: {tx.paypalCaptureId}
                          </span>
                        )}
                        {tx.paypalAuthId && !tx.paypalCaptureId && (
                          <span className="text-[9px] font-mono bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded border border-amber-200">
                            Auth: {tx.paypalAuthId}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-700 font-medium truncate mt-0.5">
                        {tx.procuredItem || tx.title}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                        <span>Merchant: <strong className="text-slate-700">{tx.merchantDomain || 'ProcureAI Certified'}</strong></span>
                        {tx.fulfillment && (
                          <span>Carrier: <strong className="text-slate-700">{tx.fulfillment.carrier} ({tx.fulfillment.trackingNumber})</strong></span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Payment Status, Price & Invoice Button */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="font-mono text-sm font-bold text-slate-900">
                        {formatCurrency(amount, tx.currency)}
                      </div>
                      <div className="mt-0.5">
                        {isDisputed ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                            Refunded (${(tx.refundAmount || amount).toFixed(2)})
                          </span>
                        ) : isEscrow ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            <Clock className="w-2.5 h-2.5" /> Escrow Held
                          </span>
                        ) : tx.status === 'DIRECT_SETTLED' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                            <Clock className="w-2.5 h-2.5" /> Due on Delivery
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Paid via PayPal
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedInvoice(tx);
                      }}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg text-xs font-semibold transition border border-slate-200 hover:border-blue-200 flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Invoice</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Spend Policy Note */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>All corporate invoices auto-reconcile and settle via connected PayPal Sandbox credentials.</span>
          </div>
          <span className="font-mono text-[10px] text-slate-500">
            api-m.sandbox.paypal.com • OAuth 2.0
          </span>
        </div>
      </div>

      {/* Commercial Invoice Modal / Breakdown */}
      {selectedInvoice && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedInvoice(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Invoice Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-base">Commercial Invoice</span>
                  <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    B2B PAID
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-500 mt-1">
                  Invoice #: INV-{selectedInvoice.contractId}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-blue-700">ProcureAI Fulfillment Inc.</div>
                <div className="text-[10px] text-slate-400">Master Merchant of Record</div>
              </div>
            </div>

            {/* Bill To & Settlement Details */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Billed To</span>
                <strong className="text-slate-800">Acme Treasury Bot</strong>
                <div className="text-[11px] text-slate-500">{selectedInvoice.buyerAgent}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Payment Method</span>
                <div className="flex items-center gap-1 text-slate-800 font-semibold">
                  <span>PayPal Corporate Wallet</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {selectedInvoice.paypalOrderId ? `Order: ${selectedInvoice.paypalOrderId}` : 'OAuth 2.0 Auth'}
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Deliverables & Line Items
              </span>
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                {selectedInvoice.artifacts && selectedInvoice.artifacts.length > 0 ? (
                  selectedInvoice.artifacts.map((art, idx) => (
                    <div key={idx} className="p-2.5 flex justify-between items-center bg-white">
                      <div>
                        <div className="font-semibold text-slate-900">{art.name}</div>
                        <div className="text-[10px] font-mono text-slate-400">
                          SKU: {art.sku} • Supplier: {art.retailer}
                        </div>
                      </div>
                      <div className="font-mono font-bold text-slate-900">
                        ${art.unitPrice.toFixed(2)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-2.5 flex justify-between items-center bg-white">
                    <div>
                      <div className="font-semibold text-slate-900">
                        {selectedInvoice.procuredItem || selectedInvoice.title}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        Qty: {selectedInvoice.quantityProcured || 1} units
                      </div>
                    </div>
                    <div className="font-mono font-bold text-slate-900">
                      ${(selectedInvoice.clientPaidUsd || selectedInvoice.totalAmount).toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Total Calculation */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Wholesale:</span>
                <span>${(selectedInvoice.merchantCostUsd || (selectedInvoice.totalAmount * 0.9)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Preferred Partner Rebate (5%):</span>
                <span>-${((selectedInvoice.totalAmount * 0.05)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>ProcureAI Priority Freight:</span>
                <span className="text-emerald-700 font-semibold">FREE (B2B SLA)</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-slate-900 font-bold text-sm">
                <span>Net Invoiced Total:</span>
                <span>${(selectedInvoice.clientPaidUsd || selectedInvoice.totalAmount).toFixed(2)} USD</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-2">
              <div className="text-[10px] text-slate-400 font-mono">
                Status: {selectedInvoice.status}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    alert(`Invoice INV-${selectedInvoice.contractId} exported to PDF/accounting ledger.`);
                    setSelectedInvoice(null);
                  }}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF Receipt</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
