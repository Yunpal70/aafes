const CACHE_NAME = 'aafes-briefing-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// 설치 이벤트
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.log('Cache installation failed:', err);
      })
  );
});

// 활성화 이벤트
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch 이벤트
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 캐시에 있으면 캐시 반환
        if (response) {
          return response;
        }

        // 외부 API (날씨 등)는 네트워크로만
        if (event.request.url.includes('wttr.in')) {
          return fetch(event.request);
        }

        // 네트워크 요청
        return fetch(event.request).then(
          response => {
            // 유효하지 않은 응답은 캐시하지 않음
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            // 응답 복제 후 캐시에 저장
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(() => {
          // 네트워크 실패 시 기본 캐시 반환
          return caches.match('./index.html');
        });
      })
  );
});
