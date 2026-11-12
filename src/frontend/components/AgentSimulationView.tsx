'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sliders, 
  Bot, 
  Sparkles, 
  ShoppingCart, 
  CheckCircle2, 
  LayoutDashboard,
  Layers, 
  Search, 
  CreditCard,
  Package,
  Activity,
  ShieldCheck,
  TrendingUp,
  Percent,
  Receipt
} from 'lucide-react';
import { formatCurrency } from '@/frontend/utils/formatters';
import { studioTheme } from 'ag-studio';

// Dynamically import AgStudio with SSR disabled so it initializes cleanly in browser
const AgStudio = dynamic(
  () => import('ag-studio-react').then(mod => mod.AgStudio),
  { ssr: false, loading: () => (
    <div className="h-full w-full flex flex-col items-center justify-center bg-slate-900 text-slate-300 rounded-2xl border border-slate-800">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
      <span className="font-mono text-xs">Mounting AG Studio 3.1 Live Telemetry Canvas...</span>
    </div>
  )}
);

export interface SimulatedAgent {
  id: string;
  name: string;
  avatarBg: string;
  walletAddress: string;
  dailyCap: number;
  spentToday: number;
  status: 'idle' | 'searching' | 'evaluating' | 'negotiating' | 'ordering' | 'settled';
  currentTask?: string;
  lastAction?: string;
  successfulOrders: number;
  totalVolume: number;
}

export interface AgentInteractionLog {
  id: string;
  timestamp: string;
  agentId: string;
  agentName: string;
  phase: 'PAYPAL_AUTHORIZE' | 'PAYPAL_CAPTURE' | 'PAYPAL_REFUND' | 'DISCOVERY' | 'DUE_DILIGENCE';
  product: string;
  amount: number;
  merchant: string;
  savings: number;
  trustScore: number;
  status: 'ESCROW_HOLD' | 'CAPTURED' | 'REFUNDED';
  paypalOrderId?: string;
  paypalCaptureId?: string;
  refundReason?: string;
}

const CATALOG_ITEMS = [
  { name: 'Electric Standing Desk (Dual Motor)', category: 'furniture', basePrice: 891.18, merchant: 'vari.com', sku: 'DESK-PRO-01' },
  { name: 'Ergonomic Mesh High-Back Chair', category: 'furniture', basePrice: 289.00, merchant: 'hermanmiller.com', sku: 'CHAIR-MESH-02' },
  { name: 'Dell UltraSharp 27" 4K USB-C Hub Monitor', category: 'electronics', basePrice: 429.00, merchant: 'dell.com', sku: 'MON-DELL-4K' },
  { name: 'Anker Thunderbolt 4 Enterprise Docking Station', category: 'electronics', basePrice: 199.50, merchant: 'anker.com', sku: 'DOCK-TB4-03' },
  { name: 'Sharpie S-Gel Gel Pens (100-Pack Bulk)', category: 'supplies', basePrice: 34.40, merchant: 'staples.com', sku: 'PEN-SHARPIE-100' },
  { name: 'BIC Round Stic Grip Extra Life (100 Pens)', category: 'supplies', basePrice: 30.10, merchant: 'staples.com', sku: 'PEN-BIC-100' },
  { name: 'Hammermill Multi-Purpose Paper 20lb (5 Reams)', category: 'supplies', basePrice: 42.00, merchant: 'officedepot.com', sku: 'PAPER-HAMMER-05' },
  { name: 'Logitech MX Master 3S Wireless Mouse', category: 'electronics', basePrice: 99.00, merchant: 'newegg.com', sku: 'MOU-MX3S-04' }
];

const AGENT_NAMES = [
  { name: 'ProcureBot-FinOps', color: 'bg-blue-600', wallet: 'agent://finops.corp.eth' },
  { name: 'WorkstationAgent-East', color: 'bg-indigo-600', wallet: 'agent://workstation.east.eth' },
  { name: 'SupplyChain-Alpha', color: 'bg-emerald-600', wallet: 'agent://alpha.supplies.eth' },
  { name: 'FacilityOps-Bot', color: 'bg-amber-600', wallet: 'agent://facilities.acme.eth' },
  { name: 'DevTeam-HardwareAgent', color: 'bg-purple-600', wallet: 'agent://dev-hw.procure.eth' },
  { name: 'RemoteOnboard-Agent', color: 'bg-cyan-600', wallet: 'agent://remote.onboarding.eth' },
  { name: 'ITLogistics-Overseer', color: 'bg-rose-600', wallet: 'agent://it-logistics.corp.eth' },
  { name: 'ExecutiveSuite-Bot', color: 'bg-slate-700', wallet: 'agent://exec-suite.treasury.eth' },
  { name: 'AustinHub-ProcureBot', color: 'bg-teal-600', wallet: 'agent://austin-hub.bot.eth' },
  { name: 'LondonOffice-Buyer', color: 'bg-violet-600', wallet: 'agent://london-office.eth' }
];

