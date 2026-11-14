'use strict';
// Cache names include this app's scope. Never delete another GitHub Pages app's cache.
const PREFIX = 'ai-relay-pwa:' + encodeURIComponent(self.registration.scope) + ':';
const CACHE = PREFIX + 'v1-20261114';
const ASSETS = ['./','./index.html','./style.css','./app.js','./core.mjs','./pwa.js','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
const URLS = new Set(ASSETS.map(p => new URL(p, self.registration.scope).href));
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  // An updated worker waits for open app windows to close, preserving live meetings.
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith(PREFIX) && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || !URLS.has(request.url)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    } catch (error) {
      const cached = await cache.match(request);
      if (cached) return cached;
      return new Response('オフラインで開けませんでした。通信を戻して再読み込みしてください。', {status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
    }
  })());
});
