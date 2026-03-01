# Гайд: Интернет-магазин сухофруктов и снеков — что осталось реализовать

## Контекст проекта

- **Стек**: Next.js (App Router), TypeScript, Supabase (PostgreSQL)
- **Тип**: интернет-магазин сухофруктов, пастилы и снеков
- **Регион**: Дубай, ОАЭ. Валюта — AED
- **Доставка**: курьером, фиксированная стоимость 25 AED
- **Авторизации пользователей нет** — гость оформляет заказ без регистрации
- **N-Genius (Network International)** — платёжный шлюз, уже интегрирован (`lib/ngenius.ts`, `/api/payment/create`, `/api/payment/webhook` — заглушка)
- **Корзина и данные покупателя** — хранятся в `localStorage`

---

## 1. База данных — Supabase (PostgreSQL)

### Схема таблиц

#### `categories` — категории товаров

Сначала создай enum-тип — значения фиксированы и соответствуют `Category` enum в TypeScript:

```sql
CREATE TYPE category_slug AS ENUM (
  'mix-and-gift',
  'dried-fruits',
  'fruit-leather',
  'mix-seeds'
);
```

> Добавление новой категории потребует миграции: `ALTER TYPE category_slug ADD VALUE 'new-slug';`

```sql
CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- CategoryCard.name — display name, e.g. "Dried Fruits"
  name        TEXT NOT NULL,
  -- CategoryCard.slug — mirrors category_slug enum, e.g. 'dried-fruits'
  slug        category_slug NOT NULL UNIQUE,
  -- CategoryCard.audience — label above category name, e.g. "Pure & Simple"
  audience    TEXT,
  -- CategoryCard.tagline — short catchy line, e.g. "Sun-dried. Nothing else."
  tagline     TEXT,
  -- CategoryCard.description — longer marketing description
  description TEXT,
  -- CategoryCard.badge — "natural" | "warm" | "outline"
  badge       TEXT NOT NULL DEFAULT 'natural',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

#### `products` — товары

```sql
CREATE TABLE products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,

  -- Product.name  — ключ файла изображения, напр. "DRIED APPLE"
  name        TEXT    NOT NULL,
  -- Product.slug  — URL-идентификатор, напр. "dried-apple"
  slug        TEXT    NOT NULL UNIQUE,
  -- Product.title — маркетинговое отображаемое имя, напр. "Natural Apple Snack"
  title       TEXT    NOT NULL,
  -- Product.tagline — короткий текст для hover-overlay
  tagline     TEXT,
  -- Product.tags — массив ключевых характеристик
  tags        TEXT[]  DEFAULT '{}',
  -- Product.freeFrom — список аллергенов/добавок, которых нет в составе
  free_from   TEXT[]  DEFAULT '{}',
  -- Product.badge — "natural" | "warm" | "outline"
  badge       TEXT    NOT NULL DEFAULT 'natural',
  -- необязательное развёрнутое описание
  description TEXT,

  -- Product.price — цена в AED
  price       NUMERIC(10, 2) NOT NULL,
  -- Product.image_url — ссылка на файл в Supabase Storage
  image_url   TEXT,
  -- Product.in_stock
  in_stock    BOOLEAN DEFAULT TRUE,

  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

#### `orders` — заказы

```sql
CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ngenius_ref     TEXT UNIQUE,           -- reference из N-Genius (приходит после создания платежа)
  status          TEXT NOT NULL DEFAULT 'PENDING',
                  -- PENDING | PAID | FAILED | CANCELLED | DELIVERED

  -- Суммы
  subtotal        NUMERIC(10, 2) NOT NULL,  -- сумма товаров
  delivery_fee    NUMERIC(10, 2) NOT NULL DEFAULT 25,
  total           NUMERIC(10, 2) NOT NULL,  -- subtotal + delivery_fee

  -- Данные покупателя
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT NOT NULL,

  -- Адрес доставки
  address         TEXT NOT NULL,    -- улица, номер дома/квартиры
  district        TEXT NOT NULL,    -- район Дубая (JBR, Marina, Downtown и т.д.)
  city            TEXT NOT NULL DEFAULT 'Dubai',
  notes           TEXT,             -- комментарий к заказу

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### `order_items` — товары в заказе

```sql
CREATE TABLE order_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  name       TEXT           NOT NULL,   -- snapshot of products.title at time of order
  price      NUMERIC(10, 2) NOT NULL,   -- дублируем цену на момент заказа
  quantity   INTEGER        NOT NULL CHECK (quantity > 0)
);
```

### Связи между таблицами

```
categories
    │
    │ 1:N
    ▼
products
    │
    │ N:M (через order_items)
    ▼
