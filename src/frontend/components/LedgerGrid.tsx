'use client';

import React, { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { LedgerTransaction } from '@/backend/types';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../utils/formatters';
import { ExternalLink, RefreshCw } from 'lucide-react';

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
  const columnDefs = useMemo<ColDef<LedgerTransaction>[]>(() => [
    {
      field: 'orderNumber',
      headerName: 'PO #',
      width: 130,
      cellRenderer: (params: ICellRendererParams<LedgerTransaction>) => (
        <span className="font-mono font-semibold text-sky-400">
          {params.value}
        </span>
      ),
      filter: true
    },
    {
      field: 'createdAt',
      headerName: 'Date',
      width: 120,
      valueFormatter: (params) => formatDate(params.value),
      sort: 'desc'
    },
    {
      field: 'title',
      headerName: 'Purchase Description',
      flex: 2,
      minWidth: 220,
      cellRenderer: (params: ICellRendererParams<LedgerTransaction>) => (
        <div>
          <div className="font-medium text-slate-100 truncate">{params.data?.title}</div>
          <div className="text-[11px] text-slate-400">Req: {params.data?.requestedBy}</div>
        </div>
      )
    },
    {
      field: 'department',
      headerName: 'Dept',
      width: 130,
      filter: true
    },
    {
      field: 'supplier',
      headerName: 'Supplier / Vendor',
      width: 160,
      filter: true
    },
    {
      field: 'totalAmount',
      headerName: 'Amount',
      width: 130,
      cellRenderer: (params: ICellRendererParams<LedgerTransaction>) => (
        <span className="font-mono font-bold text-slate-100">
          {formatCurrency(params.value || 0, params.data?.currency)}
        </span>
      )
    },
    {
      field: 'paypalOrderId',
      headerName: 'PayPal Reference',
      width: 200,
      cellRenderer: (params: ICellRendererParams<LedgerTransaction>) => {
        const refId = params.data?.paypalOrderId || params.data?.paypalInvoiceId || 'Pending';
        const url = params.data?.paypalPaymentUrl;
        return (
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="text-slate-300 truncate">{refId}</span>
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:text-blue-300"
                title="View in PayPal Sandbox"
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
      width: 150,
      cellRenderer: (params: ICellRendererParams<LedgerTransaction>) => {
        const status = params.value || 'UNKNOWN';
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${getStatusBadgeClass(status)}`}>
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

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Enterprise Settlement Ledger</span>
            <span className="text-xs font-normal px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
              AG Grid Powered
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time audit log of all autonomous agent purchase authorizations & PayPal transactions
          </p>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Ledger</span>
          </button>
        )}
      </div>

      {/* The AG Grid Table */}
      <div className="ag-theme-quartz-dark w-full h-[360px] rounded-lg overflow-hidden border border-slate-800">
        <AgGridReact<LedgerTransaction>
          rowData={transactions}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          animateRows={true}
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[5, 10, 20]}
          rowSelection={{ mode: 'singleRow' }}
        />
      </div>
    </div>
  );
};
