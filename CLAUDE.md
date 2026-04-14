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
- **pnpm** as package manager

## Path alias

`@/*` maps to `src/*` — use `@/shared/ui`, `@/lib/supabase`, `@/providers`, etc.

## Architecture

```
src/
├── app/                        # Next.js App Router routes
│   ├── layout.tsx              # Root layout — wraps with CartProvider + FavoritesProvider + NotificationsProvider
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
│   │   ├── all-orders/page.tsx # /panel/all-orders (admin only)
│   │   ├── partnerships/       # /panel/partnerships (admin only)
│   │   ├── categories/         # /panel/categories CRUD (admin only)
│   │   ├── products/           # /panel/products CRUD (admin only)
│   │   └── promotions/         # /panel/promotions CRUD (admin only)
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
│   ├── cartDb.ts               # Database-backed cart (cart_items table, per-user sync)
│   ├── productsDb.ts           # Admin product queries + form options
│   ├── categoriesDb.ts         # Category data queries
│   ├── promotionsDb.ts         # Promotions CRUD
│   ├── notificationsDb.ts      # Notifications CRUD + triggers push via pushNotification.ts
│   ├── pushNotification.ts     # Server-side web-push sending (VAPID, lazy init)
│   ├── storage.ts              # Image upload/delete to Supabase Storage
│   └── syncCartPrices.ts       # Syncs cart prices with active promotions
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
│   ├── orders/                 # OrdersPage + OrderCards (user order history)
│   ├── panel/
│   │   ├── dashboard/          # DashboardPage + types (admin statistics)
│   │   ├── orders/             # AllOrdersPage + AdminOrderCards + filters + useOrdersTable
│   │   ├── partnerships/       # PartnershipsPage + InquiryCards + filters + useInquiriesTable
│   │   ├── categories/         # CategoryForm + actions
│   │   ├── products/           # ProductForm + actions
│   │   └── promotions/         # PromotionsPage + PromotionForm + actions
│   └── PageLoader.tsx          # Thin wrapper around <Loader /> for route loading.tsx files
│
├── providers/                  # React context providers + hooks
│   ├── cart/                   # Cart system (decomposed)
│   │   ├── store.ts            # External store + promo persistence (pure functions, 0 React)
│   │   ├── useCartSync.ts      # Load from DB/localStorage + syncPrices
│   │   ├── useCartPromo.ts     # Promo code state, restore, re-validation, apply/remove
│   │   ├── useCartActions.ts   # addToCart, removeFromCart, updateQuantity, clearCart
│   │   └── CartProvider.tsx    # Thin composition of hooks + computed values
│   ├── FavoritesProvider.tsx   # useSyncExternalStore-based favorites state + useOptimistic
│   ├── notifications/          # Notification system (decomposed)
│   │   ├── NotificationsProvider.tsx  # Thin provider composing hooks
│   │   ├── types.ts            # PushState, NotificationsContextValue
│   │   ├── hooks/useRealtimeNotifications.ts  # Supabase Realtime + fetch + markAsRead
│   │   ├── hooks/useServiceWorker.ts  # SW registration + push subscribe/unsubscribe
│   │   └── utils.ts            # urlBase64ToUint8Array helper
│   ├── FilterProvider.tsx      # Generic filter context — useFilterBar(key) + useFilterBarMulti(key)
│   └── SearchParamsFilterProvider.tsx  # Syncs FilterProvider state to URL search params (supports multiKeys)
│
├── sections/                   # Landing-page section components
│   ├── Navbar.tsx, Hero.tsx, PhilosophyBlock.tsx, AboutUs.tsx, PartnershipCTA.tsx, Footer.tsx
│   ├── partnership/            # actions.ts — submitPartnershipInquiry server action → partnership_inquiries table
│   ├── categories/             # CategoryCard, CategoryGrid, consts, types
│   └── products/               # ProductGrid, ProductItem, consts, mapDbProducts
│       └── types/              # Product & CartItem types + Supabase db-types
│
└── shared/
    ├── consts.ts               # CUSTOMER_COOKIE_KEY, DELIVERY_FEE, COOKIE_CONSENT_KEY, PUSH_OPT_OUT_KEY
    ├── consts/navLinks.ts      # SectionId enum, SECTION_IDS, NAV_LINKS, TAB_LINKS
    ├── ui/                     # Reusable primitives (Button, Badge, Card, Form, Collapsible, etc.)
    ├── icons/                  # SVG icon components + index.ts barrel
    ├── types/                  # Categories enum, CustomerInfo, OrderStatus, ProfileInfo, UserRole
    └── utils/                  # cn.ts, validateCustomer.ts, validatePartnership.ts, validateProfile.ts, validateAuth.ts, validatePhone.ts, calculateDiscount.ts, resolveNotificationHref.ts
```

