# HONESTA — Подборка фото для лендинга
## Источники: Unsplash (бесплатно, коммерческое использование, атрибуция необязательна)

---

## 🖼 [01] HERO SECTION — фон главного экрана

### Приоритет 1: Сушёные дольки апельсина (идеальный мэтч с референсами)
🔗 https://unsplash.com/photos/a-bunch-of-oranges-that-are-cut-in-half-lFzbv4jlP9k
📸 Автор: Monika Grabkowska
📝 Dried orange slices, studio, food styling — очень близко к референсу с обложки

### Приоритет 2: Апельсин с корицей, тёплые тона
🔗 https://unsplash.com/photos/a-ticquet-game-with-oranges-and-cinnamon-sticks-ymAd3p_L1bs
📸 Автор: Diana Krotova
📝 Цитрус + корица — уютная, натуральная атмосфера

### Альтернатива: Дольки апельсина на деревянном фоне (food photo)
🔗 https://unsplash.com/photos/sliced-orange-fruit-on-brown-wooden-table-9002s2VnOAY
📸 Автор: Mae Mu
📝 Деревянная поверхность, тёплый свет, studio lighting setup

---

## 🍊 [02] ПРОДУКТОВЫЕ ФОТО — Dried Fruits / Clean Energy

### Микс сушёных фруктов (яблоко, киви, цитрус) — идеально для product grid
🔗 https://unsplash.com/photos/sliced-lemon-and-red-chili-qWQEeqrEsmw
📸 Автор: K8 (@_k8_) — специализируется на dried fruits
📝 Mix of dried fruits (apple, kiwi, orange, lemon), white background, сверху

### Яблочные и ягодные чипсы — ещё один продуктовый кадр от K8
🔗 https://unsplash.com/photos/sliced-apple-and-red-round-fruit-xcsmUHYVy6M
📸 Автор: K8 (@_k8_)
📝 Dried apple chips + red fruit, flat lay

### Банан + персик/абрикос — подойдёт для детской категории
🔗 https://unsplash.com/photos/sliced-banana-fruit-and-peach-xUrhkmr35K4
📸 Автор: Dovile Ramoskaite
📝 Summer fruits overhead, warm tones

---

## 🍫 [03] GOURMET SECTION — Фрукты в шоколаде

### Фрукты в шоколаде — прямое попадание в категорию "Осознанный десерт"
🔗 https://unsplash.com/photos/nIsPTNz79k4
📸 Автор: Brenda Godinez
📝 "Fruits dipped in chocolate" — banana, pear, strawberry, cookies, artisan

### Апельсин в разрезе на чёрном фоне — драматичный кадр для гурме-секции
🔗 https://unsplash.com/photos/sliced-orange-fruit-on-black-background-MUPV3ntBeiE
📸 Автор: Lucas George Wendt
📝 Orange slice, dark background — luxury feel

### Апельсин в разрезе на чёрном фоне (вариант 2)
🔗 https://unsplash.com/photos/sliced-orange-fruit-on-black-surface-qRseM5JoP-A
📸 Автор: Bruna Branco
📝 Wellness, food photography

---

## 🍃 [04] PHILOSOPHY BLOCK — Lifestyle / Натуральность

### Рука держит апельсин — летняя, чистая, здоровая атмосфера
🔗 https://unsplash.com/photos/a-person-holding-an-orange-in-their-hand-csBDBBGfJ3w
📸 Автор: Fiona Murray-deGraaff
📝 Hand holding orange, bright, healthy lifestyle

### Рука держит яблоко — минималистично, природно
🔗 https://unsplash.com/photos/a-person-holding-an-apple-in-their-hands-hKlJvOXfjJg
📸 Автор: Anastasiya Badun
📝 Hands with apple, natural light

### Рука держит дракон-фрукт (красочный, тропический)
🔗 https://unsplash.com/photos/a-person-holding-a-dragon-fruit-in-their-hand-kEBMWSXZSno
📸 Автор: Arturo Esparza
📝 Colorful, minimal, healthy food

---

## 🍊 [05] ДОПОЛНИТЕЛЬНЫЕ — Текстуры и фоны

