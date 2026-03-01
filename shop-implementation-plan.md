# Honesta Shop — план реализации интернет-магазина

## Контекст

Текущее состояние: лендинг с каталогом товаров (14 продуктов в `consts.ts`) и заглушкой чекаута.
Нужно: полноценный магазин — корзина, оформление заказа, оплата через N-Genius, хранение заказов в Supabase.

Ключевые решения:
- Товары **переносятся в Supabase** (таблицы `categories` + `products`)
- Только заказы (orders, order_items) пишутся через API routes с `supabaseAdmin`
- Корзина хранится в `localStorage`, провайдер — React context
- Данные покупателя автосохраняются в `localStorage` для автозаполнения

---

## Фаза 1 — Инфраструктура

### TODO 1.1 — Установить `@supabase/supabase-js`
```bash
pnpm add @supabase/supabase-js
```

### TODO 1.2 — Обновить `.env.example`
Добавить в конец файла:
```
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### TODO 1.3 — Создать `src/lib/supabase.ts`
```typescript
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Только для API routes (server-side)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);
```

### TODO 1.4 — Создать `src/lib/cart.ts`
localStorage-утилиты, нет React-зависимостей. Функции:
- `getCart(): CartItem[]` — читает из `"honesta_cart"`, возвращает `[]` на сервере
- `addItem(item)` — добавляет или увеличивает quantity
- `removeItem(id)` — удаляет по id
- `updateQuantity(id, qty)` — обновляет qty (если 0 → removeItem)
- `clearCart()` — удаляет ключ из localStorage
- `getTotal(items)` — считает сумму

### TODO 1.5 — Создать `src/lib/customer-storage.ts`
Экспортировать `CustomerInfo` интерфейс + `saveCustomer` / `loadCustomer`.

---

## Фаза 2 — База данных Supabase

### TODO 2.1 — Выполнить SQL в Supabase Dashboard

```sql
-- Enum для слагов категорий
CREATE TYPE category_slug AS ENUM (
  'mix-and-gift', 'dried-fruits', 'fruit-leather', 'mix-seeds'
);

-- Категории
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug category_slug NOT NULL UNIQUE,
  audience TEXT,
  tagline TEXT,
  description TEXT,
  badge TEXT NOT NULL DEFAULT 'natural',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Товары
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,          -- ключ совпадает с consts.ts (напр. "DRIED APPLE")
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  tagline TEXT,
  tags TEXT[] DEFAULT '{}',
  free_from TEXT[] DEFAULT '{}',
  badge TEXT NOT NULL DEFAULT 'natural',
  price NUMERIC(10,2) NOT NULL,
  image_url TEXT,
  in_stock BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Заказы
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ngenius_ref TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'PENDING',
  subtotal NUMERIC(10,2) NOT NULL,
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 25,
  total NUMERIC(10,2) NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  district TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Dubai',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Позиции заказа
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0)
);

