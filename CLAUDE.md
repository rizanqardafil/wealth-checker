# CLAUDE — Wealth Checker Assistant

## Identity

You are the primary engineer for **Wealth Checker**, a full-featured personal financial accounting platform.

---

## Project Overview

**Wealth Checker** — Personal finance dashboard + mobile app for Gen Z
- Multi-account tracking (debit/kredit with transfers)
- 4 transaction types: Income, Expenses, Assets, Debts
- 12+ auto-generated financial reports
- Financial health scoring + freedom level tracker
- Budget planning & calculators
- **Real-time sync** across web + mobile

**Platforms:**
- 🌐 Web: Next.js 16 (App Router), React 19, TypeScript 5
- 📱 Mobile: React Native (Expo), TypeScript
- 🔄 Backend: Next.js 16 API Routes + WebSocket (real-time)
- 🗄️ Database: PostgreSQL via Supabase (free tier)
- 🔐 Auth: NextAuth.js (email/password)
- 🎨 Web UI: TailwindCSS 4, shadcn/ui (Radix Nova)
- 📦 Mobile UI: React Native Paper + custom styles

**Timeline:** 2-3 months @ 3 hrs/day
**Development Pace:** 15 hrs/week = ~60 hrs/phase

---

## Operating Modes

### Before Every Task
1. Understand the feature/bug fully
2. Propose approach before coding
3. Get approval before implementing

### Mode 1 — Feature Development
- Implement: Backend API → Web UI → Mobile UI (in that order)
- Or parallel if independent (e.g., different features)
- Build incrementally — test as you go
- Validate: schema, API contracts, UI states, real-time sync
- Raise ambiguity before coding

### Mode 2 — Bug Fixing
- Fix only the reported bug
- No unrelated refactoring
- Add safeguards to prevent regression

### Mode 3 — Real-Time Sync
- Backend broadcasts via Supabase Realtime (PostgreSQL)
- Web client subscribes via `useRealtimeSubscription` hook
- Mobile client subscribes via same hook
- Optimistic updates on client, reconcile on server response

---

## Tech Stack Details

### Next.js 16 Breaking Changes
**CRITICAL**: Before writing any Next.js code, be aware:
- App Router (not Pages Router)
- `use client` for interactive components
- Server Components by default
- API Routes in `/app/api/`
- Path alias `@/*` → `src/`

### Supabase + Prisma
- `.env.local` contains `DATABASE_URL` (Supabase PostgreSQL connection string)
- `prisma/schema.prisma` — single source of truth for DB schema
- `prisma generate` — auto-generate Prisma client
- `.env.local` is gitignored — never commit secrets

### NextAuth.js (Email/Password)
- Credentials provider (email + password)
- Session stored in database
- `next-auth` folder structure in `/src/app/api/auth/`
- No external OAuth providers (Phase 1)

---

## Database Schema (Prisma) — 10 Models

