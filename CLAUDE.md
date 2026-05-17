# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Security

**Strictly forbidden:** reading any `.env*` files, **except** `.env.example`.
Do not read, display, or reference the contents of `.env.local`, `.env.production`, `.env.development`, or any other environment file.

## Commands

```bash
pnpm dev       # start dev server (localhost:3000)
pnpm build     # production build
pnpm start     # start production server (port 3000)
pnpm lint      # ESLint check
pnpm server    # expose localhost:3000 via ngrok (for webhook testing)
```

No test suite configured yet.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** — config is CSS-only via `@theme` in `globals.css`, no `tailwind.config.ts`
- **React Compiler** enabled (`reactCompiler: true` in `next.config.ts`) — no manual `useMemo`/`useCallback` needed
- **Supabase** (`@supabase/supabase-js` + `@supabase/ssr`) — orders, products, and auth
- **N-Genius** — payment gateway (UAE, amounts in fils: 1 AED = 100 fils)
- **web-push** — server-side PWA push notifications (VAPID)
- **motion/react** (not `framer-motion`) — animations
- **lucide-react** — supplemental icon library (prefer custom icons in `src/shared/icons/` first)
- **react-toastify** — toast notifications (wrapped in `src/shared/ui/Toast.tsx`, configured in root layout)
- **@react-google-maps/api** — Google Maps for address selection in checkout (`AddressWithMap` component)
- **yet-another-react-lightbox** — fullscreen image viewer with zoom/thumbnails (wrapped in `src/shared/ui/Lightbox.tsx`)
- **@dnd-kit/react** — drag-and-drop for sortable image thumbnails in upload zones
- **react-photo-album** — rows-based image gallery (wrapped in `src/shared/ui/Gallery.tsx`)
- **@blocknote/core + @blocknote/react + @blocknote/mantine** — block-based rich-text editor (Notion-like) used in the admin product form for the `note` field. Loaded lazily via `next/dynamic({ ssr: false })` — never ships in the public bundle.
- **isomorphic-dompurify** — HTML sanitization for rich-text input. Used **only at write time** in admin server actions; render path trusts the DB and skips sanitization (jsdom is heavy on SSR).
- **@next/third-parties** — Google Analytics 4 integration via the official `<GoogleAnalytics>` component + `sendGAEvent` helper. See **Analytics (Google Analytics 4)** for the full event catalog.
- **@tanstack/react-query** v5 — single source of truth for all client-side data fetching that needs polling/refetch behavior (notifications, admin auto-refresh hooks). Set up in [`<ReactQueryProvider>`](src/providers/ReactQueryProvider.tsx) which exports `DEFAULT_STALE_TIME_MS = 30_000` — bump it to retune cadence across the app. **No Supabase Realtime / WebSockets anywhere** — replaced by TQ-managed polling with `refetchOnWindowFocus + refetchOnReconnect`. See **Notifications** and **Shared `useAutoRouterRefresh` hook** for the canonical patterns.
- **@vercel/speed-insights** — Vercel's RUM library, mounted as `<SpeedInsights />` in root layout. Reports Core Web Vitals (LCP/FCP/INP/CLS) per route to the Vercel dashboard once the project is deployed.
- **pnpm** as package manager

## Path alias

`@/*` maps to `src/*` — use `@/shared/ui`, `@/lib/supabase`, `@/providers`, etc.

## Architecture

```
src/
├── app/                        # Next.js App Router routes
│   ├── layout.tsx              # Root layout — wraps with ReactQueryProvider + CartProvider + FavoritesProvider + NotificationsProvider; mounts SpeedInsights + GA + GAEventDispatcher + WhatsAppFloatingButton
│   ├── page.tsx                # Landing page (Hero, Products, Categories)
│   ├── cart/page.tsx           # Shopping cart route
│   ├── checkout/
│   │   ├── page.tsx            # Checkout form (reads customer cookie)
│   │   ├── cancel/page.tsx     # Payment cancelled fallback
│   │   └── result/page.tsx     # Payment result (polls N-Genius, updates DB)
│   ├── (auth)/                 # Auth route group — shared AuthLayout (centered card)
│   │   ├── login/page.tsx      # Email/password + Google OAuth login
│   │   ├── signup/page.tsx     # Registration (name, email, password, confirm)
│   │   ├── verify-email/       # OTP verification after signup
│   │   ├── forgot-password/    # Request password reset email
│   │   └── reset-password/     # OTP + new password form
│   ├── auth/callback/route.ts  # OAuth PKCE code exchange → session cookie → redirect
│   ├── panel/                  # Authenticated panel segment (/panel/*) — layout adds AdminSidebar
│   │   ├── layout.tsx          # Reads user via createSupabaseServerClient(), passes email to sidebar
│   │   ├── page.tsx            # Admin dashboard with statistics (requires admin role)
│   │   ├── profile/page.tsx    # /panel/profile
│   │   ├── favorites/page.tsx  # /panel/favorites
│   │   ├── orders/page.tsx     # /panel/orders
│   │   ├── all-orders/         # /panel/all-orders + /create (admin only)
│   │   ├── partnerships/       # /panel/partnerships (admin only)
│   │   ├── categories/         # /panel/categories CRUD (admin only)
│   │   ├── products/           # /panel/products CRUD (admin only)
│   │   ├── mixes/              # /panel/mixes CRUD — mix constructor (admin only)
│   │   ├── promotions/         # /panel/promotions CRUD (admin only)
│   │   └── users/              # /panel/users — registered users browser (admin only)
│   ├── mix/                    # /mix — public mix builder page
│   ├── api/
│   │   ├── payment/webhook/    # N-Genius webhook → updates order status in Supabase
│   │   ├── notifications/      # GET/PATCH notifications for admin bell
│   │   │   └── resolve/        # GET resolve notification UUID → href (product/category slug)
│   │   ├── push-subscription/  # POST/DELETE push notification subscriptions
│   │   ├── storage/            # upload/delete images to Supabase Storage
│   │   └── options/            # Form options (categories, tags, etc.)
│   └── globals.css, metadata.ts, sitemap.ts, robots.ts, structured-data.ts
│
├── lib/                        # Backend / data-access layer (server-only)
│   ├── supabase.ts             # `createSupabaseBrowserClient()` — browser client for Client Components
│   ├── supabase.server.ts      # `supabase`, `supabaseAdmin`, `createSupabaseServerClient()`
│   ├── ngenius.ts              # N-Genius payment API (auth, create order, poll status)
│   ├── payments.ts             # Orchestrates: create payment → update DB with ngenius_ref
│   ├── orders.ts               # Supabase order creation (orders + order_items tables)
│   ├── favoritesDb.ts          # Favorites CRUD
│   ├── cart.ts                 # localStorage cart helpers
│   ├── cartDb.ts               # Database-backed cart (cart_items table, per-user sync) + clearCartAndCleanup
│   ├── productsDb.ts           # Admin product queries + form options
│   ├── categoriesDb.ts         # Category data queries
│   ├── mixBoxesDb.ts           # Mix boxes + presets queries (admin + public)
│   ├── promotionsDb.ts         # Promotions CRUD
│   ├── notificationsDb.ts      # Notifications CRUD + triggers push via pushNotification.ts
│   ├── pushNotification.ts     # Server-side web-push sending (VAPID, lazy init)
│   ├── storage.ts              # Image + video upload/delete to Supabase Storage (uploadImage / uploadVideo / parseFormImages / parseFormVideo / deleteImage)
│   ├── syncCartPrices.ts       # Syncs cart prices with active promotions
│   ├── deliveryDb.ts           # Per-emirate delivery_settings (incl. cutoff_hour)
│   ├── deliverySlotsDb.ts      # delivery_slots CRUD + cached queries (re-exports getAvailableSlotsForDate / findSlotConflict)
│   ├── deliveryBlackoutsDb.ts  # delivery_blackouts CRUD (date or date+slot)
│   ├── orderNotifications.ts   # buildOrderNotificationParts (structured) + formatOrderNotificationMessage (string)
│   ├── inventoryDb.ts          # product_inventory + stock_movements: getInventoryRows, deductInventoryForOrder, recordStockMovement, getMovements / getAllMovements, upsertInventorySettings, getProductCosts
│   └── usersDb.ts              # getAdminUsers (auth.listUsers + profiles + PAID-order aggregation, React.cache'd) + getRecentUsers(limit)
│
├── proxy.ts                    # Next.js middleware helper — refreshes auth session + protects private routes
│
├── pages_flow/                 # Page-level component trees (co-located with their routes)
│   ├── cart/                   # CartPage + CartGrid + CartItem + CartSummary
│   ├── checkout/               # CheckoutPage + CheckoutForm + OrderSummary + SubmitButton
│   │   └── actions.ts          # Server action: validate → save to DB → create payment → redirect
│   ├── home/                   # CategoriesSection, ProductsSection
│   ├── login/                  # LoginPage + LoginForm + GoogleSignInButton
│   ├── signup/                 # SignupPage + SignupForm
│   ├── verify-email/           # VerifyEmailPage (OTP input)
│   ├── forgot-password/        # ForgotPasswordPage
│   ├── reset-password/         # ResetPasswordPage (OTP + new password)
│   ├── favorites/              # FavoritesPage + FavoritesGrid
│   ├── profile/                # ProfilePage + ProfileForm + ChangePasswordForm + SignOutButton + PushNotificationSection
│   │   └── actions.ts          # updateProfile(), changePassword(), signOut()
│   ├── orders/                 # OrdersPage + OrderCards (user order history) + OrderMixComposition
│   ├── mix/                    # MixBuilderPage + BoxSelector + PresetGrid + PresetTile + MixSummary + actions (assembleMix, cleanupOrphanedMixVariants)
│   ├── panel/
│   │   ├── dashboard/          # ProfitOverview + NeedsAttention + RecentUsers (sections/) + DateRangeSelector + RecentNotifications + profitQueries / profitTypes
│   │   ├── orders/             # AllOrdersPage + AdminOrderCards + filters + useOrdersTable
│   │   ├── partnerships/       # PartnershipsPage + InquiryCards + filters + useInquiriesTable
│   │   ├── categories/         # CategoryForm + actions
│   │   ├── products/           # ProductForm + actions (incl. InventorySection: cost_per_100g + low_stock_threshold_g)
│   │   ├── mixes/              # MixForm + MixesPage + SortableMixGrid + actions (auto system product)
│   │   ├── inventory/          # InventoryPage + Toolbar + Card + columns + Adjust/Settings/History dialogs + useInventoryTable; history/ subroute = full movements log with filters
│   │   ├── promotions/         # PromotionsPage + PromotionForm + actions
│   │   └── users/              # UsersPage + AdminUserCards + UserFilters + UserActions + columns + useFilteredUsers / useUsersTable + userDisplay (shared GenderIcon/formatBirthday)
│   └── PageLoader.tsx          # Thin wrapper around <Loader /> for route loading.tsx files
│
├── providers/                  # React context providers + hooks
│   ├── ReactQueryProvider.tsx  # QueryClient + defaults; exports DEFAULT_STALE_TIME_MS
│   ├── cart/                   # Cart system (decomposed)
│   │   ├── store.ts            # External store + promo persistence (pure functions, 0 React)
│   │   ├── useCartSync.ts      # Load from DB/localStorage + syncPrices
│   │   ├── useCartPromo.ts     # Promo code state, restore, re-validation, apply/remove
│   │   ├── useCartActions.ts   # addToCart, removeFromCart, updateQuantity, clearCart
│   │   └── CartProvider.tsx    # Thin composition of hooks + computed values
│   ├── FavoritesProvider.tsx   # useSyncExternalStore-based favorites state + useOptimistic
│   ├── notifications/          # Notification system (decomposed; TQ-only, no WebSockets)
│   │   ├── NotificationsProvider.tsx  # Thin provider — composes background polling + service worker
│   │   ├── types.ts            # PushState, NotificationsContextValue (public surface)
│   │   ├── filters.ts          # isNotificationForUser, formatNotificationMessage, filterByPermissions, NotificationsListData
│   │   ├── queryKeys.ts        # notificationKeys factory — list / unread / since
│   │   ├── utils.ts            # urlBase64ToUint8Array helper (SW)
│   │   └── hooks/
│   │       ├── useNotificationsBackgroundPolling.ts  # Orchestrator (~50 lines) — composes the sub-hooks below
│   │       ├── useUnreadCountCache.ts                # unreadCount stored in TQ cache (no useState)
│   │       ├── useToastDeduplicator.ts               # tryToast helper — at-most-once per id per session
│   │       ├── useNotificationsSinceQuery.ts         # since-poll query (delta fetcher)
│   │       ├── useApplySinceResults.ts               # Side-effect bridge — toast + list-cache merge + unread update
│   │       ├── useMarkReadMutations.ts               # Mark-single + mark-all mutations with optimistic + rollback
│   │       ├── useNotificationsList.ts               # Consumer hook — useQuery wrapper for full list with select
│   │       └── useServiceWorker.ts                   # SW registration + push subscribe/unsubscribe
│   ├── FilterProvider.tsx      # Generic filter context — useFilterBar(key) + useFilterBarMulti(key)
│   └── SearchParamsFilterProvider.tsx  # Syncs FilterProvider state to URL search params (supports multiKeys)
│
├── sections/                   # Landing-page section components
│   ├── Navbar.tsx, Hero.tsx, PhilosophyBlock.tsx, AboutUs.tsx, PartnershipCTA.tsx, MixCTA.tsx, Footer.tsx
│   ├── partnership/            # actions.ts — submitPartnershipInquiry server action → partnership_inquiries table
│   ├── categories/             # CategoryCard, CategoryGrid, consts, types
│   └── products/               # ProductGrid, ProductItem, consts, mapDbProducts
│       └── types/              # Product & CartItem types + Supabase db-types
│
└── shared/
    ├── consts.ts               # CUSTOMER_COOKIE_KEY, DELIVERY_FEE, COOKIE_CONSENT_KEY, PUSH_OPT_OUT_KEY
    ├── consts/navLinks.ts      # SectionId enum, SECTION_IDS, NAV_LINKS, TAB_LINKS
    ├── hooks/                  # Cross-cutting client hooks
    │   └── useAutoRouterRefresh.ts  # TQ-scheduled router.refresh() with focus/reconnect refetch — used by admin pages instead of Realtime
    ├── ui/                     # Reusable primitives (Button, Badge, Card, Form, Collapsible, etc.)
    ├── icons/                  # SVG icon components + index.ts barrel
    ├── types/                  # Categories enum, CustomerInfo, OrderStatus, ProfileInfo, UserRole
    └── utils/                  # cn.ts, validateCustomer.ts, validatePartnership.ts, validateProfile.ts, validateAuth.ts, validatePhone.ts, calculateDiscount.ts, resolveNotificationHref.ts, zonedTime.ts (Asia/Dubai wall-clock + cut-off helpers), deliverySlots.ts (pure getAvailableSlotsForDate + findSlotConflict resolver), videoUrl.ts (YouTube/MP4 detection, embed URL, getPlayableVideoMime for MOV→mp4 remap)
```

