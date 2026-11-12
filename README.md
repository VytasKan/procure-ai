# ProcureAI — Autonomous B2B Master Distributor & Dual AG Grid Settlement

> **Built for the Global Hackathon:** [Build What's Next with PayPal and AI](https://paypalaihackathon.devpost.com/)  
> **Target Prize Tracks:**  
> 🏆 **1st Place Overall ($12,000)**  
> 🤖 **Best Use of Agentic Commerce ($5,000)**  
> 📊 **Best Use of AG Grid ($5,000)**  
> 🛍️ **Best Use of Channel3 ($1,500)**

---

## 🎯 The Core Problem & The "B2B Master Distributor" Breakthrough

Instead of forcing merchants like Staples or Newegg to accept experimental agent protocols directly, **ProcureAI acts as the B2B Master Distributor (Merchant of Record)** for the machine economy:

1. **Client Agents Cannot Buy B2B Directly:** Enterprise suppliers require Net-30 credit terms, tax exempt certificates, and corporate EDI integrations. Merchants also do not accept autonomous AI payments.
2. **ProcureAI as Merchant of Record:** ProcureAI holds corporate B2B distributor accounts with enterprise suppliers (Staples, Newegg, CDW). Client AI agents buy directly from ProcureAI.
3. **The Two-Sided Revenue Model:**
   - **Client Agent pays ProcureAI via PayPal:** e.g., $15.00 ($13.99 wholesale cost + $1.01 distributor fee).
   - **ProcureAI fulfills the order:** Backend triggers the Channel3 affiliate link to purchase from the supplier for $13.99 using ProcureAI's corporate account.
   - **Two-Sided Profit Spread:** ProcureAI captures the **$1.01 markup fee** AND the **Channel3 affiliate commission (~$0.70)**.
4. **ProcureAI Escrow Protection:** How does the Client Agent know the order won't fail? ProcureAI evaluates supplier trust and locks the client's payment in **PayPal Escrow (`intent: AUTHORIZE`)**. Funds are released only upon carrier tracking verification (UPS / FedEx Freight); fraudulent tracking triggers instant automated PayPal restitution refunds.

---

## 🏗️ Complete System Architecture & Views

ProcureAI provides a complete 3-persona architecture connecting autonomous buyers, distributor operations, and fleet simulations:

### 1. 🏢 Buyer Portal (`BuyerPortalView.tsx`)
A full-width, edge-to-edge workspace designed for corporate procurement and facilities managers:
- **Enterprise Inventory Ledger (AG Grid Enterprise):** Real-time monitoring of corporate supplies, auto-reorder thresholds, stock consumption simulations, and multi-level row grouping (by Category or Deficit State).
- **Interactive Multi-Turn Procurement Agent (`AgentChat.tsx` & `Channel3Chat.tsx`):** Conversational buyer copilot with live streaming tokens, auto-suggested replenishment presets, and hard policy enforcement (e.g., blocking unauthorized luxury brands like Herman Miller or flagrant dropshippers).
- **Live Order Builder Canvas (`OrderBuilderCanvas.tsx`):** Real-time multi-item basket consolidation, freight grouping, and commercial invoice preview before payment execution.
- **Delivery Flexibility Discounts:** Dynamic tier selection (Instant Priority vs. 3-Day Green Consolidated Freight with up to 4.5% automated cash back discount).
- **Centered Order History Ledger (AG Grid):** Vertically centered and padded order ledger tracking PO numbers, amounts, fulfillment statuses, and carrier tracking links with zero clipping.
- **Invoices & Payments Clearinghouse (`BuyerInvoicesTab.tsx`):** PDF/Commercial invoice inspection with deep-linked PayPal Transaction IDs, authorization timestamps, and live settlement statuses.

### 2. 🛡️ Distributor Backend Operations (`CatalogView.tsx`, `LedgerGrid.tsx`, `StudioAnalyticsView.tsx`)
The operational cockpit for ProcureAI as Merchant of Record:
- **AG Grid #1 — Multi-Merchant Catalog Grid:** Evaluates incoming Channel3 discovery streams, applies ProcureAI due-diligence scores (0-100), KYB checks, and pricing spreads.
- **AG Grid #2 — Master Audit Ledger Grid:** Tracks two-sided accounting across every PO: Client Paid (PayPal) vs. You Paid Merchant vs. Net Margin & Affiliate Commission. Features 1-click escrow release (`/authorizations/capture`) and dispute restitution (`/captures/refund`).
- **AG Studio 3.1 Custom Widgets:** Embedded Anomaly Radar, SLA Breach Monitor, Supplier KYB Trust Matrix, and Broker Nudge-Bot Scoreboard with baseline schema fallbacks for rock-solid stability.
- **Policy Guardrails & Diagnostics (`PolicyView.tsx`, `SandboxDiagnosticsModal.tsx`):** Real-time threshold sliders for automated escrow routing, collateral enforcement, and live PayPal sandbox OAuth telemetry.

### 3. 🤖 Autonomous Multi-Agent Fleet Simulator (`AgentSimulationView.tsx`)
A live multi-agent clearinghouse simulation:
- Simulates 6 autonomous purchasing agents (Acme Buyer, ByteDance Facilities, Tesla Ops, FinTech Treasury, etc.) concurrently placing procurement orders.
- Real-time pipeline state visualization, live speed controls, chaos injection (simulating synthetic tracking fraud), and PayPal authorization vs. capture vs. refund streaming charts.

---

### 📊 The Master Ledger in AG Grid

The Master Ledger showcases two-sided accounting across every transaction:

| Transaction ID | Client Agent | Merchant | Product | Client Paid (PayPal) | You Paid Merchant | Margin + Commission | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CTR-B2B-001** | `treasury-prime.eth` | Newegg | 100 Sharpie S-Gels | **$15.00** *(PayPal)* | $13.99 | **+$1.01** + $0.70 Comm. | ✅ Direct Settled |
| **CTR-B2B-002** | `procure-bot.io` | Staples | 500 BIC Round Stic | **$140.00** *(PayPal)* | $130.00 | **+$10.00** + $6.50 Comm. | 🟡 Escrow In-Transit |
| **CTR-B2B-003** | `rogue-dropship` | borntostandout | 50 Pens | **BLOCKED** | $0.00 | **$0.00** (Risk Gate) | ❌ Guardrail Blocked |

---

## 🛡️ The 4-Step Procurement Flow

```
[ Step 1: Client Agent Intent / Inventory Trigger ]
Inventory deficit detected or Buyer types: "I need 100 Sharpies under $50"
      │
      ▼
[ Step 2: AG Grid #1 — Channel3 Offer Catalog & ProcureAI Qualification ]
• newegg.com        | Sharpie S-Gel ($0.32/pen)   | ✅ Approved (Score 88)  | Master Distributor Active
• staples.com       | BIC Round Stic ($0.28/pen)  | ✅ Approved (Score 94)  | Master Distributor Active
• borntostandout    | 'pen - ㅆㅂ' ($0.18/pen)    | ❌ Blocked (Score 12)   | Dropshipper BLOCKED
      │
      ▼ Client selects Newegg Sharpie Offer / Assembles Basket
[ Step 3: Client Agent Pays ProcureAI via PayPal ]
Client pays ProcureAI via PayPal Sandbox API: Wholesale ($13.99) + Fee ($1.01) = $15.00
      │
      ├───────────────────────────────┬───────────────────────────────┐
      ▼                                                               ▼
🟢 High-Trust Path (Score ≥ 75)                               🟡 Conditional Escrow (Score < 75)
PayPal direct capture (intent: 'CAPTURE')                      PayPal escrow hold (intent: 'AUTHORIZE')
Fulfillment triggered via Channel3 affiliate link              Carrier tracking (UPS/FedEx) required before capture
      │                                                               │
      └───────────────────────────────┬───────────────────────────────┘
                                      ▼
[ Step 4: AG Grid #2 — Master Distributor Ledger & Restitution ]
• Records Two-Sided Accounting: Client Paid (PayPal) vs. You Paid Merchant vs. Net Margin + Comm.
• 1-Click Inline Escrow Release: Verifies tracking proof & executes /authorizations/{id}/capture
• 1-Click Inline Dispute Restitution: Flags fake tracking & executes /captures/{id}/refund
• Embedded AG Studio 3.1: Anomaly Radar & Nudge-Bot Broker Scoreboard
```

---

## 💳 Deep, Load-Bearing PayPal API Integration

PayPal is not a static checkout button; it is the **load-bearing financial arbitration engine**:

| Protocol Action | PayPal API Endpoint | Purpose in ProcureAI |
| :--- | :--- | :--- |
| **Instant Settlement** | `POST /v2/checkout/orders` (`intent: 'CAPTURE'`) | Immediate payment execution for verified enterprise brokers. |
| **Conditional Escrow Hold** | `POST /v2/checkout/orders` (`intent: 'AUTHORIZE'`) | Locks buyer capital in escrow for unverified/medium-trust brokers. |
| **Tracking Release** | `POST /v2/payments/authorizations/{id}/capture` | Atomically releases escrowed funds to broker upon carrier tracking verification. |
| **Tracking Fraud Restitution** | `POST /v2/payments/captures/{id}/refund` | Automatically refunds buyer agent if carrier tracking is synthetic or SLA breached. |
| **Authorization Void** | `POST /v2/payments/authorizations/{id}/void` | Cancels pending escrow holds before capture if broker fails to respond. |
| **Identity & Health** | `POST /v1/oauth2/token` | Live sandbox authentication, credential telemetry, and token lifecycle. |

---

## 📊 Dual AG Grid & AG Studio Implementation

ProcureAI features **three distinct AG Grids** and custom **AG Studio** widgets:

1. **Enterprise Inventory Grid (`InventoryLedgerTab.tsx`):**
   - Built on AG Grid Enterprise with real-time category grouping, stock deficit threshold filtering, and inline 1-click re-order replenishment triggers.
2. **AG Grid #1 — The Catalog Grid (`CatalogView.tsx`):**
   - Multi-merchant offer table populated from Channel3.
   - ProcureAI qualification badges (`✅ Approved`, `🟡 Escrow Review`, `❌ Blocked`).
   - Row expansion drawer for Merchant KYB & VAT audit.
   - Inline **`[Select Offer]`** action button (blocked on unverified dropshippers).
3. **AG Grid #2 — The Audit Ledger Grid (`LedgerGrid.tsx` & `BuyerPortalView.tsx`):**
   - Institutional clearinghouse tracking `Transaction ID`, `Buying Agent`, `Seller Agent (Broker)`, `Merchant`, `Amount`, `Escrow Status`, and `Fulfillment Status`.
   - Inline 1-click **`[Release]`** and **`[Refund]`** micro-actions with real-time UI feedback.
   - Pinned totals aggregation and multi-row selection calculation banner.
4. **AG Studio Analytics (`StudioAnalyticsView.tsx`):**
   - **Two-Sided Settlements Grid & Supplier KYB Matrix:** Multi-table relational clearinghouse.
   - **Merchant Spend & KYB Risk Scorecard:** Live counterparty exposure by merchant.
   - **Anomaly & SLA Breach Radar:** Auto-flags fake tracking numbers and suspicious refund spikes.
   - **Nudge-Bot Broker Scoreboard:** Friendly reminder widget tracking unfulfilled tracking numbers with 1-click **"Send Nudge"** action.

---

## 🎬 Video Plot & Demo Walkthrough

Refer to [TIMED_SCRIPT.md](TIMED_SCRIPT.md) for the exact 3-minute scene-by-scene script and [VIDEO_PLOT.md](VIDEO_PLOT.md) for detailed camera/click choreography.

### Quick 3-Beat Summary:
1. **Beat 1: Autonomous Inventory & Replenishment (Buyer Portal):**
   - Open Buyer Portal. Review AG Grid Enterprise inventory. Simulate stock consumption.
   - Trigger 1-click replenishment. Buyer Agent generates consolidated multi-item quote with delivery flexibility discounts.
2. **Beat 2: Guardrails & PayPal Escrow Routing:**
   - Attempt procuring Herman Miller or unverified dropshippers. Policy guardrails enforce corporate limits.
   - Medium-trust orders route to PayPal Escrow (`intent: AUTHORIZE`).
3. **Beat 3: Distributor Backend & AG Grid Two-Sided Settlement:**
   - Switch to Distributor Operations. Inspect AG Grid Master Ledger.
   - Verify tracking proof & trigger 1-click PayPal capture. Demonstrate anomaly detection and automated PayPal refund restitution.

---

## 🛠️ Tech Stack & Directory Structure

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Payment Engine:** PayPal REST APIs (v1 OAuth2, v2 Checkout Orders, v2 Payments Authorize/Capture/Refund)
- **Data Grids & Analytics:** AG Grid Community & Enterprise (`ag-grid-react`, `ag-grid-enterprise`), AG Studio (`ag-studio`, `ag-studio-react`)
- **Commerce Graph:** Channel3 Live Product & Catalog API
- **Styling:** Tailwind CSS, Lucide React

```
src/
├── backend/
│   ├── services/
│   │   ├── paypal-client.ts       # PayPal OAuth2, Authorize, Capture & Refund engine
│   │   ├── agent-orchestrator.ts  # Intent parser, broker assignment & contract engine
│   │   ├── catalog-service.ts     # Channel3 discovery & supplier qualification
│   │   ├── inventory-store.ts     # Enterprise inventory ledger & procurement policy engine
│   │   └── ledger-store.ts        # Live audit ledger & broker registry store
│   ├── types/
│   │   └── index.ts               # B2B contracts, CandidateOffers & Fulfillment models
│   └── config/env.ts              # PayPal & Channel3 environment configuration
│
└── frontend/
    └── components/
        ├── BuyerPortalView.tsx    # Unified Full-Width Buyer Portal (Inventory, Chat, Basket Canvas, Invoices)
        ├── InventoryLedgerTab.tsx # AG Grid Enterprise Inventory Ledger
        ├── OrderBuilderCanvas.tsx # Real-time multi-item basket & invoice builder
        ├── BuyerInvoicesTab.tsx   # Commercial invoices & payment settlement history
        ├── CatalogView.tsx        # AG Grid #1: Channel3 Offer & Qualification Grid
        ├── LedgerGrid.tsx         # AG Grid #2: Transaction & Escrow Audit Ledger Grid
        ├── StudioAnalyticsView.tsx# AG Studio Custom Widgets & Nudge Scoreboard
        ├── AgentSimulationView.tsx# Multi-Agent Autonomous Fleet Simulator
        ├── AgentChat.tsx          # Buying Agent Chat with 4-step demo presets
        └── Header.tsx & NavRail.tsx # Navigation & persona switching
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (`.env.local`)
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

```bash
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_API_BASE_URL=https://api-m.sandbox.paypal.com
CHANNEL3_API_KEY=your_channel3_api_key # Optional: deterministic fallback enabled
TRUST_THRESHOLD=75
```
> **Note:** Built-in deterministic simulation fallbacks are already included for Channel3 and PayPal Sandbox authentication! You can test all features immediately without configuring external API keys.

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to experience the live dual-grid procurement demo.

---

## 🏆 Hackathon Alignment Matrix

| Track | Evidence in ProcureAI |
| :--- | :--- |
| **1st Place Overall ($12,000)** | Full end-to-end B2B procurement architecture solving multi-vendor integrations, supplier identity qualification, escrow holds, and restitution. |
| **Best Use of Agentic Commerce ($5,000)** | True Agent-to-Agent (A2A) commerce: Buyer Agent commissions Procurement Broker Agents who hold real supplier integrations and PayPal merchant accounts. |
| **Best Use of AG Grid ($5,000)** | Multi-grid architecture: **Inventory Grid** (AG Grid Enterprise with grouping/aggregation), **Catalog Grid** for qualification, and **Ledger Grid** for settlement audit, plus AG Studio custom widgets. |
| **Best Use of Channel3 ($1,500)** | Turns Channel3's 100M+ raw offer graph into verified, executable B2B contracts by filtering out risky dropshippers and providing streaming natural language shopping. |

---

## 📄 License
MIT License. Built for the PayPal AI Hackathon.