**Rule:** backend/data-access → `src/lib/`, page-level component trees → `src/pages_flow/`, landing sections → `src/sections/`, generic primitives → `src/shared/ui/`, SVG icons → `src/shared/icons/`, React context providers → `src/providers/`.

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing page |
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
| `/panel/partnerships` | Partnership inquiries (admin only) |
| `/panel/categories` | Category management (admin only) |
| `/panel/categories/create` | Create new category (admin only) |
| `/panel/categories/[id]/edit` | Edit category (admin only) |
| `/panel/products` | Product management (admin only) |
| `/panel/products/create` | Create new product (admin only) |
| `/panel/products/[id]/details` | Product detail view (admin only) |
| `/panel/products/[id]/edit` | Edit product (admin only) |
| `/panel/promotions` | Promotion management (admin only) |
| `/panel/promotions/create` | Create new promotion (admin only) |
| `/panel/promotions/[id]/edit` | Edit promotion (admin only) |

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

**Checkout server action** (`src/pages_flow/checkout/actions.ts`):
1. Validates `CustomerInfo` (phone must match `^\+971[0-9]{9}$`, UAE format)
2. Saves customer to `CUSTOMER_COOKIE_KEY` cookie (30 days) for form repopulation
3. Re-validates the applied promo code server-side via `validatePromoCode` from [src/lib/promoCodeApply.ts](src/lib/promoCodeApply.ts) — never trusts client
4. Computes totals via `getCartTotals(items, promoDiscount)` from [src/lib/cart.ts](src/lib/cart.ts) — returns `{ originalSubtotal, subtotal, promotionDiscount, total }`
5. Creates order in Supabase (`orders` + `order_items` with variant_id + price/original_price/promo_discount/name/weight_g snapshots and order-level `promo_code_id`/`promo_discount`/`promotion_discount`)
6. Calls N-Genius to create a payment, gets back payment URL
7. Updates order with `ngenius_ref`, then `redirect()` to N-Genius hosted page

**Result page** (`src/app/checkout/result/page.tsx`):
- Server component — polls N-Genius directly for final status
- Updates `orders.status` → `PAID` or `FAILED` (idempotent via `.neq("status", newStatus)`)
- On `PAID`: records promo code redemption, **clears the user's `cart_items` server-side**
- For guests: renders an inline `<script>` that synchronously wipes `honesta_cart` + `honesta_promo_code` from `localStorage` **before** `CartProvider` mounts and reads it
- Renders `<ClearCartOnSuccess>` (client component) to flush the in-memory `CartProvider._items` store after a navigation hit

**Webhook** (`src/app/api/payment/webhook/route.ts`):
- Receives N-Genius events; maps states (PURCHASED/CAPTURED → PAID, FAILED/REVERSED → FAILED/CANCELLED)
- Validates via `NGENIUS_WEBHOOK_SECRET` header
- On `PAID`: records promo code redemption (`recordPromoCodeRedemption`) and wipes `cart_items` for the user
- Both webhook and result-page paths are idempotent — only the **first** transition into `PAID` runs side effects, because the `UPDATE … neq("status", newStatus)` returns no row otherwise. Combined with `UNIQUE(order_id)` on `promo_code_redemptions`, double-redemptions are impossible.

## Cart System

