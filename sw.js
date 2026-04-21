self.addEventListener('install', (event) => {
    // Skip old instances immediately
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // Claim any clients immediately
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // A fetch listener is required for a PWA to be installable.
    // We just pass the request through without doing any caching.
    event.respondWith(fetch(event.request));
});
