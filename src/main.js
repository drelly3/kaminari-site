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

// Blog index: category chips + search
const grid = document.querySelector('[data-post-grid]');
if (grid) {
  const cards = [...grid.children];
  const search = document.querySelector('.search');
  const chips = [...document.querySelectorAll('.chip')];
  const empty = document.querySelector('.empty');
  let kind = new URLSearchParams(location.search).get('type') || 'all';
  const apply = () => {
    const q = search.value.trim().toLowerCase();
    let shown = 0;
    for (const c of cards) {
      const ok = (kind === 'all' || c.dataset.kind === kind) && (!q || c.dataset.title.includes(q));
      c.hidden = !ok;
      if (ok) shown++;
    }
    empty.hidden = shown > 0;
    chips.forEach(ch => ch.classList.toggle('active', ch.dataset.kind === kind));
  };
  chips.forEach(ch => ch.addEventListener('click', () => { kind = ch.dataset.kind; apply(); }));
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

// Hero storm loop: respect reduced-motion (show the still poster instead)
const heroVideo = document.querySelector('.hero-visual video');
if (heroVideo && matchMedia('(prefers-reduced-motion: reduce)').matches) { heroVideo.removeAttribute('autoplay'); heroVideo.pause(); }
