const CACHE = "codeeditor-v2";
const ASSETS = [
  "/",
  "/index.html"
  // add your CSS/JS files here e.g. "/style.css", "/app.js"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});