```prisma
model User
  id                String      @id @default(cuid())
  email             String      @unique
  password          String      # Hashed with bcrypt
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  accounts          Account[]
  transactions      Transaction[]
  assets            Asset[]
  debts             Debt[]
  budgets           Budget[]
  snapshots         FinancialSnapshot[]

model Account
  id                String      @id @default(cuid())
  userId            String      @db.Text
  user              User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  name              String      # e.g., "Rekening Utama", "Tabungan", "Kartu Kredit"
  type              String      # DEBIT | KREDIT | SAVINGS | INVESTMENT
  balance           Decimal     @default(0) # Current balance
  currency          String      @default("IDR")
  
  transactions      Transaction[]
  transfers         Transfer[]
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  @@index([userId])
  @@index([userId, createdAt])

model Transaction
  id                String      @id @default(cuid())
  userId            String      @db.Text
  user              User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  accountId         String
  account           Account     @relation(fields: [accountId], references: [id], onDelete: Cascade)
  
  type              String      # INCOME | EXPENSE | ASSET | DEBT
  category          String      # Dynamic: depends on type
  amount            Decimal
  description       String?
  date              DateTime
  
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  @@index([userId, date])
  @@index([accountId])
  @@index([type])

model Transfer
  id                String      @id @default(cuid())
  userId            String      @db.Text
  
  fromAccountId     String
  fromAccount       Account     @relation(fields: [fromAccountId], references: [id], onDelete: Cascade)
  
  toAccountId       String
  # Note: no relation to "to" account (or separate model for simplicity)
  
  amount            Decimal
  description       String?
  date              DateTime
  
  createdAt         DateTime    @default(now())
  
  @@index([userId])
  @@index([fromAccountId])

model Asset
  id                String      @id @default(cuid())
  userId            String      @db.Text
  user              User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  name              String      # e.g., "Emas", "Saham ABC", "Properti"
  type              String      # GOLD | STOCKS | REAL_ESTATE | VEHICLE | OTHER
  quantity          Decimal
  unitPrice         Decimal     # Price per unit at purchase
  currentValue      Decimal     # Current market value
  purchaseDate      DateTime
  description       String?
  
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  @@index([userId])

model Debt
  id                String      @id @default(cuid())
  userId            String      @db.Text
  user              User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  name              String      # e.g., "Cicilan Motor", "Utang Teman"
  type              String      # LOAN | CREDIT_CARD | PERSONAL | MORTGAGE
  amount            Decimal     # Total debt
  remaining         Decimal     # Remaining balance
  monthlyPayment    Decimal
  interestRate      Decimal?    # Annual percentage
  dueDate           DateTime?
  status            String      @default("ACTIVE") # ACTIVE | SETTLED
  description       String?
  
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  @@index([userId])
  @@index([status])

model Budget
  id                String      @id @default(cuid())
  userId            String      @db.Text
  user              User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  category          String      # Expense category
  plannedAmount     Decimal     # Budget limit
  month             Int         # 1-12
  year              Int
  
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  @@index([userId, month, year])

model FinancialSnapshot
  id                String      @id @default(cuid())
  userId            String      @db.Text
  user              User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  # Summary calculations (generated daily/monthly)
  month             Int
  year              Int
  
  # Assets & Debts
  totalAssets       Decimal     @default(0)
  totalDebts        Decimal     @default(0)
  netWorth          Decimal     @default(0)  # assets - debts
  
  # Income & Expense
  totalIncome       Decimal     @default(0)
  totalExpense      Decimal     @default(0)
  netIncome         Decimal     @default(0)  # income - expense
  
  # Health metrics
  healthScore       Int         @default(0)  # 0-100
  freedomLevel      Int         @default(0)  # 0-6
  
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  @@index([userId, month, year])

model Report
  id                String      @id @default(cuid())
  userId            String      @db.Text
  
  type              String      # MUTASI | P&L | CASH_FLOW | BALANCE | NET_WORTH
  month             Int
  year              Int
  
  data              Json        # JSON blob with report data
  generatedAt       DateTime    @default(now())
  
  @@index([userId, type, month, year])
```

**Naming Standards:**
- Plural table names: `users`, `accounts`, `transactions`, `assets`, `debts`, `budgets`, `financial_snapshots`, `reports`
- `camelCase` for fields
- Foreign keys: `userId`, `accountId`, etc.
- Timestamps: `createdAt`, `updatedAt` on all entities
- Index frequently queried fields: `(userId, date)`, `(userId, month, year)`, `status`, `type`

---

## Frontend Standards — Web (React/Next.js)

### Components
- Multi-word names: `FinancialOverview`, `TransactionForm`, etc.
- File per component: `financial-overview.tsx`
- Use `use client` only for interactive components
- Server Components for data fetching

### State Management
- `useState` for local UI state
- `useRealtimeSubscription` hook for real-time sync
- SWR or React Query for data fetching + caching
- No Zustand/Redux for MVP (keep simple)

### Styling
- TailwindCSS + shadcn/ui components
- No inline styles
- Use design tokens from Radix Nova
- Mobile-first responsive design

### Gen Z UI Vibes
- Rounded corners, soft shadows
- Gradient accents (blues/purples)
- Fun microcopy & encouragement
- Icons from Lucide React
- Smooth transitions & animations

### Props & Validation
- Detailed prop definitions with types
- TypeScript `interface` for props
- No prop mutation

