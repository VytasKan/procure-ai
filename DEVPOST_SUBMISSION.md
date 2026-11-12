# ProcureAI: The Autonomous B2B Master Distributor & Financial Settlement Engine

> **Devpost Submission:** Build What's Next with PayPal and AI Global Hackathon  
> **Tracks Targeted:** 1st Place Overall, Best Use of Agentic Commerce, Best Use of AG Grid, Best Use of Channel3

---

## 💡 Inspiration: The Missing Link in the Agentic Economy

Autonomous AI agents are increasingly entrusted with complex enterprise responsibilities: tracking cloud consumption, managing facility inventory, and generating production schedules. Yet the moment an autonomous agent needs to purchase physical goods for an enterprise—whether restocking 10,000 barcode rolls, purchasing 50 ergonomic standing desks, or procuring replacement server racks—**it hits an immediate structural brick wall**:

1. **Suppliers do not accept autonomous agent transactions:** Enterprise distributors (e.g., Staples, Newegg, CDW) do not support experimental wallet transfers, LLM chat checkouts, or unverified automated cards.
2. **AI agents cannot open corporate B2B credit accounts:** Enterprise B2B transactions run on Net-30 credit terms, audited tax-exempt documentation, commercial trade agreements, and Electronic Data Interchange (EDI) feeds. An autonomous software bot cannot legally or operationally maintain these direct supplier relationships.
3. **The Counterparty Risk Dilemma:** If a corporate treasury hands a budget to an autonomous buying bot, how does the CFO ensure the agent doesn't overpay, order unapproved luxury brands, fall victim to synthetic carrier tracking numbers, or lose enterprise funds without refund recourse?

We realized the world doesn't need another generic consumer chatbot with an affiliate checkout link. **The machine economy needs a trusted, institutional B2B Master Distributor and Merchant of Record.**

That was our spark for **ProcureAI**. ProcureAI holds corporate vendor lines with suppliers. Client AI agents buy directly from ProcureAI. We arbitrate transaction risk through load-bearing **PayPal Escrow**, discover live catalog inventory across 100M+ items with **Channel3**, and manage real-time financial clearing through **AG Grid Enterprise**.

---

## ⚙️ How We Built It: A 3-Pillar Autonomous Architecture