orders ──── 1:N ────► order_items
```

### Индексы (добавить для производительности)

```sql
CREATE INDEX ON orders (ngenius_ref);
CREATE INDEX ON orders (status);
CREATE INDEX ON order_items (order_id);
CREATE INDEX ON products (category_id);
```

### Supabase — настройка

Установи клиент:

```bash
npm install @supabase/supabase-js
```

В `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Создай `lib/supabase.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";

// Клиент для серверных API routes (полный доступ)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Клиент для клиентской части (ограниченный доступ)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

> Для API routes (webhook, создание заказа) используй `supabaseAdmin`. На клиенте — `supabase`.

---

## 2. localStorage — корзина и данные покупателя

### Корзина

Структура товара в корзине:

```typescript
// Re-exported from @/shared/sections/products/types.ts
interface CartItem {
  id: string;
  name: string;      // snapshot of Product.title at time of adding to cart
  price: number;     // in AED — snapshot of Product.price
  quantity: number;
  image_url?: string; // snapshot of Product.image_url
}
```

Хранится под ключом `"cart"` как `CartItem[]`.

### Автозаполнение формы (данные покупателя)

После успешного оформления заказа сохраняй данные покупателя в `localStorage` под ключом `"customer_info"`:

```typescript
interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  notes?: string;
}
```

На странице `/checkout` при загрузке читай `"customer_info"` из `localStorage` и подставляй в поля формы как `defaultValues`. Пользователь сможет исправить данные перед оплатой — и при сабмите сохрани их снова (перезапись).

Создай `lib/customer-storage.ts`:

```typescript
const KEY = "customer_info";

export function saveCustomerInfo(data: CustomerInfo): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function loadCustomerInfo(): CustomerInfo | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CustomerInfo;
  } catch {
    return null;
  }
}
```

---

## 3. Каталог товаров — добавить цену и кнопку

Товары берутся из Supabase (`products` + `categories`). Каждый товар показывает:
- Фото, название, описание
- Цену в AED
- Кнопку **«В корзину»** — добавляет в `localStorage`
- Счётчик `+` / `-` если товар уже в корзине
- Бейдж «Нет в наличии» если `in_stock = false`

---

## 4. Страница корзины `/cart`

- Список товаров с изменением количества и удалением
- Сумма товаров (subtotal)
- Доставка — **25 AED** (фиксировано)
- Итого: `subtotal + 25`
- Кнопка **«Оформить заказ»** → `/checkout`
- Если корзина пустая — сообщение + кнопка «В каталог»

---

## 5. Страница оформления заказа `/checkout`

Форма с полями (с автозаполнением из `localStorage`):

```
Имя (firstName)        — обязательное
Фамилия (lastName)     — обязательное
Email (emailAddress)   — обязательное, валидация формата
Телефон (phone)        — обязательное, формат +971XXXXXXXXX
Адрес (address)        — обязательное (улица, дом, квартира)
Район (district)       — обязательное, select со списком районов Дубая
Комментарий (notes)    — необязательное
```

Внизу — итог: список товаров, subtotal, доставка 25 AED, итого.

При нажатии **«Оплатить»**:

1. Валидировать форму
2. Сохранить данные покупателя в `localStorage` (`saveCustomerInfo`)
3. POST `/api/orders/create` → создать заказ в Supabase, получить `orderId`
4. POST `/api/payment/create` → получить `paymentUrl` от N-Genius
5. Редирект браузера на `paymentUrl`

---

## 6. N-Genius — передавать billingAddress

При создании платежа в `/api/payment/create` передавать полный `billingAddress`:

```typescript
const body = {
  action: "SALE",
  amount: {
    currencyCode: "AED",
    value: totalInFils,
  },
  emailAddress: order.email,
  billingAddress: {
    firstName:     order.firstName,
    lastName:      order.lastName,
    address1:      order.address,
    address2:      order.district,
    city:          "Dubai",
    stateProvince: "Dubai",
    countryCode:   "AE",
  },
  merchantOrderReference: order.id,
  merchantAttributes: {
    redirectUrl:          `${BASE_URL}/checkout/result`,
    cancelUrl:            `${BASE_URL}/checkout/cancel`,
    skipConfirmationPage: true,
  },
};
```

> Телефон в N-Genius API не передаётся — он хранится только в твоей БД (Supabase).

---

## 7. API Route — создание заказа в Supabase

Создай `/api/orders/create/route.ts`:

Принимает:
```typescript
{
  items: CartItem[],
  firstName, lastName, email, phone,
  address, district, notes
}
```

Действия:
1. Считает `subtotal` из `items`
2. `deliveryFee = 25`, `total = subtotal + 25`
3. Вставляет запись в `orders` со статусом `PENDING`
4. Вставляет записи в `order_items` для каждого товара
5. Возвращает `{ orderId }`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const { items, firstName, lastName, email, phone, address, district, notes } =
    await request.json();

  const subtotal = items.reduce(
    (sum: number, item: any) => sum + item.price * item.quantity, 0
  );
  const deliveryFee = 25;
  const total = subtotal + deliveryFee;

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .insert({
      status: "PENDING",
      subtotal, delivery_fee: deliveryFee, total,
      first_name: firstName, last_name: lastName,
      email, phone, address, district, notes,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const orderItems = items.map((item: any) => ({
    order_id:   order.id,
    product_id: item.id,
    name:       item.name,
    price:      item.price,
    quantity:   item.quantity,
  }));

  await supabaseAdmin.from("order_items").insert(orderItems);

  return NextResponse.json({ orderId: order.id });
}
```