**Rule:** backend/data-access → `src/lib/`, page-level component trees → `src/pages_flow/`, landing sections → `src/sections/`, generic primitives → `src/shared/ui/`, SVG icons → `src/shared/icons/`, React context providers → `src/providers/`.

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/mix` | Mix constructor (public — build your own mix from active boxes) |
| `/cart` | Shopping cart |
| `/checkout` | Checkout form (customer info + order summary) |
| `/checkout/result?ref={orderRef}` | Payment result — polls N-Genius, shows success/failure |
| `/checkout/cancel` | Payment cancelled screen |
| `POST /api/payment/webhook` | N-Genius webhook — updates `orders.status` in Supabase |
| `GET/PATCH /api/notifications` | Notification endpoints (any authenticated user) |
| `GET /api/notifications/resolve` | Resolve notification UUID → href (`?type=new_product&id=uuid`) |
| `POST/DELETE /api/push-subscription` | Manage push notification subscriptions (authenticated) |
| `/login` | Email/password + Google OAuth login |
| `/signup` | Registration (name, email, password) |
| `/verify-email?email={email}` | OTP verification after signup |
| `/forgot-password` | Request password reset email |
| `/reset-password?email={email}` | OTP + new password form |
| `/auth/callback` | OAuth PKCE code exchange → session cookie → redirect |
| `/panel` | Admin dashboard with statistics (admin only) |
| `/panel/profile` | User profile + change password |
| `/panel/favorites` | Saved favourite products |
| `/panel/orders` | Order history |
| `/panel/all-orders` | All orders management (admin only) |
| `/panel/all-orders/create` | Manually create a PAID order (admin only) |
| `/panel/partnerships` | Partnership inquiries (admin only) |
| `/panel/categories` | Category management (admin only) |
| `/panel/categories/create` | Create new category (admin only) |
| `/panel/categories/[id]/edit` | Edit category (admin only) |
| `/panel/products` | Product management (admin only) |
| `/panel/products/create` | Create new product (admin only) |
| `/panel/products/[id]/details` | Product detail view (admin only) |
| `/panel/products/[id]/edit` | Edit product (admin only) |
| `/panel/mixes` | Mix box management — DnD reorder (admin only) |
| `/panel/mixes/create` | Create new mix box (admin only) |
| `/panel/mixes/[id]/edit` | Edit mix box + presets (admin only) |
| `/panel/inventory` | Inventory management — per-product stock, cost & threshold (admin only) |
| `/panel/inventory/history` | Full stock movements history with filters (admin only) |
| `/panel/promotions` | Promotion management (admin only) |
| `/panel/promotions/create` | Create new promotion (admin only) |
| `/panel/promotions/[id]/edit` | Edit promotion (admin only) |
| `/panel/users` | Registered users browser — search/sort/filter, WhatsApp + Create promo code + View orders per row (admin only) |
| `/panel/marketing-popup` | Marketing popups catalog — list with Activate/Edit/Delete (admin only) |
| `/panel/marketing-popup/create` | Create new popup (admin only) |
| `/panel/marketing-popup/[id]/edit` | Edit popup (admin only) |
| `/panel/delivery` | Delivery settings — emirates + slots (CRUD via Dialog) + blackouts (CRUD via Dialog), admin only |

## Panel Section (`panel` route segment)

All panel routes live under `/panel` and share an authenticated layout:
- `AdminLayout` — server component, reads user via `createSupabaseServerClient()`, passes `email` to `AdminSidebar`
- `AdminSidebar` — responsive: horizontal on mobile, sticky vertical on desktop; contains `AdminNav` + sign-out button
- `AdminNav` — client component with route-aware active underline
- `AdminPageHeader` — reusable header with configurable `label` prop (default "My Account", use "Admin Panel" for admin pages) + dynamic `title` prop + optional `actions` slot (right-aligned)

**Protected routes:** `src/proxy.ts` guards all `/panel/*` routes — unauthenticated users are redirected to `/login?next={pathname}`. User routes (`/panel/profile`, `/panel/favorites`, `/panel/orders`) are whitelisted for any authenticated user; all other `/panel/*` routes require `role=admin`.

## Favorites

- `FavoritesProvider` (`src/providers/FavoritesProvider.tsx`) — same `useSyncExternalStore` + listener pattern as `CartProvider`; uses `useOptimistic` for instant toggle feedback
- `useFavorites()` exposes `toggleFavorite(id)`, `isFavorite(id)`, `isHydrated`
- DB layer: `src/lib/favoritesDb.ts` — `getFavoritesFromDb()`, `addFavoriteToDb()`, `removeFavoriteFromDb()`
- DB table: `user_favorites` (user_id, product_id)

## Loading pattern

Pages use **Suspense + Skeleton** instead of `loading.tsx`. Each page wraps async server components in `<Suspense fallback={<SomeSkeleton />}>`. Skeleton components live in `src/shared/ui/Skeleton.tsx`: `Skeleton`, `SkeletonCard`, `SkeletonGrid`, `SkeletonProductGrid`, `SkeletonSection`. Page-specific skeletons (e.g. `CartSkeleton`, `ProfileSkeleton`, `OrdersSkeleton`) are defined inline in the page file or co-located.

**Do NOT create `loading.tsx` files** — they override Suspense fallbacks. Use inline `<Suspense>` with custom skeleton components instead.

`PageLoader` (`src/pages_flow/PageLoader.tsx`) is only used for auth route `loading.tsx` files.

## E-commerce & Payment Flow

**Checkout server action** (`src/pages_flow/checkout/actions.ts`) — phased pipeline (see **Delivery schedule → Server-side revalidation in `submitCheckout`** for the full breakdown). All step helpers extracted to [checkoutSteps.ts](src/pages_flow/checkout/checkoutSteps.ts) so `submitCheckout` reads as a linear sequence of `Promise.all` phases. Headline:
1. Phase 1 (parallel): auth + active slots + emirate setting + mix composition map. `persistCustomerCookie` is fire-and-forget.
2. Validate customer + delivery date/slot (date+slot required only when admin configured at least one slot).
3. Phase 3 (parallel): re-apply promo code + re-validate the (date, slot) pair against current `delivery_slots`/`delivery_blackouts`/`cutoff_hour`.
4. Compute totals + delivery fee (`evaluateDeliveryFee` is pure, reuses fetched setting).
5. Build `OrderItemRow[]` via `buildMixCompositionMap` + `cartItemToOrderRow`.
6. `createOrderWithItems({ ..., deliverySchedule })` — one insert, no hidden lookups.
7. Call N-Genius, persist `ngenius_ref`, redirect to hosted page.

**`createOrderWithItems` contract** ([src/lib/orders.ts](src/lib/orders.ts)): accepts `items: OrderItemRow[]` (a pre-built shape matching `order_items` columns — `variant_id`, `name`, `price`, `original_price`, `promo_discount`, `quantity`, `weight_g`, `mix_composition`) plus optional `deliverySchedule: string | null`. Callers assemble rows themselves — checkout via `cartItemToOrderRow(+buildMixCompositionMap)`, manual admin orders by constructing rows directly with inline `mix_composition`. The function itself only inserts; it does **not** run a DB join to resolve mix composition.

**Defensive variant existence check.** Before inserting the `orders` row, `createOrderWithItems` calls [`findMissingVariantIds`](src/lib/validateOrderVariants.ts) — a single batched SELECT against `product_variants` for the non-null `variant_id`s in the row set. If anything is missing, it returns a friendly `"Some items in your cart are no longer available. Please refresh the page and try again."` error instead of letting the FK constraint blow up later. Avoids the create-then-rollback-on-FK-fail dance and gives the user a sensible toast. Common trigger: race between the cart `syncCartPrices` self-heal and an admin edit that removed a variant after the cart was last loaded.

**Result page** (`src/app/checkout/result/page.tsx`):
- Server component — polls N-Genius directly for final status
- Updates `orders.status` → `PAID` or `FAILED` (idempotent via `.neq("status", newStatus)`)
- On `PAID`: records promo code redemption, calls `clearCartAndCleanup(supabaseAdmin, user_id)` for auth users (wipes `cart_items` + cleans up orphan mix-variants from cart), and additionally calls `cleanupOrphanedMixVariants` with `variant_id`s from this order's `order_items` — this covers guest flow where `user_id` is NULL
- For guests: renders an inline `<script>` that synchronously wipes `honesta_cart` + `honesta_promo_code` from `localStorage` **before** `CartProvider` mounts and reads it
- Renders `<ClearCartOnSuccess>` (client component) to flush the in-memory `CartProvider._items` store after a navigation hit
- Renders [`<ResultToast>`](src/app/checkout/result/ResultToast.tsx) — fires a structured multi-line JSX toast on mount using `{ title, parts }` returned by `settleOrder` (the admin realtime path can only render plain text via `formatNotificationMessage`). Double-fire defence: a `fired.current` ref inside the component's `useEffect` short-circuits a second invocation within the same mount, and on subsequent visits/refreshes `settleOrder` returns `null` (idempotent via `.neq("status", newStatus)`), so `title`/`parts` arrive as `null` and the effect's guard `!title || !parts` skips the toast. The same component is reused on `/checkout/cancel` (with `success={false}`).

**Manual admin orders** (`src/app/panel/all-orders/create/page.tsx` + `src/pages_flow/panel/orders/manual-order/`):
- Form decomposed into per-block sections under [sections/](src/pages_flow/panel/orders/manual-order/sections/) (CustomerInfoSection, DeliveryAddressSection, DeliveryScheduleSection, ProductsSection, MixesSection, NotesSection, OrderSummarySection, ManualOrderFooter — all wrapped by a shared `ManualOrderSection` card). Logic split into [`useDeliverySchedule`](src/pages_flow/panel/orders/manual-order/useDeliverySchedule.ts) (date+slot state with weekday filter) and [`buildManualOrderTotals`](src/pages_flow/panel/orders/manual-order/totals.ts) (pure subtotal/discount/delivery/total calculation). `ManualOrderForm` itself is now ~110 lines of linear orchestration.
- Admin date picker has **no `minDate`/`maxDate`** — past dates are intentionally allowed for back-filling historical orders; cut-off and blackouts are also bypassed.
- `createManualOrderAction` ([src/pages_flow/panel/orders/manual-order/actions.ts](src/pages_flow/panel/orders/manual-order/actions.ts)) — re-checks `profiles.role='admin'` (defence-in-depth, on top of `proxy.ts`), loads authoritative variant prices + promotions, loads boxes+presets in one query, builds `OrderItemRow[]` directly (inline `mix_composition` for mixes, `variant_id=NULL` for them), inserts with `status=OrderStatus.PAID` and `delivery_schedule` from a hidden field composed client-side.
- **No N-Genius, no push notification, no cart cleanup** — admin marks a PAID order that already happened off-site (WhatsApp/Instagram/phone).
- **No `product_variants` / `mix_variant_cells` writes** — the manual flow deliberately bypasses `assembleMixAction` to avoid polluting the DB with single-use mix variants. Composition lives only in `order_items.mix_composition`.
- `revalidatePath("/panel/all-orders")` + `revalidatePath("/panel")` on success so dashboard stats refresh.

**Webhook** (`src/app/api/payment/webhook/route.ts`):
- Receives N-Genius events; maps states (PURCHASED/CAPTURED → PAID, FAILED/REVERSED → FAILED/CANCELLED)
- Validates via `NGENIUS_WEBHOOK_SECRET` header
- On `PAID`: all side-effects run in a single `Promise.all` block — `deductInventoryForOrder` (writes `stock_movements` + UPSERTs `product_inventory.stock_g`), `recordPromoCodeRedemption` (if a code was used), `clearCartAndCleanup` (auth users), `cleanupOrphanedMixVariants` (variant_ids from `order_items`), and `createNotification("order_paid")`. Same parallel block lives in `settleOrder` on the result page; manual admin order action also fires `deductInventoryForOrder` next to its `revalidatePath` calls.
- Both webhook and result-page paths are idempotent — only the **first** transition into `PAID` runs side effects, because the `UPDATE … neq("status", newStatus)` returns no row otherwise. Combined with `UNIQUE(order_id)` on `promo_code_redemptions` and `UNIQUE(order_id, product_id)` on `stock_movements`, double-redemptions and double-deductions are impossible.

## Cart System

- **Identity:** Cart items are keyed by `variantId` (product_variants.id), not product_id. Same product with different variants = separate cart entries.
- **Storage:** localStorage under key `"honesta_cart"`, DB table `cart_items` stores only `(user_id, variant_id, quantity)` — prices computed via join
- **Provider:** `CartProvider` uses `useSyncExternalStore` — no Zustand/Redux
- **Hydration:** `isHydrated` flag prevents SSR/client mismatch; server always renders empty cart. Guests hydrate via `useLayoutEffect` (synchronous, before paint) so the navbar counter shows the correct number on the first frame — there's no SSR data for a localStorage-backed cart, and waiting for the async price-sync would leave `0` flashing. Auth users use `useEffect` that resets the store first (skeleton until DB load).
- **Hook:** `useCart()` exposes `items`, `itemCount`, `subtotal`, `total`, `appliedPromoCode`, `promoDiscount`, `addToCart(item)`, `removeFromCart(variantId)`, `updateItemQuantity(variantId, qty)`, `clearCart`, `applyPromoCode(code)`, `removePromoCode()`, `isHydrated`
- **CartItem type:** `{ variantId, productId, slug?, name, price, originalPrice?, promotionEndsAt?, quantity, image_url?, weight_g, isMix?, mixItems? }`. `isMix=true` + `mixItems[]` (snapshot `{ name, image_url, count, weight_g, price }[]`) identify assembled mix boxes — set by `assembleMixAction` (and rebuilt on auth-user cart hydration via `mix_variant_cells` join in `getCartFromDb`).
- **Price sync + self-heal:** `syncCartPrices` queries products with variants + promotions, recalculates prices, **and drops items whose product or variant no longer exists** (admin removed/replaced). Returns `{ items, changed }`. When `changed === true` for guest users, the result is also written back to localStorage via `saveCart(synced)` — otherwise stale items would resurface on the next page reload. `originalPrice` is computed from promotions on the fly, never stored in DB.
- **Re-add dedup ([findMatchingIndex](src/lib/cart.ts)):** `addToCart` matches by `variantId` first, and for non-mix items falls back to `(productId, weight_g)`. This catches the case where the cart has a stale `variantId` snapshot from a previous render (admin re-saved the product before the diff-based `syncVariants` was deployed, or genuinely deleted+recreated a variant) — the fresh add silently replaces the stale entry instead of producing two cart lines for the same logical variant. Mixes are skipped because each assembled mix has a genuinely unique `variant_id` by design.
- **DB cart (`cartDb.ts`):** `getCartFromDb` does a join: `cart_items → product_variants → products` (with promotions) to build full CartItem objects. `upsertItemInDb` stores only `(user_id, variant_id, quantity)`. `cart_items.variant_id` FK is `ON DELETE CASCADE` and `(user_id, variant_id)` is `UNIQUE`, so for auth users the DB self-cleans when an admin deletes a variant — the in-memory store catches up on the next refresh.
- **Totals utility:** [src/lib/cart.ts](src/lib/cart.ts) `getCartTotals(items, promoDiscount)` is the single source of truth for `originalSubtotal` (sum of `originalPrice ?? price`), `subtotal` (after product promotions, before promo code), `promotionDiscount` (`originalSubtotal − subtotal`), and `total` (`subtotal − promoDiscount`). **Don't duplicate `items.reduce` for totals in components — call this helper.** It's used by `CartSummary`, `OrderSummary`, and `submitCheckout`.
- **Cart/Order summary delivery info.** `CartSummary` (`/cart`) does **not** show delivery days or free-delivery threshold — the address isn't picked yet. `OrderSummary` (`/checkout`) keeps only the conditional free-threshold note (`Free in {emirate} from AED {n}`) because emirate is selected here; delivery days hint was retired in favour of the explicit date+slot picker.
- **Color semantics for prices:** **moss** = promo code discount, **orange** = product promotion, **earth** = no discount. Apply this priority order when rendering line totals (promo > promotion > regular).

## Promo codes

Manual codes a user enters in the cart/checkout to get an extra discount, parallel to the auto-applied `promotions` system.

**Tables:** `promo_codes` (`code text unique`, `scope`, `discount_type`, `discount_value`, `min_order_amount`, `max_uses`, `max_uses_per_user`, `stack_with_promotions`, `starts_at`, `ends_at`, `is_active`), `promo_code_products` (m2m for product-scope codes), `promo_code_users` (empty = available to all signed-in users; non-empty = personal targeting), `promo_code_redemptions` (one row per paid order, `unique(order_id)` enforces idempotency). Codes are 3–24 characters from `[A-Z0-9%_-]` enforced by a CHECK constraint (`promo_codes_code_format`, see `promo_codes_format_migration.sql`). Auto-uppercased and stripped of disallowed chars on input in both [`PromoCodeForm`](src/pages_flow/panel/promo-codes/PromoCodeForm.tsx) and [`PromoCodeInput`](src/pages_flow/cart/ui/PromoCodeInput.tsx). Length / format constants live in [src/shared/utils/promoCode.ts](src/shared/utils/promoCode.ts) (`PROMO_CODE_MIN_LENGTH`, `PROMO_CODE_MAX_LENGTH`, `PROMO_CODE_REGEX`). The auto-generator (`generatePromoCode`) still emits 6 chars from a confusable-safe alphabet. `ends_at` is nullable (NULL = unlimited / no expiry); the `getPromoCodeStatus` helper and `validatePromoCode` both skip the expiry check when `ends_at` is null. See `promo_codes_ends_at_nullable_migration.sql`.

**Order columns:** `orders.promo_code_id`, `orders.promo_discount`. Per-item snapshot in `order_items.promo_discount` (per unit).

**Authenticated-only.** Promo codes are completely hidden for guests. The `PromoCodeInput` component shows a "Sign in" CTA when `isAuthenticated=false`. All server actions reject calls without `user.id` via `validatePromoCode`.

**Stacking with product promotions.** Each code has a `stack_with_promotions` flag:
- `false` (default) = items already on a product promotion are **excluded** from the promo code's eligible subtotal
- `true` = the code applies on top of the already-discounted price (`item.price`, not `originalPrice`), giving a double discount

**Discount calculation lives in two places — both must stay in sync:**
- Server: [src/lib/promoCodeApply.ts](src/lib/promoCodeApply.ts) `validatePromoCode({ code, items, userId })` runs status, targeting, min order, usage limits, and computes the final discount. Used by `applyPromoCodeAction` and re-run inside `submitCheckout`.
- Client: [src/shared/utils/recalculatePromoDiscount.ts](src/shared/utils/recalculatePromoDiscount.ts) — `recalculatePromoDiscount(items, code)` (used by `CartProvider` to derive `promoDiscount` synchronously on every render so quantity changes update the UI instantly without waiting for the server roundtrip), and `getPerItemPromoDiscounts(items, code)` returns a `Map<variantId, discountPerUnit>` for line-item rendering and for persisting per-item snapshots in `order_items.promo_discount`.

**CartProvider re-validation loop.** Whenever `items` change, an effect re-fires `applyPromoCodeAction` to invalidate the code if limits/eligibility broke, **and** to refresh the cached `appliedPromoCode` from the authoritative server response. This is critical: without the refresh, stale fields restored from `localStorage` (e.g. an old `stackWithPromotions` flag after the admin edited the code) keep producing the wrong discount until the user manually re-applies.

**Redemption recording.** `recordPromoCodeRedemption` is called from both the result-page server component **and** the webhook on the first transition into `PAID`. The `unique(order_id)` constraint and the idempotent `UPDATE … neq("status", PAID)` together guarantee exactly one redemption per paid order, regardless of which path runs first.

**RLS.** All four `promo_code*` tables have RLS enabled with admin-only policies. Server actions go through `supabaseAdmin` (service_role bypasses RLS), so regular users never touch these tables directly from the browser. See `src/lib/promoCodesDb.ts` — every query uses `supabaseAdmin`.

**Admin UI.** `/panel/promo-codes` — CRUD by analogy with `/panel/promotions`. The `PromoCodeForm` uses `FormTileRadio` for scope, `FormNumberInput` for all numeric fields, `ProductPicker` (reused from promotions, only when `scope=product`), and `UserPicker` (loads users via `supabaseAdmin.auth.admin.listUsers` joined with `profiles` for name/gender/birthday). The list page shows a status badge: `active | scheduled | exhausted | expired` — `exhausted` (orange) appears when `used_count >= max_uses`. The status helper `getPromoCodeStatus(isActive, startsAt, endsAt, usedCount, maxUses)` is in [src/pages_flow/panel/promo-codes/types.ts](src/pages_flow/panel/promo-codes/types.ts).

**`/panel/promo-codes/create?user={uuid}` prefill.** The create route accepts a `?user=<uuid>` query param ([src/app/panel/promo-codes/create/page.tsx](src/app/panel/promo-codes/create/page.tsx)). When present and the UUID matches a known user, it's threaded down as `prefilledUserIds={[uuid]}` into `PromoCodeForm`, which falls back to it as the default for `<UserPicker>` when no existing `promoCode.user_ids` is present. This is the one-click flow used by `/panel/users` and the dashboard `Recent users` section to issue a targeted promo without manually searching for the recipient.

## Rich text (product notes)

The product `note` field supports rich-text formatting (bold, italic, underline, strikethrough, bullet/numbered lists, links, text/background color). Stored as **HTML string** in `products.note` (the column is still `text`).

### Pieces

- **[`FormRichTextarea`](src/shared/ui/Form/FormRichTextarea.tsx)** — admin form input. Lazy-loads [`BlockNoteEditor`](src/shared/ui/Form/BlockNoteEditor.tsx) via `next/dynamic({ ssr: false })`, holds the current HTML in local state, mirrors it into a hidden `<input name>` so it lands in `FormData`. Re-syncs internal HTML when the parent passes a new `defaultValue` (in-render setState pattern, see **Form state sync with server actions**) and remounts the BlockNote editor via `key={defaultValue}` since BlockNote only reads `initialHtml` at mount. Wrapper styling matches `FormTextarea` (border, focus-within, error state) — outer wrapper is `bg-cream`; BlockNote-internal background is overridden to transparent so the wrapper colour shows through.
- **[`BlockNoteEditor`](src/shared/ui/Form/BlockNoteEditor.tsx)** — internal client component, separated so `next/dynamic` can keep it out of the SSR bundle. Schema is restricted to `paragraph`, `bulletListItem`, `numberedListItem` via `BlockNoteSchema.create({ blockSpecs: { ... } })` (no headings, code blocks, tables, images). Slash menu is filtered to those three via `filterSuggestionItems` + `getDefaultReactSlashMenuItems`. Imports `@blocknote/core/fonts/inter.css` + `@blocknote/mantine/style.css`. **API note:** in BlockNote 0.49, `editor.tryParseHTMLToBlocks(html)` and `editor.blocksToHTMLLossy(blocks)` are **synchronous** — earlier versions returned promises.
- **[`RichText`](src/shared/ui/RichText.tsx)** — render-side component used in `NoteButton` (tooltip) and `ProductNote` (blockquote, with truncate variant). Wraps `dangerouslySetInnerHTML` in `<div class="rich-text">`. **Does not sanitize on render** — see security note below.
- **[`sanitizeNoteHtml`](src/shared/utils/sanitizeHtml.ts)** + **`isHtmlEmpty`** — `isomorphic-dompurify`-backed helpers. `sanitizeNoteHtml` whitelist: tags `p, br, span, strong, em, u, s, ol, ul, li, a`; attributes `href, target, rel, style, data-text-color, data-background-color, data-text-alignment`. `isHtmlEmpty` strips tags/`&nbsp;` and trims to detect "looks empty" content (BlockNote often emits `<p></p>` for a blank document).

### Save flow

[`actions.ts`](src/pages_flow/panel/products/actions.ts) `parseProductValues`:

```ts
note: isHtmlEmpty(values.note) ? null : sanitizeNoteHtml(values.note ?? ""),
```

Empty editor → `null`; otherwise sanitized HTML is stored. `note` is **not** validated as a required field — there's no `fieldErrors.note` slot in `ProductState`.

### Render flow

`ProductNote` and `NoteButton` both render `<RichText html={note} />`. The blockquote and tooltip wrappers do **not** apply `italic` — italic is only on text the admin explicitly italicized in the editor.

**Important:** `RichText` does NOT call `sanitizeNoteHtml` on the render path. Sanitization happens once at write time; the render path trusts the DB to keep SSR fast (`isomorphic-dompurify` ships jsdom, which is heavy on every request × every product card on a list page). If raw HTML ever needs to be displayed from an untrusted source, sanitize at the call site, not inside `RichText`.

### Styling (`.rich-text` in [globals.css](src/app/globals.css))

- Resets paragraph margins, restores list bullets/numbers (`list-style: revert`), keeps `strong`/`em` semantics.
- `<a>` styling — `color: var(--color-orange)` + `text-decoration: underline` — applies in **both** the render output (`.rich-text a`) and the editor (`.rich-text-editor a`) so links look consistent. The rule is placed **before** the `[data-text-color="..."]` block so an explicit colour override in the editor still wins by cascade order at equal specificity. Inline `style="color: ..."` (BlockNote's lossy export format) overrides everything via specificity.
- BlockNote light-mode colour tokens are mapped to CSS rules: `.rich-text [data-text-color="red"] { color: #e03e3e }` etc. for all 9 named colours and matching backgrounds. Kept defensively even though `blocksToHTMLLossy` actually emits inline `style="color: #hex"` — if BlockNote changes export format, data-attrs still work.
- BlockNote editor brand overrides — transparent background, `font-body`, padding `0.625rem 1rem` to match other form fields.
- Placeholder uses `placeholders.emptyDocument` (not `default`) — BlockNote inserts a runtime CSS rule that targets `[data-is-only-empty-block]:after`, so the placeholder shows **only when the entire document is empty** (one empty block), not on every empty line as the user types.

### Stored format

`blocksToHTMLLossy` is the lossy/external format — colours come back as inline `style="color: #hex; background-color: #hex"` (not `data-text-color` attributes), which is why `style` is in the DOMPurify whitelist. `blocksToFullHTML` would preserve more BlockNote-internal markup but is far more verbose; we deliberately use lossy for portable HTML.

## Marketing Popup

Catalog of home-page popups for holiday greetings and exclusive-offer announcements. Multi-row CRUD at `/panel/marketing-popup` (list / create / edit / delete) — admin keeps a library of pre-built popups (NY, 8 March, Black Friday) and toggles activation with a single click. The home page (`/`) renders the **single active** popup if any.

### Data model

Multi-row table `marketing_popup`. Columns: `id` (uuid, default `gen_random_uuid()`), `is_active`, `title` (visitor-facing heading, also doubles as admin catalog label — required), `body` (sanitized HTML, written by BlockNote), `image_url`, `cta_label`, `cta_url`, `starts_at` / `ends_at` (nullable timestamptz — optional display window, NULL on either side = unbounded), `created_at`, `updated_at` (auto-bumped by a `BEFORE UPDATE` trigger that just touches `now()`). Mutual-exclusion enforced at the DB level by **partial unique index `marketing_popup_one_active ON ((is_active)) WHERE is_active = true`** — at most one row may be active at any time. Storage bucket `marketing` (public read, admin write/delete) — added to `ALLOWED_BUCKETS` in [src/lib/storage.ts](src/lib/storage.ts).

### Re-show strategy

Per-session, not per-version. The client component ([src/sections/marketing/MarketingPopupDialog.tsx](src/sections/marketing/MarketingPopupDialog.tsx)) keeps a set of seen popup ids in `sessionStorage.honesta_popup_seen_session` — JSON array of strings. Show iff `popup.id` is not in the set, then on close add the id to the set. F5 in the same tab won't re-show; opening a new tab starts a fresh session and re-shows. Switching the active popup gives every visitor a fresh `id` → it shows up regardless of what they had dismissed earlier.

### Render flow

[src/app/page.tsx](src/app/page.tsx) parallelises `getActiveMarketingPopup()` with the existing `Promise.all`. Conditional mount uses [`isMarketingPopupActive(popup)`](src/lib/marketingPopupDb.ts) — checks `is_active` + non-empty title + `starts_at <= now() < ends_at` (skipping any NULL bound). When no active popup or out of window, **nothing is rendered** — zero DOM, zero JS. The dialog imports the `Dialog` compound from `@/shared/ui` and renders `<RichText html={body} />` for the body so BlockNote stays out of the public bundle.

### Admin catalog UI

`/panel/marketing-popup` lists all popups as cards sorted by status (`active → scheduled → inactive → expired`). Each card shows `title` (heading, falls back to "(untitled)" if missing), status badge, optional date range, and three action buttons:
- **Edit** → `/panel/marketing-popup/[id]/edit`
- **Activate / Deactivate** → calls `activateMarketingPopupAction` / `deactivateMarketingPopupAction` (no confirmation)
- **Delete** → confirmation Dialog → `deleteMarketingPopupAction`

### Activation logic

[`setMarketingPopupActive(id, true)`](src/lib/marketingPopupDb.ts) does **deactivate-all-others-then-activate-this** in two queries: first `UPDATE marketing_popup SET is_active=false WHERE is_active=true AND id != $1`, then `UPDATE marketing_popup SET is_active=true WHERE id=$1`. Brief window between updates where nothing is active is harmless (home page is server-rendered and revalidated). `createMarketingPopup` and `updateMarketingPopup` apply the same deactivate-others step when the new row is being saved with `is_active=true`.

### Status helper

[`getMarketingPopupStatus(isActive, startsAt, endsAt)`](src/pages_flow/panel/marketing-popup/types.ts) → `"active" | "scheduled" | "expired" | "inactive"`. Same shape as `getPromotionStatus` but with extra `inactive` state for `is_active=false` rows that aren't expired.

### Form (create + edit)

[`MarketingPopupForm`](src/pages_flow/panel/marketing-popup/MarketingPopupForm.tsx) accepts `popup: MarketingPopup | null`. `null` → create mode (uses `createMarketingPopupAction`); existing row → edit mode (uses `updateMarketingPopupAction.bind(null, popup.id)`). Fields: `title` (required — used both as visitor heading and as admin catalog label), `is_active`, `body` (FormRichTextarea), `image_url` (FormUploadZone, `bucket="marketing"`), `cta_label` + `cta_url`, `starts_at` + `ends_at` (FormDatePicker pair, both `clearable`).

### Action contracts

All in [src/pages_flow/panel/marketing-popup/actions.ts](src/pages_flow/panel/marketing-popup/actions.ts):
- `createMarketingPopupAction(_prevState, formData)` → INSERT, redirect to list with `?toast=created`
- `updateMarketingPopupAction(id, _prevState, formData)` → UPDATE, redirect with `?toast=updated`
- `deleteMarketingPopupAction(id)` → DELETE + cleanup of image from bucket
- `activateMarketingPopupAction(id)` / `deactivateMarketingPopupAction(id)` → flip `is_active` without touching content
All sanitize body via `sanitizeNoteHtml`, validate dates, validate CTA URL (absolute `http(s)://` or relative `/...`), revalidate `/` + `/panel/marketing-popup`.

### No notification on save

The popup itself is the broadcast channel — sending a parallel push/in-app notification on save would double-deliver. `notificationsDb` stays reserved for product/promotion/order events.

## Mix Constructor

Customers can build their own mix boxes: pick a box template (e.g. "Classic 9-cell"), fill each cell with a product from the box's assortment at admin-configured weight/price, then add the assembled mix to cart as a normal product.

### Data model

- **`mix_boxes`** — box templates. `id` is **the same UUID** as the corresponding `products.id`. When admin creates a box, `createMixAction` (in [src/pages_flow/panel/mixes/actions.ts](src/pages_flow/panel/mixes/actions.ts)) first inserts into `products` with `status='system'` using a generated UUID, then inserts into `mix_boxes` with the **same** `id`. This lets us reuse the existing `product_variants` → `products` foreign key path without extra join columns.
- **`mix_box_presets`** — for a given box, the assortment: `{product_id, weight_g, price}` per cell. `UNIQUE(box_id, product_id)` means each product appears at most once per box (with a fixed weight/price). Different boxes can have different weight/price for the same product.
- **`mix_variant_cells`** — per-assembled-variant record of which preset is in which cell (`cell_index`). Created by `assembleMixAction` ([src/pages_flow/mix/actions.ts](src/pages_flow/mix/actions.ts)) when a customer clicks "Add to cart".
- **`products.status = 'system'`** — reserved status for system products auto-created for each mix box. Hidden from all public and admin product queries (e.g. `getAdminProducts` uses `.neq("status", "system")`).
- **`order_items.mix_composition`** JSONB — snapshot of `{name, image_url, count, weight_g, price}[]` for each mix item at order time. Two assembly paths: **cart/checkout flow** — populated by `buildMixCompositionMap` in [src/lib/orders.ts](src/lib/orders.ts) by reading `mix_variant_cells` (authoritative source, since the cart already persisted a variant). **Manual admin flow** — built inline from `mix_box_presets` right in the server action and written directly; `order_items.variant_id = NULL` for these rows (no `product_variants` / `mix_variant_cells` records are created). Both paths produce the same JSONB shape, and `ON DELETE SET NULL` on `variant_id` preserves historical order views regardless.

### Admin flow (`/panel/mixes`)

- List page with DnD reorder (`SortableMixGrid`, pattern from `SortableCategoryGrid`) — drag handle on hover, `reorderMixesAction` batches `sort_order` updates + `revalidatePath`.
- `MixForm` (CRUD) has two sections: `BasicInfoSection` (name auto-generates slug server-side, description, image via `FormUploadZone` slug="mix" bucket="mixes", cell_count `FormNumberInput`, `is_active` checkbox) and `PresetsSection` (dynamic rows: product `Select` with `searchable`, weight `FormNumberInput`, price `FormNumberInput`, trash button — per-field `FormError` under each input). On mobile Product row and trash are stacked; Weight+Price in a 2-col grid below. **Stock indicator under the selected product** — `MixProductOption` is enriched with `stock_g` + `low_stock_threshold_g` (joined via `product_inventory` in `getMixFormOptions`), and `PresetsSection` renders `{stock_g}g in stock` underneath the picked product, coloured **red** when `stock_g === 0` (with a `Cannot be sold` hint), **orange** when below threshold, muted when healthy.
- `createMixAction` creates system product first (same UUID), then `mix_boxes`, then presets — rolls back on any step failure.
- `updateMixAction` syncs the system product's title/slug/image on name change; delete cascades via FK.

### Public flow (`/mix`)

- [MixCTA](src/sections/MixCTA.tsx) on home page (`SectionId.Mix`) links to `/mix`. When no active boxes exist, CTA shows "Mixes coming soon" placeholder instead of the button (server reads `getActiveMixBoxes()` in `page.tsx` and passes `hasActiveBoxes` prop).
- [`/mix` page](src/app/mix/page.tsx) shows `EmptyState` if no boxes, else renders `MixBuilderPage` inside `<SearchParamsFilterProvider keys={["box", "preset"]} multiKeys={["preset"]}>` — **note:** `preset` must be listed in **both** `keys` and `multiKeys`. State lives in URL: `?box=<id>&preset=<id>&preset=<id>...` — selected presets repeat for multi-cell selections.
- `MixBuilderPage` reads `useFilterBar("box")` + `useFilterBarMulti("preset")`. Layout: `BoxSelector` (grid of boxes, orange outline when selected) → `Collapsible` (opens when box selected) containing `PresetGrid` (grid of presets, `PresetTile` shows image + counter pill in corner + `+/-` buttons) → `Add to cart` button disabled until `totalCells === cell_count`.
- On "Add to cart": `assembleMixAction(boxId, selections)` validates, inserts new `product_variants(product_id=boxId, weight_g=Σ, price=Σ)` + bulk-inserts `mix_variant_cells` → returns `CartItem` with `isMix: true` and `mixItems: [...]`. Client calls `addToCart(cartItem)` which syncs to cart/localStorage.
- `MixSummary` — shown always on `/mix` (with skeleton while `!isHydrated`), lists mix items currently in cart with +/- controls, "Clear all" (removes all mix items), and "View cart" link. Composition displayed as `Collapsible` with trigger "COMPOSITION · N ITEMS" and `Badge variant="outline" size="xs"` chips with orange counter pills.

### Orphan variant cleanup

Because each "Add to cart" creates a new `product_variants` row + cells, the DB would grow unbounded if not cleaned up. Strategy: **no dedup, delete immediately when no longer needed**.

- [`cleanupOrphanedMixVariants(variantIds)`](src/pages_flow/mix/actions.ts) — server action. Filters input to only `products.status = 'system'` variants, then bulk DELETEs. `mix_variant_cells` CASCADEs; `order_items.variant_id` becomes NULL via `ON DELETE SET NULL` (snapshot in `mix_composition` preserves the order view).
- Triggered from multiple spots:
  - `useCartActions.removeFromCart`, `updateItemQuantity(qty≤0)`, `clearCart` — fire-and-forget `void cleanupOrphanedMixVariants(...)`. Works for auth and guest.
  - [`clearCartAndCleanup`](src/lib/cartDb.ts) — helper used after successful payment for auth users; selects variant_ids from `cart_items`, deletes, then cleans up.
  - `result/page.tsx` + webhook — additionally call `cleanupOrphanedMixVariants` on `order_items.variant_id` of the paid order. This covers **guest checkout** (no `user_id`, so `clearCartAndCleanup` is skipped).
- **FAILED orders**: variants are **kept** — user may retry payment with the same composition still in their cart.

### Mix composition rendering (shared)

Single source of truth: [`MixCompositionList`](src/shared/ui/MixCompositionList.tsx) from `@/shared/ui`. Renders a `Collapsible` with trigger `Composition · N items` and a list of rows `[36px thumbnail with ×count pill] · name / total weight · total price`. Accepts any items matching `MixCompositionItem` (`name`, `image_url?`, `count`, `weight_g`, `price`) — compatible with both `CartItem.mixItems` and `order_items.mix_composition` (`MixCompositionEntry`).

Props:
- `triggerLabel?: string` — override default label (e.g. `Presets · ${n}` for admin mix cards).
- `showCountBadge?: boolean` (default `true`) — hide the `×N` pill when listing presets (where count is always 1).

Used in:
- [`OrderCards`](src/pages_flow/orders/ui/OrderCards.tsx), [`AdminOrderCards`](src/pages_flow/panel/orders/AdminOrderCards.tsx), [`columns.tsx`](src/pages_flow/orders/columns.tsx) itemsColumn (both user `/panel/orders` + admin `/panel/all-orders`, cards + desktop table).
- [`CartItem`](src/pages_flow/cart/ui/CartItem.tsx) — mini-mix row in cart.
- [`MixSummary`](src/pages_flow/mix/MixSummary.tsx) — `/mix` constructor right column.
- [`OrderSummary`](src/pages_flow/checkout/ui/OrderSummary.tsx) — `/checkout` right column for `isMix=true` lines.
- [`MixCard`](src/pages_flow/panel/mixes/MixCard.tsx) — admin mix card (lists available presets with per-cell weight/price, `showCountBadge={false}`, custom triggerLabel).

**Stop-propagation trick:** The internal `CollapsibleTrigger` has `onClick={stop}` (stopPropagation + preventDefault) to prevent the parent card/row click handler from firing when the user opens the composition.

**Layout note:** Items column in order tables uses `min-w-80` to fit the expanded composition.

### Images

Mix box images use the `mixes` Supabase Storage bucket (added to `ALLOWED_BUCKETS` in [src/lib/storage.ts](src/lib/storage.ts)). Must be created in Supabase Dashboard manually, with public read policy.

## Delivery schedule (slots, blackouts, cut-off)

Customers pick a delivery date + slot during checkout. Admins manage slots and per-date/per-slot blackouts in `/panel/delivery`. The whole module is **soft-required**: when no slots exist in DB, the picker is hidden and customers can place orders without choosing a window. As soon as the admin adds at least one slot, the date+slot becomes mandatory.

### Data model

- `delivery_slots` — admin-managed list. `start_time`/`end_time` (postgres `time`), `available_weekdays` (`smallint[]`, ISO 1=Mon … 7=Sun, CHECK enforces non-empty + range via `<@ ARRAY[1..7]`), `is_active`. No `sort_order` — UI sorts by `start_time` everywhere.
- `delivery_blackouts` — `(blackout_date, slot_id)` with `slot_id` nullable. `slot_id IS NULL` = whole day blocked; `slot_id = <uuid>` = only that slot blocked on that date. Unique index uses `NULLS NOT DISTINCT` so `(date, NULL)` can't be inserted twice.
- `delivery_settings.cutoff_hour` — per-emirate (0–23, default 19). The cut-off applies on top of the earliest date allowed by `delivery_days`: before this hour in Asia/Dubai the earliest stays as-is; from this hour onward it's pushed by one extra day. So for `delivery_days=0` the cut-off shifts earliest from today → tomorrow; for `delivery_days=1` it shifts tomorrow → the day after.
- `delivery_settings.delivery_days` — per-emirate lead time. `0` = same-day, `1` = next-day, `2+` = N-day lead time. Threaded through `getMinDeliveryDate(cutoffHour, at, deliveryDays)`: earliest deliverable date = `today + max(0, deliveryDays) + (pastCutoff ? 1 : 0)`. Switching emirate in checkout (e.g. Dubai with 0 days → Sharjah with 2 days) re-anchors the date grid automatically — `CheckoutFormSection` reads `emirateSetting?.delivery_days ?? 1` and passes it down to `DeliveryScheduleSection` → `useDeliverySchedulePicker` → `buildDayGrid` / `getAvailableSlotsForDate`. The server `revalidateDeliveryWindow(delivery, cutoffHour, deliveryDays)` uses the same value for the submit-time race check. Additionally, `getAvailableSlotsForDate` filters out slots whose `end_time` already passed in Asia/Dubai when the chosen `date` is today — so a same-day customer at 19:00 still sees a `17:30–22:00` slot (it's running but bookable), but no longer sees a `09:15–17:30` slot.
- `orders.delivery_schedule text` — single human-readable snapshot like `"6 May 2026 · Morning 09:00–15:00"`. No FKs into delivery tables, so admins can edit/delete slots freely without breaking historical orders.

### Pure resolver — single source of truth

[`getAvailableSlotsForDate(date, slots, blackouts, cutoffHour, now?)`](src/shared/utils/deliverySlots.ts) is a pure function used both for client rendering (date strip / slot tiles) and server-side revalidation at submit time. It rejects dates before `getMinDeliveryDate(cutoffHour)`, drops fully-blocked days, removes per-slot blackouts, filters by `available_weekdays`, and — when `date` is today in Asia/Dubai — drops slots whose `end_time` has already passed (a slot that is currently running stays bookable until its end). [`findSlotConflict`](src/shared/utils/deliverySlots.ts) is the parallel checker for slot creation/edit (no two active slots can overlap in time on a shared weekday).

### Time zone helpers

[src/shared/utils/zonedTime.ts](src/shared/utils/zonedTime.ts) — `nowInZone`, `isPastCutoff`, `getMinDeliveryDate`, `getZoneIsoWeekday`, `formatLongDate`, `formatTimeRange`, `formatDeliverySchedule`, `toDateOnlyString`, `fromDateOnlyString`. Uses `Intl.DateTimeFormat` with cached formatters; default `timeZone="Asia/Dubai"` is overridable via the optional last argument. No new packages — just `date-fns` + native `Intl`.

### Weekday labels

[src/shared/consts/delivery.ts](src/shared/consts/delivery.ts) exports `WEEKDAYS_ISO`, `weekdayShortLabel(iso)`, `weekdayFullLabel(iso)` — both helpers wrap `format(setDay(...), "EEE"|"EEEE")` so labels are always in sync with date-fns instead of being hard-coded maps.

### Admin UI (`/panel/delivery`)

Three sections on a single page:
1. **Emirates** (existing) — per-row form with `delivery_fee`, threshold, minimum, days, **cutoff_hour** (`FormNumberInput` 0–23 with an `Info` tooltip explaining the semantics).
2. **Delivery slots** ([SlotsSection](src/pages_flow/panel/delivery/SlotsSection.tsx)) — card grid sorted by `start_time`, each card shows time range (Jost tabular-nums) + label + 7 weekday chips (Mon–Sun, on/off) + status badge + Edit/Delete buttons in the same style as `PromotionCard`. Add/Edit open a `Dialog` with [`SlotForm`](src/pages_flow/panel/delivery/SlotForm.tsx) — `FormInput` label, two `FormTimePicker` (HH:mm), `TagToolbarMulti` weekday chips, `FormCheckbox` is_active, plus a "Free: …" hint computed by [`computeFreeWindows`](src/pages_flow/panel/delivery/freeWindows.ts) showing remaining gaps for the selected weekdays.
3. **Blocked dates** ([BlackoutsSection](src/pages_flow/panel/delivery/BlackoutsSection.tsx)) — same card pattern. Card shows date (large) + "All day" or "{slot label} · {range}" badge + reason. Edit + Delete in the dialog. [`BlackoutForm`](src/pages_flow/panel/delivery/BlackoutForm.tsx) — `FormDatePicker`, then a `FormSelect` of slots **filtered by the chosen date's weekday** (so admin can't block a slot on a day it doesn't run); "All day" is the first/default option.

Server actions in [src/pages_flow/panel/delivery/actions.ts](src/pages_flow/panel/delivery/actions.ts): `createSlotAction`/`updateSlotAction` run `findSlotConflict` against existing rows; conflict text uses `weekdayShortLabel(conflict.weekday)`. `addBlackoutAction`/`updateBlackoutAction` share `validateBlackoutInput` + `mapBlackoutDbError` helpers (DRY) and re-check that a per-slot blackout's slot covers the chosen weekday. All revalidate `/panel/delivery`, `/cart`, `/checkout`.

### Checkout UI

The customer picker is decomposed under [src/pages_flow/checkout/ui/delivery-schedule/](src/pages_flow/checkout/ui/delivery-schedule):
- [`buildDayCells.ts`](src/pages_flow/checkout/ui/delivery-schedule/buildDayCells.ts) — pure `buildDayGrid(slots, blackouts, cutoffHour)` returns `{ cells, weekdayLabels, earliestAvailable }`. Grid is **2 weeks × 7 columns**, anchored to the Monday of the week containing `getMinDeliveryDate(...)` (so past days are never wasted on a row when the picker opens later in the week).
- [`useDeliverySchedulePicker.ts`](src/pages_flow/checkout/ui/delivery-schedule/useDeliverySchedulePicker.ts) — owns picker state, derives effective `selectedDateIso`/`selectedSlotId` during render (no setState-in-effect cascades when upstream changes), notifies parent via `onSelectionChange(selected: boolean)` from a `useEffect` guarded by `useRef`.
- [`DateGrid.tsx`](src/pages_flow/checkout/ui/delivery-schedule/DateGrid.tsx) — header row (`EEEEE` letters via `format`) + `FormTileRadio` with `className="grid grid-cols-7 gap-1.5"` overriding the default flex; cells are `aspect-square` `FormTileRadioItem` with the day-of-month, `disabled` prop on unavailable cells.
- [`SlotPicker.tsx`](src/pages_flow/checkout/ui/delivery-schedule/SlotPicker.tsx) — `Slot for {date}` heading + `FormTileRadio` of slots.
- [`EarliestDeliveryHint.tsx`](src/pages_flow/checkout/ui/delivery-schedule/EarliestDeliveryHint.tsx) — `Earliest delivery — {date}` line under the grid.

[`DeliveryScheduleSection`](src/pages_flow/checkout/ui/DeliveryScheduleSection.tsx) is the thin orchestrator: hides itself entirely when `slots.length === 0`, renders the section + writes hidden inputs `delivery_date` (`yyyy-MM-dd`) and `delivery_slot_id` (uuid). Mounted **inside** `CheckoutForm` between the address block and notes via the `scheduleSlot` prop slot. The `CheckoutFormSection` lifts `scheduleSelected` state from the picker's `onSelectionChange` callback and forwards `scheduleRequired = slots.length > 0` and `scheduleSelected` into `SubmitButton` — the submit is disabled until a slot is picked, with an inline error "Pick a delivery date and slot to continue" rendered under the button.

`CheckoutPage` uses `lg:grid-cols-[minmax(0,1fr)_360px]` (not `1fr_360px`) so the form column can shrink below its natural content width without pushing OrderSummary off-grid.

### Server-side revalidation in `submitCheckout`

[src/pages_flow/checkout/actions.ts](src/pages_flow/checkout/actions.ts) runs in **phases** with `Promise.all` to keep N-Genius the only dominant latency; named helpers live in [checkoutSteps.ts](src/pages_flow/checkout/checkoutSteps.ts) (`loadCurrentUser`, `parseDeliveryFields`, `readEmirate`, `fetchDeliverySetting`, `applyPromoCode`, `revalidateDeliveryWindow`, `evaluateDeliveryFee`, `computeCheckoutTotals`, `validateCheckoutFields`, `persistCustomerCookie`):

1. Phase 1 (parallel) — `loadCurrentUser`, `getActiveDeliverySlots`, `fetchDeliverySetting(emirate)`, `buildMixCompositionMap`. `persistCustomerCookie` is fire-and-forget (`void`).
2. Phase 2 — pure validation. `scheduleRequired = activeSlots.length > 0`; if true, `delivery_date`/`delivery_slot_id` become required.
3. Phase 3 (parallel) — `applyPromoCode`, `revalidateDeliveryWindow(deliveryFields, setting?.cutoff_hour ?? 19)`. The window helper returns `{ deliverySchedule: null }` when no active slots exist (skipped on empty admin config) and otherwise calls `getAvailableSlotsForDate` to confirm the (date, slot) pair is still valid; on race the response sets `fieldErrors.deliveryDate` or `fieldErrors.deliverySlot`.
4. Phase 4 — `evaluateDeliveryFee` is **pure**; uses the already-fetched setting.
5. Phase 5/6 — insert order with `delivery_schedule = formatDeliverySchedule(date, slot)` (or `null` for soft-required mode), then redirect to N-Genius.

### Manual admin order

[`/panel/all-orders/create`](src/app/panel/all-orders/create/page.tsx) ↔ [`ManualOrderForm`](src/pages_flow/panel/orders/manual-order/ManualOrderForm.tsx) — same date+slot picker but **without cut-off / blackouts** (admin enters historical orders). Past dates are allowed: `FormDatePicker` has no `minDate`/`maxDate`. Logic decomposed into [`useDeliverySchedule`](src/pages_flow/panel/orders/manual-order/useDeliverySchedule.ts) (date+slot state with weekday filter), [`buildManualOrderTotals`](src/pages_flow/panel/orders/manual-order/totals.ts) (pure subtotal/promotion/delivery/total), and per-block UI in [`sections/`](src/pages_flow/panel/orders/manual-order/sections/) (CustomerInfoSection, DeliveryAddressSection, DeliveryScheduleSection, ProductsSection, MixesSection, NotesSection, OrderSummarySection, ManualOrderFooter wrapped by a shared `ManualOrderSection`). Form composes the schedule string client-side and submits it as a hidden `delivery_schedule` field; server action accepts the string verbatim.

`DeliveryScheduleSection` is rendered conditionally — when `slots.length === 0` (admin hasn't set up any) the entire section is skipped and the server-side validation that requires a date+slot is also skipped. Mirrors the public `/checkout` behaviour. When slots exist the Date and Slot fields are required; the slot select shows three states: `disabled` + "Select date first" before a date is picked, `disabled` + "No slots for this day" when the picked date's weekday has no active slots, and `Select slot` otherwise. The server validation only fetches `getActiveDeliverySlots()` when `delivery_schedule` is empty (saves a roundtrip on the happy path).

### SQL migration

`delivery_slots_migration.sql` lives at the repo root (intentionally outside `supabase/migrations/`) — apply manually via `supabase db push` / Studio. Adds `cutoff_hour` to `delivery_settings`, creates `delivery_slots` + `delivery_blackouts` with admin-only RLS (mirroring the existing `Admin insert/update/delete` + `Allow public read` pattern from `delivery_settings`), and adds `orders.delivery_schedule`. Uses `available_weekdays <@ ARRAY[1,2,3,4,5,6,7]::smallint[]` for the range CHECK because Postgres disallows subqueries inside CHECK.

## PromoSlider

Reusable embla carousel of promo + best-seller products. Lives in [src/sections/PromoSlider/](src/sections/PromoSlider/) and is wrapped by the async server section [src/pages_flow/home/PromoSliderSection.tsx](src/pages_flow/home/PromoSliderSection.tsx) which fetches data via [getPromoSliderProducts](src/lib/promoSliderProducts.ts) (active promotions sorted by `endsAt`, then best-sellers; deduped; capped at 10).

### Where it's embedded

- **Home (`/`)** — `id="promo"` anchor, `kicker="Top picks & deals"`, `title="Best Offers"`, default centered header. Default `from="promo"` on inner `ProductItem` links so the product detail page shows "Back to promo" → `/#promo`.
- **Product detail page (`/products/[id]`)** — passed via `<ProductDetailPage belowGrid={...}>` slot. `excludeId={product.id}` (current product hidden from suggestions), `kicker="More to explore"`, `title="You might also like"`, `headerClassName="text-left md:pl-12"` (left-aligned + offset to align with first card under the prev-arrow button), `withAnchor={false}` (no duplicate `id="promo"` outside home).
- **Cart (`/cart`)** — passed via `<CartPage belowContent={...}>` slot, only on the populated-cart branch (skipped on `EmptyCart`).

### `from` + `back` query param chain

Product links carry **two** query params controlling the back button on `/products/[id]`:

- **`?from=`** — short key looked up in `FROM_MAP` for the **label** ("Back to cart", "Back to products", …).
- **`?back=`** — full URL (path + query + hash) used as the back **href**. Lets the caller carry filter state so the user lands on the same scrolled, filtered list. Validated with `isSafeBackHref` (only same-origin relative paths — rejects `https://...` and protocol-relative `//evil.com/...`). When `?back=` is present it overrides `FROM_MAP[from].href`; the label still comes from `FROM_MAP[from]` (or `"Back"` if `from` is unknown).

Mapping in [src/app/products/[id]/page.tsx](src/app/products/[id]/page.tsx):

```ts
const FROM_MAP = {
  favorites: { href: "/panel/favorites", label: "Back to favorites" },
  cart:      { href: "/cart",            label: "Back to cart" },
  promo:     { href: "/#promo",          label: "Back to promo" },
  products:  { href: "/#products",       label: "Back to products" },
};
```

The slider on a product detail page **inherits** the incoming `from` and `back` so that the original entry context propagates through any depth of product-to-product navigation: `from={from ?? "products"}`, `backHref={safeBack}`. If user landed on a product directly (no `from`), the slider falls back to `from="products"` so chained back-clicks return to `/#products` — never `/#promo` (the home variant).

### Filter preservation helpers

Three pieces wire up the "Back returns to the same filtered list" UX:

1. **[buildBackHref / isSafeBackHref](src/shared/utils/backHref.ts)** — single source of truth for the `?back=` value. `buildBackHref({ pathname, searchParams, hash })` produces the URL using `useSearchParams().toString()`; `isSafeBackHref(url)` is the same-origin guard used by every consumer of `?back=`.
2. **[buildProductHref](src/sections/products/utils/buildProductHref.ts)** — serialises both `from` and `backHref` into the outbound `/products/{slug}?from=…&back=…` URL. Always use this helper instead of hand-rolling the public product link.
3. **List pages capture filters via `useSearchParams()` and pass `backHref` to each card:**
   - [src/sections/products/ProductGrid.tsx](src/sections/products/ProductGrid.tsx) — public home `#products` grid passes `backHref = "/?{filters}#products"` and `from="products"`.
   - [src/pages_flow/panel/products/AdminProductCard.tsx](src/pages_flow/panel/products/AdminProductCard.tsx) — admin grid passes `back=/panel/products?{filters}` directly into the `/panel/products/{id}/details` link.

   Adding a new filterable list page with this UX is two lines: `useSearchParams()` → `buildBackHref(...)` → pass into the link.

### `belowGrid` / `belowContent` slot pattern

Both `ProductDetailPage` (client component) and `CartPage` (client component) accept a `ReactNode` slot that the parent server component fills with `<Suspense fallback={<PromoSliderSkeleton />}><PromoSliderSection .../></Suspense>`. This is the standard Next.js App Router pattern for embedding async server components inside client components — pass them as props/children, not by importing & calling. **Always set a `key` on the wrapper `<Suspense>`** when passing as a prop — RSC serialisation otherwise emits a "Each child in a list should have a unique key" warning.

### `buildProductHref` helper

`/products/[slug]?from=...&back=...` href construction lives in [src/sections/products/utils/buildProductHref.ts](src/sections/products/utils/buildProductHref.ts). Accepts `{ slug, from?, backHref? }` and uses `URLSearchParams` so encoding stays correct. Always use this helper instead of hand-rolling — keeps the query-string format consistent and gives a single place to extend (e.g. add `variant`, `ref` params later).

### `ClearCartButton`

[src/pages_flow/cart/ui/ClearCartButton.tsx](src/pages_flow/cart/ui/ClearCartButton.tsx) — outline-error button with `Trash2` icon, opens a confirmation `Dialog` before calling `useCart().clearCart()`. Mounted above `CartGrid` in `flex justify-end`. The underlying `clearCart` already wipes localStorage / `cart_items` and triggers `cleanupOrphanedMixVariants` for any mix variants in the cart, so the button itself just needs to call it and toast.

## Auth

Two auth methods: **email/password** and **Google OAuth**.

**Email/password flow:** `/signup` → email + password + confirm → Supabase sends OTP email → `/verify-email` → OTP verified → session created → redirect to `/`.

**Google OAuth flow:** `/login` → `GoogleSignInButton` calls `supabase.auth.signInWithOAuth({ provider: "google" })` → Google redirects to `/auth/callback?code=…` → `createSupabaseServerClient().auth.exchangeCodeForSession(code)` sets a cookie → redirect to `/` (or `next` param). This is a **full page reload** (NextResponse.redirect).

**Email/password login:** `/login` → `LoginForm` submits server action → `signInWithPassword()` → `redirect()`. This is a **client-side navigation** (server action redirect), so React state in layouts persists.

**Password reset flow:** `/forgot-password` → enter email → Supabase sends recovery OTP → `/reset-password?email=…` → enter OTP + new password → `verifyOtp({ type: "recovery" })` + `updateUser({ password })` → redirect.

**Important:** When the `SignOutButton` dialog triggers `signOut()` (server action with redirect), it must call `close()` first to reset the dialog's controlled `open` state — otherwise the stale `true` persists through client-side navigation and reopens on next login.

Session refresh: `src/proxy.ts` exports a middleware helper (`proxy()`) that must be called from `middleware.ts`. It creates an `@supabase/ssr` server client and calls `auth.getUser()` on every request to keep the session cookie fresh.

**Route guards** in `src/proxy.ts`:
- `/panel/*` → unauthenticated users redirected to `/login?next={pathname}`
- `/panel/*` (except `/profile`, `/favorites`, `/orders`) → require `role=admin`
- Guest-only routes (`/login`, `/signup`, `/verify-email`, `/forgot-password`, `/reset-password`) → authenticated users redirected away

**Client selection guide:**
| Situation | Use |
|-----------|-----|
| Server Action / API route needing auth identity | `createSupabaseServerClient()` from `@/lib/supabase.server` |
| Server Action / API route, no auth needed | `supabase` from `@/lib/supabase.server` |
| Bypassing RLS (admin ops) | `supabaseAdmin` from `@/lib/supabase.server` |

## Supabase

Two files, three client instances:
- `src/lib/supabase.ts` — `createSupabaseBrowserClient()` — browser client for Client Components
- `src/lib/supabase.server.ts` — three server-side exports:
  - `supabase` — static anon client, subject to RLS (non-auth server queries)
  - `supabaseAdmin` — static service-role client, bypasses RLS (use only in server actions, API routes, and `lib/`)
  - `createSupabaseServerClient()` — async, reads cookies via `@supabase/ssr`; use whenever you need the current user's session

**DB tables:** `orders` (status, is_fulfilled, subtotal, delivery_fee, total, **promotion_discount**, **promo_code_id**, **promo_discount**, **delivery_schedule** text nullable — human-readable snapshot like `"6 May 2026 · Morning 09:00–15:00"`, customer fields, ngenius_ref), `order_items` (order_id, variant_id, name, price, **original_price** nullable, **promo_discount** per unit, weight_g, quantity, **mix_composition** JSONB nullable — snapshot of mix contents, each entry now carries **`product_id`** alongside name/image/count/weight/price so the inventory deduction path doesn't need extra lookups; older rows without `product_id` survive untouched and contribute COGS=0 — all snapshots at order time so historical orders survive promo/promotion/variant edits), `products` (image_url, images JSONB `[]`, **video_url** text nullable — optional MP4 storage URL or YouTube link, see **Product video**, in_stock, badge, **note** — sanitized HTML string, not plain text — see **Rich text (product notes)**, nutrition JSONB, status `product_status` enum — `draft | published | archived | system`, **no price/weight_g columns**, these live in `product_variants`), `product_variants` (product_id, weight_g, price — one-to-many with products), `categories` (name, slug, audience, tagline, description, image_url, badge, sort_order), `benefits` (id, name, description — unique on name+description), `partnership_inquiries` (business_name, contact_name, phone, business_type, message), `user_favorites` (user_id, product_id), `profiles` (id, first_name, last_name, phone, role `user_role`, gender, birthday, allow_notifications), `cart_items` (user_id, variant_id, quantity — minimal, prices via join), `notifications` (type, title, message, related_id, user_id, audience `user_role` — nullable, NULL = all roles), `notification_reads` (notification_id, user_id, read_at — tracks per-user read status), `push_subscriptions` (user_id, endpoint UNIQUE, p256dh, auth — FK to auth.users + profiles, RLS per user), `promotions` (name, discount_type, discount_value, starts_at, ends_at, is_active), `promotion_products` (promotion_id, product_id), `promo_codes` (code, scope, discount_type, discount_value, min_order_amount, max_uses, max_uses_per_user, stack_with_promotions, starts_at, ends_at, is_active — code is exactly 6 `[A-Z0-9]` chars enforced by CHECK), `promo_code_products`, `promo_code_users`, `promo_code_redemptions` (`unique(order_id)`), `mix_boxes` (id — **same UUID as corresponding `products.id`**, name, slug UNIQUE, description, image_url, cell_count, is_active, sort_order), `mix_box_presets` (box_id, product_id, weight_g, price — `UNIQUE(box_id, product_id)` means each product appears once in a box's assortment), `mix_variant_cells` (variant_id → product_variants CASCADE, cell_index, preset_id → mix_box_presets CASCADE, `UNIQUE(variant_id, cell_index)` — stores what preset sits in each cell of an assembled mix variant), `marketing_popup` (multi-row catalog of home-page popups; `is_active` with partial unique index `WHERE is_active=true` enforcing at most one active row, `title` doubles as visitor heading + admin catalog label, `body` HTML, `image_url`, `cta_label`, `cta_url`, `starts_at`/`ends_at` nullable display window, `updated_at` auto-bumped by `BEFORE UPDATE` trigger — see **Marketing Popup**), `delivery_settings` (per-emirate row: delivery_fee, free_delivery_threshold, minimum_order, delivery_days, **cutoff_hour** integer 0–23 default 19, is_active), `delivery_slots` (id, label, start_time/end_time, is_active, **available_weekdays** smallint[] ISO 1=Mon … 7=Sun, CHECK enforces non-empty + range — see **Delivery schedule**), `delivery_blackouts` (blackout_date date, slot_id uuid nullable — NULL = entire day blocked, reason text, unique index on (date, slot_id) `NULLS NOT DISTINCT`), `product_inventory` (product_id uuid UNIQUE FK→products CASCADE, **stock_g** integer default 0 + CHECK ≥0, **low_stock_threshold_g** integer default 500, **cost_per_100g** numeric(10,2) default 0, `updated_at` auto-bumped by `BEFORE UPDATE` trigger — operational data kept in a separate table from the catalog so inventory edits don't churn the products row), `stock_movements` (append-only audit log: product_id FK→products CASCADE, **delta_g** integer signed, **reason** `stock_movement_reason` enum `order_paid | restock | correction | damage | manual_adjust`, order_id FK→orders SET NULL, note text nullable, created_by FK→auth.users SET NULL, created_at — `UNIQUE(order_id, product_id)` is the idempotency guard for `deductInventoryForOrder` so the webhook + result-page paths can't double-deduct; admin INSERT/SELECT only, UPDATE/DELETE intentionally ungranted).

**Order display invariant:** `originalSubtotal − promotion_discount − promo_discount + delivery_fee = total`. The order list pages and cards display this breakdown as `Subtotal − Promotion − Promo + Delivery = Total`. Old orders without `original_price`/`promotion_discount` (NULL/0) render correctly without the new lines.

**Order visibility invariant.** PENDING orders are filtered out of both [src/app/panel/orders/page.tsx](src/app/panel/orders/page.tsx) (user view) and [src/app/panel/all-orders/page.tsx](src/app/panel/all-orders/page.tsx) (admin view) via `.neq("status", OrderStatus.PENDING)` in the Supabase query. The `ORDER_STATUS_OPTIONS` filter in [src/pages_flow/panel/orders/helpers.ts](src/pages_flow/panel/orders/helpers.ts) likewise only lists `Paid | Failed | Cancelled`. A freshly-created order is invisible until N-Genius (via webhook or `/checkout/result`) transitions it to PAID/FAILED/CANCELLED.

**Shared `useAutoRouterRefresh` hook.** [src/shared/hooks/useAutoRouterRefresh.ts](src/shared/hooks/useAutoRouterRefresh.ts) — generic TanStack Query hook whose `queryFn` triggers `router.refresh()` as a side-effect (returned data is `null` — TQ is used as a scheduler here, not a data store). Accepts a `queryKey` so each call site has its own cache observer. Settings: `refetchInterval: DEFAULT_STALE_TIME_MS` (30s), `refetchOnWindowFocus: true`, `refetchOnReconnect: true`, `refetchIntervalInBackground: false` (skipped when tab hidden), `staleTime: 3_000` (throttles focus/visibility refetches to once per 3s), `gcTime: 0` (cache cleared on unmount so remount re-arms first-skip). An `isFirstRef` ref skips the very first invocation on mount — the page just SSR'd with fresh data. Used by:
- [`AllOrdersInner`](src/pages_flow/panel/orders/AllOrdersPage.tsx) — `useAutoRouterRefresh(["panel-orders-refresh"])`. Replaces the old Supabase Realtime subscription on `orders`.
- [`PartnershipsInner`](src/pages_flow/panel/partnerships/PartnershipsPage.tsx) — `useAutoRouterRefresh(["panel-partnerships-refresh"])`. Replaces the old Supabase Realtime subscription on `partnership_inquiries`.

Both eliminate the WebSocket connection without losing live updates for the admin (max 30s lag, instant on focus). New orders are still always PENDING and filtered out server-side; they appear after the UPDATE that flips status to PAID/FAILED/CANCELLED.

**Order notification messages.** [src/lib/orderNotifications.ts](src/lib/orderNotifications.ts) exposes two helpers built around the same `OrderNotificationParts` shape `{ customer, totalQty, itemsText, totalText, deliverySchedule }`:
- `buildOrderNotificationParts(order, items)` — structured pieces, used by `ResultToast` to render a multi-line JSX toast.
- `formatOrderNotificationMessage(order, items)` — joins the same pieces with " · " into a single string for push notifications and the in-app realtime toast (which can only display plain text).

Format: `{First Last} · {totalQty} items · {qty}× {name}, … · AED {total} · {delivery_schedule}` (first 2 item names, then `+N more`; `delivery_schedule` appended only when non-null). Callers (`checkout/result`, `api/payment/webhook`, `checkout/cancel`) fetch `first_name, last_name, total, delivery_schedule, order_items(name, quantity, variant_id)` in a **single** `.select(...)` — important for the N-Genius webhook 15-second SLA.

`toastSuccess` / `toastError` / `toastInfo` accept `React.ReactNode`, so structured JSX bodies are rendered as-is; plain strings still work everywhere else.

## Design system

Brand tokens live in `globals.css` `@theme` block and map directly to Tailwind utilities:

| Token                  | Utility                     | Use                                                           |
| ---------------------- | --------------------------- | ------------------------------------------------------------- |
| `--color-cream`        | `bg-cream`                  | main background                                               |
| `--color-sand`         | `bg-sand`                   | secondary bg, cards                                           |
| `--color-earth`        | `bg-earth` / `text-earth`   | dark sections, body text                                      |
| `--color-heading`      | `text-heading`              | section headings (h1–h3)                                      |
| `--color-orange`       | `bg-orange` / `text-orange` | primary CTA                                                   |
| `--color-orange-light` | `bg-orange-light`           | hover state                                                   |
| `--color-moss`         | `text-moss`                 | "natural" badges                                              |
| `--color-white-warm`   | `bg-white-warm`             | card backgrounds                                              |
| `--font-display`       | `font-display`              | Cormorant Garamond, headings                                  |
| `--font-body`          | `font-body`                 | Jost, body/labels/buttons                                     |
| `--text-xs`            | `text-xs`                   | 0.625rem (10px) – tiny meta text (overrides Tailwind default) |
| `--text-2xs`           | `text-2xs`                  | 0.75rem (12px) – standard small UI labels                     |

**Font size rule:** never use `text-[Npx]` arbitrary px values. Use Tailwind's built-in scale (`text-xs`, `text-sm`, …), the custom tokens above, or rem-based arbitrary values (e.g. `text-[1.75rem]`) for one-off sizes.

Typography pattern: display H1 → `font-display font-bold italic`, H2–H3 → `font-display font-semibold`, body → `font-body font-light`, labels/CTA → `font-body font-semibold uppercase tracking-[0.12em]`.

Grain texture: add class `noise` + `relative` on a section — the `.noise::after` pseudo-element in `globals.css` renders a CSS-only SVG texture (no PNG).

**Color semantics for product attribute lists** (rendered inside `ProductDetails` / `ProductExpandedDetails`, collapsed by default in cards/rows, expanded on detail pages):
- **Tags** — `text-moss` + `bg-moss` bullet — natural qualities, positive signal
- **Free From** — red `✕` prefix (`text-red-600`) on `text-earth/55` text — warning / absence marker
- **Ingredients** — `text-earth/90` + bright `bg-orange` bullet (1.5px, not 1px) — factual composition, deliberately more prominent than Serving
- **Serving Ideas** ("How to Enjoy") — `text-orange/85` + `bg-orange/60` bullet — warm hint
- **Occasions** — `text-earth/65` + `bg-earth/25` bullet — neutral context

The 2×2 grid layout inside Details/ExpandedDetails is: Tags | Free From / Serving | Occasions. On detail pages Ingredients appears full-width between Nutrition and the 2×2 grid.

## Icons

**Rule: every SVG icon — including decorative ones — lives in `src/shared/icons/` as its own file and is exported from `src/shared/icons/index.ts`.**

- File name pattern: `Icon{Name}.tsx` (e.g., `IconLeaf.tsx`, `IconBotanical.tsx`)
- Component signature: `function Icon{Name}(props: React.ComponentProps<"svg">)` — spread `{...props}` on the `<svg>` so callers can pass `className`, `aria-hidden`, etc.
- Never inline `<svg>` markup directly in section components. Always import from `@/shared/icons`.

## UI component rule

**Always use components from `@/shared/ui` instead of raw HTML elements.** Never use `<button>`, `<a>`, `<input>`, `<select>`, `<textarea>` directly — use `Button`, `FormInput`, `FormSelect`, `FormTextarea`, etc. This ensures consistent styling across the entire site.

**`Button` is mandatory for every clickable control** — including icon-only buttons, tooltip triggers, small helper actions, and any `type="button"`. Use `variant="text"` + `size="icon"` for minimal styling when needed. Never render a raw `<button>` element, even for "just an icon" cases.

## Shared UI components

All use `class-variance-authority` (cva) for variants + `cn()` for className merging.

Compound components (e.g. `Collapsible`, `TagToolbar`) hold state in React context internally; sub-components access it via a `use*` hook. Follow this same pattern when adding new compound components.

- **`Button`** — defaults to `<a>` via `next/link` `Link` for all hrefs (internal, external, hash). Pass `as="button"` for `<button>`. Supports `ref` prop (React 19 ref-as-prop). Variants: `primary | secondary | outline | text`. Colors: `primary | error | warning | default`. Sizes: `icon | inline | sm | md | lg`. `buttonVariants` is also exported for applying Button styles to non-Button elements (e.g. `HashLink`). **Never nest `<button>` inside `HashLink`** — use `HashLink` with `buttonVariants` className instead. Disabled state is handled at the base class: `disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none` — no need to add `disabled:*` classes manually per-button. Hover styles auto-disable.
- **`Badge`** — inline label/tag. Variants: `natural` (moss green) | `warm` (sand) | `outline`. Sizes: `xs | sm | md`.
- **`Card`** — wrapper with 16px radius. Variants: `default` (white-warm) | `sand` | `outline` | `dark` (earth bg).
- **`TagToolbar` / `TagToolbarItem`** — single-select pill filter bar (`role="radiogroup"`). Controlled or uncontrolled via `value`/`onValueChange`/`defaultValue`. Empty string `""` means "All".
- **`TagToolbarMulti` / `TagToolbarMultiItem`** — multi-select sibling of `TagToolbar`, sharing the same pill `itemVariants`. Context value is `Set<string>` + `toggle(v)`. ARIA `role="group"` on container, `role="checkbox" aria-checked` on items. Used for the weekday picker in `SlotForm`.
- **`Collapsible` / `CollapsibleTrigger` / `CollapsibleChevron` / `CollapsibleContent`** — animated accordion using `motion/react` `AnimatePresence`.
- **`Select` / `SelectTrigger` / `SelectValue` / `SelectContent` / `SelectItem` / `SelectGroup` / `SelectSeparator`** — custom dropdown, context-based, supports controlled/uncontrolled, `clearable` prop, auto up/down direction.
- **`FormTileRadio` / `FormTileRadioItem`** — single-select tile radio group. Sizes: `sm` (compact, for product cards) | `md` (default). `FormTileRadioItem` accepts `disabled?: boolean` — adds `aria-disabled`, native `disabled`, and a dashed muted state via the CVA `state` variant (`active | idle | disabled`). Override the default flex layout with `className` (used by checkout date grid: `grid grid-cols-7 gap-1.5`). Context-based compound component with controlled/uncontrolled support.
- **`Form` components** — `FormLabel` (`required` prop adds red `*`), `FormInput` (supports `startIcon` for left icon, `wrapperClassName` for outer div, `clearable` + `onClear`), `FormSelect`, `FormTextarea`, `FormRichTextarea` (BlockNote-backed rich-text editor — see **Rich text (product notes)** below), `FormError`, `FormPasswordInput` (visibility toggle), `FormPhoneInput` (UAE format: displays `0XX XXX XXXX`, submits `+971XXXXXXXXX` via hidden input), `FormOtpInput` (6-digit OTP with `defaultValue` + `useResendCooldown` hook), `FormCheckbox`, `FormNumberInput` (stepper with +/- buttons, controlled via `value`/`onValueChange`), `FormUploadZone` (supports `initialUrl` for single image edit mode, `initialUrls` for multi-image; integrated Lightbox preview + sortable thumbnails; reusable for video uploads via `mimePrefix="video/"`, `noun="a video"`, `acceptLabel="MP4, WebM, MOV"` — see **Product video**. Rejections from react-dropzone (size, type, count) surface as toast messages.), **`FormDatePicker`** (calendar + optional time), **`FormTimePicker`** (HH:mm only — wraps the same `DatePicker` compound with `timeOnly` mode + `DatePickerTimeContent` so the popover renders just the wheels, no calendar) — CVA variants with `default` / `error` states. `FormSelect` wraps the `Select` compound component.
- **`DropdownMenu` / `DropdownMenuTrigger` / `DropdownMenuContent` / `DropdownMenuItem` / `DropdownMenuSeparator` / `DropdownMenuLabel`** — context-based dropdown menu with auto up/down direction, outside-click and Escape close, `destructive` + `disabled` item variants.
- **`Table` / `TableHeader` / `TableHeaderRow` / `TableHead` / `TableBody` / `TableRow` / `TableCell` / `TableEmpty` / `TablePagination`** — compound table with sticky header, sort indicators, dividers. Context-based (`useTable`).
- **`DataTable`** — declarative wrapper: pass `data`, `columns: ColumnDef[]`, `sort`, `pagination` and it renders a full `Table`. Hooks: `useTableSort`, `useTableData`, `useTableSearch`, `useTablePagination`. Helpers: `formatAed`, `formatDate`, `formatDateTime`, `shortId`, comparators (`compareString`, `compareNumber`, `compareDate`).
- **`DataCard` / `DataCardHeader` / `DataCardBody` / `DataCardField` / `DataCardFooter` / `DataCardGrid` / `DataCardList` / `DataCardEmpty`** — compound card for mobile-friendly data display. Context-based (`useDataCard`). `DataCardList` uses CSS grid (`grid-cols-1` default, pass `className` for responsive cols). `DataCardGrid` is a declarative helper that renders `FieldDef[]`.
- **`Thumbnail`** — reusable image thumbnail. Props: `src`, `alt`, `selected?` (orange border), `softDeleted?` (dimmed + grayscale), `showLabel?` (alt text below, default true), `onClick?`, `children?` (overlay buttons). Used by `SortableThumbnail` and `ProductDetailImage`.
- **`Popover` / `PopoverTrigger` / `PopoverContent`** — context-based popover with auto up/down direction, outside-click close, viewport clamping. Supports **controlled mode** via `open`/`onOpenChange` props (used by `BenefitsSection`, `NutritionSection`). `usePopover()` hook for child components.
- **`MultiSelect` / `MultiSelectTrigger` / `MultiSelectContent` / `MultiSelectItem` / `MultiSelectEmpty` / `MultiSelectCreate` / `MultiSelectDelete`** — compound multi-select with search, selected-items-first sorting, scroll preservation. Context-based (`useMultiSelect`). `MultiSelectCreate` for inline option creation, `MultiSelectDelete` for inline deletion. `MultiSelectTrigger` accepts an optional `maxVisibleTags?: number` — extra tags collapse into a single `+N more` pill (used by `/panel/inventory/history` to keep the toolbar tidy with many products selected).
- **`Tooltip` / `TooltipTrigger` / `TooltipContent`** — hover/focus tooltip with 4-direction support (`side` prop: `top | bottom | left | right`), auto-fallback to opposite side if no space. `delay` prop (default 200ms). Toggle on click for touch devices. **Always use `asChild`** on `TooltipTrigger` — it merges all handlers (onClick, onMouseEnter, etc.) with the child element's handlers via `cloneElement`. No `useId()` — safe inside Suspense boundaries. **`TooltipContent` renders into a `createPortal(..., document.body)` with `position: fixed` and JS-computed coords from the trigger's `getBoundingClientRect()` — this lets the tooltip escape any `overflow: hidden | clip` ancestor (e.g. embla carousel viewport, modal scroll containers). Coords are clamped to the viewport with an 8px pad. Recomputed on `resize` and `scroll` (capture phase, so any scrollable ancestor triggers the update). SSR-safe via `useSyncExternalStore` mount detection (no effect-driven setState). Do not write tooltip-specific positioning hacks like `w-full left-0 translate-x-0!` — the portal handles it.**
- **`Gallery`** — rows-based image gallery using `react-photo-album`. Props: `images: GalleryImage[]`, `rowHeight`, `maxPerRow`, `spacing`, `onClick(index)`. `GalleryImage` accepts optional `isVideo?: boolean` (centered Play overlay) and `videoSrc?: string` (renders `<video preload="metadata" muted>` instead of `<img>` so the tile shows the actual first frame for MP4). `render.image` passes through the library's `.react-photo-album--image` className so both `<img>` and `<video>` get the `aspect-ratio` CSS — without it `<video>` falls back to its natural intrinsic aspect (often 16:9 for phone clips) and renders a shorter tile than image siblings. No built-in Lightbox — compose with `<Lightbox>` externally.
- **`MixCompositionList`** — shared Collapsible with rows `[thumbnail with ×count pill] / name + total weight / total price`. Single source of truth for mix composition display across cart, mix constructor, checkout, order views, and admin mix cards. See **Mix composition rendering (shared)** below for full usage.
- **`RichText`** — renders sanitized HTML via `dangerouslySetInnerHTML` inside a `<div class="rich-text">` (paired with prose-style overrides in `globals.css`). Used to display the rich-text product `note` in tooltips and detail blockquotes. **Does not sanitize on render** — content is sanitized once at write time in admin actions; render path trusts the DB to avoid running jsdom on every SSR.
- **`CartEmpty`** — empty cart placeholder screen.
- **`Loader`** — loading spinner (used during cart hydration).
- **`Dialog` focus behaviour** — on open, the dialog **focuses its container** (`tabIndex={-1}` + `outline-none` on the motion.div), **not** the first focusable child. This avoids the unwanted focus ring on the auto-targeted close button for simple/info dialogs. Escape, Tab navigation, and the close button all still work. Form dialogs that need to auto-focus a specific field should use the standard React `autoFocus` prop on that field — relying on Dialog's old "first focusable" behaviour will not work.

## Responsive table/cards pattern

Admin data pages (orders, partnerships) use a dual-render approach:
- `< xl` — `DataCard` cards via `DataCardList` (typically `md:grid-cols-2` for 2 columns from 768px)
- `xl+` — `DataTable` with full sorting and pagination

Both views share the same `paginatedData` from hooks like `useOrdersTable` / `useInquiriesTable`, which manage sort + pagination state via URL search params (`SearchParamsFilterProvider` + `useFilterBar`).

```tsx
{/* Mobile: cards */}
<div className="xl:hidden">
  <OrderCards orders={paginatedData} />