-- Индексы
CREATE INDEX ON orders (ngenius_ref);
CREATE INDEX ON orders (status);
CREATE INDEX ON order_items (order_id);
CREATE INDEX ON products (category_id);
```

### TODO 2.2 — Заполнить таблицу `categories` (4 строки)

| slug | name | audience | badge |
|---|---|---|---|
| dried-fruits | Dried Fruits | Pure & Simple | natural |
| fruit-leather | Fruit Leather | Chewy & Clean | natural |
| mix-and-gift | Mix & Gift | For Every Occasion | warm |
| mix-seeds | Mix Seeds | Plant Power | natural |

### TODO 2.3 — Заполнить таблицу `products` (14 товаров)

Цены (AED, дубайский рынок премиальных снеков):

| name | title | price |
|---|---|---|
| DRIED APPLE | Natural Apple Snack | 28 |
| DRIED APPLE WITH CINNAMON | Apple & Cinnamon Snack | 30 |
| DRIED APPLE WITH HONEY & PEANUT | Apple, Honey & Peanut Snack | 35 |
| NATURAL BANANA SNACK | Natural Banana Snack | 25 |
| DRIED BANANA WITH COCONUT | Banana & Coconut Snack | 30 |
| DRIED PERSIMMON | Dried Persimmon | 35 |
| DRIED ORANGE | Dried Orange | 28 |
| DRIED PINEAPPLE | Dried Pineapple | 28 |
| APPLE FRUIT LEATHER | Apple Fruit Leather | 22 |
| APPLE / BANANA FRUIT LEATHER | Apple & Banana Fruit Leather | 25 |
| APPLE / PINEAPPLE FRUIT LEATHER | Apple & Pineapple Fruit Leather | 25 |
| ORANGE SLICES WITH 70% DARK CHOCOLATE | Orange Slices with Dark Chocolate | 48 |
| ORANGE SLICES WITH MILK CHOCOLATE | Orange Slices with Milk Chocolate | 45 |
| ORANGE SLICES WITH 70% DARK CHOCOLATE & PINE NUTS | Orange Slices with Dark Chocolate & Pine Nuts | 58 |

`image_url` — локальные пути из consts.ts (напр. `/images/products/DRIED APPLE.webp`), `slug` — kebab-case от title.

---

## Фаза 3 — Провайдер корзины и загрузка товаров

### TODO 3.1 — Создать `src/shared/providers/CartProvider.tsx`

Паттерн — такой же как `CategoryFilterProvider.tsx`:
- `"use client"` в начале
- `createContext` + кастомный хук `useCart()`
- Инициализация `items = []` (SSR), гидрация через `useEffect(() => setItems(getCart()), [])`
- Методы: `addToCart`, `removeFromCart`, `updateItemQuantity`, `clearCart`
- Поля: `items`, `itemCount`, `total`

### TODO 3.2 — Обновить `src/shared/providers/index.ts`
Добавить экспорт `CartProvider` и `useCart`.

### TODO 3.3 — Обновить `src/app/layout.tsx`
Обернуть `<Navbar>` + `{children}` + `<Footer>` в `<CartProvider>`.
`<script>` с JSON-LD остаётся снаружи провайдера (статический тег).

### TODO 3.4 — Обновить `src/app/page.tsx`
Добавить асинхронный fetch товаров из Supabase:
```typescript
const { data: products } = await supabase
  .from("products")
  .select("*, categories(slug)")
  .eq("in_stock", true);
```
Передать `products` как prop в `<ProductGrid products={products ?? []} />`.

### TODO 3.5 — Обновить `src/shared/sections/products/ProductGrid.tsx`
Изменить сигнатуру: принимать `products: Product[]` как prop вместо импорта из `consts.ts`.
Убрать статический `import { products } from "./consts"`.

### TODO 3.6 — Обновить `src/shared/sections/products/types.ts`
Сделать `price` и `id` обязательными (или оставить optional и добавить guard в ProductItem).

---

## Фаза 4 — UI: карточки товаров и Navbar

### TODO 4.1 — Обновить `src/shared/sections/products/ProductItem.tsx`

Заменить `ProductCta` (Instagram-кнопка) на `ProductPriceAndCart`:

```
┌─────────────────────────────────┐
│ AED 28          [Add to Cart]   │  ← in_stock = true, не в корзине
│ AED 28    [−] 2 [+]             │  ← уже в корзине
│ AED 28    [Out of Stock]        │  ← in_stock = false
└─────────────────────────────────┘
```

- Использовать `useCart()` для чтения items и вызова `addToCart`/`updateItemQuantity`/`removeFromCart`
- `cartItem = items.find(i => i.id === product.id)` — поиск по Supabase UUID
- При добавлении: `addToCart({ id: product.id, name: product.title, price: product.price, image_url: product.image_url })`
- Кнопка «Add to Cart» → `Button as="button" variant="primary" size="sm"`
- Счётчик — inline `<button>` с `−` / `+`
- «Out of Stock» → `<Badge variant="outline">`

### TODO 4.2 — Обновить `src/shared/sections/Navbar.tsx`

Добавить в "Right actions" (рядом с кнопкой Instagram) иконку корзины с бейджем количества:
```tsx
import { ShoppingCart } from "lucide-react";  // уже импортируется lucide-react
import { useCart } from "@/shared/providers";

