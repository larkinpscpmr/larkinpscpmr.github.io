/* Lets the Hub open without signal: keeps a copy of the page and icons.
   The page always tries the network first, so updates still arrive right away when online. */
const CACHE = 'hub-v1';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'favicon.svg', 'favicon-48.png', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;       // Google data and uploads go straight to the network
  if (url.pathname.endsWith('/version.json')) return;                          // always fresh
  e.respondWith(fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req.mode === 'navigate' ? 'index.html' : req, copy)); }
    return res;
  }).catch(() => caches.match(req.mode === 'navigate' ? 'index.html' : req).then(r => r || caches.match('index.html'))));
});