</div>
{/* Desktop: table */}
<div className="hidden xl:block">
  <DataTable data={paginatedData} columns={columns} ... />
</div>
```

## Filter system

- **`FilterProvider`** (`src/providers/FilterProvider.tsx`) — generic React context for `Record<string, string>` filter state. Two hooks:
  - `useFilterBar(key)` — returns `{ value: string, onValueChange }` for single-value filters
  - `useFilterBarMulti(key)` — returns `{ values: string[], onValuesChange }` for multi-value filters (stored as comma-separated string internally)
- **`SearchParamsFilterProvider`** (`src/providers/SearchParamsFilterProvider.tsx`) — wraps `FilterProvider` and syncs state to URL search params (supports browser back/forward). Props: `keys: string[]` + optional `multiKeys?: string[]`. Multi-keys use `searchParams.getAll(key)` / `params.append(key, v)` for multiple URL params (e.g. `?category=a&category=b`). Uses bidirectional sync with race-condition protection: state → URL effect runs FIRST (sets `updatingUrl` flag), URL → state effect runs SECOND (skips when flag is set).
- Filter keys typically: `["search", "status"|"type", "sortKey", "sortDir", "page", "pageSize"]`.
- Always reset `page` filter when changing search/status filters.

## Product card specifics

Beyond the shared card anatomy (see **Card grids**), product cards use:
- `ProductVariantSelector` (public) vs `AdminVariantBadges` (admin) for weights/prices.
- `IngredientsInline` ([src/sections/products/components/IngredientsInline.tsx](src/sections/products/components/IngredientsInline.tsx)) — uppercase label + `ingredients.join(" · ")` with `line-clamp-2`.
- `ProductNote` — rendered as `NoteButton` overlay on image bottom-right (Info icon + tooltip with full note); no inline blockquote on the card.
- `ShareButton` — public only, passed as `actionSuffix` of `ProductPriceAndCart`.
- `ViewButton` — public only, `ArrowUpRight` icon overlay bottom-left to signal clickability.
- Footer: public — `ProductPriceAndCart layout="stacked"` (price row + full-width Add-to-Cart / `- qty +` counter); admin — `ProductAdminActions` (Status menu + Edit, `min-[520px]:flex-row`).

`ProductPriceAndCart` accepts `layout: "stacked" | "inline"` (default `"inline"` for detail pages, pass `"stacked"` in compact cards) and `actionSuffix?: React.ReactNode` (used for `ShareButton` right of Add-to-Cart). Promotion math, cart sync, out-of-stock branch, "Order via Instagram" fallback are shared between layouts.

Rich content (benefits, nutrition, tags, freeFrom, servingIdeas, occasions) is **not** shown on the card — users who want more detail click through to `/products/[slug]`, which renders `ProductExpandedDetails`.

## Product Variants

Products use a **variant-based pricing model**. Prices and weights live in `product_variants` table, not on `products` directly.

- **Table:** `product_variants` (id, product_id, weight_g, price) — one-to-many with products
- **Types:** `ProductVariant { id, weight_g, price }`, `Product.variants: ProductVariant[]`
- `Product.price` and `Product.weight_g` are computed from `variants[0]` (smallest) in `mapDbProducts()`
- **Admin form:** `VariantsSection` (`src/pages_flow/panel/products/product-form/VariantsSection.tsx`) — dynamic rows with `FormNumberInput`, serialized as JSON hidden input. Logic in `variants.ts` — each row carries the existing DB `id` through the form round-trip when present, so the server can diff by id.
- **Diff-based [syncVariants](src/pages_flow/panel/products/actions.ts):** on product save the server reads existing `product_variants` for that product, then UPDATEs only rows whose `weight_g` / `price` actually changed, INSERTs rows that came in without an `id`, and DELETEs rows whose `id` is missing from the form payload. **Never wholesale DELETE+INSERT** — that re-issues UUIDs on every save and orphans every `cart_items` / `order_items` row that pointed at the old variant (which is what produced disappearing-from-cart and FK-violation symptoms before this fix). Stable UUIDs are part of the contract.
- **Admin display:** `AdminVariantBadges` (`src/pages_flow/panel/products/AdminVariantBadges.tsx`) — Badge components showing `{weight}g — AED {price}` with promotion support
- **Public UI:** `ProductVariantSelector` (`src/sections/products/components/ProductVariantSelector.tsx`) — uses `FormTileRadio` with `size="sm"` for cards, `size="md"` for detail pages. Shows even for single variant.
- **Variant selection state** lives in `ProductItem` (cards) and `ProductDetailPage` (public detail) — passed down as `selectedVariant` prop to `ProductPriceAndCart`
- **Promotions** apply to all variants of a product equally — discount computed per-variant price via `calculateDiscountedPrice()`
- **Supabase queries** must include `product_variants(id, weight_g, price)` in SELECT — see `PUBLIC_PRODUCTS_SELECT` / `PRODUCTS_SELECT` in `productsDb.ts`

## Product Images

Products have a **main image** (`image_url`) and an optional **gallery** (`images` JSONB array). These are independent fields in the DB but managed through a single `FormUploadZone` in the admin form.

- **DB columns:** `products.image_url` (main, single URL), `products.images` (JSONB `[]`, gallery URLs ordered by position)
- **Admin form:** One `FormUploadZone` with `name="images"`, `multiple={true}`, `maxFiles={8}`. First uploaded image = `image_url`, rest = `images`. Drag-and-drop reordering via `@dnd-kit/react` — first position always gets "Main" badge.
- **Server action parsing:** `parseUploads(formData)` splits `formData.getAll("images")` → `image_url` (index 0) + `images` (index 1+). Helper `cleanupRemovedImages(oldUrls, newUrls)` deletes removed files from Supabase Storage on update/delete.
- **Edit mode initialization:** `getInitialUrls(product)` merges `[image_url, ...images]` back into a single array for the upload zone.
- **Public display:** `ProductDetailImage` combines `[image_url, ...images]`, shows main image + thumbnail strip + `Lightbox` for fullscreen zoom. When `product.video_url` is set, an extra video tile is appended at the end of the strip — see **Product video**.
- **Cards:** `ProductImage` continues to use only `image_url` for card thumbnails.
- **Types:** `Product.images: string[]`, `DbProduct.images: string[] | null`
- **Mapper:** `mapDbProducts` sets `images: p.images ?? []` (independent from `image_url`)

## Product video

Each product can optionally carry **one** review/recipe video — either an uploaded MP4 (Supabase Storage) or a YouTube link. Single field `products.video_url` stores both; type is detected from URL pattern at runtime via `getVideoKind(url)` in [src/shared/utils/videoUrl.ts](src/shared/utils/videoUrl.ts) — no `video_type` column needed.

### Data + storage

- **DB column:** `products.video_url text` (nullable). SQL ships as `video_url_migration.sql` at the repo root (apply manually, same convention as `delivery_slots_migration.sql` / `inventory_migration.sql`).
- **Storage bucket:** `product-videos` (public read, admin write). Added to `ALLOWED_BUCKETS` in [src/lib/storage.ts](src/lib/storage.ts). Create it manually in Supabase Dashboard.
- **MP4 URL shape:** `https://*.supabase.co/storage/v1/object/public/product-videos/product-video-{uuid}.{mp4|mov|webm|m4v}`.