- **Identity:** Cart items are keyed by `variantId` (product_variants.id), not product_id. Same product with different variants = separate cart entries.
- **Storage:** localStorage under key `"honesta_cart"`, DB table `cart_items` stores only `(user_id, variant_id, quantity)` — prices computed via join
- **Provider:** `CartProvider` uses `useSyncExternalStore` — no Zustand/Redux
- **Hydration:** `isHydrated` flag prevents SSR/client mismatch; server always renders empty cart
- **Hook:** `useCart()` exposes `items`, `itemCount`, `subtotal`, `total`, `appliedPromoCode`, `promoDiscount`, `addToCart(item)`, `removeFromCart(variantId)`, `updateItemQuantity(variantId, qty)`, `clearCart`, `applyPromoCode(code)`, `removePromoCode()`, `isHydrated`
- **CartItem type:** `{ variantId, productId, slug?, name, price, originalPrice?, promotionEndsAt?, quantity, image_url?, weight_g }`
- **Price sync:** `syncCartPrices` queries products with variants + promotions, recalculates prices. `originalPrice` is computed from promotions on the fly, never stored in DB.
- **DB cart (`cartDb.ts`):** `getCartFromDb` does a join: `cart_items → product_variants → products` (with promotions) to build full CartItem objects. `upsertItemInDb` stores only `(user_id, variant_id, quantity)`.
- **Totals utility:** [src/lib/cart.ts](src/lib/cart.ts) `getCartTotals(items, promoDiscount)` is the single source of truth for `originalSubtotal` (sum of `originalPrice ?? price`), `subtotal` (after product promotions, before promo code), `promotionDiscount` (`originalSubtotal − subtotal`), and `total` (`subtotal − promoDiscount`). **Don't duplicate `items.reduce` for totals in components — call this helper.** It's used by `CartSummary`, `OrderSummary`, and `submitCheckout`.
- **Color semantics for prices:** **moss** = promo code discount, **orange** = product promotion, **earth** = no discount. Apply this priority order when rendering line totals (promo > promotion > regular).

## Promo codes

Manual codes a user enters in the cart/checkout to get an extra discount, parallel to the auto-applied `promotions` system.

**Tables:** `promo_codes` (`code text unique`, `scope`, `discount_type`, `discount_value`, `min_order_amount`, `max_uses`, `max_uses_per_user`, `stack_with_promotions`, `starts_at`, `ends_at`, `is_active`), `promo_code_products` (m2m for product-scope codes), `promo_code_users` (empty = available to all signed-in users; non-empty = personal targeting), `promo_code_redemptions` (one row per paid order, `unique(order_id)` enforces idempotency). Codes are exactly 6 characters `[A-Z0-9]` enforced by a CHECK constraint.

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

**DB tables:** `orders` (status, is_fulfilled, subtotal, delivery_fee, total, **promotion_discount**, **promo_code_id**, **promo_discount**, customer fields, ngenius_ref), `order_items` (order_id, variant_id, name, price, **original_price** nullable, **promo_discount** per unit, weight_g, quantity — all snapshots at order time so historical orders survive promo/promotion edits), `products` (image_url, images JSONB `[]`, in_stock, badge, note, nutrition JSONB, status — **no price/weight_g columns**, these live in `product_variants`), `product_variants` (product_id, weight_g, price — one-to-many with products), `categories` (name, slug, audience, tagline, description, image_url, badge, sort_order), `benefits` (id, name, description — unique on name+description), `partnership_inquiries` (business_name, contact_name, phone, business_type, message), `user_favorites` (user_id, product_id), `profiles` (id, first_name, last_name, phone, role `user_role`, gender, birthday, allow_notifications), `cart_items` (user_id, variant_id, quantity — minimal, prices via join), `notifications` (type, title, message, related_id, user_id, audience `user_role` — nullable, NULL = all roles), `notification_reads` (notification_id, user_id, read_at — tracks per-user read status), `push_subscriptions` (user_id, endpoint UNIQUE, p256dh, auth — FK to auth.users + profiles, RLS per user), `promotions` (name, discount_type, discount_value, starts_at, ends_at, is_active), `promotion_products` (promotion_id, product_id), `promo_codes` (code, scope, discount_type, discount_value, min_order_amount, max_uses, max_uses_per_user, stack_with_promotions, starts_at, ends_at, is_active — code is exactly 6 `[A-Z0-9]` chars enforced by CHECK), `promo_code_products`, `promo_code_users`, `promo_code_redemptions` (`unique(order_id)`).

**Order display invariant:** `originalSubtotal − promotion_discount − promo_discount + delivery_fee = total`. The order list pages and cards display this breakdown as `Subtotal − Promotion − Promo + Delivery = Total`. Old orders without `original_price`/`promotion_discount` (NULL/0) render correctly without the new lines.

