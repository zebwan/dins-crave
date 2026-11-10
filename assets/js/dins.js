/* Din's Smash Burgers: runtime for the static rebuild of the CRAV template.
 * Every component below is a port of the template's own module (ids in brackets), with the same
 * GSAP 3.15 / Lenis 1.3.23 calls and values. Markup comes from the template's server render.
 */
(() => {
  'use strict';
  const gsap = window.gsap;
  const { ScrollTrigger, SplitText, InertiaPlugin, MotionPathPlugin, MorphSVGPlugin, ScrollToPlugin } = window;
  gsap.registerPlugin(ScrollTrigger, SplitText, InertiaPlugin, MotionPathPlugin, MorphSVGPlugin, ScrollToPlugin);

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const html = document.documentElement;
  const body = document.body;
  const P = body.dataset.prefix || '';
  const PAGE = body.dataset.page || '';
  const ROOT_PATH = new URL(P || './', location.href).pathname;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMaxMd = () => !matchMedia('(min-width:1025px)').matches;
  const store = {
    get(k, s = localStorage) { try { return s.getItem(k); } catch (e) { return null; } },
    set(k, v, s = localStorage) { try { s.setItem(k, v); } catch (e) {} },
    del(k, s = localStorage) { try { s.removeItem(k); } catch (e) {} },
  };
  const COLORS = { red: '#C8102E', kraftDark: '#A87443', gold: '#F2B01E', ketchup: '#4A0B13' };

  /* ---------------------------------------------------------------- Lenis [76761] */
  const lenis = new window.Lenis({ autoRaf: false, duration: 1.2 });
  window.lenis = lenis;
  gsap.ticker.add((t) => lenis.raf(1e3 * t));
  const lenisSubs = new Set();
  lenis.on('scroll', (l) => lenisSubs.forEach((f) => f(l)));

  /* ---------------------------------------------------------------- AnimationProvider [55334] */
  const state = { loader: false, transition: true };
  const readyQ = [];
  const isReady = () => state.loader && state.transition;
  function onReady(fn) { isReady() ? fn() : readyQ.push(fn); }
  function flushReady() { if (isReady()) readyQ.splice(0).forEach((f) => f()); updateTitle(); }
  function setLoaderFinished(v) { state.loader = v; flushReady(); }
  function setTransitionFinished(v) { state.transition = v; flushReady(); }

  /* ---------------------------------------------------------------- Title cycler [28981] */
  let titleTimer = 0;
  const titleBase = (() => {
    const rel = location.pathname.startsWith(ROOT_PATH) ? location.pathname.slice(ROOT_PATH.length) : location.pathname;
    const name = rel.replace(/index\.html$/, '').replace(/\.html$/, '').split('/').filter(Boolean)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ')).join(' | ');
    return name || "Din's";
  })();
  let firstLoad = true;
  function updateTitle() {
    clearInterval(titleTimer);
    if (!isReady()) { if (!firstLoad) document.title = 'Craving...'; return; }
    firstLoad = false;
    const t = ['Sizzling', 'Grilling', 'Flipping', 'Serving', 'Enjoy'].map((w) => `${titleBase} | ${w}`);
    let i = 0;
    document.title = t[i]; i = (i + 1) % t.length;
    titleTimer = setInterval(() => { document.title = t[i]; i = (i + 1) % t.length; }, 800);
  }

  /* ---------------------------------------------------------------- Loader [83138] */
  const LOADER_LAYERS = [
    { rotate: 0, label: 'TOASTING THE BRIOCHE BUN...' },
    { rotate: -2, label: 'SMASHING THE BEEF PATTY...' },
    { rotate: 1, label: 'MELTING THE CHEDDAR...' },
    { rotate: -4, label: 'SLICING THE TOMATOES...' },
    { rotate: 3, label: 'ADDING CRISP LETTUCE...' },
    { rotate: 0, label: "WRAPPING UP YOUR DIN'S!" },
  ];
  function runLoader() {
    const root = $('[aria-label="Page loading"]');
    if (!root) { setLoaderFinished(true); return; }
    lenis.stop();
    const [pX, pG, pW] = $$(':scope > div:first-child svg path', root);
    const stack = root.children[1];
    const dots = $$(':scope > div:first-child > div', stack);
    const layers = Array.from(stack.children).slice(1);
    const labelWrap = root.children[2];
    const label = $('[aria-live]', root);
    const barWrap = $('.loader-bar', root);
    const bar = barWrap.firstElementChild;
    const r = { yLeft: 101, yRight: 101, yCenter: 101 }, a = { ...r }, o = { ...r };
    const D = (q) => `M -1 -1 L 101 -1 L 101 ${q.yRight} Q 50 ${q.yCenter} -1 ${q.yLeft} Z`;
    const ctx = gsap.context(() => {
      const t = gsap.timeline({
        onComplete: () => { lenis.start(); root.remove(); setLoaderFinished(true); },
      });
      gsap.set(layers, { y: -800, opacity: 0, scale: 0.8 });
      gsap.set(stack, { scaleX: 1, scaleY: 1 });
      gsap.set(labelWrap, { opacity: 1, y: 0 });
      const s = { value: 0 };
      t.to(s, { value: 100, duration: 1.5, ease: 'power1.inOut', onUpdate: () => {
        const v = Math.floor(s.value); bar.style.width = v + '%'; barWrap.setAttribute('aria-valuenow', v);
      } }, 0);
      LOADER_LAYERS.forEach((e, i) => {
        const n = 0.22 * i, k = n + 0.32;
        t.call(() => { label.textContent = e.label; }, null, n + 0.05);
        t.fromTo(layers[i], { y: -800, opacity: 0, scale: 0.8 }, { y: 0, opacity: 1, scale: 1, duration: 0.32, ease: 'power1.in' }, n);
        t.fromTo(layers[i], { rotate: e.rotate + (Math.random() > 0.5 ? 12 : -12) }, { rotate: e.rotate, duration: 0.45, ease: 'back.out(2.5)' }, k);
        t.to(stack, { scaleY: 0.88, scaleX: 1.06, duration: 0.06, ease: 'power2.out' }, k);
        t.to(stack, { scaleY: 1.03, scaleX: 0.98, duration: 0.08, ease: 'power1.inOut' }, k + 0.06);
        t.to(stack, { scaleY: 1, scaleX: 1, duration: 0.12, ease: 'power2.out' }, k + 0.14);
      });
      const c = 1.1 + 0.32;
      t.call(() => {
        dots.forEach((e, i) => {
          const ang = (i / dots.length) * Math.PI * 2, dist = 110 + 90 * Math.random();
          gsap.fromTo(e, { x: 0, y: 0, scale: 0, opacity: 1 },
            { x: Math.cos(ang) * dist, y: Math.sin(ang) * dist - 30, scale: 1.5 * Math.random() + 0.6, opacity: 0, duration: 0.8, ease: 'power2.out' });
        });
      }, null, c);
      t.to(stack, { y: -50, scale: 1.08, rotate: 2, duration: 0.4, ease: 'power2.out' }, c + 0.3)
        .to(stack, { y: 0, scale: 1, rotate: 0, duration: 0.5, ease: 'bounce.out' });
      t.call(() => { label.textContent = 'READY TO MAKAN!'; }, null, c + 0.3);
      const f = c + 1.2;
      t.to([labelWrap, barWrap], { y: 50, opacity: 0, duration: 0.35, ease: 'power2.in' }, f - 0.4);
      t.to(stack, { y: -1e3, opacity: 0, scale: 0.9, duration: 0.75, ease: 'power2.in' }, f);
      t.to(r, { yLeft: -1, yRight: -1, duration: 0.8, ease: 'power2.inOut' }, f)
        .to(r, { yCenter: -1, duration: 1.1, ease: 'power4.inOut', onUpdate: () => pW.setAttribute('d', D(r)) }, f);
      t.to(a, { yLeft: -1, yRight: -1, duration: 0.8, ease: 'power2.inOut' }, f + 0.12)
        .to(a, { yCenter: -1, duration: 1.1, ease: 'power4.inOut', onUpdate: () => pG.setAttribute('d', D(a)) }, f + 0.12);
      t.to(o, { yLeft: -1, yRight: -1, duration: 0.8, ease: 'power2.inOut' }, f + 0.24)
        .to(o, { yCenter: -1, duration: 1.1, ease: 'power4.inOut', onUpdate: () => pX.setAttribute('d', D(o)) }, f + 0.24);
    });
    return ctx;
  }

  /* ---------------------------------------------------------------- Page transition [82148] */
  const tr = $('[data-tr]');
  const trPaths = tr ? $$(':scope > svg path', tr) : []; // [red u, kraft s, gold l] in DOM order
  const trLabelWrap = tr ? tr.querySelector(':scope > div') : null;
  const trLabel = trLabelWrap ? trLabelWrap.firstElementChild : null;
  let trBusy = false, trBlink = null;
  function leave(done) {
    setTransitionFinished(false);
    const [u, s, l] = trPaths;
    const t = gsap.timeline({ onComplete: done });
    const r = { yLeft: 101, yRight: 101, yCenter: 101 }, a = { ...r }, o = { ...r };
    const D = (q) => `M -1 101 L 101 101 L 101 ${q.yRight} Q 50 ${q.yCenter} -1 ${q.yLeft} Z`;
    gsap.set([l, s, u], { attr: { d: 'M -1 101 L 101 101 L 101 101 Q 50 101 -1 101 Z' } });
    t.to(o, { yCenter: -1, duration: 0.65, ease: 'power2.out', onUpdate: () => u.setAttribute('d', D(o)) }, 0)
      .to(o, { yLeft: -1, yRight: -1, duration: 0.85, ease: 'power3.inOut', onUpdate: () => u.setAttribute('d', D(o)) }, 0);
    t.to(a, { yCenter: -1, duration: 0.65, ease: 'power2.out', onUpdate: () => s.setAttribute('d', D(a)) }, 0.1)
      .to(a, { yLeft: -1, yRight: -1, duration: 0.85, ease: 'power3.inOut', onUpdate: () => s.setAttribute('d', D(a)) }, 0.1);
    t.to(r, { yCenter: -1, duration: 0.65, ease: 'power2.out', onUpdate: () => l.setAttribute('d', D(r)) }, 0.2)
      .to(r, { yLeft: -1, yRight: -1, duration: 0.85, ease: 'power3.inOut', onUpdate: () => l.setAttribute('d', D(r)) }, 0.2);
    t.fromTo(trLabelWrap, { scale: 0.7, opacity: 0, y: 30 }, {
      scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(2)',
      onComplete: () => { trBlink = gsap.timeline({ repeat: -1 }).to(trLabel, { opacity: 0.3, duration: 0.4, yoyo: true, repeat: 1, ease: 'sine.inOut' }); },
    }, '-=0.4');
  }
  function enter() {
    const [u, s, l] = trPaths;
    const t = gsap.timeline({ onComplete: () => { html.classList.remove('is-nav-enter', 'is-nav-entering'); setTransitionFinished(true); } });
    const r = { yLeft: 101, yRight: 101, yCenter: 101 }, a = { ...r }, o = { ...r };
    const D = (q) => `M -1 -1 L 101 -1 L 101 ${q.yRight} Q 50 ${q.yCenter} -1 ${q.yLeft} Z`;
    gsap.set([l, s, u], { attr: { d: 'M -1 -1 L 101 -1 L 101 101 Q 50 101 -1 101 Z' } });
    gsap.set(trLabelWrap, { opacity: 1, scale: 1 });
    html.classList.add('is-nav-entering'); // CSS cover no longer needed once the paths cover the screen
    t.to(r, { yLeft: -1, yRight: -1, duration: 0.75, ease: 'power2.inOut' }, 0)
      .to(r, { yCenter: -1, duration: 1.05, ease: 'power4.inOut', onUpdate: () => l.setAttribute('d', D(r)) }, 0);
    t.to(a, { yLeft: -1, yRight: -1, duration: 0.75, ease: 'power2.inOut' }, 0.1)
      .to(a, { yCenter: -1, duration: 1.05, ease: 'power4.inOut', onUpdate: () => s.setAttribute('d', D(a)) }, 0.1);
    t.to(o, { yLeft: -1, yRight: -1, duration: 0.75, ease: 'power2.inOut' }, 0.2)
      .to(o, { yCenter: -1, duration: 1.05, ease: 'power4.inOut', onUpdate: () => u.setAttribute('d', D(o)) }, 0.2);
    t.fromTo(trLabelWrap, { scale: 1, opacity: 1 }, { scale: 1.3, opacity: 0, duration: 0.4, ease: 'power2.in' }, 0);
  }
  function navigate(href) {
    if (trBusy) return;
    trBusy = true;
    leave(() => {
      store.set('dins:nav', '1', sessionStorage);
      location.href = href;
    });
  }
  // [82148] auto mode: every same-origin a[href] click goes through the transition
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.getAttribute('data-transition-ignore') || a.target === '_blank' || a.rel === 'external' || a.hasAttribute('download')) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    let to, from;
    try { from = new URL(location.href); to = new URL(a.href); } catch (err) { return; }
    if (to.origin !== from.origin) return;
    const norm = (u) => u.pathname.replace(/index\.html$/, '');
    if (norm(to) === norm(from) && to.search === from.search) return; // same page (hash or not): plain behaviour
    e.preventDefault();
    navigate(to.href);
  });
  window.addEventListener('pageshow', (e) => { if (e.persisted) { location.reload(); } });

  /* ---------------------------------------------------------------- Hover roll [31922] */
  const roll = (text) => `<span class="overflow-hidden  relative inline-block group "><span class="block  group-hover:-translate-y-full translate-y-0 transition-all duration-300">${text}</span><span class="block absolute inset-0 w-full h-full group-hover:translate-y-0 translate-y-full transition-all duration-300" aria-hidden="true">${text}</span></span>`;

  /* ---------------------------------------------------------------- Nav + menu [65022] */
  function initNav() {
    const nav = $('nav.fixed');
    if (!nav) return;
    const backdrop = nav.previousElementSibling;
    const btn = $('button[aria-controls="main-menu"]', nav);
    const panel = $('#main-menu');
    const items = panel.firstElementChild;
    const labelEl = btn.firstElementChild;
    const icon = btn.children[1];
    const [b1, b2, b3] = Array.from(icon.children);
    const menuRoll = labelEl.innerHTML;
    let open = false, dark = false;
    let shown = true, last = 0;

    const btnBase = 'hover:scale-105 flex items-center gap-[.6vw] max-md:gap-[2vw] px-[1.4vw] py-[.5vw] max-md:px-[4vw] group max-md:py-[1.8vw] rounded-full cursor-pointer transition-all duration-400 border-[.15vw] max-md:border-[.4vw] ';
    const lblBase = 'font-mouse-memoirs flex items-center justify-center uppercase text-[1.3vw] max-md:text-[4vw] tracking-wide transition-colors duration-300 ';
    const barCls = ['absolute left-0 top-0 block w-full h-[.15vw] max-md:h-[.5vw] rounded-full origin-center',
      'absolute left-0 top-1/2 block w-[70%] h-[.15vw] max-md:h-[.5vw] rounded-full origin-center -translate-y-1/2',
      'absolute left-0 bottom-0 block w-full h-[.15vw] max-md:h-[.5vw] rounded-full origin-center'];
    function paint() {
      btn.className = btnBase + (open ? 'bg-red border-red' : dark ? 'bg-transparent border-white/20 hover:border-white' : 'bg-transparent border-black/20 hover:border-black');
      labelEl.className = lblBase + (open ? 'text-beige' : dark ? 'text-white' : 'text-black');
      const bg = open ? 'bg-beige' : dark ? 'bg-white' : 'bg-black';
      [b1, b2, b3].forEach((b, i) => { b.className = bg + ' ' + barCls[i]; });
      if (open) labelEl.textContent = 'Close'; else if (labelEl.textContent === 'Close') labelEl.innerHTML = menuRoll;
      btn.setAttribute('aria-expanded', open);
      panel.style.pointerEvents = open ? 'auto' : 'none';
    }
    // hide on scroll down / show on scroll up
    const show = () => { if (!shown) { shown = true; gsap.to(nav, { y: 0, duration: 0.35, ease: 'power3.out', overwrite: 'auto' }); } };
    lenisSubs.add(({ scroll }) => {
      if (last === 0 && window.scrollY > 0) last = window.scrollY;
      gsap.set(nav, { willChange: 'transform' });
      if (open) { show(); last = scroll; return; }
      const d = scroll - last;
      if (scroll < 10) show();
      else if (d > 6) {
        if (shown) { shown = false; gsap.to(nav, { y: -((nav.offsetHeight || 0) + 12), duration: 0.35, ease: 'power3.out', overwrite: 'auto' }); }
      } else if (d < -6) show();
      last = scroll;
    });
    // dark sections
    $$('[data-nav-dark="true"]').forEach((sec) => ScrollTrigger.create({
      trigger: sec, start: 'top 5%', end: 'bottom 5%',
      onEnter: () => { dark = true; paint(); }, onEnterBack: () => { dark = true; paint(); },
      onLeave: () => { dark = false; paint(); }, onLeaveBack: () => { dark = false; paint(); },
    }));
    // dropdown timeline
    gsap.set(backdrop, { opacity: 0, pointerEvents: 'none' });
    gsap.set(panel, { opacity: 0, scale: 0.3, transformOrigin: 'top right' });
    const tl = gsap.timeline({ paused: true, defaults: { overwrite: 'auto' } });
    tl.add(() => gsap.set(backdrop, { pointerEvents: 'auto' }), 0)
      .to(backdrop, { opacity: 1, duration: 0.28, ease: 'power2.out' }, 0)
      .to(panel, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2.5)' }, 0.3)
      .fromTo(() => items.children, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.38, stagger: 0.06, ease: 'power3.out' }, 0.14);
    tl.eventCallback('onReverseComplete', () => gsap.set(backdrop, { pointerEvents: 'none' }));
    // burger -> X
    let iconTl;
    const buildIcon = () => {
      if (iconTl) iconTl.kill();
      gsap.set([b1, b2, b3], { clearProps: 'transform,top,bottom,opacity,scaleX' });
      gsap.set(b1, { top: 0, bottom: 'auto' }); gsap.set(b2, { opacity: 1, scaleX: 1 }); gsap.set(b3, { top: 'auto', bottom: 0 });
      iconTl = gsap.timeline({ paused: true, defaults: { duration: 0.35, ease: 'power3.inOut' } });
      iconTl.to(b1, { top: '50%', yPercent: -50, rotation: 45, transformOrigin: '50% 50%' }, 0)
        .to(b3, { top: '50%', bottom: 'auto', yPercent: -50, rotation: -45, transformOrigin: '50% 50%' }, 0)
        .to(b2, { opacity: 0, scaleX: 0, transformOrigin: '50% 50%' }, 0);
      return iconTl;
    };
    buildIcon();
    let rz = 0;
    window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { const p = iconTl.progress(); buildIcon().progress(p); }, 120); });
    function setOpen(v) {
      open = v; paint();
      v ? tl.play() : tl.reverse();
      v ? iconTl.play() : iconTl.reverse();
      v ? lenis.stop() : lenis.start();
      if (v) show();
    }
    btn.addEventListener('click', (e) => { e.stopPropagation(); setOpen(!open); });
    backdrop.addEventListener('click', () => setOpen(false));
    document.addEventListener('click', (e) => { if (open && !panel.contains(e.target)) setOpen(false); });
    // anchors (#about, #map) and logo
    const scrollToTarget = (hash) => {
      let el = null;
      if (hash === '#map') el = document.querySelector(matchMedia('(max-width: 1025px)').matches ? '#map-mobile' : '#map-desktop');
      else el = document.querySelector(hash);
      if (!el) return;
      gsap.to(window, { duration: 0.9, ease: 'power3.inOut', scrollTo: { y: el, offsetY: (nav.offsetHeight || 0) + 12 } });
    };
    $$('a[role="menuitem"]', panel).forEach((a) => a.addEventListener('click', (e) => {
      const tgt = a.dataset.target;
      if (tgt) {
        if (PAGE === 'home') { e.preventDefault(); e.stopPropagation(); setOpen(false); scrollToTarget('#' + tgt); }
        else { store.set('dins:target', tgt, sessionStorage); setOpen(false); }
      } else setOpen(false);
    }));
    const logo = nav.firstElementChild;
    logo.addEventListener('click', (e) => { if (PAGE === 'home') { e.preventDefault(); e.stopPropagation(); scrollToTarget('#hero'); } });
    $$('a[data-target]').forEach((a) => { if (a.getAttribute('role') !== 'menuitem') a.addEventListener('click', () => store.set('dins:target', a.dataset.target, sessionStorage)); });
    // scroll target handed over from another page
    if (PAGE === 'home') {
      const tgt = store.get('dins:target', sessionStorage);
      if (tgt) { store.del('dins:target', sessionStorage); onReady(() => setTimeout(() => scrollToTarget('#' + tgt), 100)); }
    }
    paint();
  }

  /* ---------------------------------------------------------------- Cookie toast [65022] */
  function initCookie() {
    const KEY = 'dins_cookie_ok';
    if (store.get(KEY) === '1') return;
    setTimeout(() => {
      const wrap = document.createElement('div');
      wrap.className = 'fixed bottom-[2vw] max-md:bottom-[3vw] left-1/2 -translate-x-1/2 z-997 w-[32vw] max-w-[98vw] min-w-[290px] max-md:w-[99vw] max-md:px-[2vw] pointer-events-none';
      wrap.setAttribute('role', 'status'); wrap.setAttribute('aria-live', 'polite');
      wrap.innerHTML = `<div aria-label="Cookie consent" class="pointer-events-auto bg-white/90 backdrop-blur-md text-black border border-beige/30 rounded-2xl shadow-lg px-[1.6vw] py-[1.1vw] max-md:px-[4vw] max-md:py-[4vw] max-md:rounded-xl max-md:gap-3 overflow-hidden flex flex-col gap-1.5" style="border:1.5px solid rgba(242,176,30,0.15);box-shadow:0 6px 22px rgba(30,25,21,.18)"><div class="flex items-center gap-2 mb-[.5vw] max-md:gap-2.5 max-md:mb-[1.3vw]"><span class="inline-flex items-center justify-center bg-mustard/20 rounded-full p-1 mr-1 max-md:p-[2.2vw] max-md:mr-[1vw]"><svg aria-hidden="true" width="21" height="21" viewBox="0 0 21 21" fill="none"><circle cx="10.5" cy="10.5" r="8.8" fill="${COLORS.gold}" stroke="#C99902" stroke-width="1.4"></circle><circle cx="8" cy="8.7" r="1" fill="#deb110"></circle><circle cx="12.5" cy="13.5" r="0.7" fill="#deb110"></circle><circle cx="12.2" cy="7.8" r="0.5" fill="#deb110"></circle><circle cx="8.1" cy="13.7" r="0.45" fill="#deb110"></circle></svg></span><span class="font-mouse-memoirs uppercase tracking-[.16em] text-[.88vw] max-md:text-[4vw] text-black/85 max-md:leading-tight">Cookies in use</span></div><div class="flex items-center w-full gap-3 max-md:flex-col max-md:items-stretch max-md:gap-[2vw] max-md:w-full"><p class="font-mouse-memoirs text-[.96vw] max-md:text-[4vw] text-black/95 leading-normal mr-auto max-md:mr-0 max-md:mb-[2vw] max-md:text-left">We use cookies to improve your experience.</p><div class="flex items-center gap-2 shrink-0 max-md:mt-0 max-md:w-full max-md:gap-[3vw]"><button data-cursor-hide="true" type="button" data-later class="font-mouse-memoirs cursor-pointer flex items-center justify-center uppercase tracking-wide text-[.88vw] max-md:text-[3.5vw] px-[1vw] py-[.43vw] max-md:px-[2.5vw] max-md:py-[2.4vw] rounded-full border border-black/15 hover:border-mustard hover:bg-mustard/10 transition-colors duration-200 w-fit max-md:flex-1">${roll('Later')}</button><button data-cursor-hide="true" type="button" data-ok class="font-mouse-memoirs cursor-pointer flex items-center justify-center uppercase tracking-wide text-[.88vw] max-md:text-[3.5vw] bg-mustard text-black px-[1vw] py-[.43vw] max-md:px-[2.5vw] max-md:py-[2.4vw] rounded-full border border-mustard hover:bg-black hover:text-beige hover:border-black transition-colors duration-200 w-fit max-md:flex-1">${roll('Okay!')}</button></div></div></div>`;
      const nav = $('nav.fixed');
      (nav ? nav.parentElement : body).insertBefore(wrap, nav ? nav.nextSibling : null);
      const card = wrap.firstElementChild;
      gsap.set(card, { opacity: 0, y: 60, scale: 1, pointerEvents: 'auto' });
      gsap.to(card, { opacity: 1, y: 0, duration: 0.8, ease: 'power4.out', clearProps: 'transform' });
      const hide = () => { gsap.killTweensOf(card); gsap.to(card, { opacity: 0, y: 68, duration: 0.44, ease: 'power2.inOut', onComplete: () => wrap.remove() }); };
      $('[data-later]', wrap).addEventListener('click', hide);
      $('[data-ok]', wrap).addEventListener('click', () => { store.set(KEY, '1'); hide(); });
    }, 6e3);
  }

  /* ---------------------------------------------------------------- Cursor rope [78519] */
  function initCursor() {
    if (!(matchMedia('(pointer: fine)').matches) || reduced()) return;
    const SRC = ['lettuce', 'tomato', 'cheese-wedge', 'patty'].map((s) => P + 'assets/img/' + s + '.webp');
    const ALT = ['lettuce', 'tomato', 'cheese', 'patty'];
    const segLen = 8, segCount = 8, knots = [0, 3, 5, 9];
    const root = document.createElement('div');
    root.className = 'fixed max-md:hidden inset-0 pointer-events-none';
    root.style.opacity = 0; root.style.zIndex = 1e4;
    root.innerHTML = `<svg class="absolute inset-0 h-full w-full" aria-hidden="true"><path fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="1"></path></svg>` +
      knots.slice(0, 4).map((k, i) => `<div class="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2" style="opacity:0;z-index:${1e4 - i}"><div class="size-[2.2vw] max-md:hidden max-md:size-[7vw] rounded-full bg-white/80 backdrop-blur-md  border border-black/20  grid place-items-center"><img src="${SRC[i]}" alt="${ALT[i]}" draggable="false" class="w-[70%] h-[70%] object-contain select-none"></div></div>`).join('');
    const wrapper = $('.relative.w-full.h-full') || body;
    wrapper.insertBefore(root, wrapper.firstChild);
    const pathEl = root.querySelector('path');
    const beads = Array.from(root.children).slice(1);
    const mouse = { x: null, y: null };
    const seg = { value: segLen };
    let pts = [], started = false, hidden = false, idleT = 0;
    const vis = { current: 0 };
    const setVis = () => gsap.to(vis, { current: hidden ? 0 : 1, duration: 0.6, overwrite: 'auto', ease: 'power3.inOut', onUpdate: () => {
      const e = vis.current; root.style.opacity = e; root.style.zIndex = e < 0.2 ? 0 : 1e4; beads.forEach((b) => { b.style.opacity = e; });
    } });
    window.addEventListener('mousedown', () => { gsap.fromTo(root.firstElementChild, { opacity: 1 }, { opacity: 1, duration: 0.01 }); });
    window.addEventListener('mousemove', (t) => {
      mouse.x = t.clientX; mouse.y = t.clientY;
      if (!started) { pts = Array.from({ length: segCount }, () => ({ x: t.clientX, y: t.clientY })); started = true; seg.value = segLen; setVis(); }
      gsap.to(seg, { value: segLen, duration: 0.01, ease: 'power4.inOut', overwrite: true });
      clearTimeout(idleT);
      idleT = setTimeout(() => gsap.to(seg, { value: 0, duration: 0.5, ease: 'expo.out', overwrite: true }), 0);
      let el = document.elementFromPoint(mouse.x, mouse.y), h = false;
      while (el) { if (el.getAttribute && el.getAttribute('data-cursor-hide') !== null) { h = true; break; } el = el.parentElement; }
      if (h !== hidden) { hidden = h; setVis(); }
    }, { passive: true });
    const tick = () => {
      if (started && mouse.x !== null) {
        gsap.to(pts[0], { x: mouse.x, y: mouse.y, duration: 0.05, ease: 'power2.out', overwrite: true });
        const L = Math.max(0, seg.value);
        for (let r = 1; r < segCount; r++) {
          const a = pts[r - 1], o = pts[r], dx = a.x - o.x, dy = a.y - o.y;
          if (Math.sqrt(dx * dx + dy * dy) > L) {
            const ang = Math.atan2(dy, dx);
            gsap.to(o, { x: a.x - Math.cos(ang) * L, y: a.y - Math.sin(ang) * L, duration: 0.12 + 0.01 * r, ease: 'power3.out', overwrite: true });
          }
        }
        let d = `M ${pts[0].x} ${pts[0].y}`;
        for (let r = 1; r < segCount - 1; r++) d += ` Q ${pts[r].x} ${pts[r].y} ${(pts[r].x + pts[r + 1].x) / 2} ${(pts[r].y + pts[r + 1].y) / 2}`;
        const lst = pts[segCount - 1];
        pathEl.setAttribute('d', d + ` L ${lst.x} ${lst.y}`);
        knots.forEach((k, i) => {
          const b = beads[i]; if (!b) return;
          const o = pts[Math.max(0, Math.min(segCount - 1, k))];
          gsap.set(b, { x: o.x, y: o.y });
          const prev = pts[Math.max(0, Math.min(segCount - 1, k - 1))];
          if (prev) gsap.set(b, { rotation: Math.atan2(o.y - prev.y, o.x - prev.x) * (180 / Math.PI) });
        });
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------------------------------------------------------------- PopText [59598] */
  function initPop() {
    $$('[data-pop-props]').forEach((el) => {
      const p = Object.assign({ split: 'words', stagger: 0.055, duration: 0.72, ease: 'back.out(2.35)', scroll: true, start: 'top 88%', once: true, delay: 0 },
        JSON.parse(el.getAttribute('data-pop-props') || '{}'));
      const inner = el.querySelector('[aria-hidden="true"]');
      onReady(() => {
        const mm = gsap.matchMedia();
        mm.add({ reduceMotion: '(prefers-reduced-motion: reduce)', normalMotion: '(prefers-reduced-motion: no-preference)' }, (c) => {
          const pops = el.querySelectorAll('[data-pop]');
          if (!pops.length) return;
          const run = () => {
            inner.style.visibility = 'visible';
            if (c.conditions.reduceMotion) {
              gsap.fromTo(pops, { opacity: 0 }, { opacity: 1, duration: 0.4, delay: p.delay, ease: 'power1.out', stagger: 0.02, overwrite: 'auto' });
            } else {
              gsap.set(pops, { opacity: 0, scale: 0, y: 0, rotation: 0, transformOrigin: '50% 90%', force3D: true });
              gsap.fromTo(pops, { opacity: 0, scale: 0, y: () => gsap.utils.random(18, 40), rotation: () => gsap.utils.random(-16, 16) },
                { opacity: 1, scale: 1, y: 0, delay: p.delay, rotation: 0, duration: p.duration, ease: p.ease, stagger: p.stagger, overwrite: 'auto' });
            }
          };
          p.scroll ? ScrollTrigger.create({ trigger: el, start: p.start, once: p.once, onEnter: run }) : run();
        }, el);
      });
    });
  }

  /* ---------------------------------------------------------------- LineReveal [63168] */
  function initLines() {
    $$('[data-line]').forEach((el) => {
      const delay = parseFloat(el.getAttribute('data-line')) || 0;
      onReady(() => {
        const mm = gsap.matchMedia();
        mm.add({ reduceMotion: '(prefers-reduced-motion: reduce)', normalMotion: '(prefers-reduced-motion: no-preference)' }, (c) => {
          if (c.conditions.reduceMotion) {
            el.setAttribute('aria-label', el.innerText); el.style.opacity = 1;
            gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power1.out', delay, scrollTrigger: { trigger: el, start: 'top 95%', once: true } });
            return;
          }
          const st = SplitText.create(el, {
            type: 'lines', mask: 'lines', linesClass: 'line', lineThreshold: 0.1, autoSplit: true, aria: 'auto',
            onSplit: (s) => {
              const ti = getComputedStyle(el).textIndent;
              if (ti && ti !== '0px' && s.lines.length > 0) { s.lines[0].style.paddingLeft = ti; el.style.textIndent = '0'; }
              el.style.opacity = 1;
              return gsap.fromTo(s.lines, { y: '100%' }, { y: '0%', duration: 1.4, stagger: 0.15, ease: 'power4.out', delay, scrollTrigger: { trigger: el, start: 'top 95%', once: true } });
            },
          });
          return () => st.revert();
        }, el);
      });
    });
  }
  let rzRefresh = 0;
  window.addEventListener('resize', () => { clearTimeout(rzRefresh); rzRefresh = setTimeout(() => requestAnimationFrame(() => ScrollTrigger.refresh()), 150); });

  /* ---------------------------------------------------------------- Footer rule scaleX [97713] */
  function initRules() {
    $$('footer .h-\\[2px\\]').forEach((line) => {
      const mobile = !!line.closest('.max-md\\:block');
      const origin = mobile ? 'center center' : '0% 50%';
      const delay = mobile ? 0 : 0.25;
      if (reduced()) { gsap.set(line, { scaleX: 1, transformOrigin: origin }); return; }
      gsap.set(line, { scaleX: 0, transformOrigin: origin });
      gsap.to(line, { scaleX: 1, delay, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: line, start: 'top 92%', once: true } });
    });
  }

  /* ---------------------------------------------------------------- Jelly wave [36507] */
  function initJelly() {
    $$('svg.jelly').forEach((svg) => {
      const path = svg.querySelector('path');
      const flip = (path.getAttribute('d') || '').startsWith('M1536,300');
      const r = flip ? { v: 165, s1c: 235, s1e: 145, s2c: 195, s2e: 163, s3c: 195, s3e: 195 }
        : { v: 135, s1c: 65, s1e: 155, s2c: 105, s2e: 137, s3c: 105, s3e: 105 };
      const o = () => flip
        ? `M1536,300 H-1 V${300 - r.v} S184.32,${300 - r.s1c} 460.8,${300 - r.s1e} S860.16,${300 - r.s2c} 1121.28,${300 - r.s2e} S1413.12,${300 - r.s3c} 1536,${300 - r.s3e} V300`
        : `M1536,0 H-1 V${r.v} S184.32,${r.s1c} 460.8,${r.s1e} S860.16,${r.s2c} 1121.28,${r.s2e} S1413.12,${r.s3c} 1536,${r.s3e} V0`;
      const u = gsap.timeline({ repeat: -1, yoyo: true });
      const up = () => path.setAttribute('d', o());
      if (flip) {
        u.to(r, { v: 145, s1c: 215, s1e: 155, duration: 1, ease: 'sine.inOut', onUpdate: up }, 0);
        u.to(r, { s2c: 175, s2e: 140, duration: 2, ease: 'sine.inOut', onUpdate: up }, 0.3);
        u.to(r, { s3c: 170, s3e: 200, duration: 1.8, ease: 'sine.inOut', onUpdate: up }, 0.6);
      } else {
        u.to(r, { v: 155, s1c: 45, s1e: 175, duration: 1, ease: 'sine.inOut', onUpdate: up }, 0);
        u.to(r, { s2c: 85, s2e: 160, duration: 2, ease: 'sine.inOut', onUpdate: up }, 0.3);
        u.to(r, { s3c: 130, s3e: 80, duration: 1.8, ease: 'sine.inOut', onUpdate: up }, 0.6);
      }
      gsap.set(svg, { transformOrigin: flip ? 'bottom center' : 'top center' });
      const m = gsap.matchMedia();
      m.add('(min-width: 768px)', () => gsap.to(svg, { scaleY: 1.5, scrollTrigger: { trigger: svg, start: flip ? 'bottom 80%' : 'top 80%', end: flip ? 'top 20%' : 'bottom 20%', scrub: 1 } }));
      m.add('(max-width: 767px)', () => gsap.to(svg, { scaleY: 1.2, scrollTrigger: { trigger: svg, start: flip ? 'bottom 95%' : 'top 90%', end: flip ? 'top 15%' : 'bottom 10%', scrub: 0.5, invalidateOnRefresh: true } }));
    });
  }

  /* ---------------------------------------------------------------- Peel sticker [80308] */
  function initStickers() {
    const simple = matchMedia('(pointer: coarse)').matches || /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    $$('.sticker-container').forEach((cont) => {
      const wrap = cont.parentElement;
      if (simple) wrap.classList.add('simple-effects');
      const lights = $$('fePointLight', wrap);
      const img = $('img', cont);
      const boy = img && /st-boy/.test(img.getAttribute('src') || '');
      const triggers = boy ? ['-0% 50%', '50% 50%'] : ['-120% 50%', '30% 50%'];
      if (!simple) {
        const peelDir = parseFloat(getComputedStyle(wrap).getPropertyValue('--peel-direction')) || 0;
        cont.addEventListener('mousemove', (e) => {
          const b = cont.getBoundingClientRect(); const x = e.clientX - b.left, y = e.clientY - b.top;
          if (lights[0]) gsap.set(lights[0], { attr: { x, y } });
          if (lights[1]) Math.abs(peelDir % 360) !== 180 ? gsap.set(lights[1], { attr: { x, y: b.height - y } }) : gsap.set(lights[1], { attr: { x: -1e3, y: -1e3 } });
        });
      }
      cont.addEventListener('touchstart', () => cont.classList.add('touch-active'));
      ['touchend', 'touchcancel'].forEach((ev) => cont.addEventListener(ev, () => cont.classList.remove('touch-active')));
      const t = { peel: 1 };
      gsap.timeline({ scrollTrigger: { trigger: wrap, start: triggers[0], end: triggers[1], scrub: 1 } })
        .to(t, { peel: 0, ease: 'none', onUpdate: () => wrap.style.setProperty('--peel-amount', t.peel) });
    });
  }

  /* ---------------------------------------------------------------- Order Now blob [23057] */
  const BLOB_BASE = 'M310.777 0.20434C424.154 2.91791 540.733 50.9739 574.176 159.34C606.479 264.014 533.962 365.999 442.064 425.623C364.995 475.626 270.863 455.893 193.524 406.309C93.8313 342.395 -27.3608 259.503 5.48889 145.729C40.0621 25.9857 186.179 -2.77783 310.777 0.20434Z';
  const BLOB_SHAPES = [
    'M302 27C437 -2 587 97 559 201C532 308 430 453 288 427C193 410 66 363 41 273C6 146 186 48 302 27Z',
    'M295 50C400 0 593 84 562 172C519 292 399 453 237 418C138 397 61 324 41 233C20 140 184 58 295 50Z',
    'M326 0C491 34 591 147 525 255C452 373 345 468 202 405C131 369 34 297 35 201C37 77 186 -10 326 0Z',
  ];
  function initBlobs() {
    $$('a[data-anm-btn="btn"]').forEach((a) => {
      const path = $('path', a); let tw = null;
      const base = path.getAttribute('d') || BLOB_BASE;
      a.addEventListener('mouseenter', () => {
        const s = BLOB_SHAPES[Math.floor(Math.random() * BLOB_SHAPES.length)];
        tw && tw.kill(); tw = gsap.to(path, { keyframes: [{ morphSVG: { shape: s }, duration: 0.5, ease: 'back.out' }] });
      });
      a.addEventListener('mouseleave', () => { tw && tw.kill(); tw = gsap.to(path, { keyframes: [{ morphSVG: { shape: base }, duration: 0.5, ease: 'back.in' }] }); });
    });
  }

  /* ---------------------------------------------------------------- Inertia throw [83052 / 7234 / 71555] */
  function inertia(el, vel, rot, res) {
    let px = 0, py = 0, vx = 0, vy = 0;
    const base = parseFloat(gsap.getProperty(el, 'rotation')) || 0;
    el.addEventListener('mousemove', (e) => { vx = e.clientX - px; vy = e.clientY - py; px = e.clientX; py = e.clientY; });
    el.addEventListener('mouseenter', (e) => { vx = 0; vy = 0; px = e.clientX; py = e.clientY; });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { inertia: { x: { velocity: vel * vx, end: 0 }, y: { velocity: vel * vy, end: 0 }, rotation: { velocity: rot * vx, end: base }, resistance: res }, force3D: true });
    });
  }

  /* ---------------------------------------------------------------- Home sections */
  function initHero() { // [24814]
    const holder = $('#hero .size-\\[40vw\\] > div');
    if (!holder) return;
    onReady(() => {
      gsap.fromTo(holder, { scale: 0.5, opacity: 0, y: 100, rotate: -5 }, { scale: 1, opacity: 1, y: 0, rotate: 0, duration: 1.5, ease: 'back.out(1.5)', delay: 0.5 });
      gsap.to(holder, { y: '-=15', duration: 2.5, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 1.7 });
    });
  }
  function initTopClassic() { // [83052]
    $$('#about .media-item').forEach((el) => inertia(el, 30, 2, 150));
  }
  function initEyes() { // [79948]
    const eyes = $$('[style*="max-height:4.2vw"], [style*="max-height: 4.2vw"]');
    if (eyes.length < 2) return;
    const s1 = gsap.quickSetter(eyes[0], 'rotation', 'deg'), s2 = gsap.quickSetter(eyes[1], 'rotation', 'deg');
    window.addEventListener('mousemove', (e) => {
      const r = (180 / Math.PI) * Math.atan2(e.clientY - window.innerHeight / 2, e.clientX - window.innerWidth / 2) - 180;
      s1(r); s2(r);
    });
    requestAnimationFrame(() => requestAnimationFrame(() => ScrollTrigger.refresh()));
    const img = eyes[0].closest('.relative.z-10') && eyes[0].closest('.relative.z-10').querySelector('img');
    if (img) img.addEventListener('load', () => ScrollTrigger.refresh());
  }
  function initPureQuality() { // [21588]
    const sec = $('#ingredients');
    if (!sec) return;
    const holders = $$('div[style*="will-change"]', sec).filter((d) => d.querySelector('img'));
    const factors = [-0.07, -0.05, -0.09, -0.06];
    lenisSubs.add(({ scroll }) => {
      const top = sec.offsetTop, h = sec.offsetHeight, i = scroll - top + window.innerHeight;
      if (i > 0 && scroll < top + h) holders.forEach((d, k) => { d.style.transform = `translateY(${i * factors[k]}px)`; });
    });
  }
  function initTakeAwayDesktop() { // [7234]
    const sec = $('#map-desktop');
    if (!sec) return;
    const trig = $('.relative.self', sec);
    const plane = $(':scope > .pointer-events-none.absolute', sec);
    const path = $('svg path', trig);
    const cards = $$(':scope > div.absolute.flex-col', trig);
    cards.forEach((c) => inertia(c, 30, 2, 140));
    cards.forEach((c) => { const p = $('.country-label', c); if (p) inertia(p, 25, 1.5, 170); });
    gsap.context(() => {
      const e = { trigger: trig, start: '-10% top', end: '75%', scrub: 1, invalidateOnRefresh: true };
      const th = [0.14, 0.28, 0.5, 0.68, 0.91];
      cards.forEach((c) => gsap.set(c, { opacity: 0, scale: 0.8, rotate: 0 }));
      const on = cards.map(() => false);
      ScrollTrigger.create({ ...e, onUpdate: (s) => {
        const t = s.progress;
        th.forEach((v, i) => {
          const c = cards[i]; if (!c) return;
          if (t >= v && !on[i]) {
            gsap.fromTo(c, { opacity: 0, scale: 0.8, rotate: -15 + 30 * Math.random() }, { opacity: 1, scale: 1.08, rotate: 5 - 10 * Math.random(), duration: 0.45, ease: 'back.out(2.2)', overwrite: 'auto', force3D: true });
            on[i] = true;
          } else if (t < v && on[i]) {
            gsap.to(c, { opacity: 0, scale: 0.8, rotate: -15 + 30 * Math.random(), duration: 0.28, ease: 'back.in(1.2)', overwrite: 'auto', force3D: true });
            on[i] = false;
          }
        });
      } });
      if (plane && path) {
        gsap.set(plane, { xPercent: -50, yPercent: -50 });
        gsap.to(plane, { motionPath: { path, align: path, alignOrigin: [0.5, 0.5], autoRotate: -90 }, ease: 'none', force3D: true, scrollTrigger: { ...e } });
      }
      setTimeout(() => ScrollTrigger.refresh(), 1e3);
      window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
    }, sec);
  }
  function pathFollowMobile(sec, followerSel) { // [96008] / [65165]
    const cards = $$(':scope .flex.flex-col.items-center.w-fit', sec);
    gsap.context(() => {
      cards.forEach((c) => {
        gsap.set(c, { opacity: 0, scale: 0.8, rotate: 0, y: 50 });
        ScrollTrigger.create({ trigger: c, start: 'top 70%', once: true, onEnter: () => {
          gsap.fromTo(c, { opacity: 0, scale: 0.8, rotate: -15 + 30 * Math.random(), y: 50 }, { opacity: 1, scale: 1.05, rotate: 3 - 6 * Math.random(), y: 0, duration: 0.45, ease: 'back.out(2.2)', overwrite: 'auto' });
        } });
      });
    }, sec);
    const m = $('.flex.flex-col.relative', sec);
    const path = m && $('svg path', m);
    const fol = m ? $$(followerSel, m) : [];
    if (!m || !path || !fol.length) return;
    gsap.context(() => {
      const n = fol.length;
      fol.forEach((f) => gsap.set(f, { xPercent: -50, yPercent: -50, opacity: 0 }));
      const d = gsap.timeline({ scrollTrigger: { trigger: m, start: '-2% center', end: '95% center', scrub: 1 } });
      for (let t = 0; t < n; t++) {
        const i = t * 1;
        d.fromTo(fol[t], { motionPath: { path, align: path, alignOrigin: [0.5, 0.5], autoRotate: true, start: t / n, end: t / n } },
          { motionPath: { path, align: path, alignOrigin: [0.5, 0.5], autoRotate: true, start: t / n, end: (t + 1) / n }, duration: 1, ease: 'none' }, i);
        const fd = 0.2;
        d.fromTo(fol[t], { opacity: 0 }, { opacity: 1, duration: fd, ease: 'power1.inOut' }, i);
        d.to(fol[t], { opacity: 0, duration: fd, ease: 'power1.inOut' }, i + 1 - fd);
      }
    }, m);
  }
  function initSpicesDesktop() { // [71555]
    const sec = $('#storyofEveryBite');
    if (!sec) return;
    const trig = $(':scope > .relative.self', sec);
    const path = $('svg path', trig);
    const fol = $$(':scope > .pointer-events-none.absolute', sec);
    const cards = $$(':scope > div.absolute.flex-col', trig);
    const labels = cards.map((c) => $('.country-label', c)).filter(Boolean);
    cards.forEach((c) => inertia(c, 30, 2, 140));
    labels.forEach((l) => inertia(l, 25, 1.5, 170));
    gsap.context(() => {
      const th = [0, 0.25, 0.5, 0.75, 1];
      cards.forEach((c) => gsap.set(c, { opacity: 0, scale: 0.8, rotate: 0 }));
      const on = cards.map(() => false); let maxP = 0;
      ScrollTrigger.create({ trigger: trig, start: '5% top', end: '95%', onUpdate: (s) => {
        maxP = Math.max(maxP, s.progress);
        th.forEach((v, i) => {
          const c = cards[i];
          if (c && maxP >= v && !on[i]) {
            gsap.fromTo(c, { opacity: 0, scale: 0.8, rotate: -15 + 30 * Math.random() }, { opacity: 1, scale: 1.08, rotate: 5 - 10 * Math.random(), duration: 0.45, ease: 'back.out(2.2)', overwrite: 'auto' });
            on[i] = true;
          }
        });
      } });
    }, sec);
    if (!path || !fol.length) return;
    gsap.context(() => {
      const e = fol.length, h = Array.from({ length: e + 1 }, (t, r) => r / e), d = e * 1;
      fol.forEach((f) => gsap.set(f, { xPercent: -50, yPercent: -50 }));
      const g = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
      for (let t = 0; t < e; t++) {
        g.to(fol[t], { motionPath: { path, align: path, alignOrigin: [0.5, 0.5], autoRotate: true, start: t / e, end: (t + 1) / e }, duration: Math.max((h[t + 1] - h[t]) * d, 1e-6), ease: 'none' }, h[t] * d);
      }
      ScrollTrigger.create({ trigger: trig, start: '5% top', end: '95%', onUpdate: (s) => g.progress(s.progress) });
    }, sec);
  }
  function juggle(scope, imgs, P1, P2, restReduced) { // [97713] footer / [57390] 404
    if (!imgs.length) return;
    const mm = gsap.matchMedia(scope);
    mm.add({ isDesktop: '(min-width: 769px)', isMobile: '(max-width: 768px)', reduceMotion: '(prefers-reduced-motion: reduce)' }, (c) => {
      const { isMobile, reduceMotion } = c.conditions;
      const i = isMobile ? P2 : P1;
      if (i.sizeScale) gsap.set(scope, { '--juggle-scale': i.sizeScale });
      const live = new Set();
      gsap.set(imgs, { xPercent: -50, x: 0, y: `${i.restVH}vh`, rotation: 0, opacity: 0, scale: 0.9, transformOrigin: '50% 50%', force3D: true });
      if (reduceMotion) { restReduced && restReduced(imgs, isMobile); return; }
      const u = (e) => {
        const t = gsap.utils.random(...i.apex), r = Math.random() > 0.5 ? 1 : -1;
        const n = -(gsap.utils.random(...i.driftStart) * r), o = gsap.utils.random(...i.driftEnd) * r;
        const l = gsap.utils.random(...i.upDur), cc = l * gsap.utils.random(...i.gravityRatio), d = l + cc;
        const h = gsap.utils.random(...i.spin) * (Math.random() > 0.5 ? 1 : -1), f = gsap.utils.random(...i.repeatDelay);
        gsap.set(e, { x: `${n}vw`, y: `${i.restVH}vh`, rotation: 0, opacity: 0, scale: 0.9 });
        const p = gsap.timeline({ defaults: { overwrite: 'auto' }, onComplete: () => { live.delete(p); gsap.delayedCall(f, () => u(e)); } });
        live.add(p);
        p.to(e, { opacity: 1, scale: 1, duration: i.fadeIn || 0.18, ease: 'power1.out' }, 0)
          .to(e, { y: `${-t}vh`, duration: l, ease: 'power2.out' }, 0)
          .to(e, { y: `${i.restVH}vh`, duration: cc, ease: 'power2.in' }, l)
          .to(e, { x: `${o}vw`, duration: d, ease: 'sine.inOut' }, 0)
          .to(e, { rotation: h, duration: d, ease: 'none' }, 0)
          .to(e, { opacity: 0, duration: i.fadeOut || 0.25, ease: 'power1.in' }, d - (i.fadeOut || 0.25));
      };
      imgs.forEach((e, t) => gsap.delayedCall(t * i.staggerStart + gsap.utils.random(0, i.jitter || 0.4), () => u(e)));
      const vis = () => (document.hidden ? live.forEach((e) => e.pause()) : live.forEach((e) => e.play()));
      document.addEventListener('visibilitychange', vis);
      return () => { document.removeEventListener('visibilitychange', vis); live.forEach((e) => e.kill()); live.clear(); };
    });
  }
  function initFooter() {
    const f = $('footer');
    if (!f) return;
    const imgs = $$('.pointer-events-none.absolute.inset-x-0 img', f);
    const D = { restVH: 22, apex: [38, 60], driftStart: [2, 7], driftEnd: [8, 24], upDur: [0.9, 1.3], gravityRatio: [1.15, 1.5], spin: [220, 600], repeatDelay: [0.2, 0.9], staggerStart: 0.55, sizeScale: 1 };
    const M = { restVH: 8, apex: [12, 18], driftStart: [1, 3], driftEnd: [5, 10], upDur: [0.7, 0.95], gravityRatio: [1.08, 1.18], spin: [80, 180], repeatDelay: [0.12, 0.38], staggerStart: 0.4, sizeScale: 1.29 };
    const G = [{ y: -14, x: -2, rotation: -10 }, { y: -10, x: 1, rotation: 8 }, { y: -16, x: -1, rotation: -4 }, { y: -12, x: 2, rotation: 12 }];
    const Gm = [{ y: -7, x: -1, rotation: -8 }, { y: -5, x: 1, rotation: 6 }, { y: -8, x: 0, rotation: -3 }, { y: -6, x: 1, rotation: 9 }];
    juggle(f, imgs, D, M, (els, mob) => {
      const e = mob ? Gm : G;
      els.forEach((t, r) => { const n = e[r] || e[e.length - 1]; gsap.fromTo(t, { x: `${n.x}vw`, y: `${0.5 * n.y}vh`, rotation: n.rotation, opacity: 0, scale: 0.85 }, { x: `${n.x}vw`, y: `${n.y}vh`, rotation: n.rotation, opacity: 1, scale: 1, duration: 0.7, delay: 0.12 * r, ease: 'power2.out' }); });
    });
  }
  function init404() { // [57390]
    if (PAGE !== '404') return;
    const sec = $('section');
    const imgs = $$('img[style*="will-change"]', sec);
    const D = { restVH: 18, apex: [40, 70], driftStart: [2, 7], driftEnd: [8, 18], upDur: [0.85, 1.2], gravityRatio: [1.12, 1.45], spin: [220, 520], repeatDelay: [0.2, 0.8], staggerStart: 0.42, fadeIn: 0.16, fadeOut: 0.22, jitter: 0.25 };
    const M = { restVH: 8, apex: [16, 26], driftStart: [1, 3], driftEnd: [5, 10], upDur: [0.65, 0.9], gravityRatio: [1.05, 1.18], spin: [80, 180], repeatDelay: [0.1, 0.35], staggerStart: 0.28, fadeIn: 0.16, fadeOut: 0.22, jitter: 0.25 };
    juggle(sec, imgs, D, M, (els) => els.forEach((e, t) => gsap.to(e, { opacity: 1, scale: 1, duration: 0.35, delay: 0.08 * t, ease: 'power2.out' })));
  }

  /* ---------------------------------------------------------------- Notice modal [87188] */
  function modal(dialog) {
    const backdrop = dialog.previousElementSibling;
    const panel = dialog.firstElementChild;
    const cross = $('.concept-cross-btn', panel);
    let open = false, tl = null;
    gsap.set(backdrop, { opacity: 0, pointerEvents: 'none' });
    gsap.set(panel, { opacity: 0, scale: 0.9, y: 36, transformOrigin: '50% 50%' });
    tl = gsap.timeline({ paused: true, defaults: { overwrite: 'auto' } });
    tl.to(backdrop, { opacity: 1, duration: 0.32, ease: 'power2.out', onStart: () => gsap.set(backdrop, { pointerEvents: 'auto' }) }, 0)
      .to(panel, { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: 'back.out(2.7)' }, 0.13);
    tl.eventCallback('onReverseComplete', () => gsap.set(backdrop, { pointerEvents: 'none' }));
    const set = (v) => {
      open = v;
      panel.style.pointerEvents = v ? 'auto' : 'none';
      backdrop.style.cursor = v ? 'pointer' : 'default';
      $$('button, a', panel).forEach((b) => (v ? b.removeAttribute('tabindex') : b.setAttribute('tabindex', '-1')));
      v ? tl.play(0) : tl.reverse();
      v ? lenis.stop() : lenis.start();
    };
    backdrop.addEventListener('click', () => open && set(false));
    panel.addEventListener('click', (e) => e.stopPropagation());
    $$('button', panel).forEach((b) => b.addEventListener('click', () => set(false)));
    document.addEventListener('keydown', (e) => { if (open && e.key === 'Escape') set(false); });
    if (cross) {
      cross.addEventListener('mouseenter', () => gsap.to(cross, { rotate: 90, scale: 1.24, duration: 0.23, ease: 'power2.out' }));
      cross.addEventListener('mouseleave', () => gsap.to(cross, { rotate: 0, scale: 1, duration: 0.18, ease: 'power1.out' }));
    }
    return { open: () => set(true), close: () => set(false) };
  }
  const dialogs = () => $$('div.fixed[role="dialog"][aria-modal="true"]').filter((d) => d.getAttribute('aria-label') !== 'Page loading');

  /* ---------------------------------------------------------------- Menu page: cards + cart [43072 / 68763] */
  function initMenu() {
    if (PAGE !== 'menu') return;
    const wraps = $$('div.opacity-0.w-full').filter((w) => w.querySelector('[data-item]'));
    wraps.forEach((e, t) => {
      gsap.set(e, { opacity: 0, y: 64 });
      ScrollTrigger.create({ trigger: e, start: 'top 85%', once: true, onEnter: () => gsap.to(e, { opacity: 1, y: 0, duration: 0.72, delay: (t % 3) * 0.1 + 0.05 * Math.floor(t / 3), ease: 'power3.out', overwrite: 'auto' }) });
      const card = e.querySelector('[data-item]');
      const btn = card.querySelector('button');
      btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        window.dispatchEvent(new CustomEvent('dins:add-to-cart', { detail: { item: JSON.parse(card.dataset.item) } }));
        gsap.fromTo(e, { scale: 1 }, { scale: 1.05, duration: 0.2, yoyo: true, repeat: 1, ease: 'back.out(2)' });
      });
    });
    // cart
    const fab = $('button[aria-label="Cart"]');
    if (!fab) return;
    const holder = fab.parentElement; // relative flex
    const toast = holder.children[0];
    const pop = holder.children[1];
    const backdrop = holder.parentElement.previousElementSibling;
    const badge = fab.querySelector('span');
    const [countP, totalP] = $$('.flex.items-center.justify-between > p', pop);
    const msg = pop.querySelector('.mt-\\[\\.6vw\\]');
    const list = pop.querySelector('[data-lenis-prevent]');
    const checkout = $$('button', pop).pop();
    const dlg = dialogs()[0]; const m = dlg ? modal(dlg) : null;
    let items = [], open = false, toastT = 0;
    const toastOn = 'opacity-100 translate-x-0 scale-100', toastOff = 'opacity-0 translate-x-[1vw] scale-90 pointer-events-none';
    const toastBase = toast.className.replace(toastOn, '').replace(toastOff, '').trim();
    let added = false;
    const paintToast = () => { toast.className = toastBase + ' ' + (added && !open ? toastOn : toastOff); };
    gsap.set(backdrop, { opacity: 0, pointerEvents: 'none' });
    gsap.set(pop, { opacity: 0, y: 14, scale: 0.96, transformOrigin: '100% 100%' });
    const tl = gsap.timeline({ paused: true, defaults: { overwrite: 'auto' } });
    tl.add(() => gsap.set(backdrop, { pointerEvents: 'auto' }), 0)
      .to(backdrop, { opacity: 1, duration: 0.22, ease: 'power2.out' }, 0)
      .to(pop, { opacity: 1, y: 0, scale: 1, duration: 0.34, ease: 'back.out(2.1)' }, 0.06);
    tl.eventCallback('onReverseComplete', () => gsap.set(backdrop, { pointerEvents: 'none' }));
    const money = (n) => n.toFixed(2);
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const iconBtn = 'size-[2vw] cursor-pointer max-md:size-[8.5vw] rounded-full bg-black/20 hover:bg-black/35 transition-colors grid place-items-center group active:scale-90 duration-100';
    function render() {
      const n = items.reduce((e, t) => e + t.qty, 0);
      const total = items.reduce((e, t) => e + (Number(String(t.price).replace(/[^0-9.]/g, '')) || 0) * t.qty, 0);
      badge.textContent = n;
      countP.textContent = 'Your cart ' + n;
      totalP.textContent = 'Total: RM' + money(total);
      msg.textContent = n ? 'Your burgers are ready.' : 'Hungry? Add items to start your order.';
      list.innerHTML = items.length ? items.map((e, a) => `<div class="flex items-center justify-between gap-[.8vw] max-md:gap-[3vw] rounded-[1vw] max-md:rounded-[4vw] bg-beige/10 border border-beige/15 px-[1vw] py-[.75vw] max-md:px-[4vw] max-md:py-[2.6vw]" style="z-index:${20 - a}"><div class="min-w-0"><p class="font-mouse-memoirs uppercase text-[1vw] max-md:text-[3.9vw] text-beige leading-tight truncate">${esc(e.name)}</p><p class="font-mouse-memoirs uppercase text-[.85vw] max-md:text-[3.4vw] text-beige/70 tracking-wide">${esc(e.price)} · Qty ${e.qty}</p></div><div class="shrink-0 flex items-center gap-[.45vw] max-md:gap-[2vw]"><button data-cursor-hide="true" type="button" class="${iconBtn}" data-dec="${esc(e.key)}" aria-label="Decrease ${esc(e.name)}"><svg viewBox="0 0 24 24" class="w-[55%] h-[55%]" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 12h12"></path></svg></button><button data-cursor-hide="true" type="button" class="${iconBtn}" data-rm="${esc(e.key)}" aria-label="Remove ${esc(e.name)}"><svg viewBox="0 0 24 24" class="w-[55%] h-[55%]" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6"></path><path d="M4 6h16"></path><path d="M7 6l1 14h8l1-14"></path></svg></button></div></div>`).join('')
        : '<div class="rounded-[1vw] max-md:rounded-[4vw] bg-beige/10 border border-beige/15 px-[1vw] py-[.9vw] max-md:px-[4vw] max-md:py-[3.2vw]"><p class="font-mouse-memoirs uppercase text-[.95vw] max-md:text-[3.8vw] text-beige/80 tracking-wide">No items yet</p></div>';
      checkout.disabled = !n;
    }
    list.addEventListener('click', (ev) => {
      const b = ev.target.closest('button'); if (!b) return;
      ev.stopPropagation();
      b.classList.add('scale-90'); setTimeout(() => b.classList.remove('scale-90'), 120);
      const k = b.dataset.dec || b.dataset.rm;
      const i = items.findIndex((e) => e.key === k); if (i < 0) return;
      if (b.dataset.rm || items[i].qty <= 1) items = items.filter((e) => e.key !== k); else items[i] = { ...items[i], qty: items[i].qty - 1 };
      render();
    });
    window.addEventListener('dins:add-to-cart', (ev) => {
      const t = ev.detail && ev.detail.item; const name = (t && t.name) || 'Item'; const price = (t && t.price) || '';
      const i = items.findIndex((e) => e.key === name);
      if (i >= 0) items[i] = { ...items[i], qty: items[i].qty + 1 }; else items.push({ key: name, name, price, qty: 1 });
      render(); added = true; paintToast(); clearTimeout(toastT); toastT = setTimeout(() => { added = false; paintToast(); }, 2e3);
    });
    const setOpen = (v) => {
      open = v; fab.setAttribute('aria-expanded', v);
      pop.style.pointerEvents = v ? 'auto' : 'none'; pop.style.visibility = v ? 'visible' : 'hidden';
      if (v) pop.style.visibility = 'visible';
      v ? tl.play() : tl.reverse();
      v ? lenis.stop() : lenis.start();
      paintToast();
    };
    tl.eventCallback('onReverseComplete', () => { gsap.set(backdrop, { pointerEvents: 'none' }); if (!open) pop.style.visibility = 'hidden'; });
    fab.addEventListener('click', (e) => { e.stopPropagation(); setOpen(!open); });
    backdrop.addEventListener('click', () => open && setOpen(false));
    pop.addEventListener('click', (e) => e.stopPropagation());
    checkout.addEventListener('click', () => { setOpen(false); m && m.open(); });
    render(); paintToast();
  }

  /* ---------------------------------------------------------------- Contact form [88720] */
  function initContact() {
    if (PAGE !== 'contact') return;
    const form = $('#contact-form form');
    if (!form) return;
    const dlg = dialogs()[0];
    if (dlg) { // lift the pop-up (and its backdrop) out of the section to page level, after the nav
      const host = $('nav.fixed').parentElement, bd = dlg.previousElementSibling;
      host.appendChild(bd); host.appendChild(dlg);
    }
    const m = dlg ? modal(dlg) : null;
    const email = $('input[name=email]', form), msgEl = $('textarea[name=message]', form);
    const submit = $('button[type=submit]', form);
    const errCls = 'absolute left-0 -bottom-[1.2vw] max-md:-bottom-[5vw] text-[0.8vw] max-md:text-[3vw] font-mouse-memoirs text-mustard uppercase tracking-wider animate-in fade-in slide-in-from-top-1';
    const setErr = (field, text) => {
      const box = field.parentElement; let p = box.querySelector('p');
      field.classList.toggle('border-mustard', !!text);
      field.classList.toggle('border-white/20', !text); field.classList.toggle('focus:border-mustard', !text);
      if (!text) { p && p.remove(); return; }
      if (!p) { p = document.createElement('p'); p.className = errCls; box.appendChild(p); }
      p.textContent = text;
    };
    [email, msgEl].forEach((f) => f.addEventListener('input', () => setErr(f, '')));
    const label = (t) => { $$('span.block', submit).forEach((s) => { s.textContent = ' ' + t; }); };
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const a = {};
      const ev = email.value.trim(), mv = msgEl.value.trim();
      if (ev) { if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ev)) a.email = 'THAT EMAIL LOOKS A BIT OFF...'; } else a.email = 'WHERE SHOULD WE SEND THE REPLY?';
      if (mv) { if (mv.length < 10) a.message = 'COULD USE A LITTLE MORE DETAIL...'; } else a.message = 'FORGOT TO WRITE SOMETHING?';
      setErr(email, a.email || ''); setErr(msgEl, a.message || '');
      if (Object.keys(a).length) { gsap.to(form, { x: [-10, 10, -10, 10, 0], duration: 0.4, ease: 'power2.inOut' }); return; }
      submit.disabled = true; label('SENDING...');
      setTimeout(() => { m && m.open(); email.value = ''; msgEl.value = ''; setTimeout(() => { submit.disabled = false; label('SEND MESSAGE'); }, 1e3); }, 1500);
    });
  }

  /* ---------------------------------------------------------------- boot */
  function boot() {
    html.classList.add('dins-js');
    const fromNav = store.get('dins:nav', sessionStorage) === '1';
    store.del('dins:nav', sessionStorage);
    if (fromNav && tr) {
      const ld = $('[aria-label="Page loading"]'); if (ld) ld.remove();
      state.loader = true; state.transition = false; firstLoad = false;
      updateTitle();
      enter();
    } else {
      runLoader();
    }
    initNav(); initCookie(); initCursor();
    initPop(); initLines(); initRules(); initJelly(); initStickers(); initBlobs();
    initHero(); initTopClassic(); initEyes(); initPureQuality(); initTakeAwayDesktop();
    const mm = $('#map-mobile'); if (mm) pathFollowMobile(mm, '.pointer-events-none.absolute.left-0.top-0');
    initSpicesDesktop();
    const sm = $('#storyofEveryBiteMobile'); if (sm) pathFollowMobile(sm, '.pointer-events-none.absolute.left-0.top-0');
    initFooter(); init404(); initMenu(); initContact();
    if (PAGE !== 'menu' && PAGE !== 'contact') dialogs().forEach(modal);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