// В компоненте:
const { itemCount } = useCart();
// Рендер:
<Link href="/cart" className="relative p-2 text-earth hover:text-orange transition-colors">
  <ShoppingCart className="w-5 h-5" strokeWidth={1.5} />
  {itemCount > 0 && (
    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-orange text-white-warm text-[0.5rem] font-body font-semibold flex items-center justify-center">
      {itemCount > 9 ? "9+" : itemCount}
    </span>
  )}
</Link>
```

---

## Фаза 5 — Страницы и API

### TODO 5.1 — Создать `src/app/cart/page.tsx`

`"use client"` страница:
- Читать `{ items, total, updateItemQuantity, removeFromCart }` из `useCart()`
- Если пусто: сообщение + кнопка «Browse Products» (→ `/#products`)
- Список товаров: фото, название, цена, счётчик `−` qty `+`, кнопка удалить
- Итог: subtotal, доставка 25 AED, total
- Кнопка «Checkout» → `/checkout`
- Стилизация: `bg-cream`, `Card variant="default"`, шрифты по design system

### TODO 5.2 — Переписать `src/app/checkout/page.tsx`

`"use client"` страница с полной формой и автозаполнением:

**Поля** (все обязательные кроме notes):
- firstName, lastName, email, phone (+971XXXXXXXXX)
- address (улица/дом/квартира)
- district (select: JBR, Marina, Palm Jumeirah, Downtown Dubai, Business Bay, DIFC, Jumeirah, Al Barsha, Dubai Hills, Mirdif, JLT, Sports City, Motor City, Arabian Ranches, Deira, Bur Dubai, Discovery Gardens, International City)
- notes (textarea, optional)

**Автозаполнение**: `useEffect` → `loadCustomer()` → `setFormData`

**Submit flow**:
1. Валидация формы
2. `saveCustomer(formData)`
3. `POST /api/orders/create` → `{ orderId }`
4. `POST /api/payment/create` → `{ paymentUrl }` (передать orderId + customer data)
5. `window.location.href = paymentUrl`

**Правый сайдбар**: список товаров из `useCart()`, subtotal, доставка 25 AED, итого.

**Если корзина пустая**: редирект на `/#products` (или сообщение).

### TODO 5.3 — Создать `src/app/api/orders/create/route.ts`

```typescript
// POST body: { items: CartItem[], firstName, lastName, email, phone, address, district, notes }

1. subtotal = sum(items.price * qty)
2. deliveryFee = 25
3. total = subtotal + 25
4. INSERT INTO orders → get order.id
5. INSERT INTO order_items (batch)
6. return { orderId: order.id }
```

Использовать `supabaseAdmin` из `@/lib/supabase`.

### TODO 5.4 — Обновить `src/app/api/payment/create/route.ts`

Принимать расширенный body: `{ amount, reference, email, firstName, lastName, address, district }`.
Обновить вызов `createOrder()` в `ngenius.ts` (или передать `billingAddress` напрямую в body):
```typescript
billingAddress: {
  firstName, lastName,
  address1: address,
  address2: district,
  city: "Dubai",
  stateProvince: "Dubai",
  countryCode: "AE",
}
```
Также обновить `merchantOrderReference` = orderId из Supabase.
После создания платежа — сохранить `ngenius_ref` в заказе:
```sql
UPDATE orders SET ngenius_ref = orderRef WHERE id = orderId
```

### TODO 5.5 — Обновить `src/app/checkout/result/page.tsx`

Добавить после получения `state`:
```typescript
// Обновить статус в Supabase
const statusMap: Record<string, string> = { PURCHASED: "PAID", CAPTURED: "PAID", FAILED: "FAILED" };
const newStatus = statusMap[state ?? ""];
if (newStatus) {
  await supabaseAdmin.from("orders")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("ngenius_ref", ref);
}
```