### videoUrl utilities

[src/shared/utils/videoUrl.ts](src/shared/utils/videoUrl.ts) — shared between client and server:
- `getVideoKind(url)` → `"youtube" | "mp4" | null`. Pattern-matches.
- `extractYouTubeId(url)` — handles `youtube.com/watch?v=`, `youtu.be/`, `youtube.com/shorts/`, `youtube.com/embed/`, `/live/`. Validates the 11-char id.
- `getYouTubeThumbnail(id)` → `https://img.youtube.com/vi/{id}/hqdefault.jpg`.
- `getYouTubeEmbedUrl(id)` → `https://www.youtube.com/embed/{id}?modestbranding=1&rel=0`.
- `isValidVideoUrl(url)` — server-side validator: accepts YouTube of any supported shape, or Supabase Storage URLs scoped to the configured project + `product-videos` bucket.
- `getPlayableVideoMime(type)` — remaps `video/quicktime` → `video/mp4`. **Chrome refuses to play `<source type="video/quicktime">`** even when the inner H.264 stream is fully supported (most phone-recorded MOVs); this lie makes the browser actually attempt playback. Used both client-side (`<source>` for blob preview) and server-side (`Content-Type` on `uploadVideo` to Supabase). Bypasses Chrome's `canPlayType` rejection for MOV.

