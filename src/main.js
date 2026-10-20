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
