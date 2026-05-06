const CACHE_NAME = 'crm-bitoach-v7';
const STATIC_ASSETS = [
  '/crm1/','/crm1/index.html','/crm1/manifest.json','/crm1/icon-192.png','/crm1/icon-512.png',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.rtl.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css',
  'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js',
];
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>Promise.allSettled(STATIC_ASSETS.map(url=>cache.add(url).catch(()=>{})))));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if(url.hostname.includes('firebase')||url.hostname.includes('googleapis'))return;
  if(url.hostname.includes('cdn.jsdelivr.net')||url.hostname.includes('cdn.sheetjs.com')||url.hostname.includes('gstatic.com')){
    event.respondWith(caches.match(event.request).then(c=>{if(c)return c;return fetch(event.request).then(r=>{if(r.ok)caches.open(CACHE_NAME).then(ca=>ca.put(event.request,r.clone()));return r;})}));
    return;
  }
  if(url.pathname.startsWith('/crm1')){
    event.respondWith(fetch(event.request).then(r=>{if(r.ok)caches.open(CACHE_NAME).then(c=>c.put(event.request,r.clone()));return r;}).catch(()=>caches.match(event.request)));
  }
});
