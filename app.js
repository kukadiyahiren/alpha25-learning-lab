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
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 980 && drawer && !drawer.hasAttribute('hidden')) {
      drawer.setAttribute('hidden', '');
      toggle?.classList.remove('open');
      toggle?.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
    }
    syncNavOffset();
  });
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
  if (!canUseCursorFun() || document.querySelector('.cursor-fun')) return;

  const layer = document.createElement('div');
  layer.className = 'cursor-fun';
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = `<span class="cursor-ring"></span><span class="cursor-dot"></span>`;
  document.body.appendChild(layer);

  const ring = layer.querySelector('.cursor-ring');
  const dot = layer.querySelector('.cursor-dot');
  const colors = ['#0d9488', '#2563eb', '#ff6b4a', '#ffb703', '#ec4899', '#8b5cf6'];
  let lastTrail = 0;
  let mx = -100;
  let my = -100;

  const moveRing = (x, y) => {
    mx = x;
    my = y;
    ring.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  const spawnSpark = (x, y, options = {}) => {
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
    layer.appendChild(spark);
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
    ring.classList.add('is-press');
    if (!skipTarget(event.target)) burst(event.clientX, event.clientY);
  });

  document.addEventListener('mouseup', () => {
    ring.classList.remove('is-press');
  });

  document.addEventListener('mouseleave', () => {
    moveRing(-100, -100);
  });

  // Keep ring visible if mouse stays still after load
  moveRing(mx, my);
}

document.addEventListener('DOMContentLoaded', () => {
  ensurePlayfulBackground();
  ensureCursorFun();
  const nav = document.getElementById('nav');
  if (!nav) return;
  const isRoot = !location.pathname.includes('/pages/');
  nav.innerHTML = buildNav(isRoot ? 'root' : '');
  wireNavInteractions(nav);
  syncNavOffset();
});

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
}

async function loadJson(path) {
  const response = await fetch(`${API_ORIGIN}/api${path}`);
  if (!response.ok) throw new Error('Could not load content');
  return response.json();
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
