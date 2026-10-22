
const CACHE_NAME = "otra-vida-launcher-v1";

const ARCHIVOS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon.svg"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ARCHIVOS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(claves =>
      Promise.all(
        claves
          .filter(clave => clave !== CACHE_NAME)
          .map(clave => caches.delete(clave))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(respuesta => {
      if (respuesta) return respuesta;

      return fetch(event.request).then(respuestaRed => {
        if (!respuestaRed || !respuestaRed.ok) {
          return respuestaRed;
        }

        const copia = respuestaRed.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, copia);
        });

        return respuestaRed;
      }).catch(() => {
        if (event.request.mode === "navigate") {
          return caches.match("./index.html");
        }

        return Response.error();
      });
    })
  );
});
