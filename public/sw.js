// ============================================================
// Archivo: public/sw.js
// ============================================================

const CACHE_NAME = 'gestorcobros-v1'

// Instalación — sin precachear nada para evitar errores
self.addEventListener('install', (event) => {
  self.skipWaiting()
})

// Activación — limpiar caches viejos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

// Fetch — network first, sin fallback problemático
self.addEventListener('fetch', (event) => {
  // Solo manejar requests del mismo origen
  if (!event.request.url.startsWith(self.location.origin)) return

  // Para navegación: network first, sin caer en cache offline por ahora
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request))
    return
  }

  // Para imágenes estáticas: cache first
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then(
        (cached) => cached || fetch(event.request).then((response) => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
          return response
        })
      )
    )
  }
})

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return
  const data = event.data.json()
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      data: data.url,
      vibrate: [200, 100, 200],
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow(event.notification.data || '/dashboard')
  )
})