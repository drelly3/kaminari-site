// Arc Tracker service worker: shows push notifications and opens the tracker when one is tapped.
// It lives at the site root but only controls /arc-tracker/.
const FALLBACK = { title: 'Log today’s arc', body: 'Three habits, three proofs. Clear today before it’s gone.', url: '/arc-tracker/app' };

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

self.addEventListener('push', event => {
  event.waitUntil((async () => {
    // pushes arrive empty; ask the site what to show
    let message = FALLBACK;
    try {
      const sub = await self.registration.pushManager.getSubscription();
      const res = await fetch('/api/arc-push/next', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: sub.endpoint }) });
      const data = await res.json();
      if (data.ok) message = data;
    } catch {}
    await self.registration.showNotification(message.title, {
      body: message.body,
      icon: '/assets/arc-icon-192.png',
      badge: '/assets/arc-icon-192.png',
      tag: 'arc-tracker',
      data: { url: message.url || FALLBACK.url },
    });
  })());
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || FALLBACK.url;
  event.waitUntil((async () => {
    const open = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const tab = open.find(c => new URL(c.url).pathname.startsWith('/arc-tracker'));
    if (tab) return tab.focus();
    return self.clients.openWindow(url);
  })());
});
