'use client';

import React, { useMemo, useState, useRef, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  ModuleRegistry,
  AllCommunityModule,
  ColDef,
  ICellRendererParams,
  RowClickedEvent,
  GridApi,
  GridReadyEvent,
  SelectionChangedEvent,
  RowSelectionOptions,
  SelectionColumnDef
} from 'ag-grid-community';
import { LedgerTransaction } from '@/backend/types';
import { formatCurrency, formatDate, getTrustScoreBadge } from '../utils/formatters';
import { ExternalLink, RefreshCw, Search, Download, Filter, CheckCircle2, Lock, RotateCcw, ShieldCheck, Check, X, CheckSquare, Zap, Truck, AlertTriangle } from 'lucide-react';
import { OrderDetailsModal } from './OrderDetailsModal';
import { useToast } from './Toast';

ModuleRegistry.registerModules([AllCommunityModule]);

interface LedgerGridProps {
  transactions: LedgerTransaction[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const LedgerGrid: React.FC<LedgerGridProps> = ({
  transactions,
  isLoading,
  onRefresh
}) => {
  const { showToast } = useToast();
  const gridRef = useRef<AgGridReact<LedgerTransaction>>(null);
  const [gridApi, setGridApi] = useState<GridApi<LedgerTransaction> | null>(null);
  const [selectedTx, setSelectedTx] = useState<LedgerTransaction | null>(null);
  const [quickFilterText, setQuickFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showFloatingFilters, setShowFloatingFilters] = useState<boolean>(false);
  const [selectedCount, setSelectedCount] = useState<number>(0);
  const [selectedTotalAmount, setSelectedTotalAmount] = useState<number>(0);
  const [inlineLoadingId, setInlineLoadingId] = useState<string | null>(null);

  // Quick inline actions directly from AG Grid cell
  const handleInlineAction = useCallback(async (id: string, action: 'VERIFY_AND_CAPTURE' | 'DISPUTE_AND_REFUND', e: React.MouseEvent) => {
    e.stopPropagation();
    setInlineLoadingId(id);
    try {
      const res = await fetch('/api/ledger', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          action,
          reason: action === 'DISPUTE_AND_REFUND' ? 'Supplier tracking verification failed / synthetic tracking fraud' : undefined
        })
      });

      if (res.ok) {
        showToast(
          action === 'VERIFY_AND_CAPTURE' ? 'Carrier Tracking Verified & Escrow Released' : 'Fulfillment Breach Disputed & Refunded',
          action === 'VERIFY_AND_CAPTURE' ? 'POST /v2/payments/authorizations/{id}/capture executed (+2 broker bonus)' : 'POST /v2/payments/captures/{id}/refund executed (-15 broker slashed)',
          action === 'VERIFY_AND_CAPTURE' ? 'success' : 'info'
        );
        if (onRefresh) onRefresh();
      } else {
        const errData = await res.json().catch(() => null);
        showToast('Action Notice', errData?.error || 'Transaction status already updated', 'warning');
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error(err);
      showToast('Action Failed', 'Could not update escrow status', 'warning');
    } finally {
      setInlineLoadingId(null);
    }
  }, [showToast, onRefresh]);

  // A2A Trust & Settlement Status (Clean Stripe / Mercury dot + label)
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DIRECT_SETTLED':
        return (
          <div className="flex items-center gap-2 h-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span className="text-xs font-medium text-slate-700">Direct Settled</span>
          </div>
        );

      case 'ESCROW_LOCKED':
        return (
          <div className="flex items-center gap-2 h-full">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
            <span className="text-xs font-medium text-amber-900">In Escrow</span>
          </div>
        );

      case 'VERIFIED_CAPTURED':
        return (
          <div className="flex items-center gap-2 h-full">
            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
            <span className="text-xs font-medium text-slate-700">Escrow Released</span>
          </div>
        );

      case 'DISPUTED_REFUNDED':
        return (
          <div className="flex items-center gap-2 h-full">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
            <span className="text-xs font-medium text-slate-700">Refunded</span>
          </div>
        );

