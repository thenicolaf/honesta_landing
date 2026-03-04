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
- **Supabase** (`@supabase/supabase-js`) — orders + products database
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
│   ├── layout.tsx              # Root layout — wraps with CartProvider
│   ├── page.tsx                # Landing page (Hero, Products, Categories)
│   ├── cart/page.tsx           # Shopping cart route
│   ├── checkout/
│   │   ├── page.tsx            # Checkout form (reads customer cookie)
│   │   ├── cancel/page.tsx     # Payment cancelled fallback
│   │   └── result/page.tsx     # Payment result (polls N-Genius, updates DB)
│   ├── api/payment/webhook/    # N-Genius webhook → updates order status in Supabase
│   └── globals.css, metadata.ts, sitemap.ts, robots.ts, structured-data.ts
│
├── lib/                        # Backend / data-access layer (server-only)
│   ├── supabase.ts             # Two clients: `supabase` (anon/RLS) + `supabaseAdmin` (service role)
│   ├── ngenius.ts              # N-Genius payment API (auth, create order, poll status)
│   ├── payments.ts             # Orchestrates: create payment → update DB with ngenius_ref
│   ├── orders.ts               # Supabase order creation (orders + order_items tables)
│   └── cart.ts                 # localStorage cart helpers (getCart, addItem, removeItem, etc.)
│
├── pages_flow/                 # Page-level component trees (co-located with their routes)
│   ├── cart/                   # CartPage + CartItems + CartSummary
│   ├── checkout/               # CheckoutPage + CheckoutForm + OrderSummary + SubmitButton
│   │   └── actions.ts          # Server action: validate → save to DB → create payment → redirect
│   └── home/                   # CategoriesSection, ProductsSection
│
├── providers/                  # React context providers + hooks
│   ├── CartProvider.tsx        # useSyncExternalStore-based cart state (hydration-safe)
│   └── CategoryFilterProvider.tsx
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

## Supabase

Two client instances in `src/lib/supabase.ts`:
- `supabase` — anon key, subject to RLS (use in client components and non-sensitive queries)
- `supabaseAdmin` — service role, bypasses RLS (use only in server actions, API routes, and `lib/`)

**DB tables:** `orders` (status, subtotal, delivery_fee, total, customer fields, ngenius_ref), `order_items` (order_id, product_id, name, price, quantity), `products` (images in Supabase Storage → `image_url` field), `partnership_inquiries` (business_name, contact_name, phone, business_type, message).

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

## Shared UI components

All use `class-variance-authority` (cva) for variants + `cn()` for className merging.

Compound components (e.g. `Collapsible`, `TagToolbar`) hold state in React context internally; sub-components access it via a `use*` hook. Follow this same pattern when adding new compound components.

- **`Button`** — defaults to `<a>`, pass `as="button"` for `<button>`. Variants: `primary | secondary | ghost`. Sizes: `sm | md | lg`.
- **`Badge`** — inline label/tag. Variants: `natural` (moss green) | `warm` (sand) | `outline`.
- **`Card`** — wrapper with 16px radius. Variants: `default` (white-warm) | `sand` | `outline` | `dark` (earth bg).
- **`TagToolbar` / `TagToolbarItem`** — single-select pill filter bar (`role="radiogroup"`). Controlled or uncontrolled via `value`/`onValueChange`/`defaultValue`. Empty string `""` means "All".
- **`Collapsible` / `CollapsibleTrigger` / `CollapsibleChevron` / `CollapsibleContent`** — animated accordion using `motion/react` `AnimatePresence`.
- **`Select` / `SelectTrigger` / `SelectValue` / `SelectContent` / `SelectItem` / `SelectGroup` / `SelectSeparator`** — custom dropdown, context-based, supports controlled/uncontrolled, `clearable` prop, auto up/down direction.
- **`Form` components** — `FormLabel`, `FormInput`, `FormSelect`, `FormTextarea`, `FormError` — CVA variants with `default` / `error` states. `FormSelect` wraps the `Select` compound component.
- **`CartEmpty`** — empty cart placeholder screen.
- **`Loader`** — loading spinner (used during cart hydration).

## Key business logic

- **PartnershipCTA** section (`src/sections/PartnershipCTA.tsx`) replaces the old InstagramCTA. It offers two contact channels: Instagram DM button (uses `NEXT_PUBLIC_INSTAGRAM_DM_URL` + `NEXT_PUBLIC_INSTAGRAM_BRAND_URL`) and an inline partnership inquiry form that submits via `useActionState` to a server action saving to `partnership_inquiries`. Always use `target="_blank" rel="noopener noreferrer"` for Instagram links. See `.env.example` for all Instagram env vars.
- **Product data** loaded from Supabase (with `image_url` from Storage). Static fallback data lives in `src/sections/products/consts.ts`. `mapDbProducts()` converts Supabase rows to the `Product` type.
- **Delivery fee** is `NEXT_PUBLIC_DELIVERY_FEE` env var (default 25 AED), defined in `src/shared/consts.ts`.
- **Product fields** `benefits`, `nutrition`, `servingIdeas`, `occasions` are stored for future modal/detail use but not rendered yet.

## Animations

Import as:

```ts
import { motion } from "motion/react";
```

Standard patterns: `initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}` with `staggerChildren` for groups. Hero parallax via `useScroll` + `useTransform`.

Any section that uses `motion` hooks (`useScroll`, `useTransform`) must add `"use client"` at the top of the file.
