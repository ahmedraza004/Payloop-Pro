# 📚 PayLoop Pro — Complete Engineering & Architecture Documentation

This document serves as the in-depth technical manual for **PayLoop Pro**. It covers system architecture, ledger mechanics, backend route handlers, fraud heuristics, database relationships, API specifications, and cloud deployment procedures (Vercel & Docker).

---

## 📑 Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [The Backend Architecture Explained](#2-the-backend-architecture-explained)
3. [Financial Ledger & Balance Engine](#3-financial-ledger--balance-engine)
4. [Security, Auth & Fraud Heuristics](#4-security-auth--fraud-heuristics)
5. [Database Models & Entity Relationships](#5-database-models--entity-relationships)
6. [Complete REST API Specification](#6-complete-rest-api-specification)
7. [Virtual Cards & POS Merchant Simulator](#7-virtual-cards--pos-merchant-simulator)
8. [Shared Pots & Escrow Mechanics](#8-shared-pots--escrow-mechanics)
9. [Deployment Guide: Vercel (Serverless)](#9-deployment-guide-vercel-serverless)
10. [Deployment Guide: Docker & Docker Compose](#10-deployment-guide-docker--docker-compose)
11. [Troubleshooting & FAQ](#11-troubleshooting--faq)

---

## 1. System Architecture Overview

PayLoop Pro is architected as a **modular monolithic full-stack application** built with **Next.js 14 App Router**. 

### Architectural Highlights:
- **Zero Separate Backend Server**: Next.js Server Components and Route Handlers serve both the reactive client interface and the secure REST API layer, eliminating CORS friction, separate server hosting costs, and network latency.
- **Atomic Double-Entry Bookkeeping**: Every financial transaction is processed inside an ACID-compliant database transaction (`prisma.$transaction`).
- **Database Portability**: Built with Prisma ORM 5.22, allowing instant switching between local SQLite (for rapid development) and managed PostgreSQL (Neon, Supabase, AWS RDS, Docker) for production.
- **Edge-Ready Serverless Execution**: Serverless route handlers scale automatically on platforms like Vercel or run containerized inside Docker containers.

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Interface                       │
│  (Next.js 14 App Router, Tailwind CSS, Framer Motion)       │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON / Cookies
┌──────────────────────────────▼──────────────────────────────┐
│                    PayLoop API Layer                        │
│                 (app/api/**/route.ts)                       │
│                                                             │
│   ┌───────────────┐ ┌───────────────┐ ┌─────────────────┐   │
│   │  Auth & 2FA   │ │ Fraud Engine  │ │  Super Admin    │   │
│   │ (lib/auth.ts) │ │ (lib/fraud.ts)│ │ (app/api/admin) │   │
│   └───────┬───────┘ └───────┬───────┘ └────────┬────────┘   │
│           │                 │                  │            │
│   ┌───────▼─────────────────▼──────────────────▼────────┐  │
│   │              Double-Entry Ledger Engine              │  │
│   │                   (lib/ledger.ts)                    │  │
│   └─────────────────────────┬────────────────────────────┘  │
└─────────────────────────────┼───────────────────────────────┘
                              │ Prisma ORM 5.22
┌─────────────────────────────▼───────────────────────────────┐
│                      Database Layer                         │
│           SQLite (Local Dev) / PostgreSQL (Prod)            │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. The Backend Architecture Explained

### What is the Backend?
A common question when working with full-stack Next.js applications is: *Where is the backend?*

In PayLoop Pro, the backend is not a detached Node.js/Express server in a different repository. Instead, it is organized inside the **`app/api/`** directory and the **`lib/`** core domain services:

1. **`app/api/` (API Route Handlers)**: Standard RESTful endpoints accepting `GET`, `POST`, `PATCH`, `DELETE` HTTP requests. These execute on the server inside a Node.js runtime.
2. **`lib/ledger.ts` (Financial Domain Engine)**: Orchestrates wallet balance transfers, deposits, withdrawals, fee calculations, and transaction records.
3. **`lib/auth.ts` (Authentication & Session Guard)**: Handles JWT signing and validation, bcrypt hashing for passwords and 6-digit transaction PINs, and RFC 6238 TOTP two-factor authentication.
4. **`lib/fraud.ts` (Risk Evaluation System)**: Evaluates transaction velocity, historical balance spikes, and foreign device headers before funds move.
5. **`lib/prisma.ts` (Database Client)**: Global singleton Prisma Client managing database connection pooling.

---

## 3. Financial Ledger & Balance Engine

The core ledger (`lib/ledger.ts`) enforces strict financial consistency:

### Balance Types
Each user wallet (`Wallet` model) maintains three distinct balance dimensions:
1. **`balance` (Total Ledger Balance)**: Total amount of money assigned to the wallet.
2. **`availableBalance`**: Funds immediately available for outgoing transfers, card swipes, or withdrawals (`balance - lockedBalance`).
3. **`lockedBalance`**: Funds temporarily reserved for active escrow agreements or pending shared pots until settlement.

### Atomic Double-Entry Execution (`processTransfer`)
When User A sends $100 to User B:
1. **Verification**: Sender wallet is checked for `availableBalance >= 100`, account status `ACTIVE`, and daily limit availability (`dailySpentToday + 100 <= dailyTransferLimit`).
2. **Fraud Check**: `evaluateTransactionRisk()` runs heuristics in real time.
3. **Atomic Execution**: Inside `prisma.$transaction`:
   - Sender wallet: `balance` and `availableBalance` decremented by $100. `dailySpentToday` incremented.
   - Receiver wallet: `balance` and `availableBalance` incremented by $100.
   - Ledger Entry 1: Transaction created with type `TRANSFER_SENT`, reference `TRF-XXXX-OUT`, status `COMPLETED`.
   - Ledger Entry 2: Transaction created with type `TRANSFER_RECEIVED`, reference `TRF-XXXX-IN`, status `COMPLETED`.
   - Transfer Record: Audit record created connecting `senderId` and `receiverId`.
   - In-App Notifications: Dispatched to both sender and receiver.

If any single step fails, the entire transaction rolls back automatically, preventing orphaned credits or debits.

---

## 4. Security, Auth & Fraud Heuristics

### Authentication Flow
- **Passwords**: Salted and hashed using `bcryptjs` (10 rounds).
- **Transaction PINs**: 6-digit PINs required for money transfers and card unfreezing, hashed separately from account passwords.
- **Session Tokens**: Signed JWTs with user metadata stored in an `HttpOnly`, `SameSite=Lax` cookie named `payloop_session`.
- **Step-Up 2FA**: If `twoFactorEnabled` is active on an account or a transfer exceeds $500, the server triggers a TOTP challenge.

### Heuristic Fraud Rules (`lib/fraud.ts`)
Before transfers or withdrawals are committed, the fraud engine evaluates:
- **Velocity Threshold**: Flags users making > 3 transactions within a 10-minute sliding window.
- **Drain Heuristic**: Flags transactions attempting to transfer > 80% of total wallet balance in a single execution.
- **Tier Ceilings**: Enforces KYC daily limits ($1,000 for Tier 1, $10,000 for Tier 2, Unlimited for Tier 3).
- **Device Anomaly**: Detects IP/User-Agent mismatches and logs high-risk flags in `SecurityLog` and `FraudAlert`.

---

## 5. Database Models & Entity Relationships

PayLoop Pro utilizes 13 interconnected Prisma models:

```mermaid
erDiagram
    User ||--o{ Wallet : owns
    User ||--o{ Transaction : executes
    User ||--o{ Transfer : sends_receives
    User ||--o| KYC : submits
    User ||--o{ BankAccount : links
    User ||--o{ VirtualCard : issues
    User ||--o{ SharedPot : creates
    User ||--o{ Notification : receives
    User ||--o{ SecurityLog : generates
    User ||--o{ FraudAlert : triggers
    Wallet ||--o{ Transaction : records
    Wallet ||--o{ Deposit : receives
    Wallet ||--o{ Withdrawal : sends
    SharedPot ||--o{ PotContribution : receives
    VirtualCard ||--o{ CardPurchase : logs
```

### Model Directory:
- **`User`**: Account identities, credentials, roles (`USER`, `ADMIN`), KYC tier level (`LEVEL_0` to `LEVEL_3`), status (`ACTIVE`, `FROZEN`, `SUSPENDED`).
- **`Wallet`**: Multi-currency account balance, wallet number (`PL-XXXX-XXXX`), daily spend tracker.
- **`KYC`**: Identity verification documents, passport photos, live selfie URLs, approval status.
- **`Transaction`**: Immutable double-entry ledger records with reference numbers, status, fees, and risk scores.
- **`Transfer`**: Internal P2P transfer linkages between sender and receiver.
- **`Deposit` & `Withdrawal`**: External fiat on-ramps (Stripe) and off-ramps (Bank payouts).
- **`BankAccount`**: Verified recipient bank accounts for wire/ACH withdrawals.
- **`VirtualCard`**: Digital Visa/Mastercard cards with limits, skins, and flip CVV data.
- **`CardPurchase`**: Point-of-sale authorizations logged against virtual cards.
- **`SharedPot` & `PotContribution`**: Group savings, tournament prize pools, and escrow funds.
- **`SecurityLog` & `FraudAlert`**: Audit logs for compliance, login anomalies, and admin resolutions.

---

## 6. Complete REST API Specification

### 1. Authentication Endpoints

#### `POST /api/auth/login`
Authenticates user credentials.
- **Request Body**:
  ```json
  {
    "identifier": "user@payloop.com",
    "password": "User@12345"
  }
  ```
- **Response (Standard)**:
  ```json
  {
    "success": true,
    "user": { "id": "...", "name": "Standard User", "email": "user@payloop.com", "role": "USER" }
  }
  ```
- **Response (If 2FA Enabled)**:
  ```json
  {
    "requires2FA": true,
    "tempToken": "ey..."
  }
  ```

#### `POST /api/auth/verify-2fa`
Completes 2FA challenge and sets session cookie.
- **Request Body**:
  ```json
  {
    "tempToken": "ey...",
    "code": "123456"
  }
  ```

#### `GET /api/auth/me`
Retrieves authenticated user session, wallet balances, and compliance status.
- **Headers**: `Cookie: payloop_session=...`

---

### 2. Wallet & Financial Endpoints

#### `POST /api/wallet/transfer`
Executes an atomic P2P fund transfer.
- **Request Body**:
  ```json
  {
    "receiver": "sarahc",
    "amount": 75.50,
    "currency": "USD",
    "note": "Dinner split",
    "pin": "123456"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "transfer": { "id": "...", "amount": 75.50, "status": "COMPLETED" },
    "newBalance": 424.50
  }
  ```

#### `POST /api/wallet/deposit`
Creates a wallet deposit or initiates a Stripe checkout session.
- **Request Body**:
  ```json
  {
    "amount": 250.00,
    "currency": "USD",
    "method": "STRIPE_CARD"
  }
  ```

#### `POST /api/wallet/withdraw`
Requests a payout to a linked bank account.
- **Request Body**:
  ```json
  {
    "amount": 100.00,
    "bankAccountId": "bank_id_here"
  }
  ```

---

### 3. Virtual Cards & POS Endpoints

#### `POST /api/cards`
Issues a new virtual debit card.
- **Request Body**:
  ```json
  {
    "cardType": "VISA",
    "cardSkin": "NEON_CYAN",
    "spendingLimit": 2500.00
  }
  ```

#### `POST /api/cards/[id]/swipe`
Simulates a merchant terminal transaction.
- **Request Body**:
  ```json
  {
    "merchantName": "Netflix",
    "merchantCategory": "Entertainment",
    "amount": 15.99
  }
  ```
- **Response**:
  ```json
  {
    "approved": true,
    "authCode": "AUTH-892147",
    "message": "Transaction authorized successfully"
  }
  ```

---

### 4. Admin Management Endpoints (`ADMIN` Role Required)

#### `GET /api/admin/stats`
Fetches platform analytics (total volume, fee revenue, user count, active fraud alerts).

#### `GET /api/admin/users` & `PATCH /api/admin/users`
Lists, searches, and modifies user roles, statuses (`ACTIVE` / `FROZEN`), and KYC tiers.

#### `GET /api/admin/kyc` & `PATCH /api/admin/kyc`
Reviews pending government identity submissions and allows 1-click approval or rejection with notes.

#### `POST /api/admin/transactions`
Executes administrative transaction dispute investigations and refunds.

---

## 7. Virtual Cards & POS Merchant Simulator

PayLoop Pro includes a built-in Point-of-Sale (POS) simulator:
1. Cards generate cryptographically random 16-digit PANs with valid Luhn checksums, future expiry dates, and CVVs.
2. The merchant swipe simulator (`/api/cards/[id]/swipe`) verifies:
   - Card is `ACTIVE` (not frozen).
   - Spending limit is not exceeded (`currentSpent + amount <= spendingLimit`).
   - Wallet has sufficient available funds.
3. Upon approval, wallet funds are automatically deducted and a `CardPurchase` ledger entry is appended to the audit log.

---

## 8. Shared Pots & Escrow Mechanics

### 1. Savings Pots
Users can create communal fundraising targets (e.g. "Trip to Tokyo"). Any user can contribute. When the target is reached, the creator can settle the pot and disburse funds to their wallet.

### 2. Escrow Agreement Pots
Designed for peer-to-peer commerce:
1. Buyer creates escrow pot for a specified amount.
2. Funds are deducted from the Buyer's available balance and moved to **`lockedBalance`**.
3. Seller delivers goods/services.
4. Buyer inspects and clicks **Release Escrow Funds** (`/api/pots/escrow/release`), unlocking and crediting the seller's wallet.
5. In case of dispute, Super Admin can arbitrate and refund or release funds.

---

## 9. Deployment Guide: Vercel (Serverless)

Vercel provides zero-configuration deployment for Next.js 14 applications.

### 1. Setup Hosted Database
Because Vercel functions are stateless and ephemeral, SQLite cannot be used in production on Vercel. Use a managed PostgreSQL service:
- [Neon Serverless Postgres](https://neon.tech) (Recommended - Instant setup, generous free tier)
- [Supabase](https://supabase.com)
- [Railway](https://railway.app)

### 2. Configure Prisma for PostgreSQL
In `prisma/schema.prisma`, update the datasource:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 3. Push Schema and Seed Demo Data
Run locally with your remote PostgreSQL connection string:
```bash
# Push database schema to Neon/Postgres
DATABASE_URL="postgresql://user:password@ep-xyz.neon.tech/payloop?sslmode=require" npx prisma db push

# Seed initial personas and demo wallets
DATABASE_URL="postgresql://user:password@ep-xyz.neon.tech/payloop?sslmode=require" npm run seed
```

### 4. Deploy to Vercel
1. Push your repository to GitHub / GitLab.
2. In Vercel, click **Add New Project** and import the repository.
3. In **Environment Variables**, configure:
   - `DATABASE_URL`: `postgresql://...`
   - `JWT_SECRET`: `your-random-32-char-secret`
   - `NEXTAUTH_SECRET`: `your-random-32-char-secret`
   - `NEXTAUTH_URL`: `https://your-domain.vercel.app`
   - `NEXT_PUBLIC_APP_URL`: `https://your-domain.vercel.app`
4. Click **Deploy**. Vercel will automatically run `prisma generate && next build`.

---

## 10. Deployment Guide: Docker & Docker Compose

PayLoop Pro includes a multi-stage `Dockerfile` and `docker-compose.yml` for self-hosted container environments (AWS EC2, DigitalOcean, VPS, Fly.io, Render).

### Multi-Container Setup (Next.js App + PostgreSQL)

```bash
# 1. Ensure provider in prisma/schema.prisma is set to "postgresql"
# 2. Build and launch all services in detached mode
docker compose up --build -d

# 3. View container logs
docker compose logs -f app
```

The application will be accessible at `http://localhost:3000`. PostgreSQL data will persist inside the `postgres_data` Docker volume across restarts.

### Running Single Container Standalone
```bash
# Build production image
docker build -t payloop-pro .

# Run with environment file
docker run -p 3000:3000 --env-file .env payloop-pro
```

---

## 11. Troubleshooting & FAQ

#### Q: How do I switch between SQLite (local) and PostgreSQL (production)?
In `prisma/schema.prisma`, change line 6:
- For SQLite: `provider = "sqlite"` with `DATABASE_URL="file:./dev.db"`
- For PostgreSQL: `provider = "postgresql"` with `DATABASE_URL="postgresql://..."`
Then run `npx prisma generate && npx prisma db push`.

#### Q: Where are session cookies stored?
Session cookies are named `payloop_session`, signed using `JWT_SECRET`, and configured with `httpOnly: true`, `secure: process.env.NODE_ENV === 'production'`, and `sameSite: 'lax'`.

#### Q: How does 2FA work for demo testing?
For the Pro User persona (`pro@payloop.com`), 2FA is active with mock secret configured. When prompted for the 6-digit TOTP code during login or transfer, use `123456`.

---

## 📄 Support & Contributing

PayLoop Pro is maintained for enterprise fintech engineering demonstrations and production prototyping. For issues or feature requests, consult the project repository issues.
