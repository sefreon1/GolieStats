// Nätverk först, så uppdateringar når användaren direkt.
// Finns inget nät används sparad kopia, så appen öppnas även offline.
const CACHE = "malvakt-v1";
const FILES = [
    "./",
    "index.html",
    "manifest.webmanifest",
    "icon-192.png",
    "icon-512.png",
    "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE)
            .then(cache => Promise.all(FILES.map(url =>
                cache.add(new Request(url, { mode: url.startsWith("http") ? "no-cors" : "same-origin" }))
                    .catch(() => {})
            )))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") return;

    event.respondWith(
        fetch(event.request)
            .then(response => {
                const copy = response.clone();
                caches.open(CACHE).then(cache => cache.put(event.request, copy)).catch(() => {});
                return response;
            })
            .catch(() => caches.match(event.request).then(hit => hit || caches.match("index.html")))
    );
});
