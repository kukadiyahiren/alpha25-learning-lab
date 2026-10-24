const API_ORIGIN = 'https://alpha25-learning-lab-1.onrender.com';

const NAV_LINKS = [
  ['Home', '../index.html'],
  ['Classes', 'classes.html'],
  ['Audio', 'audio.html'],
  ['Worksheets', 'worksheets.html'],
  ['GK', 'gk.html'],
  ['Spoken English', 'spoken-english.html'],
  ['Phonics', 'phonics.html'],
  ['Games', 'games.html'],
  ['Drawing', 'drawing.html'],
  ['eBooks', 'ebooks.html'],
  ['About', 'about.html'],
  ['Contact', 'contact.html'],
  ['Admin', 'http://127.0.0.1:5173']
];

function currentPage() {
  return location.pathname.split('/').pop() || 'index.html';
}

function buildNav(base = '') {
  const page = currentPage();
  const links = NAV_LINKS.map(([label, href]) => {
    let url = href;
    if (base === 'root') {
      if (href === '../index.html') url = 'index.html';
      else if (!href.startsWith('http')) url = 'pages/' + href;
    }
    const file = url.split('/').pop();
    const active = file === page ? ' active' : '';
    return `<a class="nav-link${active}" href="${url}">${label}</a>`;
  });
  return links.join('');
}

document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const isRoot = !location.pathname.includes('/pages/');
  nav.innerHTML = buildNav(isRoot ? 'root' : '');
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