### Storage helpers ([src/lib/storage.ts](src/lib/storage.ts))

- `uploadVideo(file, slug, bucket)` — sibling of `uploadImage`. Whitelists `mp4 | webm | mov | m4v`, validates MIME prefix OR extension (some browsers report empty `file.type` for MOV on Windows), sets `Content-Type` via `getPlayableVideoMime` so subsequent fetches play.
- `parseFormVideo(formData, fieldName, slug, bucket)` — single-value sibling of `parseFormImages`. Existing URL passes through, new `File` is uploaded. Returns `string | null`.

### Lightbox extension for video / YouTube

[src/shared/ui/Lightbox.tsx](src/shared/ui/Lightbox.tsx) uses the YARLightbox **Video plugin** for MP4 slides (`type: "video"`, `sources: [{src, type}]`) — autoplay/fullscreen/PiP behaviour built in. YouTube slides (`type: "youtube"`, `videoId`) are rendered by our own `render.slide` that returns an iframe with `getYouTubeEmbedUrl(id)`. The library doesn't have a YouTube plugin, so we provide one ourselves via module-augmentation:

```ts
declare module "yet-another-react-lightbox" {
  interface SlideTypes { youtube: SlideYouTube }
  interface SlideYouTube extends GenericSlide { type: "youtube"; videoId: string; poster?: string; alt?: string }
}
```

Plus `render.thumbnail` covers both: `<video preload="metadata" muted>` for mp4 (browser shows first frame), `<img>` of YouTube `hqdefault.jpg` for YouTube. Both also get YARLightbox's standard Play overlay.

**Autoplay**: `VIDEO_SETTINGS.autoPlay = true` enables MP4 autoplay when the slide becomes active (plugin handles `offset === 0`). For YouTube, the iframe URL is built per-render — active slide gets `?autoplay=1&mute=1`, off-screen slides get the base URL so they don't all start at once. `mute=1` is required because cross-origin iframe autoplay is blocked without it on Chrome/Safari.

**Stability**: `slides` are memoized inside the Lightbox wrapper by a stringified slide-identity key, so a freshly-built `slides` array from the caller doesn't trigger YARLightbox's internal reducer to reset `globalIndex` and re-key the carousel slide (which would tear down the `<video>` element).

### Gallery extension for video

[src/shared/ui/Gallery.tsx](src/shared/ui/Gallery.tsx) — `GalleryImage` now accepts:
- `isVideo?: boolean` — adds a centered Play-icon overlay on the tile (used for both mp4 and YouTube thumbnails).
- `videoSrc?: string` — if set, renders a `<video preload="metadata" muted>` element instead of `<img>`, so the browser shows the actual first frame for MP4 thumbnails. YouTube thumbnails use `<img>` with `hqdefault.jpg`.

`render.image` now **passes `className` from `react-photo-album`'s props through** to both `<img>` and `<video>`. Critical: the library's `.react-photo-album--image` class sets `width: 100%; aspect-ratio: var(--photo-width)/var(--photo-height); display: block;` via CSS variables. Without it, `<video>` falls back to its natural intrinsic aspect (often 16:9 for phone clips) and renders a shorter tile than image siblings in the same row.

### Admin form

[VideoSection](src/pages_flow/panel/products/product-form/VideoSection.tsx) sits between `BasicInfoSection` and `VariantsSection`. Structure:
- `FormTileRadio name="video_mode"` toggle between `upload` and `youtube`.
- **Upload mode**: `<FormUploadZone>` with `name="video_file"`, `accept="video/*"`, `mimePrefix="video/"`, `noun="a video"`, `acceptLabel="MP4, WebM, MOV"`, `maxSizeMb={80}`, `multiple={false}`, `bucket="product-videos"`, `slug="product-video"`. `initialUrl` is populated only when DB value is mp4-kind.
- **YouTube mode**: `<FormInput name="video_youtube_url">`. `defaultValue` populated only when DB value is youtube-kind.

Mode autoresolves from `product?.video_url` via `getVideoKind` on mount. Switching modes unmounts the inactive input, so only the active value is submitted.

### Server actions ([src/pages_flow/panel/products/actions.ts](src/pages_flow/panel/products/actions.ts))

- `parseVideoUpload(formData)` reads `video_mode`, then either `parseFormVideo` (upload mode) or trimmed `video_youtube_url` (youtube mode). Validates via `isValidVideoUrl`. Returns `{ video_url, error? }`.
- `parseProductValues` runs `parseUploads` (images) and `parseVideoUpload` in `Promise.all`. Surfaces `videoError` as `fieldErrors.video_url` for the form.
- `cleanupRemovedVideo(oldUrl, newUrl)` — if old was an MP4 storage URL and changed, deletes the file from `product-videos`. Skipped for YouTube (external links). Called from `updateProduct` after the row update and from `deleteProduct`.

### Public + admin card (VideoButton)

[VideoButton](src/sections/products/components/VideoButton.tsx) — icon button (`Play` from `lucide-react`) overlaid in the bottom-right of every product card (public [ProductItem](src/sections/products/ProductItem.tsx) and admin [AdminProductCard](src/pages_flow/panel/products/AdminProductCard.tsx)) when `product.video_url` is set. Click stops propagation (so the card's `<Link>` doesn't fire) and opens a single-slide `<Lightbox>` directly on the current page — no navigation to product detail. Note and Video buttons share the same `bottom-right` corner via `flex flex-col-reverse gap-1.5`; Note sits below, Video stacks above.

### Product detail page

[ProductDetailImage](src/sections/products/components/ProductDetailImage.tsx) consumes `product.video_url` and appends a video entry to both the Lightbox slides array (`slides`) and the thumbnail strip (`restThumbnails`). Video tile is **always last** in the gallery; for MP4 it's rendered as `<video>` showing the first frame, for YouTube as an `<img>` of `hqdefault.jpg` — both with a Play overlay.

### Config — body size limits