### Form Handling
- React Hook Form + Zod for validation
- Clear error messages
- Loading states during submission

---

## Frontend Standards — Mobile (React Native / Expo)

### Project Structure
- Expo Router for file-based routing (`app/` directory)
- Tab navigator for main app layout
- Modal navigation for overlays (add transaction, transfer, etc.)

### Components
- File per component (functional components)
- Use `@react-navigation` for navigation
- Use `React Native Paper` for UI components (or custom styled)
- Custom `useRealtimeSubscription` hook for sync

### State Management
- `useState` for local UI state
- `useRealtimeSubscription` hook for real-time sync
- `AsyncStorage` for offline persistence (optional Phase 2)
- Context API if needed (avoid Redux)

### Styling
- React Native StyleSheet (no inline styles)
- Use design tokens (colors, spacing) from constants
- Platform-specific styling (iOS vs Android) where needed
- Safe area insets for notches

### Gen Z UI Vibes (Mobile)
- Modern flat design (no skeuomorphism)
- Vibrant colors, smooth animations
- Bottom sheet modals for actions
- Snackbar/toast notifications
- Haptic feedback on button press (optional)

### Forms & Input
- React Hook Form + Zod (same as web)
- Native date/time pickers
- Keyboard handling (dismissal, etc.)
- Clear error messages

### Performance
- Lazy load screens
- Image optimization
- Avoid re-renders (memoization where critical)
- Use `useMemo` / `useCallback` appropriately

### Permissions
- Handle camera/photo permissions (future feature)
- Location permissions (optional)
- Request at appropriate time (not on app open)

---

## Backend Standards — Next.js API Routes

### API Routes (`/src/app/api/`)
- **RESTful design**
  - GET `/api/accounts` — list all accounts
  - POST `/api/accounts` — create account
  - GET `/api/accounts/:id` — get account detail
  - PUT `/api/accounts/:id` — update account
  - DELETE `/api/accounts/:id` — delete account
  
- **Plural naming:** `/api/transactions`, `/api/assets`, `/api/debts`, `/api/budgets`
- **Response format:**
  ```json
  {
    "success": true,
    "data": { ... },
    "error": null
  }
  ```
  Or on error:
  ```json
  {
    "success": false,
    "data": null,
    "error": "Meaningful error message"
  }
  ```

### Authentication
- NextAuth session in request
- Validate `session.user.id` before any DB queries
- Return 401 Unauthorized if session missing
- Never trust userId from request params — always use session

### Database Access
- Always use Prisma client from `lib/prisma`
- Prisma by default returns all fields — use `.select()` to limit
- Index queries: use `.findMany()` with filters for large datasets
- Parallel queries: use `Promise.all()` for independent calls
- Transactions: use Prisma `$transaction()` for multi-step operations

### Calculation Logic
- Centralize in `lib/calculations/` directory
- Separate concerns: `health.ts`, `assets.ts`, `debts.ts`, `reports.ts`
- Pure functions where possible
- Add unit tests for complex logic

### Real-Time Sync
- No special code needed — Supabase Realtime auto-broadcasts DB changes
- Optional: Emit custom events for calculated fields (health score, snapshots)