### Деревянные доски с тёплым оранжевым оттенком — фон для секций
🔗 https://unsplash.com/photos/wooden-planks-with-a-rich-orange-toned-finish-EYDv0Yhz86Q
📸 Автор: Zoshua Colah
📝 Warm orange-brown wood texture, horizontal

### Апельсин в чаше, красочный flat lay
🔗 https://unsplash.com/photos/sliced-orange-fruit-in-bowl-9z-veIxii6k
📸 Автор: Mae Mu
📝 Food photography, colorful, orange

---

## 📋 БЫСТРЫЙ ПОИСК дополнительных фото на Unsplash

| Секция | Ссылка на поиск Unsplash |
|--------|--------------------------|
| Dried fruits (общий) | https://unsplash.com/s/photos/dried-fruit |
| Dry fruits mix | https://unsplash.com/s/photos/dry-fruits |
| Healthy snacks | https://unsplash.com/s/photos/healthy-snacks |
| Fruit on wood | https://unsplash.com/s/photos/fruit-wood |
| Natural food | https://unsplash.com/s/photos/natural-food |
| Chocolate fruit | https://unsplash.com/s/photos/chocolate-fruit |
| Kids with food | https://unsplash.com/s/photos/kids-healthy-food |

---

## 💻 КАК ИСПОЛЬЗОВАТЬ В NEXT.JS

### 1. Прямое встраивание через CDN (рекомендуется для Next.js)

Unsplash разрешает горячее встраивание. URL фото можно взять с кнопки "Copy image address" на странице.

Формат CDN: `https://images.unsplash.com/photo-{timestamp}-{id}?w=2070&q=80&fm=webp`

### 2. next/image с external domains

```typescript
// next.config.ts
const nextConfig = {
  images: {
    domains: ['images.unsplash.com'],
  },
}
```

```tsx
import Image from 'next/image'

<Image
  src="https://images.unsplash.com/photo-..." // скопировать из браузера
  alt="Dried orange slices by Monika Grabkowska"
  width={1920}
  height={1080}
  priority  // только для hero image
/>
```

### 3. Параметры оптимизации URL Unsplash

Добавляй к URL параметры для оптимизации:
```
?w=1920&q=85&fm=webp    → для hero (fullscreen)
?w=800&q=80&fm=webp     → для product cards
?w=400&q=75&fm=webp     → для thumbnails
```

---

## ⚠️ ВАЖНЫЕ ЗАМЕЧАНИЯ

1. **Лицензия Unsplash** — бесплатно для коммерческого использования.
   Нельзя: продавать фото как стоковые, создавать сервисы для скачивания фото Unsplash.

2. **Атрибуция** — по лицензии Unsplash НЕ обязательна, но приятна для авторов.
   Рекомендуется добавить в footer: *"Photos by Unsplash contributors"*

3. **Hotlinking** — Unsplash официально разрешает встраивание через CDN.
   При использовании в `<img src>` или `next/image` — всё ок.

4. **Если нужны фото брендированных упаковок** — их нужно снимать самостоятельно.
   Стоковые фото = для секций hero, philosophy, reviews, backgrounds.
   Product grid лучше заполнять реальными фото продукции Honesta.

---

## 🎯 ПЛАН ИСПОЛЬЗОВАНИЯ ПО СЕКЦИЯМ

| Секция | Рекомендуемое фото |
|--------|--------------------|
| Hero background | `lFzbv4jlP9k` — dried orange by Monika |
| Category: Kids | `xcsmUHYVy6M` — apple chips by K8 |
| Category: Energy | `qWQEeqrEsmw` — dried fruit mix by K8 |
| Category: Gourmet | `nIsPTNz79k4` — chocolate fruits by Brenda |
| Product 1 | `xcsmUHYVy6M` — apple & kiwi chips |
| Product 2 | `xUrhkmr35K4` — banana & peach |
| Product 3 | `lFzbv4jlP9k` — dried orange slices |
| Product 4 | `nIsPTNz79k4` — chocolate-dipped fruit |
| Philosophy block | `csBDBBGfJ3w` — hand with orange |
| Philosophy accent | `hKlJvOXfjJg` — hands with apple |
| Wood texture BG | `EYDv0Yhz86Q` — warm wood planks |

---
*Все ссылки валидны на 18.02.2026. Unsplash License — бесплатно для коммерческого использования.*
