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
- **pnpm** as package manager

## Path alias

`@/*` maps to `src/*` — use `@/shared/ui`, `@/components`, etc.

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # fonts + SEO metadata
│   ├── page.tsx            # landing page (assembles all sections)
│   ├── globals.css         # Tailwind @theme tokens (brand colors, fonts)
│   ├── metadata.ts         # shared Next.js Metadata object
│   ├── structured-data.ts  # JSON-LD schema
│   ├── sitemap.ts          # dynamic sitemap
│   └── robots.ts           # robots.txt rules
└── shared/
    ├── ui/                 # reusable primitives (Button, Badge, Card, etc.)
    ├── sections/           # page-level section components (Navbar, Hero, etc.)
    │   └── products/       # product sub-module: types.ts, consts.ts, ProductGrid, ProductItem
    ├── providers/          # React context providers + hooks
    ├── icons/              # SVG icon components + index.ts barrel
    ├── types/              # shared TypeScript types (Category enum, etc.)
    └── utils/cn.ts         # clsx + tailwind-merge
```

**Rule:** generic primitives → `src/shared/ui/`, page sections → `src/shared/sections/`, SVG icons → `src/shared/icons/`, React context providers → `src/shared/providers/`.

**Page assembly** (`page.tsx`): `CategoryFilterProvider` wraps `CategoryCards` + `ProductGrid` so they share a single active-category state.

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
- **`Collapsible` / `CollapsibleTrigger` / `CollapsibleChevron` / `CollapsibleContent`** — animated accordion. `CollapsibleContent` uses `motion/react` `AnimatePresence` for height transition.

## Key business logic

- **Main CTA** links to Instagram DM via `process.env.NEXT_PUBLIC_INSTAGRAM_DM_URL`. Always use `target="_blank" rel="noopener noreferrer"`. See `.env.example` for the full set of Instagram env vars (`NEXT_PUBLIC_INSTAGRAM_DM_URL`, `NEXT_PUBLIC_INSTAGRAM_BRAND_URL`, `NEXT_PUBLIC_INSTAGRAM_BRAND`).
- No cart or e-commerce — this is a pure showcase landing. All purchase flow goes through Instagram.
- Product data is static (no API). Lives in `src/shared/sections/products/consts.ts`. The `Product` type and `Category` enum are defined alongside in `types.ts` and `src/shared/types/Categories.ts` respectively. Product fields `benefits`, `nutrition`, `servingIdeas`, `occasions` are stored for future modal/detail use but not rendered yet.

## Animations

`motion/react` (not `framer-motion`) — lighter package, same API. Import as:

```ts
import { motion } from "motion/react";
```

Standard patterns: `initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}` with `staggerChildren` for groups. Hero parallax via `useScroll` + `useTransform`.

Any section that uses `motion` hooks (`useScroll`, `useTransform`) must add `"use client"` at the top of the file.
