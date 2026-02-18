# HONESTA — Landing Page: Техническое описание

## Обзор проекта

**Бренд:** HONESTA — натуральные сушёные фрукты, ручное производство, без добавок  
**Тип:** Single-page landing (визитка-витрина)  
**Стек:** Next.js 14 (App Router) + Tailwind CSS  
**Язык контента:** English  
**Главный CTA:** Переход в Instagram DM  
**Цель:** Убедить посетителя в честности и качестве продукта → подтолкнуть написать в Instagram

---

## 1. Дизайн-система

### 1.1 Цветовая палитра

```css
--color-cream:     #F5F0E8   /* фон основной, тёплый молочный */
--color-sand:      #E8DCC8   /* вторичный фон, карточки */
--color-parchment: #D4C4A0   /* разделители, мягкие акценты */
--color-bark:      #8B6914   /* тёмный акцент, иконки */
--color-orange:    #D4731A   /* главный CTA, ключевые акценты */
--color-orange-lt: #F0A050   /* hover, вторичный акцент */
--color-earth:     #3D2B1F   /* основной текст, заголовки */
--color-moss:      #5C6B3A   /* бейджи "natural", eco-метки */
--color-white:     #FFFDF8   /* карточки, выделенные блоки */
```

### 1.2 Типографика

```
Display / H1:  "Cormorant Garamond" — 700, italic, serif
               → передаёт premium, честность, историю
Headers H2–H3: "Cormorant Garamond" — 600, нормальный
Body text:     "Jost" — 400/300, лёгкий sans
               → читаемость, чистота, современность
Labels/Tags:   "Jost" — 500, uppercase, letter-spacing: 0.12em
CTA кнопки:    "Jost" — 600, uppercase
```

Google Fonts import:
```
Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,700
Jost:wght@300;400;500;600
```

### 1.3 Декоративные элементы

- Тонкие SVG-линии в стиле ботанических иллюстраций (листья, веточки) — как фоновые акценты
- Зернистая текстура (`noise`) поверх секций — создаёт ощущение крафтовой бумаги
- Скруглённые карточки (radius: 16px) с мягкой тенью
- Фото на фоне имитируют деревянные столешницы и льняные ткани

---

## 2. Архитектура страницы (секции)

```
/
├── [01] HERO
├── [02] TRUST BADGES
├── [03] PRODUCT CATEGORIES
├── [04] FEATURED PRODUCTS GRID
├── [05] WHY HONESTA (Philosophy)
├── [06] SOCIAL PROOF (Reviews)
├── [07] CTA — "Write us on Instagram"
└── [08] FOOTER
```

---

## 3. Детальное описание секций

---

### [01] HERO SECTION

**Цель:** Захватить внимание, передать суть за 3 секунды  
**Высота:** 100vh, full-bleed

**Layout:**
```
[Фоновое фото: сушёные апельсины/фрукты, wood texture, натуральный свет]
[Полупрозрачный overlay: linear-gradient warm cream → transparent]

Позиционирование контента — слева, вертикально центрировано:

  ┌─────────────────────────────────────────────────┐
  │  HONESTA                               [Cart 🛒] │  ← Navbar
  │  Sweetness Before Marketing                      │
  ├─────────────────────────────────────────────────┤
  │                                                  │
  │  [italic display]                                │
  │  Natural sweetness                               │
  │  invented by nature.                             │
  │                                                  │
  │  Honest. Simple. No additives.                   │
  │  Small Batch. Handcrafted.                       │
  │                                                  │
  │  ┌─────────────────────────┐                    │
  │  │  Explore Honest Sweets  │  ← orange button   │
  │  └─────────────────────────┘                    │
  │                                                  │
  └─────────────────────────────────────────────────┘
```

**Копирайт:**
- H1 (display, italic): *"Natural sweetness invented by nature."*
- Subtitle: "Honest. Simple. No additives. Small Batch & Handcrafted."
- CTA primary: `Explore Honest Sweets` → scroll anchor к #products

**Анимации:**
- Fade-in + slide-up при загрузке (stagger: заголовок → подзаголовок → кнопка)
- Parallax-эффект на фоновое фото при скролле (subtle, 20%)

**Navbar:**
- Логотип HONESTA слева
- Tagline: "Sweetness Before Marketing"
- Справа: навигация (Products / Story / Contact) + Instagram-иконка
- При скролле — navbar становится `sticky` с backdrop-blur и лёгкой тенью