---

## 8. Страница результата `/checkout/result`

N-Genius редиректит сюда с `?ref=NGENIUS_REF`.

1. Получить `ref` из `searchParams`
2. Вызвать `getOrderStatus(ref)` из `lib/ngenius.ts`
3. Получить `state` из `status._embedded.payment[0].state`
4. Обновить статус заказа в Supabase по `ngenius_ref`
5. Очистить корзину из `localStorage` при успехе

| Статус N-Genius | Статус в БД | Показать |
|---|---|---|
| `PURCHASED` / `CAPTURED` | `PAID` | ✅ Спасибо! Заказ принят |
| `FAILED` / `DECLINED` | `FAILED` | ❌ Оплата не прошла + кнопка «Повторить» |
| Остальное | без изменений | ⏳ Проверяем статус... |

На странице успеха показать: номер заказа, список товаров, адрес доставки, итоговую сумму.

---

## 9. Страница отмены `/checkout/cancel`

- Показать «Оплата отменена»
- Кнопку «Вернуться в корзину» (товары в `localStorage` сохранились)
- Обновить статус заказа в Supabase на `CANCELLED` по `ref` из query params

---

## 10. Webhook — подключить к Supabase

Заменить заглушку в `/api/payment/webhook/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const payload = await request.json();

  const ngeniusRef = payload.orderReference;
  const eventName  = payload.eventName;

  const statusMap: Record<string, string> = {
    PURCHASED: "PAID",
    CAPTURED:  "PAID",
    FAILED:    "FAILED",
    REVERSED:  "CANCELLED",
  };

  const newStatus = statusMap[eventName];

  if (newStatus) {
    await supabaseAdmin
      .from("orders")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("ngenius_ref", ngeniusRef);
  }

  // Ответить 200 в течение 15 секунд — обязательно
  return NextResponse.json({ success: true }, { status: 200 });
}
```

> Webhook и `/checkout/result` могут обновить статус в разном порядке — это нормально, оба пишут одно и то же значение, конфликта не будет.

---

## 11. Итоговая структура файлов

```
app/
├── (shop)/
│   ├── page.tsx                    ← каталог с ценами и кнопками «В корзину»
│   ├── cart/page.tsx               ← корзина
│   └── checkout/
│       ├── page.tsx                ← форма оформления + автозаполнение
│       ├── result/page.tsx         ← результат оплаты
│       └── cancel/page.tsx         ← отмена оплаты
├── api/
│   ├── orders/
│   │   └── create/route.ts         ← создать заказ в Supabase
│   └── payment/
│       ├── create/route.ts         ← создать платёж в N-Genius (уже есть)
│       └── webhook/route.ts        ← обновить статус в Supabase
lib/
├── ngenius.ts                      ← N-Genius API (уже есть)
├── supabase.ts                     ← Supabase клиенты (admin + public)
├── cart.ts                         ← утилиты для localStorage корзины
└── customer-storage.ts             ← сохранение/загрузка данных покупателя
```

---

## 12. Порядок реализации

1. Создать таблицы в Supabase (`categories`, `products`, `orders`, `order_items`)
2. Настроить `lib/supabase.ts`
3. Заполнить таблицу `products` тестовыми товарами
4. Добавить цены + кнопки «В корзину» в каталог, логика `localStorage`
5. Страница `/cart`
6. Страница `/checkout` с формой + автозаполнение из `localStorage`
7. API `/api/orders/create` — создать заказ в Supabase
8. Обновить `/api/payment/create` — добавить `billingAddress`
9. Страница `/checkout/result` — проверка статуса + обновление в Supabase
10. Страница `/checkout/cancel`
11. Webhook — подключить к Supabase (убрать заглушку)
12. Протестировать полный сценарий с тестовыми картами N-Genius
