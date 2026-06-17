// Rangayan Kitaab service worker.
//
// Strategy:
//   - Static assets (/_next/static, images, icons, fonts) → CACHE-FIRST.
//     They're content-hashed/immutable, so this makes repeat loads instant
//     and keeps the app shell available offline.
//   - Everything else — navigations, RSC payloads, API/data → NETWORK-FIRST,
//     falling back to cache (then an offline page) only when the network is
//     down. This is critical: serving authenticated pages cache-first (the old
//     behaviour) showed stale data and felt "glitchy".
//   - Cross-origin requests (e.g. Supabase) are never touched.

const VERSION = "v2";
const STATIC_CACHE = `rangayan-static-${VERSION}`;
const RUNTIME_CACHE = `rangayan-runtime-${VERSION}`;
const OFFLINE_URL = "/login";
const PRECACHE = ["/login", "/icon-192.png", "/icon-512.png", "/logo.png"];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(STATIC_CACHE).then((c) => c.addAll(PRECACHE).catch(() => {}))
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== STATIC_CACHE && k !== RUNTIME_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icon") ||
    url.pathname === "/logo.png" ||
    /\.(?:png|jpe?g|gif|webp|svg|ico|woff2?|ttf|otf|css)$/.test(url.pathname)
  );
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // skip Supabase / cross-origin

  // CACHE-FIRST for immutable static assets.
  if (isStaticAsset(url)) {
    e.respondWith(
      caches.match(req).then(
        (cached) =>
          cached ||
          fetch(req).then((res) => {
            if (res.ok) {
              const clone = res.clone();
              caches.open(STATIC_CACHE).then((c) => c.put(req, clone));
            }
            return res;
          })
      )
    );
    return;
  }

  // NETWORK-FIRST for pages / RSC / data — never serve stale authed content
  // while online; fall back to cache, then the offline page.
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(RUNTIME_CACHE).then((c) => c.put(req, clone));
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then((cached) => {
          if (cached) return cached;
          if (req.mode === "navigate") return caches.match(OFFLINE_URL);
          return Response.error();
        })
      )
  );
});