---

### [02] TRUST BADGES

**Цель:** Моментальное построение доверия  
**Фон:** `--color-cream` с тонкой текстурой

**Layout:** горизонтальный ряд из 4 бейджей (на мобайле — 2×2 grid)

```
┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐
│  🍃        │  │  🤲        │  │  ✓         │  │  ○ Sugar   │
│ 100% Fruit │  │ Small Batch│  │ Clean Label│  │  No Sugar  │
│            │  │            │  │            │  │  Added     │
│ Nothing    │  │ Made by    │  │ What you   │  │            │
│ else added │  │ hand       │  │ see = all  │  │            │
└────────────┘  └────────────┘  └────────────┘  └────────────┘
```

Каждый бейдж: SVG-иконка (ботанический стиль) + label + короткий дескриптор  
Анимация: иконки появляются с delay stagger при scroll-into-view

---

### [03] PRODUCT CATEGORIES

**Цель:** Помочь посетителю найти "своё", сегментация аудитории  
**Фон:** `--color-sand`

**Заголовок секции:**
```
For Moms & Kids          For Sport & Office        For Gifts & Desserts
A. Kids Collection       B. Clean Energy            C. Gourmet Selection
────────────────────────────────────────────────────────────────────────
No chemistry. Just fruit.   Fuel without guilt.     Chocolate. Nuts. Wow.
```

**Layout:** 3 карточки в ряд (на мобайле — stack)

Каждая категория-карточка:
- Фото продукта / коллажа из 2–3 позиций
- Иконка-метка (leaf / lightning / gift)
- Название категории
- 1-строчный дескриптор
- Кнопка: `Explore →` → scroll или раздел

**Копирайт по категориям:**

**A. For the Little Ones (Pastila)**
> *"Kids deserve real food. No dye, no preservatives — just pure fruit rolled into something delicious."*
> Products: Apple Pastila · Banana Pastila · Apple+Banana · Apple+Date

**B. Clean Energy (Dried Fruits)**
> *"Sport. Office. On the go. Real fuel that fits in your pocket."*
> Products: Dried Orange · Dried Banana · Dried Date · Apple & Pear

**C. Gourmet Dessert**
> *"A perfect gift. Or a treat you don't have to justify."*
> Products: Orange in Dark Choc · Orange in Milk Choc · VIP Orange+Cedar · Banana with Coconut

---

### [04] FEATURED PRODUCTS GRID

**Цель:** Показать конкретные продукты, вызвать желание купить  
**Фон:** `--color-white` (чуть теплее чистого белого)

**Заголовок:** *"What's inside the bag"*  
**Подзаголовок:** "6 ingredients or less. Always."

**Grid layout:** 3 колонки × 2 строки (desktop) / 2×3 (tablet) / 1-col scroll (mobile)

Каждая карточка продукта:
```
┌──────────────────────┐
│   [Фото упаковки]    │  ← square aspect ratio, object-cover
│                      │
├──────────────────────┤
│ Orange in             │  ← название, Cormorant
│ Dark Chocolate        │
│                      │
│ 🍊 100% Fruit        │  ← метки (зелёный moss)
│ ○ No sugar added     │
│                      │
│ ▸ Ask in Instagram   │  ← CTA (subtle link)
└──────────────────────┘
```

**Hover эффект:** лёгкий scale(1.02) + shadow elevation + появление overlay с кратким описанием

---

### [05] WHY HONESTA — Philosophy Block

**Цель:** Эмоциональное подключение, построение бренд-лояльности  
**Layout:** Split — текст слева (60%) / фото справа (40%), на мобайле stack  
**Фон:** `--color-earth` (тёмный) с кремовым текстом → выделяется, создаёт контраст

**Заголовок:** *"Sweetness Before Marketing"*

**Копирайт:**
```
We don't add flavors to mask reality.
We don't add sugar to make up for poor ingredients.
We don't add colors to make things look good in photos.

What we DO add — is time.
Each batch is made slowly, by hand, with care.

That's the whole recipe.
```

**Дополнительные элементы:**
- Цитата в pull-quote стиле: *"If it grows on a tree, it belongs in the bag. If it doesn't — it doesn't."*
- Фото: руки, держащие фрукты / процесс производства / крафт-упаковка

