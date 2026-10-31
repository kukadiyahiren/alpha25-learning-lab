const API_ORIGIN = 'https://alpha25-learning-lab-1.onrender.com';

const NAV_PRIMARY = [
  ['Home', '../index.html'],
  ['Classes', 'classes.html'],
  ['Audio', 'audio.html'],
  ['Worksheets', 'worksheets.html'],
  ['GK', 'gk.html'],
  ['Spoken English', 'spoken-english.html'],
  ['Phonics', 'phonics.html'],
  ['Games', 'games.html'],
  ['Drawing', 'drawing.html'],
  ['eBooks', 'ebooks.html']
];

const NAV_ICONS = [
  ['About', 'about.html', 'about', 'About us'],
  ['Contact', 'contact.html', 'contact', 'Contact us']
];

const NAV_LINKS = [...NAV_PRIMARY, ...NAV_ICONS.map(([label, href]) => [label, href])];

function currentPage() {
  return location.pathname.split('/').pop() || 'index.html';
}

function homeHref(base = '') {
  return base === 'root' ? 'index.html' : '../index.html';
}

function logoMarkup(base = '') {
  return `
    <a class="site-logo" href="${homeHref(base)}" aria-label="Alpha 25 Learning Lab home">
      <span class="logo-mark" aria-hidden="true">
        <svg viewBox="0 0 64 64" width="44" height="44">
          <defs>
            <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#00a896"/>
              <stop offset="55%" stop-color="#1f7aec"/>
              <stop offset="100%" stop-color="#ff6b4a"/>
            </linearGradient>
          </defs>
          <rect class="logo-plate" x="4" y="4" width="56" height="56" rx="16" fill="url(#logoGrad)"/>
          <circle class="logo-sun" cx="46" cy="18" r="8" fill="#ffb703"/>
          <path class="logo-book" d="M16 42 V20 c8-4 14-4 22 0 v22 c-8-4 -14-4 -22 0 z" fill="#fff" fill-opacity="0.95"/>
          <path d="M27 22 v18" stroke="#00a896" stroke-width="2.4" stroke-linecap="round"/>
          <text class="logo-25" x="32" y="50" text-anchor="middle" font-size="13" font-weight="800" fill="#043447" font-family="Nunito, Segoe UI, sans-serif">25</text>
        </svg>
      </span>
      <span class="logo-text">
        <strong>Alpha 25</strong>
        <small>Learning Lab</small>
      </span>
    </a>
  `;
}

function resolveHref(href, base = '') {
  if (base === 'root') {
    if (href === '../index.html') return 'index.html';
    if (!href.startsWith('http')) return 'pages/' + href;
  }
  return href;
}

