# 🎬 ProcureAI — Video Plot & Demo Walkthrough Script
**Target Duration:** 3 Minutes (180 seconds)  
**Hackathon:** Build What's Next with PayPal and AI  
**Tracks Targeted:** 1st Place Overall ($12k), Agentic Commerce ($5k), Best Use of AG Grid ($5k), Channel3 ($1.5k)

---

## 🎭 Characters & Setup
- **Narrator / Presenter (Voiceover or on-camera PIP)**: Authoritative, energetic, product-driven engineer.
- **Visuals**: Fullscreen 1080p recorded from `http://localhost:3000` with clean UI styling, live PayPal API executions, and AG Grid enterprise interactions.

---

## ⏱️ Scene-by-Scene Breakdown

### 🎬 Scene 1: The Hook & The B2B Agentic Commerce Gap (0:00 - 0:25)
* **Visual**: Camera starts on the modern **Buyer Portal** (`http://localhost:3000`). Quick zoom on the top persona bar showing `Acme Buyer Portal`, `Distributor Backend`, and `Multi-Agent Fleet Simulator`.
* **Voiceover**:
  > *"Autonomous AI agents are ready to buy for enterprises. But there is a massive blocker: enterprise suppliers like Staples, Newegg, and CDW don't accept experimental AI payments, and agents can't open Net-30 credit accounts or sign corporate EDI contracts.*
  > 
  > *Meet **ProcureAI** — the Autonomous B2B Master Distributor and Merchant of Record for the agentic economy. Client agents buy safely from ProcureAI using PayPal, while ProcureAI fulfills wholesale orders through Channel3's commerce graph and settles transactions with dual AG Grid transparency and cryptographic escrow arbitration."*

---

### 🎬 Scene 2: Persona 1 — Enterprise Inventory & Agentic Order Building (0:25 - 0:55)
* **Visual**:
  1. Presenter clicks the **Inventory Ledger** tab.
  2. Demonstrates **AG Grid Enterprise** capabilities: toggles grouping from Category (`Office Supplies`, `IT Hardware`) to Deficit State (`Critical Deficit`, `Reorder Triggered`).
  3. Uses the Quick Filter bar to filter for "Pens".
  4. Clicks **"Simulate Stock Consumption"** — watch stock bars drop and reorder warnings flash.
  5. Clicks **"Auto-Replenish Deficits"** or types into the AI Agent Chat: *"I need an ergonomic standing desk and 100 Sharpie pens"*.
* **Voiceover**:
  > *"In the Acme Buyer Portal, corporate facilities inventory is tracked live with AG Grid Enterprise. When supplies deplete, one click or a natural language prompt triggers the Buyer Copilot.*
  > 
  > *Watch the real-time Order Builder Canvas on the right: it parses multi-item intents, queries Channel3's catalog, consolidates shipping freight, and generates a unified commercial invoice with flexible delivery tiers. Buyers can even choose a 3-Day Green Delivery delay for an instant 4.5% volume rebate!"*

---

### 🎬 Scene 3: Corporate Guardrails & PayPal Conditional Escrow (0:55 - 1:25)
* **Visual**:
  1. In the chat, the presenter enters: *"Order 5 Herman Miller Aeron chairs for the executive suite"*.
  2. The system immediately renders the red **Policy Guardrail Blocked** badge: Brand excluded by corporate policy; maximum unit cost cap of $200 exceeded.
  3. Next, presenter selects the verified quote for the Electric Standing Desk.
  4. Points out the **TrustRouter Due-Diligence Badge**: Medium-trust wholesale supplier (Score 72) triggers **Conditional PayPal Escrow (`intent: AUTHORIZE`)**.
  5. Clicks **"Execute Order via PayPal"** — the transaction executes live via the PayPal Sandbox API.
* **Voiceover**:
  > *"ProcureAI doesn't just buy blindly. Enterprise guardrails enforce strict budget caps and prevent rogue purchases. When approved, TrustRouter evaluates counterparty risk.*
  > 
  > *High-trust suppliers get instant direct capture. But for unvetted or secondary suppliers, PayPal is our load-bearing financial arbitration engine: funds are locked conditionally in PayPal Escrow using `intent: AUTHORIZE`, never releasing until delivery is proven."*

