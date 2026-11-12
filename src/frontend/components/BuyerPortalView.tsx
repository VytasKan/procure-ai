'use client';

import React, { useState, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  ModuleRegistry,
  AllCommunityModule,
  ColDef,
  ICellRendererParams
} from 'ag-grid-community';
import { LedgerTransaction, ProductItem, AgentServiceContract, BasketItem } from '@/backend/types';
import { AgentChat } from './AgentChat';
import { Channel3Chat } from './Channel3Chat';
import { InventoryLedgerTab } from './InventoryLedgerTab';
import { OrderBuilderCanvas } from './OrderBuilderCanvas';
import { BuyerInvoicesTab } from './BuyerInvoicesTab';
import { formatCurrency } from '../utils/formatters';
import { 
  Wallet, 
  ShieldCheck, 
  Package, 
  Truck, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  RotateCcw,
  Check,
  Search,
  ArrowRight,
  Info,
  Layers,
  History,
  MessageSquare
} from 'lucide-react';
import { useToast } from './Toast';

ModuleRegistry.registerModules([AllCommunityModule]);

interface BuyerPortalViewProps {
  transactions: LedgerTransaction[];
  onRefreshLedger: () => void;
  currentThreshold: number;
  enforceCollateral: boolean;
  autoSlaSlashing: boolean;
  externalPrompt?: string;
  onClearExternalPrompt?: () => void;
  onSelectProductPrompt: (prompt: string) => void;
}