function navIconSvg(kind) {
  if (kind === 'about') {
    return `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 10.5v5.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="7.5" r="1.2" fill="currentColor"/></svg>`;
  }
  return `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4.5 6.5h15v11h-15z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M5 7l7 5.5L19 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

function navLink(label, href, base = '', extraClass = '') {
  const url = resolveHref(href, base);
  const file = url.split('/').pop();
  const active = file === currentPage() ? ' active' : '';
  return `<a class="nav-link${active}${extraClass ? ` ${extraClass}` : ''}" href="${url}">${label}</a>`;
}

function iconNavLink(label, href, kind, title, base = '', extraClass = '') {
  const url = resolveHref(href, base);
  const file = url.split('/').pop();
  const active = file === currentPage() ? ' active' : '';
  return `<a class="nav-icon-link${active}${extraClass ? ` ${extraClass}` : ''}" href="${url}" title="${title}" aria-label="${title}">${navIconSvg(kind)}<span class="nav-icon-label">${label}</span></a>`;
}

function buildNav(base = '') {
  const primary = NAV_PRIMARY.map(([label, href]) => navLink(label, href, base)).join('');
  const icons = NAV_ICONS.map(([label, href, kind, title]) => iconNavLink(label, href, kind, title, base)).join('');
  const drawer = [
    ...NAV_PRIMARY.map(([label, href]) => navLink(label, href, base, 'nav-drawer-link')),
    ...NAV_ICONS.map(([label, href, kind, title]) => iconNavLink(label, href, kind, title, base, 'nav-drawer-link'))
  ].join('');

  return `
    <div class="nav-inner">
      ${logoMarkup(base)}
      <nav class="nav-links" aria-label="Main">
        ${primary}
        <div class="nav-icons" aria-label="About and contact">${icons}</div>
      </nav>
      <button type="button" class="nav-toggle" aria-label="Open menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
    <div class="nav-drawer" hidden>
      <div class="nav-drawer-links">${drawer}</div>
    </div>
  `;
}

function syncNavOffset() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const height = `${nav.offsetHeight}px`;
  document.body.style.paddingTop = height;
  document.documentElement.style.setProperty('--nav-h', height);
}

function wireNavInteractions(nav) {
  if (nav._navAbort) nav._navAbort.abort();
  nav._navAbort = new AbortController();
  const { signal } = nav._navAbort;
  const toggle = nav.querySelector('.nav-toggle');
  const drawer = nav.querySelector('.nav-drawer');

  toggle?.addEventListener('click', () => {
    const open = drawer.hasAttribute('hidden');
    if (open) drawer.removeAttribute('hidden');
    else drawer.setAttribute('hidden', '');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('nav-open', open);
    syncNavOffset();
  }, { signal });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 980 && drawer && !drawer.hasAttribute('hidden')) {
      drawer.setAttribute('hidden', '');
      toggle?.classList.remove('open');
      toggle?.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
    }
    syncNavOffset();
  }, { signal });
}

function ensurePlayfulBackground() {
  if (document.querySelector('.bg-fun')) return;
  const layer = document.createElement('div');
  layer.className = 'bg-fun';
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = `
    <span class="bg-orb bg-orb-1"></span>
    <span class="bg-orb bg-orb-2"></span>
    <span class="bg-orb bg-orb-3"></span>
    <span class="bg-orb bg-orb-4"></span>
    <span class="bg-orb bg-orb-5"></span>
  `;
  document.body.prepend(layer);
}

function canUseCursorFun() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (window.matchMedia('(pointer: coarse)').matches) return false;
  return true;
}

function ensureCursorFun() {
  if (!canUseCursorFun()) return;
  let layer = document.querySelector('.cursor-fun');
  if (!layer) {
    layer = document.createElement('div');
    layer.className = 'cursor-fun';
    layer.setAttribute('aria-hidden', 'true');
    layer.innerHTML = `<span class="cursor-ring"></span><span class="cursor-dot"></span>`;
    document.body.appendChild(layer);
  }

  if (window.__cursorFunBound) return;
  window.__cursorFunBound = true;

  const colors = ['#0d9488', '#2563eb', '#ff6b4a', '#ffb703', '#ec4899', '#8b5cf6'];
  let lastTrail = 0;

  const getParts = () => {
    const root = document.querySelector('.cursor-fun');
    return {
      layer: root,
      ring: root?.querySelector('.cursor-ring'),
      dot: root?.querySelector('.cursor-dot'),
    };
  };

  const moveRing = (x, y) => {
    const { ring, dot } = getParts();
    if (!ring || !dot) return;
    ring.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  const spawnSpark = (x, y, options = {}) => {
    const { layer: root } = getParts();
    if (!root) return;
    const spark = document.createElement('span');
    const kind = options.kind || 'dot';
    const color = colors[Math.floor(Math.random() * colors.length)];
    const angle = options.angle ?? Math.random() * Math.PI * 2;
    const distance = options.distance ?? (18 + Math.random() * 42);
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    spark.className = `cursor-spark${kind === 'star' ? ' is-star' : ''}${kind === 'heart' ? ' is-heart' : ''}`;
    spark.style.background = kind === 'heart' ? 'transparent' : color;
    spark.style.boxShadow = kind === 'heart' ? 'none' : `0 0 10px ${color}`;
    spark.style.setProperty('--sx', `${x}px`);
    spark.style.setProperty('--sy', `${y}px`);
    spark.style.setProperty('--dx', `${dx}px`);
    spark.style.setProperty('--dy', `${dy}px`);
    root.appendChild(spark);
    window.setTimeout(() => spark.remove(), 750);
  };

  const spawnTrail = (x, y) => {
    const now = performance.now();
    if (now - lastTrail < 28) return;
    lastTrail = now;
    spawnSpark(x, y, {
      kind: Math.random() > 0.82 ? 'star' : 'dot',
      angle: Math.random() * Math.PI * 2,
      distance: 8 + Math.random() * 16
    });
  };

  const burst = (x, y) => {
    for (let i = 0; i < 12; i += 1) {
      const kind = i % 5 === 0 ? 'heart' : (i % 3 === 0 ? 'star' : 'dot');
      spawnSpark(x, y, {
        kind,
        angle: (Math.PI * 2 * i) / 12 + Math.random() * 0.25,
        distance: 28 + Math.random() * 48
      });
    }
  };

  const skipTarget = (target) => {
    if (!(target instanceof Element)) return false;
    return Boolean(target.closest('canvas, input, textarea, select, [contenteditable="true"]'));
  };

  document.addEventListener('mousemove', (event) => {
    moveRing(event.clientX, event.clientY);
    if (!skipTarget(event.target)) spawnTrail(event.clientX, event.clientY);
  }, { passive: true });

  document.addEventListener('mousedown', (event) => {
    getParts().ring?.classList.add('is-press');
    if (!skipTarget(event.target)) burst(event.clientX, event.clientY);
  });

  document.addEventListener('mouseup', () => {
    getParts().ring?.classList.remove('is-press');
  });

  document.addEventListener('mouseleave', () => {
    moveRing(-100, -100);
  });
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isSmoothNavLink(anchor) {
  if (!(anchor instanceof HTMLAnchorElement)) return false;
  if (anchor.target && anchor.target !== '_self') return false;
  if (anchor.hasAttribute('download')) return false;
  const href = anchor.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
    return false;
  }
  let url;
  try {
    url = new URL(anchor.href, location.href);
  } catch {
    return false;
  }
  if (url.origin !== location.origin) return false;
  if (url.pathname === location.pathname && url.search === location.search) return false;
  return true;
}

function syncPageStyles(doc, pageUrl) {
  const nextHrefs = [...doc.querySelectorAll('link[rel="stylesheet"]')].map((link) => (
    new URL(link.getAttribute('href'), pageUrl).href
  ));
  const nextSet = new Set(nextHrefs);
  [...document.head.querySelectorAll('link[rel="stylesheet"]')].forEach((link) => {
    if (!nextSet.has(link.href)) link.remove();
  });
  nextHrefs.forEach((href) => {
    if ([...document.head.querySelectorAll('link[rel="stylesheet"]')].some((link) => link.href === href)) return;
    const el = document.createElement('link');
    el.rel = 'stylesheet';
    el.href = href;
    document.head.appendChild(el);
  });
}

function bootPage() {
  document.body.classList.remove('nav-open', 'is-navigating');
  document.documentElement.classList.remove('soft-leaving', 'soft-entering');
  ensurePlayfulBackground();
  ensureCursorFun();
  const nav = document.getElementById('nav');
  if (!nav) return;
  const isRoot = !location.pathname.includes('/pages/');
  nav.innerHTML = buildNav(isRoot ? 'root' : '');
  wireNavInteractions(nav);
  syncNavOffset();
}

function isPersistentNode(node) {
  if (!(node instanceof Element)) return false;
  return node.classList.contains('bg-fun')
    || node.classList.contains('cursor-fun')
    || node.classList.contains('page-veil')
    || node.classList.contains('kids-loader');
}

function markSoftPageRoots() {
  [...document.body.children].forEach((child) => {
    if (isPersistentNode(child)) {
      child.classList.remove('soft-page-root');
      return;
    }
    child.classList.add('soft-page-root');
  });
}

function swapPageBody(doc) {
  const keep = [...document.body.children].filter((child) => isPersistentNode(child));
  const nextNodes = [];
  const nextScripts = [];

  [...doc.body.childNodes].forEach((node) => {
    if (node.nodeName === 'SCRIPT') {
      const src = node.getAttribute?.('src') || '';
      if (src.includes('app.js')) return;
      nextScripts.push(node);
      return;
    }
    nextNodes.push(document.importNode(node, true));
  });

  [...document.body.children].forEach((child) => {
    if (!isPersistentNode(child)) child.remove();
  });

  nextNodes.forEach((node) => document.body.appendChild(node));
  keep.forEach((node) => document.body.appendChild(node));

  nextScripts.forEach((oldScript) => {
    const script = document.createElement('script');
    [...(oldScript.attributes || [])].forEach((attr) => script.setAttribute(attr.name, attr.value));
    const src = oldScript.getAttribute?.('src') || '';
    if (!src) script.textContent = oldScript.textContent || '';
    document.body.appendChild(script);
  });

  markSoftPageRoots();
}

let softNavigating = false;

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function softNavigate(url, { push = true } = {}) {
  if (softNavigating) return;
  softNavigating = true;
  document.body.classList.add('is-navigating');
  markSoftPageRoots();
  showKidsLoader('Opening a fun page…');

  const pageUrl = new URL(url, location.href).href;
  const useViewTransition = typeof document.startViewTransition === 'function' && !prefersReducedMotion();

  try {
    const response = await fetch(pageUrl, { headers: { Accept: 'text/html' } });
    if (!response.ok) throw new Error('Could not open page');
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');

    const apply = () => {
      document.title = doc.title || document.title;
      syncPageStyles(doc, pageUrl);
      document.body.className = doc.body.className || '';
      swapPageBody(doc);
      if (push) history.pushState({ soft: true }, '', pageUrl);
      bootPage();
      markSoftPageRoots();
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    };

    if (useViewTransition) {
      await document.startViewTransition(apply).finished.catch(() => {});
    } else if (prefersReducedMotion()) {
      apply();
    } else {
      document.documentElement.classList.add('soft-leaving');
      await wait(200);
      apply();
      document.documentElement.classList.remove('soft-leaving');
      document.documentElement.classList.add('soft-entering');
      await wait(380);
      document.documentElement.classList.remove('soft-entering');
    }
  } catch {
    location.href = pageUrl;
  } finally {
    hideKidsLoader();
    softNavigating = false;
    document.body.classList.remove('is-navigating');
    document.documentElement.classList.remove('soft-leaving', 'soft-entering');
  }
}

function wireSmoothPageTransitions() {
  if (window.__smoothNavBound) return;
  window.__smoothNavBound = true;

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = event.target.closest('a[href]');
    if (!isSmoothNavLink(anchor)) return;
    event.preventDefault();
    softNavigate(anchor.href);
  });

  document.addEventListener('pointerdown', (event) => {
    const anchor = event.target.closest('a[href]');
    if (!isSmoothNavLink(anchor)) return;
    const href = anchor.href;
    if ([...document.head.querySelectorAll('link[rel="prefetch"]')].some((item) => item.href === href)) return;
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    link.as = 'document';
    document.head.appendChild(link);
  }, { passive: true });

  window.addEventListener('popstate', () => {
    softNavigate(location.href, { push: false });
  });

  if (!history.state || !history.state.soft) {
    history.replaceState({ soft: true }, '', location.href);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  bootPage();
  markSoftPageRoots();
  wireSmoothPageTransitions();
});

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
}

const LOADER_MESSAGES = [
  'Getting colorful lessons ready…',
  'Packing books and stars…',
  'Almost there, little explorer…',
  'Mixing learning magic…',
  'Opening fun activities…',
];

let kidsLoaderCount = 0;
let kidsLoaderTimer = null;
let kidsLoaderMsgTimer = null;

function ensureKidsLoader() {
  let loader = document.querySelector('.kids-loader');
  if (loader) return loader;
  loader = document.createElement('div');
  loader.className = 'kids-loader';
  loader.setAttribute('aria-live', 'polite');
  loader.setAttribute('aria-busy', 'true');
  loader.innerHTML = `
    <div class="kids-loader-card">
      <div class="kids-loader-orbit" aria-hidden="true">
        <span class="kids-loader-bubble">⭐</span>
        <span class="kids-loader-bubble">📚</span>
        <span class="kids-loader-bubble">🎨</span>
        <span class="kids-loader-bubble">🎵</span>
        <div class="kids-loader-core">25</div>
      </div>
      <p class="kids-loader-title">Alpha 25</p>
      <p class="kids-loader-text">Loading…</p>
      <div class="kids-loader-dots" aria-hidden="true"><span></span><span></span><span></span></div>
    </div>
  `;
  document.body.appendChild(loader);
  return loader;
}

function setKidsLoaderMessage(message) {
  const text = ensureKidsLoader().querySelector('.kids-loader-text');
  if (text) text.textContent = message || LOADER_MESSAGES[0];
}

function showKidsLoader(message) {
  const loader = ensureKidsLoader();
  kidsLoaderCount += 1;
  setKidsLoaderMessage(message || LOADER_MESSAGES[Math.floor(Math.random() * LOADER_MESSAGES.length)]);
  loader.classList.add('show');
  loader.setAttribute('aria-busy', 'true');

  if (kidsLoaderMsgTimer) window.clearInterval(kidsLoaderMsgTimer);
  kidsLoaderMsgTimer = window.setInterval(() => {
    setKidsLoaderMessage(LOADER_MESSAGES[Math.floor(Math.random() * LOADER_MESSAGES.length)]);
  }, 1600);
}

function hideKidsLoader(force = false) {
  kidsLoaderCount = force ? 0 : Math.max(0, kidsLoaderCount - 1);
  if (kidsLoaderCount > 0) return;
  const loader = document.querySelector('.kids-loader');
  if (!loader) return;
  loader.classList.remove('show');
  loader.setAttribute('aria-busy', 'false');
  if (kidsLoaderMsgTimer) {
    window.clearInterval(kidsLoaderMsgTimer);
    kidsLoaderMsgTimer = null;
  }
  if (kidsLoaderTimer) window.clearTimeout(kidsLoaderTimer);
  kidsLoaderTimer = window.setTimeout(() => {
    if (kidsLoaderCount === 0 && loader.parentNode) {
      /* keep node for reuse */
    }
  }, 240);
}

async function loadJson(path, options = {}) {
  const silent = Boolean(options.silent);
  if (!silent) showKidsLoader();
  try {
    const response = await fetch(`${API_ORIGIN}/api${path}`);
    if (!response.ok) throw new Error('Could not load content');
    return await response.json();
  } finally {
    if (!silent) hideKidsLoader();
  }
}

function emptyMessage(text) {
  return `<div class="card empty">${esc(text)}</div>`;
}

function audioBlock(url) {
  if (!url) return '';
  return `<audio controls preload="none" src="${esc(url)}"></audio>`;
}

function speakButton(text, lang, label) {
  const payload = esc(JSON.stringify(String(text || '')));
  return `<button class="btn" type="button" onclick="speak(${payload}, '${lang}')">${label}</button>`;
}

function speak(text, lang = 'en-IN') {
  if (!window.speechSynthesis) {
    alert('Speech not supported in this browser.');
    return;
  }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(String(text));
  u.lang = lang;
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
}

function showAnswer(id) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('show');
}
