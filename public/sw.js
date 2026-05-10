// Service worker — caches the whole app shell so it works offline after the
// first visit. The whole app is one HTML file plus a manifest and an icon,
// so the precache list is short. Bump CACHE_VERSION to invalidate.

const CACHE_VERSION = "ap-csp-v1";
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

// Cache-first, fall back to network, fall back to the cached shell on error.
// Works fully offline once the user has loaded the app at least once.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
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
