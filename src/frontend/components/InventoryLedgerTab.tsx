'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  ModuleRegistry,
  AllCommunityModule,
  ColDef,
  ICellRendererParams,
  GridReadyEvent
} from 'ag-grid-community';
import {
  AllEnterpriseModule
} from 'ag-grid-enterprise';
import { InventoryItem } from '@/backend/services/inventory-store';
import { formatCurrency } from '../utils/formatters';
import { 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingDown, 
  ShoppingCart, 
  ShieldCheck, 
  Search,
  Filter,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useToast } from './Toast';

// Register Enterprise & Community modules for Row Grouping, Filtering, Aggregation
ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

interface InventoryLedgerTabProps {
  onTriggerReorderPrompt: (prompt: string) => void;
}

export const InventoryLedgerTab: React.FC<InventoryLedgerTabProps> = ({
  onTriggerReorderPrompt
}) => {
  const { showToast } = useToast();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [quickFilter, setQuickFilter] = useState('');
  const [activeGroupMode, setActiveGroupMode] = useState<'category' | 'state' | 'none'>('category');
  const [isConsuming, setIsConsuming] = useState(false);
  const gridRef = useRef<AgGridReact<InventoryItem>>(null);

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleSimulateConsumption = async () => {
    try {
      setIsConsuming(true);
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CONSUME', percent: 0.35 })
      });
      const data = await res.json();
      if (data.items) {
        setItems(data.items);
        showToast(
          'Office Consumption Recorded',
          `Inventory levels updated. Deficits flagged in AG Grid!`,
          'info'
        );
      }
    } catch (err) {
      showToast('Error', 'Failed to simulate consumption', 'warning');
    } finally {
      setIsConsuming(false);
    }
  };

  const lowStockCount = items.filter(it => it.currentStock <= it.minThreshold).length;

  // AG Grid Column Definitions
  const colDefs = useMemo<ColDef<InventoryItem>[]>(() => {
    return [
      {
        field: 'category',
        headerName: 'Category',
        width: 160,
        enableRowGroup: true,
        rowGroup: activeGroupMode === 'category',
        hide: activeGroupMode === 'category'
      },
      {
        field: 'procurementState',
        headerName: 'State',
        width: 145,
        enableRowGroup: true,
        rowGroup: activeGroupMode === 'state',
        hide: activeGroupMode === 'state',
        cellRenderer: (params: ICellRendererParams<InventoryItem>) => {
          const state = params.value;
          if (!state) return null;
          if (state === 'Pending Auto-PO') {
            return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                <span>Pending Auto-PO</span>
              </span>
            );
          }
          if (state === 'Active Recurring') {
            return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>Active Recurring</span>
              </span>
            );
          }
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono text-slate-600 bg-slate-100 border border-slate-200">
              <span>{state}</span>
            </span>
          );
        }
      },
      {
        field: 'title',
        headerName: 'SKU & Deliverable Title',
        minWidth: 260,
        flex: 1,
        cellRenderer: (params: ICellRendererParams<InventoryItem>) => {
          const item = params.data;
          if (!item) return null;
          return (
            <div className="flex items-center gap-2.5 h-full">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-7 h-7 rounded-md object-cover bg-slate-100 border border-slate-200 shrink-0"
              />
              <div className="min-w-0 leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-1 py-0.2 rounded">
                    {item.sku}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-900 truncate mt-0.5" title={item.title}>
                  {item.title}
                </div>
              </div>
            </div>
          );
        }
      },
      {
        field: 'currentStock',
        headerName: 'On-Hand Level',
        width: 140,
        cellRenderer: (params: ICellRendererParams<InventoryItem>) => {
          const item = params.data;
          if (!item) return null;
          const isLow = item.currentStock <= item.minThreshold;
          const pct = Math.min(100, Math.round((item.currentStock / (item.minThreshold * 2)) * 100));

          return (
            <div className="flex flex-col justify-center h-full space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className={`font-mono font-bold ${isLow ? 'text-amber-700' : 'text-slate-900'}`}>
                  {item.currentStock} {item.unit}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Min: {item.minThreshold}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${isLow ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        }
      },
      {
        field: 'unitPrice',
        headerName: 'Unit Price',
        width: 105,
        type: 'numericColumn',
        valueFormatter: (p) => formatCurrency(p.value || 0)
      },
      {
        headerName: 'Replenishment Action',
        width: 145,
        cellRenderer: (params: ICellRendererParams<InventoryItem>) => {
          const item = params.data;
          if (!item) return null;
          const isLow = item.currentStock <= item.minThreshold;

          return (
            <div className="flex items-center h-full">
              <button
                onClick={() => {
                  onTriggerReorderPrompt(
                    `Replenish low stock: Order ${item.reorderQuantity} ${item.unit} of ${item.title} via ${item.preferredSupplier}`
                  );
                }}
                className={`w-full px-2.5 py-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer shadow-2xs ${
                  isLow
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <ShoppingCart className="w-3 h-3" />
                <span>Reorder {item.reorderQuantity}</span>
                <ArrowRight className="w-3 h-3 opacity-60" />
              </button>
            </div>
          );
        }
      }
    ];
  }, [activeGroupMode, onTriggerReorderPrompt]);

  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true,
    filter: true,
    resizable: true
  }), []);

  const autoGroupColumnDef = useMemo(() => ({
    headerName: 'Grouped Ledger View',
    minWidth: 260,
    cellRendererParams: {
      suppressCount: false
    }
  }), []);

  return (
    <div className="flex-1 flex flex-col h-full space-y-2.5">
      {/* Top Controls Toolbar: Search, Grouping, Actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5 truncate">
                <Package className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Office Inventory Ledger</span>
              </h3>
              {lowStockCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1 shrink-0">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  <span>{lowStockCount} Reorder Alerts</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Healthy Stock</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSimulateConsumption}
              disabled={isConsuming}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              title="Simulate daily office staff usage (-35% on-hand)"
            >
              <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
              <span>Simulate Usage</span>
            </button>

            <button
              onClick={() => {
                onTriggerReorderPrompt(`Auto-replenish all deficit items from inventory ledger`);
              }}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Auto-Replenish All</span>
            </button>
          </div>
        </div>

        {/* Search & Dynamic Grouping Selector */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[160px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              value={quickFilter}
              onChange={e => setQuickFilter(e.target.value)}
              placeholder="Search SKUs, items, suppliers..."
              className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition"
            />
          </div>

          {/* Grouping Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-medium shrink-0">
            <span className="text-[10px] text-slate-500 font-semibold px-1.5 flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-400" />
              <span className="hidden sm:inline">Group:</span>
            </span>
            <button
              onClick={() => setActiveGroupMode('category')}
              className={`px-2 py-0.5 rounded-md transition cursor-pointer text-xs ${
                activeGroupMode === 'category'
                  ? 'bg-white text-blue-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              By Category
            </button>
            <button
              onClick={() => setActiveGroupMode('state')}
              className={`px-2 py-0.5 rounded-md transition cursor-pointer text-xs ${
                activeGroupMode === 'state'
                  ? 'bg-white text-blue-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              By State
            </button>
            <button
              onClick={() => setActiveGroupMode('none')}
              className={`px-2 py-0.5 rounded-md transition cursor-pointer text-xs ${
                activeGroupMode === 'none'
                  ? 'bg-white text-blue-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Flat
            </button>
          </div>
        </div>
      </div>

      {/* Main AG Grid Container */}
      <div 
        className="ag-theme-quartz w-full flex-1 rounded-2xl overflow-hidden border border-slate-200 shadow-xs"
        style={{ minHeight: '520px', height: '100%', width: '100%' }}
      >
        <AgGridReact<InventoryItem>
          ref={gridRef}
          rowData={items}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          quickFilterText={quickFilter}
          autoGroupColumnDef={autoGroupColumnDef}
          groupDefaultExpanded={1}
          rowHeight={52}
          headerHeight={40}
          animateRows={true}
        />
      </div>
    </div>
  );
};
