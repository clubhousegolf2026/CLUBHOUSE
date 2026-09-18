"use client";

import { useEffect } from "react";

/** Registra el service worker en producción — en dev queda apagado para no
 *  pelear con el hot-reload de Next (un SW viejo cacheando chunks rotos es
 *  el clásico dolor de cabeza de "por qué no se actualiza mi cambio"). */
export function RegistroServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Silencioso a propósito: si falla (navegador viejo, contexto no
      // seguro, etc.) el sitio sigue funcionando igual, solo sin PWA.
    });
  }, []);

  return null;
}
