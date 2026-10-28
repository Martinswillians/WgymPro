/* Will Gym PRO — service worker mínimo
 * Objetivo: tornar o app instalável e permitir abrir a página sem rede.
 * Regras de segurança do SW:
 *   • só intercepta NAVEGAÇÕES (GET) do próprio site — nunca Firebase, CDNs, imagens ou scripts de terceiros;
 *   • rede primeiro (sempre a versão mais nova quando online); a cópia guardada só serve se a rede falhar.
 * Para desativar o SW num aparelho: abra o app com  ?nosw  no endereço (ele se remove). */
const CACHE = 'wgym-shell-v54';

self.addEventListener('install', () => { self.skipWaiting(); });

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('wgym-shell-') && k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || req.mode !== 'navigate') return;
  if (new URL(req.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    try {
      const net = await fetch(req);
      if (net && net.ok) { const c = await caches.open(CACHE); c.put('./', net.clone()); }
      return net;
    } catch (err) {
      const c = await caches.open(CACHE);
      return (await c.match('./')) || (await c.match(req)) || Response.error();
    }
  })());
});

self.addEventListener('message', () => { /* reservado (o app envia mensagens de agendamento; ignoradas) */ });