      default:
        return <span className="text-xs text-slate-500">{status}</span>;
    }
  };

  // Pinned Bottom Grand Total Row
  const pinnedBottomRowData = useMemo<Partial<LedgerTransaction>[]>(() => {
    if (!transactions.length) return [];
    const total = transactions.reduce((acc, t) => acc + (t.totalAmount || 0), 0);
    const uniqueAgentCollaterals = new Map<string, number>();
    transactions.forEach(t => {
      if (!uniqueAgentCollaterals.has(t.sellerAgentId)) {
        uniqueAgentCollaterals.set(t.sellerAgentId, t.stakeCollateral || 0);
      }
    });
    const totalStakeCollateral = Array.from(uniqueAgentCollaterals.values()).reduce((sum, v) => sum + v, 0);

    return [
      {
        id: 'pinned-summary-row',
        contractId: `Total (${transactions.length} Contracts)`,
        createdAt: '',
        title: '',
        buyerAgent: '',
        sellerAgentName: '',
        sellerAgentHandle: '',
        sellerTrustScore: 0,
        stakeCollateral: totalStakeCollateral,
        routingMode: 'INSTANT_DIRECT',
        status: 'DIRECT_SETTLED',
        deliverableCount: transactions.reduce((acc, t) => acc + (t.deliverableCount || 0), 0),
        totalAmount: total,
        currency: transactions[0]?.currency || 'USD',
        artifacts: []
      }
    ];
  }, [transactions]);

  // AG Grid #2 Columns matching the Master Distributor B2B Ledger Spec:
  // Transaction ID | Client Agent | Merchant | Product | Client Paid (PayPal) | You Paid Merchant | Margin + Comm. | Status & Actions
  const columnDefs = useMemo<ColDef<LedgerTransaction>[]>(() => [
    {
      field: 'contractId',
      headerName: 'Transaction ID',
      width: 145,
      pinned: 'left',
      lockPinned: true,
      filter: 'agTextColumnFilter',
      floatingFilter: showFloatingFilters,
      cellRenderer: (params: ICellRendererParams<LedgerTransaction>) => {
        if (params.node.rowPinned) {
          return <span className="font-mono text-xs font-bold text-slate-900">{params.value}</span>;
        }
        return (
          <span className="font-mono text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer flex items-center gap-1">
            {params.value}
          </span>
        );
      },
      tooltipValueGetter: (params) => params.node?.rowPinned ? 'Summary' : `Inspect audit ${params.value}`
    },
    {
      field: 'buyerAgent',
      headerName: 'Client Agent',
      width: 145,
      filter: 'agTextColumnFilter',
      cellRenderer: (params: ICellRendererParams<LedgerTransaction>) => {
        if (params.node.rowPinned) return null;
        return (
          <div className="flex items-center h-full">
            <span className="font-mono text-xs text-slate-700 truncate font-medium">
              {params.value?.replace('agent://', '') || 'treasury-prime.eth'}
            </span>
          </div>
        );
      }
    },
    {
      field: 'merchantDomain',
      headerName: 'Merchant',
      width: 135,
      filter: 'agTextColumnFilter',
      floatingFilter: showFloatingFilters,
      cellRenderer: (params: ICellRendererParams<LedgerTransaction>) => {
        if (params.node.rowPinned) return null;
        const merchant = params.data?.merchantDomain || 'staples.com';
        return (
          <div className="flex flex-col justify-center h-full py-1 leading-tight">
            <span className="font-mono text-xs font-bold text-slate-900">{merchant}</span>
            <span className="text-[10px] text-slate-400 font-mono">
              {merchant.includes('staples') ? 'Staples B2B' :
               merchant.includes('newegg') ? 'Newegg Direct' :
               merchant.includes('michaels') ? 'Michaels' : 'Vendor'}
            </span>
          </div>
        );
      }
    },
    {
      field: 'procuredItem',
      headerName: 'Product & Qty',
      flex: 1.6,
      minWidth: 190,
      filter: 'agTextColumnFilter',
      floatingFilter: showFloatingFilters,
      cellRenderer: (params: ICellRendererParams<LedgerTransaction>) => {
        if (params.node.rowPinned) return null;
        const qty = params.data?.quantityProcured || 100;
        const item = params.data?.procuredItem || params.data?.title || 'Ballpoint Pens';

        return (
          <div className="flex flex-col justify-center h-full py-1 leading-tight overflow-hidden">
            <span className="font-semibold text-slate-900 truncate text-xs">{item}</span>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5">{qty.toLocaleString()} units</span>
          </div>
        );
      }
    },
    {
      field: 'clientPaidUsd',
      headerName: 'Client Paid (PayPal)',
      width: 150,
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      floatingFilter: showFloatingFilters,
      cellRenderer: (params: ICellRendererParams<LedgerTransaction>) => {
        const val = params.value ?? params.data?.totalAmount ?? 0;
        return (
          <div className="flex items-center justify-end gap-1.5 h-full">
            <span className={`font-mono text-xs font-bold ${params.node.rowPinned ? 'text-blue-700' : 'text-slate-900'}`}>
              {formatCurrency(val, params.data?.currency)}
            </span>
            {!params.node.rowPinned && (
              <span className="text-[9px] font-mono bg-blue-50 text-blue-700 px-1 py-0.5 rounded border border-blue-200">
                PayPal
              </span>
            )}
          </div>
        );
      }
    },
    {
      field: 'merchantCostUsd',
      headerName: 'You Paid Merchant',
      width: 135,
      type: 'numericColumn',
      filter: 'agNumberColumnFilter',
      floatingFilter: showFloatingFilters,
      cellRenderer: (params: ICellRendererParams<LedgerTransaction>) => {
        if (params.node.rowPinned) return null;
        const cost = params.value ?? ((params.data?.totalAmount || 0) * 0.92);
        return (
          <div className="flex items-center justify-end h-full">
            <span className="font-mono text-xs text-slate-600">
              {formatCurrency(cost, params.data?.currency)}
            </span>
          </div>
        );
      }
    },
    {
      field: 'netMarginUsd',
      headerName: 'Margin + Commission',
      width: 165,
      type: 'numericColumn',
      cellRenderer: (params: ICellRendererParams<LedgerTransaction>) => {
        if (params.node.rowPinned) return null;
        const margin = params.value ?? 1.50;
        const comm = params.data?.channel3CommissionUsd ?? 0.70;
        return (
          <div className="flex flex-col justify-center items-end h-full py-1 leading-tight">
            <span className="font-mono text-xs font-bold text-emerald-700">
              +{formatCurrency(margin, params.data?.currency)}
            </span>
            <span className="text-[10px] font-mono text-emerald-600">
              +${comm.toFixed(2)} Channel3 Comm.
            </span>
          </div>
        );
      }
    },
    {
      field: 'status',
      headerName: 'Status & Execution',
      width: 175,
      filter: 'agTextColumnFilter',
      floatingFilter: showFloatingFilters,
      cellRenderer: (params: ICellRendererParams<LedgerTransaction>) => {
        if (params.node.rowPinned) return null;
        const tx = params.data;
        if (!tx) return null;
        return (
          <div className="flex items-center h-full">
            {getStatusBadge(tx.status)}
          </div>
        );
      }
    },
    {
      field: 'fulfillment',
      headerName: 'Fulfillment & Restitution',
      width: 220,
      minWidth: 200,
      cellRenderer: (params: ICellRendererParams<LedgerTransaction>) => {
        if (params.node.rowPinned) return null;
        const tx = params.data;
        if (!tx) return null;
        const f = tx.fulfillment;

        if (tx.status === 'ESCROW_LOCKED') {
          const isRowLoading = inlineLoadingId === tx.id;
          const isFraud = f?.status === 'INVALID_TRACKING_FRAUD';

          return (
            <div className="flex items-center justify-between gap-1.5 h-full w-full pr-1">
              <div className="flex items-center gap-1 overflow-hidden font-mono text-[11px]">
                {isFraud ? (
                  <span className="text-rose-600 font-bold truncate flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
                    <span>Fake Tracking</span>
                  </span>
                ) : (
                  <span className="text-blue-700 truncate font-semibold flex items-center gap-1">
                    <Truck className="w-3 h-3 text-blue-500 shrink-0" />
                    <span className="truncate">{f?.trackingNumber || 'Pending'}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  disabled={isRowLoading || isFraud}
                  onClick={(e) => handleInlineAction(tx.id, 'VERIFY_AND_CAPTURE', e)}
                  className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold transition cursor-pointer shadow-xs disabled:opacity-40"
                  title="Verify carrier tracking and release escrow funds"
                >
                  Release
                </button>
                <button
                  disabled={isRowLoading}
                  onClick={(e) => handleInlineAction(tx.id, 'DISPUTE_AND_REFUND', e)}
                  className="px-2 py-0.5 rounded bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-rose-700 text-[11px] font-semibold transition cursor-pointer disabled:opacity-40"
                  title="Dispute fake tracking and execute PayPal restitution refund"
                >
                  Refund
                </button>
              </div>
            </div>
          );
        }

        return (
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600 h-full">
            <Truck className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate">{f?.carrier || 'Carrier'}: {f?.trackingNumber || 'Delivered'}</span>
          </div>
        );
      }
    }
  ], [showFloatingFilters, inlineLoadingId, handleInlineAction]);

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true,
    resizable: true,
    suppressMovable: false,
    enableCellTextSelection: true,
    minWidth: 100
  }), []);

  const rowSelection = useMemo<RowSelectionOptions<LedgerTransaction>>(() => ({
    mode: 'multiRow',
    checkboxes: true,
    headerCheckbox: true,
    enableClickSelection: false
  }), []);

  const selectionColumnDef = useMemo<SelectionColumnDef>(() => ({
    pinned: 'left',
    lockPinned: true,
    width: 45,
    minWidth: 45,
    maxWidth: 45,
    resizable: false,
    suppressMovable: true
  }), []);

  const onGridReady = useCallback((params: GridReadyEvent<LedgerTransaction>) => {
    setGridApi(params.api);
  }, []);

  const handleRowClicked = (event: RowClickedEvent<LedgerTransaction>) => {
    if (event.node.rowPinned) return;
    const target = event.event?.target as HTMLElement | null;
    if (target && (target.closest('a') || target.closest('button') || target.tagName === 'A' || target.tagName === 'BUTTON')) {
      return;
    }
    if (event.data) {
      setSelectedTx(event.data);
    }
  };

  const onSelectionChanged = useCallback((event: SelectionChangedEvent<LedgerTransaction>) => {
    const selectedNodes = event.api.getSelectedNodes();
    setSelectedCount(selectedNodes.length);
    const sum = selectedNodes.reduce((acc, node) => acc + (node.data?.totalAmount || 0), 0);
    setSelectedTotalAmount(sum);
  }, []);

  const handleExportCSV = () => {
    if (gridApi) {
      gridApi.exportDataAsCsv({
        fileName: `procureai-procurement-ledger-${new Date().toISOString().split('T')[0]}.csv`,
        columnKeys: ['contractId', 'buyerAgent', 'sellerAgentName', 'merchantDomain', 'totalAmount', 'status', 'paypalOrderId']
      });
    }
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    if (!gridApi) return;

    if (status === 'ALL') {
      gridApi.setColumnFilterModel('status', null).then(() => gridApi.onFilterChanged());
    } else {
      gridApi.setColumnFilterModel('status', {
        type: 'equals',
        filter: status
      }).then(() => gridApi.onFilterChanged());
    }
  };

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Step 4: Procurement Audit & Escrow Ledger Grid</span>
              <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                AG Grid #2
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Audit log of executed Procurement Broker transactions, supplier tracking verifications, and PayPal escrow settlements
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFloatingFilters(prev => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${showFloatingFilters
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              title="Toggle column filter inputs"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 border border-slate-200 transition cursor-pointer"
              title="Export grid data to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-medium text-white transition cursor-pointer disabled:opacity-50"
                title="Sync with PayPal Sandbox"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Sync</span>
              </button>
            )}
          </div>
        </div>

        {/* Search & Status Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={quickFilterText}
              onChange={(e) => setQuickFilterText(e.target.value)}
              placeholder="Filter by Broker, Merchant, or Transaction ID..."
              className="w-full bg-slate-50/80 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs w-full sm:w-auto overflow-x-auto">
            {[
              { id: 'ALL', label: 'All Transactions' },
              { id: 'ESCROW_LOCKED', label: 'In Escrow' },
              { id: 'DIRECT_SETTLED', label: 'Direct Settled' },
              { id: 'VERIFIED_CAPTURED', label: 'Released' },
              { id: 'DISPUTED_REFUNDED', label: 'Refunded' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleStatusFilterChange(tab.id)}
                className={`px-3 py-1.5 rounded-md font-medium text-xs whitespace-nowrap transition cursor-pointer ${statusFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Multi-Selection Summary Metric Banner */}
        {selectedCount > 0 && (
          <div className="mb-3 p-2.5 px-3 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900 animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-blue-600" />
              <span>
                <strong>{selectedCount}</strong> {selectedCount === 1 ? 'transaction' : 'transactions'} selected
              </span>
              <span className="text-blue-300">|</span>
              <span>
                Total Volume:{' '}
                <strong className="font-mono text-blue-800">
                  {formatCurrency(selectedTotalAmount, transactions[0]?.currency)}
                </strong>
              </span>
            </div>
            <button
              onClick={() => gridApi?.deselectAll()}
              className="text-blue-600 hover:text-blue-800 text-[11px] font-semibold underline cursor-pointer"
            >
              Clear selection
            </button>
          </div>
        )}

        {/* Grid Container */}
        <div
          className="ag-theme-quartz w-full rounded-xl overflow-hidden border border-slate-200"
          style={{ height: '560px', width: '100%' }}
        >
          <AgGridReact<LedgerTransaction>
            ref={gridRef}
            rowData={transactions}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pinnedBottomRowData={pinnedBottomRowData}
            quickFilterText={quickFilterText}
            rowSelection={rowSelection}
            selectionColumnDef={selectionColumnDef}
            rowHeight={52}
            headerHeight={40}
            floatingFiltersHeight={38}
            onGridReady={onGridReady}
            onRowClicked={handleRowClicked}
            onSelectionChanged={onSelectionChanged}
            animateRows={true}
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[5, 10, 25, 50]}
            columnHoverHighlight={false}
            enableCellTextSelection={true}
          />
        </div>
      </div>

      {/* Transaction & Escrow Verification Modal */}
      {selectedTx && (
        <OrderDetailsModal
          transaction={transactions.find(t => t.id === selectedTx.id || t.contractId === selectedTx.contractId) || selectedTx}
          onClose={() => setSelectedTx(null)}
          onStatusUpdated={() => {
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </>
  );
};
