# 💳 PayLoop Pro — Modern Fintech Wallet & Payment Platform

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.22-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Docker Ready](https://img.shields.io/badge/Docker-Containerized-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)
[![Vercel Ready](https://img.shields.io/badge/Vercel-Deployable-000000?style=flat-square&logo=vercel)](https://vercel.com/)

**PayLoop Pro** is a full-stack digital wallet, payment gateway, and financial ledger platform built with Next.js 14 (App Router), TypeScript, Prisma ORM, and Tailwind CSS. It combines modern consumer banking features (similar to Revolut, Wise, and Cash App) with an enterprise admin control panel and an immutable double-entry transaction engine.

---

## 📑 Table of Contents

- [What is the Backend?](#-what-is-the-backend)
- [Key Features & Modules](#-key-features--modules)
- [Demo Persona Accounts](#-demo-persona-accounts)
- [Tech Stack](#-tech-stack)
- [Quick Start (Local Setup)](#-quick-start-local-setup)
- [Deploying to Vercel](#-deploying-to-vercel)
- [Deploying with Docker](#-deploying-with-docker)
- [API Reference Summary](#-api-reference-summary)
- [Automated Testing](#-automated-testing)
- [Project Directory Structure](#-project-directory-structure)
- [License](#-license)

---

## 🧠 What is the Backend?

PayLoop Pro uses a **unified full-stack architecture** powered by **Next.js 14 App Router API Routes (`app/api/**/route.ts`)** running on Node.js. 

You do **not** need a separate Express, Django, or FastAPI server. The backend handles:

1. **RESTful API Route Handlers**: Endpoints for authentication, money transfers, deposits, withdrawals, virtual cards, shared pots, KYC, and admin operations.
2. **Double-Entry Financial Ledger (`lib/ledger.ts`)**: Atomic database transactions guaranteed via `prisma.$transaction` ensuring zero race conditions and automatic credit/debit pairing.
3. **Database Layer (Prisma ORM)**: Type-safe database queries. Configured with **SQLite** for zero-configuration local development and seamlessly switchable to **PostgreSQL** (Neon, Supabase, AWS RDS, Docker) for production.
4. **Authentication & Security (`lib/auth.ts`)**: JWT session management, bcrypt password hashing, 6-digit transaction PIN hashing, and RFC 6238 TOTP two-factor authentication (`speakeasy`).
5. **Heuristic Fraud Detection Engine (`lib/fraud.ts`)**: Real-time transaction velocity checks, anomaly detection, device fingerprinting, and automated account freeze mechanisms.
6. **Payment Gateway Integration**: Stripe Checkout integration and webhook listeners for real-world card top-ups.

---

## 🚀 Key Features & Modules

### 1. Multi-Currency Digital Wallet
- Auto-generated wallet addresses (`PL-XXXX-XXXX`).
- Multi-currency support (**USD**, **EUR**, **GBP**) with real-time exchange rates.
- Multi-state balance tracking: **Available Balance**, **Locked Balance** (for active escrows/pots), and **Total Balance**.
- Configurable daily spending and transfer limits based on user KYC verification tiers.

### 2. Instant P2P Money Transfers & QR Payments
- Instant recipient search by `@username`, email address, or wallet number with live debounce.
- Security confirmation via **6-digit Transaction PIN**.
- Step-up **2FA TOTP verification** for high-value transactions ($500+).
- Dynamic QR code generation for custom payment requests and a live QR code scanner.

### 3. 3D Interactive Virtual Cards
- Instant issuance of Visa Signature and Mastercard World Elite virtual cards.
- 4 customizable aesthetic card skins (`Neon Cyan`, `Platinum Carbon`, `Gold Luxury`, `Emerald Matrix`).
- Interactive 3D flip animation revealing card numbers and CVV securely.
- One-click **Freeze / Unfreeze** switch and dynamic spending limit controls.
- **Live Merchant Terminal Simulator**: Authorize test transactions against simulated merchants (Apple, Netflix, Spotify, Amazon, Uber).

### 4. Shared Pots & Escrow Protection
- **Group Savings Pots**: Shared fundraising pools with milestone progress indicators and contributor feeds.
- **Betting / Prize Simulation Pots**: Tournament prize pools with automated payout settlement.
- **Escrow Contracts**: Buyer/seller milestone protection holding funds in a locked state until confirmed release or dispute arbitration.

### 5. Multi-Tier KYC Compliance
- **Tier 1 (Basic)**: Standard identity details ($1,000 daily limit).
- **Tier 2 (Verified)**: Government ID upload + live selfie facial verification ($10,000 daily limit).
- **Tier 3 (Enterprise)**: Source-of-funds verification and manual administrative compliance approval (Unlimited).

### 6. Super Admin Command Center (`/admin`)
- **Global Overview**: Real-time volume counters, collected transaction fees, active users, and system health.
- **User Management**: Inspect user wallets, toggle account freezes, adjust KYC clearance, and change permissions.
- **KYC Review Queue**: Side-by-side document inspection with 1-click approval/rejection.
- **Fraud Monitoring Console**: Live audit log of suspicious heuristics, high-risk flags, and mitigation buttons.
- **Transaction Dispute Management**: Global ledger surveillance with built-in administrative refund actions.

### 7. Financial Reporting & Statements
- Automated statement generator with one-click **PDF Statement** export (styled with bank headers, timestamps, and signature blocks) and **CSV Spreadsheet** download.

---

## 👥 Demo Persona Accounts

For quick manual testing, pre-seeded demo accounts are ready out of the box. You can use the **Demo Switcher dropdown** in the app or log in with these credentials:

| Persona | Email | Password | Transaction PIN | Role / Tier | Special State |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@payloop.com` | `Admin@12345` | `123456` | `ADMIN` • Tier 3 | Full admin portal access |
| **Pro User** | `pro@payloop.com` | `User@12345` | `123456` | `USER` • `PRO` | 2FA Enabled (TOTP: `123456`) |
| **Standard User** | `user@payloop.com` | `User@12345` | `123456` | `USER` • `FREE` | Tier 1 Verified |

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Components, Route Handlers)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/)
- **Database & ORM**: [Prisma ORM 5.22](https://www.prisma.io/) (SQLite locally, PostgreSQL in production)
- **Authentication**: JWT (`jsonwebtoken`) + `bcryptjs` + TOTP (`speakeasy`)
- **UI & Animations**: Lucide Icons, Framer Motion, Canvas Confetti, Recharts
- **Documents & Export**: jsPDF + jsPDF-AutoTable
- **Deployment**: Vercel Serverless & Docker Multi-Stage Container

---

## 💻 Quick Start (Local Setup)

### Prerequisites
- Node.js 18.x or 20.x
- npm, pnpm, or yarn

### 1. Clone the repository
```bash
git clone https://github.com/ahmedraza004/Payloop-Pro.git
cd "Payloop Pro"
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Copy the template file to `.env`:
```bash
cp .env.example .env
```

### 4. Initialize Database & Seed Demo Data
```bash
# Push schema to SQLite database
npm run db:push

# Seed mock users, wallets, cards, transactions, and pots
npm run seed
```

### 5. Start the development server
```bash
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## ☁️ Deploying to Vercel

Vercel is the recommended cloud platform for Next.js. Because Vercel functions are serverless and have an ephemeral filesystem, you should connect a hosted PostgreSQL database (such as **Neon**, **Supabase**, or **Railway**).

### Step-by-Step Vercel Deployment

1. **Create a Free PostgreSQL Database**:
   - Go to [Neon.tech](https://neon.tech) or [Supabase.com](https://supabase.com) and create a database.
   - Copy your connection string (e.g. `postgresql://user:pass@ep-xyz.neon.tech/payloop?sslmode=require`).

2. **Switch Prisma to PostgreSQL**:
   In `prisma/schema.prisma`, update the datasource provider:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Push the Schema & Seed to PostgreSQL**:
   ```bash
   DATABASE_URL="your-postgres-connection-string" npx prisma db push
   DATABASE_URL="your-postgres-connection-string" npm run seed
   ```

4. **Import to Vercel**:
   - Push your code to GitHub.
   - In the [Vercel Dashboard](https://vercel.com/new), select your repository.
   - Under **Environment Variables**, add:
     - `DATABASE_URL`: `postgresql://...`
     - `JWT_SECRET`: `your-random-32-character-secret`
     - `NEXTAUTH_SECRET`: `your-random-32-character-secret`
     - `NEXTAUTH_URL`: `https://your-app.vercel.app`
     - `NEXT_PUBLIC_APP_URL`: `https://your-app.vercel.app`
     - `STRIPE_SECRET_KEY`: (Optional) `sk_test_...`
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: (Optional) `pk_test_...`

5. **Deploy**:
   - Click **Deploy**. Vercel will automatically run `prisma generate && next build` via the pre-configured `postinstall` script.

---

## 🐳 Deploying with Docker

PayLoop Pro includes a multi-stage production `Dockerfile` and a `docker-compose.yml` that provisions both the Next.js application and a PostgreSQL database.

### Option A: Run Full Stack with Docker Compose (Recommended)

1. Make sure Docker and Docker Compose are installed.
2. In `prisma/schema.prisma`, ensure provider is set to `"postgresql"`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Run:
   ```bash
   docker compose up --build
   ```
4. Once running, open [http://localhost:3000](http://localhost:3000). The PostgreSQL container will persist its data in a dedicated Docker volume (`postgres_data`).

### Option B: Build and Run Standalone Docker Image

```bash
# Build the Docker image
npm run docker:build

# Run the container
docker run -p 3000:3000 --env-file .env payloop-pro
```

---

## 📡 API Reference Summary

All API routes are served from `/api/*` and return JSON responses.

### 🔐 Authentication (`/api/auth`)
| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Create a new user account + default wallet | No |
| `POST` | `/api/auth/login` | Authenticate credentials & initiate 2FA check | No |
| `POST` | `/api/auth/verify-2fa` | Complete TOTP 2FA challenge and receive cookie | No |
| `GET` | `/api/auth/me` | Fetch active session, user profile, and wallets | Yes (Cookie) |
| `POST` | `/api/auth/logout` | Clear session cookie | Yes |
| `POST` | `/api/auth/security` | Update password, transaction PIN, or 2FA | Yes |

### 💰 Wallet & Ledger (`/api/wallet`)
| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/wallet/transfer` | Execute atomic P2P transfer with PIN validation | Yes |
| `POST` | `/api/wallet/deposit` | Create a Stripe checkout session or direct deposit | Yes |
| `POST` | `/api/wallet/withdraw` | Request withdrawal to registered bank account | Yes |
| `GET` | `/api/wallet/transactions`| Fetch paginated transaction history & filters | Yes |
| `GET` | `/api/wallet/search-user`| Autocomplete search for recipients by handle/email | Yes |

### 💳 Virtual Cards (`/api/cards`)
| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/cards` | List user's active virtual cards | Yes |
| `POST` | `/api/cards` | Issue a new Visa / Mastercard virtual card | Yes |
| `PATCH`| `/api/cards/[id]` | Freeze / unfreeze card or update spending limit | Yes |
| `POST` | `/api/cards/[id]/swipe`| Simulate merchant POS authorization swipe | Yes |

### 🏺 Shared Pots & Escrow (`/api/pots`)
| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/pots` | List group savings, betting, and escrow pots | Yes |
| `POST` | `/api/pots` | Create a new shared pot or escrow agreement | Yes |
| `POST` | `/api/pots/[id]/contribute`| Deposit funds into a pot pool | Yes |
| `POST` | `/api/pots/[id]/settle` | Disburse pool funds to designated winners | Yes |

### 👑 Super Admin (`/api/admin`)
| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/stats` | Global system volume, revenues, and health | Admin Only |
| `GET` | `/api/admin/users` | List and search all registered users | Admin Only |
| `PATCH`| `/api/admin/users` | Freeze user wallet, modify KYC level, change role | Admin Only |
| `GET` | `/api/admin/kyc` | Pending KYC verification queue | Admin Only |
| `PATCH`| `/api/admin/kyc` | Approve or reject identity verification documents | Admin Only |
| `GET` | `/api/admin/fraud` | Audit log of triggered heuristic fraud alerts | Admin Only |
| `POST` | `/api/admin/transactions`| Execute administrative dispute refund | Admin Only |

For the complete payload schema and response samples, consult [DOCUMENTATION.md](file:///f:/After%20%20KSA/Restart/Payloop%20%20Pro/DOCUMENTATION.md).

---

## 🧪 Automated Testing

PayLoop Pro includes an automated end-to-end API test script that validates authentication, 2FA challenge flows, P2P transfers, deposit credits, card swipe authorizations, shared pots, and admin metric queries.

Run the test suite:
```bash
npm run test:e2e
```

---

## 📁 Project Directory Structure

```
Payloop Pro/
├── app/                      # Next.js 14 App Router
│   ├── (public)/             # Marketing & legal pages (/, /about, /pricing, /terms)
│   ├── admin/                # Super Admin Command Center (/admin/users, /admin/kyc, etc.)
│   ├── api/                  # Unified Backend REST API Routes
│   │   ├── admin/            # Admin operations (stats, users, kyc, fraud)
│   │   ├── auth/             # Login, register, me, verify-2fa, security
│   │   ├── banks/            # Bank accounts management
│   │   ├── cards/            # Virtual cards & merchant simulator
│   │   ├── kyc/              # KYC document submission
│   │   ├── pots/             # Shared savings, betting, and escrow
│   │   ├── recurring/        # Automated recurring payments
│   │   ├── requests/         # P2P payment requests
│   │   ├── wallet/           # Transfers, deposits, withdrawals, ledger
│   │   └── webhooks/         # Stripe webhook handlers
│   ├── auth/                 # Login & registration UI
│   └── dashboard/            # Consumer wallet dashboard & feature views
├── components/               # Reusable UI components & layouts
├── lib/                      # Core backend utilities & financial logic
│   ├── auth.ts               # JWT, password/PIN hashing, 2FA, session guards
│   ├── fraud.ts              # Heuristic risk engine & rule evaluations
│   ├── ledger.ts             # Atomic double-entry financial transaction engine
│   ├── pdf.ts                # Client/server PDF statement generator
│   ├── prisma.ts             # Global Prisma Client instance
│   └── utils.ts              # Formatters, reference generators, currency helpers
├── prisma/
│   ├── dev.db                # Local SQLite database
│   ├── schema.prisma         # Prisma schema with 13 relational models
│   └── seed.ts               # Demo data seeder with mock personas
├── test/
│   └── e2e-api-test.ts       # Automated API test suite
├── Dockerfile                # Production multi-stage Docker build
├── docker-compose.yml        # Multi-container App + PostgreSQL config
├── next.config.mjs           # Next.js config with standalone output
├── package.json              # Project dependencies and npm scripts
└── vercel.json               # Vercel deployment and CORS configuration
```

---

## 📄 License

This project is licensed under the MIT License. Built for modern fintech engineering, portfolio showcase, and high-performance financial web architecture.