---

### [06] SOCIAL PROOF

**Цель:** Подтверждение качества через реальных людей  
**Фон:** `--color-cream`

**Заголовок:** *"Honest reviews"*  
**Подзаголовок:** `@honesta_brand`

**Layout:** Masonry grid из 4–6 фотографий в Instagram-стиле  
+ 2–3 текстовых отзыва в формате карточек:

```
┌──────────────────────────────────┐
│ ⭐⭐⭐⭐⭐                        │
│                                  │
│ "My kids eat oranges now.         │
│  Like, actual oranges. Dried.     │
│  That's a miracle."              │
│                                  │
│ — Anna, mom of 3                 │
└──────────────────────────────────┘
```

---

### [07] MAIN CTA BLOCK — Instagram DM

**Цель:** Главный конверсионный элемент страницы  
**Фон:** `--color-orange` (warm, привлекающий)  
**Layout:** centred, full-width, generous padding

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│         Hard to choose?                                  │
│   We'll find your perfect flavour together.              │
│                                                          │
│   Tell us if you have kids, allergies, or                │
│   what you're looking for — we'll suggest                │
│   exactly what fits.                                     │
│                                                          │
│   ┌──────────────────────────────────────────┐           │
│   │  📩  Write us on Instagram               │           │
│   └──────────────────────────────────────────┘           │
│                                                          │
│   instagram.com/honesta_brand        (soft link below)  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Кнопка:**
- Label: `📩 Write us on Instagram`
- Href: `https://ig.me/m/honesta_brand` ← прямая ссылка на DM
- Target: `_blank`
- Стиль: белая кнопка на оранжевом фоне, hover — инвертируется (оранжевый текст/border на белом bg)

**Вспомогательный текст:** "No bots. No auto-replies. A real person will answer you."

---

### [08] FOOTER

**Фон:** `--color-earth` (тёмный)  
**Текст:** кремовый

**Колонки (desktop):**
```
HONESTA                  Navigate              Contact
Sweetness Before         Products              📷 @honesta_brand
Marketing                Our Story             📩 DM on Instagram
                         FAQ                   📧 honest@...
© 2024 HONESTA           Delivery
All rights reserved.
Made with care.
```

---

## 4. Технические детали реализации

### 4.1 Структура Next.js проекта

```
src/
├── app/
│   ├── layout.tsx          ← fonts (next/font/google), metadata, globals
│   ├── page.tsx            ← main landing (все секции)
│   └── globals.css         ← @theme tokens, base styles (Tailwind v4)
├── shared/
│   ├── ui/
│   │   ├── Button.tsx      ← cva variants: primary | secondary | ghost
│   │   ├── Badge.tsx       ← cva variants: natural | warm | outline
│   │   ├── Card.tsx        ← cva variants: default | sand | outline | dark
│   │   └── index.ts        ← barrel export
│   └── utils/
│       └── cn.ts           ← clsx + tailwind-merge helper
├── components/
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── TrustBadges.tsx
│   ├── CategoryCards.tsx
│   ├── ProductGrid.tsx
│   ├── PhilosophyBlock.tsx
│   ├── Reviews.tsx
│   ├── InstagramCTA.tsx
│   └── Footer.tsx
└── public/
    └── images/             ← product photos, textures
```

### 4.2 Tailwind v4 — CSS-based токены (globals.css)

> **Tailwind v4 не использует `tailwind.config.ts` для кастомных токенов.**
> Всё определяется в `globals.css` через директиву `@theme`.

```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  /* Colors */
  --color-cream:        #F5F0E8;
  --color-sand:         #E8DCC8;
  --color-parchment:    #D4C4A0;
  --color-bark:         #8B6914;
  --color-orange:       #D4731A;
  --color-orange-light: #F0A050;
  --color-earth:        #3D2B1F;
  --color-moss:         #5C6B3A;
  --color-white-warm:   #FFFDF8;

  /* Fonts */
  --font-display: "Cormorant Garamond", serif;
  --font-body:    "Jost", sans-serif;

  /* Border radius */
  --radius-card: 16px;
}
```

Использование в JSX: `bg-orange`, `text-earth`, `font-display`, `font-body` и т.д.

**Шрифты подключаются через `next/font/google` в `layout.tsx`:**

