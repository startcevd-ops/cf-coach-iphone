/* CF Coach offline cache. Increment on releases to refresh the offline app. */
const CACHE='cf-coach-ios-v7.5-miband-20261116';
const ASSETS=["./", "./index.html", "./cfcoach-v63.css", "./cfcoach-v63.js", "./mi-band-sync.js", "./jszip.min.js", "./ios-compat.js", "./stability.js", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./media/clean-tech.jpg", "./media/gym-bg.jpg", "./media/hero-lifter.jpg", "./media/program-foundation.jpg", "./media/program-performance.jpg", "./media/program-start.jpg", "./tech/back-squat.png", "./tech/bench-press.png", "./tech/box-step-over.png", "./tech/burpee-line.png", "./tech/dead-bug.png", "./tech/deadlift.png", "./tech/front-squat.png", "./tech/hollow-hold.png", "./tech/kb-swing.png", "./tech/power-clean.png", "./tech/pull-up.png", "./tech/rdl.png", "./tech/ring-row.png", "./tech/strict-press.png", "./athlete/boxjump-motion.gif", "./athlete/boxjump-steps.webp", "./athlete/clean-motion.gif", "./athlete/clean-steps.webp", "./athlete/deadlift-motion.gif", "./athlete/deadlift-steps.webp", "./athlete/dips-motion.gif", "./athlete/dips-steps.webp", "./athlete/front-motion.gif", "./athlete/front-steps.webp", "./athlete/jerk-motion.gif", "./athlete/jerk-steps.webp", "./athlete/muscleup-steps.webp", "./athlete/snatch-motion.gif", "./athlete/snatch-steps.webp", "./athlete/t2b-motion.gif", "./athlete/t2b-steps.webp"];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('cf-coach-ios-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const req=event.request,url=new URL(req.url);
  if(req.method!=='GET'||url.origin!==self.location.origin||!url.pathname.startsWith(new URL(self.registration.scope).pathname))return;
  if(req.mode==='navigate'){
    event.respondWith(fetch(req).then(res=>{
      if(res.ok){const clone=res.clone();caches.open(CACHE).then(cache=>cache.put('./index.html',clone)).catch(()=>{});}return res;
    }).catch(()=>caches.match('./index.html')));return;
  }
  event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{
    if(res.ok){const clone=res.clone();caches.open(CACHE).then(cache=>cache.put(req,clone)).catch(()=>{});}return res;
  })));
});
