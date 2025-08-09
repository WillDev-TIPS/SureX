// Este é o service worker básico para PWA

const CACHE_NAME = 'betting-calculators-v1';
const urlsToCache = [
  '/',
  '/surebet',
  '/freebet',
  '/donation',
  '/manifest.json',
  '/iconapp.png'
];

// Instala o service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Ativa o service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => {
          return name !== CACHE_NAME;
        }).map((name) => {
          return caches.delete(name);
        })
      );
    })
  );
});

// Estratégia de cache: Stale While Revalidate
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retorna o cache enquanto busca a versão atualizada em segundo plano
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // Se a resposta da rede for válida, atualize o cache
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }
          return networkResponse;
        }).catch(() => {
          // Se falhar na rede, retorne o cache
          return response;
        });

        return response || fetchPromise;
      })
  );
});