Two limits in [next.config.ts](next.config.ts) must both clear the video size:
- `experimental.serverActions.bodySizeLimit: "100mb"` — applies to the action handler.
- `experimental.proxyClientMaxBodySize: "100mb"` — Next 16 middleware (`src/proxy.ts`) caps request body at **10 MB by default**, which truncates multipart uploads before they reach the action and surfaces as the very misleading `Unexpected end of form` from busboy. **Both** settings need bumping for video uploads to work; raising only `bodySizeLimit` does nothing if middleware is active.

### MOV / codec caveats

Browser support varies by codec inside the MOV container:
- H.264 inside MOV — plays in Chrome via the `getPlayableVideoMime` remap to `video/mp4`. Most phone MOVs fall here.
- HEVC / ProRes inside MOV — Chrome can't decode regardless of MIME. No frontend fix; would need server-side transcoding.

`DropZone` shows a toast for any react-dropzone rejection (size/type/count), so users get clear feedback when an upload silently fails the size cap or the MIME filter.

## Lightbox

`Lightbox` (`src/shared/ui/Lightbox.tsx`) wraps `yet-another-react-lightbox` with brand theming and three slide types.

- **API:** `<Lightbox open onClose slides={LightboxSlide[]} index? />`
- **`LightboxSlide` union:**
  - `LightboxImageSlide` — `{ src, alt?, width?, height? }` (or `{ type: "image", … }`).
  - `LightboxVideoSlide` — `{ type: "video", sources: [{src, type}], poster?, alt? }`. Rendered by YARLightbox **Video plugin** (autoplay/fullscreen/PiP built in).
  - `LightboxYouTubeSlide` — `{ type: "youtube", videoId, poster?, alt? }`. Rendered by our own `render.slide` as an `<iframe>` via `getYouTubeEmbedUrl(id)`; `youtube` type is added via module augmentation since YARLightbox has no YouTube plugin.