**Realtime orders quirk.** The `INSERT` event on `orders` fires **before** the `order_items` rows are written by `createOrderWithItems` (separate insert). [src/pages_flow/panel/orders/useRealtimeOrders.ts](src/pages_flow/panel/orders/useRealtimeOrders.ts) handles this by calling `router.refresh()` on INSERT instead of merging the payload — the server component re-runs its query with the full `order_items(*) + promo_code(code)` join. UPDATE/DELETE merge directly without refresh.

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

- **`Button`** — defaults to `<a>` via `next/link` `Link` for all hrefs (internal, external, hash). Pass `as="button"` for `<button>`. Supports `ref` prop (React 19 ref-as-prop). Variants: `primary | secondary | outline | text`. Colors: `primary | error | warning | default`. Sizes: `icon | inline | sm | md | lg`. `buttonVariants` is also exported for applying Button styles to non-Button elements (e.g. `HashLink`). **Never nest `<button>` inside `HashLink`** — use `HashLink` with `buttonVariants` className instead.
- **`Badge`** — inline label/tag. Variants: `natural` (moss green) | `warm` (sand) | `outline`. Sizes: `xs | sm | md`.
- **`Card`** — wrapper with 16px radius. Variants: `default` (white-warm) | `sand` | `outline` | `dark` (earth bg).
- **`TagToolbar` / `TagToolbarItem`** — single-select pill filter bar (`role="radiogroup"`). Controlled or uncontrolled via `value`/`onValueChange`/`defaultValue`. Empty string `""` means "All".
- **`Collapsible` / `CollapsibleTrigger` / `CollapsibleChevron` / `CollapsibleContent`** — animated accordion using `motion/react` `AnimatePresence`.
- **`Select` / `SelectTrigger` / `SelectValue` / `SelectContent` / `SelectItem` / `SelectGroup` / `SelectSeparator`** — custom dropdown, context-based, supports controlled/uncontrolled, `clearable` prop, auto up/down direction.
- **`FormTileRadio` / `FormTileRadioItem`** — single-select tile radio group. Sizes: `sm` (compact, for product cards) | `md` (default). Context-based compound component with controlled/uncontrolled support.
- **`Form` components** — `FormLabel` (`required` prop adds red `*`), `FormInput` (supports `startIcon` for left icon, `wrapperClassName` for outer div, `clearable` + `onClear`), `FormSelect`, `FormTextarea`, `FormError`, `FormPasswordInput` (visibility toggle), `FormPhoneInput` (UAE format: displays `0XX XXX XXXX`, submits `+971XXXXXXXXX` via hidden input), `FormOtpInput` (6-digit OTP with `defaultValue` + `useResendCooldown` hook), `FormCheckbox`, `FormNumberInput` (stepper with +/- buttons, controlled via `value`/`onValueChange`), `FormUploadZone` (supports `initialUrl` for single image edit mode, `initialUrls` for multi-image; integrated Lightbox preview + sortable thumbnails) — CVA variants with `default` / `error` states. `FormSelect` wraps the `Select` compound component.
- **`DropdownMenu` / `DropdownMenuTrigger` / `DropdownMenuContent` / `DropdownMenuItem` / `DropdownMenuSeparator` / `DropdownMenuLabel`** — context-based dropdown menu with auto up/down direction, outside-click and Escape close, `destructive` + `disabled` item variants.
- **`Table` / `TableHeader` / `TableHeaderRow` / `TableHead` / `TableBody` / `TableRow` / `TableCell` / `TableEmpty` / `TablePagination`** — compound table with sticky header, sort indicators, dividers. Context-based (`useTable`).
- **`DataTable`** — declarative wrapper: pass `data`, `columns: ColumnDef[]`, `sort`, `pagination` and it renders a full `Table`. Hooks: `useTableSort`, `useTableData`, `useTableSearch`, `useTablePagination`. Helpers: `formatAed`, `formatDate`, `formatDateTime`, `shortId`, comparators (`compareString`, `compareNumber`, `compareDate`).
- **`DataCard` / `DataCardHeader` / `DataCardBody` / `DataCardField` / `DataCardFooter` / `DataCardGrid` / `DataCardList` / `DataCardEmpty`** — compound card for mobile-friendly data display. Context-based (`useDataCard`). `DataCardList` uses CSS grid (`grid-cols-1` default, pass `className` for responsive cols). `DataCardGrid` is a declarative helper that renders `FieldDef[]`.
- **`Thumbnail`** — reusable image thumbnail. Props: `src`, `alt`, `selected?` (orange border), `softDeleted?` (dimmed + grayscale), `showLabel?` (alt text below, default true), `onClick?`, `children?` (overlay buttons). Used by `SortableThumbnail` and `ProductDetailImage`.
- **`Popover` / `PopoverTrigger` / `PopoverContent`** — context-based popover with auto up/down direction, outside-click close, viewport clamping. Supports **controlled mode** via `open`/`onOpenChange` props (used by `BenefitsSection`, `NutritionSection`). `usePopover()` hook for child components.
- **`MultiSelect` / `MultiSelectTrigger` / `MultiSelectContent` / `MultiSelectItem` / `MultiSelectEmpty` / `MultiSelectCreate` / `MultiSelectDelete`** — compound multi-select with search, selected-items-first sorting, scroll preservation. Context-based (`useMultiSelect`). `MultiSelectCreate` for inline option creation, `MultiSelectDelete` for inline deletion.
- **`Tooltip` / `TooltipTrigger` / `TooltipContent`** — hover/focus tooltip with 4-direction support (`side` prop: `top | bottom | left | right`), auto-fallback to opposite side if no space. `delay` prop (default 200ms). Toggle on click for touch devices. **Always use `asChild`** on `TooltipTrigger` — it merges all handlers (onClick, onMouseEnter, etc.) with the child element's handlers via `cloneElement`. No `useId()` — safe inside Suspense boundaries.
- **`Gallery`** — rows-based image gallery using `react-photo-album`. Props: `images: GalleryImage[]`, `rowHeight`, `maxPerRow`, `spacing`, `onClick(index)`. No built-in Lightbox — compose with `<Lightbox>` externally.
- **`CartEmpty`** — empty cart placeholder screen.
- **`Loader`** — loading spinner (used during cart hydration).

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