---

### 🎬 Scene 4: Persona 2 — Distributor Operations & Two-Sided Settlement (1:25 - 2:05)
* **Visual**:
  1. Presenter clicks the top header persona pill: **"Distributor Operations"**.
  2. Main view shows **AG Grid #2 — The Master Distributor Ledger Grid**.
  3. Highlights the two-sided accounting columns:
     - `Client Paid (PayPal)`: $15.00
     - `Wholesale Cost`: $13.99
     - `Distributor Markup + Channel3 Commission`: +$1.01 fee + $0.70 affiliate commission
  4. Finds an in-transit Escrow transaction. Demonstrates the inline **1-Click Actions**:
     - Clicks **[Verify Tracking & Release]** -> triggers `POST /v2/payments/authorizations/{id}/capture`. The status turns green (`VERIFIED_CAPTURED`).
     - Demonstrates the synthetic tracking anomaly: a rogue broker submits `INVALID-TRACKING-0000`. Clicks **[Dispute & Refund]** -> PayPal executes `POST /v2/payments/captures/{id}/refund`, returning 100% of the funds to the buyer and slashing the broker's reputation.
* **Voiceover**:
  > *"Switching to Distributor Operations reveals the Master Ledger in AG Grid. Here is our two-sided revenue model in full view: ProcureAI captures both the distributor markup fee and the Channel3 affiliate commission.*
  > 
  > *Notice the load-bearing PayPal escrow arbitration: when valid carrier tracking arrives via FedEx or UPS, a single click executes an atomic PayPal capture. And if synthetic tracking or SLA failure is detected, one click fires a real-time PayPal refund restitution."*

---

### 🎬 Scene 5: Persona 3 — Multi-Agent Fleet Simulator & AG Studio Telemetry (2:05 - 2:40)
* **Visual**:
  1. Presenter switches to the **Autonomous Fleet Simulator** persona.
  2. Six autonomous agents (Acme Buyer, ByteDance Facilities, Tesla Ops, FinTech Treasury, etc.) are actively searching, evaluating, and purchasing across multiple suppliers.
  3. Presenter adjusts the simulation speed slider, triggers chaos testing (injecting simulated fraud), and views live AG Studio widgets (Merchant Risk Radar, Broker Nudge Scoreboard).
* **Voiceover**:
  > *"To prove horizontal scalability for the machine economy, our Fleet Simulator runs concurrent multi-agent procurement across dozens of corporate buyers. Real-time telemetry in AG Studio visualizes fraud anomalies, broker SLA tracking, and live PayPal settlement velocity."*

---

### 🎬 Scene 6: Conclusion & Impact (2:40 - 3:00)
* **Visual**:
  1. Return to the clean Buyer Invoices view showing downloadable commercial invoices with PayPal Transaction IDs and settled badges.
  2. Slide showing the Hackathon Alignment Matrix:
     - **PayPal**: Load-bearing Authorize, Capture, Refund, and Void API integration.
     - **AG Grid**: Enterprise grouping, dual catalog/ledger grids, inline actions, AG Studio.
     - **Channel3**: Live multi-merchant commerce discovery transformed into qualified B2B contracts.
* **Voiceover**:
  > *"ProcureAI bridges the gap between enterprise merchants, autonomous AI agents, and frictionless B2B commerce. With PayPal as our escrow arbitrator, Channel3 as our supplier discovery engine, and AG Grid as our clearinghouse, we are building what's next for agentic commerce.*
  > 
  > *Thank you!"*

---

## 📋 Filming Checklist for Presenter
- [ ] Ensure local server is running: `npm run dev` at `http://localhost:3000`.
- [ ] Test PayPal Sandbox connectivity via the top Diagnostics button (`Sandbox Diagnostics Modal`).
- [ ] Keep browser window maximized at 1920x1080 with 100% zoom.
- [ ] Practice the 3 key clicks:
  1. Inventory: "Simulate Stock Consumption" -> "Auto-Replenish".
  2. Order Canvas: Toggle "3-Day Green Consolidated Freight" discount.
  3. Master Ledger: Click "[Verify Tracking & Release]" and "[Dispute & Refund]".

