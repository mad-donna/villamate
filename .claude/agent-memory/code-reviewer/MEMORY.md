# Code Reviewer Memory — Villamate

## Phase 1 Web Rewrite (Next.js 15 App Router, Apr 2026)
- New stack: `apps/web/` under `D:/villamate/apps/web/`. Prisma + PostgreSQL, JWT Bearer auth via middleware.ts.
- Auth: `lib/auth.ts` uses `jose` JWTs. JWT_SECRET falls back to `dev-secret-change-me` in non-prod — guarded by runtime throw in production (added Apr 2026).
- Middleware injects `x-user-id`, `x-user-role`, `x-user-email`, `x-user-villa-id` headers for downstream routes.
- Cron routes live in `app/api/cron/` and are excluded from JWT middleware via `PUBLIC_API` array. Each route does its own `CRON_SECRET` check.
- Vercel cron: `vercel.json` at repo root (`D:/villamate/vercel.json`) with `rootDirectory: apps/web`. publish-invoices runs UTC 15:00 (= KST 00:00); expire-subscriptions UTC 00:00; invoice-reminder UTC 01:00.
- InvoicePayment unique constraint: `[invoiceId, roomNumber]`. roomNumber denormalized to preserve history after resident moves out.
- CSRF defense: `middleware.ts` checks Origin/Referer for mutating methods; allows pass-through when Authorization header present (mobile/API clients). This is intentional but means stolen JWT bypasses CSRF.

## Recurring Anti-patterns (Phase 1 codebase)
- CRON_SECRET checked as `auth !== \`Bearer \${process.env.CRON_SECRET}\`` — if env var is undefined this becomes `Bearer undefined` and never matches, but is now guarded by explicit undefined check.
- Notification dedup for invoice-reminder relied on `createdAt` range rather than title-based lookup — caused 3-day reminders to suppress 7-day reminders. Fixed Apr 2026 to use `title: { contains: '최종' }`.
- Transaction success assumed before catch — publish-invoices originally incremented `published` counter after `$transaction` with no try/catch; notifications fired even on DB failure. Fixed Apr 2026.

## Project Overview
- React Native (Expo) frontend + Node/Express + Prisma backend
- DB: PostgreSQL via Supabase (DATABASE_URL / DIRECT_URL env vars)
- Local dev SQLite at `backend/dev.db` also present (schema uses postgres)
- API base URL is hardcoded per-file as `http://192.168.219.122:3000` — a local LAN IP (updated Feb 2026)
- `User` model has NO `villaId` field — villa membership lives in `ResidentRecord` join table only

## Architecture Notes
- `Villa.id` is `Int` (autoincrement) in Prisma; `User.id` is `String` (uuid)
- Admin users fetch their villas via `GET /api/villas/:adminId` (adminId = User uuid string)
- Resident users store villa info in AsyncStorage `user` key as `{ ...user, villa: { ...villaData } }` after joining
- Invoice routes use `:villaId` (Int), which comes BEFORE `/:villaId/residents` and `/:adminId` in index.ts — ordering is correct
- `ResidentDashboardScreen` reads `user.villa.id` from AsyncStorage; this is only populated after joining via `ResidentJoinScreen`

## Confirmed Patterns
- AsyncStorage keys: `userId` (String), `user` (JSON object)
- All screens have a userId fallback: try `userId` key first, then parse `user` object
- `FlatList` inside `ScrollView` always uses `scrollEnabled={false}` (correct)
- Navigation: `AdminInvoiceScreen` registered in BOTH AppNavigator (Stack as "AdminInvoice") and MainTabNavigator (Tab as "청구") — Stack registration is dead/unused
- `CreateInvoice` is Stack-only (AppNavigator line 51). Tab screens must use `navigation.getParent()?.navigate('CreateInvoice')` to reach it.
- Invoice feature: FIXED/VARIABLE type enum, request body shapes, and backend response shape are all correctly aligned (verified Feb 2026)
- Backend `GET /api/residents/:residentId/payments` returns `invoice.items` as `Json?` — ResidentDashboardScreen guards with `isVariable && Array.isArray(...)` before rendering (correct pattern)
- Villa resolution pattern in admin screens: fetch `GET /api/villas/${userId}` → take `villas[0].id`. Used in both CreateInvoiceScreen and AdminInvoiceScreen (duplicated — candidate for shared hook)