## Product Variants

Products use a **variant-based pricing model**. Prices and weights live in `product_variants` table, not on `products` directly.

- **Table:** `product_variants` (id, product_id, weight_g, price) — one-to-many with products
- **Types:** `ProductVariant { id, weight_g, price }`, `Product.variants: ProductVariant[]`
- `Product.price` and `Product.weight_g` are computed from `variants[0]` (smallest) in `mapDbProducts()`
- **Admin form:** `VariantsSection` (`src/pages_flow/panel/products/product-form/VariantsSection.tsx`) — dynamic rows with `FormNumberInput`, serialized as JSON hidden input. Logic in `variants.ts`.
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
- **Public display:** `ProductDetailImage` combines `[image_url, ...images]`, shows main image + thumbnail strip + `Lightbox` for fullscreen zoom.
- **Cards:** `ProductImage` continues to use only `image_url` for card thumbnails.
- **Types:** `Product.images: string[]`, `DbProduct.images: string[] | null`
- **Mapper:** `mapDbProducts` sets `images: p.images ?? []` (independent from `image_url`)

## Lightbox

`Lightbox` (`src/shared/ui/Lightbox.tsx`) wraps `yet-another-react-lightbox` with brand theming.

- **API:** `<Lightbox open onClose slides={LightboxSlide[]} index? />`
- **Plugins:** Zoom always; Counter + Thumbnails when `slides.length > 1`
- **Theming:** CSS variables inline — earth backdrop, white-warm buttons, orange active/thumbnail border
- **Single image:** hides prev/next buttons, disables carousel loop
- Replaces the old custom `ImagePreview` + `Dialog` pattern everywhere

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
- **Nutrition** — dynamic fields stored as `Record<string, { name: string; value: number }>` in `products.nutrition` JSONB. Admin form (`NutritionSection`) allows adding/removing fields via Popover form. Default 8 fields (Calories, Carbs, etc.) pre-populated for new products. `NutritionTable` in public UI iterates `Object.values(nutrition)`.
- **Benefits** — managed via `BenefitsSection` with `MultiSelect` compound component. Supports inline creation (Popover form with name + description) and deletion. API: `POST/DELETE /api/options` with `entityType: "benefits"`. Benefits table: `benefits(id, name, description)`.
- **Product fields** `servingIdeas`, `occasions` are rendered in collapsible detail sections on product cards and detail pages.
- **Promotions** — `src/lib/promotionsDb.ts` handles CRUD. Promotions have `discount_type` (percentage | fixed), `discount_value`, date range, and `is_active` flag. Linked to products via `promotion_products` join table. Status is computed client-side via `getPromotionStatus()` (active | scheduled | expired) based on `is_active` + dates. Promotion list sorts active first.
- **Order fulfillment** — `orders.is_fulfilled` boolean field. Admin toggles via `FulfilledToggle` checkbox component (`src/pages_flow/panel/orders/FulfilledToggle.tsx`) with server action. Filterable in admin orders view (Fulfilled / Unfulfilled).