- **Plugins:** Zoom + Video always; Counter + Thumbnails added when `slides.length > 1`.
- **Autoplay:** `VIDEO_SETTINGS.autoPlay = true` for MP4 (plugin handles `offset === 0`). YouTube iframe URL gets `&autoplay=1&mute=1` only for the active slide (off-screen preloaded slides get the base URL so they don't all play at once). `mute=1` is mandatory for cross-origin iframe autoplay.
- **Custom thumbnails for non-image slides** via `render.thumbnail`: MP4 → `<video preload="metadata" muted>` first-frame; YouTube → `<img>` of `hqdefault.jpg`. Library's standard Play overlay sits on top.
- **Slide-identity memoization** (`stableSlides` via `useMemo` keyed on `slides.map(getSlideIdentity).join("\n")`) prevents YARLightbox's reducer from resetting `globalIndex` and re-keying the carousel slide when the caller rebuilds the `slides` array with same content — that re-key would tear down the `<video>` and reset playback.
- **Theming:** CSS variables inline — earth backdrop, white-warm buttons, orange active/thumbnail border.
- **Single image:** hides prev/next buttons, disables carousel loop.
- Replaces the old custom `ImagePreview` + `Dialog` pattern everywhere.

See **Product video** for the full set of changes when MP4/YouTube slides are involved (autoplay config, MOV remap, etc.).

## Sortable Upload Thumbnails

`SortableThumbnails` (`src/shared/ui/UploadZone/SortableThumbnails.tsx`) provides drag-and-drop reordering for uploaded images.

- **Library:** `@dnd-kit/react` v0.3 — `DragDropProvider` + `useSortable` from `@dnd-kit/react/sortable`
- **Components:** `SortableThumbnails` (container with `DragDropProvider`) → `SortableThumbnail` (individual draggable item)
- **Features:** "Main" badge on first item, 40% opacity while dragging, remove button on hover, drag handle button (GripVertical icon, bottom-left corner)
- **Drag handle:** Uses `useSortable({ handle: ref })` with `PointerSensor` and `activationConstraints: () => undefined` for instant activation. Drag only via handle button — prevents conflict with Lightbox click on image.
- **Reorder detection:** `isSortable(source)` in `onDragEnd`, reads `source.initialIndex` / `source.index`, applies via `moveItem()` utility
- **Integration:** `UploadZone` always renders `SortableThumbnails` for both URL and file modes. `SortableThumbnail` wraps the shared `Thumbnail` component.
- **Single item:** When only 1 image, `sortable={false}` hides drag handle and disables dnd via `disabled: true` on `useSortable`.

## Key business logic

- **PartnershipCTA** section (`src/sections/PartnershipCTA.tsx`) replaces the old InstagramCTA. It offers two contact channels: Instagram DM button (uses `NEXT_PUBLIC_INSTAGRAM_DM_URL` + `NEXT_PUBLIC_INSTAGRAM_BRAND_URL`) and an inline partnership inquiry form that submits via `useActionState` to a server action saving to `partnership_inquiries`. Always use `target="_blank" rel="noopener noreferrer"` for Instagram links. See `.env.example` for all Instagram env vars.
- **Product data** loaded from Supabase (with `image_url` + `images` from Storage). `mapDbProducts()` converts Supabase rows to the `Product` type, including variant mapping, image arrays, and promotion calculation.
- **Delivery fee** is `NEXT_PUBLIC_DELIVERY_FEE` env var (default 25 AED), defined in `src/shared/consts.ts`.
- **Product badge** — optional `badge` text field on both `products` and `categories` tables. Displayed via `Badge` component in `ProductHeader` and category cards. If empty/null, badge is hidden.
- **Nutrition** — dynamic fields stored as `Array<{ key, name, value }>` in `products.nutrition` JSONB. **Format is an array, not an object** — JSONB normalizes object keys (no order guarantee), but preserves array order, which is what makes admin-defined ordering survive a round-trip. Admin form (`NutritionSection` in [src/pages_flow/panel/products/product-form/NutritionSection.tsx](src/pages_flow/panel/products/product-form/NutritionSection.tsx)) allows adding / removing / **drag-and-drop reordering** fields. DnD via `@dnd-kit/react` (`useSortable` + `PointerSensor` with instant activation, `handle` ref) — same pattern as [SortableThumbnail](src/shared/ui/UploadZone/SortableThumbnail.tsx). Drag handle is a `GripVertical` button absolutely positioned at `top-0 left-0` over the label; on hover-capable devices it appears on `group-hover` and the label slides right via `translate-x-7` (with `transition-transform`); on touch devices (`@media(hover:none)`) the handle is always visible and the label is rendered with the offset upfront. Default 8 fields (Calories, Carbs, etc.) pre-populated for new products. `parseNutritionEntries` is **tolerant** — accepts the new array format **and** the legacy `Record<string, { name, value }>` shape so existing rows in the DB keep working without migration. The single normalization point is [`mapNutrition`](src/sections/products/utils/mapNutrition.ts) which always returns the array form, so `NutritionTable` in public UI iterates `nutrition.map(...)` (no `Object.values`).
- **Benefits** — managed via `BenefitsSection` with `MultiSelect` compound component. Supports inline creation (Popover form with name + description) and deletion. API: `POST/DELETE /api/options` with `entityType: "benefits"`. Benefits table: `benefits(id, name, description)`.
- **Product fields** `servingIdeas`, `occasions`, `tags`, `freeFrom` are all rendered **inside the collapsible Details block** on product cards/rows (not exposed on the card body). On detail pages (`ProductExpandedDetails`, public + admin) they're joined by `ingredients` — the 2×2 grid is Tags / FreeFrom / Serving / Occasions, with Ingredients full-width between Nutrition and the grid. On cards/rows `ingredients` stays visible above `ProductNote` (the one exception). Section wrappers with uppercase labels: `ProductTagsSection`, `ProductFreeFromSection`, `ProductIngredientsSection` (all in [ProductDetails.tsx](src/sections/products/components/ProductDetails.tsx)). `hasDetailsContent` considers all six fields when deciding whether to show the Details trigger.
- **Promotions** — `src/lib/promotionsDb.ts` handles CRUD. Promotions have `discount_type` (percentage | fixed), `discount_value`, date range, and `is_active` flag. Linked to products via `promotion_products` join table. Status is computed client-side via `getPromotionStatus()` (active | scheduled | expired) based on `is_active` + dates. Promotion list sorts active first.
- **Order fulfillment** — `orders.is_fulfilled` boolean field. Admin toggles via `FulfilledToggle` checkbox component (`src/pages_flow/panel/orders/FulfilledToggle.tsx`) with server action. Filterable in admin orders view (Fulfilled / Unfulfilled).

## Card grids

Products, categories and mixes all use a single compact-card layout (no row-variant, no view-mode toggle). Each card lives inside a responsive grid with public/admin breakpoint sets.

- **Products** — public + admin + favorites. Card: [ProductItem](src/sections/products/ProductItem.tsx) / [AdminProductCard](src/pages_flow/panel/products/AdminProductCard.tsx). Grid constants in [src/sections/products/ProductGridSkeleton.tsx](src/sections/products/ProductGridSkeleton.tsx):
  - `PUBLIC_PRODUCT_GRID_CLASS` — `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`.
  - `ADMIN_PRODUCT_GRID_CLASS` — `grid-cols-2 min-[800px]:grid-cols-3 min-[1024px]:grid-cols-2 min-[1124px]:grid-cols-3 min-[1400px]:grid-cols-4` (nonlinear — 2 cols in 1024–1123px where sidebar squeezes the content).
- **Categories** — public section + admin DnD grid. Card: [CategoryCard](src/sections/categories/CategoryCard.tsx) / [AdminCategoryCard](src/pages_flow/panel/categories/AdminCategoryCard.tsx). Grid constants in [src/sections/categories/CategoryGridSkeleton.tsx](src/sections/categories/CategoryGridSkeleton.tsx):
  - `PUBLIC_CATEGORY_GRID_CLASS` — identical to public products.
  - `ADMIN_CATEGORY_GRID_CLASS` — identical to admin products.
- **Mixes** — admin DnD grid only (no public mix grid — `/mix` is a constructor, `MixCTA` is a banner). Card: [MixCard](src/pages_flow/panel/mixes/MixCard.tsx). Grid: `ADMIN_MIX_GRID_CLASS` in [src/pages_flow/panel/mixes/MixesSkeleton.tsx](src/pages_flow/panel/mixes/MixesSkeleton.tsx) — same as admin products.

**Shared card anatomy** (all three domains):
- Root `<div>` with `h-full flex flex-col rounded-2xl bg-white-warm border` + hover shadow.
- Image aspect-3/2, `rounded-t-2xl overflow-hidden`. Image wrapped in `<Link>` for public (navigation target).
- Overlay slots: top-left — badges (SALE/BEST/NEW for products, `{cell_count} CELLS` + `Inactive` for mixes, optional `badge` for categories); top-right — `FavoriteButton` for public products, `Out of stock` for admin products, drag handle (GripVertical in a circle, `opacity-0 group-hover:opacity-100`) for admin categories/mixes; bottom-left — `ViewButton` (ArrowUpRight) for products; bottom-right — `NoteButton` (Info + tooltip) for products with `note`.
- Body `p-3 flex flex-col gap-2 grow`: header row (uppercase category/audience label + `Badge` same line), `ProductTitle` (capitalize, responsive clamp font), secondary line (ingredients/tagline/presets count), stacked footer `mt-auto` with primary action (Add to Cart / Explore) or admin actions pair (`Edit` + `Delete` via `min-[520px]:flex-row min-[520px]:flex-1`).

### Skeletons

Each grid owns its skeleton which mirrors the real card (image + header + title + line + footer):

- [src/sections/products/ProductGridSkeleton.tsx](src/sections/products/ProductGridSkeleton.tsx) — takes `count` + `variant: "public" | "admin"`.
- [src/sections/categories/CategoryGridSkeleton.tsx](src/sections/categories/CategoryGridSkeleton.tsx) — takes `count` + `variant: "public" | "admin"`.
- [src/pages_flow/panel/mixes/MixesSkeleton.tsx](src/pages_flow/panel/mixes/MixesSkeleton.tsx) — takes `count` only (admin-only).

Other list pages (promotions, promo-codes, delivery) have hand-rolled skeletons that copy their real card markup.

**Rule of thumb:** when creating a new list page, copy the real card's outer classes (`rounded-2xl`, `bg-white-warm`, padding) into the skeleton and use inner `<Skeleton>` blocks sized close to the real text/buttons.

### Admin DnD (categories + mixes)

`@dnd-kit/react` + `useSortable({ handle })` lives on the grid wrapper (`SortableCategoryGrid`, `SortableMixGrid`). The card receives `dragHandleRef` and wires it to the overlay `<Button>` top-right. `PointerSensor` with `activationConstraints: () => undefined` eliminates the 250ms touch delay. `reorderCategories` / `reorderMixesAction` server actions are called inside `useTransition` + `useOptimistic` for instant feedback.

## Category Sorting

Categories have a `sort_order` integer column. Order is controlled via drag-and-drop in admin `/panel/categories`.

- **DB:** `categories.sort_order` — new categories get `max(sort_order) + 1`
- **Admin UI:** `SortableCategoryGrid` (`src/pages_flow/panel/categories/SortableCategoryGrid.tsx`) — uses `@dnd-kit/react` with `useSortable({ handle })` for drag via GripVertical button only
- **Optimistic updates:** `useOptimistic` for instant reorder + `useTransition` for server action
- **Server action:** `reorderCategories(orderedIds)` → batch updates `sort_order` → `revalidatePath`
- **Everywhere sorted:** `getCategories()` uses `.order("sort_order")` — affects landing page categories, product filter bar, admin categories, product form dropdown
- **Touch support:** `PointerSensor` with `activationConstraints: () => undefined` removes 250ms touch delay

## Notifications

Multi-role notification system, **polling-only via TanStack Query** (no Supabase Realtime / WebSockets).

**Tables:**
- `notifications` — `user_id` (UUID, nullable) + `audience` (`user_role` enum, nullable). `user_id` set = personal notification. `user_id` NULL = broadcast. `audience` NULL = all roles, specific role = only that role.
- `notification_reads` — `(notification_id, user_id)` PK. Presence of row = read. Used for both personal and broadcast notifications.
- RLS enabled on both tables — users only see notifications targeted to them.

**Notification types:** `order_paid`, `order_failed`, `order_cancelled` (admin), `new_partnership` (admin), `new_promotion`, `new_product`, `new_category` (broadcast to all). Styles in `src/shared/ui/NotificationTypeConfig.tsx`. `new_order` is **legacy** — no longer created (was fired on PENDING-order creation, which created noise for unpaid abandoned checkouts), but its style/icon is kept in `TYPE_STYLES` so historical rows still render. Order-related admin notifications now only fire on the payment state transition (PAID/FAILED/CANCELLED).

**DB layer:** `src/lib/notificationsDb.ts` — `createNotification({ type, title, message?, relatedId?, audience?, userId? })`. Default `audience = "admin"`. Queries use left join on `notification_reads` to compute `is_read`. New users only see notifications created after their registration (`created_at >= user.created_at`). `getNotifications(..., sinceIso?)` accepts an optional ISO timestamp → adds `.gt("created_at", sinceIso)` for delta polling. The `idx_notifications_created_at` BTREE DESC index keeps these lookups cheap.

**TanStack Query setup.** Root layout wraps the tree in [`<ReactQueryProvider>`](src/providers/ReactQueryProvider.tsx) — a `QueryClient` instantiated via `useState` lazy initializer with defaults `refetchOnWindowFocus: true`, `refetchOnReconnect: true`, `staleTime: DEFAULT_STALE_TIME_MS` (30s), `retry: 1`. The exported `DEFAULT_STALE_TIME_MS` constant is reused by individual hooks that want to match the global cadence (`useNotificationsList`, `useNotificationsSinceQuery`, `useAutoRouterRefresh`).

**Provider decomposition.** `src/providers/notifications/` is split by concern:
- [`NotificationsProvider.tsx`](src/providers/notifications/NotificationsProvider.tsx) — thin provider, composes `useNotificationsBackgroundPolling` + `useServiceWorker`. Holds **no local notifications/list state** — exposes `userId`, `role`, `allowNotifications` (so consumer hooks can build their query keys), `unreadCount`, mutations (`markAsRead`/`markAllAsRead`/`refresh`), and push state.
- [`filters.ts`](src/providers/notifications/filters.ts) — `isNotificationForUser`, `formatNotificationMessage`, `filterByPermissions`, type `NotificationsListData`. Pure functions reused by both since-effect and list-select.
- [`queryKeys.ts`](src/providers/notifications/queryKeys.ts) — `notificationKeys` factory: `list(userId)`, `unread(userId)`, `since(userId)`. Centralised so every hook references the same keys.
- [`types.ts`](src/providers/notifications/types.ts) — public context types (`PushState`, `NotificationsContextValue`, `NotificationsProviderProps`).
- [`hooks/useNotificationsBackgroundPolling.ts`](src/providers/notifications/hooks/useNotificationsBackgroundPolling.ts) — orchestrator (~50 lines) that composes the focused sub-hooks below into the provider's return value `{ unreadCount, markAsRead, markAllAsRead, refresh }`.
- [`hooks/useUnreadCountCache.ts`](src/providers/notifications/hooks/useUnreadCountCache.ts) — holds the unread counter in TQ cache via `initialData` + `staleTime: Infinity` + `refetchOn*: false` (queryFn never actually runs). Mutated via `queryClient.setQueryData(notificationKeys.unread(userId), ...)` from the since-effect and from mutations. Stored in cache instead of `useState` so React-Compiler's "setState in effect" rule isn't violated.
- [`hooks/useToastDeduplicator.ts`](src/providers/notifications/hooks/useToastDeduplicator.ts) — returns `tryToast(n)` that fires `toastInfo` at most once per id per session via a `useRef<Set<string>>`. Prevents focus-refetch + interval double-toast.
- [`hooks/useNotificationsSinceQuery.ts`](src/providers/notifications/hooks/useNotificationsSinceQuery.ts) — pure delta fetcher: `useQuery` polling `/api/notifications?since=<iso>&limit=20` every `DEFAULT_STALE_TIME_MS` with `refetchOnWindowFocus + refetchOnReconnect`, `staleTime: 0`. The `since` anchor lives in a `useRef` (NOT in queryKey, so the cache entry is stable) and advances inside `queryFn` after each successful response.
- [`hooks/useApplySinceResults.ts`](src/providers/notifications/hooks/useApplySinceResults.ts) — side-effect bridge. Filters since-data via `isNotificationForUser`, fires `tryToast` for new ones, prepends them to the shared `notificationKeys.list(userId)` cache via `setQueryData` (so any mounted `useNotificationsList` consumer sees them instantly), and writes the authoritative server `unreadCount` to `notificationKeys.unread(userId)`. `onSuccess` was removed in TQ v5; this `useEffect` on `query.data` is the official replacement pattern.
- [`hooks/useMarkReadMutations.ts`](src/providers/notifications/hooks/useMarkReadMutations.ts) — pair of `useMutation` hooks with **optimistic update + rollback on error** via shared `snapshot()` / `restore(ctx)` helpers: `onMutate` cancels in-flight list queries, snapshots `prevList`/`prevUnread`, writes the optimistic state; `onError` restores the snapshot. Returns `mutateAsync` for each (TQ guarantees these references are stable, so they can flow into context value without re-renders).
- [`hooks/useNotificationsList.ts`](src/providers/notifications/hooks/useNotificationsList.ts) — consumer hook: pure `useQuery` wrapper around `notificationKeys.list(userId)` with `staleTime: DEFAULT_STALE_TIME_MS`. Returns the standard TQ result `{ data, isLoading, error, ... }`. Multiple consumers with the same `queryKey` share TQ's `ObserverCount` internally — first mounted observer triggers the HTTP fetch, last unmounted observer makes the query inactive. **There is no manual ref-counting in the provider** — TQ handles it. The `select` function applies `allowNotifications` filtering via `filterByPermissions` and is memoised by TQ.
- [`hooks/useServiceWorker.ts`](src/providers/notifications/hooks/useServiceWorker.ts) — SW registration, push subscribe/unsubscribe, auto-resubscription.

On `/checkout/result*` the page-level `<ResultToast>` and the toast from polling can both fire for the same `order_paid` / `order_failed` event when an admin places the order themselves; the page-level toast is the structured one, the polling toast is the same notification an admin in another tab would see — `toastedIdsRef` dedupe ensures at-most-once delivery within one session.

Accepts `role`, `userId`, `allowNotifications` props. When `allowNotifications = false`, broadcast notifications are hidden (personal still shown).

**Two queries. One shared cache.**

- **Background polling (always active for any authenticated user).** The `since` query runs unconditionally for any user with `role` + `userId`. Interval = 60s, plus immediate refetch on window focus / network reconnect (TanStack Query built-ins). Throttling: `refetchIntervalInBackground: false` skips polls when the tab is hidden, and TQ's own dedup window prevents bursts when both `focus` + `visibilitychange` fire in quick succession. Each poll sends `?since=<lastSeen>&limit=20` — payload is usually empty. The `since` anchor is stored in a `useRef` (NOT in queryKey, so the cache entry is stable) and advances inside `queryFn` after each successful response.
- **Lazy full list (consumer-driven).** Consumers call `useNotificationsList()` directly — TQ's observer count gates the fetch:
  - [NotificationBell](src/sections/navbar/NotificationBell.tsx) — the list query lives inside `BellPopoverBody`, which is rendered only as a child of `<PopoverContent>`. Since `PopoverContent` is conditionally rendered only when the popover is open ([Popover.tsx:230](src/shared/ui/Popover/Popover.tsx#L230) — `{open && (...)}`), the body component (and its `useNotificationsList()` hook) mounts on open / unmounts on close. Repeat opens within `staleTime: 30s` use the TQ cache without re-fetching.
  - [RecentNotifications](src/pages_flow/panel/dashboard/RecentNotifications.tsx) — `RecentNotificationsInner` calls `useNotificationsList()` directly. The component is only rendered on the admin dashboard `/panel/page.tsx` (admin-only via [proxy.ts](src/proxy.ts)), so it gates the lazy fetch by being mounted.
  - Both consumers use the same `queryKey` → one HTTP request even when both are mounted (e.g. admin opens the bell on `/panel`).
- **`EMPTY_NOTIFICATIONS` const.** Consumers fall back to a module-level constant array (`data?.notifications ?? EMPTY_NOTIFICATIONS`) instead of `?? []` — a fresh literal would change reference each render and invalidate downstream `useMemo` deps.
- **Cache cross-talk.** The `since`-effect and the `markAsRead`/`markAllAsRead` mutations all call `queryClient.setQueryData(["notifications", "list", userId], ...)`. Even if a NotificationBell user marks an item read while RecentNotifications is mounted on another tab/panel page, both consumers' `data` updates instantly because TQ broadcasts cache writes to all observers. No prop drilling, no provider state.
- **Toast deduplication.** `toastedIdsRef = useRef<Set<string>>(new Set())` tracks every notification id that has already been toasted in the current session. The since-effect calls `tryToast` which short-circuits if the id is already in the set. Net effect: each notification toasts at most once per session.
- **`since` anchor.** Initialized to `new Date().toISOString()` at hook mount. Polling reports notifications created strictly after that anchor; SSR `initialUnreadCount` already counted everything before mount, so the badge stays correct without a backfill request. The anchor advances on every poll that returns rows.

**User preferences:** `profiles.allow_notifications` boolean (default `true`). Toggle via `toggleNotifications()` server action in `src/pages_flow/profile/actions.ts`. UI: `NotificationSettingsSection` on profile page (non-admin only). Toggle calls `router.refresh()` to update provider props without page reload.

**Broadcast triggers:** Promotions (on activation), Products (on publish), Categories (on creation) — all send `audience: null` (all roles).

**UI:** `NotificationBell` in navbar (all logged-in users). `RecentNotifications` + `MarkAllReadButton` on admin dashboard. Both support clickable notifications with navigation.

**Notification links:** `related_id` stores UUID of the related entity. Clicking a notification navigates to the relevant page:
- `getNotificationHref(type)` in `src/shared/ui/NotificationTypeConfig.tsx` — static URLs (orders → `/panel/all-orders`, promotions → `/?sort=promotions#products`)
- `resolveNotificationHref(type, relatedId)` in `src/shared/utils/resolveNotificationHref.ts` — async, resolves product/category UUID → slug via `/api/notifications/resolve`
- Push notifications resolve URLs server-side via `getNotificationUrl()` in `src/lib/pushNotification.ts`

## Push Notifications (PWA)

Native push notifications via Web Push API + Service Worker.

**PWA setup:**
- Manifest: `public/favicon/site.webmanifest` (name, icons, start_url, display: standalone)
- Service Worker: `public/sw.js` — handles `push` (showNotification) and `notificationclick` (open/focus tab)
- No caching — SW only handles push events

**Server-side:** `src/lib/pushNotification.ts`
- `web-push` with lazy VAPID initialization (`ensureVapid()` — skips if env vars missing)
- `sendPushNotifications({ title, body, url, audience, userId })` — queries `push_subscriptions` joined with `profiles` for role/preference filtering
- Auto-cleanup of expired subscriptions (HTTP 410/404)
- Called from `createNotification()` as fire-and-forget

**Client-side:** `src/providers/notifications/hooks/useServiceWorker.ts`
- Registers SW on mount, resolves initial push state
- Auto-resubscribes if permission granted but subscription lost (unless user explicitly opted out via `PUSH_OPT_OUT_KEY` in localStorage)
- Exposes `subscribeToPush()`, `unsubscribeFromPush()`, `pushState` via context

**DB table:** `push_subscriptions` (user_id, endpoint UNIQUE, p256dh, auth). FK to both `auth.users` and `profiles`. RLS: users manage own subscriptions only.

**UI:** `PushNotificationSection` (`src/pages_flow/profile/PushNotificationSection.tsx`) — shown for all roles on profile page. States: unsupported, prompt, granted, subscribed, denied.

**Env vars:** `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (same as public key, exposed to client).

## Analytics (Google Analytics 4)

GA4 wired via `@next/third-parties/google`. Single-source helper at [src/lib/analytics.ts](src/lib/analytics.ts) wraps `sendGAEvent` with typed `trackXxx` functions and item-mappers (`cartItemToGAItem`, `productToGAItem`). All e-commerce events carry `currency: "AED"`.

### Loading

[src/app/_components/Analytics.tsx](src/app/_components/Analytics.tsx) — server component that mounts `<GoogleAnalytics gaId={NEXT_PUBLIC_GA_ID}>` if the env var is set. **Cookie consent does NOT gate GA loading** (decision: maximize tracking volume; banner exists for compliance disclosure but doesn't block analytics). The cookie value is only used to track Accept/Decline as a `cookie_consent` event in [CookieConsent.tsx](src/shared/ui/CookieConsent.tsx).

### Server-action → client GA bridge

`sendGAEvent` is client-only (writes to `window.dataLayer`), but auth flows finish with `redirect()` from server actions — the form's React state is gone and we can't fire from a `useEffect`. Solution:

- **[withGAEvent](src/shared/utils/analyticsParams.ts)** (pure, no `"use client"`) — appends `?_ga_event=<name>&_ga_method=<method>` to the redirect URL. Used in [signIn](src/pages_flow/login/actions.ts), [verifyOtp](src/pages_flow/verify-email/actions.ts), and [auth/callback/route.ts](src/app/auth/callback/route.ts).
- **[GAEventDispatcher](src/app/_components/GAEventDispatcher.tsx)** — client component mounted in root layout inside `<Suspense fallback={null}>` (required because `useSearchParams` opts out of SSR). Reads the param on mount, fires the event, then strips the param via `router.replace()` so refresh doesn't re-fire. Internal `fired.current` ref blocks Strict Mode double-firing.

This pattern handles `login` (email + Google) and `sign_up`. Add new server-side-triggered events by importing `withGAEvent` in the action and adding a case in `GAEventDispatcher`.

### Event catalog

**E-commerce voronka** — standard GA4 events, populate Monetization reports automatically:

| Event | Where | Notes |
|---|---|---|
| `view_item_list` | [ProductGrid.tsx](src/sections/products/ProductGrid.tsx) — `useTrackViewItemList` hook | Fires on category change, ref-guard blocks dups on search/sort changes |
| `view_item` | [ProductDetailPage.tsx](src/pages_flow/products/ProductDetailPage.tsx) | `useEffect` + ref-guard, uses `selectedVariant` for price |
| `add_to_cart` / `remove_from_cart` | [useCartActions.ts](src/providers/cart/useCartActions.ts) | Sends **delta** quantity (not totals), so revenue maths reconcile |
| `view_cart` | [CartPage.tsx](src/pages_flow/cart/CartPage.tsx) | After `isHydrated && items.length > 0`, ref-guard |
| `begin_checkout` | [CheckoutFormSection.tsx](src/pages_flow/checkout/ui/CheckoutFormSection.tsx) | On mount, includes `coupon` if applied |
| `purchase` (key event) | [page.tsx](src/app/checkout/result/page.tsx) → [ResultToast.tsx](src/app/checkout/result/ResultToast.tsx) | See **Purchase pipeline** below |

**Auth** — via redirect-param dispatcher:
| Event | Trigger |
|---|---|
| `sign_up` | Successful `verifyOtp` redirect (= email confirmed, account active) |
| `login` | Successful `signIn` (email) or `auth/callback` (google) |

**Engagement / wishlist:**
| Event | Where |
|---|---|
| `add_to_wishlist` / `remove_from_wishlist` | [FavoritesProvider.toggleFavorite](src/providers/FavoritesProvider.tsx) — accepts optional `WishlistMeta` to send `item_name`, `price`, `item_category`. `FavoriteButton` passes meta from full `Product` it receives as prop |

**Custom business events:**
| Event | Where |
|---|---|
| `mix_assemble` | [MixBuilderPage.handleAddToCart](src/pages_flow/mix/MixBuilderPage.tsx) — fires alongside `add_to_cart` |
| `apply_coupon` / `coupon_invalid` | [PromoCodeInput.tsx](src/pages_flow/cart/ui/PromoCodeInput.tsx) — success carries `coupon`, `discount`, `discount_type`, `scope`; failure carries `coupon` + `error` |
| `partnership_inquiry` | [PartnershipForm.tsx](src/sections/partnership/PartnershipForm.tsx) — on `state.success` |
| `cookie_consent` | [CookieConsent.tsx](src/shared/ui/CookieConsent.tsx) — `consent: "accepted" \| "declined"` |

### Purchase pipeline (special case)

`purchase` requires extending the server-side data flow because [ResultToast.tsx](src/app/checkout/result/ResultToast.tsx) originally received only formatted display strings (`title`, `parts`):

1. [page.tsx](src/app/checkout/result/page.tsx) `transitionOrderStatus` SELECT extended to include `promo_codes(code)` and `order_items(price)`. `OrderItem` and `SettledOrder` interfaces updated accordingly.
2. `buildPurchasePayload(order)` collects `transaction_id`, `value`, `items[]` (with `item_id` falling back to `name` for mix rows where `variant_id` is NULL — mix variants are deleted by `cleanupOrphanedMixVariants` after payment), and optional `coupon`.
3. `<ResultToast>` accepts a new `purchase: PurchasePayload | null` prop and calls `trackPurchase(purchase)` inside the existing `fired.current` ref-guard.

**Idempotency** — `transitionOrderStatus` uses `.neq("status", newStatus)` so the row is returned only on the first state transition. On refresh of `/checkout/result?ref=...`, `settledResult === null` → `purchasePayload === null` → no event. Webhook ([api/payment/webhook](src/app/api/payment/webhook/route.ts)) cannot fire client GA (server-only), so the result page is the single source for `purchase`.

**Manual admin orders** ([src/pages_flow/panel/orders/manual-order/actions.ts](src/pages_flow/panel/orders/manual-order/actions.ts)) deliberately do NOT fire `purchase` — those are off-platform sales (WhatsApp/Instagram) that shouldn't inflate GA revenue.

### GA4 Admin TODOs

Not configurable from code — set up once in the GA4 dashboard:
- **Key events** (Admin → Настройки ресурса → События → Ключевые события): `purchase` is auto-marked. Manually mark `sign_up` and `partnership_inquiry`.
- **Custom dimensions** (Admin → Custom definitions → Custom dimensions, scope=Event): `consent`, `method`, `coupon`, `box_id`, `business_type` — required only if you want to filter/group standard reports by these params (Realtime/DebugView already shows them).

A user-facing summary of all events lives in [GA_EVENTS.md](GA_EVENTS.md) at the repo root.

## Address system

`AddressWithMap` (`src/shared/ui/AddressWithMap.tsx`) — 5 fields: Emirate (select), City, Area, Building (all with `AddressSuggestInput` for Google Places suggestions), Flat/Villa. Bidirectional sync with Google Maps:
- **Fields → Map:** debounced forward geocoding on manual input (700ms)
- **Map → Fields:** reverse geocoding on map click
- **Suggestion select → Map:** `PlacesService.getDetails` for coordinates + `extractAddressParts` for emirate

`AddressSuggestInput` (`src/shared/ui/AddressSuggestInput.tsx`) — wraps `DropdownMenu` (controlled mode) + `FormInput`. Uses `AutocompleteService.getPlacePredictions` with `types` and `locationBias` per field.

Address utilities in `src/shared/utils/address.ts`:
- `composeAddress({ emirate, city, area, buildingName, flatNumber })` → string (always includes city for correct round-trip parsing)
- `parseAddress(string)` → `ParsedAddressProps` (extracts fields from composed string)
- `displayAddress(address)` → string (like composeAddress but skips city when equals emirate — for UI display)
- `shortAddress(address)` → string (area + city? + emirate — compact display for cards)

## Phone validation

All phone fields use `FormPhoneInput` (displays `0XX XXX XXXX`, submits normalized `+971XXXXXXXXX` via hidden input). Shared validation in `src/shared/utils/validatePhone.ts`:
- `normalizePhone(raw)` — accepts `0501234567`, `501234567`, `+971501234567`, `971501234567` → returns `+971501234567`
- `formatPhoneDisplay(raw)` — formats for display as `0XX XXX XXXX`
- `validatePhone(phone, { required })` — validates against `/^\+971[0-9]{9}$/`

Used by `validateCustomer.ts`, `validateProfile.ts`, `validatePartnership.ts`.

**International phone support.** Although the default display/validation is UAE (`+971`), `FormPhoneInput` is intentionally built as a full international input — it wraps `react-phone-number-input/max` with complete country metadata, `libphonenumber-js` for per-country validation, and a searchable country selector with `country-flag-icons` unicode flags. Users can switch country, paste numbers in any format, and get country-aware formatting/validation out of the box. This is a deliberate bundle-size trade-off (~300 KB for full metadata) in exchange for a friction-free UX for international customers — do not swap it for a UAE-only masked input. If bundle size matters on a specific route, prefer `next/dynamic` with conditional render over replacing the component.

## WhatsApp integration

Two pieces, both built around `https://wa.me/{digits}` (phone stripped to digits with `phone.replace(/\D/g, "")`, so the stored `+971…` format works without conversion).

### Floating support widget

[`<WhatsAppFloatingButton phone={...} />`](src/shared/ui/WhatsAppFloatingButton.tsx) is mounted in [layout.tsx](src/app/layout.tsx) only when `NEXT_PUBLIC_WHATSAPP_SUPPORT_PHONE` is set. It's a `<motion.div fixed bottom-6 right-6 z-40>` containing a 44px circular `Button` with the `IconWhatsApp` glyph in pure white on the WhatsApp brand green.

- **Hidden on `/panel/*`** — admins are the support, so `usePathname().startsWith("/panel")` short-circuits the render.
- **Entrance** — slides in from the right via `initial={{ opacity: 0, x: 100 }}` → `animate={{ opacity: 1, x: 0 }}` (`0.5s easeOut`, `delay: 0.6s`).
- **Pulse halo** — an `aria-hidden` `motion.span` at `absolute inset-0 rounded-full bg-whatsapp pointer-events-none` runs `scale: [1, 1.6]` + `opacity: [0, 0.45, 0]` forever (`duration: 2.4s`, `easeOut`). Both ends of the cycle are at opacity 0 to avoid the visible snap that happens at the loop boundary if you start the cycle at a non-zero opacity.
- **Hover scale** — `hover:scale-115` on the Button, eased by Button's existing `transition-all duration-300`.
- **Tab-bar dodge (mobile only)** — wraps a nested `motion.div` that animates `y` between `0` and `-72px`. `tabBarVisible` is computed with the **same** `current > prev && !atBottom` scroll heuristic [`NavMobileTabBar`](src/sections/navbar/NavMobileTabBar.tsx) uses, so the widget and the tab bar flip together. Mobile detection uses `useSyncExternalStore(subscribeMobile, getMobileSnapshot, getMobileServerSnapshot)` against `matchMedia("(max-width: 1023.98px)")` — same breakpoint as the tab bar's `lg:hidden`. On `lg+` `isMobile` is `false` so the lift never engages.

### Admin orders WhatsApp button

[`<WhatsAppLink phone={...} />`](src/pages_flow/orders/ui/WhatsAppLink.tsx) — small icon-only `Button` (`size="icon"` + `text-moss/60 hover:text-moss`) wrapped in a `Tooltip`, opens `https://wa.me/{digits}` in a new tab. Mounted next to the existing `CopyText` phone in both the admin desktop `customerColumn` ([columns.tsx](src/pages_flow/orders/columns.tsx)) and the mobile [`AdminOrderCards`](src/pages_flow/panel/orders/AdminOrderCards.tsx) footer, giving admins a one-click way to message a customer about their order.

### CSS tokens

Brand green is exposed via `@theme` in [globals.css](src/app/globals.css):
- `--color-whatsapp: #25d366` → `bg-whatsapp` / `border-whatsapp`
- `--color-whatsapp-hover: #1ebe5d` → `bg-whatsapp-hover` / `border-whatsapp-hover`

These are integration colours (third-party brand), not part of the design palette in **Design system** — keep them out of generic UI surfaces.

## Server Actions standard

All `actions.ts` files follow this pattern (canonical example: `src/pages_flow/profile/actions.ts`):

```ts
"use server";

// Import the appropriate Supabase client (see client selection guide above)
import { supabaseAdmin } from "@/lib/supabase.server";
// or: import { createSupabaseServerClient } from "@/lib/supabase.server";

// 1. Export a typed State interface from the same file
export interface FooState {
  success?: boolean;
  error?: string;           // top-level DB/network error message
  fieldErrors?: {           // per-field validation errors
    name?: string;
  };
  values?: Partial<FooInfo>; // echo back form values for repopulation on error
}

// 2. Action signature for useActionState: (_prevState, formData) => Promise<State>
export async function createFoo(
  _prevState: FooState | null,
  formData: FormData,
): Promise<FooState> {
  const name = (formData.get("name") as string)?.trim();

  // 3. Collect field errors into an object, return early if any
  const fieldErrors: FooState["fieldErrors"] = {};
  if (!name) fieldErrors.name = "Name is required";
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors, values: { name } };

  // 4. DB call
  const { error } = await supabaseAdmin.from("foos").insert({ name });
  if (error) return { error: "Failed to save. Please try again.", values: { name } };

  return { success: true };
}

// 5. For actions bound with .bind(null, id), id comes before _prevState
export async function updateFoo(
  id: string,
  _prevState: FooState | null,
  formData: FormData,
): Promise<FooState> { ... }
```

**Rules:**
- `"use server"` always at top
- State interface exported from the same `actions.ts` file
- Validation collects all field errors before returning — never throw, always return state
- Top-level DB errors go in `error`, field-level errors go in `fieldErrors`
- **Always return `values` on every error path** so `defaultValue={state?.values?.fieldName}` repopulates user input. On success, omit `values` — fields are cleared via the native form-reset pathway (see "Form reset after submit" below).
- Never use `supabaseAdmin` for auth-identity operations — use `createSupabaseServerClient()` instead
- Actions that need the current user must call `createSupabaseServerClient()` and redirect to `/login` if no session
- **All actions must have try-catch.** `redirect()` throws `NEXT_REDIRECT` — rethrow it: `if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;`. Catch returns `{ error: "Something went wrong. Please try again.", values }`.
- **All forms must show toast on errors.** In the `useEffect` that watches `state`, add: `if (state?.error) toastError(state.error); if (state?.fieldErrors) toastError("Please fill in the required fields");`

## Form state sync with server actions (no `useFormReset`)

When a server action returns and `useActionState` commits a new state with `state.values` (the echoed-back form data on validation error), uncontrolled inputs (`FormInput`, `FormTextarea`) re-read `defaultValue` automatically because React 19 fires the form `reset` event after action commit. Controlled inputs that hold their own state — `FormPhoneInput`, `FormSelect`, `FormTimePicker`, `FormRichTextarea`, `AddressWithMap` — need to **explicitly re-sync internal state when `defaultValue` changes**.

We previously had a `useFormReset` hook that listened to the form's `reset` event. It was racy: in `useActionState` flows the `reset` event dispatched **before** the new state committed, so the callback's closure had `defaultValue` from the render *before* the latest one. The user-visible symptom was fields snapping back to stale values that had already been overwritten.

**Use the in-render setState pattern** ([React's official "adjust state on prop change"](https://react.dev/reference/react/useState#storing-information-from-previous-renders)):

```ts
const [internalValue, setInternalValue] = useState(defaultValue);
const [prevDefaultValue, setPrevDefaultValue] = useState(defaultValue);
if (defaultValue !== prevDefaultValue) {
  setPrevDefaultValue(defaultValue);
  setInternalValue(defaultValue);
}
```

For components with multiple defaults (e.g. `AddressWithMap` has 7), build a composite key:
```ts
const defaultsKey = `${defaultEmirate}|${defaultCity}|${defaultArea}|…`;
const [prevDefaultsKey, setPrevDefaultsKey] = useState(defaultsKey);
if (defaultsKey !== prevDefaultsKey) {
  setPrevDefaultsKey(defaultsKey);
  // re-sync every internal state from the corresponding default*
}
```

For wrappers around third-party editors that only read initial value at mount (e.g. BlockNote in `FormRichTextarea`), additionally pass `key={prevDefaultValue}` to force a remount with the new initial.

Form-level glue: parent passes `state?.values?.X` (or destructured) directly to each input's `defaultValue` — `PartnershipForm`, `ManualOrderForm`, `CheckoutFormSection` all do this. **Do not** add `key={state?.attempt}` on the form element to force remount; it's the wrong idiom.

## Animations

Import as `import { motion } from "motion/react";`. Used in Navbar (scroll-driven header opacity) and below-the-fold sections (PhilosophyBlock, PartnershipCTA). **Prefer CSS animations over motion/react for above-the-fold content** — Hero uses CSS `@keyframes` + `animation-timeline: scroll()` for parallax (0 JS). AboutUs and CategoryGrid use CSS `animate-hero-fade-up` / `animate-about-stagger` classes defined in `globals.css`.

Any section that uses `motion` hooks (`useScroll`, `useTransform`) must add `"use client"` at the top of the file.

## Query caching

Use `React.cache()` for Supabase queries called from multiple server components in the same render. Already cached: `getCategories`, `getPublishedProducts`, `getProductSalesMap`, `getProductBySlug`, `getProductFormOptions`, `getDeliverySettings`, `getPromotions`, `getPromotionProductOptions`. Wrap new shared queries the same way:

```ts
import { cache } from "react";
export const getFoo = cache(async (): Promise<Foo[]> => { ... });
```

## Search optimization

Product/order/inquiry list pages use a shared pattern for search:
1. **Pre-computed search index** — `buildSearchIndex(items)` builds lowercase haystack once per data change, not on every keystroke
2. **`useDeferredValue`** — defers search input so typing stays responsive while filtering catches up
3. **Filter hook** — `useFilteredProducts`, `useFilteredAdminProducts`, `useFilteredOrders`, `useFilteredInquiries` encapsulate search index + deferred value + all filter logic

## Hydration safety

**Never use `useId()` in compound UI components** (`Select`, `Tooltip`, `Popover`, `DropdownMenu`, `Dialog`, `MultiSelect`). React's `useId()` generates different IDs on server vs client inside Suspense boundaries, causing hydration mismatch. All these components use context-based state without ID-based ARIA linking.

## Navigation & scroll

- **CSS `scroll-behavior: smooth`** in `globals.css` handles all smooth scrolling natively.
- **`HashLink`** (`src/sections/navbar/HashLink.tsx`) — wraps `next/link` `Link` with `scroll={false}`. Same-page: `router.push(path)` + `requestAnimationFrame` → `scrollIntoView`. Cross-page: `router.push(path)` + `MutationObserver` waits for target element → `scrollIntoView`. Dispatches `hashchange` event for `useActiveHash`.
- **`HashTracker`** (`src/app/_components/HashTracker.tsx`) — scroll-spy on home page. Uses `IntersectionObserver` to update URL hash as user scrolls through sections. `MutationObserver` handles Suspense-deferred sections. Dispatches `hashchange` event (no polling).
- **`useActiveHash`** (`src/sections/navbar/useActiveHash.ts`) — `useSyncExternalStore` listening for `hashchange` + `popstate` events (no polling).
- **Scroll restoration** — inline `<script>` in `layout.tsx` with `history.scrollRestoration = "manual"` + sessionStorage save/restore (needed because native restoration fails with Suspense streaming).
- **Navigation links** — shared source of truth in `src/shared/consts/navLinks.ts`. `SectionId` enum (`Hero`, `About`, `Mix`, `Promo`, `Categories`, `Products`, `Story`, `Contact`), `SECTION_IDS = Object.values(SectionId)` (used by `HashTracker`), `NAV_LINKS` and `TAB_LINKS` (typed with `NavLink<T>` generic). Used by Navbar, NavMobileTabBar, Footer, and HashTracker. The mobile tab bar (`NavMobileTabBar`) hides text labels under `500px` and enlarges the icon (`w-5.5`) to keep tap targets comfortable when only the glyph is visible; `<500px` labels are kept as `sr-only` for screen readers.

## Product sorting

- **Sort utility** — `src/sections/products/utils/sortProducts.ts` — `sortProducts(products, sortKey)` and generic `sortBySortKey(items, sortKey)`.
- **Sort keys:** `""` (recommended: promotions → best-sellers → category), `"promotions"`, `"best-sellers"`, `"category"`.
- **Sales data** — `getProductSalesMap()` in `productsDb.ts` aggregates `order_items` quantities by product_id for paid orders.
- **`totalSold`** field on `Product` type — populated by `mapDbProducts(raw, salesMap)`.

## SEO

**Root structured data** (`src/app/structured-data.ts`) — injected in root layout:
- `Organization` + `LocalBusiness` (Dubai, UAE, AED)
- `WebSite` with `SearchAction` (sitelinks search box)
- `WebPage` (root)

**Home page** (`src/app/page.tsx`):
- `generateMetadata()` — dynamic title/description when `?category=slug` is present (reads category data from DB)
- `CollectionPage` JSON-LD (`src/app/home-structured-data.ts`) — ItemList of categories with BreadcrumbList

**Product detail pages** (`src/app/products/[id]/page.tsx`):
- **Product schema** — with `AggregateOffer` for multi-variant pricing, promotion `priceValidUntil`, `additionalProperty` for tags/freeFrom, all images.
- **BreadcrumbList** — Home → Category → Product.
- Structured data builders in `src/app/products/[id]/structured-data.ts`. `buildDescription(dbProduct, product)` is **shared between `generateMetadata` and the Product JSON-LD** so the meta-description and schema description stay in sync (tagline + tags + `Free from: …`).
- `generateMetadata` returns `alternates.canonical` per-slug, `twitter` card (summary_large_image), `keywords` from `product.tags`, `openGraph.images` = full `[image_url, ...images]`, `openGraph.url` per-slug.
- **Back navigation** — `FROM_MAP` maps `?from=` param to back button href/label (e.g. `?from=favorites` → "Back to favorites", `?from=cart` → "Back to cart"). Default: "Back to products" → `/#products`.

**Mix page** (`src/app/mix/page.tsx`):
- `generateMetadata` sets canonical `${siteUrl}/mix`, OG/Twitter image = first active `mix_box.image_url` (fallback to root `/og-image.jpg` if no active boxes).
- `CollectionPage` JSON-LD with `ItemList` of active boxes + `BreadcrumbList` — both from `src/app/mix/structured-data.ts` (`buildMixCollectionJsonLd`, `buildMixBreadcrumbJsonLd`). Individual boxes are **not** separate URLs — they live under `/mix?box={slug}` query params, so only `/mix` is in sitemap (avoids canonical conflicts).

**Indexing** — private routes have `robots: { index: false }`: `(auth)/*`, `/cart`, `/checkout/*`, `/panel/*`. `robots.ts` disallows these paths for crawlers. Sitemap (`src/app/sitemap.ts`) includes `/`, `/mix`, and `/products/*`.

**Production `PUBLIC_BASE_URL`** — `metadataBase` in [src/app/metadata.ts](src/app/metadata.ts) reads this env var. If it's unset or points to `localhost`, all `og:image`/`canonical`/JSON-LD URLs become broken in production and crawlers fall back to the root-layout defaults (which looks like "generic site info instead of page info"). Always set this to the live origin in `.env.production`.

## Error pages

- **`src/app/not-found.tsx`** — 404 page (server component, renders inside layout)
- **`src/app/error.tsx`** — route error boundary (`"use client"`, receives `error` + `reset`)
- **`src/app/global-error.tsx`** — root layout error (`"use client"`, own `<html><body>`, inline styles with brand colors)

## Soft delete for upload images

In edit mode, `FormUploadZone` uses soft delete for existing images — marking them as deleted visually without removing from Storage until form is saved. This prevents broken image URLs if admin navigates away without saving. New images uploaded in the session are deleted immediately on remove. `cleanupRemovedImages()` in server actions handles actual Storage deletion on save.

## Inventory (stock + cost)

Per-product weight-based stock tracking with auto-deduction on PAID orders (regular variants and mix presets), an append-only audit log, and dashboard profit reporting. SQL ships as a separate file `inventory_migration.sql` at the repo root (apply manually via Supabase SQL Editor) — same convention as `delivery_slots_migration.sql`.

### Data model

Two new tables (see **Supabase → DB tables** for exact column lists):

- **`product_inventory`** — 1-to-1 with `products` via UNIQUE(product_id), one row per non-system product. Holds operational fields (`stock_g`, `low_stock_threshold_g`, `cost_per_100g`) deliberately separated from the `products` row so catalog edits don't churn inventory state and vice versa. `updated_at` auto-bumps on every UPDATE via `BEFORE UPDATE` trigger — used by `getInventoryRows` to surface recently-touched products to the top.
- **`stock_movements`** — append-only journal. Every change writes a row: `delta_g` (signed grams), `reason` (`order_paid | restock | correction | damage | manual_adjust`), `order_id` (only for `order_paid`), `note` (sanitized HTML, supports rich text), `created_by`. **`UNIQUE(order_id, product_id)` is the idempotency lock** — webhook + result-page paths can both call `deductInventoryForOrder` and the second one no-ops cleanly.

Mix-system products (`products.status = 'system'`, virtual containers for mix boxes) deliberately have **no** inventory row — deduction routes to the underlying preset products' inventory pools.

### Auto-deduction on PAID

[`deductInventoryForOrder(orderId)`](src/lib/inventoryDb.ts) — single helper invoked from all three PAID entry points (webhook, `/checkout/result` `settleOrder`, manual admin order action) inside a `Promise.all` block alongside other side-effects.

Algorithm:
1. One JOIN-query: `order_items` + `product_variants.product_id` + `products.status` for regular rows.
2. Build `Map<product_id, total_grams>`:
   - regular row: `weight_g × quantity` (skip if `products.status = 'system'`).
   - mix row: iterate `mix_composition[]`, sum `entry.weight_g × entry.count × row.quantity` per `entry.product_id` (this is why `MixCompositionEntry.product_id` is a load-bearing field).
3. Bulk INSERT into `stock_movements` with `ON CONFLICT (order_id, product_id) DO NOTHING RETURNING product_id`. Empty RETURNING ⇒ `alreadyDeducted: true`, exit.
4. For each successfully inserted movement: UPSERT `product_inventory` with `GREATEST(0, prev + delta)` so stock never goes below zero in the UI even if business logic miscounts.

### Admin pages

- **`/panel/inventory`** ([app/panel/inventory/page.tsx](src/app/panel/inventory/page.tsx)) — list of all non-system, non-archived products with current stock, threshold, cost, status (In stock / Low / Out). Mobile = `DataCardList` cards via `InventoryCard`; desktop = `DataTable` with sortable columns via `inventoryColumns`. Toolbar: search by title + status filter, both URL-synced via `SearchParamsFilterProvider`. Server-side rows are sorted by `product_inventory.updated_at DESC` (so the just-adjusted product floats to the top), with `product_title` as tiebreaker; rows without an inventory row sink to the bottom (`-Infinity` ts).
- **Three dialogs** managed by [`InventoryActionsProvider`](src/pages_flow/panel/inventory/InventoryActionsProvider.tsx) — clicked from row actions (with tooltips on icon-only buttons in the desktop table; icon-only Adjust/Settings/History tooltips are absent on mobile cards because hover doesn't work on touch):
  - **Adjust** ([AdjustStockForm](src/pages_flow/panel/inventory/AdjustStockForm.tsx)) — `delta_g` (positive or negative integer via `FormNumberInput`), `reason` from `restock | correction | damage | manual_adjust`, optional `note` rendered as `FormRichTextarea`. Server-action sanitizes the HTML via `sanitizeNoteHtml`. On success, the form invalidates the local movements cache (see below). Info-tooltip on the `Change (grams)` label explains `Positive number to restock, negative to write off.`
  - **Settings** ([EditInventoryForm](src/pages_flow/panel/inventory/EditInventoryForm.tsx)) — edit `cost_per_100g` and `low_stock_threshold_g` only (no stock changes — those go through Adjust). Info-tooltip on the threshold label.
  - **History** ([MovementsHistory](src/pages_flow/panel/inventory/MovementsHistory.tsx)) — `DataTable` of last 50 movements for one product (`Date · Reason · Δ · Note`) with local `useTableSort` + `useTablePagination`, no URL state (it's modal-scoped). Footer link `View all history → /panel/inventory/history?product=…` opens the global page pre-filtered. Module-level `Map<product_id, StockMovement[]>` cache makes reopening the same product instant; `invalidateMovementsCache(productId)` is exported and called from `AdjustStockForm` after success.
- **`/panel/inventory/history`** ([app/panel/inventory/history/page.tsx](src/app/panel/inventory/history/page.tsx)) — full audit log, parallel `Promise.all` loads `getAllMovements(1000)` + `getInventoryRows()` (the latter purely to get product options for the filter so even products *without* movements appear in the dropdown). Toolbar: text search (matches product title and note, with `stripHtml` so rich-text content is searchable as plain text), `MultiSelect` for reasons, `MultiSelect` for products (with `maxVisibleTags={2}` so the trigger doesn't blow up the toolbar grid when several are selected). Mobile = `HistoryCard` (1-line layout: thumbnail + product + delta + meta), desktop = `DataTable` with sortable columns via `historyColumns`. Both reuse `useInventoryTable` (URL-synced sort + pagination, default page size 10).

### Admin dashboard (`/panel`)

The dashboard is intentionally narrow: it shows **performance for the selected period** (single date selector at the top drives everything in this section), **operational tasks that need action** (current state, not period-filtered), **most recent registrations**, and **recent notifications**. Active promotions / promo codes / catalog stats / delivery total — all moved out, accessible from their own `/panel/*` pages.

Four blocks, in order:

1. **Performance** — [`<ProfitOverview />`](src/pages_flow/panel/dashboard/sections/ProfitOverview.tsx) (server shell + client inner, same pattern as `RecentNotifications`).
   - Server: [`getProfitClientData()`](src/pages_flow/panel/dashboard/profitQueries.ts) runs **two parallel queries** — paid `order_items` (with order `updated_at`, `promo_discount` per unit, regular product info, and mix `mix_composition`) + all PAID/FAILED/CANCELLED orders (status, `updated_at`, `total`) — plus a batch cost map for every `product_id` referenced. One round-trip; client filters by range and aggregates.
   - Client: [`ProfitOverviewInner`](src/pages_flow/panel/dashboard/sections/ProfitOverviewInner.tsx) reads the `range` filter via `useFilterBar("range")` (URL-synced through a thin `SearchParamsFilterProvider`), filters items by `paid_at >= resolveRangeFromMs(range)` and orders by `changed_at`, aggregates everything in a single `useMemo`. Switching the range pill is **instant** — no server roundtrip.
   - 4 `StatCard`s:
     - **Revenue** — `Σ((price − promo_discount) × quantity)` for PAID order_items in period. Net of product promotions **and** promo codes; excludes delivery fee.
     - **Profit** — `Revenue − COGS`, with `{margin}% margin · Healthy/Watch/Low` sub colour-coded `≥30% moss / 10–30% orange / <10% red`.
     - **Orders** — count of PAID orders in period; sub `Avg AED X` = `Σ orders.total / paidCount` (the AOV includes delivery fee, since that's what the customer paid).
     - **Issues** — count of FAILED + CANCELLED in period; sub `{N} failed · {M} cancelled` in red, or `All clear` in moss when zero.
   - **Promo-code apportionment in mix top sellers:** for mix lines, per-cell revenue is scaled by `(price − promo_discount) / price` so per-product attribution sums back to the line revenue. COGS attribution is independent of selling price.
   - "Top sellers" list (was "Top profit products") — desktop = `DataTable` with sortable columns (`Product · Revenue · Cost · Profit · Margin`), mobile = `DataCardList` rows.
   - [`<DateRangeSelector />`](src/pages_flow/panel/dashboard/DateRangeSelector.tsx) — brand-styled `Select`, options Today / Last 7 days / Last 30 days / This month / All time (default `30d`).
   - **Module split for client safety:** `profitQueries.ts` is server-only (imports `supabase.server`); pure types and helpers (`ProfitRange`, `ProfitClientData`, `ProfitClientOrder`, `DashboardOrderStatus`, `resolveRangeFromMs`, `isValidRange`) live in [`profitTypes.ts`](src/pages_flow/panel/dashboard/profitTypes.ts) so the client inner imports from there without dragging server modules into the browser bundle.

2. **Needs attention** — [`<NeedsAttention />`](src/pages_flow/panel/dashboard/sections/NeedsAttention.tsx) (server component, **not** period-filtered — these are current-state operational signals).
   - Two clickable cards rendered only when count > 0:
     - **Orders to fulfill** — PAID orders with `is_fulfilled=false`. Click → `/panel/all-orders?status=PAID&fulfilled=no`.
     - **Low stock** — `getInventoryRows()` filtered to `status === "low" || status === "out"`. Click → `/panel/inventory?status=low`.
   - Renders `null` when nothing needs attention (no empty section heading shown).

3. **Recent users** — [`<RecentUsers />`](src/pages_flow/panel/dashboard/sections/RecentUsers.tsx) (server shell + [`RecentUsersInner`](src/pages_flow/panel/dashboard/sections/RecentUsersInner.tsx) client inner). Compact list of the **last 5 registrations** with name + GenderIcon, email/phone (both `CopyText`'d) + inline `WhatsAppLink`, birthday, registration date and order count + total spent (when there are PAID orders). `View all →` link in the header navigates to `/panel/users`. Each row reuses [`<UserActions />`](src/pages_flow/panel/users/UserActions.tsx) for the three icon buttons (WhatsApp / Create promo code / View orders). Renders an empty `Card` placeholder when the table is empty.

4. **Recent notifications** — existing [`RecentNotifications`](src/pages_flow/panel/dashboard/RecentNotifications.tsx) + [`MarkAllReadButton`](src/pages_flow/panel/dashboard/MarkAllReadButton.tsx).

### Product form integration

- [`InventorySection`](src/pages_flow/panel/products/product-form/InventorySection.tsx) sits in the product create/edit form between `VariantsSection` and `CategorySection`. Fields: `cost_per_100g` + `low_stock_threshold_g`. **Stock itself is not edited here** — it's read-only badge with a "Manage" button linking to `/panel/inventory` (single source of truth + audit trail via `stock_movements`). Info-tooltip next to the section label explains `Stock changes are recorded as movements in /panel/inventory — never edited directly here.`
- Action helper [`pickAdminInventory(product)`](src/pages_flow/panel/products/product-form/inventory.ts) (note: lives outside `lib/` so it's safe to import from a client component) normalizes the joined `product_inventory` shape with default fallbacks `(0 / 500 / 0)` for products that don't have an inventory row yet.
- [`createProduct` / `updateProduct`](src/pages_flow/panel/products/actions.ts) call `upsertInventorySettings({ productId, costPer100g, lowStockThresholdG })` in their existing `Promise.all` block alongside `insertJunctionRows` + `syncVariants`. Validation rejects negative values for both fields.

### Out of scope (intentionally not built yet)

- **Low-stock notifications** (push/in-app). The `low_stock_threshold_g` field exists and drives the UI highlight, but no realtime alerts are sent — the alert pipeline is reserved for a follow-up iteration.
- Multi-warehouse / batch / FEFO / supplier management / reservation on PENDING orders / blocking checkout when out-of-stock / restoring stock on CANCELLED-after-PAID / FIFO weighted-average costing / CSV import. Stock can technically go to zero (UI clamps via `GREATEST(0, …)`) without blocking checkout — this is acceptable for the current business stage.

## Users (admin browser)

Admin-facing index of every registered user with one-click access to WhatsApp, targeted promo code creation, and the user's order history. Built on top of the same data plumbing that already powers `UserPicker` in `/panel/promo-codes/create`, extended with PAID-order aggregation.

### Data — [src/lib/usersDb.ts](src/lib/usersDb.ts)

`getAdminUsers()` is a single `React.cache`-wrapped server function. It runs `supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 })` first (gives ids + email + auth `created_at`), then in a `Promise.all` fires two batched queries against the resolved ids: `profiles(id, first_name, last_name, phone, gender, birthday, role, allow_notifications)` and PAID `orders(user_id, total, updated_at)`. The PAID-orders list is aggregated in JS into `Map<user_id, { count, totalSpent, lastOrderAt }>` — cheaper than a SQL RPC and reuses the same idiomatic pattern as the dashboard's `getProfitClientData`. Returns `AdminUser[]` sorted by `createdAt desc`. `getRecentUsers(limit)` just slices that result. The 1000-row cap matches the existing `loadUserOptions` in `/panel/promo-codes/_data.ts` and is documented with a TODO inside `usersDb.ts` for when registrations grow past it.

`AdminUser` shape: `id, email, firstName, lastName, phone, gender, birthday, role, allowNotifications, createdAt, orderCount, totalSpent, lastOrderAt`. Mix-system products / PENDING orders are excluded from the aggregation by the `.eq("status", OrderStatus.PAID)` filter, matching the project-wide **Order visibility invariant**.

### `/panel/users` page

[src/app/panel/users/page.tsx](src/app/panel/users/page.tsx) is the server shell — wraps `<UsersContent>` (calls `getAdminUsers()`) in a `Suspense` boundary with a custom skeleton, all under a `SearchParamsFilterProvider` keyed on `["search", "gender", "hasOrders", "sortKey", "sortDir", "page", "pageSize"]`. Mirrors `/panel/all-orders` patterns 1:1.

Client tree under [src/pages_flow/panel/users/](src/pages_flow/panel/users/):
- [`UsersPage`](src/pages_flow/panel/users/UsersPage.tsx) — composes `useFilteredUsers` + `useUsersTable`, renders mobile `<AdminUserCards>` (`xl:hidden`) + desktop `<DataTable>` (`hidden xl:block`). No `useAutoRouterRefresh` — registrations are infrequent and the page already refreshes on focus.
- [`useFilteredUsers`](src/pages_flow/panel/users/useFilteredUsers.ts) — search index over `id + firstName + lastName + email + phone`, `useDeferredValue` defers the input, plus `gender` and `hasOrders` predicates. Same shape as `useFilteredOrders`.
- [`useUsersTable`](src/pages_flow/panel/users/useUsersTable.ts) — thin re-export of `useOrdersTable` (the hook is generic over `T, K` already; bumping it into `@/shared/hooks` is a later cleanup).
- [`UserFilters`](src/pages_flow/panel/users/UserFilters.tsx) — search input + gender select (Male/Female) + hasOrders select (With orders / No orders). All reset `page` on change.
- [`columns.tsx`](src/pages_flow/panel/users/columns.tsx) — `adminUserColumns`: `User` (name + email with `CopyText` + `GenderIcon` + role `Badge` when non-`user`), `Contact` (phone `CopyText` + `WhatsAppLink`), `Birthday`, `Orders` (count + `formatAed(totalSpent)` orange; "No orders" muted), `Last order`, `Registered`, `Actions` (right-aligned `<UserActions>`).
- [`AdminUserCards`](src/pages_flow/panel/users/AdminUserCards.tsx) — mobile `DataCardList` (`sm:grid-cols-2`) with name + GenderIcon + role badge in header, email/phone/birthday in body, orders block + last-order line, footer = `Registered {date}` + `<UserActions>`. Reuses the same icon set (`Mail`, `Cake`).
- [`UserActions`](src/pages_flow/panel/users/UserActions.tsx) — shared icon row used by table cells, mobile cards, and the dashboard `Recent users` block. Three buttons (tooltip'd via `Tooltip` / `TooltipContent`):
  1. `WhatsAppLink` (reuse from `@/pages_flow/orders/ui/WhatsAppLink`) — only when `phone` is non-null.
  2. **Create promo code** — `Ticket` icon link to `/panel/promo-codes/create?user={uuid}`. Lands the admin in the existing promo code form with the recipient pre-selected (see the prefill paragraph in **Promo codes**).
  3. **View orders** — `Receipt` icon link to `/panel/all-orders?search={email}`. Hidden when `orderCount === 0`. Uses the orders page's built-in `search` filter which already matches against email.
- [`userDisplay.tsx`](src/pages_flow/panel/users/userDisplay.tsx) — shared helpers: `GenderIcon`, `formatBirthday`, `fullName`, `userLabel`. Promoted out of `UserPicker.tsx` so the picker, the table, the cards and the dashboard row all render the same way. `UserPicker` now imports `GenderIcon` / `formatBirthday` from here.

### Dashboard `Recent users` block

See **Admin dashboard (`/panel`) → block 3** above — same data via `getRecentUsers(5)`, same `<UserActions>` row, with a `View all →` link to `/panel/users`. The compact row layout sits in a single `Card padding="none"` with internal dividers, so the visual weight matches `Recent notifications` directly below it.

### Out of scope (intentionally not built yet)

- Server-side pagination through `auth.admin.listUsers({ page })` — not needed under 1000 users.
- Bulk actions (multi-select → send a group promo code). Could be layered on top of `MultiSelect` later.
- CSV export.
- Editing user role / soft-delete / disable account — different workflow with stronger auditing requirements.
