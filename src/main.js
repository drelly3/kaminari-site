// Mobile menu
const toggle = document.querySelector('.mobile-toggle');
const navLinks = document.querySelector('.nav-links');
toggle?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
});

// Newsletter modal: every [data-subscribe] link opens the Substack signup in place.
const dialog = document.querySelector('dialog.subscribe');
if (dialog?.showModal) {
  document.addEventListener('click', e => {
    const trigger = e.target.closest('[data-subscribe]');
    if (trigger) {
      e.preventDefault();
      const frame = dialog.querySelector('iframe');
      if (!frame.getAttribute('src')) frame.src = frame.dataset.src;
      dialog.showModal();
    } else if (e.target === dialog || e.target.closest('dialog.subscribe .close')) {
      dialog.close();
    }
  });
}

// Discord waitlist: while the Discord is closed, Discord buttons open this form instead of the invite
const waitlist = document.querySelector('dialog.waitlist');
if (waitlist?.showModal) {
  const form = waitlist.querySelector('form'), msg = waitlist.querySelector('.waitlist-msg'), btn = form.querySelector('button');
  document.addEventListener('click', e => {
    if (e.target.closest('[data-waitlist]')) { e.preventDefault(); msg.textContent = ''; waitlist.showModal(); form.email.focus(); }
    else if (e.target === waitlist || e.target.closest('dialog.waitlist .close')) waitlist.close();
  });
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const email = form.email.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { msg.textContent = 'Enter a valid email address.'; return; }
    btn.disabled = true; msg.textContent = 'Adding you…';
    try {
      const res = await fetch('/api/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: form.name.value, website: form.website.value, page: location.pathname }) });
      const out = await res.json();
      if (!out.ok) throw new Error();
      form.reset();
      msg.textContent = out.already ? 'You’re already on the list. We’ll email you when the Discord opens.' : 'You’re on the list. We’ll email you when the Discord opens.';
    } catch { msg.textContent = 'Something went wrong. Please try again in a moment.'; }
    btn.disabled = false;
  });
}

// Rotating quotes (homepage)
const quoteEl = document.getElementById('quote-text');
if (quoteEl) {
  const quotes = JSON.parse(quoteEl.dataset.quotes);
  const dots = document.getElementById('quote-dots');
  let idx = 0;
  const show = i => {
    idx = i;
    quoteEl.textContent = quotes[i];
    [...dots.children].forEach((d, di) => d.classList.toggle('active', di === i));
  };
  quotes.forEach((_, i) => {
    const b = document.createElement('button');
    b.setAttribute('aria-label', `Quote ${i + 1}`);
    b.addEventListener('click', () => show(i));
    dots.appendChild(b);
  });
  show(0);
  setInterval(() => show((idx + 1) % quotes.length), 6000);
}

// Old category links (/blog?type=watch-order) go to the category's own page
const oldType = location.pathname === '/blog' && new URLSearchParams(location.search).get('type');
const typePage = { 'watch-order': 'watch-orders', 'filler-list': 'filler-lists', quotes: 'quotes', 'anime-like': 'anime-like', characters: 'characters', lessons: 'lessons' }[oldType];
if (typePage) location.replace('/blog/' + typePage);

// Blog index and category pages: search
const grid = document.querySelector('[data-post-grid]');
if (grid) {
  const cards = [...grid.children];
  const search = document.querySelector('.search');
  const empty = document.querySelector('.empty');
  const apply = () => {
    const q = search.value.trim().toLowerCase();
    let shown = 0;
    for (const c of cards) {
      const ok = !q || c.dataset.title.includes(q);
      c.hidden = !ok;
      if (ok) shown++;
    }
    empty.hidden = shown > 0;
  };
  search.addEventListener('input', apply);
  apply();
}

// Post page: copy link + highlight the current section in "On this page"
document.querySelector('[data-copy-link]')?.addEventListener('click', async e => {
  await navigator.clipboard.writeText(location.href);
  e.target.textContent = 'Copied!';
  setTimeout(() => (e.target.textContent = 'Copy link'), 1600);
});
const tocLinks = [...document.querySelectorAll('.toc a')];
if (tocLinks.length && 'IntersectionObserver' in window) {
  const byId = Object.fromEntries(tocLinks.map(a => [a.hash.slice(1), a]));
  const io = new IntersectionObserver(entries => {
    for (const en of entries) if (en.isIntersecting) {
      tocLinks.forEach(a => a.classList.remove('active'));
      byId[en.target.id]?.classList.add('active');
    }
  }, { rootMargin: '-100px 0px -70% 0px' });
  Object.keys(byId).forEach(id => { const h = document.getElementById(id); if (h) io.observe(h); });
}

// Blog index: a search term in the address (/blog?q=naruto) fills the search box, e.g. from the homepage
{
  const q = new URLSearchParams(location.search).get('q');
  const box = document.querySelector('[data-post-grid]') && document.querySelector('.search');
  if (q && box) { box.value = q; box.dispatchEvent(new Event('input')); }
}

// Homepage search: suggests matching Kaminari guides as you type (titles only, all in the browser)
document.querySelectorAll('[data-home-search]').forEach(form => {
  const input = form.querySelector('input'), list = form.querySelector('.home-results');
  let index = [];
  try { index = JSON.parse(document.getElementById('home-index').textContent); } catch {}
  let active = -1;
  const norm = s => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9 ]/g, ' ');
  const render = () => {
    const q = norm(input.value).trim();
    active = -1;
    if (!q) { list.hidden = true; return; }
    const words = q.split(/\s+/);
    const hits = index.filter(([, t]) => { const n = norm(t); return words.every(w => n.includes(w)); }).slice(0, 7);
    const all = `<a class="all" href="/blog?q=${encodeURIComponent(input.value.trim())}">See all results on the blog →</a>`;
    list.innerHTML = hits.length
      ? hits.map(([slug, title, kind]) => `<a role="option" href="/blog/${slug}">${title.replace(/[<&]/g, c => c === '<' ? '&lt;' : '&amp;')}<span>${kind}</span></a>`).join('') + all
      : `<div class="none">No guide for that yet. Try a series name, like Naruto or One Piece.</div>`;
    list.hidden = false;
  };
  input.addEventListener('input', render);
  input.addEventListener('keydown', e => {
    const opts = [...list.querySelectorAll('a')];
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault(); if (!opts.length) return;
      active = (active + (e.key === 'ArrowDown' ? 1 : -1) + opts.length) % opts.length;
      opts.forEach((o, i) => o.setAttribute('aria-selected', i === active));
    } else if (e.key === 'Enter' && active >= 0 && opts[active]) { e.preventDefault(); location.href = opts[active].href; }
    else if (e.key === 'Escape') list.hidden = true;
  });
  document.addEventListener('click', e => { if (!form.contains(e.target)) list.hidden = true; });
});
