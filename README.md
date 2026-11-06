# ProcureAI — Autonomous B2B Procurement & PayPal Settlement

> Built for the global hackathon: **[Build What's Next with PayPal and AI](https://paypalaihackathon.devpost.com/)**  
> *Target Tracks: 1st Place Overall ($12,000) • Best Use of Agentic Commerce ($5,000) • Best Use of AG Grid ($5,000) • Best Use of Channel3 ($1,500)*

---

## 🎯 Overview

**ProcureAI** is an autonomous corporate purchasing agent powered by **PayPal AI**, **Channel3 MCP**, and **AG Grid**. 

Instead of an office manager or engineering lead spending hours manually comparing supplier quotes, requesting vendor invoices, and entering payment information, they simply specify what they need in plain language. 

ProcureAI executes the workflow end-to-end:
1. **Intelligent Multi-Vendor Search:** Searches 100M+ real product SKUs across authorized retailers (via Channel3 MCP).
2. **Volume Discount Optimization:** Calculates B2B bulk discounts and estimated delivery schedules.
3. **Strict Financial Guardrails (HITL):** Enforces spending policies (e.g. purchases >$350 trigger an interactive Human-in-the-Loop review card).
4. **PayPal Settlement:** Automatically generates sandbox orders (`create_order`) or B2B Net-15 invoices (`create_invoice`) with itemized line items via `@paypal/agent-toolkit`.
5. **Real-Time Enterprise Ledger:** Streams settled transactions into an interactive **AG Grid** financial ledger with live shipment tracking.

---

## 🏗️ Clean Architecture & Separation of Concerns

The codebase maintains strict domain separation between **Backend Services** and the **Frontend UI**:

```
src/
├── backend/                       # 🔒 BACKEND DOMAIN (Pure server-side logic)
│   ├── services/
│   │   ├── paypal-client.ts       # PayPal OAuth2, @paypal/agent-toolkit & REST API
│   │   ├── catalog-service.ts     # Multi-retailer catalog & Channel3 MCP intelligence
│   │   ├── agent-orchestrator.ts  # Autonomous Agent reasoning loop & policy evaluation
│   │   └── ledger-store.ts        # Corporate transaction ledger & audit store
│   ├── types/
│   │   └── index.ts               # Shared TypeScript schemas & API contracts
│   └── config/
│       └── env.ts                 # Validated environment configuration & guardrails
│
├── frontend/                      # 🎨 FRONTEND DOMAIN (Pure Client UI)
│   ├── components/
│   │   ├── Header.tsx             # Brand header with PayPal Sandbox live badge
│   │   ├── AgentChat.tsx          # Conversational agent console with prompt presets
│   │   ├── QuoteApprovalModal.tsx # Interactive Human-in-the-loop Guardrail Card
│   │   ├── LedgerGrid.tsx         # Enterprise AG Grid transaction ledger
│   │   └── MetricsBar.tsx         # Top-level spend, fulfillment & savings KPIs
│   └── utils/
│       └── formatters.ts          # Currency, date, and badge utilities
│
└── app/                           # 🌐 API CONTROLLERS & NEXT.JS ROUTER
    ├── api/
    │   ├── agent/route.ts         # POST /api/agent (intent processing & quote building)
    │   ├── execute/route.ts       # POST /api/execute (PayPal checkout / invoice authorization)
    │   ├── ledger/route.ts        # GET /api/ledger (AG Grid sync & spend metrics)
    │   └── health/route.ts        # GET /api/health (credential check & status)
    ├── globals.css                # AG Grid Quartz Dark & Tailwind styles
    ├── layout.tsx                 # Root layout & dark theme metadata
    └── page.tsx                   # Main executive dashboard
```

---

## 🚀 Quickstart

### 1. Prerequisites
- Node.js 18+ (tested on Node 20 & 24)
- npm or yarn
- (Optional) PayPal Developer Sandbox credentials from [developer.paypal.com](https://developer.paypal.com/dashboard/)

### 2. Installation
```bash
git clone https://github.com/your-username/procure-ai.git
cd procure-ai
npm install
```

### 3. Environment Setup (Optional)
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Configure your credentials:
```env
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
PAYPAL_ENVIRONMENT=SANDBOX
AUTO_APPROVE_THRESHOLD=350.00
```
> **Note:** ProcureAI includes an authentic Sandbox Simulation mode. Even without API keys configured, the application runs out of the box with realistic PayPal sandbox payloads and full AG Grid functionality!

### 4. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🏆 Hackathon Sponsor Integrations

| Technology | Integration Details | Hackathon Prize |
| :--- | :--- | :--- |
| **PayPal AI Toolkit** | Uses `@paypal/agent-toolkit` functions (`create_order`, `create_invoice`, `get_shipment_tracking`) to manage financial checkout. | Grand Prize ($12k) & Best Use of PayPal + AI ($5k) |
| **Agentic Commerce** | Autonomous multi-step catalog search, price optimization, budget guardrail validation, and checkout. | Best Use of Agentic Commerce ($5k) |
| **AG Grid** | Displays the corporate audit ledger with sortable columns, custom cell renderers, and dark quartz theme. | Best Use of AG Grid ($5,000) |
| **Channel3 MCP** | Connects to standardized retail catalogs across 100M+ real SKUs to build multi-merchant bundles. | Best Use of Channel3 ($1,500) |

---

## 📄 License
This project is open-source under the **[MIT License](LICENSE)**.
