/* M&M animation: intro, shared logo transition, hero, scroll sections, interactions. Content stays visible if this fails. */
(function () {
    const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
    const runIntro = !reduce; // intro plays on every load
    history.scrollRestoration = 'manual'; scrollTo(0, 0);
    if (runIntro) document.documentElement.classList.add('js');
    if (reduce) document.documentElement.classList.add('rm');
    const logo = $('#logo'), slot = $('#slot'), veil = $('.veil'), im = $('.im'), skip = $('.skip');
    let lenis = null, intro = null, ctx, ended = false;
    const finish = () => { if (intro) intro.progress(1, false); done() };
    const onKey = e => { if (e.key === "Escape") finish() };

    /* ---- SharedLogoTransition: one element, fixed over the header slot; intro pose = transform offset ---- */
    function place() { const r = slot.getBoundingClientRect(); gsap.set(logo, { left: r.left, top: r.top, width: r.width, marginLeft: 0 }) }
    function pose() {
        const r = slot.getBoundingClientRect(), w = Math.min(innerWidth * .72, 620);
        return { x: innerWidth / 2 - (r.left + r.width / 2), y: innerHeight / 2 - (r.top + r.height / 2), scale: w / r.width }
    }
    place();

    /* ---- Lenis + ScrollTrigger sync ---- */

    function initScroll() {
        if (reduce || !window.Lenis) return;
        lenis = new Lenis({ duration: 1.15 }); lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add(t => lenis && lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
        $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
            const id = a.getAttribute('href');
            if (id === '#con') { e.preventDefault(); lenis.scrollTo(document.documentElement.scrollHeight - innerHeight); return }
            const t = document.querySelector(id); if (t) { e.preventDefault(); lenis.scrollTo(t) }
        }))
    }


    /* ---- HeroAnimation (returns timeline, appended to the intro) ---- */
    function heroTL() {
        const tl = gsap.timeline();
        tl.from('.nv', { y: -14, opacity: 0, stagger: .08, duration: .7, ease: 'power3.out' }, 0)
            .from('.hl .ln span', { yPercent: 110, stagger: .12, duration: 1.1, ease: 'expo.out' }, .1)
            .fromTo('.hv .frame', { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.3, ease: 'expo.inOut' }, .15)
            .fromTo('.hv img', { scale: 1.25 }, { scale: 1, duration: 1.8, ease: 'power3.out' }, .15)
            .from('.hm', { opacity: 0, y: 10, stagger: .07, duration: .7, ease: 'power2.out' }, .9);
        return tl
    }

    /* ---- IntroSequence: A silence/emerge, B hold+sweep, C transform, D reveal ---- */
    function buildIntro() {
        const p = pose();
        gsap.set(logo, { x: p.x, y: p.y, scale: p.scale * .8, opacity: 0, transformPerspective: 900, rotationX: 7, transformOrigin: '50% 50%' });
        gsap.set(im, { opacity: 0 });
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: done });
        tl.to(logo, { opacity: 1, scale: p.scale, rotationX: 0, duration: 1.2, ease: 'power3.out' }, .35)           // A
            .to('.sweep', { opacity: .55, duration: .2 }, 1.3).to('.sweep', { backgroundPosition: '-30% 0', duration: 1, ease: 'power1.inOut' }, 1.3).to('.sweep', { opacity: 0, duration: .3 }, 2.0) // B
            .to(im, { opacity: 1, duration: .6 }, 1.5)
            .addLabel('go', 2.15)
            .to(im, { opacity: 0, duration: .4 }, 'go')
            .to(skip, { opacity: 0, pointerEvents: 'none', duration: .3 }, 'go')
            .to(logo, { x: 0, y: 0, scale: 1, duration: 1.25, ease: 'expo.inOut' }, 'go')                              // C
            .to(veil, { opacity: 0, duration: .9, ease: 'power2.inOut' }, 'go+=.35')
            .add(heroTL(), 'go+=.7');                                                                       // D
        return tl
    }
    function done() {
        if (ended) return; ended = true; removeEventListener("keydown", onKey); veil.style.display = 'none'; im.style.display = 'none'; skip.style.display = 'none'; gsap.set(logo, { clearProps: 'transform,opacity' }); place();
        lenis && lenis.start(); document.documentElement.style.overflow = ''; initScrollUI()
    }

    /* ---- ScrollSections + CampaignGallery ---- */
    function initScrollUI() {
        if (ctx) return; ctx = gsap.context(() => {
            if (reduce) { return }
            // const A = gsap.timeline({ scrollTrigger: { trigger: '#attn', start: 'top top', end: '+=170%', pin: true, scrub: .8 } });
            // A.from('#attn .a', { scale: 1.5, opacity: 0, duration: 1 })
            //     .from('#attn .b', { yPercent: 120, opacity: 0, duration: .8 }, .7)
            //     .to('#attn .a', { scale: .55, yPercent: -30, duration: 1.2 }, 1.4)
            //     .to('#attn .b', { scale: 1.3, y: '-14vh', duration: 1.2 }, 1.4)
            //     .to('#attn .bg', { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'power2.inOut' }, 1.3);
            gsap.matchMedia().add('(min-width:821px)', () => {
                const gal = $('#gal'), tr = $('.track'), dist = () => tr.scrollWidth - innerWidth;
                gal.classList.add('is-pinned');
                const H = gsap.to(tr, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '#gal', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: .6, invalidateOnRefresh: true } });
                const st = H.scrollTrigger, cards = $$('.vc'), reset = () => { gal.scrollLeft = 0 };
                const focus = e => {
                    reset(); const c = e.currentTarget, d = dist(); if (d <= 0) return;
                    const t = Math.min(Math.max(c.offsetLeft - (innerWidth - c.offsetWidth) / 2, 0), d), y = st.start + (t / d) * (st.end - st.start);
                    lenis ? lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y)
                };
                gal.addEventListener('scroll', reset, { passive: true });
                cards.forEach(c => c.addEventListener('focusin', focus));
                return () => { gal.classList.remove('is-pinned'); gal.removeEventListener('scroll', reset); cards.forEach(c => c.removeEventListener('focusin', focus)) };
            });
            const gal = $('#gal'), st = H.scrollTrigger;
            gal.addEventListener('scroll', () => { gal.scrollLeft = 0 }, { passive: true });
            $$('.vc').forEach(c => c.addEventListener('focusin', () => {
                gal.scrollLeft = 0; const d = dist(); if (d <= 0) return;
                const t = Math.min(Math.max(c.offsetLeft - (innerWidth - c.offsetWidth) / 2, 0), d), y = st.start + (t / d) * (st.end - st.start);
                lenis ? lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y)
            }));
            gsap.from('#phil h2 span', { yPercent: 60, opacity: 0, stagger: .15, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '#phil h2', start: 'top 75%' } });
            gsap.from('.row', { opacity: 0, y: 30, stagger: .12, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.rows', start: 'top 80%' } });
            gsap.from('.svc', { opacity: 0, x: -40, stagger: .08, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: '#cap', start: 'top 70%' } });
            gsap.from('.mk', { yPercent: 105, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '#con', start: 'top 55%' } });
            gsap.from('.ct,footer', { opacity: 0, y: 24, stagger: .15, duration: .9, scrollTrigger: { trigger: '#con', start: 'top 30%' } });
        });
        const rf = () => ScrollTrigger.refresh(); document.readyState === 'complete' ? rf() : addEventListener('load', rf, { once: true }); document.fonts && document.fonts.ready.then(rf)
    }

    /* ---- InteractionEffects ---- */
    function fx() {
        if (!fine || reduce) return; const c = $('#cur'); gsap.set(c, { opacity: 1 });
        const qx = gsap.quickTo(c, 'x', { duration: .25 }), qy = gsap.quickTo(c, 'y', { duration: .25 });
        addEventListener('pointermove', e => { qx(e.clientX); qy(e.clientY) }, { passive: true });
        $$('a,button,.vc').forEach(el => { el.addEventListener('pointerenter', () => gsap.to(c, { scale: 3, duration: .3 })); el.addEventListener('pointerleave', () => gsap.to(c, { scale: 1, duration: .3 })) });
        $$('.mag').forEach(b => {
            const mx = gsap.quickTo(b, 'x', { duration: .5, ease: 'power3' }), my = gsap.quickTo(b, 'y', { duration: .5, ease: 'power3' });
            b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); mx((e.clientX - r.left - r.width / 2) * .2); my((e.clientY - r.top - r.height / 2) * .3) });
            b.addEventListener('pointerleave', () => { mx(0); my(0) })
        })
    }

    /* ---- boot ---- */
    let rt, lastW = innerWidth;
    addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (innerWidth === lastW) return; lastW = innerWidth; if (!ended) { finish() } else { place() } }, 120) });
    fx();
    const start = () => {
        if (!runIntro) { veil && (veil.style.display = 'none'); im.style.display = 'none'; initScroll(); initScrollUI(); return }
        initScroll(); lenis && lenis.stop(); document.documentElement.style.overflow = 'hidden';
        skip.style.display = 'block'; skip.addEventListener('click', finish);
        addEventListener('keydown', onKey);
        setTimeout(done, 9000); intro = buildIntro()
    };
    (document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1200))]) : Promise.resolve()).then(start);
})();