```tsx
import { Cormorant_Garamond, Jost } from "next/font/google";

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
});

const jost = Jost({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});
```

**Зернистая текстура — CSS-only** (без PNG), через `.noise::after` с SVG feTurbulence.

### 4.3 Instagram DM ссылка

```tsx
// Прямая ссылка на Instagram Direct Message
const INSTAGRAM_DM_URL = 'https://ig.me/m/honesta_brand'

// Кнопка
<a
  href={INSTAGRAM_DM_URL}
  target="_blank"
  rel="noopener noreferrer"
  className="inline-flex items-center gap-3 bg-white text-orange px-8 py-4 
             rounded-full font-body font-semibold uppercase tracking-wider 
             hover:bg-orange hover:text-white border-2 border-white 
             transition-all duration-300"
>
  <InstagramIcon />
  Write us on Instagram
</a>
```

### 4.4 Анимации (рекомендации)

```
Библиотека: framer-motion (совместима с Next.js App Router)

Паттерны:
- whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 30 }}
- staggerChildren для badge-групп и product-grid
- Hero: useScroll + useTransform для parallax
- CTA блок: pulse-анимация на кнопке Instagram (subtle)
```

### 4.5 SEO Metadata

```typescript
// app/layout.tsx
export const metadata = {
  title: 'HONESTA — Natural Dried Fruits. Sweetness Before Marketing.',
  description: 'Handcrafted dried fruits and pastila. 100% fruit. No sugar. No additives. Small batch production with love.',
  openGraph: {
    images: ['/og-image.jpg'],  // фото продуктов на wood texture
  },
  keywords: ['dried fruits', 'natural snacks', 'no sugar', 'handcrafted', 'healthy sweets'],
}
```

---

## 5. Контентная стратегия и копирайтинг

### Ключевые смысловые блоки (в порядке приоритета):

| Блок | Цель | Сообщение |
|------|------|-----------|
| Hero | Внимание | Природа изобрела это до нас |
| Trust Badges | Доверие | Мы скрываем только одно — больше нечего скрывать |
| Categories | Навигация | Найди своё |
| Products | Желание | Посмотри, что внутри |
| Philosophy | Лояльность | Мы делаем медленно — зато правильно |
| Reviews | Подтверждение | Другие уже попробовали |
| Instagram CTA | Конверсия | Напиши нам — поможем выбрать |

### Финальный призыв к действию (CTA копирайт):

**Заголовок:** *"Hard to choose?"*  
**Подзаголовок:** *"We'll help you find your perfect flavour. No bots — just us."*  
**Кнопка:** `📩 Write us on Instagram`  
**Под кнопкой (микро-текст):** *"We reply to every message. Usually within an hour."*

---

## 6. Мобильная адаптация

| Секция | Desktop | Tablet | Mobile |
|--------|---------|--------|--------|
| Hero | Full image, text left | Centered text | Stacked, image below |
| Trust Badges | 4 в ряд | 2×2 | 2×2 |
| Categories | 3 cards | 3 cards scroll | Stack |
| Product Grid | 3×2 | 2×3 | 1 col |
| Philosophy | Split 60/40 | Stack | Stack |
| Reviews | Masonry 3 col | 2 col | 1 col |
| CTA | Full width centered | Full width | Full width |

Breakpoints (Tailwind defaults):
- `sm`: 640px  
- `md`: 768px  
- `lg`: 1024px  
- `xl`: 1280px

---

## 7. Производительность

- Изображения: `next/image` с `priority` для hero, `lazy` для остальных
- Формат: WebP с JPG fallback
- Fonts: `next/font/google` (no layout shift)
- Анимации: `will-change: transform` только на активных элементах
- Grain texture: CSS-only через `::after` pseudo с SVG filter (без тяжёлого PNG)

---

## 8. Финальный чеклист перед разработкой

- [ ] Подготовить фотоматериалы: продукты, текстуры, lifestyle
- [ ] Получить реальную ссылку Instagram DM (`ig.me/m/{username}`)
- [ ] Определить точные SKU и названия продуктов на EN
- [ ] Настроить Google Analytics / Yandex.Metrica
- [ ] Добавить Pixel Instagram (если планируется таргетинг)
- [ ] Проверить GDPR / cookie consent если аудитория EU

---

*HONESTA Landing Page Technical Specification v1.0*  
*Prepared based on brand references and design brief*
