# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from `apps/web/` unless noted.

```bash
# Development
pnpm dev               # Next.js dev server (port 3000)
pnpm build             # prisma generate + next build
pnpm start             # production server

# Testing
pnpm test              # Jest (API routes only)
pnpm test:coverage     # with coverage report
pnpm test -- --testPathPattern=path/to/test  # single test file

# DB
npx prisma generate    # regenerate Prisma client after schema changes
npx prisma migrate dev # run migrations locally
npx prisma studio      # DB GUI
```

## Architecture Overview

**VillaMate** is a fullstack SaaS for villa/apartment building management. Single Next.js 15 App Router app deployed on Vercel — no separate backend.

### Monorepo
```
D:/villamate/
├── apps/web/          # Next.js 15 app (the entire product)
│   ├── app/           # App Router: routes + API handlers
│   ├── components/    # React components
│   ├── lib/           # Server & client utilities
│   ├── prisma/        # Schema + migrations
│   └── public/        # Static assets
└── docs/              # Product specs (read these before implementing features)
    ├── PRODUCT_CONTEXT.md  # Feature specs & MVP status
    ├── RDD.md              # v2.0 requirements & route structure
    ├── DESIGN_SYSTEM.md    # UI tokens & component patterns
    └── SPRINT.md           # Current sprint status
```

### App Router Route Groups
| Group | Role | Layout |
|-------|------|--------|
| `(auth)` | Public | Login, signup, onboarding |
| `(admin)` | ADMIN | 5-tab building manager UI |
| `(resident)` | RESIDENT | 4-tab resident UI |
| `(backoffice)` | SUPER_ADMIN | 240px sidebar desktop SaaS admin |
| `pay/[billId]` | Public | PortOne payment page |

### API Route Conventions
- Protected by `middleware.ts` — validates JWT, injects `x-user-id`, `x-user-role`, `x-user-villa-id` headers
- Route handlers extract user via `getUser(req)` from `lib/api.ts`
- Standard responses: `ok(data)` and `err(message, status)` from `lib/api.ts`
- Subscription guard: `requireActiveSubscription(villaId)` from `lib/subscription.ts`
- Public exceptions in middleware: `/api/auth/`, `/api/cron/`, `/api/pay/`, `/api/backoffice/auth/`, visitor QR paths

### Auth Flow
- User: JWT in localStorage → `Authorization: Bearer` header → middleware validates → headers injected
- Backoffice: `bo_session` cookie → middleware checks `role === SUPER_ADMIN`
- Roles: `RESIDENT`, `ADMIN`, `SUPER_ADMIN`
- ADMIN users can toggle between admin view (villa management) and resident view (member)

### Key Library Files (`apps/web/lib/`)
| File | Purpose |
|------|---------|
| `auth.ts` | JWT sign/verify (HS256, 30d) |
| `api.ts` | `getUser()`, `ok()`, `err()` |
| `client-auth.ts` | localStorage token helpers (browser only) |
| `client-api.ts` | `apiFetch/apiGet/apiPost/apiPatch/apiDelete` with auto token injection |
| `subscription.ts` | `requireActiveSubscription()` guard |
| `notify.ts` | DB notification + Web Push dispatch |
| `toss.ts` | Toss Payments auto-billing SDK |
| `pricing.ts` | Subscription tier pricing |

### Database
- Supabase PostgreSQL via Prisma 6
- Key models: `User`, `Villa`, `ResidentRecord`, `Invoice`, `InvoicePayment`, `ExternalBilling`, `Post`, `Poll`, `LedgerTransaction`, `Vehicle`, `Ticket`, `Notification`
- Migrations in `prisma/migrations/`; always run `prisma generate` after schema changes

### Payments
- **PortOne (KG Inicis)**: one-time invoice payments — public pay page at `/pay/[billId]`
- **Toss Payments**: subscription auto-billing via stored billingKey (`TossBillingKey` model)

### Cron Jobs (Vercel, daily 15:00 UTC)
`invoice-reminder`, `expire-subscriptions`, `publish-invoices`, `poll-reminder`, `subscription-reminder`, `auto-payment` — all in `app/api/cron/`

## Tech Stack
- **Next.js 15** / **React 19** / **TypeScript 5**
- **Tailwind CSS 4**
- **Prisma 6** + **Supabase PostgreSQL**
- **TipTap 3** (rich text editor)
- **jose** (JWT), **bcryptjs** (passwords)
- Jest 30 + ts-jest (tests cover `app/api/**/*.ts`, excluding cron)

## Working Principles

- Ship fast. Prefer working code over perfect architecture.
- Do not overengineer or introduce unnecessary abstractions.
- Follow existing patterns in the codebase strictly.
- When unsure, choose the simplest solution that works.
- Avoid large refactors unless explicitly requested.

## Next.js Conventions

- Default to Server Components. Use "use client" only when necessary.
- Fetch data in server components when possible.
- Avoid unnecessary client-side state.
- Keep route handlers thin — move logic to lib/.
- Use async/await consistently.

## API Rules

- Always use `getUser(req)` — never parse headers manually.
- Always return responses using `ok()` or `err()`.
- Do not leak raw errors to clients.
- Validate inputs at the route level.
- Keep handlers under ~50 lines — extract logic to lib if larger.

## State Management

- Prefer server-side data fetching over client state.
- Avoid introducing global state libraries unless absolutely necessary.
- Use React state only for UI interactions.

## Code Editing Rules

- Do not rewrite entire files unless explicitly requested.
- Only modify the minimal necessary code.
- Preserve existing structure and naming.
- Highlight changed parts clearly.

## Debugging

- Identify root cause before suggesting fixes.
- Do not guess — base reasoning on code.
- Suggest the smallest possible fix.
- Include quick verification steps.

## Anti-Patterns

- Do not introduce new dependencies without clear justification.
- Do not refactor unrelated code.
- Do not add excessive comments.
- Do not create abstractions that are used only once.

## UI Rules

- Follow `docs/DESIGN_SYSTEM.md` strictly.
- Reuse existing components from `components/`.
- Do not create new UI patterns unless necessary.