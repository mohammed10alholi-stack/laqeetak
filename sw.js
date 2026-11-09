// لقيتك! service worker: works offline for vs-computer games
const CACHE = 'laqeetak-v6';
const FONTS = ['lalezar-arabic-400','lalezar-latin-400'].concat([400,600,800].flatMap(w => ['arabic','latin'].map(x => 'baloo-bhaijaan-2-' + x + '-' + w))).map(f => './fonts/' + f + '-normal.woff2');
const CORE = ['./', './index.html', './manifest.webmanifest', './icon2-192.png', './icon2-512.png', './apple-touch-icon2.png', './lib/peerjs.min.js']
  .concat(FONTS, Array.from({length:48}, (_, i) => './faces/' + i + '.webp'), ['win','lose','turn','go'].flatMap(k => ['ar','en'].map(l => './voice/' + k + '-' + l + '.mp3')));
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (req.mode === 'navigate' || (url.origin === location.origin && url.pathname.endsWith('.html'))) {
    // pages: network first so updates show up, cache as fallback
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return r; })
      .catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
    return;
  }
  const cacheable = url.origin === location.origin;
  if (!cacheable) return;
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return r; }).catch(() => hit);
    return hit || net;
  }));
});