export const BuyerPortalView: React.FC<BuyerPortalViewProps> = ({
  transactions,
  onRefreshLedger,
  currentThreshold,
  enforceCollateral,
  autoSlaSlashing,
  externalPrompt,
  onClearExternalPrompt,
  onSelectProductPrompt
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'inventory' | 'builder' | 'history' | 'invoices'>('inventory');
  const [activeContract, setActiveContract] = useState<AgentServiceContract | undefined>(undefined);

  // Filter buyer's transactions (our Acme Buyer Bot)
  const buyerOrders = useMemo(() => {
    return transactions.filter(t => t.buyerAgent.includes('treasury-prime') || t.buyerAgent.includes('acme') || !t.buyerAgent.includes('rogue'));
  }, [transactions]);

  // AG Grid columns for Buyer's Active Orders
  const orderColumnDefs = useMemo<ColDef<LedgerTransaction>[]>(() => [
    {
      field: 'contractId',
      headerName: 'PO # / Order ID',
      width: 140,
      cellRenderer: (params: ICellRendererParams<LedgerTransaction>) => (
        <div className="flex items-center h-full">
          <span className="font-mono text-xs font-bold text-blue-700">
            {params.value}
          </span>
        </div>
      )
    },
    {
      field: 'procuredItem',
      headerName: 'Item & Quantity',
      flex: 1.5,
      minWidth: 220,
      cellRenderer: (params: ICellRendererParams<LedgerTransaction>) => {
        const item = params.data?.procuredItem || params.data?.title || 'Office Supplies';
        const qty = params.data?.quantityProcured || 100;
        return (
          <div className="flex flex-col justify-center h-full py-1 leading-tight overflow-hidden">
            <span className="font-semibold text-slate-900 text-xs truncate">{item}</span>
            <span className="text-[10px] font-mono text-slate-400 mt-0.5">{qty.toLocaleString()} units</span>
          </div>
        );
      }
    },
    {
      field: 'clientPaidUsd',
      headerName: 'Invoice Amount',
      width: 150,
      cellRenderer: (params: ICellRendererParams<LedgerTransaction>) => {
        const amount = params.value ?? params.data?.totalAmount ?? 0;
        return (
          <div className="flex items-center gap-1.5 h-full">
            <span className="font-mono text-xs font-bold text-slate-900">
              {formatCurrency(amount, params.data?.currency)}
            </span>
            <span className="text-[9px] font-mono bg-slate-100 text-slate-600 px-1 py-0.5 rounded border border-slate-200">
              Auto-Pay
            </span>
          </div>
        );
      }
    },
    {
      field: 'status',
      headerName: 'Invoice & Fulfillment Status',
      width: 220,
      cellRenderer: (params: ICellRendererParams<LedgerTransaction>) => {
        const status = params.value;
        if (status === 'DIRECT_SETTLED') {
          return (
            <div className="flex items-center h-full">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200">
                <Clock className="w-3 h-3 text-blue-600 shrink-0" />
                <span>Invoiced (Pending Delivery)</span>
              </span>
            </div>
          );
        }
        if (status === 'ESCROW_LOCKED') {
          return (
            <div className="flex items-center h-full">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                <span>Escrow Hold</span>
              </span>
            </div>
          );
        }
        if (status === 'VERIFIED_CAPTURED') {
          return (
            <div className="flex items-center h-full">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>Delivered & Collected</span>
              </span>
            </div>
          );
        }
        return (
          <div className="flex items-center h-full">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-rose-50 text-rose-800 border border-rose-200">
              <RotateCcw className="w-3 h-3 text-rose-600 shrink-0" />
              <span>Invoice Voided</span>
            </span>
          </div>
        );
      }
    },
    {
      field: 'fulfillment',
      headerName: 'Carrier Tracking',
      width: 210,
      cellRenderer: (params: ICellRendererParams<LedgerTransaction>) => {
        const f = params.data?.fulfillment;
        const tracking = f?.trackingNumber || 'Pending Tracking';
        const carrier = f?.carrier || 'UPS Freight';
        const isFraud = f?.status === 'INVALID_TRACKING_FRAUD';

        if (isFraud) {
          return (
            <div className="flex items-center gap-1 text-[11px] font-mono text-rose-700 h-full">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="font-bold">Carrier Error</span>
            </div>
          );
        }

        return (
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-700 h-full">
            <Truck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate">{carrier.split(' ')[0]}: <strong>{tracking}</strong></span>
          </div>
        );
      }
    }
  ], []);

  const handleOrderApproved = async (contract: AgentServiceContract) => {
    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contract })
      });
      if (!res.ok) throw new Error('Execution failed');
      
      // Clear the live order basket now that it is committed
      setActiveContract(undefined);
      
      // Refresh the ledger from server
      await onRefreshLedger();
      
      showToast('Order Submitted', 'Invoice generated and logged to Order History', 'success');
      
      // Automatically switch to Order History tab to display the new order in AG Grid
      setActiveTab('history');
    } catch (err) {
      console.error(err);
      showToast('Order Error', 'Could not submit B2B order', 'warning');
    }
  };

  return (
    <div className="h-full flex flex-col space-y-3">
      {/* Main 2-Column Balanced Layout: Left (Agent Chat Console 6 cols) | Right (Orders & Catalog 6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1 min-h-0">
        {/* Left Column: Interactive Buyer Agent Chat Console (5 cols) */}
        <div className="lg:col-span-5 h-[calc(100vh-6rem)] rounded-2xl border border-slate-200 overflow-hidden shadow-xs bg-white flex flex-col">
          <AgentChat
            onOrderExecuted={onRefreshLedger}
            externalPrompt={externalPrompt}
            onClearExternalPrompt={onClearExternalPrompt}
            currentThreshold={currentThreshold}
            enforceCollateral={enforceCollateral}
            autoSlaSlashing={autoSlaSlashing}
            transactions={transactions}
            onContractGenerated={(newContract) => {
              setActiveContract(prev => {
                // If the new contract is already a multi-item package (e.g. replenish all), replace the basket directly
                if (newContract.items && newContract.items.length > 1) {
                  return newContract;
                }

                if (!prev || !prev.items || prev.items.length === 0) {
                  return newContract;
                }

                // If an active basket already exists, append the new item (or update quantity if same title)
                const newItem = newContract.items?.[0] || {
                  id: `item-${Date.now()}`,
                  title: newContract.taskTitle.replace(/ProcureAI B2B Order: \d+x /i, ''),
                  sku: `PROC-B2B-${Date.now().toString().slice(-4)}`,
                  unitPrice: Math.round((newContract.totalAmount / (newContract.quantity || 1)) * 100) / 100,
                  quantity: newContract.quantity || 1,
                  subtotal: newContract.totalAmount,
                  leadTimeDays: 3,
                  imageUrl: newContract.sourcingProposal?.selectedOffer?.imageUrl
                };

                const existingIndex = prev.items.findIndex(it => it.title.toLowerCase() === newItem.title.toLowerCase());
                let updatedItems: BasketItem[];
                if (existingIndex >= 0) {
                  updatedItems = [...prev.items];
                  const existing = updatedItems[existingIndex];
                  const newQty = existing.quantity + newItem.quantity;
                  updatedItems[existingIndex] = {
                    ...existing,
                    quantity: newQty,
                    subtotal: Math.round(existing.unitPrice * newQty * 100) / 100
                  };
                } else {
                  updatedItems = [...prev.items, newItem];
                }

                const newTotal = updatedItems.reduce((sum, it) => sum + it.subtotal, 0);

                return {
                  ...prev,
                  taskTitle: `ProcureAI B2B Order: ${updatedItems.length} line items`,
                  items: updatedItems,
                  totalAmount: newTotal,
                  serviceFee: newTotal
                };
              });
              setActiveTab('builder');
            }}
          />
        </div>

        {/* Right Column: Live Order Builder & Management (7 cols) */}
        <div className="lg:col-span-7 flex flex-col h-[calc(100vh-6rem)] space-y-3">
          {/* Sub-tabs: [ Inventory Ledger ] | [ Order Canvas ] | [ Order History ] | [ Catalog ] | [ Wallet ] */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 shrink-0 gap-3">
            <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('inventory')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'inventory'
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Package className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Office Inventory</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              </button>

              <button
                onClick={() => setActiveTab('builder')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'builder'
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Order Canvas</span>
                {activeContract && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'history'
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <History className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>History ({buyerOrders.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('invoices')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'invoices'
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Wallet className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Invoices & Payments</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono shrink-0 hidden xl:flex">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>ProcureAI Gateway</span>
            </div>
          </div>

          {/* Tab 0: Office Inventory Ledger & Replenishment Monitor */}
          {activeTab === 'inventory' && (
            <div className="flex-1 min-h-0">
              <InventoryLedgerTab
                onTriggerReorderPrompt={(prompt) => {
                  onSelectProductPrompt(prompt);
                  setActiveTab('builder');
                }}
              />
            </div>
          )}

          {/* Tab 1: Live Order Builder Canvas */}
          {activeTab === 'builder' && (
            <div className="flex-1 min-h-0">
              <OrderBuilderCanvas
                contract={activeContract}
                onApprove={handleOrderApproved}
                onSelectPrompt={(p) => onSelectProductPrompt(p)}
                onUpdateBasket={(updatedItems) => {
                  if (activeContract) {
                    const newTotal = updatedItems.reduce((sum, it) => sum + it.subtotal, 0);
                    setActiveContract({
                      ...activeContract,
                      items: updatedItems,
                      totalAmount: newTotal
                    });
                  }
                }}
              />
            </div>
          )}

          {/* Tab 1: My Order History (AG Grid) */}
          {activeTab === 'history' && (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex-1 flex flex-col min-h-0">
              <div className="p-3 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-900">Your Procurement Ledger</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  Click any order to view PayPal order ID & carrier tracking
                </span>
              </div>

              <div className="flex-1 w-full ag-theme-quartz min-h-[450px]">
                <AgGridReact<LedgerTransaction>
                  rowData={buyerOrders}
                  columnDefs={orderColumnDefs}
                  defaultColDef={{ sortable: true, resizable: true }}
                  rowHeight={52}
                  headerHeight={38}
                />
              </div>
            </div>
          )}

          {/* Tab 3: Buyer Invoices, Transactions & Connected PayPal Wallet */}
          {activeTab === 'invoices' && (
            <div className="flex-1 min-h-0">
              <BuyerInvoicesTab
                transactions={transactions}
                onRefresh={onRefreshLedger}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

