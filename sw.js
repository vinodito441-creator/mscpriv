const V='vinzz-v1',FILES=['./','./index.html','./style.css','./script.js','./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;
e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{if(res&&res.ok&&(res.type==='basic'||r.url.includes('fonts.g'))){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res}).catch(()=>r.mode==='navigate'?caches.match('./index.html'):undefined)))});
