// ── Infinity Tech Service Worker — Web Push ────────────────────────────────────

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// ── Push event ────────────────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  let data = { title: "Infinity Tech", body: "You have a new notification." };

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    console.error("[SW] Failed to parse push payload", e);
  }

  const options = {
    body:    data.body  || "",
    icon:    data.icon  || "/favicon.svg",
    badge:   data.badge || "/favicon.svg",
    tag:     data.tag   || "infinity-tech",
    renotify: true,
    vibrate: [200, 100, 200],
    data: { url: data.url || "/" },
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ── Notification click — focus or open the admin tab ─────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url || "/admin-infinity";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if (client.url.includes(target) && "focus" in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(target);
        }
      })
  );
});
