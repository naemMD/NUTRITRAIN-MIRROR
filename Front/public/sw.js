// Service Worker for Staple PWA — scoped to /app/
const CACHE_NAME = "staple-app-v1";

// App shell: core assets to cache for offline use
const APP_SHELL = [
  "/app/",
  "/app/manifest.json",
  "/app/icons/icon-192.png",
  "/app/icons/icon-512.png",
];

// Install — pre-cache the app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  // Activate immediately without waiting for old SW to finish
  self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  // Take control of all open tabs immediately
  self.clients.claim();
});

// Fetch — network-first strategy for navigations, cache-first for static assets
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle requests within /app/ scope
  if (!url.pathname.startsWith("/app")) return;

  // Skip non-GET requests (API calls, form submissions, etc.)
  if (request.method !== "GET") return;

  // Skip API requests — they should always go to the network
  if (url.pathname.includes("/api/")) return;

  // Navigation requests (HTML pages) — network-first with offline fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache a fresh copy of the page
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => {
          // Offline — serve from cache, fallback to app shell
          return caches.match(request).then(
            (cached) => cached || caches.match("/app/")
          );
        })
    );
    return;
  }

  // Static assets (JS, CSS, images, fonts) — cache-first
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          // Only cache successful responses
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
    )
  );
});
