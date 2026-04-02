/// <reference lib="webworker" />

const DEFAULT_ICON = "/favicon/web-app-manifest-192x192.png";
const DEFAULT_URL = "/panel";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "HONESTA", body: event.data.text() };
  }

  const { title = "HONESTA", body, icon = DEFAULT_ICON, url = DEFAULT_URL } = payload;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge: DEFAULT_ICON,
      data: { url },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || DEFAULT_URL;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