## View-mode system (card / row)

Shared toggle that lets users switch between a detailed card grid and a compact row grid. Used on admin **categories**, **products**, **favorites** and public **categories**, **products** sections.

- **Provider:** [src/providers/ViewModeProvider.tsx](src/providers/ViewModeProvider.tsx) — context with `{ mode: "row" | "card", setMode }`. `setMode` writes a cookie so the preference persists across reloads.
- **Toggle UI:** [src/shared/ui/ViewModeToggle.tsx](src/shared/ui/ViewModeToggle.tsx) — `FormTileRadio` with `Rows3` / `LayoutGrid` icons. Placed in `AdminPageHeader.actions` on admin pages or alongside filters in public toolbars.
- **Server-side reader:** [src/shared/utils/readViewModeCookie.ts](src/shared/utils/readViewModeCookie.ts) — `readViewModeCookie(cookieKey, defaultMode?)` called in async server components to hydrate `initialMode` synchronously (no flash on first render).
- **Cookies** (in [src/shared/consts.ts](src/shared/consts.ts)):
  - `CATEGORIES_VIEW_COOKIE` shared between `/panel/categories` and `/` categories section.
  - `PRODUCTS_VIEW_COOKIE` shared between `/panel/products`, `/panel/favorites`, and `/` products section.
- **Default mode:** `"row"` (`DEFAULT_VIEW_MODE` in provider).

Integration pattern (same on every page):
1. Server page reads the cookie, wraps content in `<ViewModeProvider cookieKey={...} initialMode={...}>`.
2. Add `<ViewModeToggle />` in `AdminPageHeader.actions` (admin) or the section toolbar (public).
3. Inner client grid uses `useViewMode()` to pick the grid class and conditionally renders card vs row component.
4. Suspense fallback uses a view-aware skeleton (see below) fed the same `initialMode`.

### Row variants

Row components mirror each other structurally: `flex flex-col h-full p-3 sm:p-4 rounded-2xl` outer, `grow flow-root` content wrapper with a `float-left` image (`aspect-4/3`, responsive widths `w-36 sm:w-48 md:w-60 lg:w-64 xl:w-52 2xl:w-56`) and wrapping text beside/below it. Admin rows pin an action footer; public rows pin `ProductPriceAndCart`. Overlay badges on the image switch to `size="xs"` with `sm:px-3! sm:py-1! sm:text-2xs!` so they shrink on narrow screens instead of covering the photo.

- Categories: [src/pages_flow/panel/categories/AdminCategoryRow.tsx](src/pages_flow/panel/categories/AdminCategoryRow.tsx) + [src/sections/categories/CategoryCardRow.tsx](src/sections/categories/CategoryCardRow.tsx).
- Products: [src/pages_flow/panel/products/AdminProductRow.tsx](src/pages_flow/panel/products/AdminProductRow.tsx) + [src/sections/products/ProductItemRow.tsx](src/sections/products/ProductItemRow.tsx).

### Grid breakpoints

Grid class maps live in single-source files so the skeleton and the real grid stay in lock-step (Tailwind must see the literal strings in the scanned file).

