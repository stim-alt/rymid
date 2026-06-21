/* ============================================================
   Hóplistmeðferð — app.js
   Reveal-on-scroll · animated charts · Tweaks panel (vanilla)
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Tweak defaults (persisted by host) ----------- */
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "direction": "b",
    "accent": "#88cc3f",
    "headingFont": "Hanken Grotesk",
    "width": "auto"
  }/*EDITMODE-END*/;

  /* room-inspired accents: lime green, golden, raspberry, sky blue */
  const ACCENT_DEEP = {
    '#88cc3f': '#3f8f2c',
    '#c08a2c': '#92651a',
    '#c14a5e': '#97394a',
    '#4f8bb8': '#356b94'
  };

  const state = Object.assign({}, TWEAK_DEFAULTS);

  // 'auto' picks wide on roomy screens, narrow on phones/tablets
  const WIDE_MIN = 1000;
  function resolveWidth() {
    if (state.width === 'wide') return 'wide';
    if (state.width === 'narrow') return 'narrow';
    return window.innerWidth >= WIDE_MIN ? 'wide' : 'narrow';
  }

  function applyTweaks() {
    const root = document.documentElement;
    document.body.setAttribute('data-dir', state.direction);
    document.body.setAttribute('data-width', resolveWidth());
    const accent = state.accent || '#88cc3f';
    root.style.setProperty('--accent', accent);
    root.style.setProperty('--accent-deep', ACCENT_DEEP[accent] || accent);
    root.style.setProperty('--font-head', `'${state.headingFont}', system-ui, sans-serif`);
  }
  applyTweaks();

  // Re-evaluate automatic width when the viewport changes
  let _rt;
  window.addEventListener('resize', () => {
    if (state.width !== 'auto') return;
    clearTimeout(_rt);
    _rt = setTimeout(() => document.body.setAttribute('data-width', resolveWidth()), 120);
  });

  /* ---------- Reveal on scroll ----------------------------- */
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function setupReveal() {
    const targets = document.querySelectorAll(
      '.section .grid-2 > div, .card, .fact, .quote, .stat-row > div, .pull blockquote, .pull cite, .ph, .closing, .ref'
    );
    targets.forEach((el) => el.classList.add('reveal'));
    if (reduce || !('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    targets.forEach((el) => io.observe(el));
  }

  /* ---------- Animated charts ------------------------------ */
  function setupCharts() {
    const fills = document.querySelectorAll('.bar__fill');
    const donuts = document.querySelectorAll('.donut');
    const animate = (el) => {
      if (el.classList.contains('bar__fill')) {
        el.style.width = el.dataset.w + '%';
      } else {
        el.style.setProperty('--p', el.dataset.p);
      }
    };
    if (reduce || !('IntersectionObserver' in window)) {
      fills.forEach(animate); donuts.forEach(animate); return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    fills.forEach((el) => io.observe(el));
    donuts.forEach((el) => io.observe(el));
  }

  /* ---------- Smooth anchor nav ---------------------------- */
  document.querySelectorAll('.nav__links a').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const el = document.querySelector(id);
      if (el) { e.preventDefault(); el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }
    });
  });

  /* ============================================================
     TWEAKS PANEL (vanilla — host protocol)
     ============================================================ */
  const PANEL_CSS = `
    .twkx{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:262px;
      background:rgba(248,249,246,.82);color:#25333a;border:.5px solid rgba(255,255,255,.7);
      border-radius:14px;box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 14px 44px rgba(20,30,35,.22);
      -webkit-backdrop-filter:blur(22px) saturate(160%);backdrop-filter:blur(22px) saturate(160%);
      font-family:'Hanken Grotesk',system-ui,sans-serif;font-size:12px;overflow:hidden;display:none}
    .twkx.open{display:block}
    .twkx__hd{display:flex;align-items:center;justify-content:space-between;padding:11px 9px 11px 14px;cursor:move;user-select:none}
    .twkx__hd b{font-size:12.5px;font-weight:650;letter-spacing:.01em}
    .twkx__x{appearance:none;border:0;background:transparent;color:rgba(37,51,58,.5);width:22px;height:22px;border-radius:6px;cursor:pointer;font-size:13px;line-height:1}
    .twkx__x:hover{background:rgba(0,0,0,.06);color:#25333a}
    .twkx__body{padding:2px 14px 15px;display:flex;flex-direction:column;gap:13px}
    .twkx__sect{font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:rgba(37,51,58,.42);margin-top:3px}
    .twkx__lbl{font-weight:600;color:rgba(37,51,58,.78);margin-bottom:7px}
    .twkx__lbl small{font-weight:500;color:rgba(37,51,58,.45);display:block;margin-top:1px}
    .twkx__seg{display:flex;gap:4px;background:rgba(37,51,58,.07);padding:3px;border-radius:9px}
    .twkx__seg button{flex:1;border:0;background:transparent;color:rgba(37,51,58,.66);font:inherit;font-weight:600;padding:7px 4px;border-radius:7px;cursor:pointer;transition:background .15s,color .15s}
    .twkx__seg button[aria-pressed="true"]{background:#fff;color:#25333a;box-shadow:0 1px 2px rgba(0,0,0,.12)}
    .twkx__chips{display:flex;gap:8px}
    .twkx__chip{flex:1;height:34px;border:0;border-radius:8px;cursor:pointer;position:relative;box-shadow:0 0 0 .5px rgba(0,0,0,.14),0 1px 2px rgba(0,0,0,.08);transition:transform .12s}
    .twkx__chip:hover{transform:translateY(-1px)}
    .twkx__chip[aria-pressed="true"]{box-shadow:0 0 0 2px #25333a,0 2px 6px rgba(0,0,0,.18)}
    .twkx__chip::after{content:"";position:absolute;inset:0;display:none;background:no-repeat center/14px url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 14 14'><path d='M3 7.2 5.8 10 11 4.2' fill='none' stroke='white' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'/></svg>")}
    .twkx__chip[aria-pressed="true"]::after{display:block}
  `;

  const DIRS = [
    { v: 'a', label: 'Hlýtt' },
    { v: 'b', label: 'Ritrænt' },
    { v: 'c', label: 'Rólegt' }
  ];
  const ACCENTS = ['#88cc3f', '#c08a2c', '#c14a5e', '#4f8bb8'];
  const FONTS = [
    { v: 'Schibsted Grotesk', label: 'Schibsted' },
    { v: 'Hanken Grotesk', label: 'Hanken' }
  ];
  const WIDTHS = [
    { v: 'auto', label: 'Sjálfvirkt' },
    { v: 'narrow', label: 'Þröngt' },
    { v: 'wide', label: 'Breitt' }
  ];

  let panelEl = null, isOpen = false;

  function persist(edits) {
    Object.assign(state, edits);
    applyTweaks();
    try { window.parent.postMessage({ type: '__edit_mode_set_keys', edits }, '*'); } catch (e) {}
  }

  function seg(parent, label, sub, options, current, onPick) {
    const wrap = document.createElement('div');
    const lbl = document.createElement('div');
    lbl.className = 'twkx__lbl';
    lbl.innerHTML = label + (sub ? `<small>${sub}</small>` : '');
    const seg = document.createElement('div');
    seg.className = 'twkx__seg';
    options.forEach((o) => {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = o.label;
      b.setAttribute('aria-pressed', String(o.v === current()));
      b.addEventListener('click', () => {
        onPick(o.v);
        seg.querySelectorAll('button').forEach((x, i) => x.setAttribute('aria-pressed', String(options[i].v === current())));
      });
      seg.appendChild(b);
    });
    wrap.appendChild(lbl); wrap.appendChild(seg); parent.appendChild(wrap);
  }

  function buildPanel() {
    const style = document.createElement('style');
    style.textContent = PANEL_CSS;
    document.head.appendChild(style);

    panelEl = document.createElement('div');
    panelEl.className = 'twkx';
    panelEl.setAttribute('data-omelette-chrome', '');

    const hd = document.createElement('div');
    hd.className = 'twkx__hd';
    hd.innerHTML = '<b>Tweaks</b>';
    const x = document.createElement('button');
    x.className = 'twkx__x'; x.textContent = '✕'; x.setAttribute('aria-label', 'Loka');
    x.addEventListener('click', dismiss);
    x.addEventListener('mousedown', (e) => e.stopPropagation());
    hd.appendChild(x);
    panelEl.appendChild(hd);

    const body = document.createElement('div');
    body.className = 'twkx__body';

    const s1 = document.createElement('div'); s1.className = 'twkx__sect'; s1.textContent = 'Hönnunarstefna';
    body.appendChild(s1);
    seg(body, 'Stefna', 'Heildarsvipur síðunnar', DIRS, () => state.direction, (v) => persist({ direction: v }));

    const s2 = document.createElement('div'); s2.className = 'twkx__sect'; s2.textContent = 'Útlit';
    body.appendChild(s2);

    // accent chips
    const aw = document.createElement('div');
    const al = document.createElement('div'); al.className = 'twkx__lbl'; al.innerHTML = 'Áherslulitur';
    const chips = document.createElement('div'); chips.className = 'twkx__chips';
    ACCENTS.forEach((c) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'twkx__chip'; b.style.background = c;
      b.setAttribute('aria-pressed', String(c === state.accent));
      b.addEventListener('click', () => {
        persist({ accent: c });
        chips.querySelectorAll('.twkx__chip').forEach((x, i) => x.setAttribute('aria-pressed', String(ACCENTS[i] === state.accent)));
      });
      chips.appendChild(b);
    });
    aw.appendChild(al); aw.appendChild(chips); body.appendChild(aw);

    seg(body, 'Fyrirsagnaletur', null, FONTS, () => state.headingFont, (v) => persist({ headingFont: v }));
    seg(body, 'Textabreidd', 'Sjálfvirkt velur eftir skjástærð', WIDTHS, () => state.width, (v) => persist({ width: v }));

    panelEl.appendChild(body);
    document.body.appendChild(panelEl);
    makeDraggable(panelEl, hd);
  }

  function makeDraggable(panel, handle) {
    handle.addEventListener('mousedown', (e) => {
      const r = panel.getBoundingClientRect();
      const sx = e.clientX, sy = e.clientY;
      const startRight = window.innerWidth - r.right, startBottom = window.innerHeight - r.bottom;
      const move = (ev) => {
        panel.style.right = Math.max(8, startRight - (ev.clientX - sx)) + 'px';
        panel.style.bottom = Math.max(8, startBottom - (ev.clientY - sy)) + 'px';
      };
      const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
      window.addEventListener('mousemove', move); window.addEventListener('mouseup', up);
    });
  }

  function openPanel() { if (!panelEl) buildPanel(); isOpen = true; panelEl.classList.add('open'); }
  function closePanel() { if (panelEl) panelEl.classList.remove('open'); isOpen = false; }
  function dismiss() { closePanel(); try { window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*'); } catch (e) {} }

  window.addEventListener('message', (e) => {
    const t = e && e.data && e.data.type;
    if (t === '__activate_edit_mode') openPanel();
    else if (t === '__deactivate_edit_mode') closePanel();
  });
  try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch (e) {}

  /* ---------- Boot ----------------------------------------- */
  function boot() { setupReveal(); setupCharts(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
