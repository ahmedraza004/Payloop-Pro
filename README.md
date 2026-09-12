# ⚡ PayLoop Pro (Version 2.0) — Next-Gen Fintech Wallet & Payment Platform

[![Next.js](https://img.shields.io/badge/Next.js-14%2B%20App%20Router-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=for-the-badge&logo=stripe)](https://stripe.com/)

**PayLoop Pro** is an enterprise-grade fintech wallet and payment platform engineered to simulate the complete product architecture of **Revolut, Wise, CashApp, and Stripe Dashboard** combined into a unified modern SaaS application.

---

## 🚀 Key Architectural Features

### 1. 💳 Multi-Currency Wallet Engine
- Auto-generated unique Wallet IDs (`PL-XXXX-XXXX`).
- Multi-currency balances (**USD**, **EUR**, **GBP**) with real-time conversion rates.
- Three balance states: **Total Balance**, **Available Balance**, and **Locked Balance** (for active escrows/pots).
- Daily transfer limits enforced per user compliance tier.

### 2. 🔐 Immutable Double-Entry Ledger
- Atomic transactions guaranteed with `prisma.$transaction`.
- Cryptographically verifiable reference IDs (`TXN-XXXX-XXXX`, `DEP-XXXX`, `WTH-XXXX`).
- Automatic credit and debit legs for all financial movements.
- **Export to PDF Account Statement** (with official bank header and signature line) and **CSV Spreadsheet**.

### 3. 💸 Sub-Second P2P Transfers & QR Payments
- Search recipients by `@username`, email, or wallet ID with live debounce autocomplete.
- Security authorization with **6-digit Transfer PIN**.
- **2FA TOTP challenge** for high-value transfers (over $500).
- Dynamic & Static **Payment QR Codes** generator + built-in live payload scanner.

### 4. 🛍️ 3D Interactive Virtual Cards
- Issue Visa Signature & Mastercard World Elite virtual cards.
- 4 custom cyberpunk aesthetics: `Neon Cyan`, `Platinum Carbon`, `Gold Luxury`, `Emerald Matrix`.
- Interactive 3D flip animation with hidden CVV and 16-digit card number security reveal.
- One-click **Freeze / Unfreeze** switch and spending limit adjuster.
- Built-in **Merchant Swipe Simulator** to test real authorizations against Apple, Netflix, Spotify, Amazon.

### 5. 🏺 Shared Pots & Escrow Pools
- **Savings Pots**: Group pools with progress bars, contributor avatars, and payout settlements.
- **Betting Simulation Pots**: Prediction tournament prize pools with automated winner distribution.
- **Escrow Agreement Pots**: Milestone buyer/seller funds lock with arbitration release triggers.

### 6. 🛡️ Multi-Tier KYC Compliance System
- **Tier 1 (Basic)**: Full Name, Address, Email → $1,000 / day limit.
- **Tier 2 (Verified)**: Government ID upload + Live Camera Selfie verification → $10,000 / day limit.
- **Tier 3 (Enterprise)**: Source of funds and manual compliance clearance → Unlimited volume.

### 7. 🚨 AI & Heuristic Fraud Detection Engine
- Real-time heuristic risk scoring (`LOW`, `MEDIUM`, `HIGH`).
- Rules:
  1. Transfer velocity spike (> 3 transactions within 10 minutes).
  2. Unusually large transfer volume relative to total balance.
  3. Multiple failed login and PIN attempts.
  4. Device telemetry jumps and foreign IP detection.
- Auto-generation of Admin Fraud Incidents with one-click **Account Freeze** mitigation.

### 8. 👑 Super Admin Command Center (`/admin`)
- **Platform Overview**: Total Volume, Fee Revenues, Active Users, Open Fraud Alerts, Pending KYC.
- **User Management**: Inspect wallets, freeze/unfreeze accounts, change KYC clearance levels, upgrade roles.
- **KYC Review Queue**: Inspect submitted passport documents and facial selfies with one-click Approve / Reject.
- **Dispute Management**: Global ledger surveillance with one-click **Administrative Refund** engine.
- **Fraud Risk Console**: Investigate triggered heuristics and resolve anomalies.

### 9. ⏰ Recurring Payments & Auto-Billing
- Schedule standing orders (Weekly, Monthly, Yearly).
- Automated execution engine with manual "Run Now" test triggers.

---

## ⚡ Demo Persona Credentials

| Persona | Email | Password | PIN | Role & Tier |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@payloop.com` | `Admin@12345` | `123456` | `ADMIN` • Tier 3 |
| **Pro User** | `pro@payloop.com` | `User@12345` | `123456` | `USER` • `PRO` (2FA enabled: `123456`) |
| **Standard User** | `user@payloop.com` | `User@12345` | `123456` | `USER` • `FREE` • Tier 1 |

> 💡 **Tip:** Use the **Demo Switcher** dropdown in the dashboard header or the 1-click buttons on the Login page for instant persona switching without retyping credentials!

---

## 🛠️ Technology Stack

```
Frontend
├── Next.js 14 (App Router)
├── TypeScript 5.0
├── Tailwind CSS 3.4
├── Framer Motion & CSS 3D Transforms
├── Lucide Icons & Canvas Confetti
└── Recharts & jsPDF / jsPDF-AutoTable

Backend
├── Next.js API Route Handlers
├── Prisma ORM 5.22
├── SQLite / PostgreSQL (Neon ready)
├── bcryptjs & jsonwebtoken
├── speakeasy (2FA TOTP) & qrcode
└── Stripe Checkout & Webhooks
```

---

## 📦 Getting Started Locally

```bash
# 1. Clone the repository
git clone https://github.com/ahmedraza004/Payloop-Pro.git
cd "Payloop Pro"

# 2. Install dependencies
npm install

# 3. Synchronize database schema and seed mock data
npm run db:push
npm run seed

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to explore PayLoop Pro!

---

## 🧪 Automated Testing

To run the automated end-to-end API test suite:

```bash
npx tsx test/e2e-api-test.ts
```

---

## 📄 License
MIT License. Built for fintech engineering portfolio excellence.
