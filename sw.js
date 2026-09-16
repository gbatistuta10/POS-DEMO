/* =========================================================
   SERVICE WORKER - POS DEMO
   ========================================================= */

const CACHE_NAME = "pos-demo-v1";

const ARCHIVOS = [
    "./",
    "./index.html",
    "./manifest.json",
    "./icon-192.png",
    "./icon-512.png"
];


/* =========================================================
   INSTALACIÓN
   Guarda los archivos principales en caché
   ========================================================= */

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {

                return cache.addAll(ARCHIVOS);

            })

    );

    self.skipWaiting();

});


/* =========================================================
   ACTIVACIÓN
   Elimina versiones antiguas del caché
   ========================================================= */

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()
            .then(cacheNames => {

                return Promise.all(

                    cacheNames
                        .filter(
                            name =>
                                name !== CACHE_NAME
                        )
                        .map(
                            name =>
                                caches.delete(name)
                        )

                );

            })

    );

    self.clients.claim();

});


/* =========================================================
   PETICIONES
   Primero busca en caché.
   Si no existe, intenta descargar desde Internet.
   ========================================================= */

self.addEventListener("fetch", event => {

    event.respondWith(

        caches.match(event.request)
            .then(cachedResponse => {

                if (cachedResponse) {

                    return cachedResponse;

                }


                return fetch(event.request)
                    .then(response => {

                        /*
                         * Guardamos una copia solamente
                         * de respuestas válidas.
                         */

                        if (
                            response &&
                            response.status === 200 &&
                            response.type === "basic"
                        ) {

                            const copy =
                                response.clone();

                            caches.open(CACHE_NAME)
                                .then(cache => {

                                    cache.put(
                                        event.request,
                                        copy
                                    );

                                });

                        }

                        return response;

                    });

            })

    );

});