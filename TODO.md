# HONESTA Landing — Чеклист разработки

> Спецификация: [HONESTA_LANDING_SPEC.md](./HONESTA_LANDING_SPEC.md)

---

## Инфраструктура

- [x] `globals.css` — бренд-токены через Tailwind v4 `@theme` → [spec §4.2](./HONESTA_LANDING_SPEC.md#42-tailwind-v4--css-based-токены-globalscss)
- [x] `layout.tsx` — шрифты Cormorant Garamond + Jost через `next/font/google` → [spec §1.2](./HONESTA_LANDING_SPEC.md#12-типографика)
- [x] `layout.tsx` — SEO metadata (title, description, OG) → [spec §4.5](./HONESTA_LANDING_SPEC.md#45-seo-metadata)
- [x] `src/shared/ui/Button.tsx` — cva variants: `primary | secondary | ghost`
- [x] `src/shared/ui/Badge.tsx` — cva variants: `natural | warm | outline`
- [x] `src/shared/ui/Card.tsx` — cva variants: `default | sand | outline | dark`
- [x] Установить `motion` → [spec §4.4](./HONESTA_LANDING_SPEC.md#44-анимации-рекомендации)

---

## Компоненты секций

> Порядок секций: [spec §2](./HONESTA_LANDING_SPEC.md#2-архитектура-страницы-секции)

- [x] `Navbar.tsx` — логотип, tagline, nav-ссылки, Instagram-иконка, sticky + backdrop-blur → [spec §3 / Hero / Navbar](./HONESTA_LANDING_SPEC.md#01-hero-section)
- [x] `Hero.tsx` — 100vh, фото-фон + overlay, H1 italic, subtitle, CTA-кнопка, parallax → [spec §3.01](./HONESTA_LANDING_SPEC.md#01-hero-section)
- [x] `TrustBadges.tsx` — 4 бейджа (100% Fruit / Small Batch / Clean Label / No Sugar), stagger анимация → [spec §3.02](./HONESTA_LANDING_SPEC.md#02-trust-badges)
- [x] `CategoryCards.tsx` — 3 карточки (Pastila / Dried Fruits / Gourmet), копирайт из спека → [spec §3.03](./HONESTA_LANDING_SPEC.md#03-product-categories)
- [x] `ProductGrid.tsx` — 6 продуктов 3×2, hover overlay, CTA → Instagram DM → [spec §3.04](./HONESTA_LANDING_SPEC.md#04-featured-products-grid)
- [x] `PhilosophyBlock.tsx` — тёмный фон `earth`, split 60/40, манифест + pull-quote → [spec §3.05](./HONESTA_LANDING_SPEC.md#05-why-honesta--philosophy-block)
- [x] `InstagramCTA.tsx` — оранжевый блок, кнопка `ig.me/m/honesta_brand`, микро-текст → [spec §3.07](./HONESTA_LANDING_SPEC.md#07-main-cta-block--instagram-dm)
- [x] `Footer.tsx` — 3 колонки, фон `earth`, кремовый текст → [spec §3.08](./HONESTA_LANDING_SPEC.md#08-footer)

---

## Сборка страницы

- [x] `page.tsx` — собрать все секции в порядке из спека → [spec §2](./HONESTA_LANDING_SPEC.md#2-архитектура-страницы-секции)

---

## Медиа / контент

> Требования: [spec §8](./HONESTA_LANDING_SPEC.md#8-финальный-чеклист-перед-разработкой)

- [ ] Фото для Hero (сушёные апельсины, wood texture, натуральный свет) → `public/images/hero.jpg`
- [ ] Фото продуктов (6 позиций для ProductGrid) → `public/images/products/`
- [ ] Lifestyle-фото для PhilosophyBlock (руки, производство, упаковка) → `public/images/`
- [ ] Instagram-фото для Reviews (4–6 штук) → `public/images/reviews/`
- [ ] `public/og-image.jpg` — для OpenGraph
- [ ] Уточнить финальные названия SKU на английском → [spec §3.04](./HONESTA_LANDING_SPEC.md#04-featured-products-grid)

---

## Аналитика и трекинг (опционально)

> [spec §8](./HONESTA_LANDING_SPEC.md#8-финальный-чеклист-перед-разработкой)

- [ ] Google Analytics
- [ ] Instagram Pixel (если планируется таргетинг)
- [ ] GDPR / cookie consent (если аудитория EU)
