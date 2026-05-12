// Service worker — keeps the app installable and usable offline, but uses
// NETWORK-FIRST for the HTML shell so deployed updates appear on the next
// visit instead of being shadowed by a stale cache.
//
// The whole app is one HTML file (Vite singlefile inlines JS + CSS) plus a
// manifest and an icon, so the precache list is short. Bump CACHE_VERSION
// only when you change the SW's own logic (not on every question deploy —
// network-first handles that automatically).

const CACHE_VERSION = "ap-csp-v2";
const PRECACHE = ["./", "index.html", "manifest.json", "favicon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Strategy:
//   - Navigations / HTML shell: NETWORK-FIRST. The HTML carries the entire
//     app (inlined JS+CSS) so it MUST be fresh after each deploy. Falls
//     back to the cached shell when offline.
//   - Everything else (manifest, icon): CACHE-FIRST. They rarely change
//     and serving from cache makes cold loads instant.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const isHTML =
    event.request.mode === "navigate" ||
    event.request.destination === "document";

  if (isHTML) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, copy));
          return res;
        })
        .catch(() =>
          caches.match(event.request).then((c) => c || caches.match("./"))
        )
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, copy));
          return res;
        })
        .catch(() => caches.match("./"));
    })
  );
});