## Android Status Bar / SafeAreaView Pattern
- ALWAYS import `SafeAreaView` from `react-native-safe-area-context`, NEVER from `react-native`
- `react-native`'s built-in `SafeAreaView` adds NO top padding on Android — only works on iOS
- Screens with `headerShown: false` MUST use `react-native-safe-area-context`'s version or manually apply `useSafeAreaInsets().top`
- Affected screens audited Feb 2026: `AdminInvoiceDetailScreen` was the only one with confirmed bug (FIXED). Others using `SafeAreaView` from `react-native` include: `AdminInvoiceScreen`, `DashboardScreen`, `LedgerScreen`, `LoginScreen`, `OnboardingScreen`, `ProfileScreen`, `ProfileSetupScreen`, `ResidentDashboardScreen`, `ResidentManagementScreen` — these have navigator headers visible so may be masked, but should be migrated
- Screens already using the correct pattern: `EmailLoginScreen`, `ResidentJoinScreen`, `CreateInvoiceScreen` (all use `useSafeAreaInsets`)

## Known Issues Found (Feb 2026 review)
- FIXED (Feb 2026): Resident login routing bug — `User` model has no `villaId` column, so API login responses never include villa info. Fix: `navigateAfterLogin` now calls `GET /api/users/:userId/villa` (new endpoint) when `merged.villa` is absent, and routes based on `merged` (not raw `user`). Applies to both `LoginScreen.tsx` and `EmailLoginScreen.tsx`.
- New backend endpoint added: `GET /api/users/:userId/villa` — returns `{ villa }` via ResidentRecord lookup.
- CRITICAL (still open): `ResidentDashboardScreen` reads `user.villa.id` from AsyncStorage — this now works because login flow properly populates `merged.villa` and saves it.
- CRITICAL: `isPaid` state in `ResidentDashboardScreen` is per-render global — all invoices show paid/unpaid together, no per-invoice payment state.
- CRITICAL: `AdminInvoiceScreen` "새 청구서 만들기" button calls `navigation.navigate('CreateInvoice')` from inside a Tab screen — fails because CreateInvoice is Stack-only. Fix: `navigation.getParent()?.navigate('CreateInvoice')`. Blocks all of Flow A and Flow B.
- WARNING: `POST /api/villas/join` upsert logic is fragile — uses a nested query to find existing record id, will create a new record if `findFirst` returns null with id=0.
- WARNING: `DashboardScreen` `fetchResidents` runs on mount (useEffect with [] dependency) but `fetchVillaData` uses `useFocusEffect` — residents list does not refresh on tab re-focus.
- WARNING: Backend `POST /api/villas/:villaId/invoices` does not validate that fixedAmount is a positive integer — negative or float values pass through and may cause a Prisma 500.
- WARNING: Date input in CreateInvoiceScreen validated by regex only (`^\d{4}-\d{2}-\d{2}$`) — semantically invalid dates like "2026-99-99" pass to backend and cause Prisma 500.
- WARNING: Cron auto-billing hardcodes 50,000 won per villa — not villa-specific.
- INFO: No authentication/authorization on any API routes — any client can read/write any villa's data.
- INFO: `KAKAO_CLIENT_ID` and `GOOGLE_CLIENT_ID` are hardcoded in `LoginScreen.tsx` (not in env vars).
- INFO: `key={index}` used in VARIABLE item lists in both CreateInvoiceScreen and ResidentDashboardScreen — anti-pattern for mutable lists.
