// Service Worker for Kaushik Fitness PWA - Resilient Offline & Cloud Cache v8
const CACHE_NAME = 'koushik-fitness-v8-dynamic-plans-staff-clean';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/app-logo.png',
  '/dumbbell.svg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Pre-caching partial assets failed:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Purging old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Resilient Network-First Strategy: fetch latest from Vercel; on network drop, seamlessly serve cache
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  // For HTML navigation: Network-first, fallback to cached index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match('/index.html');
          if (cached) return cached;
          const cachedRoot = await caches.match('/');
          if (cachedRoot) return cachedRoot;
          return new Response(
            '<!DOCTYPE html><html lang="hi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Kaushik Fitness</title><style>body{margin:0;font-family:sans-serif;background:#0f172a;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:24px;text-align:center;}h2{color:#f59e0b;margin-bottom:8px;}p{color:#94a3b8;font-size:14px;max-width:320px;line-height:1.5;}button{margin-top:20px;padding:12px 28px;border-radius:14px;background:#f59e0b;color:#0f172a;font-weight:900;border:none;cursor:pointer;font-size:14px;}</style></head><body><h2>कौशिक फिटनेस • Kaushik Fitness</h2><p>कमजोर नेटवर्क या इंटरनेट बंद है। कृपया मोबाइल नेटवर्क चालू करें और पुनः प्रयास करें।</p><button onclick="location.reload()">पुनः लोड करें (Retry)</button></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // For assets: Network-first with dynamic caching and cache fallback
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
