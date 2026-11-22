/* 앱 셸과 문제 JSON을 캐시해 오프라인에서도 복습할 수 있게 합니다.
   네트워크 우선이라 문제를 추가해 push하면 다음 접속 때 바로 반영되고, 오프라인일 때만 캐시를 씁니다. */
const CACHE = 'gdm-v7';
const SHELL = [
  './', './index.html', './css/style.css',
  './js/storage.js', './js/editor.js', './js/rubric.js', './js/judge.js', './js/promptBuilder.js', './js/app.js',
  './data/sources.json', './data/tracks.json',
  './manifest.json', './icons/icon-192.png', './icons/icon-512.png',
];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(hit => hit || caches.match('./index.html')))
  );
});
