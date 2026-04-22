# Wealth Checker 💰

Personal financial tracking platform for Gen Z — Web + Mobile

## Overview

Wealth Checker is a fullstack personal finance dashboard that helps you track income, expenses, assets, and debts. It provides automated financial reports, health scoring, and freedom level tracking to help you achieve financial independence.

**Features:**
- 🏦 Multi-account tracking (debit/credit/savings)
- 📊 12+ automated financial reports
- 💪 Financial health scoring (0-100)
- 🎯 Freedom level tracker (0-6 scale)
- 💼 Asset & debt management
- 📱 Real-time sync across web + mobile

## Stack

**Monorepo Structure:**
```
backend/      — Next.js 16 API + Prisma + Supabase
web/          — Next.js 16 + React 19 + TailwindCSS
mobile/       — React Native (Expo)
shared/       — Types, calculations, shared utilities
```

**Technology:**
- Next.js 16 (backend + web)
- React 19 (web)
- React Native + Expo (mobile)
- PostgreSQL + Supabase
- NextAuth.js (email/password)
- Prisma ORM
- TailwindCSS 4
- Supabase Realtime (WebSocket)

## Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier OK)

### Setup

1. **Clone & Install**
   ```bash
   npm install
   ```

2. **Setup Backend**
   ```bash
   cd backend
   cp .env.local.example .env.local
   # Add your Supabase DATABASE_URL to .env.local
   npx prisma migrate dev --name init
   cd ..
   ```

3. **Setup Web**
   ```bash
   cd web
   cp .env.local.example .env.local
   cd ..
   ```

4. **Setup Mobile**
   ```bash
   cd mobile
   cp .env.example .env
   cd ..
   ```

## Running Locally

### Start All Services
```bash
npm run dev
# Backend runs on :3000
# Web runs on :3001
```

### Start Individual Services
```bash
# Backend only
cd backend && npm run dev

# Web only
cd web && npm run dev

# Mobile only
cd mobile && npm start
```

## Project Structure

See `CLAUDE.md` for detailed project architecture, standards, and guidelines.

## Phase Breakdown

**Phase 1 (Weeks 1-3):** Core Recording
- Multi-account tracking
- Transaction recording (income/expense)
- Real-time sync web + mobile

**Phase 2 (Weeks 4-6):** Assets + Debts + Reports
- Asset portfolio tracking
- Debt management
- 6 automated reports

**Phase 3 (Weeks 7-9):** Health + Planning
- Financial health scoring
- Freedom level tracker
- Budget planning
- 3 calculators

**Phase 4 (Weeks 10-12):** Testing + Deployment
- Mobile build (Expo)
- Web deployment (Vercel)
- Full testing & polish

## Development

### Code Quality
```bash
npm run lint      # Lint all services
npm run format    # Format all services
```

### Database
```bash
cd backend

npx prisma migrate dev --name "feature-name"  # Create migration
npx prisma studio                             # Open DB GUI
npx prisma generate                           # Generate Prisma client
```

## Deployment

### Web (Vercel)
```bash
cd web
npm run build
# Deploy to Vercel via CLI or git push
```

### Mobile (Expo)
```bash
cd mobile
npm run build:ios    # Build iOS
npm run build:android # Build Android
```

## Documentation

- `CLAUDE.md` — Project guidelines, architecture, standards
- `backend/prisma/schema.prisma` — Database schema
- `shared/types.ts` — Shared TypeScript types

## Contributing

- Follow the guidelines in `CLAUDE.md`
- Create feature branches: `feat/feature-name`
- Create PRs with detailed descriptions
- All tests must pass before merge

## Timeline

- **Total:** 2-3 months (8-12 weeks)
- **Pace:** 3 hours/day, 5 days/week = 15 hrs/week
- **Total Hours:** 120-180 hours for full MVP

## License

Proprietary — Personal project

---

**Questions?** Check `CLAUDE.md` or the phase-specific task descriptions.
