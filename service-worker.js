const CACHE="kanjiquest-local-only-v1";
const ASSETS=[
  "./",
  "./index.html",
  "./styles.css?v=4.6",
  "./app.js?v=complete-release",
  "./teacher-easy.js?v=1",
  "./manifest.webmanifest"
];

self.addEventListener("install",e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});

self.addEventListener("activate",e=>e.waitUntil((async()=>{
  for(const k of await caches.keys()) if(k!==CACHE) await caches.delete(k);
  await self.clients.claim();
})()));

self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  e.respondWith((async()=>{
    try{
      const res=await fetch(e.request,{cache:"no-store"});
      if(res && res.ok){
        const copy=res.clone();
        caches.open(CACHE).then(c=>c.put(e.request,copy));
      }
      return res;
    }catch(err){
      return (await caches.match(e.request))||(await caches.match("./index.html"));
    }
  })());
});
