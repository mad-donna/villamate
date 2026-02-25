# Villamate Agent Memory

## Project Overview
- React Native (Expo) + Node.js/Express + Prisma + Supabase PostgreSQL
- Frontend: `D:\villamate\frontend\`
- Backend: `D:\villamate\backend\`
- API base URL: `http://192.168.219.122:3000`

## Architecture Patterns

### Backend (`backend/src/index.ts`)
- Single-file Express app — all routes in `index.ts`, no separate router modules
- Prisma client imported as `PrismaClient` and instantiated as `prisma`
- Route ordering matters: `/api/villas/:villaId/invoices` must come BEFORE `/api/villas/:villaId/residents` and `/api/villas/:adminId` to avoid wildcard conflicts
- Express params are typed `string | string[]` — always wrap with `String()` before `parseInt`: `parseInt(String(req.params.villaId), 10)`
- Pre-existing TypeScript errors exist in `src/modules/` (legacy NestJS code) — these can be ignored

### Prisma Schema (`backend/prisma/schema.prisma`)
- Villa.id is `Int` (autoincrement), User.id is `String` (uuid)
- Run `npx prisma db push` from `D:\villamate\backend` to apply schema changes
- `prisma db push` may show EPERM DLL rename warning on Windows when server is running — non-fatal, schema is still applied

### Frontend Screens
- All screens use `SafeAreaView`, `StyleSheet`, `AsyncStorage` pattern
- userId stored as `AsyncStorage.getItem('userId')` with fallback: `AsyncStorage.getItem('user')` -> `JSON.parse -> user.id`
- After resident joins villa, the response `{ user, villa }` is stored in `AsyncStorage` key `'user'` — so `user.villa.id` gives the villaId for residents
- Admin's villaId: fetch `GET /api/villas/${userId}` -> `villas[0].id`
- Color palette: `#007AFF` (blue), `#34C759` (green), `#FF3B30` (red), `#F7F7F7` / `#F8F9FA` (backgrounds)

### Navigation (`frontend/src/navigation/AppNavigator.tsx`)
- NativeStack navigator with all screens registered
- Key routes: `Login`, `Main` (tab navigator), `ResidentDashboard`, `CreateInvoice`, `AdminInvoice`, `AdminInvoiceDetail`, `Payment`, `Ledger`, `ResidentJoin`, `Onboarding`
- Express params destructured from `req.params` must use `String(req.params.x)` not `const { x } = req.params` — the latter causes TS2322 type errors

### Invoice System (updated Feb 2026 — refactored)
- Invoice model: `id`, `billingMonth` (String, 'YYYY-MM'), `memo` (String?), `type` (InvoiceType enum), `totalAmount` (Int), `amountPerResident` (Int), `items` (Json? — nullable), `villaId`
- NOTE: `title` and `dueDate` fields were REMOVED from Invoice model in Feb 2026 refactor
- `InvoiceType` Prisma enum: `FIXED` | `VARIABLE` — stored as string literals in frontend
- FIXED invoices: `fixedAmount` per resident, `totalAmount = fixedAmount * residentCount`, `items = null`
- VARIABLE invoices: itemised list, `totalAmount = sum(items)`, `amountPerResident = ceil(total / count)`, `items` stored as JSON array
- POST `/api/villas/:villaId/invoices` body: `{ billingMonth, memo?, type, fixedAmount? (FIXED), items? (VARIABLE) }`
- billingMonth format validated server-side: `/^\d{4}-\d{2}$/`
- InvoicePayment model: per-resident payment records linked to Invoice and User
- Admin invoice screen: `AdminInvoiceScreen` navigates to `CreateInvoice` screen (no inline modal)
- `CreateInvoiceScreen`: billingMonth selector with left/right arrow buttons (< 2026년 2월 >), optional memo TextInput (multiline), segmented control (고정/변동 tabs)
- Resident payments fetched via `GET /api/residents/:residentId/payments` (not by villaId)
- ResidentDashboardScreen shows type badge (고정 관리비/변동 관리비), memo below amount, and VARIABLE item breakdown
- Commission model (Feb 2026): ResidentDashboardScreen does NOT show villa bank account or clipboard copy; payment is done in-app via '빌라메이트로 결제하기' button (#4CAF50 green) which calls `handleInAppPayment` — shows Modal loading overlay (1.5s), then PUT /api/payments/:paymentId/status with COMPLETED
- `GET /api/residents/:residentId/payments` villa select only returns `name` — `accountNumber` and `bankName` are stripped server-side (commission security model)
- `PUT /api/payments/:paymentId/status` endpoint exists at line ~357 in index.ts
- `GET /api/invoices/:invoiceId/payments` — returns payments with `user.name` + `user.roomNumber` (roomNumber sourced from ResidentRecord, not User); added Feb 2026
- `InvoicePayment` Prisma relation to User is named `resident` (not `user`) — always use `resident` in Prisma includes
- `roomNumber` lives on `ResidentRecord`, NOT on `User` — to get it, nested-include `resident.residentRecords` filtered by `villaId`, then reshape response to `user: { name, roomNumber }`
- AdminInvoiceDetailScreen: registered as `AdminInvoiceDetail` in AppNavigator (headerShown: false); navigated to from AdminInvoiceScreen tab via `navigation.getParent()?.navigate('AdminInvoiceDetail', { invoiceId, billingMonth })`
- `formatBillingMonth('2026-02')` -> `'2026년 2월 관리비'` — used in both AdminInvoice and ResidentDashboard screens
- Auto-billing CRON: creates FIXED-type invoices with `billingMonth` as `YYYY-MM` string, runs daily at 9 AM
- Auto-billing: `Villa.autoBillingDay` (Int?), cron job runs daily at 9 AM

## Key Files
- `backend/src/index.ts` — all API routes
- `backend/prisma/schema.prisma` — database schema
- `frontend/src/navigation/AppNavigator.tsx` — all screen registrations
- `frontend/src/navigation/MainTabNavigator.tsx` — tab navigator (admin tabs)
- `frontend/src/screens/AdminInvoiceScreen.tsx` — admin invoice management with auto-billing
