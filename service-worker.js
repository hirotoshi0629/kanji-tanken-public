const CACHE="kanjiquest-local-only-v2";
const APP_SHELL=[
  "./index.html",
  "./styles.css?v=4.6",
  "./app.js?v=complete-release",
  "./teacher-easy.js?v=1",
  "./manifest.webmanifest"
];
const CDN_ASSETS=[
  "https://cdn.jsdelivr.net/gh/asdfjkl/kanjicanvas@master/docs/resources/javascript/kanji-canvas.min.js",
  "https://cdn.jsdelivr.net/gh/asdfjkl/kanjicanvas@master/docs/resources/javascript/ref-patterns.js"
];

self.addEventListener("install",event=>{
  self.skipWaiting();
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await cache.addAll(APP_SHELL);
    await Promise.allSettled(CDN_ASSETS.map(url=>cache.add(url)));
  })());
});

self.addEventListener("activate",event=>{
  event.waitUntil((async()=>{
    for(const key of await caches.keys()) if(key!==CACHE) await caches.delete(key);
    await self.clients.claim();
  })());
});

self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET") return;
  const url=new URL(event.request.url);
  const sameOrigin=url.origin===self.location.origin;
  const isStatic=sameOrigin && (
    url.pathname.endsWith("/app.js") ||
    url.pathname.endsWith("/styles.css") ||
    url.pathname.endsWith("/teacher-easy.js") ||
    url.pathname.endsWith("/manifest.webmanifest")
  );
  const isCdn=CDN_ASSETS.includes(url.href);

  if(isStatic || isCdn){
    event.respondWith((async()=>{
      const cached=await caches.match(event.request);
      if(cached) return cached;
      const response=await fetch(event.request);
      if(response && (response.ok || response.type==="opaque")){
        const cache=await caches.open(CACHE);
        cache.put(event.request,response.clone()).catch(()=>{});
      }
      return response;
    })());
    return;
  }

  if(event.request.mode==="navigate"){
    event.respondWith((async()=>{
      try{
        const response=await fetch(event.request);
        if(response && response.ok){
          const cache=await caches.open(CACHE);
          cache.put("./index.html",response.clone()).catch(()=>{});
        }
        return response;
      }catch(_){
        return (await caches.match("./index.html")) || Response.error();
      }
    })());
  }
});
