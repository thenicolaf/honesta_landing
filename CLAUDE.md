# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Security

**Strictly forbidden:** reading any `.env*` files, **except** `.env.example`.
Do not read, display, or reference the contents of `.env.local`, `.env.production`, `.env.development`, or any other environment file.

## Commands

```bash
pnpm dev       # start dev server (localhost:3000)
pnpm build     # production build
pnpm lint      # ESLint check
```

No test suite configured yet.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** — config is CSS-only via `@theme` in `globals.css`, no `tailwind.config.ts`
- **React Compiler** enabled (`reactCompiler: true` in `next.config.ts`) — no manual `useMemo`/`useCallback` needed
- **Supabase** (`@supabase/supabase-js` + `@supabase/ssr`) — orders, products, and auth
- **N-Genius** — payment gateway (UAE, amounts in fils: 1 AED = 100 fils)
- **motion/react** (not `framer-motion`) — animations
- **lucide-react** — supplemental icon library (prefer custom icons in `src/shared/icons/` first)
- **pnpm** as package manager

## Path alias

`@/*` maps to `src/*` — use `@/shared/ui`, `@/lib/supabase`, `@/providers`, etc.

## Architecture

```
src/
├── app/                        # Next.js App Router routes
│   ├── layout.tsx              # Root layout — wraps with CartProvider + FavoritesProvider
│   ├── page.tsx                # Landing page (Hero, Products, Categories)
│   ├── cart/page.tsx           # Shopping cart route
│   ├── checkout/
│   │   ├── page.tsx            # Checkout form (reads customer cookie)
│   │   ├── cancel/page.tsx     # Payment cancelled fallback
│   │   └── result/page.tsx     # Payment result (polls N-Genius, updates DB)
│   ├── panel/                  # Authenticated panel segment (/panel/*) — layout adds AdminSidebar
│   │   ├── layout.tsx          # Reads user via createSupabaseServerClient(), passes email to sidebar
│   │   ├── page.tsx            # Admin dashboard with statistics (requires admin role)
│   │   ├── profile/page.tsx    # /panel/profile
│   │   ├── favorites/page.tsx  # /panel/favorites
│   │   ├── orders/page.tsx     # /panel/orders
│   │   ├── all-orders/page.tsx # /panel/all-orders (admin only)
│   │   ├── partnerships/page.tsx # /panel/partnerships (admin only)
│   │   ├── categories/page.tsx # /panel/categories (admin only)
│   │   └── products/           # /panel/products (admin only)
│   ├── login/page.tsx          # Google OAuth login page
│   ├── auth/callback/route.ts  # OAuth code → session exchange, then redirect
│   ├── api/payment/webhook/    # N-Genius webhook → updates order status in Supabase
│   └── globals.css, metadata.ts, sitemap.ts, robots.ts, structured-data.ts
│
├── lib/                        # Backend / data-access layer (server-only)
│   ├── supabase.ts             # Two static clients: `supabase` (anon/RLS) + `supabaseAdmin` (service role)
│   ├── supabase.server.ts      # `createSupabaseServerClient()` — auth-aware client (reads cookies, use for authed routes)
│   ├── ngenius.ts              # N-Genius payment API (auth, create order, poll status)
│   ├── payments.ts             # Orchestrates: create payment → update DB with ngenius_ref
│   ├── orders.ts               # Supabase order creation (orders + order_items tables)
│   ├── favoritesDb.ts          # getFavoritesFromDb, addFavoriteToDb, removeFavoriteFromDb
│   └── cart.ts                 # localStorage cart helpers (getCart, addItem, removeItem, etc.)
│
├── proxy.ts                    # Next.js middleware helper — refreshes auth session + protects private routes
│
├── pages_flow/                 # Page-level component trees (co-located with their routes)
│   ├── cart/                   # CartPage + CartItems + CartSummary
│   ├── checkout/               # CheckoutPage + CheckoutForm + OrderSummary + SubmitButton
│   │   └── actions.ts          # Server action: validate → save to DB → create payment → redirect
│   ├── home/                   # CategoriesSection, ProductsSection
│   ├── login/                  # LoginPage + GoogleSignInButton
│   ├── favorites/              # FavoritesPage + FavoritesGrid
│   ├── profile/                # ProfilePage + ProfileForm + SignOutButton
│   │   └── actions.ts          # updateProfile() server action → upserts to profiles table
│   ├── orders/                 # OrdersPage + OrderCards (user order history)
│   │   └── ui/                 # StatusBadge, CopyOrderId, OrderCards
│   ├── panel/
│   │   ├── dashboard/          # DashboardPage + types (admin statistics)
│   │   ├── orders/             # AllOrdersPage + AdminOrderCards + filters + useOrdersTable
│   │   └── partnerships/       # PartnershipsPage + InquiryCards + filters + useInquiriesTable
│   └── PageLoader.tsx          # Thin wrapper around <Loader /> for route loading.tsx files
│
├── providers/                  # React context providers + hooks
│   ├── CartProvider.tsx        # useSyncExternalStore-based cart state (hydration-safe)
│   ├── FavoritesProvider.tsx   # useSyncExternalStore-based favorites state + useOptimistic
│   ├── CategoryFilterProvider.tsx
│   ├── FilterProvider.tsx      # Generic filter context — useFilterBar(key) hook
│   └── SearchParamsFilterProvider.tsx  # Syncs FilterProvider state to URL search params
│
├── sections/                   # Landing-page section components
│   ├── Navbar.tsx, Hero.tsx, PhilosophyBlock.tsx, PartnershipCTA.tsx, TrustBadges.tsx, Footer.tsx
│   ├── partnership/            # actions.ts — submitPartnershipInquiry server action → partnership_inquiries table
│   ├── categories/             # CategoryCard, CategoryGrid, consts, types
│   └── products/               # ProductGrid, ProductItem, consts, mapDbProducts
│       └── types/              # Product & CartItem types + Supabase db-types
│
└── shared/
    ├── consts.ts               # CUSTOMER_COOKIE_KEY, DELIVERY_FEE
    ├── ui/                     # Reusable primitives (Button, Badge, Card, Form, Collapsible, etc.)
    ├── icons/                  # SVG icon components + index.ts barrel
    ├── types/                  # Categories enum, CustomerInfo, OrderStatus
    └── utils/                  # cn.ts, validateCustomer.ts, validatePartnership.ts
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
| `/login` | Google OAuth login page |
| `/auth/callback` | OAuth PKCE code exchange → session cookie → redirect |
| `/panel` | Admin dashboard with statistics (admin only) |
| `/panel/profile` | User profile form (name, phone, address + map) |
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

## Panel Section (`panel` route segment)

All panel routes live under `/panel` and share an authenticated layout:
- `AdminLayout` — server component, reads user via `createSupabaseServerClient()`, passes `email` to `AdminSidebar`
- `AdminSidebar` — responsive: horizontal on mobile, sticky vertical on desktop; contains `AdminNav` + sign-out button
- `AdminNav` — client component with route-aware active underline
- `AdminPageHeader` — reusable header with "My Account" label + dynamic `title` prop

**Protected routes:** `src/proxy.ts` guards all `/panel/*` routes — unauthenticated users are redirected to `/login?next={pathname}`. User routes (`/panel/profile`, `/panel/favorites`, `/panel/orders`) are whitelisted for any authenticated user; all other `/panel/*` routes require `role=admin`.

## Favorites

- `FavoritesProvider` (`src/providers/FavoritesProvider.tsx`) — same `useSyncExternalStore` + listener pattern as `CartProvider`; uses `useOptimistic` for instant toggle feedback
- `useFavorites()` exposes `toggleFavorite(id)`, `isFavorite(id)`, `isHydrated`
- DB layer: `src/lib/favoritesDb.ts` — `getFavoritesFromDb()`, `addFavoriteToDb()`, `removeFavoriteFromDb()`
- DB table: `user_favorites` (user_id, product_id)

## Loading pattern

Every route segment has a `loading.tsx` that renders:
```tsx
<main className="grow"><PageLoader /></main>
```
`PageLoader` lives in `src/pages_flow/PageLoader.tsx` and is re-exported from `@/shared/ui`.

## E-commerce & Payment Flow

**Checkout server action** (`src/pages_flow/checkout/actions.ts`):
1. Validates `CustomerInfo` (phone must match `^\+971[0-9]{9}$`, UAE format)
2. Saves customer to `CUSTOMER_COOKIE_KEY` cookie (30 days) for form repopulation
3. Creates order in Supabase (`orders` + `order_items` tables)
4. Calls N-Genius to create a payment, gets back payment URL
5. Updates order with `ngenius_ref`, then `redirect()` to N-Genius hosted page

**Result page** (`src/app/checkout/result/page.tsx`):
- Server component — polls N-Genius directly for final status
- Updates `orders.status` → `PAID` or `FAILED`
- Renders `<ClearCartOnSuccess>` (client component) which clears localStorage cart on success

**Webhook** (`src/app/api/payment/webhook/route.ts`):
- Receives N-Genius events; maps states (PURCHASED/CAPTURED → PAID, FAILED/REVERSED → FAILED/CANCELLED)
- Validates via `NGENIUS_WEBHOOK_SECRET` header

## Cart System

- **Storage:** localStorage under key `"honesta_cart"`
- **Provider:** `CartProvider` uses `useSyncExternalStore` — no Zustand/Redux
- **Hydration:** `isHydrated` flag prevents SSR/client mismatch; server always renders empty cart
- **Hook:** `useCart()` exposes `items`, `itemCount`, `total`, `addToCart`, `removeFromCart`, `updateItemQuantity`, `clearCart`, `isHydrated`

## Auth (Google OAuth)

Flow: `/login` → `GoogleSignInButton` calls `supabase.auth.signInWithOAuth({ provider: "google" })` → Google redirects to `/auth/callback?code=…` → `createSupabaseServerClient().auth.exchangeCodeForSession(code)` sets a cookie → redirect to `/` (or `next` param).

Session refresh: `src/proxy.ts` exports a middleware helper (`proxy()`) that must be called from `middleware.ts`. It creates an `@supabase/ssr` server client and calls `auth.getUser()` on every request to keep the session cookie fresh.

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

**DB tables:** `orders` (status, subtotal, delivery_fee, total, customer fields, ngenius_ref), `order_items` (order_id, product_id, name, price, quantity), `products` (images in Supabase Storage → `image_url` field; also `weight_g`, `in_stock`, `nutrition` JSON), `partnership_inquiries` (business_name, contact_name, phone, business_type, message), `user_favorites` (user_id, product_id), `profiles` (id, first_name, last_name, phone, address, coordinates JSON {lat, lng}).

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

## Shared UI components

All use `class-variance-authority` (cva) for variants + `cn()` for className merging.

Compound components (e.g. `Collapsible`, `TagToolbar`) hold state in React context internally; sub-components access it via a `use*` hook. Follow this same pattern when adding new compound components.

- **`Button`** — defaults to `<a>`, pass `as="button"` for `<button>`. Variants: `primary | secondary | ghost`. Sizes: `sm | md | lg`.
- **`Badge`** — inline label/tag. Variants: `natural` (moss green) | `warm` (sand) | `outline`. Sizes: `xs | sm | md`.
- **`Card`** — wrapper with 16px radius. Variants: `default` (white-warm) | `sand` | `outline` | `dark` (earth bg).
- **`TagToolbar` / `TagToolbarItem`** — single-select pill filter bar (`role="radiogroup"`). Controlled or uncontrolled via `value`/`onValueChange`/`defaultValue`. Empty string `""` means "All".
- **`Collapsible` / `CollapsibleTrigger` / `CollapsibleChevron` / `CollapsibleContent`** — animated accordion using `motion/react` `AnimatePresence`.
- **`Select` / `SelectTrigger` / `SelectValue` / `SelectContent` / `SelectItem` / `SelectGroup` / `SelectSeparator`** — custom dropdown, context-based, supports controlled/uncontrolled, `clearable` prop, auto up/down direction.
- **`Form` components** — `FormLabel`, `FormInput`, `FormSelect`, `FormTextarea`, `FormError` — CVA variants with `default` / `error` states. `FormSelect` wraps the `Select` compound component.
- **`DropdownMenu` / `DropdownMenuTrigger` / `DropdownMenuContent` / `DropdownMenuItem` / `DropdownMenuSeparator` / `DropdownMenuLabel`** — context-based dropdown menu with auto up/down direction, outside-click and Escape close, `destructive` + `disabled` item variants.
- **`Table` / `TableHeader` / `TableHeaderRow` / `TableHead` / `TableBody` / `TableRow` / `TableCell` / `TableEmpty` / `TablePagination`** — compound table with sticky header, sort indicators, dividers. Context-based (`useTable`).
- **`DataTable`** — declarative wrapper: pass `data`, `columns: ColumnDef[]`, `sort`, `pagination` and it renders a full `Table`. Hooks: `useTableSort`, `useTableData`, `useTableSearch`, `useTablePagination`. Helpers: `formatAed`, `formatDate`, `formatDateTime`, `shortId`, comparators (`compareString`, `compareNumber`, `compareDate`).
- **`DataCard` / `DataCardHeader` / `DataCardBody` / `DataCardField` / `DataCardFooter` / `DataCardGrid` / `DataCardList` / `DataCardEmpty`** — compound card for mobile-friendly data display. Context-based (`useDataCard`). `DataCardList` uses CSS grid (`grid-cols-1` default, pass `className` for responsive cols). `DataCardGrid` is a declarative helper that renders `FieldDef[]`.
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

- **`FilterProvider`** (`src/providers/FilterProvider.tsx`) — generic React context for `Record<string, string>` filter state. `useFilterBar(key)` returns `{ value, onValueChange }`.
- **`SearchParamsFilterProvider`** (`src/providers/SearchParamsFilterProvider.tsx`) — wraps `FilterProvider` and syncs state to URL search params (supports browser back/forward).
- Filter keys typically: `["search", "status"|"type", "sortKey", "sortDir", "page", "pageSize"]`.
- Always reset `page` filter when changing search/status filters.

## Key business logic

- **PartnershipCTA** section (`src/sections/PartnershipCTA.tsx`) replaces the old InstagramCTA. It offers two contact channels: Instagram DM button (uses `NEXT_PUBLIC_INSTAGRAM_DM_URL` + `NEXT_PUBLIC_INSTAGRAM_BRAND_URL`) and an inline partnership inquiry form that submits via `useActionState` to a server action saving to `partnership_inquiries`. Always use `target="_blank" rel="noopener noreferrer"` for Instagram links. See `.env.example` for all Instagram env vars.
- **Product data** loaded from Supabase (with `image_url` from Storage). Static fallback data lives in `src/sections/products/consts.ts`. `mapDbProducts()` converts Supabase rows to the `Product` type.
- **Delivery fee** is `NEXT_PUBLIC_DELIVERY_FEE` env var (default 25 AED), defined in `src/shared/consts.ts`.
- **Product fields** `benefits`, `nutrition`, `servingIdeas`, `occasions` are stored for future modal/detail use but not rendered yet.

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
  values?: Partial<FooInfo>; // echo back form values for repopulation (optional)
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
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  // 4. DB call
  const { error } = await supabaseAdmin.from("foos").insert({ name });
  if (error) return { error: "Failed to save. Please try again." };

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
- Never use `supabaseAdmin` for auth-identity operations — use `createSupabaseServerClient()` instead
- Actions that need the current user must call `createSupabaseServerClient()` and redirect to `/login` if no session

## Animations

Import as:

```ts
import { motion } from "motion/react";
```

Standard patterns: `initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}` with `staggerChildren` for groups. Hero parallax via `useScroll` + `useTransform`.

Any section that uses `motion` hooks (`useScroll`, `useTransform`) must add `"use client"` at the top of the file.
