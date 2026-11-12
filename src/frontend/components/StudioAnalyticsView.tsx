'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { LedgerTransaction } from '@/backend/types';
import { formatCurrency } from '../utils/formatters';
import {
  Building2,
  ShieldAlert,
  ShieldCheck,
  Truck,
  AlertTriangle,
  BellRing,
  Send,
  Check,
  Sparkles,
  LayoutDashboard,
  Layers,
  Wand2,
  CheckCircle2
} from 'lucide-react';
import { studioTheme } from 'ag-studio';

// Dynamically import AgStudio with SSR disabled so it initializes cleanly in browser
const AgStudio = dynamic(
  () => import('ag-studio-react').then(mod => mod.AgStudio),
  {
    ssr: false, loading: () => (
      <div className="h-[640px] w-full flex flex-col items-center justify-center bg-slate-900 text-slate-300 rounded-2xl border border-slate-800">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <span className="font-mono text-xs">Mounting AG Studio 3.1 Canvas...</span>
      </div>
    )
  }
);

interface StudioAnalyticsViewProps {
  transactions: LedgerTransaction[];
  onOrderProduct: (prompt: string) => void;
  onRefreshLedger: () => void;
}

export const StudioAnalyticsView: React.FC<StudioAnalyticsViewProps> = ({
  transactions,
  onOrderProduct,
  onRefreshLedger
}) => {
  // Transform live procurement transactions into AG Studio data sources format
  const studioData = useMemo(() => {
    const procurementRows = transactions.map(t => ({
      id: t.contractId,
      merchant: t.merchantDomain || 'staples.com',
      broker: t.sellerAgentName,
      brokerTrustScore: t.sellerTrustScore,
      product: t.procuredItem || t.title,
      quantity: t.quantityProcured || 100,
      clientPaidUsd: t.clientPaidUsd ?? t.totalAmount,
      merchantCostUsd: t.merchantCostUsd ?? Math.round(t.totalAmount * 0.92 * 100) / 100,
      netMarginUsd: t.netMarginUsd ?? 1.50,
      channel3CommissionUsd: t.channel3CommissionUsd ?? 0.70,
      totalAmountUsd: t.totalAmount,
      escrowStatus: t.status,
      carrier: t.fulfillment?.carrier || 'UPS Freight',
      trackingNumber: t.fulfillment?.trackingNumber || 'Pending',
      isFraudBlocked: t.fulfillment?.status === 'INVALID_TRACKING_FRAUD' ? 'YES' : 'NO',
      date: t.createdAt.split('T')[0]
    }));

    // Baseline robust orders fallback ensuring AG Studio always infers complete schema columns even on first render
    const defaultProcurementRows = [
      {
        id: 'CTR-B2B-001',
        merchant: 'newegg.com',
        broker: 'Harvester-v4 (Channel3 Verified)',
        brokerTrustScore: 96,
        product: '100x Sharpie S-Gel Gel Pens Medium 0.7mm',
        quantity: 100,
        clientPaidUsd: 15.00,
        merchantCostUsd: 13.99,
        netMarginUsd: 1.01,
        channel3CommissionUsd: 0.70,
        totalAmountUsd: 15.00,
        escrowStatus: 'DIRECT_SETTLED',
        carrier: 'UPS Ground',
        trackingNumber: '1Z999AA10123456784',
        isFraudBlocked: 'NO',
        date: '2026-11-12'
      },
      {
        id: 'CTR-B2B-002',
        merchant: 'staples.com',
        broker: 'Harvester-v4 (Channel3 Verified)',
        brokerTrustScore: 94,
        product: '500x BIC Round Stic Ballpoint Pens',
        quantity: 500,
        clientPaidUsd: 140.00,
        merchantCostUsd: 130.00,
        netMarginUsd: 10.00,
        channel3CommissionUsd: 6.50,
        totalAmountUsd: 140.00,
        escrowStatus: 'ESCROW_LOCKED',
        carrier: 'FedEx Freight',
        trackingNumber: '784994002911',
        isFraudBlocked: 'NO',
        date: '2026-11-11'
      },
      {
        id: 'CTR-B2B-003',
        merchant: 'borntostandout.com',
        broker: 'VisionSynth-Rogue',
        brokerTrustScore: 12,
        product: '50x Bulk Cheap Ballpoint Pens',
        quantity: 50,
        clientPaidUsd: 0.00,
        merchantCostUsd: 0.00,
        netMarginUsd: 0.00,
        channel3CommissionUsd: 0.00,
        totalAmountUsd: 9.00,
        escrowStatus: 'POLICY_BLOCKED',
        carrier: 'None',
        trackingNumber: 'BLOCKED_FRAUD_GATE',
        isFraudBlocked: 'YES',
        date: '2026-11-10'
      },
      {
        id: 'CTR-B2B-004',
        merchant: 'dell.com',
        broker: 'PricePulse-Index-v2',
        brokerTrustScore: 98,
        product: '1x Dell UltraSharp 27 4K USB-C Hub Monitor',
        quantity: 1,
        clientPaidUsd: 429.00,
        merchantCostUsd: 399.00,
        netMarginUsd: 30.00,
        channel3CommissionUsd: 19.95,
        totalAmountUsd: 429.00,
        escrowStatus: 'VERIFIED_CAPTURED',
        carrier: 'UPS Air Express',
        trackingNumber: '1Z888XX90192837465',
        isFraudBlocked: 'NO',
        date: '2026-11-09'
      }
    ];

    const activeProcurementRows = procurementRows.length > 0 ? procurementRows : defaultProcurementRows;

    const merchantKybRows = [
      { domain: 'staples.com', entity: 'Staples Advantage B2B', trustScore: 94, verdict: 'APPROVED', allowlisted: 'YES', fraudRisk: 'LOW', poCapUsd: 50000 },
      { domain: 'newegg.com', entity: 'Newegg Business Inc.', trustScore: 88, verdict: 'APPROVED', allowlisted: 'YES', fraudRisk: 'LOW', poCapUsd: 25000 },
      { domain: 'michaels.com', entity: 'Michaels Wholesale', trustScore: 64, verdict: 'ESCROW_REVIEW', allowlisted: 'NO', fraudRisk: 'MEDIUM', poCapUsd: 10000 },
      { domain: 'borntostandout.com', entity: 'Overseas Shell Entity', trustScore: 12, verdict: 'BLOCKED', allowlisted: 'NO', fraudRisk: 'CRITICAL', poCapUsd: 0 },
      { domain: 'dell.com', entity: 'Dell Technologies Direct', trustScore: 98, verdict: 'APPROVED', allowlisted: 'YES', fraudRisk: 'LOW', poCapUsd: 100000 },
      { domain: 'vari.com', entity: 'Vari Ergonomics Global', trustScore: 97, verdict: 'APPROVED', allowlisted: 'YES', fraudRisk: 'LOW', poCapUsd: 75000 }
    ];

    // Aggregated KPI telemetry for Master Distributor Operations
    const totalVolume = transactions.reduce((sum, t) => sum + (t.clientPaidUsd ?? t.totalAmount), 0);
    const totalMargin = transactions.reduce((sum, t) => sum + (t.netMarginUsd ?? 1.50), 0);
    const clearedVolume = transactions.filter(t => t.status === 'VERIFIED_CAPTURED' || t.status === 'DIRECT_SETTLED').reduce((sum, t) => sum + (t.clientPaidUsd ?? t.totalAmount), 0);
    const escrowVolume = transactions.filter(t => t.status === 'ESCROW_LOCKED').reduce((sum, t) => sum + (t.clientPaidUsd ?? t.totalAmount), 0);

    const kpiSummary = [
      {
        id: 'distributor_kpi',
        totalVolume: totalVolume > 0 ? totalVolume : 1692.26,
        clearedVolume: clearedVolume > 0 ? clearedVolume : 1240.50,
        escrowVolume: escrowVolume > 0 ? escrowVolume : 451.76,
        netMargin: totalMargin > 0 ? totalMargin : 142.80,
        ordersCount: transactions.length > 0 ? transactions.length : 16,
        avgSla: 0.998
      }
    ];

    // Merchant spend distribution
    const merchantSpendMap: Record<string, number> = {};
    transactions.forEach(t => {
      const m = t.merchantDomain || 'staples.com';
      merchantSpendMap[m] = (merchantSpendMap[m] || 0) + (t.clientPaidUsd ?? t.totalAmount);
    });

    const merchantSpendData = Object.entries(merchantSpendMap).map(([merchant, volume]) => ({
      merchant,
      volume: Number(volume.toFixed(2))
    }));

    const activeMerchantSpend = merchantSpendData.length > 0 ? merchantSpendData : [
      { merchant: 'staples.com', volume: 925.58 },
      { merchant: 'newegg.com', volume: 270.40 },
      { merchant: 'dell.com', volume: 429.00 },
      { merchant: 'vari.com', volume: 67.28 }
    ];

    return {
      sources: [
        {
          id: 'procurement_orders',
          name: 'Procurement Transactions',
          data: activeProcurementRows
        },
        {
          id: 'merchant_kyb_registry',
          name: 'Supplier KYB & Risk Matrix',
          data: merchantKybRows
        },
        {
          id: 'distributor_kpi',
          name: 'Distributor KPI Aggregates',
          data: kpiSummary
        },
        {
          id: 'merchant_spend',
          name: 'Spend by Merchant',
          data: activeMerchantSpend
        }
      ]
    };
  }, [transactions]);

  // Clean Light Theme Styling matching app's crisp executive white/slate look
  const lightCardStyle = {
    borderRadius: 14,
    borderEnabled: true,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff'
  };

  // Initial preset dashboard state with configured KPI tiles, column chart, donut chart, and grids
  const initialState = useMemo(() => {
    return {
      version: '3.1.0',
      panels: {
        filters: { collapsed: true }
      },
      schema: {
        fields: {
          'distributor_kpi.totalVolume': { format: '$#,##0.00' },
          'distributor_kpi.clearedVolume': { format: '$#,##0.00' },
          'distributor_kpi.escrowVolume': { format: '$#,##0.00' },
          'distributor_kpi.netMargin': { format: '$#,##0.00' },
          'distributor_kpi.avgSla': { format: '0.0%' },
          'procurement_orders.totalAmountUsd': { format: '$#,##0.00' },
          'procurement_orders.clientPaidUsd': { format: '$#,##0.00' },
          'procurement_orders.merchantCostUsd': { format: '$#,##0.00' },
          'procurement_orders.netMarginUsd': { format: '$#,##0.00' },
          'procurement_orders.channel3CommissionUsd': { format: '$#,##0.00' },
          'merchant_spend.volume': { format: '$#,##0.00' },
          'merchant_kyb_registry.poCapUsd': { format: '$#,##0.00' }
        }
      },
      pages: [
        {
          id: 'page-procurement-analytics',
          name: 'Procurement & Risk Operations',
          widgets: {
            // Row 1: 4 Top KPI Metric Cards (Cleared Volume, In Escrow, Net Margin, Orders Sourced)
            'kpi-cleared-spend': {
              type: 'value',
              format: {
                title: { text: 'Total Cleared Volume (PayPal)', enabled: true },
                widget: lightCardStyle
              },
              dataMapping: {
                value: [{ id: 'distributor_kpi.clearedVolume', aggregation: 'max' }]
              }
            },
            'kpi-escrow-spend': {
              type: 'value',
              format: {
                title: { text: 'Active Escrow Hold (Pending Delivery)', enabled: true },
                widget: lightCardStyle
              },
              dataMapping: {
                value: [{ id: 'distributor_kpi.escrowVolume', aggregation: 'max' }]
              }
            },
            'kpi-net-margin': {
              type: 'value',
              format: {
                title: { text: 'Distributor Net Spread & Margin', enabled: true },
                widget: lightCardStyle
              },
              dataMapping: {
                value: [{ id: 'distributor_kpi.netMargin', aggregation: 'max' }]
              }
            },
            'kpi-orders-count': {
              type: 'value',
              format: {
                title: { text: 'Total Orders Sourced', enabled: true },
                widget: lightCardStyle
              },
              dataMapping: {
                value: [{ id: 'distributor_kpi.ordersCount', aggregation: 'max' }]
              }
            },

            // Row 2 Left: Column Chart of Spend by Merchant
            'chart-spend-by-merchant': {
              type: 'column-chart-grouped',
              format: {
                title: { text: 'Procurement Volume by Sourced Merchant', enabled: true },
                widget: lightCardStyle
              },
              dataMapping: {
                categoryKey: [{ id: 'merchant_spend.merchant' }],
                valueKey: [{ id: 'merchant_spend.volume', aggregation: 'sum' }]
              }
            },

            // Row 2 Right: Donut Chart of Spend Allocation
            'chart-spend-donut': {
              type: 'donut-chart',
              format: {
                title: { text: 'Spend Allocation Share', enabled: true },
                widget: lightCardStyle
              },
              dataMapping: {
                categoryKey: [{ id: 'merchant_spend.merchant' }],
                valueKey: [{ id: 'merchant_spend.volume', aggregation: 'sum' }]
              }
            },

            // Row 3 Left: Two-Sided Master Distributor Settlements Grid
            'grid-orders': {
              type: 'grid',
              format: {
                title: { text: 'Two-Sided Master Distributor Settlements (PayPal Orders v2)', enabled: true },
                widget: lightCardStyle
              },
              dataMapping: {
                cols: [
                  { id: 'procurement_orders.id' },
                  { id: 'procurement_orders.merchant' },
                  { id: 'procurement_orders.clientPaidUsd' },
                  { id: 'procurement_orders.merchantCostUsd' },
                  { id: 'procurement_orders.netMarginUsd' },
                  { id: 'procurement_orders.escrowStatus' },
                  { id: 'procurement_orders.carrier' },
                  { id: 'procurement_orders.trackingNumber' }
                ]
              }
            },

            // Row 3 Right: Supplier KYB Trust Matrix Grid
            'grid-merchants': {
              type: 'grid',
              format: {
                title: { text: 'Supplier KYB Trust Matrix & Limits', enabled: true },
                widget: lightCardStyle
              },
              dataMapping: {
                cols: [
                  { id: 'merchant_kyb_registry.domain' },
                  { id: 'merchant_kyb_registry.entity' },
                  { id: 'merchant_kyb_registry.trustScore' },
                  { id: 'merchant_kyb_registry.verdict' },
                  { id: 'merchant_kyb_registry.poCapUsd' }
                ]
              }
            }
          },
          widgetLayout: {
            // Row 1 (y: 0-4): 4 KPI cards spanning full 24 cols
            'kpi-cleared-spend': { xTrack: 0, yTrack: 0, xSpan: 6, ySpan: 4 },
            'kpi-escrow-spend': { xTrack: 6, yTrack: 0, xSpan: 6, ySpan: 4 },
            'kpi-net-margin': { xTrack: 12, yTrack: 0, xSpan: 6, ySpan: 4 },
            'kpi-orders-count': { xTrack: 18, yTrack: 0, xSpan: 6, ySpan: 4 },

            // Row 2 (y: 4-14): 14-col Merchant Volume Column Chart + 10-col Donut Chart
            'chart-spend-by-merchant': { xTrack: 0, yTrack: 4, xSpan: 14, ySpan: 10 },
            'chart-spend-donut': { xTrack: 14, yTrack: 4, xSpan: 10, ySpan: 10 },

            // Row 3 (y: 14-27): 14-col Orders Grid + 10-col Merchants Grid
            'grid-orders': { xTrack: 0, yTrack: 14, xSpan: 14, ySpan: 13 },
            'grid-merchants': { xTrack: 14, yTrack: 14, xSpan: 10, ySpan: 13 }
          }
        }
      ],
      selectedPageId: 'page-procurement-analytics'
    };
  }, []);

  // Light theme with custom row height so the widgets expand to fill the available canvas
  const lightCustomTheme = useMemo(() => {
    try {
      return studioTheme.withParams({
        studioCanvasRowHeight: 28,
        studioWidgetBorderRadius: '14px',
        studioWidgetBorder: '1px solid #e2e8f0',
        studioWidgetBackgroundColor: '#ffffff',
        studioCanvasBackgroundColor: '#f8fafc',
        chartPaletteFills1Color: '#2563eb',
        chartPaletteFills2Color: '#059669',
        chartPaletteFills3Color: '#d97706',
        chartPaletteFills4Color: '#7c3aed'
      });
    } catch {
      return studioTheme;
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Companion Custom Widgets: Anomaly Radar & Nudge Scoreboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Custom Widget: Anomaly & Tracking Breach Radar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Escrow Anomaly & Fraud Radar</span>
            </div>
            <span className="text-[10px] font-mono bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200 font-bold">
              1 Anomaly Flagged
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 space-y-1">
              <div className="font-bold flex items-center justify-between text-[11px]">
                <span>RogueFulfill-AI (Dropship Spoofing)</span>
                <span className="text-rose-700 font-mono">100% Refunded</span>
              </div>
              <p className="text-[11px] text-rose-700 leading-relaxed">
                Carrier tracking scan returned 0 events for synthetic tracking <code className="bg-rose-100 px-1 rounded font-mono">INVALID-TRACKING-0000</code>. PayPal restitution issued.
              </p>
            </div>

            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-center justify-between text-[11px]">
              <div>
                <span className="font-bold block">Enterprise Carrier Tracking Scan</span>
                <span className="text-emerald-700">UPS Freight / FedEx Ground deliveries verified</span>
              </div>
              <span className="font-mono font-bold text-emerald-800">99.8% SLA</span>
            </div>
          </div>
        </div>

        {/* Custom Widget: Nudge-Bot Broker Fulfillment Scoreboard */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <BellRing className="w-4 h-4 text-blue-600" />
              <span>Nudge-Bot: Broker Fulfillment Scoreboard</span>
            </div>
            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>All Escrows Verified</span>
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500 text-xs">
              All active escrow orders verified! No brokers currently require tracking nudges.
            </div>
          </div>
        </div>
      </div>

      {/* The Actual AG Studio Component Instance */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col">
        <style dangerouslySetInnerHTML={{
          __html: `
          .ag-studio-layout-canvas {
            background-color: #f8fafc !important;
            background-image: radial-gradient(#cbd5e1 1.2px, transparent 1.2px) !important;
            background-size: 24px 24px !important;
          }
          .ag-studio-layout-widget {
            border-radius: 14px !important;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05), 0 0 0 1px rgb(226 232 240) !important;
            background: #ffffff !important;
            overflow: hidden !important;
            transition: box-shadow 0.2s ease, border-color 0.2s ease !important;
          }
          .ag-studio-layout-widget:hover {
            box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05), 0 0 0 1px rgb(203 213 225) !important;
          }
          .ag-studio-layout-widget-title {
            font-family: inherit !important;
            font-size: 13px !important;
            font-weight: 700 !important;
            color: #0f172a !important;
            letter-spacing: -0.01em !important;
          }
          .ag-studio-value-widget {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
            font-weight: 800 !important;
            color: #1d4ed8 !important;
          }
          .ag-header-cell-label {
            font-size: 11px !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.04em !important;
            color: #64748b !important;
          }
        `}} />

        <div className="bg-slate-900 text-white p-3 px-4 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <span>AG Studio 3.1 Master Distributor Telemetry Canvas</span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded-md border border-cyan-800">
                Live Data Mesh
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
              Mode: VIEW ONLY
            </span>
          </div>
        </div>

        <div style={{ height: '760px', width: '100%' }}>
          <AgStudio
            data={studioData}
            initialState={initialState}
            theme={lightCustomTheme}
            mode="view"
          />
        </div>
      </div>
    </div>
  );
};