- **Categories** — `PUBLIC_CATEGORY_GRID_CLASS` in [src/app/page.tsx](src/app/page.tsx); `ADMIN_CATEGORY_GRID_CLASS` inline in [src/pages_flow/panel/categories/SortableCategoryGrid.tsx](src/pages_flow/panel/categories/SortableCategoryGrid.tsx) and [src/app/panel/categories/page.tsx](src/app/panel/categories/page.tsx).
- **Products** — `GRID_CLASS` (keyed by `"admin" | "public"`) in [src/sections/products/ProductGridSkeleton.tsx](src/sections/products/ProductGridSkeleton.tsx). `PUBLIC_PRODUCT_GRID_CLASS` is re-exported and imported by [src/sections/products/ProductGrid.tsx](src/sections/products/ProductGrid.tsx) and `FavoritesGrid.tsx`. Admin product grid class lives in [src/pages_flow/panel/products/ProductsPage.tsx](src/pages_flow/panel/products/ProductsPage.tsx) as `ADMIN_PRODUCT_GRID_CLASS`.
- **Row breakpoint shorthand:**
  - Admin products row: `xl:grid-cols-2` (2 cols at 1280+, otherwise 1).
  - Public products row: `min-[1150px]:grid-cols-2` (arbitrary breakpoint).
  - Admin categories row: `2xl:grid-cols-2`; public categories row: `lg:grid-cols-2`.

### Skeletons

Skeletons live next to the real components and accept `mode: ViewMode` so they can render the same layout the data will produce:

- [src/sections/categories/CategoryGridSkeleton.tsx](src/sections/categories/CategoryGridSkeleton.tsx) — takes `mode` + `gridClassName` (the grid class lives in the page that owns the breakpoints, e.g. admin vs public).
- [src/sections/products/ProductGridSkeleton.tsx](src/sections/products/ProductGridSkeleton.tsx) — takes `mode` + `variant: "admin" | "public"` + `count`. Internal `GRID_CLASS` map is the single source of truth for product grid breakpoints.

Other list pages have their own hand-rolled skeletons that copy the real card markup (so placeholders line up with the real layout, preventing a layout shift):

- [src/pages_flow/panel/promotions/PromotionsSkeleton.tsx](src/pages_flow/panel/promotions/PromotionsSkeleton.tsx)
- [src/pages_flow/panel/promo-codes/PromoCodesSkeleton.tsx](src/pages_flow/panel/promo-codes/PromoCodesSkeleton.tsx)
- [src/pages_flow/panel/delivery/DeliverySkeleton.tsx](src/pages_flow/panel/delivery/DeliverySkeleton.tsx)

**Rule of thumb:** when creating a new list page, copy the real card's outer classes (`rounded-[16px]`, `bg-white-warm`, `shadow-sm`, padding) into the skeleton and use inner `<Skeleton>` blocks sized close to the real text/buttons. Do not reach for the generic `SkeletonGrid` / `SkeletonProductGrid` — they don't match new card shapes.

## Category Sorting

Categories have a `sort_order` integer column. Order is controlled via drag-and-drop in admin `/panel/categories`.

- **DB:** `categories.sort_order` — new categories get `max(sort_order) + 1`
- **Admin UI:** `SortableCategoryGrid` (`src/pages_flow/panel/categories/SortableCategoryGrid.tsx`) — uses `@dnd-kit/react` with `useSortable({ handle })` for drag via GripVertical button only
- **Optimistic updates:** `useOptimistic` for instant reorder + `useTransition` for server action
- **Server action:** `reorderCategories(orderedIds)` → batch updates `sort_order` → `revalidatePath`
- **Everywhere sorted:** `getCategories()` uses `.order("sort_order")` — affects landing page categories, product filter bar, admin categories, product form dropdown
- **Touch support:** `PointerSensor` with `activationConstraints: () => undefined` removes 250ms touch delay

## Notifications

Multi-role notification system with Supabase Realtime.

**Tables:**
- `notifications` — `user_id` (UUID, nullable) + `audience` (`user_role` enum, nullable). `user_id` set = personal notification. `user_id` NULL = broadcast. `audience` NULL = all roles, specific role = only that role.
- `notification_reads` — `(notification_id, user_id)` PK. Presence of row = read. Used for both personal and broadcast notifications.
- RLS enabled on both tables — users only see notifications targeted to them.

**Notification types:** `new_order`, `order_paid`, `order_failed`, `order_cancelled` (admin), `new_partnership` (admin), `new_promotion`, `new_product`, `new_category` (broadcast to all). Styles in `src/shared/ui/NotificationTypeConfig.tsx`.

