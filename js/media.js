/* M&M campaign videos. Independent of GSAP. Videos load only when near the viewport. */
(()=>{
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const cards=[...document.querySelectorAll('.vc')];
const load=v=>{if(v.dataset.loaded)return;v.dataset.loaded='1';v.src=v.dataset.src;v.load()};
const play=v=>{const p=v.play();p&&p.catch(()=>{})};
cards.forEach(c=>{const v=c.querySelector('video'),b=c.querySelector('.vc-toggle'),n=c.dataset.name;
 const sync=()=>{b.setAttribute('aria-pressed',String(!v.paused));b.setAttribute('aria-label',(v.paused?'Play':'Pause')+' video: '+n)};
 b.addEventListener('click',()=>{load(v);if(v.paused){v.dataset.user='';play(v)}else{v.dataset.user='paused';v.pause()}});
 v.addEventListener('play',sync);v.addEventListener('pause',sync);
 v.addEventListener('error',()=>c.classList.add('is-empty'));
 const a=c.querySelector('[data-reel]');
 if(a&&!/instagram\.com\/(reel|p)\//.test(a.href))console.warn('[M&M] Reel URL not set for',n)});
if(reduce||!('IntersectionObserver' in window))return;
const io=new IntersectionObserver(es=>es.forEach(e=>{const v=e.target.querySelector('video');
 if(e.isIntersecting){load(v);if(v.dataset.user!=='paused')play(v)}else v.pause()}),{rootMargin:'0px 200px'});
cards.forEach(c=>io.observe(c));
})();
