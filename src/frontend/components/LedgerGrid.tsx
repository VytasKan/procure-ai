'use client';

import React, { useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule, ColDef, ICellRendererParams, RowClickedEvent } from 'ag-grid-community';
import { LedgerTransaction } from '@/backend/types';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../utils/formatters';
import { ExternalLink, RefreshCw, Search, Download } from 'lucide-react';
import { OrderDetailsModal } from './OrderDetailsModal';

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
  const [selectedTx, setSelectedTx] = useState<LedgerTransaction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = 
        !searchQuery ||
        tx.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.paypalOrderId && tx.paypalOrderId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (tx.paypalInvoiceId && tx.paypalInvoiceId.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = 
        statusFilter === 'ALL' || 
        tx.status.toUpperCase() === statusFilter.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [transactions, searchQuery, statusFilter]);

  const columnDefs = useMemo<ColDef<LedgerTransaction>[]>(() => [
    {
      field: 'orderNumber',
      headerName: 'PO #',
      width: 135,
      cellRenderer: (params: ICellRendererParams<LedgerTransaction>) => (
        <span className="font-mono text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer flex items-center gap-1">
          {params.value}
        </span>
      )
    },
    {
      field: 'createdAt',
      headerName: 'Date',
      width: 110,
      valueFormatter: (params) => formatDate(params.value),
      sort: 'desc'
    },
    {
      field: 'title',
      headerName: 'Purchase Description',
      flex: 2,
      minWidth: 220,
      cellRenderer: (params: ICellRendererParams<LedgerTransaction>) => (
        <div className="py-1">
          <div className="font-semibold text-slate-900 truncate text-xs">{params.data?.title}</div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
            <span className="text-slate-700 font-medium">{params.data?.department}</span>
            <span>•</span>
            <span>Req: {params.data?.requestedBy}</span>
          </div>
        </div>
      )
    },
    {
      field: 'supplier',
      headerName: 'Supplier / Retailer',
      width: 160,
      cellRenderer: (params: ICellRendererParams<LedgerTransaction>) => (
        <span className="text-xs text-slate-700 font-medium truncate block">
          {params.value}
        </span>
      )
    },
    {
      field: 'totalAmount',
      headerName: 'Amount',
      width: 125,
      cellRenderer: (params: ICellRendererParams<LedgerTransaction>) => (
        <span className="font-mono font-bold text-xs text-slate-900">
          {formatCurrency(params.value || 0, params.data?.currency)}
        </span>
      )
    },
    {
      field: 'paypalOrderId',
      headerName: 'PayPal Settlement',
      width: 190,
      cellRenderer: (params: ICellRendererParams<LedgerTransaction>) => {
        const refId = params.data?.paypalOrderId || params.data?.paypalInvoiceId || 'Pending';
        const url = params.data?.paypalPaymentUrl;
        return (
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <span className="text-slate-700 truncate max-w-[130px]">{refId}</span>
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-blue-600 hover:text-blue-800 transition p-1 hover:bg-blue-50 rounded"
                title="Inspect in PayPal Sandbox"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        );
      }
    },
    {
      field: 'status',
      headerName: 'Ledger Status',
      width: 135,
      cellRenderer: (params: ICellRendererParams<LedgerTransaction>) => {
        const status = params.value || 'UNKNOWN';
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadgeClass(status)}`}>
            {status}
          </span>
        );
      }
    }
  ], []);

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true,
    resizable: true,
    suppressMovable: true
  }), []);

  const handleRowClicked = (event: RowClickedEvent<LedgerTransaction>) => {
    if (event.data) {
      setSelectedTx(event.data);
    }
  };

  const handleExportCSV = () => {
    const headers = ['PO Number', 'Date', 'Description', 'Department', 'Supplier', 'Amount', 'Currency', 'PayPal Reference', 'Status'];
    const rows = filteredTransactions.map(t => [
      t.orderNumber,
      formatDate(t.createdAt),
      `"${t.title.replace(/"/g, '""')}"`,
      t.department,
      `"${t.supplier}"`,
      t.totalAmount,
      t.currency,
      t.paypalOrderId || t.paypalInvoiceId || '',
      t.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `procureai-ledger-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Enterprise Settlement Ledger
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                AG Grid Powered
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Audited transaction stream with live PayPal Sandbox settlement verification
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 border border-slate-200 transition cursor-pointer"
              title="Export CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-xs font-semibold text-blue-700 border border-blue-200 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Sync</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search PO, vendor, title, or PayPal ID..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Quick Status Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-[11px] w-full sm:w-auto">
            {['ALL', 'COMPLETED', 'SHIPPED', 'APPROVED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                  statusFilter === st 
                    ? 'bg-white text-slate-900 shadow-xs font-semibold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'ALL' ? 'All' : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* The AG Grid Table */}
        <div 
          className="ag-theme-quartz w-full rounded-xl overflow-hidden border border-slate-200 shadow-xs"
          style={{ height: '460px', width: '100%' }}
        >
          <AgGridReact<LedgerTransaction>
            rowData={filteredTransactions}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            animateRows={true}
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[5, 10, 25]}
            onRowClicked={handleRowClicked}
            rowSelection={{ mode: 'singleRow' }}
          />
        </div>

        <div className="mt-2 text-right">
          <span className="text-[10px] text-slate-400">
            Tip: Click any transaction row to inspect order manifest & shipment tracking
          </span>
        </div>
      </div>

      {/* Order Details Slide-over Modal */}
      {selectedTx && (
        <OrderDetailsModal
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
          onStatusUpdated={() => {
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </>
  );
};