Для очистки корзины при успехе — добавить клиентский компонент `<ClearCartOnSuccess success={success} />` (делает `clearCart()` в `useEffect`).

На странице успеха показать больше деталей (номер заказа, список товаров, адрес).

### TODO 5.6 — Обновить `src/app/checkout/cancel/page.tsx`

При наличии `?ref=...` в searchParams:
```typescript
await supabaseAdmin.from("orders")
  .update({ status: "CANCELLED", updated_at: new Date().toISOString() })
  .eq("ngenius_ref", ref);
```
Кнопка «Back to Cart» → `/cart` (товары в localStorage сохранились).

### TODO 5.7 — Обновить `src/app/api/payment/webhook/route.ts`

Заменить заглушку реальной логикой:
```typescript
const statusMap = { PURCHASED: "PAID", CAPTURED: "PAID", FAILED: "FAILED", REVERSED: "CANCELLED" };
const newStatus = statusMap[eventName];
if (newStatus) {
  await supabaseAdmin.from("orders")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("ngenius_ref", ngeniusRef);
}
return NextResponse.json({ success: true });
```

---

## Порядок реализации (оптимальный)

```
1.1 → 1.2 → 1.3 → 1.4 → 1.5   # инфраструктура
2.1 → 2.2 → 2.3                 # Supabase таблицы и данные
3.1 → 3.2 → 3.3 → 3.4 → 3.5   # провайдер + загрузка товаров
4.1 → 4.2                       # UI товаров и navbar
5.1 → 5.2 → 5.3 → 5.4          # cart + checkout + API
5.5 → 5.6 → 5.7                 # result, cancel, webhook
```

---

## Ключевые файлы

| Создать | Изменить |
|---|---|
| `src/lib/supabase.ts` | `src/app/layout.tsx` |
| `src/lib/cart.ts` | `src/app/page.tsx` |
| `src/lib/customer-storage.ts` | `src/shared/sections/products/ProductGrid.tsx` |
| `src/shared/providers/CartProvider.tsx` | `src/shared/sections/products/ProductItem.tsx` |
| `src/app/cart/page.tsx` | `src/shared/sections/Navbar.tsx` |
| `src/app/api/orders/create/route.ts` | `src/shared/providers/index.ts` |
| | `src/app/checkout/page.tsx` |
| | `src/app/checkout/result/page.tsx` |
| | `src/app/checkout/cancel/page.tsx` |
| | `src/app/api/payment/create/route.ts` |
| | `src/app/api/payment/webhook/route.ts` |
| | `.env.example` |

---

## Потенциальные проблемы

- **SSR / localStorage**: `CartProvider` инициализирует `items = []`, гидрирует через `useEffect` — обязательно, иначе hydration mismatch
- **ProductGrid — "use client"**: нельзя async. Fetch товаров делается в `page.tsx` (Server Component), передаётся как prop
- **result/page.tsx — Server Component**: очистка корзины (`clearCart`) невозможна напрямую — нужен `<ClearCartOnSuccess>` клиентский компонент
- **`supabaseAdmin` только в API routes**: не импортировать в клиентских компонентах (утечёт `SUPABASE_SERVICE_ROLE_KEY`)
- **ngenius.ts `createOrder`**: нужно расширить, чтобы принимать `billingAddress`

---

## Проверка (end-to-end)

1. Открыть каталог — товары загружаются из Supabase
2. Добавить товар → значок корзины в Navbar обновляется
3. Перейти в `/cart` — список товаров, итог
4. Перейти в `/checkout` — форма автозаполняется из localStorage
5. Нажать «Pay» → создаётся заказ в Supabase (статус PENDING), редирект на N-Genius
6. Оплатить тестовой картой → редирект на `/checkout/result`
7. Result page: статус обновляется на PAID, корзина очищается
8. Webhook тест через N-Genius dashboard: статус обновляется независимо