We built ProcureAI as a full-stack, enterprise-grade Next.js application that bridges high-frequency AI intent parsing with institutional financial settlement.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        1. BUYER AGENT PORTAL                           │
│  • AG Grid Enterprise: Inventory Ledger & Auto-Replenishment Triggers   │
│  • Natural Language Multi-Turn Copilot & Corporate Guardrail Engine    │
│  • Live Order Builder Canvas: Multi-Item Consolidation & Green Freight │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                         Channel3 Product Graph
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                  2. TRUSTROUTER DUE-DILIGENCE ENGINE                   │
│  • KYB Counterparty Scoring: Evaluates Dropshipper vs. Enterprise Tier │
│  • Hard Policy Enforcement: Blocks luxury brands & unit price caps     │
│  • PayPal Escrow Routing Decision Matrix: Direct Capture vs. Escrow   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                    PayPal REST API (v2 Checkout)
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│               3. DISTRIBUTOR OPERATIONS & MASTER LEDGER                │
│  • AG Grid #1: Channel3 Live Supplier Qualification & Due Diligence    │
│  • AG Grid #2: Master Two-Sided Settlement Ledger (Margin & Comm.)    │
│  • 1-Click Escrow Capture (`/authorizations/{id}/capture`)            │
│  • 1-Click Instant Restitution Refund (`/captures/{id}/refund`)       │
│  • AG Studio 3.1: Anomaly Radar & Broker SLA Nudge-Bot                 │
└────────────────────────────────────────────────────────────────────────┘
```

### 1. The Financial Engine: Load-Bearing PayPal Escrow Arbitration
Rather than treating PayPal as an afterthought iframe checkout button, PayPal serves as our **load-bearing legal and financial arbitration clearinghouse**:

* **Conditional Authorization Escrow (`POST /v2/checkout/orders` with `intent: 'AUTHORIZE'`):** When an agent orders from a secondary or medium-trust supplier (Trust Score \(T < 75\)), client capital is locked securely in PayPal’s vault. The supplier or procurement broker is notified, but funds remain escrowed.
* **Atomic Deliverable Capture (`POST /v2/payments/authorizations/{id}/capture`):** Upon verified carrier delivery (UPS, FedEx Freight, or verified EDI dispatch), our backend triggers an atomic PayPal capture, releasing payment to the fulfillment agent.
* **Dispute Restitution & Fraud Slashing (`POST /v2/payments/captures/{id}/refund`):** If a rogue supplier supplies synthetic tracking or breaches delivery SLAs, our Anomaly Radar flags the transaction. A single click or automated webhook executes an instant PayPal refund, restoring 100% of the funds to the corporate treasury while slashing the supplier's reputation score.
* **Direct Instant Settlement (`POST /v2/checkout/orders` with `intent: 'CAPTURE'`):** For verified, top-tier enterprise partners (Staples, Newegg, Dell), transactions settle immediately with zero friction.

### 2. Dual AG Grid & AG Studio Telemetry
ProcureAI uses AG Grid across both consumer and institutional sides of the transaction:
* **The Buyer Inventory Grid (`InventoryLedgerTab.tsx`):** Built with `ag-grid-enterprise`, featuring real-time row grouping across categories and stock deficit states, instant filtering, and one-click stock depletion simulations.
* **The Supplier Qualification Catalog Grid (`CatalogView.tsx`):** Filters incoming Channel3 raw product streams, surfacing KYB audit metrics, VAT verification, and real-time trust scoring badges.
* **The Master Distributor Audit Ledger (`LedgerGrid.tsx`):** Demonstrates **two-sided B2B accounting** across every purchase order. Columns track:
  $$\text{Client Paid (PayPal)} \quad \text{vs.} \quad \text{ProcureAI Cost} \quad \text{vs.} \quad \text{Net Distributor Margin} + \text{Channel3 Affiliate Commission}$$
* **AG Studio 3.1 Visualizations:** Custom widgets embedded directly inside the dashboard provide real-time Anomaly Detection, Merchant Counterparty Exposure charts, and a Supplier Nudge-Bot scoreboard.

### 3. Channel3 Commerce Graph & Multi-Item Order Canvas
* ProcureAI queries the Channel3 API to discover real-time catalog pricing and availability across hundreds of enterprise merchants.
* Our **Order Builder Canvas** dynamically aggregates disparate items into a single corporate purchase order, calculates consolidated freight, and calculates delivery flexibility incentives.

---

## 🧮 The Economics: Two-Sided Margin Spread & Delivery Flexibility

ProcureAI turns autonomous B2B procurement into a profitable business model. For every transaction \(i\), total distributor gross revenue \(R_i\) is composed of the B2B markup spread plus the Channel3 affiliate commission:

\[
R_i = \underbrace{\left( P_{\text{client}} - P_{\text{wholesale}} \right)}_{\text{Distributor Markup Fee}} + \underbrace{\left( P_{\text{wholesale}} \times c_{\text{channel3}} \right)}_{\text{Affiliate Commission}}
\]

Where:
* \(P_{\text{client}}\) is the total billed to the buyer via PayPal.
* \(P_{\text{wholesale}}\) is the cost to fulfill the order via the supplier.
* \(c_{\text{channel3}}\) is the Channel3 affiliate commission rate (typically \(4\% \text{ to } 7\%\)).

### Dynamic Delivery Flexibility Rebates
When enterprise buyers choose our green consolidated shipping tier over instant expedited freight, ProcureAI passes freight efficiency savings back to the corporate treasury:

\[
P_{\text{net}} = P_{\text{client}} \times (1 - \delta_{\text{delay}}) \quad \text{where } \delta_{\text{delay}} = 0.045 \text{ (4.5\% volume discount)}
\]

---

## 🧗 Challenges We Faced

1. **Reconciling PayPal Auth-Capture Timelines with Autonomous Agents:**  
   Standard consumer checkout flows expect human redirection to a PayPal login screen. For true Agent-to-Agent (A2A) commerce, we had to architect headless backend order creation and conditional token management, ensuring that `intent: AUTHORIZE` holds could be securely established and captured asynchronously days later without requiring human session re-authentication.

2. **Enterprise Supply Chain Hallucinations & Risk Gating:**  
   Raw multi-merchant product feeds often contain dropshippers with non-standard packing slips, duplicate SKU listings, or fake tracking numbers. We built **TrustRouter**, an automated due-diligence layer that audits supplier business age, KYB identity, and past fulfillment latency to score candidates on a \(0 \dots 100\) scale before presenting offers to the buyer.

3. **Complex Multi-Item State Synchronization:**  
   Allowing an AI chat copilot to mutate an active order canvas—adding items, removing duplicates, recalculating freight tiers, and applying corporate expense policies in real time—required a unidirectional state pipeline coordinating React hooks, AG Grid event lifecycles, and backend inventory stores.

---

## 🧠 What We Learned

* **Escrow is the foundation of the agentic economy:** Autonomous agents will never achieve widespread enterprise adoption with simple debit rails. Escrow holds (`intent: AUTHORIZE`) and automated restitution refunds (`/captures/{id}/refund`) are mandatory prerequisites for corporate treasuries to grant autonomous purchasing autonomy.
* **Two-sided transparency builds enterprise trust:** By displaying our wholesale purchase cost, distributor markup, and affiliate earnings transparently in AG Grid, enterprise buyers gain audit clarity that legacy distributors hide behind opaque markups.
* **Data grids are the operating system of commerce:** When managing thousands of autonomous transactions, slick consumer card carousels fail. High-density grids with cell renderers, row grouping, pinning, and inline action buttons are essential for supply chain operators.

---

## 🚀 What's Next for ProcureAI

* **Automated Net-30 Invoicing with PayPal Payouts:** Expanding from credit-backed escrow authorizations into automated Net-30 credit lines arbitrated via PayPal Enterprise invoicing.
* **Autonomous Freight EDI Integrations:** Connecting our delivery verification engine directly into project44 and FourKites carrier tracking webhooks for sub-second, multi-modal freight milestone captures.
* **Self-Improving Supplier Reputation Graphs:** Deploying reinforcement learning agents that dynamically adjust supplier trust scores and collateral requirements based on real-time fulfillment history and dispute rates.

