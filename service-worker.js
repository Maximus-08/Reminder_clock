self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('static-cache').then(cache => {
      return cache.addAll([
        './',
        './index.html',
        './index.js',
        './manifest.json',
        './icon-192x192.png',
        './icon-512x512.png'
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
