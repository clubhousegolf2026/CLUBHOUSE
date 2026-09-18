// Service worker mínimo: solo lo justo para que el navegador considere el
// sitio "instalable" y para que quede algo usable offline (el shell de la
// página + assets estáticos). No cachea rutas dinámicas ni /admin — ahí
// los datos siempre deben venir frescos del servidor.
const CACHE = "clubhouse-v1";
const RUTAS_APP_SHELL = ["/", "/paquetes", "/cotizador", "/nosotros", "/contacto"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(RUTAS_APP_SHELL)).catch(() => {}),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((nombres) =>
        Promise.all(nombres.filter((n) => n !== CACHE).map((n) => caches.delete(n))),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // /admin y /api son siempre en vivo — nunca se sirven desde caché.
  if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/api")) return;

  event.respondWith(
    caches.match(request).then((cacheada) => {
      const red = fetch(request)
        .then((respuesta) => {
          if (respuesta.ok) {
            const copia = respuesta.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copia));
          }
          return respuesta;
        })
        .catch(() => cacheada);
      // Network-first con fallback a caché: prioriza contenido fresco
      // (precios, disponibilidad) y solo usa lo cacheado si no hay red.
      return red;
    }),
  );
});
