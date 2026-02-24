# Villamate Agent Memory

## Project Overview
- React Native (Expo) + Node.js/Express + Prisma + Supabase PostgreSQL
- Frontend: `D:\villamate\frontend\`
- Backend: `D:\villamate\backend\`
- API base URL: `http://192.168.219.112:3000`

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
- Key routes: `Login`, `Main` (tab navigator), `ResidentDashboard`, `CreateInvoice`, `AdminInvoice`, `Payment`, `Ledger`, `ResidentJoin`, `Onboarding`
- Express params destructured from `req.params` must use `String(req.params.x)` not `const { x } = req.params` — the latter causes TS2322 type errors

### Invoice System (updated Feb 2026)
- Invoice model: `id`, `title`, `type` (InvoiceType enum), `totalAmount` (Int), `amountPerResident` (Int), `items` (Json? — nullable), `dueDate`, `villaId`
- `InvoiceType` Prisma enum: `FIXED` | `VARIABLE` — stored as string literals in frontend
- FIXED invoices: `fixedAmount` per resident, `totalAmount = fixedAmount * residentCount`, `items = null`
- VARIABLE invoices: itemised list, `totalAmount = sum(items)`, `amountPerResident = ceil(total / count)`, `items` stored as JSON array
- POST `/api/villas/:villaId/invoices` body: `{ title, type, dueDate, fixedAmount? (FIXED), items? (VARIABLE) }`
- InvoicePayment model: per-resident payment records linked to Invoice and User
- Admin invoice screen: `AdminInvoiceScreen` navigates to `CreateInvoice` screen (no inline modal)
- `CreateInvoiceScreen` has segmented control (고정/변동 tabs) — top-level stack screen
- Resident payments fetched via `GET /api/residents/:residentId/payments` (not by villaId)
- ResidentDashboardScreen shows type badge (고정 관리비/변동 관리비) and VARIABLE item breakdown
- Auto-billing CRON: creates FIXED-type invoices with `type: 'FIXED'` and `amountPerResident` set
- Auto-billing: `Villa.autoBillingDay` (Int?), cron job runs daily at 9 AM

## Key Files
- `backend/src/index.ts` — all API routes
- `backend/prisma/schema.prisma` — database schema
- `frontend/src/navigation/AppNavigator.tsx` — all screen registrations
- `frontend/src/navigation/MainTabNavigator.tsx` — tab navigator (admin tabs)
- `frontend/src/screens/AdminInvoiceScreen.tsx` — admin invoice management with auto-billing