**DB layer:** `src/lib/notificationsDb.ts` — `createNotification({ type, title, message?, relatedId?, audience?, userId? })`. Default `audience = "admin"`. Queries use left join on `notification_reads` to compute `is_read`. New users only see notifications created after their registration (`created_at >= user.created_at`).

**Provider:** `src/providers/notifications/` — decomposed into:
- `NotificationsProvider.tsx` — thin provider composing `useRealtimeNotifications` + `useServiceWorker`
- `hooks/useRealtimeNotifications.ts` — Supabase Realtime INSERT listener + fetch + markAsRead
- `hooks/useServiceWorker.ts` — SW registration, push subscribe/unsubscribe, auto-resubscription
- `types.ts` — `PushState`, `NotificationsContextValue`, `NotificationsProviderProps`

Accepts `role`, `userId`, `allowNotifications` props. When `allowNotifications = false`, broadcast notifications are hidden (personal still shown).

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
  values?: Partial<FooInfo>; // echo back form values for repopulation
  attempt?: number;          // incremented each submission, used as form key
}

// 2. Action signature for useActionState: (_prevState, formData) => Promise<State>
export async function createFoo(
  _prevState: FooState | null,
  formData: FormData,
): Promise<FooState> {
  const name = (formData.get("name") as string)?.trim();

  const attempt = (_prevState?.attempt ?? 0) + 1;

  // 3. Collect field errors into an object, return early if any
  const fieldErrors: FooState["fieldErrors"] = {};
  if (!name) fieldErrors.name = "Name is required";
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors, values: { name }, attempt };

  // 4. DB call
  const { error } = await supabaseAdmin.from("foos").insert({ name });
  if (error) return { error: "Failed to save. Please try again.", values: { name }, attempt };

  return { success: true, attempt };
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
- **Always return `values` on every error path** — forms use `key={state?.attempt ?? 0}` which remounts the form, so `defaultValue={state?.values?.fieldName}` is needed to preserve user input
- Always return `attempt` (incremented counter) — used as form `key` to reset field states after submission
- Never use `supabaseAdmin` for auth-identity operations — use `createSupabaseServerClient()` instead
- Actions that need the current user must call `createSupabaseServerClient()` and redirect to `/login` if no session
- **All actions must have try-catch.** `redirect()` throws `NEXT_REDIRECT` — rethrow it: `if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;`. Catch returns `{ error: "Something went wrong. Please try again.", values }`.
- **All forms must show toast on errors.** In the `useEffect` that watches `state`, add: `if (state?.error) toastError(state.error); if (state?.fieldErrors) toastError("Please fill in the required fields");`

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
- **Navigation links** — shared source of truth in `src/shared/consts/navLinks.ts`. `SectionId` enum (`Hero`, `Categories`, `Products`, `Story`, `About`, `Contact`), `SECTION_IDS = Object.values(SectionId)` (used by `HashTracker`), `NAV_LINKS` and `TAB_LINKS` (typed with `NavLink<T>` generic). Used by Navbar, NavMobileTabBar, Footer, and HashTracker.

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
- Structured data builders in `src/app/products/[id]/structured-data.ts`.
- **Back navigation** — `FROM_MAP` maps `?from=` param to back button href/label (e.g. `?from=favorites` → "Back to favorites", `?from=cart` → "Back to cart"). Default: "Back to products" → `/#products`.

**Indexing** — private routes have `robots: { index: false }`: `(auth)/*`, `/cart`, `/checkout/*`, `/panel/*`. `robots.ts` disallows these paths for crawlers. Sitemap includes only `/` and `/products/*`.

## Error pages

- **`src/app/not-found.tsx`** — 404 page (server component, renders inside layout)
- **`src/app/error.tsx`** — route error boundary (`"use client"`, receives `error` + `reset`)
- **`src/app/global-error.tsx`** — root layout error (`"use client"`, own `<html><body>`, inline styles with brand colors)

## Soft delete for upload images

In edit mode, `FormUploadZone` uses soft delete for existing images — marking them as deleted visually without removing from Storage until form is saved. This prevents broken image URLs if admin navigates away without saving. New images uploaded in the session are deleted immediately on remove. `cleanupRemovedImages()` in server actions handles actual Storage deletion on save.
