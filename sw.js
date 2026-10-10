// Bump VERSION whenever you release, so installed copies pick up the new files.
const VERSION = "tg-2026-10-10e";
const SHELL = ["./", "index.html", "css/style.css", "manifest.webmanifest",
  "icons/icon-192.png", "icons/icon-512.png", "icons/icon-180.png"];

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const files = await (await fetch("src/index.json", {cache: "no-store"})).json().catch(() => []);
    // cache: "reload" skips the browser's own HTTP cache, so a new release never installs stale files.
    const c = await caches.open(VERSION);
    await c.addAll([...SHELL, ...files.map(f => "src/" + f)].map(u => new Request(u, {cache: "reload"})));
    self.skipWaiting();
  })());
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VERSION) await caches.delete(k);
    await self.clients.claim();
  })());
});

// Network first (so updates show up quickly), fall back to the cache when offline.
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  e.respondWith((async () => {
    try {
      const r = await fetch(e.request, {cache: "no-cache"});
      if (r.ok) (await caches.open(VERSION)).put(e.request, r.clone());
      return r;
    } catch (err) {
      return (await caches.match(e.request)) || (await caches.match("index.html"));
    }
  })());
});
