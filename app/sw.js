importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.4.1/workbox-sw.js');

if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);

  workbox.precaching.precacheAndRoute([]);

  const articleHandler = workbox.strategies.networkFirst({
    cacheName: 'document-cache',
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 50,
      })
    ]
  });
  
  workbox.routing.registerRoute(/(.*)\.html/, args => {
    return articleHandler.handle(args);
  });

  workbox.routing.registerRoute(/\/$/, args => {
    return articleHandler.handle(args);
  });


} else {
  console.log(`Boo! Workbox didn't load 😬`);
}
