# PWA + Push Notifications — Implementation Prompt

## Goal

Enable native push notifications for admin users (new orders, partnership inquiries) that work even when the browser is closed. Support both Android and iOS.

## Current State

- Real-time notifications already exist via Supabase Realtime (`NotificationsProvider` in `src/providers/NotificationsProvider.tsx`)
- Notifications are stored in `notifications` table in Supabase
- `NotificationBell` component in navbar shows unread count
- Admin-only: controlled by `isAdmin` prop from `profiles.role`
- No Service Worker, no PWA manifest, no push subscription logic exists yet

## What Needs to Be Done

### 1. PWA Setup (required for iOS push support)

- Create `public/manifest.json` — app name, icons, theme color, display: standalone
- Generate PWA icons (192x192, 512x512) from brand assets
- Add `<link rel="manifest">` to root layout `src/app/layout.tsx`
- Add `<meta name="theme-color">` matching `--color-cream` (#f5f0e8)

### 2. Service Worker

- Create `public/sw.js` — handles push events, shows native notifications
- Register SW from a client component (e.g. `src/providers/ServiceWorkerProvider.tsx` or inside existing `NotificationsProvider`)
- SW listens for `push` event → displays `self.registration.showNotification()`
- SW listens for `notificationclick` → opens the relevant page (e.g. `/panel/all-orders`)

### 3. Push Subscription (Client)

- After admin logs in, request notification permission (`Notification.requestPermission()`)
- Subscribe via `registration.pushManager.subscribe()` with VAPID public key
- Send subscription object (endpoint, keys) to server → save in Supabase table `push_subscriptions` (user_id, endpoint, p256dh, auth, created_at)
- Handle resubscription on key change

### 4. Push Sending (Server)

- Install `web-push` npm package
- Generate VAPID key pair (`web-push generate-vapid-keys`), store in env vars: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (mailto:)
- Create `src/lib/pushNotification.ts` — helper that reads subscriptions from DB and sends push via `web-push`
- Call push helper from existing notification creation points:
  - `src/pages_flow/checkout/actions.ts` — after `createNotification("new_order", ...)`
  - `src/sections/partnership/actions.ts` — after partnership inquiry creation
  - `src/app/api/payment/webhook/route.ts` — on payment status change
- Handle expired/invalid subscriptions (HTTP 410 → delete from DB)

### 5. Database

- New Supabase table: `push_subscriptions`
  - `id` (uuid, PK)
  - `user_id` (uuid, FK → auth.users)
  - `endpoint` (text, unique)
  - `p256dh` (text)
  - `auth` (text)
  - `created_at` (timestamptz)

### 6. Env Variables

```
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:admin@honesta.ae
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...  # same as VAPID_PUBLIC_KEY, exposed to client
```

## Key Considerations

- **iOS requires PWA**: push only works when site is added to home screen via Safari's "Add to Home Screen"
- **Permission UX**: don't request permission immediately on page load — wait for admin to interact (e.g. show a prompt in the panel, or ask when they first visit `/panel`)
- **Existing notification system**: push supplements, not replaces, the in-app notifications. The `notifications` table and `NotificationBell` stay as-is
- **Only for admins**: push subscription should only be offered to users with `role=admin`
- **HTTPS required**: push API only works over HTTPS (localhost is exempted for dev)

## Files to Create/Modify

| File | Action |
|------|--------|
| `public/manifest.json` | Create — PWA manifest |
| `public/sw.js` | Create — Service Worker |
| `public/icons/` | Create — PWA icons |
| `src/app/layout.tsx` | Modify — add manifest link + theme-color meta |
| `src/lib/pushNotification.ts` | Create — server-side push sender |
| `src/providers/NotificationsProvider.tsx` | Modify — register SW + subscribe to push for admins |
| `src/pages_flow/checkout/actions.ts` | Modify — send push after order creation |
| `src/sections/partnership/actions.ts` | Modify — send push after inquiry |
| `src/app/api/payment/webhook/route.ts` | Modify — send push on payment status change |
| `.env.example` | Modify — add VAPID env vars |

## Verification

1. `pnpm build` — no errors
2. Lighthouse PWA audit — passes installability checks
3. Admin visits `/panel` → gets permission prompt → accepts
4. Place test order → admin receives native push notification
5. Close browser completely → place another order → notification still arrives
6. Test on iOS Safari (add to home screen) + Android Chrome
