# Villamate Agent Memory

## Project Overview
- React Native (Expo) + Node.js/Express + Prisma + Supabase PostgreSQL
- Frontend: `D:\villamate\frontend\`
- Backend: `D:\villamate\backend\`
- API base URL: `http://192.168.219.178:3000` (updated Feb 2026 — was .108, now .124)

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
- Key routes: `Login`, `Main` (admin tab navigator), `ResidentDashboard` (resident tab navigator), `CreateInvoice`, `AdminInvoice`, `AdminInvoiceDetail`, `Payment`, `Ledger`, `ResidentJoin`, `Onboarding`, `Board`, `CreatePost`, `ResidentManagement`
- Admin tabs (MainTabNavigator): 홈 (DashboardScreen), 커뮤니티 (CommunityTabScreen), 관리 (ManagementScreen), 프로필 (ProfileScreen)
- Resident tabs (ResidentTabNavigator): 홈 (ResidentDashboardScreen), 커뮤니티 (ResidentCommunityTabScreen), 프로필 (ProfileScreen)
- Tab navigator community wrappers: `CommunityTabScreen` (admin) and `ResidentCommunityTabScreen` (resident) — these load villaId/userId from AsyncStorage on focus, then render `BoardScreen` with a fakeRoute object
- Admin villaId in CommunityTabScreen: fetched via `GET /api/villas/${userId}` -> `villas[0].id`
- Resident villaId in ResidentCommunityTabScreen: from `AsyncStorage.getItem('user') -> storedUser.villa.id`
- Safe Area pattern for tab screens: use `SafeAreaView` from `react-native-safe-area-context` with `edges={['top']}` — the tab bar handles bottom safe area automatically; omitting `edges={['top']}` causes gray box below content
- Logout from tab screens: use `CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] })` — `navigation.replace('Login')` only works on stack screens, not inside tabs
- Stack-screen navigation from tab screens: React Navigation's `navigate` bubbles up to parent navigators automatically — no need for `getParent()` for stack routes
- Express params destructured from `req.params` must use `String(req.params.x)` not `const { x } = req.params` — the latter causes TS2322 type errors
- `API_BASE_URL = 'http://192.168.219.108:3000'` — confirmed correct URL (not .122)

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

### Community Board System (added Feb 2026)
- Post model: `id` (uuid), `title`, `content`, `isNotice` (Boolean, default false), `authorId` (String -> User), `villaId` (Int -> Villa), `createdAt`
- `roomNumber` is NOT on User — GET /api/villas/:villaId/posts does a per-post ResidentRecord lookup to attach roomNumber to author
- GET `/api/villas/:villaId/posts` — orderBy `[isNotice: desc, createdAt: desc]`; returns posts with `author: { name, roomNumber }`
- POST `/api/villas/:villaId/posts` — body: `{ title, content, authorId, isNotice? }`
- PUT `/api/posts/:postId/notice` — body: `{ isNotice: boolean, villaId }`. If pinning and count >= 3, returns 400 with Korean message
- BoardScreen registered as `Board` in AppNavigator; params: `{ villaId, userId, userRole }`
- BoardScreen cards are wrapped in `TouchableOpacity` that navigates to `PostDetail` via `navigation.getParent()?.navigate()`
- CreatePostScreen registered as `CreatePost` in AppNavigator; params: `{ villaId, userId, userRole }`
- PostDetailScreen registered as `PostDetail` in AppNavigator; params: `{ postId, userId, userRole }`
- GET `/api/posts/:postId` — returns full post with `author: { name, roomNumber }` (roomNumber from ResidentRecord lookup)
- DELETE `/api/posts/:postId` — hard delete; author-only (server checks `post.authorId !== userId` and returns 403). Body: `{ userId }`. UI shows delete button only when `userId === post.authorId` (no ADMIN bypass)
- GET `/api/posts/:postId/comments` — returns comments with `author: { name, roomNumber }` (roomNumber from ResidentRecord), ordered by createdAt asc
- POST `/api/posts/:postId/comments` — body: `{ content, authorId }`, returns created Comment
- Comment model: `id` (uuid), `content`, `authorId` (String -> User), `postId` (String -> Post), `createdAt`
- PostDetailScreen (Feb 2026 update): uses KeyboardAvoidingView wrapping ScrollView + fixed bottom commentInputBar; delete button moved INSIDE ScrollView below content; comment section (댓글 N개 header + commentCard list) rendered inside ScrollView below delete button; no ADMIN delete bypass
- Admin nav to Board: `navigation.navigate('Board', { villaId: villaData.id, userId: adminUserId, userRole: 'ADMIN' })`; `adminUserId` stored in state, set inside `fetchVillaData`
- Resident nav to Board: `navigation.navigate('Board', { villaId: residentVillaId, userId: residentUserId, userRole: 'RESIDENT' })`; both stored in state
- `residentVillaId` resolved from `AsyncStorage.getItem('user') -> JSON.parse -> storedUser.villa.id`
- Color for Community buttons: `#5856D6` (indigo/purple)
- Pre-existing frontend TS errors: `@expo/vector-icons` type declarations missing — safe to ignore

