# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
│   └── globals.css         # Tailwind @theme tokens (brand colors, fonts)
├── shared/
│   ├── ui/                 # reusable primitives (Button, Badge, Card)
│   └── utils/cn.ts         # clsx + tailwind-merge
└── components/             # page-level section components (Navbar, Hero, etc.)
```

**Rule:** generic primitives → `src/shared/ui/`, page sections → `src/components/`.

## Design system

Brand tokens live in `globals.css` `@theme` block and map directly to Tailwind utilities:

| Token | Utility | Use |
|---|---|---|
| `--color-cream` | `bg-cream` | main background |
| `--color-sand` | `bg-sand` | secondary bg, cards |
| `--color-earth` | `bg-earth` / `text-earth` | dark sections, body text |
| `--color-orange` | `bg-orange` / `text-orange` | primary CTA |
| `--color-orange-light` | `bg-orange-light` | hover state |
| `--color-moss` | `text-moss` | "natural" badges |
| `--color-white-warm` | `bg-white-warm` | card backgrounds |
| `--font-display` | `font-display` | Cormorant Garamond, headings |
| `--font-body` | `font-body` | Jost, body/labels/buttons |

Typography pattern: display H1 → `font-display font-bold italic`, H2–H3 → `font-display font-semibold`, body → `font-body font-light`, labels/CTA → `font-body font-semibold uppercase tracking-[0.12em]`.

Grain texture: add class `noise` + `relative` on a section — the `.noise::after` pseudo-element in `globals.css` renders a CSS-only SVG texture (no PNG).

## Shared UI components

All use `class-variance-authority` (cva) for variants + `cn()` for className merging.

- **`Button`** — defaults to `<a>`, pass `as="button"` for `<button>`. Variants: `primary | secondary | ghost`. Sizes: `sm | md | lg`.
- **`Badge`** — inline label/tag. Variants: `natural` (moss green) | `warm` (sand) | `outline`.
- **`Card`** — wrapper with 16px radius. Variants: `default` (white-warm) | `sand` | `outline` | `dark` (earth bg).

## Key business logic

- **Main CTA** always links to `https://ig.me/m/honesta_brand` (Instagram DM) with `target="_blank" rel="noopener noreferrer"`.
- No cart or e-commerce — this is a pure showcase landing. All purchase flow goes through Instagram.
- Product data is static (no API). Keep it co-located in the component or in a `src/data/` file.

## Animations

`motion/react` (not `framer-motion`) — lighter package, same API. Import as:
```ts
import { motion } from "motion/react"
```
Standard patterns: `initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}` with `staggerChildren` for groups. Hero parallax via `useScroll` + `useTransform`.