export const AgentSimulationView: React.FC = () => {
  // Main display tab: 'agents' (Fleet view) vs 'studio' (AG Studio 3.1 real-time canvas)
  const [activeSubTab, setActiveSubTab] = useState<'agents' | 'studio'>('agents');

  // Config state
  const [numAgents, setNumAgents] = useState<number>(5);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [budgetDistribution, setBudgetDistribution] = useState<'conservative' | 'balanced' | 'aggressive'>('balanced');
  const [productCategory, setProductCategory] = useState<'all' | 'furniture' | 'electronics' | 'supplies'>('all');
  const [delayConsolidationRate, setDelayConsolidationRate] = useState<number>(65); // 65% choose 15% flexible delay
  const [refundFailureRate, setRefundFailureRate] = useState<number>(15); // 15% encounter supplier fault/carrier issue -> auto PayPal refund

  // Simulation execution state
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [agents, setAgents] = useState<SimulatedAgent[]>([]);
  // Pre-seed initial realistic simulation state so dashboard is populated from step 0
  const [logs, setLogs] = useState<AgentInteractionLog[]>([
    {
      id: 'SIM-1794474990593-286',
      timestamp: '12:04:15',
      agentId: 'agent-1',
      agentName: 'ProcureBot-FinOps #1',
      phase: 'PAYPAL_CAPTURE',
      product: 'Electric Standing Desk (Dual Motor)',
      amount: 757.50,
      merchant: 'vari.com',
      savings: 133.68,
      trustScore: 98,
      status: 'CAPTURED',
      paypalOrderId: 'PAYID-M9X3817A',
      paypalCaptureId: 'CAP-74990593'
    },
    {
      id: 'SIM-1794474988193-621',
      timestamp: '12:04:22',
      agentId: 'agent-2',
      agentName: 'WorkstationAgent-East #2',
      phase: 'PAYPAL_REFUND',
      product: 'Ergonomic Mesh High-Back Chair',
      amount: 245.65,
      merchant: 'hermanmiller.com',
      savings: 43.35,
      trustScore: 68,
      status: 'REFUNDED',
      paypalOrderId: 'PAYID-L429188K',
      paypalCaptureId: 'CAP-74988193',
      refundReason: 'Carrier tracking failed & supplier SLA breach'
    },
    {
      id: 'SIM-1794474985794-356',
      timestamp: '12:04:30',
      agentId: 'agent-3',
      agentName: 'SupplyChain-Alpha #3',
      phase: 'PAYPAL_AUTHORIZE',
      product: 'Dell UltraSharp 27" 4K USB-C Hub Monitor',
      amount: 429.00,
      merchant: 'dell.com',
      savings: 0.00,
      trustScore: 99,
      status: 'ESCROW_HOLD',
      paypalOrderId: 'PAYID-D990214C'
    },
    {
      id: 'SIM-1794474982126-708',
      timestamp: '12:04:41',
      agentId: 'agent-4',
      agentName: 'FacilityOps-Bot #4',
      phase: 'PAYPAL_CAPTURE',
      product: 'Sharpie S-Gel Gel Pens (100-Pack Bulk)',
      amount: 29.24,
      merchant: 'staples.com',
      savings: 5.16,
      trustScore: 96,
      status: 'CAPTURED',
      paypalOrderId: 'PAYID-P284019E',
      paypalCaptureId: 'CAP-74982126'
    },
    {
      id: 'SIM-1794474980012-901',
      timestamp: '12:04:52',
      agentId: 'agent-5',
      agentName: 'DevTeam-HardwareAgent #5',
      phase: 'PAYPAL_AUTHORIZE',
      product: 'Anker Thunderbolt 4 Enterprise Docking Station',
      amount: 169.58,
      merchant: 'anker.com',
      savings: 29.92,
      trustScore: 98,
      status: 'ESCROW_HOLD',
      paypalOrderId: 'PAYID-A810482B'
    }
  ]);
  const [totalSimulatedVolume, setTotalSimulatedVolume] = useState<number>(1630.97);
  const [totalSimulatedSavings, setTotalSimulatedSavings] = useState<number>(212.11);
  const [totalOrdersPlaced, setTotalOrdersPlaced] = useState<number>(5);
  const [totalEscrowVolume, setTotalEscrowVolume] = useState<number>(598.58);
  const [totalCapturedVolume, setTotalCapturedVolume] = useState<number>(786.74);
  const [totalRefundedVolume, setTotalRefundedVolume] = useState<number>(245.65);
  const [totalRefundedCount, setTotalRefundedCount] = useState<number>(1);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  // Initialize agents when numAgents changes
  useEffect(() => {
    const initialSeedSpend = [757.50, 245.65, 429.00, 29.24, 169.58];
    const initializedAgents: SimulatedAgent[] = Array.from({ length: numAgents }).map((_, i) => {
      const template = AGENT_NAMES[i % AGENT_NAMES.length];
      const cap = budgetDistribution === 'conservative' ? 500 : budgetDistribution === 'balanced' ? 1500 : 5000;
      const spent = i < initialSeedSpend.length ? initialSeedSpend[i] : 0;
      return {
        id: `agent-${i + 1}`,
        name: `${template.name} #${i + 1}`,
        avatarBg: template.color,
        walletAddress: template.wallet,
        dailyCap: cap,
        spentToday: spent,
        status: i === 0 ? 'searching' : i === 1 ? 'evaluating' : 'idle',
        successfulOrders: spent > 0 ? 1 : 0,
        totalVolume: spent
      };
    });
    setAgents(initializedAgents);
  }, [numAgents, budgetDistribution]);

  // Simulation step loop
  useEffect(() => {
    if (!isRunning || agents.length === 0) return;

    const intervalTime = Math.max(800, 2400 / speedMultiplier);

    const timer = setInterval(() => {
      setAgents(prevAgents => {
        if (prevAgents.length === 0) return prevAgents;
        const randIndex = Math.floor(Math.random() * prevAgents.length);
        const agent = { ...prevAgents[randIndex] };

        const eligibleCatalog = productCategory === 'all' 
          ? CATALOG_ITEMS 
          : CATALOG_ITEMS.filter(item => item.category === productCategory);
        const randomProduct = eligibleCatalog[Math.floor(Math.random() * eligibleCatalog.length)];

        if (agent.status === 'idle') {
          agent.status = 'searching';
          agent.currentTask = `Channel3 query: "${randomProduct.name}"`;
          agent.lastAction = 'Scanning 120+ upstream merchant catalogs for best wholesale price...';
        } else if (agent.status === 'searching') {
          agent.status = 'evaluating';
          agent.currentTask = `Due Diligence & KYB verification for ${randomProduct.merchant}`;
          agent.lastAction = 'Checking ProcureAI score & supplier reliability tier...';
        } else if (agent.status === 'evaluating') {
          agent.status = 'ordering';
          const choosesConsolidation = Math.random() * 100 < delayConsolidationRate;
          const discount = choosesConsolidation ? 0.15 : 0;
          const finalPrice = Number((randomProduct.basePrice * (1 - discount)).toFixed(2));
          const savings = Number((randomProduct.basePrice * discount).toFixed(2));
          const paypalOrderId = `PAYID-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

          agent.currentTask = `PayPal Auth (Escrow): $${finalPrice}`;
          agent.lastAction = choosesConsolidation 
            ? `Auth Escrow Hold: Consolidating Pallet Freight (Saved $${savings})` 
            : `Auth Escrow Hold: 3-day Priority Delivery`;

          const newLog: AgentInteractionLog = {
            id: `SIM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            timestamp: new Date().toLocaleTimeString(),
            agentId: agent.id,
            agentName: agent.name,
            phase: 'PAYPAL_AUTHORIZE',
            product: randomProduct.name,
            amount: finalPrice,
            merchant: randomProduct.merchant,
            savings: savings,
            trustScore: Math.floor(90 + Math.random() * 10),
            status: 'ESCROW_HOLD',
            paypalOrderId
          };

          setLogs(prev => [newLog, ...prev.slice(0, 49)]);
          setTotalSimulatedVolume(v => Number((v + finalPrice).toFixed(2)));
          setTotalSimulatedSavings(s => Number((s + savings).toFixed(2)));
          setTotalOrdersPlaced(c => c + 1);
          setTotalEscrowVolume(e => Number((e + finalPrice).toFixed(2)));

          agent.spentToday = Number((agent.spentToday + finalPrice).toFixed(2));
          agent.successfulOrders += 1;
          agent.totalVolume = Number((agent.totalVolume + finalPrice).toFixed(2));
        } else if (agent.status === 'ordering') {
          // Check if there are orders in ESCROW_HOLD that need settlement or refund
          setLogs(prevLogs => {
            const escrowIndex = prevLogs.findIndex(l => l.status === 'ESCROW_HOLD');
            if (escrowIndex === -1) return prevLogs;

            const targetLog = { ...prevLogs[escrowIndex] };
            const willRefund = Math.random() * 100 < refundFailureRate;

            if (willRefund) {
              // Trigger autonomous PayPal refund / escrow void
              targetLog.phase = 'PAYPAL_REFUND';
              targetLog.status = 'REFUNDED';
              targetLog.refundReason = Math.random() > 0.5 
                ? 'Carrier telemetry breach: Failed delivery SLA' 
                : 'ProcureAI due diligence anomaly detected';
              targetLog.trustScore = Math.floor(55 + Math.random() * 20);

              setTotalEscrowVolume(e => Math.max(0, Number((e - targetLog.amount).toFixed(2))));
              setTotalRefundedVolume(r => Number((r + targetLog.amount).toFixed(2)));
              setTotalRefundedCount(c => c + 1);

              agent.lastAction = `Triggered PayPal Auto-Refund: $${targetLog.amount} credited back (Carrier / SLA breach)`;
            } else {
              // Trigger PayPal payment capture (verified settlement)
              targetLog.phase = 'PAYPAL_CAPTURE';
              targetLog.status = 'CAPTURED';
              targetLog.paypalCaptureId = `CAP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

              setTotalEscrowVolume(e => Math.max(0, Number((e - targetLog.amount).toFixed(2))));
              setTotalCapturedVolume(c => Number((c + targetLog.amount).toFixed(2)));

              agent.lastAction = `Carrier confirmed delivery. PayPal payment CAPTURED to ${targetLog.merchant}`;
            }

            const updatedLogs = [...prevLogs];
            updatedLogs[escrowIndex] = targetLog;
            return updatedLogs;
          });

          agent.status = 'settled';
          agent.currentTask = undefined;
        } else {
          agent.status = 'idle';
          agent.currentTask = undefined;
          agent.lastAction = 'Ready for next procurement cycle.';
        }

        const next = [...prevAgents];
        next[randIndex] = agent;
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isRunning, speedMultiplier, productCategory, delayConsolidationRate, agents.length]);

  const handleReset = () => {
    setLogs([]);
    setTotalSimulatedVolume(0);
    setTotalSimulatedSavings(0);
    setTotalOrdersPlaced(0);
    setTotalEscrowVolume(0);
    setTotalCapturedVolume(0);
    setTotalRefundedVolume(0);
    setTotalRefundedCount(0);
    setAgents(prev => prev.map(a => ({
      ...a,
      status: 'idle',
      spentToday: 0,
      successfulOrders: 0,
      totalVolume: 0,
      currentTask: undefined,
      lastAction: 'Simulation reset.'
    })));
  };

  // Convert live simulated orders & agent fleet into AG Studio real-time data sources
  const studioData = useMemo(() => {
    // 1. Live Sourced Invoices (Item level with Agent, Product, Merchant, Amount, Savings, Trust, Status, PayPal IDs)
    const ordersData = logs.map(l => ({
      id: l.id,
      agent: l.agentName,
      product: l.product,
      amount: l.amount,
      savings: l.savings,
      merchant: l.merchant,
      trustScore: l.trustScore,
      paymentStatus: l.status,
      phase: l.phase,
      paypalRef: l.paypalCaptureId || l.paypalOrderId || 'PENDING',
      refundReason: l.refundReason || '-',
      timestamp: l.timestamp
    }));

    // Fallback initial row so AG Studio schema is always non-empty
    const activeOrders = ordersData.length > 0 ? ordersData : [
      { id: 'INIT-01', agent: 'ProcureBot-FinOps #1', product: 'Electric Standing Desk', amount: 757.50, savings: 133.68, merchant: 'vari.com', trustScore: 98, paymentStatus: 'CAPTURED', phase: 'PAYPAL_CAPTURE', paypalRef: 'CAP-74990593', refundReason: '-', timestamp: '12:00:00' }
    ];

    // 2. Agent Fleet Budget & Utilization Telemetry
    const agentSpendData = agents.map(a => {
      const budgetCap = a.dailyCap || 1500;
      const spent = a.spentToday || 0;
      const pct = Number(((spent / budgetCap) * 100).toFixed(1));
      return {
        id: a.id,
        name: a.name,
        spentToday: spent,
        dailyCap: budgetCap,
        utilizationPct: pct,
        ordersCount: a.successfulOrders,
        totalVolume: a.totalVolume,
        status: a.status
      };
    });

    // 3. Category Breakdown aggregated directly from simulation logs & active catalog
    const categoryAgg: Record<string, { volume: number; ordersCount: number; savings: number; sampleMerchant: string }> = {
      'Furniture & Ergonomics': { volume: 0, ordersCount: 0, savings: 0, sampleMerchant: 'vari.com' },
      'Electronics & Docking': { volume: 0, ordersCount: 0, savings: 0, sampleMerchant: 'dell.com' },
      'Office Supplies & Paper': { volume: 0, ordersCount: 0, savings: 0, sampleMerchant: 'staples.com' }
    };

    logs.forEach(l => {
      const p = l.product.toLowerCase();
      let catKey = 'Office Supplies & Paper';
      if (p.includes('desk') || p.includes('chair')) catKey = 'Furniture & Ergonomics';
      else if (p.includes('monitor') || p.includes('dock') || p.includes('mouse')) catKey = 'Electronics & Docking';

      categoryAgg[catKey].volume += l.amount;
      categoryAgg[catKey].ordersCount += 1;
      categoryAgg[catKey].savings += l.savings;
    });

    const categoryStatsData = Object.entries(categoryAgg).map(([category, s]) => ({
      category,
      volume: Number(s.volume.toFixed(2)),
      ordersCount: s.ordersCount,
      savings: Number(s.savings.toFixed(2)),
      primaryMerchant: s.sampleMerchant
    }));

    // 4. Upstream Merchant Breakdown (Sourced volume per merchant)
    const merchantMap: Record<string, { volume: number; orders: number; avgTrust: number; trustTotal: number }> = {
      'vari.com': { volume: 0, orders: 0, avgTrust: 98, trustTotal: 0 },
      'hermanmiller.com': { volume: 0, orders: 0, avgTrust: 97, trustTotal: 0 },
      'dell.com': { volume: 0, orders: 0, avgTrust: 99, trustTotal: 0 },
      'anker.com': { volume: 0, orders: 0, avgTrust: 96, trustTotal: 0 },
      'staples.com': { volume: 0, orders: 0, avgTrust: 95, trustTotal: 0 },
      'newegg.com': { volume: 0, orders: 0, avgTrust: 94, trustTotal: 0 }
    };

    logs.forEach(l => {
      if (!merchantMap[l.merchant]) {
        merchantMap[l.merchant] = { volume: 0, orders: 0, avgTrust: l.trustScore, trustTotal: 0 };
      }
      merchantMap[l.merchant].volume += l.amount;
      merchantMap[l.merchant].orders += 1;
      merchantMap[l.merchant].trustTotal += l.trustScore;
      merchantMap[l.merchant].avgTrust = Math.round(merchantMap[l.merchant].trustTotal / merchantMap[l.merchant].orders);
    });

    const merchantStatsData = Object.entries(merchantMap).map(([merchant, m]) => ({
      merchant,
      volume: Number(m.volume.toFixed(2)),
      ordersCount: m.orders,
      avgTrust: m.avgTrust
    }));

    // 5. Payment & Settlement Status Breakdown (Captured vs Escrow Hold vs Refunded)
    const paymentBreakdownData = [
      {
        status: 'Settled & Captured',
        volume: totalCapturedVolume > 0 ? totalCapturedVolume : 786.74,
        count: logs.filter(l => l.status === 'CAPTURED').length || 2
      },
      {
        status: 'PayPal Escrow Hold',
        volume: totalEscrowVolume > 0 ? totalEscrowVolume : 598.58,
        count: logs.filter(l => l.status === 'ESCROW_HOLD').length || 2
      },
      {
        status: 'Auto Refunded / Restitution',
        volume: totalRefundedVolume > 0 ? totalRefundedVolume : 245.65,
        count: totalRefundedCount > 0 ? totalRefundedCount : 1
      }
    ];

    // 6. Live Simulation KPI summary for top metric cards
    const avgTrustScore = logs.length > 0 
      ? Number((logs.reduce((acc, l) => acc + l.trustScore, 0) / logs.length / 100).toFixed(3))
      : 0.985;
    const savingsRate = totalSimulatedVolume > 0 
      ? Number((totalSimulatedSavings / (totalSimulatedVolume + totalSimulatedSavings)).toFixed(3))
      : 0.150;

    const fleetKpiData = [
      {
        id: 'kpi-live',
        totalVolume: totalSimulatedVolume > 0 ? totalSimulatedVolume : 1630.97,
        totalSavings: totalSimulatedSavings > 0 ? totalSimulatedSavings : 212.11,
        capturedVolume: totalCapturedVolume > 0 ? totalCapturedVolume : 786.74,
        escrowVolume: totalEscrowVolume > 0 ? totalEscrowVolume : 598.58,
        refundedVolume: totalRefundedVolume > 0 ? totalRefundedVolume : 245.65,
        refundedCount: totalRefundedCount > 0 ? totalRefundedCount : 1,
        savingsRate: savingsRate,
        ordersCount: totalOrdersPlaced > 0 ? totalOrdersPlaced : 5,
        avgTrustScore: avgTrustScore
      }
    ];

    return {
      sources: [
        {
          id: 'agent_orders',
          name: 'Live Agent Invoices',
          data: activeOrders
        },
        {
          id: 'payment_breakdown',
          name: 'Payment Settlement Status',
          data: paymentBreakdownData
        },
        {
          id: 'fleet_summary',
          name: 'Agent Fleet Telemetry',
          data: agentSpendData
        },
        {
          id: 'category_stats',
          name: 'Category Sourcing',
          data: categoryStatsData
        },
        {
          id: 'merchant_stats',
          name: 'Merchant Volume & Trust',
          data: merchantStatsData
        },
        {
          id: 'fleet_kpi',
          name: 'Fleet KPI Aggregates',
          data: fleetKpiData
        }
      ]
    };
  }, [logs, agents, totalSimulatedVolume, totalSimulatedSavings, totalOrdersPlaced, totalCapturedVolume, totalEscrowVolume, totalRefundedVolume, totalRefundedCount]);

  // Clean Light Theme Styling matching app's crisp executive white/slate look
  const lightCardStyle = {
    borderRadius: 14,
    borderEnabled: true,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff'
  };

  const initialStudioState = useMemo(() => {
    return {
      version: '3.1.0',
      panels: {
        filters: { collapsed: true }
      },
      schema: {
        fields: {
          'agent_orders.amount': { format: '$#,##0.00' },
          'agent_orders.savings': { format: '$#,##0.00' },
          'payment_breakdown.volume': { format: '$#,##0.00' },
          'fleet_summary.spentToday': { format: '$#,##0.00' },
          'fleet_summary.dailyCap': { format: '$#,##0.00' },
          'fleet_summary.totalVolume': { format: '$#,##0.00' },
          'category_stats.volume': { format: '$#,##0.00' },
          'category_stats.savings': { format: '$#,##0.00' },
          'merchant_stats.volume': { format: '$#,##0.00' },
          'fleet_kpi.totalVolume': { format: '$#,##0.00' },
          'fleet_kpi.totalSavings': { format: '$#,##0.00' },
          'fleet_kpi.capturedVolume': { format: '$#,##0.00' },
          'fleet_kpi.escrowVolume': { format: '$#,##0.00' },
          'fleet_kpi.refundedVolume': { format: '$#,##0.00' },
          'fleet_kpi.savingsRate': { format: '0.0%' },
          'fleet_kpi.avgTrustScore': { format: '0.0%' }
        }
      },
      pages: [
        {
          id: 'page-simulation-telemetry',
          name: 'Autonomous Buyer Agent Simulation Telemetry',
          widgets: {
            // Row 1: 4 Top KPI Metric Cards (Captured Settlements, Escrow Holds, PayPal Refunds, Batch Savings)
            'kpi-sim-captured': {
              type: 'value',
              format: {
                title: { text: 'PayPal Captured (Settled)', enabled: true },
                widget: lightCardStyle
              },
              dataMapping: {
                value: [{ id: 'fleet_kpi.capturedVolume', aggregation: 'max' }]
              }
            },
            'kpi-sim-escrow': {
              type: 'value',
              format: {
                title: { text: 'PayPal Escrow (Authorized Hold)', enabled: true },
                widget: lightCardStyle
              },
              dataMapping: {
                value: [{ id: 'fleet_kpi.escrowVolume', aggregation: 'max' }]
              }
            },
            'kpi-sim-refunds': {
              type: 'value',
              format: {
                title: { text: 'Automated PayPal Refunds (Restitution)', enabled: true },
                widget: lightCardStyle
              },
              dataMapping: {
                value: [{ id: 'fleet_kpi.refundedVolume', aggregation: 'max' }]
              }
            },
            'kpi-sim-savings': {
              type: 'value',
              format: {
                title: { text: 'Consolidation Batch Savings', enabled: true },
                widget: lightCardStyle
              },
              dataMapping: {
                value: [{ id: 'fleet_kpi.totalSavings', aggregation: 'max' }]
              }
            },

            // Row 2 Left: Bar Chart of Sourced Volume by Upstream Merchant
            'chart-merchant-volume': {
              type: 'column-chart-grouped',
              format: {
                title: { text: 'Procurement Volume by Sourced Merchant', enabled: true },
                widget: lightCardStyle
              },
              dataMapping: {
                categoryKey: [{ id: 'merchant_stats.merchant' }],
                valueKey: [{ id: 'merchant_stats.volume', aggregation: 'sum' }]
              }
            },

            // Row 2 Right: Donut Chart of PayPal Settlement & Refund Distribution
            'chart-payment-breakdown': {
              type: 'donut-chart',
              format: {
                title: { text: 'PayPal Settlement & Refund Distribution', enabled: true },
                widget: lightCardStyle
              },
              dataMapping: {
                categoryKey: [{ id: 'payment_breakdown.status' }],
                valueKey: [{ id: 'payment_breakdown.volume', aggregation: 'sum' }]
              }
            },

            // Row 3 Left: Live Agent Sourced Invoices Grid (Individual transactions with PayPal State)
            'grid-live-invoices': {
              type: 'grid',
              format: {
                title: { text: 'Live Agent Sourced Invoices & PayPal Payment State', enabled: true },
                widget: lightCardStyle
              },
              dataMapping: {
                cols: [
                  { id: 'agent_orders.id' },
                  { id: 'agent_orders.paymentStatus' },
                  { id: 'agent_orders.amount' },
                  { id: 'agent_orders.agent' },
                  { id: 'agent_orders.merchant' },
                  { id: 'agent_orders.product' },
                  { id: 'agent_orders.paypalRef' },
                  { id: 'agent_orders.savings' },
                  { id: 'agent_orders.trustScore' }
                ]
              }
            },

            // Row 3 Right: Agent Fleet Budget Utilization Grid
            'grid-fleet-utilization': {
              type: 'grid',
              format: {
                title: { text: 'Agent Fleet Budget Utilization & Quotas', enabled: true },
                widget: lightCardStyle
              },
              dataMapping: {
                cols: [
                  { id: 'fleet_summary.name' },
                  { id: 'fleet_summary.spentToday' },
                  { id: 'fleet_summary.dailyCap' },
                  { id: 'fleet_summary.ordersCount' },
                  { id: 'fleet_summary.totalVolume' }
                ]
              }
            }
          },
          widgetLayout: {
            // Row 1 (y: 0-4): 4 KPI cards spanning full 24 cols
            'kpi-sim-captured': { xTrack: 0, yTrack: 0, xSpan: 6, ySpan: 4 },
            'kpi-sim-escrow': { xTrack: 6, yTrack: 0, xSpan: 6, ySpan: 4 },
            'kpi-sim-refunds': { xTrack: 12, yTrack: 0, xSpan: 6, ySpan: 4 },
            'kpi-sim-savings': { xTrack: 18, yTrack: 0, xSpan: 6, ySpan: 4 },

            // Row 2 (y: 4-14): 14-col Merchant Volume Column Chart + 10-col Payment Status Donut Chart
            'chart-merchant-volume': { xTrack: 0, yTrack: 4, xSpan: 14, ySpan: 10 },
            'chart-payment-breakdown': { xTrack: 14, yTrack: 4, xSpan: 10, ySpan: 10 },

            // Row 3 (y: 14-27): 14-col Live Invoices Grid + 10-col Fleet Budget Utilization Grid
            'grid-live-invoices': { xTrack: 0, yTrack: 14, xSpan: 14, ySpan: 13 },
            'grid-fleet-utilization': { xTrack: 14, yTrack: 14, xSpan: 10, ySpan: 13 }
          }
        }
      ],
      selectedPageId: 'page-simulation-telemetry'
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

  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  return (
    <div className="h-full flex flex-col space-y-3">
      {/* Top Banner: Metrics & Global Controls */}
      <div className="bg-white border border-slate-200/90 rounded-2xl px-5 py-3 shadow-xs shrink-0">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
          
          {/* Left: Simulator Title & Description */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-bold tracking-tight text-slate-900 truncate">
                  Autonomous Buyer Agent Fleet Simulator
                </h2>
                <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center gap-1.5 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Multi-Agent Mesh
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-normal mt-0.5 max-w-2xl">
                Simulating concurrent enterprise AI buyers autonomously scanning Channel3, qualifying merchants, and issuing corporate invoices via PayPal.
              </p>
            </div>
          </div>

          {/* Right: Telemetry KPI Badges + Tab Switcher + Action Controls */}
          <div className="flex items-center gap-4 xl:gap-5 border-t xl:border-t-0 xl:border-l border-slate-200/90 pt-3 xl:pt-0 xl:pl-5 w-full xl:w-auto justify-between xl:justify-end flex-wrap">
            
            {/* Live Metrics Summary */}
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">Captured (Settled)</span>
                <span className="text-sm font-mono font-bold text-blue-700 leading-tight">
                  {formatCurrency(totalCapturedVolume)}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">PayPal Escrow</span>
                <span className="text-sm font-mono font-bold text-amber-600 leading-tight">
                  {formatCurrency(totalEscrowVolume)}
                </span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">PayPal Refunds</span>
                <span className="text-sm font-mono font-bold text-rose-600 leading-tight flex items-center gap-1">
                  <span>{formatCurrency(totalRefundedVolume)}</span>
                  <span className="text-[10px] font-mono text-slate-400">({totalRefundedCount})</span>
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">Batch Savings</span>
                <span className="text-sm font-mono font-bold text-emerald-600 leading-tight">
                  +{formatCurrency(totalSimulatedSavings)}
                </span>
              </div>
            </div>

            {/* Sub-tab Switcher: [ 🤖 Fleet View ] vs [ 📊 AG Studio Real-Time v3.1 ] */}
            <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button
                onClick={() => setActiveSubTab('agents')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  activeSubTab === 'agents'
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200/70'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Bot className="w-4 h-4 text-blue-600" />
                <span>Fleet View</span>
              </button>

              <button
                onClick={() => setActiveSubTab('studio')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  activeSubTab === 'studio'
                    ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/70'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                <span>AG Studio Real-Time</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                  v3.1
                </span>
              </button>
            </div>

            {/* Action Buttons: Pause / Start + Reset */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
                  isRunning 
                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
                title={isRunning ? 'Pause Simulation' : 'Start Simulation'}
              >
                {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isRunning ? 'Pause' : 'Start'}</span>
              </button>

              <button
                onClick={handleReset}
                className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs transition cursor-pointer border border-slate-200"
                title="Reset Simulation Metrics"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Main View Area: Either AG Studio Embedded Canvas OR Fleet Cards Grid */}
      {activeSubTab === 'studio' ? (
        <div className="flex-1 bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs flex flex-col min-h-0 relative">
          <style dangerouslySetInnerHTML={{ __html: `
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
            .ag-studio-root,
            .flex-1.w-full.min-h-0 > div {
              height: 100% !important;
              min-height: 100% !important;
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
                <span>AG Studio Real-Time Simulation Telemetry Canvas</span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded-md border border-cyan-800">
                  Live Updating: {logs.length} Transactions
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                Mode: VIEW ONLY
              </span>
            </div>
          </div>

          <div className="flex-1 w-full min-h-0">
            <AgStudio
              data={studioData}
              initialState={initialStudioState}
              theme={lightCustomTheme}
              mode="view"
            />
          </div>
        </div>
      ) : (
        /* Original Fleet View: Left Controls + Center Active Agents + Right Live Interaction Stream */
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0 overflow-hidden">
          
          {/* Column 1: Simulation Parameters Panel (3 cols) */}
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col space-y-4 overflow-y-auto">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Sliders className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Simulation Parameters
              </h3>
            </div>

            {/* 1. Number of Buyer Agents Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-700">Concurrent Buyer Agents</span>
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {numAgents} Agents
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="10"
                step="1"
                value={numAgents}
                onChange={(e) => setNumAgents(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>2 bots</span>
                <span>6 bots</span>
                <span>10 bots</span>
              </div>
            </div>

            {/* 2. Simulation Speed */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 flex items-center justify-between">
                <span>Execution Speed</span>
                <span className="font-mono text-xs text-slate-500">{speedMultiplier}x</span>
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[0.5, 1, 2, 5].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setSpeedMultiplier(spd)}
                    className={`py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer border ${
                      speedMultiplier === spd
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Budget & Daily Spending Cap Guardrails */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Agent Spending Profile</label>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: 'conservative', label: 'Tight ($500)' },
                  { id: 'balanced', label: 'Normal ($1.5k)' },
                  { id: 'aggressive', label: 'Enterprise ($5k)' }
                ].map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => setBudgetDistribution(tier.id as any)}
                    className={`p-1.5 rounded-lg text-[10px] font-bold text-center transition cursor-pointer border ${
                      budgetDistribution === tier.id
                        ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Product Catalog Scope */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Target Product Verticals</label>
              <select
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value as any)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 font-medium text-slate-700 focus:outline-blue-600"
              >
                <option value="all">All Enterprise Categories (Mixed)</option>
                <option value="furniture">Furniture (Standing Desks, Chairs)</option>
                <option value="electronics">Electronics (Monitors, Hubs, Mice)</option>
                <option value="supplies">Office Supplies (Pens, Paper)</option>
              </select>
            </div>

            {/* 5. Flexible Delay Consolidation Tendency */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-700">Consolidated Batch Adoption</span>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  {delayConsolidationRate}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={delayConsolidationRate}
                onChange={(e) => setDelayConsolidationRate(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400 leading-snug">
                Flexible delivery option locks in 15% pallet discount.
              </p>
            </div>

            {/* 6. Fault & Autonomous PayPal Refund Rate */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-700">SLA Fault & Refund Rate</span>
                <span className="font-mono font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                  {refundFailureRate}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="5"
                value={refundFailureRate}
                onChange={(e) => setRefundFailureRate(Number(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400 leading-snug">
                Simulates carrier SLA violations triggering instant PayPal Escrow voids and full restitution.
              </p>
            </div>

            {/* Protocol Guardrails Summary */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 mt-auto">
              <div className="font-bold text-slate-700 flex items-center gap-1.5 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Active Agent Safeguards</span>
              </div>
              <ul className="text-[10px] text-slate-500 space-y-1">
                <li>• Automated ProcureAI KYB screening</li>
                <li>• Merchant of Record abstraction</li>
                <li>• Connected PayPal Orders v2 escrow capture</li>
              </ul>
            </div>
          </div>

          {/* Column 2: Active Agents Grid & Details (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col min-h-0 overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Autonomous Buyer Agents ({agents.length})
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Click agent to inspect
              </span>
            </div>

            {/* Agents List / Cards */}
            <div className="flex-1 overflow-y-auto space-y-2.5 py-3 pr-1">
              {agents.map((ag) => {
                const isSelected = selectedAgentId === ag.id;
                const percentCap = Math.min(100, (ag.spentToday / ag.dailyCap) * 100);

                let statusBadge = (
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    Idle
                  </span>
                );

                if (ag.status === 'searching') {
                  statusBadge = (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 animate-pulse flex items-center gap-1">
                      <Search className="w-2.5 h-2.5" /> Searching
                    </span>
                  );
                } else if (ag.status === 'evaluating') {
                  statusBadge = (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> Evaluating
                    </span>
                  );
                } else if (ag.status === 'ordering') {
                  statusBadge = (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <ShoppingCart className="w-2.5 h-2.5" /> Invoicing
                    </span>
                  );
                }

                return (
                  <div
                    key={ag.id}
                    onClick={() => setSelectedAgentId(ag.id === selectedAgentId ? null : ag.id)}
                    className={`p-3 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-400 shadow-xs'
                        : 'bg-white hover:bg-slate-50/70 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg ${ag.avatarBg} text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs`}>
                          {ag.name.slice(0, 1)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800">{ag.name}</div>
                          <div className="text-[10px] font-mono text-slate-400">{ag.walletAddress}</div>
                        </div>
                      </div>
                      {statusBadge}
                    </div>

                    {ag.currentTask && (
                      <div className="text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded-lg border border-slate-100 mb-2 font-medium">
                        {ag.currentTask}
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-slate-400">Daily Spend:</span>
                        <span className="font-semibold text-slate-700">
                          {formatCurrency(ag.spentToday)} / {formatCurrency(ag.dailyCap)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            percentCap > 80 ? 'bg-amber-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${percentCap}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                      <span>{ag.successfulOrders} orders completed</span>
                      <span className="font-mono font-semibold text-slate-700">
                        Total: {formatCurrency(ag.totalVolume)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedAgent && (
              <div className="mt-2 p-3 bg-slate-900 text-white rounded-xl text-xs space-y-2 shrink-0 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="font-mono font-bold text-blue-400 flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5" /> {selectedAgent.name} Context
                  </span>
                  <button
                    onClick={() => setSelectedAgentId(null)}
                    className="text-slate-400 hover:text-white text-[10px] font-mono"
                  >
                    ✕ Close
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <div>
                    <span className="text-slate-400">Wallet:</span>
                    <div className="text-slate-200 truncate">{selectedAgent.walletAddress}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Orders:</span>
                    <div className="text-emerald-400 font-bold">{selectedAgent.successfulOrders} fulfilled</div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-300 border-t border-slate-800 pt-1.5">
                  <span className="text-slate-400">Last Action: </span>
                  {selectedAgent.lastAction || 'Waiting for next scheduled procurement cycle.'}
                </div>
              </div>
            )}
          </div>

          {/* Column 3: Live Agent Interaction & Settlement Feed (4 cols) */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col min-h-0 overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Live Interaction & Invoice Feed
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Streaming
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 py-3 pr-1">
              {logs.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-center p-4 text-slate-400">
                  <Bot className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-xs">Simulation starting...</p>
                  <p className="text-[10px]">Agents will begin autonomous product inquiries momentarily.</p>
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-[11px] truncate max-w-[170px]">
                        {log.agentName}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {log.timestamp}
                      </span>
                    </div>

                    <div className="text-[11px] font-medium text-slate-700 flex items-center gap-1.5">
                      <Package className="w-3 h-3 text-blue-600 shrink-0" />
                      <span className="truncate">{log.product}</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100/80">
                      <div className="flex items-center gap-1 font-mono font-bold text-blue-700">
                        <CreditCard className="w-3 h-3 text-blue-600" />
                        <span>{formatCurrency(log.amount)}</span>
                        {log.savings > 0 && (
                          <span className="text-emerald-600 text-[9px] bg-emerald-50 px-1 rounded">
                            (-{formatCurrency(log.savings)})
                          </span>
                        )}
                      </div>

                      {log.status === 'CAPTURED' && (
                        <div className="flex items-center gap-1 text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                          <span>CAPTURED • Trust {log.trustScore}</span>
                        </div>
                      )}

                      {log.status === 'ESCROW_HOLD' && (
                        <div className="flex items-center gap-1 text-[9px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          <span>ESCROW HOLD</span>
                        </div>
                      )}

                      {log.status === 'REFUNDED' && (
                        <div className="flex items-center gap-1 text-[9px] font-mono text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                          <RotateCcw className="w-2.5 h-2.5 text-rose-600" />
                          <span>REFUNDED (Auto)</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between shrink-0">
              <span>ProcureAI Merchant of Record Engine</span>
              <span>PayPal Orders v2</span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