### Resident Move-out & Management System (added Feb 2026)
- `GET /api/villas/:villaId/residents` — returns `{ recordId, userId, name, roomNumber, joinedAt }[]` ordered by roomNumber asc (updated Feb 2026 — previous version returned different shape with id/phone)
- `POST /api/villas/:villaId/residents/:residentId/move-out` — deletes ResidentRecord for that user+villa; past InvoicePayment records are preserved
- `GET /api/villas/:villaId/detail` — fetches full Villa row by numeric villaId (includes inviteCode); registered BEFORE wildcard `GET /api/villas/:adminId` to avoid shadowing
- ResidentManagementScreen: `useFocusEffect` + `resolveVillaId` helper (checks user.villa.id first, then falls back to `/api/villas/:adminId`); per-row `processingId` state for move-out loading; handleInvite fetches inviteCode via `/api/villas/:id/detail`
- ManagementScreen: menu item id `'residents'` label updated to '입주민 및 전출입 관리', navigates to `ResidentManagement` stack screen
- AppNavigator already had ResidentManagementScreen import + registration — no navigator changes needed

### Vehicle & Parking System (added Feb 2026)
- Vehicle model: `id` (uuid), `plateNumber`, `isVisitor` (Boolean), `expectedDeparture` (DateTime?), `ownerId` (String -> User), `villaId` (Int -> Villa), `createdAt`
- POST `/api/vehicles` — body: `{ plateNumber, ownerId, villaId, isVisitor, expectedDeparture? }`
- GET `/api/villas/:villaId/vehicles/search?query=` — contains search on plateNumber; includes `owner: { name, roomNumber }` (roomNumber from ResidentRecord)
- GET `/api/users/:userId/vehicles` — fetch vehicles by owner
- DELETE `/api/vehicles/:vehicleId` — hard delete
- ParkingSearch registered as `ParkingSearch` in AppNavigator (title: '주차 조회')
- Navigation from tab screens to ParkingSearch: use `navigation.getParent()?.navigate('ParkingSearch', { villaId })`
- ProfileScreen vehicle section: villaId resolved from `AsyncStorage.getItem('user') -> storedUser.villa.id` (residents only); useFocusEffect for vehicle list refresh
- Visitor vehicle color: `#FF9500` (orange badge + departure text); Regular vehicle: `#E3F2FD` (blue badge)
- Parking button color on dashboards: `#30B0C7` (teal)