### Error Handling
- Proper HTTP status codes:
  - 200 OK, 201 Created
  - 400 Bad Request (validation error)
  - 401 Unauthorized (no session)
  - 403 Forbidden (user doesn't own resource)
  - 404 Not Found
  - 500 Internal Server Error
- Meaningful error messages (not stack traces)
- Log errors for debugging (console.error in dev)

---

## Project Structure (Monorepo)

```
wealth-checker/
├── CLAUDE.md                         # This file
├── package.json                      # Root workspace
├── tsconfig.json                     # Root TypeScript config
├── .gitignore
│
├── shared/                           # Shared code (types, utils, hooks)
│   ├── types.ts                      # Shared TypeScript types
│   ├── constants.ts                  # Enums, categories, levels
│   ├── calculations.ts               # Financial calculations (health, freedom level)
│   └── hooks/
│       ├── useRealtimeSubscription.ts  # Real-time sync hook (web + mobile)
│       └── useFetch.ts               # Unified fetch wrapper
│
├── backend/                          # Next.js 16 API + Backend
│   ├── .env.local                    # DATABASE_URL, NEXTAUTH_SECRET
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── prisma/
│   │   ├── schema.prisma             # Full DB schema (10 models)
│   │   └── migrations/
│   │
│   └── src/
│       ├── app/
│       │   └── api/
│       │       ├── auth/[...nextauth]/route.ts
│       │       ├── accounts/route.ts           # Account CRUD
│       │       ├── transactions/route.ts       # Transaction CRUD
│       │       ├── accounts/[id]/transfers/route.ts  # Transfer between accounts
│       │       ├── assets/route.ts             # Asset tracking
│       │       ├── debts/route.ts              # Debt tracking
│       │       ├── budgets/route.ts            # Budget management
│       │       ├── reports/
│       │       │   ├── summary/route.ts        # Net worth, P&L, cash flow
│       │       │   ├── health-check/route.ts   # Financial health score
│       │       │   └── [type]/route.ts         # All 12 auto-reports
│       │       └── ws/                         # WebSocket for real-time
│       │
│       └── lib/
│           ├── prisma.ts             # Prisma client singleton
│           ├── auth.ts               # NextAuth config
│           ├── hash.ts               # Password hashing
│           ├── realtime.ts           # Supabase Realtime setup
│           └── calculations/
│               ├── health.ts         # Health scoring logic
│               ├── assets.ts         # Asset calculations
│               ├── debts.ts          # Debt calculations
│               └── reports.ts        # Report generation
│
├── web/                              # Next.js 16 React (Web Platform)
│   ├── .env.local                    # API_URL, NEXTAUTH_URL
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── eslint.config.mjs
│   ├── prettier.config.js
│   │
│   └── src/
│       ├── app/
│       │   ├── (auth)/
│       │   │   ├── login/page.tsx
│       │   │   └── signup/page.tsx
│       │   │
│       │   ├── (dashboard)/
│       │   │   ├── layout.tsx         # Dashboard layout + sidebar
│       │   │   ├── page.tsx           # Overview dashboard
│       │   │   ├── accounts/
│       │   │   │   ├── page.tsx       # Account list + balance
│       │   │   │   ├── [id]/page.tsx  # Account detail
│       │   │   │   └── new/page.tsx   # Create account
│       │   │   ├── transactions/
│       │   │   │   ├── page.tsx       # Transaction list with filters
│       │   │   │   └── new/page.tsx   # Add transaction
│       │   │   ├── assets/
│       │   │   │   ├── page.tsx       # Assets portfolio
│       │   │   │   └── new/page.tsx   # Add asset
│       │   │   ├── debts/
│       │   │   │   ├── page.tsx       # Debts management
│       │   │   │   └── new/page.tsx   # Add debt
│       │   │   ├── budgets/
│       │   │   │   ├── page.tsx       # Budget vs actual
│       │   │   │   └── new/page.tsx   # Create budget
│       │   │   ├── reports/
│       │   │   │   ├── page.tsx       # Report dashboard
│       │   │   │   └── [type]/page.tsx  # Individual reports
│       │   │   ├── health/
│       │   │   │   └── page.tsx       # Financial health check
│       │   │   ├── freedom/
│       │   │   │   └── page.tsx       # Freedom level tracker
│       │   │   └── planning/
│       │   │       ├── emergency-fund/page.tsx
│       │   │       └── pension/page.tsx
│       │   │
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   └── globals.css
│       │
│       ├── components/
│       │   ├── (web-specific)/       # Web-only components
│       │   ├── (shared)/              # Shared with mobile
│       │   └── ...
│       │
│       └── lib/
│           ├── api.ts                # API client wrapper
│           └── hooks.ts              # Web-specific hooks
│
└── mobile/                           # React Native (Expo)
    ├── app.json                      # Expo config
    ├── package.json
    ├── tsconfig.json
    ├── .env                          # API_URL
    │
    └── src/
        ├── app/
        │   ├── (auth)/
        │   │   ├── login.tsx
        │   │   └── signup.tsx
        │   │
        │   ├── (tabs)/               # Bottom tab navigator
        │   │   ├── accounts/
        │   │   │   ├── index.tsx
        │   │   │   └── [id].tsx
        │   │   ├── transactions/
        │   │   │   ├── index.tsx
        │   │   │   └── add.tsx
        │   │   ├── reports/
        │   │   │   └── index.tsx
        │   │   └── profile/
        │   │       └── index.tsx
        │   │
        │   ├── modal/
        │   │   ├── add-transaction.tsx
        │   │   ├── transfer.tsx
        │   │   └── settings.tsx
        │   │
        │   ├── _layout.tsx            # Root layout (navigation)
        │   └── index.tsx              # Splash screen
        │
        ├── components/
        │   ├── (shared)/              # Shared with web
        │   ├── (mobile-specific)/     # Mobile-only
        │   ├── accounts/
        │   ├── transactions/
        │   ├── charts/
        │   └── common/
        │
        └── lib/
            ├── api.ts                # API client wrapper
            ├── storage.ts            # Local storage (AsyncStorage)
            └── hooks.ts              # Mobile-specific hooks
```

---

## Development Workflow

### Monorepo Setup
```bash
# Root workspace
npm install

# Start all services (from root)
npm run dev                    # Starts backend + web (in parallel via concurrently)

# Individual service startup
cd backend && npm run dev      # Backend only (:3000)
cd web && npm run dev          # Web only (:3001)
cd mobile && npm start         # Expo mobile (:19000)
```

### Database
```bash
cd backend

# Create/run migrations
npx prisma migrate dev --name "init"

# Generate Prisma client
npx prisma generate

# Browse DB GUI
npx prisma studio

# Reset DB (dev only!)
npx prisma migrate reset
```

### Code Quality
```bash
# Root level
npm run lint                   # Lint all services
npm run format                 # Format all services
```

### Git Workflow
```bash
# Branch naming
git checkout -b feat/multi-account-tracking    # Feature
git checkout -b fix/real-time-sync-lag         # Bug fix

# Commit format
git commit -m "feat(backend): add account transfer endpoint"
git commit -m "feat(web): build accounts dashboard"
git commit -m "feat(mobile): add transaction quick-add modal"
git commit -m "chore(shared): add calculations utility"
```

### Environment Files
- `backend/.env.local` — DATABASE_URL, NEXTAUTH_SECRET
- `web/.env.local` — NEXT_PUBLIC_API_URL (= http://localhost:3000 in dev)
- `mobile/.env` — EXPO_PUBLIC_API_URL (= http://your-machine-ip:3000 in dev)

---

## Shared Code (`/shared/`)

**Purpose:** Code reused between web and mobile platforms

### Types (`types.ts`)
```typescript
// Account types
type Account = { id: string; userId: string; name: string; balance: Decimal; ... }
type Transaction = { id: string; accountId: string; type: 'INCOME' | 'EXPENSE' | ...; ... }
type Asset = { ... }
type Debt = { ... }

// Enums
enum TransactionType { INCOME = 'INCOME', EXPENSE = 'EXPENSE', ... }
enum FredomLevel { BROKE = 0, PAYCHECK = 1, ... WEALTHY = 6 }
```

### Constants (`constants.ts`)
```typescript
export const TRANSACTION_CATEGORIES = {
  INCOME: ['Gaji', 'Bonus', 'Freelance', ...],
  EXPENSE: ['Makan', 'Transport', 'Hiburan', ...],
  ASSET: ['Emas', 'Saham', 'Properti', ...],
  DEBT: ['Cicilan', 'Kartu Kredit', ...],
}

export const FREEDOM_LEVELS = [
  { level: 0, label: 'Pailit', condition: 'netWorth < 0' },
  { level: 1, label: 'Gaji ke Gaji', condition: '...' },
  ...
]
```

### Calculations (`calculations.ts`)
```typescript
// Export pure functions used by both web & mobile
export function calculateHealthScore(income, expense, debt, assets): number { ... }
export function calculateFreedomLevel(netWorth, income, debt): number { ... }
export function calculateNetWorth(assets, debts): Decimal { ... }
```

### Hooks (`hooks/`)
- `useRealtimeSubscription.ts` — Real-time sync (web + mobile)
- `useFetch.ts` — Unified API wrapper
- Any other shared hooks

---

## Mandatory Response Format

For all implementation tasks:
1. **Understanding** — What are we building? (feature, pages, API endpoints)
2. **Approach** — How will we do it? (database changes, API contract, UI layout)
3. **Scope** — What exactly will be implemented vs. deferred?
4. **Timeline** — Realistic estimate in hours (3 hrs/day pacing)
5. **Ask for Approval** — Before coding

Example:
```
## Understanding
We're building the account transfer feature — users can move money between accounts.

## Approach
1. **Backend:** POST /api/accounts/:id/transfer (from account, to account, amount)
2. **Database:** Create Transfer model, update Account balance
3. **Web:** Create transfer modal with form
4. **Mobile:** Create transfer modal (same logic)
5. **Sync:** Real-time update when transfer succeeds

## Scope
In Scope: Transfer between debit accounts, validation, balance update
Out of Scope: Fee calculations, bank API integration (Phase 2)

## Timeline
~4-5 hours (backend 1h, web 1.5h, mobile 1.5h, testing 1h)

## Approval
Should I proceed?
```

---

## Real-Time Sync Architecture

**Goal:** Changes on one device (web/mobile) instantly appear on other devices

**Stack:**
1. **Supabase Realtime** — Built-in PostgreSQL event streaming
   - PostgreSQL native replication (no additional service)
   - Broadcast changes via WebSocket
   - Free tier includes Realtime

2. **Client-side:**
   - `useRealtimeSubscription` hook in `shared/hooks/`
   - Subscribes to Realtime events for user's data
   - Updates local state on remote changes
   - Optimistic updates on user action (instant UI, then sync)

3. **Backend:**
   - No special code needed — Supabase Realtime handles DB changes
   - Optional: Emit custom events via `supabase.realtime` for calculated fields

**Example Flow:**
```
User adds transaction on mobile
  ↓
POST /api/transactions (mobile)
  ↓
Backend saves to DB
  ↓
Supabase Realtime broadcasts change
  ↓
Web client receives event via WebSocket
  ↓
Update local state + re-render dashboard
```

---

## Feature Phases (2-3 months @ 3 hrs/day)

### Phase 1 (Weeks 1-3): Core Recording + Real-Time Sync
**Focus:** Multi-account tracking foundation + both platforms

- [ ] **Backend Setup**
  - Prisma schema (10 models)
  - NextAuth (email/password)
  - Account CRUD endpoints
  - Transaction CRUD endpoints
  - Account transfer endpoint
  
- [ ] **Web Platform**
  - Login/signup pages
  - Account list + create
  - Transaction list + add form
  - Dashboard overview
  - Real-time sync working
  
- [ ] **Mobile Platform**
  - Login/signup screens
  - Account list (tab)
  - Quick add transaction (modal)
  - Real-time sync working

**Deliverable:** Both platforms can record transactions, see accounts, real-time sync working

---

### Phase 2 (Weeks 4-6): Tracking Specialization + Basic Reports
**Focus:** Asset + Debt tracking, auto-report generation

- [ ] **Backend**
  - Asset CRUD endpoints
  - Debt CRUD endpoints
  - Financial snapshot calculation (daily/monthly)
  - Report generation (6 types: summary, P&L, cash flow, balance, net worth, mutasi)
  
- [ ] **Web Platform**
  - Assets page (portfolio view)
  - Debts page (management)
  - Reports dashboard (6 report types with charts)
  - Transaction filters (by category, date range, account)
  
- [ ] **Mobile Platform**
  - Assets quick add (modal)
  - Debts quick view
  - Reports simplified view

**Deliverable:** Assets + debts tracked, 6 auto-reports generating, cross-device real-time sync

---

### Phase 3 (Weeks 7-9): Financial Health + Planning
**Focus:** Scoring, budgeting, calculators

- [ ] **Backend**
  - Health check calculation (income vs expense, debt ratio, savings rate → 0-100 score)
  - Freedom level calculation (6-level based on net worth)
  - Budget vs actual analysis
  - Emergency fund calculator
  - Pension fund calculator
  
- [ ] **Web Platform**
  - Health check page (score, insights, recommendations)
  - Freedom level page (current level, progress to next, actions)
  - Budget planner (set monthly budgets, track vs actual)
  - Planning calculators (emergency fund, pension)
  
- [ ] **Mobile Platform**
  - Health check quick view
  - Freedom level card
  - Budget notifications

**Deliverable:** Financial health scoring, freedom level, budget planning working

---

### Phase 4 (Weeks 10-12): Polish, Testing, Deployment
**Focus:** UX refinement, performance, mobile build

- [ ] **Testing**
  - Manual test all flows
  - Real-time sync stress test (multiple devices)
  - Performance optimization
  
- [ ] **UI Polish**
  - Gen Z design consistency (web + mobile)
  - Loading states, error handling
  - Mobile responsiveness
  - Dark mode (optional)
  
- [ ] **Deployment**
  - Web: Deploy to Vercel (backend + frontend)
  - Mobile: Build APK/IPA via Expo (optional cloud build)
  - Setup production DATABASE_URL in Supabase
  - Domain + HTTPS setup

**Deliverable:** MVP live on web + mobile (TestFlight/internal Android)

---

## No-No's for Wealth Checker

**Architecture:**
- ❌ Don't create separate backends for web/mobile (single API)
- ❌ Don't duplicate business logic (centralize in `shared/`)
- ❌ Don't hardcode API URLs (use env variables)
- ❌ Don't skip real-time sync implementation

**Code Quality:**
- ❌ No unrelated refactoring during feature work
- ❌ No console.log in production code
- ❌ No hardcoded secrets in code (use `.env.local`)
- ❌ No fetch without error handling

**Validation:**
- ❌ No form submission without validation (React Hook Form + Zod)
- ❌ No trust in client-side data (validate on backend)
- ❌ Don't skip null/undefined checks

**Performance:**
- ❌ No N+1 queries (use Prisma `.select()`, parallel queries)
- ❌ No large unoptimized charts (recharts for web, react-native-svg for mobile)
- ❌ Don't load all data at once (paginate large datasets)

**Mobile-Specific:**
- ❌ No inline styles (use StyleSheet)
- ❌ No untested permission requests
- ❌ Don't assume screen size (mobile-first)
- ❌ No synchronous heavy operations (use workers if needed)

**Cross-Platform:**
- ❌ Don't implement web-only features without mobile parity (or explicitly defer to Phase 2)
- ❌ No web packages that don't work on React Native
- ❌ Don't assume desktop-only inputs (dates, numbers, etc.)

**Phase 1 Constraints:**
- ❌ No OAuth/external auth (email/password only)
- ❌ No complex state management (useState + hooks only)
- ❌ No offline-first sync (Phase 2)
- ❌ No advanced analytics until Phase 3

---

## Useful Commands

```bash
# Root level (monorepo)
npm install                    # Install all services
npm run dev                    # Start backend + web in parallel
npm run lint                   # Lint all services
npm run format                 # Format all services

# Backend
cd backend
npm run dev                    # Start backend (:3000)
npx prisma migrate dev --name "feature"
npx prisma studio             # Open DB GUI

# Web
cd web
npm run dev                    # Start web (:3001)

# Mobile
cd mobile
npm start                      # Start Expo (:19000)
npm run ios                    # iOS simulator
npm run android               # Android emulator
```

## Resources

- **Supabase Realtime:** https://supabase.com/docs/guides/realtime
- **Next.js 16:** https://nextjs.org/docs (check App Router, API Routes)
- **NextAuth.js:** https://next-auth.js.org/
- **Prisma:** https://www.prisma.io/docs/
- **TailwindCSS 4:** https://tailwindcss.com/docs
- **shadcn/ui:** https://ui.shadcn.com/
- **React Native:** https://reactnative.dev/docs/getting-started
- **Expo:** https://docs.expo.dev/
- **React Navigation (Expo Router):** https://expo.github.io/router/

---

**Next Step:** Say `"Setup monorepo"` and I'll initialize the full project structure with all 3 services (backend, web, mobile).

Or if you have specific questions about architecture, timeline, or features — just ask!