### Electronic Voting Frontend (added Feb 2026)
- PollListScreen: registered as `PollList` in AppNavigator (headerShown: false); receives `{ villaId, userId }` params; FAB navigates to CreatePoll; cards navigate to PollDetail
- CreatePollScreen: registered as `CreatePoll` (title: '투표 생성'); dynamic options list (min 2); DateTimePicker for endDate (iOS inline, Android default); Switch for isAnonymous
- PollDetailScreen: registered as `PollDetail` (title: '투표 상세'); fetches all polls then finds by id; shows voting UI if active+not voted, results UI otherwise; 1세대1표 enforced server-side (409 response)
- Results bar: `flexDirection: 'row'` with `flex: pct` fill + `flex: 100-pct` empty inside `barBg`
- hasVoted detection: `poll.options.some(o => o.votes.some(v => v.voterId === userId))`
- Admin dashboard: `activePollsCount` in DashData interface; '진행중인 투표' full-width widget; '전자투표' quick action (color #FF2D55)
- Resident dashboard: `activePollsCount` in DashData interface; '참여 가능한 투표' full-width widget; '투표' pill button (color #FF2D55)
- Voting color: `#FF2D55` (red/pink) used consistently across admin + resident

### Electronic Voting System (added Feb 2026)
- Poll model: `id` (uuid), `title`, `description?`, `endDate` (DateTime), `isAnonymous` (Boolean), `villaId` (Int -> Villa), `creatorId` (String -> User)
- PollOption model: `id` (uuid), `text`, `pollId` (String -> Poll)
- Vote model: `id` (uuid), `pollId`, `optionId`, `voterId` (String -> User), `roomNumber`; unique: `@@unique([pollId, roomNumber])` — enforces 1-house-1-vote at DB level
- POST `/api/villas/:villaId/polls` — body: `{ title, description?, endDate, isAnonymous?, creatorId, options: string[] }`; options >= 2 items; returns poll with options
- GET `/api/villas/:villaId/polls` — includes `options._count.votes`, `options.votes (roomNumber + voterId)`, `_count.votes`; ordered by `createdAt: 'desc'`
- POST `/api/villas/:villaId/polls/:pollId/vote` — body: `{ voterId, optionId }`; 403 if not resident, 404 if no poll, 400 if expired, 409 if already voted (compound key: `pollId_roomNumber`)
- Dashboard ADMIN adds `activePollsCount` = `poll.count({ where: { villaId, endDate: { gt: new Date() } } })`
- Dashboard RESIDENT adds `activePollsCount` = active polls minus polls already voted on (fetches `votedPollIds` first via `vote.findMany`)

## Key Files
- `backend/src/index.ts` — all API routes
- `backend/prisma/schema.prisma` — database schema
- `frontend/src/navigation/AppNavigator.tsx` — all screen registrations
- `frontend/src/navigation/MainTabNavigator.tsx` — admin 4-tab navigator (홈/커뮤니티/관리/프로필)
- `frontend/src/navigation/ResidentTabNavigator.tsx` — resident 3-tab navigator (홈/커뮤니티/프로필)
- `frontend/src/screens/ManagementScreen.tsx` — admin management menu (CreateInvoice, ResidentManagement, Ledger)
- `frontend/src/screens/CommunityTabScreen.tsx` — admin community tab wrapper (loads villaId from API)
- `frontend/src/screens/ResidentCommunityTabScreen.tsx` — resident community tab wrapper (loads villaId from storage)
- `frontend/src/screens/AdminInvoiceScreen.tsx` — admin invoice management with auto-billing
- `frontend/src/screens/BoardScreen.tsx` — community board (FlatList + FAB)
- `frontend/src/screens/CreatePostScreen.tsx` — new post form (KeyboardAwareScrollView pattern)
- `frontend/src/screens/PostDetailScreen.tsx` — post detail view with delete button (SafeAreaView edges top + useSafeAreaInsets bottom)
- `frontend/src/screens/ParkingSearchScreen.tsx` — vehicle search by plate number; receives `{ villaId }` from route.params
- `frontend/src/screens/ProfileScreen.tsx` — now includes vehicle management section (register/list/delete); uses ScrollView wrapper

### Testing (added Feb 2026)
- Test file: `backend/src/api.spec.ts` — Jest + supertest integration tests (no real DB)
- Jest config in `backend/package.json`: `rootDir: "src"`, `testRegex: ".*\\.spec\\.ts$"`, `transform: ts-jest`; tsconfig uses `module: CommonJS` — no extra ts-jest globals needed
- Run tests: `cd /d/villamate/backend && npx jest src/api.spec.ts --no-coverage --forceExit`
- Mock strategy: `jest.mock('@prisma/client', ...)` BEFORE importing app; mock returns a single `mockPrisma` object from `new PrismaClient()`; then `const prisma = new PrismaClient() as any` to get a reference to the same mock instance
- `app` export: `index.ts` exports `app` as a named export; `app.listen()` is wrapped in `if (require.main === module)` so the server does NOT start during tests
- `node-cron` in `index.ts` causes "Jest did not exit" warning — use `--forceExit` flag to suppress; this is cosmetic and does not affect test correctness
- `beforeEach(() => jest.clearAllMocks())` is essential to prevent mock state leaking between tests
