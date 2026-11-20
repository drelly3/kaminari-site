import { site, links, team, quotes, archetypes, kinds, authors, popularPosts } from '../../site.config.mjs';
import { discordLink } from './layout.mjs';
import { esc, abs, subscribe, shock } from './layout.mjs';

const fmtDate = (iso, opts = { month: 'short', day: 'numeric', year: 'numeric' }) =>
  new Date(iso).toLocaleDateString('en-US', { ...opts, timeZone: 'UTC' });
const kindLabel = id => kinds.find(k => k.id === id).label;
const kindPath = id => '/blog/' + kinds.find(k => k.id === id).page;

// the category links above the blog lists: each one is a real page, so the address always matches
const blogTools = (posts, active) => `
    <div class="blog-tools">
      <nav class="chips" aria-label="Blog categories">
        <a class="chip${active ? '' : ' active'}" href="/blog"${active ? '' : ' aria-current="page"'}>All (${posts.length})</a>
        ${kinds.map(k => `<a class="chip${k.id === active ? ' active' : ''}" href="${kindPath(k.id)}"${k.id === active ? ' aria-current="page"' : ''}>${k.label}</a>`).join('\n        ')}
      </nav>
      <input class="search" type="search" placeholder="${active ? 'Search ' + esc(kindLabel(active).replace('…', '')).toLowerCase() + '…' : 'Search posts…'}" aria-label="Search posts">
    </div>`;
const ext = 'target="_blank" rel="noopener"';

export const postCard = p => `
<a class="post-card" href="/blog/${p.slug}" data-kind="${p.kind}" data-title="${esc(p.title.toLowerCase())}">
  <div class="thumb"><img src="${p.thumbnail || '/assets/post-default.png'}" alt="" loading="lazy" decoding="async"></div>
  <div class="body">
    <div class="meta"><span class="kind">${kindLabel(p.kind)}</span><span>${fmtDate(p.publishDate)}</span></div>
    <h3>${esc(p.title)}</h3>
    <p>${esc(p.summary)}</p>
  </div>
</a>`;

/* ---------- HOME ---------- */
// An anime discovery front page: search first, a featured guide, then shelves of the site's own guides.
// Everything shown comes from Kaminari's published guides; nothing here is a live catalogue or chart.
// filler guide order: by GA4 landing sessions, Aug 20 to Nov 17, 2026 (not shown on the page)
const MOST_READ_FILLER = ['black-clover-filler-list', 'naruto-shippuden-filler-list', 'naruto-filler-list', 'bleach-filler-list', 'my-hero-academia-filler-list', 'fairy-tail-filler-list', 'boruto-filler-list', 'gintama-filler-list', 'jojo-filler-list', 'one-piece-filler-list'];
const WATCH_ORDER_PICKS = ['that-time-i-got-reincarnated-as-a-slime-watch-order', 'one-piece-watch-order', 'attack-on-titan-watch-order', 'demon-slayer-watch-order', 'jojo-watch-order', 'bleach-watch-order', 'fate-watch-order', 'monogatari-watch-order', 'gundam-watch-order', 'sword-art-online-watch-order'];
const NEXT_WATCH_PICKS = ['anime-like-chainsaw-man', 'anime-like-jujutsu-kaisen', 'anime-like-solo-leveling', 'anime-like-frieren', 'anime-like-demon-slayer', 'anime-like-attack-on-titan', 'anime-like-one-punch-man', 'anime-like-death-note'];
// "Black Clover Filler List: Which Episodes to Skip" -> "Black Clover"
const seriesName = p => p.title.split(/:| Filler| Watch Order| Quotes/)[0].replace(/^Top \d+\s+/i, '').trim();
// "anime-like-jujutsu-kaisen" -> "If you liked Jujutsu Kaisen" (the article titles are long headlines)
const LIKE_NAMES = { 'death-note': 'Death Note', 'one-punch-man': 'One Punch Man', 'attack-on-titan': 'Attack on Titan' };
const likeName = p => { const k = p.slug.replace(/^(top-)?anime-like-/, ''); return 'If you liked ' + (LIKE_NAMES[k] || k.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')); };
const guideKindNoun = { 'filler-list': 'Filler list', 'watch-order': 'Watch order', 'anime-like': 'What to watch next', quotes: 'Quotes', characters: 'Characters' };
// a title card: the series' own guide image on a light plate, then what the guide is
const titleCard = (p, extra = '') => `
      <a class="title-card" href="/blog/${p.slug}">
        <div class="tc-art"><img src="${p.thumbnail || '/assets/post-default.png'}" alt="" loading="lazy" decoding="async"></div>
        <div class="tc-body"><span class="tc-kind">${esc(guideKindNoun[p.kind] || kindLabel(p.kind))}</span><b>${esc(p.kind === 'anime-like' ? likeName(p) : seriesName(p))}</b>${extra}</div>
      </a>`;
const shelf = (id, eyebrow, title, note, href, cards, wide) => `
<section class="shelf-sec" id="${id}">
  <div class="wrap">
    <div class="shelf-head">
      <div><span class="eyebrow">${eyebrow}</span><h2>${title}</h2>${note ? `<p>${note}</p>` : ''}</div>
      <a href="${href}" class="shelf-all">See all →</a>
    </div>
    <div class="shelf${wide ? ' shelf-wide' : ''}" tabindex="0" aria-label="${esc(title)}">${cards}
    </div>
  </div>
</section>`;

export const home = (posts, guides = {}) => {
  const bySlug = Object.fromEntries(posts.map(p => [p.slug, p]));
  const pick = slugs => slugs.map(s => bySlug[s]).filter(Boolean);
  const count = id => posts.filter(p => p.kind === id).length;
  const featured = bySlug['black-clover-filler-list'];
  const fg = guides['black-clover-filler-list'];
  const fStats = fg ? (() => {
    const filler = fg.episodes.filter(e => e.type === 'filler' || e.type === 'keep').reduce((n, e) => n + e.range[1] - e.range[0] + 1, 0);
    return { total: fg.total, filler, pct: Math.round(filler / fg.total * 100) };
  })() : null;
  // the search box searches the site's own guides (titles), in the browser
  const index = posts.map(p => [p.slug, p.title, kindLabel(p.kind)]);
  const tiles = [
    ['filler-list', 'Skip the filler', 'Every episode marked canon or filler, with the filler worth keeping.'],
    ['watch-order', 'Watch in order', 'Seasons, movies and OVAs in the right order.'],
    ['anime-like', 'What to watch next', 'Picks matched to the show you just finished.'],
    ['characters', 'Characters', 'Rankings and breakdowns of the characters people argue about.'],
    ['quotes', 'Quotes', 'The lines that stuck, with the moment behind them.'],
  ];
  return `
<header class="home-hero">
  <div class="home-hero-bg" aria-hidden="true"><img src="/assets/hero-desktop.png" alt="" width="1440" height="764" fetchpriority="high"></div>
  <div class="wrap home-hero-grid">
    <div class="home-hero-copy">
      <span class="eyebrow">Anime guides &amp; discovery</span>
      <h1>Know what to watch. <span class="accent">Skip what you don't.</span></h1>
      <p class="lede">Filler lists, watch orders and what-to-watch-next picks for the anime you love, written by fans who've sat through the filler so you don't have to.</p>
      <form class="home-search" role="search" action="/blog" method="get" data-home-search>
        <label class="sr-only" for="home-q">Search Kaminari's anime guides</label>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
        <input id="home-q" name="q" type="search" autocomplete="off" placeholder="Search a series, e.g. Naruto" aria-controls="home-results" aria-autocomplete="list">
        <button type="submit" class="btn btn-primary btn-sm">Search</button>
        <div class="home-results" id="home-results" role="listbox" hidden></div>
      </form>
      <p class="home-search-note">Searches ${posts.length} Kaminari guides and articles. Kaminari doesn't stream anime or host manga.</p>
      <nav class="home-quick" aria-label="Guide types">
        ${kinds.map(k => `<a class="chip" href="${kindPath(k.id)}">${esc(k.label)} <span>${count(k.id)}</span></a>`).join('\n        ')}
      </nav>
    </div>
    ${featured ? `<a class="feature-card" href="/blog/${featured.slug}">
      <span class="feature-tag">Featured guide</span>
      <div class="feature-art"><img src="${featured.thumbnail}" alt="Black Clover" width="1200" height="800"></div>
      <div class="feature-body">
        <h2>Black Clover filler list</h2>
        ${fStats ? `<div class="feature-stats"><div><b>${fStats.total}</b><span>episodes</span></div><div><b>${fStats.filler}</b><span>filler</span></div><div><b>${fStats.pct}%</b><span>filler rate</span></div></div>` : ''}
        <p>The full skip list, the three filler episodes worth keeping, and every episode at a glance.</p>
        <span class="btn btn-primary btn-sm">Open the guide</span>
      </div>
    </a>` : ''}
  </div>
  <script type="application/json" id="home-index">${JSON.stringify(index).replace(/</g, '\\u003c')}</script>
</header>

${shelf('filler', 'Filler lists', 'Filler guides', '', kindPath('filler-list'), pick(MOST_READ_FILLER).map(p => titleCard(p)).join(''))}

${shelf('watch-order', 'Watch orders', 'Start a series in the right order', 'Seasons, movies, OVAs and spin-offs, in sequence.', kindPath('watch-order'), pick(WATCH_ORDER_PICKS).map(p => titleCard(p)).join(''))}

${shelf('next', 'What to watch next', 'Finished a show? Find your next one', 'Lists built around the show you just loved.', kindPath('anime-like'), pick(NEXT_WATCH_PICKS).map(p => titleCard(p)).join(''), true)}

<section class="shelf-sec" id="browse">
  <div class="wrap">
    <div class="shelf-head"><div><span class="eyebrow">Browse</span><h2>Find it by guide type</h2></div></div>
    <div class="browse-grid">
      ${tiles.map(([id, title, text]) => `<a class="browse-tile" href="${kindPath(id)}"><b>${title}</b><span>${text}</span><em>${count(id)} guides →</em></a>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="shelf-sec" id="blog">
  <div class="wrap">
    <div class="shelf-head">
      <div><span class="eyebrow">Editorial</span><h2>Latest from Kaminari</h2><p>New guides, rankings and takes.</p></div>
      <a href="/blog" class="shelf-all">All articles →</a>
    </div>
    <div class="post-grid">${posts.slice(0, 6).map(postCard).join('')}</div>
  </div>
</section>

<section class="shelf-sec beyond" id="beyond">
  <div class="wrap">
    <div class="shelf-head"><div><span class="eyebrow">Beyond the screen</span><h2>More from Kaminari</h2><p>For when you want the anime to do something for you off the couch.</p></div></div>
    <div class="beyond-grid">
      <a class="beyond-card" href="/anime-mindset">
        <span class="beyond-k">Anime Mindset</span>
        <b>Turn the arcs you love into habits</b>
        <span>The archetype quiz, the Arc Tracker habit app and coaching from the Kaminari founders.</span>
        <em>Explore Anime Mindset →</em>
      </a>
      <a class="beyond-card" href="/anime-art-academy">
        <span class="beyond-k">Partner</span>
        <b>Learn to draw anime</b>
        <span>Lessons from Japanese pro animators and manga artists. Kaminari earns a commission if you join.</span>
        <em>See the course →</em>
      </a>
      <div class="beyond-card">
        <span class="beyond-k">Newsletter</span>
        <b>One anime read a week</b>
        <span>A story or character breakdown every Wednesday, free.</span>
        ${subscribe('Join the newsletter', 'btn btn-outline btn-sm')}
      </div>
    </div>
  </div>
</section>`;
};

/* ---------- ABOUT ---------- */
export const about = (posts = []) => {
  const count = id => posts.filter(p => p.kind === id).length;
  const offers = [
    ['filler-list', 'Filler lists', 'Which episodes are canon, which are filler, and the filler that is actually worth watching.'],
    ['watch-order', 'Watch orders', 'Seasons, movies, OVAs and spin-offs lined up in the order they make sense.'],
    ['anime-like', 'What to watch next', 'Finished something great? Lists built around the show you just loved.'],
    ['characters', 'Characters', 'Rankings and breakdowns of the characters fans argue about.'],
    ['quotes', 'Quotes', 'The lines that stuck, with the scene behind them.'],
  ];
  return `
<header class="about-hero">
  <div class="home-hero-bg" aria-hidden="true"><img src="/assets/hero-desktop.png" alt="" width="1440" height="764" fetchpriority="high"></div>
  <div class="wrap about-hero-inner">
    <span class="eyebrow">About Kaminari</span>
    <h1>Raised on anime. <span class="accent">Allergic to filler.</span></h1>
    <p class="lede">We grew up on anime that ran for hundreds of episodes, with no way to tell the real story from the filler until we'd already sat through it. Kaminari is the guide we wish we'd had: which episodes to skip, what order to watch in, and the shows we think are straight heat.</p>
    <p class="lede about-taste">We've got good taste. Trust us.</p>
    <div class="hero-actions">
      <a href="/" class="btn btn-primary">Explore the guides</a>
      <a href="/blog" class="btn btn-outline">Browse all articles</a>
    </div>
  </div>
</header>

<section class="about-sec">
  <div class="wrap">
    <div class="shelf-head"><div><span class="eyebrow">What you'll find here</span><h2>Guides for every stage of a series</h2><p>From deciding where to start to deciding what comes after the finale.</p></div></div>
    <div class="about-offers">
      ${offers.map(([id, title, text]) => `<a class="browse-tile" href="${kindPath(id)}"><b>${title}</b><span>${text}</span><em>${count(id)} guides →</em></a>`).join('\n      ')}
    </div>
    <p class="about-note">Kaminari is a guide site. We don't stream anime or host manga, and we don't run a ratings database. We point you to the episodes and series worth your time.</p>
  </div>
</section>

<section class="about-sec">
  <div class="wrap about-name">
    <div class="about-kanji" aria-hidden="true">雷</div>
    <div>
      <span class="eyebrow">The name</span>
      <h2>Kaminari means lightning</h2>
      <p>That's the feeling we're after: the jolt of finding the right episode to jump back in at, the right order to start a franchise, or the next show that hits the way the last one did.</p>
    </div>
  </div>
</section>

<section class="about-sec">
  <div class="wrap">
    <div class="shelf-head"><div><span class="eyebrow">The team</span><h2>Meet the co-founders</h2><p>Kaminari is built by fans. Here's who's behind it, and the anime they'd put at the top of their lists.</p></div></div>
    <div class="team-grid">
      ${team.map(t => `<div class="team-card">
        <img src="${t.photo}" alt="${esc(t.name)}" loading="lazy">
        <div class="body">
          <h3>${esc(t.name)}</h3>
          <div class="role">${t.role}</div>
          <div class="soc">${t.socials.map(([l, h]) => `<a href="${h}" ${ext}>${l}</a>`).join('')}</div>
          <h4>Top 5 Anime</h4>
          <ol>${t.top5.map(a => `<li>${esc(a)}</li>`).join('')}</ol>
        </div>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="about-sec about-last">
  <div class="wrap">
    <div class="beyond-grid">
      <a class="beyond-card" href="/anime-mindset">
        <span class="beyond-k">Also from Kaminari</span>
        <b>Anime Mindset</b>
        <span>A separate, optional project for fans who want to turn the arcs they love into habits: the archetype quiz, the Arc Tracker app and coaching.</span>
        <em>Visit Anime Mindset →</em>
      </a>
      <div class="beyond-card">
        <span class="beyond-k">Newsletter</span>
        <b>Get new guides by email</b>
        <span>New Kaminari guides and anime reads, free in your inbox.</span>
        ${subscribe('Join the newsletter', 'btn btn-outline btn-sm')}
      </div>
      <div class="beyond-card">
        <span class="beyond-k">Contact</span>
        <b>Say hello</b>
        <span>Questions, corrections or a guide you'd like to see: <a href="mailto:${site.email}">${site.email}</a>. Advertising and partnerships: <a href="mailto:${site.advertiseEmail}">${site.advertiseEmail}</a>.</span>
      </div>
    </div>
  </div>
</section>`;
};

/* ---------- NEWSLETTER ---------- */
export const newsletter = posts => `
<header class="page-hero center">
  <div class="wrap">
    <span class="eyebrow">Weekly Anime Lessons &amp; Insights</span>
    <h1>Your Ultimate Anime Newsletter</h1>
    <p class="lede">Stay ahead of the anime curve with Kaminari. Get life lessons, actionable insights, and exclusive content delivered straight to your inbox every Wednesday!</p>
    <div class="embed-box"><iframe src="${links.substackEmbed}" title="Subscribe to the Kaminari newsletter" scrolling="no"></iframe></div>
    <p class="hero-note">No spam. One email a week. Unsubscribe anytime.</p>
  </div>
</header>

<section class="alt">
  <div class="wrap">
    <div class="section-head center">
      <h2>Experience The Kaminari Energy</h2>
      <p>Join thousands of anime fans who come for the hard-hitting advice and stay for the insights.</p>
    </div>
    <div class="branch-grid">
      <div class="branch-card">
        <div class="icon">📬</div>
        <h3>Every Wednesday</h3>
        <p>Fuel your grind with anime-inspired lessons and takeaways that keep you pushing forward throughout your week.</p>
      </div>
      <div class="branch-card">
        <div class="icon">📈</div>
        <h3>Level Up</h3>
        <p>Anime-inspired lessons, quotes, and stories that keep you pushing forward like a true shonen hero.</p>
      </div>
      <div class="branch-card">
        <div class="icon">🤝</div>
        <h3>Kam Fam</h3>
        <p>Join our Substack community to connect with fellow fans, share hot takes, and dive into conversations that make anime even more electrifying.</p>
      </div>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="section-head row">
      <div>
        <h2>Start With The Reader Favorites</h2>
        <p>Subscribe to our newsletter so you don't miss a drop every Wednesday!</p>
      </div>
      <a href="${links.substack}" ${ext} class="btn btn-outline btn-sm">Read on Substack</a>
    </div>
    <div class="post-grid">${posts.filter(p => p.kind === 'lessons').slice(0, 6).map(postCard).join('')}</div>
  </div>
</section>

${shock({ text: 'Good energy, heavy laughs, and anime truths that hit harder than a final form.' })}`;

/* ---------- ANIME MINDSET ---------- */
// Line-art emblems for the three ideas, drawn like the archetype icons and ringed like the avatars.
const emblem = (hue, paths) => `<div class="idea-emblem" style="--hue:${hue}"><svg viewBox="0 0 48 48" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg></div>`;
const EMBLEMS = {
  mirror: emblem(192, '<ellipse cx="24" cy="19" rx="10.5" ry="12.5" fill="currentColor" fill-opacity=".16"/><path d="M24 31.5V43M19.5 43h9"/><path d="M18.5 15c1.2-3 3.6-4.6 6.5-4.6" stroke-opacity=".6"/><path d="M20 24l7-9M24.5 25.5l4-5" stroke-opacity=".45"/>'),
  demon: emblem(350, '<path d="M14 22c0 11 5 19 10 21 5-2 10-10 10-21-3-5-7-7-10-7s-7 2-10 7z" fill="currentColor" fill-opacity=".16"/><path d="M15 20C10.500 15 9.500 9.500 11.500 5c1.800 4.500 4.500 7.500 8.500 9.800M33 20c4.500-5 5.500-10.500 3.500-15-1.800 4.500-4.500 7.500-8.500 9.800"/><path d="M18 26l4.500 2.200M30 26l-4.500 2.200"/><path d="M19.500 35l4.500 2.500 4.500-2.500"/>'),
  gear: emblem(45, '<circle cx="24" cy="24" r="12" fill="currentColor" fill-opacity=".16"/><circle cx="24" cy="24" r="5"/><path d="M24 6v6M24 36v6M6 24h6M36 24h6M11.300 11.300l4.200 4.200M32.500 32.500l4.200 4.200M11.300 36.700l4.200-4.200M32.500 15.500l4.200-4.200"/>'),
};

export const animeMindset = all => `
<header class="page-hero center">
  <div class="wrap">
    <span class="eyebrow">The Anime Mindset</span>
    <h1>Stop Watching Growth And Start Living It</h1>
    <p class="lede">You've felt the surge after a great arc — "I need to get my life together." Then a few days pass and nothing changes. Not because you don't care. Because you don't have a system. The Anime Mindset is that system.</p>
    <div class="hero-actions">
      <a href="${links.quiz}" class="btn btn-primary">Find Your Archetype</a>
      ${arcHeroButton}
      <a href="${ARC_SIGN_IN}" class="btn btn-outline">Have A Key? Sign In</a>
    </div>
  </div>
</header>

<section class="alt">
  <div class="wrap">
    <div class="section-head center">
      <h2>What Is The Anime Mindset?</h2>
      <p>You've seen the moments. The speeches. The fights. The characters who refuse to quit when everything is stacked against them. The Anime Mindset takes the exact principles behind those arcs (discipline, identity, refusing your ceiling) and turns them into how you actually live. Not motivation. Action.</p>
    </div>
    <div class="branch-grid">
      <div class="branch-card">
        ${EMBLEMS.mirror}
        <h3>A mirror, not a test</h3>
        <p>Every great character runs on a core identity. Find yours and you stop guessing who you're becoming. You build on purpose.</p>
      </div>
      <div class="branch-card">
        ${EMBLEMS.demon}
        <h3>Every hero has a weakness</h3>
        <p>Burnout, doubt, ego, avoidance. Your archetype's greatest strength has a shadow side. Name it, then train until it stops running you.</p>
      </div>
      <div class="branch-card">
        ${EMBLEMS.gear}
        <h3>Systems over willpower</h3>
        <p>Inspiration fades by Thursday. The Anime Mindset replaces white-knuckle motivation with a daily system that compounds.</p>
      </div>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <p class="pull">"This isn't about being perfect. It's about proving to yourself that you can move in every situation."</p>
  </div>
</section>

<section class="alt">
  <div class="wrap">
    <div class="section-head center">
      <h2>Which Of The 9 Are You?</h2>
      <p>Twelve quick questions. No wrong answers, just honest ones. Under five minutes, and your archetype is waiting at the end.</p>
      <p style="margin-top:26px;"><a href="${links.quiz}" class="btn btn-primary">Take The Archetype Quiz</a></p>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="section-head center">
      <h2>The 9 Archetypes</h2>
      <p>Nine ways of moving through the world, each grounded in a Jungian root, and each with a weakness to overcome.</p>
    </div>
    <div class="arch-table">
      <div class="arch-row head"><div>Archetype</div><div>Root</div><div>What drives them</div><div>Their weakness</div></div>
      ${archetypes.map(([, name, quote, root, drive, demon, key, hue]) => `<div class="arch-row">
        <div class="who"><img class="arc-face" style="--hue:${hue}" src="/assets/avatars/${key}.png" alt="" width="200" height="200" loading="lazy"><div><div class="name">${esc(name)}</div><div class="q">"${esc(quote)}"</div></div></div>
        <div class="root">${esc(root)}</div>
        <div class="drive">${esc(drive)}</div>
        <div class="demon">${esc(demon)}</div>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>
${site.arcTrackerPublic ? arcTrackerSections(all) : ''}
${shock({ text: 'Good energy, heavy laughs, and anime truths that hit harder than a final form.', second: arcHeroButton })}`;

/* ---------- PRIVACY ---------- */
export const privacy = html => `
<header class="post-head"><div class="wrap"><h1>Privacy Policy</h1></div></header>
<div class="wrap" style="padding-bottom:88px;"><div class="rich">${html}</div></div>`;

/* ---------- BLOG INDEX ---------- */
export const blogIndex = posts => `
<header class="page-hero">
  <div class="wrap">
    <span class="eyebrow">The Blog</span>
    <h1>From The Storm</h1>
    <p class="lede">Anime lessons, watch orders, filler lists, character quotes, and recommendations — everything from the Kaminari universe in one place.</p>
  </div>
</header>

<section class="alt" style="padding:64px 0;">
  <div class="wrap">
    <div class="section-head"><span class="eyebrow">Most Popular</span></div>
    <div class="post-grid">${popularPosts.map(slug => posts.find(p => p.slug === slug)).filter(Boolean).map(postCard).join('')}</div>
  </div>
</section>

<section>
  <div class="wrap">
    ${blogTools(posts)}
    <div class="post-grid" data-post-grid>${posts.map(postCard).join('')}</div>
    <p class="empty" hidden>No posts match that search.</p>
  </div>
</section>

${shock()}`;

/* ---------- BLOG CATEGORY ---------- */
// one page per kind of post (/blog/watch-orders and so on), with an intro written for search
export const blogCategory = (kind, posts) => {
  const list = posts.filter(p => p.kind === kind.id);
  return `
<header class="page-hero">
  <div class="wrap">
    <div class="crumb"><a href="/blog">Blog</a><span>/</span><span>${esc(kind.label)}</span></div>
    <h1>${esc(kind.h1)}</h1>
    <p class="lede">${esc(kind.intro)}</p>
  </div>
</header>

<section>
  <div class="wrap">
    ${blogTools(posts, kind.id)}
    <div class="post-grid" data-post-grid>${list.map(postCard).join('')}</div>
    <p class="empty" hidden>No posts match that search.</p>
  </div>
</section>

${shock()}`;
};

/* ---------- PARTNER: ANIME ART ACADEMY ---------- */
// A feature page for an affiliate partner. It isn't in the main menu: blog posts, the footer and
// shared links point here. Every sign-up button goes through /go/anime-art-academy, which adds
// Kaminari's affiliate code (api/go-links.js).
export const animeArtAcademy = () => {
  const url = abs('/anime-art-academy');
  const share = encodeURIComponent(url);
  const text = encodeURIComponent('Learn to draw anime & manga from Japanese pros');
  const go = '/go/anime-art-academy';
  const sponsored = 'target="_blank" rel="sponsored noopener"';
  const cta = label => `<a class="btn btn-primary partner-btn" href="${go}" ${sponsored}>${label} →</a>`;
  return `
<article>
  <header class="post-head">
    <div class="wrap">
      <div class="crumb"><span>Partner</span><span>/</span><span>Anime Art Academy</span></div>
      <h1>Learn to Draw Anime &amp; Manga from Japanese Pros</h1>
      <p class="summary">Anime Art Academy teaches you to draw anime and manga online with English video lessons from Japanese pro animators and manga artists, who send your drawings back with personal corrections. Two lessons are free to watch.</p>
      <div class="partner-actions">${cta('Watch a free lesson')}<span class="partner-note">No account needed. Opens Anime Art Academy.</span></div>
      <p class="partner-sale">Black Friday: 25% off everything through December 1 (Pacific time). Enter code BF2026 at checkout for subscriptions and lesson packs. Bundles are already marked down 25%, no code needed. Kaminari earns a commission if you buy through our link, at no extra cost to you.</p>
      <a class="partner-banner" href="${go}" ${sponsored}><img src="/assets/partners/bf-1200x675.png" alt="Anime Art Academy Black Friday sale: 25% off everything. Sale ends December 1st." width="1200" height="675" fetchpriority="high"></a>
    </div>
  </header>
  <div class="wrap post-layout">
    <div class="rich">
<h2>Why Kaminari recommends it</h2>
<p>Kaminari is about turning the anime you love into real growth. Watching a training arc is fun. Running your own is better. Drawing is one of the most direct ways to do it: a skill you can practice a little every day and actually see improve on the page.</p>
<p>Anime Art Academy goes straight to the source. Its lessons are made by Japanese pro animators and manga artists, and when you submit a drawing, they send it back with <b>red-line corrections</b> showing exactly what to fix. You don’t get that from a video tutorial.</p>
<h2>Try it free first</h2>
<p>You can watch two full lessons right now, no account needed:</p>
<ul>
<li><b>Drawing a woman’s face from the front</b></li>
<li><b>The Basics of Balanced Character Design</b></li>
</ul>
<p>Every course also has free preview lessons, so you can see if it clicks before you pay for anything.</p>
<h2>What you get</h2>
<ul>
<li><b>English video lessons</b> from Japanese professional animators, illustrators and manga artists.</li>
<li><b>Unlimited personal feedback</b> on the drawings you submit.</li>
<li><b>Just paper and pen.</b> Most courses need nothing else. Only a few coloring lessons use digital tools.</li>
<li><b>Beginner to pro:</b> faces, bodies, poses and coloring, from the basics to advanced.</li>
<li><b>A community</b> on Discord, plus live talk shows and workshops with Japanese manga artists.</li>
</ul>
<h2>What it costs</h2>
<p>Two ways to pay, with no sign-up fee:</p>
<ul>
<li><b>Monthly:</b> from $47 a month, or $68 for Premium, with new lessons added every month.</li>
<li><b>Pay once:</b> lesson packs from $340 with lifetime access, and bundles that cost less than buying packs separately.</li>
</ul>
<p>Prices are from their site as of October 2026, so check there for the latest.</p>
<h2>Who’s behind it</h2>
<p>Anime Art Academy partners with MyAnimeList and MediBang, and ran a “How to Draw Manga” workshop at Anime Expo in Los Angeles attended by over 1,200 people.</p>
<blockquote>“I started from absolute 0 on learning anime and manga, but now I am able to confidently produce authentic anime illustrations after only 3 months.” <br>— Haruka, a student, from their reviews</blockquote>
<h2>Make it your training arc</h2>
<p>Skills come from reps, not motivation. Add “Draw for 10 minutes” to your <a href="/anime-mindset">Arc Tracker</a> as a few-times-a-week habit and watch the streak, and your art, build.</p>
<div class="partner-cta">
  <h3>Ready to draw?</h3>
  <p>Watch Anime Art Academy’s two free lessons, no account needed, then decide.</p>
  ${cta('Watch a free lesson')}
  <p class="partner-disclosure">Kaminari earns a commission if you sign up through our link, at no extra cost to you. We only partner with things we’d recommend anyway.</p>
</div>
    </div>
    <aside class="post-aside">
      <div>
        <h4>Share</h4>
        <div class="share">
          <a href="https://x.com/intent/tweet?url=${share}&text=${text}" ${ext}>X</a>
          <a href="https://www.facebook.com/sharer/sharer.php?u=${share}" ${ext}>Facebook</a>
          <button type="button" data-copy-link>Copy link</button>
        </div>
      </div>
      <div class="aside-cta">
        <h3>Two free lessons</h3>
        <p>From Japanese pros. No account needed.</p>
        <a class="btn btn-primary btn-sm" href="${go}" ${sponsored}>Start drawing →</a>
      </div>
    </aside>
  </div>
</article>

${shock()}`;
};

/* ---------- BLOG POST ---------- */
export const blogPost = (p, related) => {
  const author = authors[p.author] || { name: 'Kaminari' };
  const url = abs(`/blog/${p.slug}`);
  const share = encodeURIComponent(url);
  const text = encodeURIComponent(p.title);
  return `
<article>
  <header class="post-head">
    <div class="wrap">
      <div class="crumb"><a href="/blog">Blog</a><span>/</span><a href="${kindPath(p.kind)}">${kindLabel(p.kind)}</a></div>
      <h1>${esc(p.title)}</h1>
      <p class="summary">${esc(p.summary)}</p>
      <div class="byline">
        ${author.photo ? `<img src="${author.photo}" alt="">` : ''}
        <strong>${esc(author.name)}</strong><span>•</span>
        <time datetime="${p.publishDate.slice(0, 10)}">${fmtDate(p.publishDate)}</time><span>•</span>
        <span>${p.readingTime} min read</span>
      </div>
      ${p.thumbnail ? `<div class="post-cover"><img src="${p.thumbnail}" alt="${esc(p.title)}" fetchpriority="high"></div>` : ''}
    </div>
  </header>
  <div class="wrap post-layout">
    <div class="rich">
${p.html}
${p.kind === 'characters' ? `<div class="partner-card"><b>Want to draw your favorite characters?</b><span>Learn from Japanese pro animators and manga artists. Two lessons are free to watch.</span><a href="/anime-art-academy">Learn to draw anime →</a></div>` : ''}
    </div>
    <aside class="post-aside">
      ${p.toc.length > 1 ? `<div><h4>On this page</h4><ul class="toc">${p.toc.map(t => `<li><a href="#${t.id}">${esc(t.text)}</a></li>`).join('')}</ul></div>` : ''}
      <div>
        <h4>Share</h4>
        <div class="share">
          <a href="https://x.com/intent/tweet?url=${share}&text=${text}" ${ext}>X</a>
          <a href="https://www.facebook.com/sharer/sharer.php?u=${share}" ${ext}>Facebook</a>
          <a href="https://www.linkedin.com/sharing/share-offsite/?url=${share}" ${ext}>LinkedIn</a>
          <button type="button" data-copy-link>Copy link</button>
        </div>
      </div>
      <div class="aside-cta">
        <h3>Your Ultimate Anime Newsletter</h3>
        <p>The best of Kaminari — delivered to your inbox, once a week.</p>
        ${subscribe('Join Kaminari', 'btn btn-primary btn-sm')}
      </div>
    </aside>
  </div>
</article>

<section class="alt">
  <div class="wrap">
    <div class="section-head row">
      <div>
        <h2>Keep Reading</h2>
        <p>Curated reads from the Kaminari universe: anime insights, recs, and takes worth your time.</p>
      </div>
      <a href="/blog" class="btn btn-outline btn-sm">Explore all</a>
    </div>
    <div class="post-grid">${related.map(postCard).join('')}</div>
  </div>
</section>

${shock()}`;
};

/* ---------- ARC TRACKER: sections shown on the Anime Mindset page ---------- */
// Buy goes to the Gumroad membership; sign-in goes to the tracker, which asks for the licence key.
const ARC_BUY = links.arcTracker, ARC_SIGN_IN = '/arc-tracker/app';
// Until sales open, the buy button reads "Coming Soon" and opens the Gumroad page, where buying is switched off.
// Same button with the product named, for places where the tracker hasn't been introduced yet.
const arcHeroButton = site.arcTrackerSales
  ? `<a href="${links.arcTracker}" class="btn btn-outline">Get The Arc Tracker</a>`
  : `<a href="${links.arcTracker}" target="_blank" rel="noopener" class="btn btn-soon">Arc Tracker: Coming Soon</a>`;
const arcBuyButton = site.arcTrackerSales
  ? `<a href="${ARC_BUY}" class="btn btn-primary">Get Access</a>`
  : `<a href="${links.arcTracker}" target="_blank" rel="noopener" class="btn btn-soon">Coming Soon</a>`;
// The tracker's part of the Anime Mindset page.
const arcTrackerSections = all => {
  const sample = all.find(a => a.ranks);
  return `
<section class="alt" id="arc-tracker">
  <div class="wrap">
    <div class="section-head center">
      <span class="eyebrow">The Arc Tracker</span>
      <h2>Three Habits. One Shadow. <span class="accent">One Arc.</span></h2>
      <p>The habit tracker built on the Anime Mindset. Pick your archetype, commit to three habits, and earn your rank one full-clear day at a time.</p>
    </div>
    <div class="branch-grid">
      <div class="branch-card">
        <div class="k">Habits</div>
        <h3>Habits on your schedule</h3>
        <p>One daily Non-Negotiable, then habits that run every day, a few times a week, or on set days. Skip a gym day you didn't plan and your streak doesn't care.</p>
      </div>
      <div class="branch-card">
        <div class="k">Weakness</div>
        <h3>Face your weakness</h3>
        <p>Every archetype has a weak spot. Pick one small habit that fights yours. It's tracked on its own, with badges at 10, 25 and 50 check-ins.</p>
      </div>
      <div class="branch-card">
        <div class="k">Proof</div>
        <h3>Show your work</h3>
        <p>A habit only counts once you upload a photo or video of it. Clear all three and the day celebrates itself.</p>
      </div>
    </div>
  </div>
</section>

<section>
  <div class="wrap split">
    <div>
      <span class="eyebrow">The Rank Ladder</span>
      <h2 class="h">Ranks You Can't Fake</h2>
      <p class="sub">Five ranks per archetype, unlocked at 0, 10, 25, 50 and 100 full-clear days. Miss a day and you keep what you've earned, but the only way up is another clear.</p>
      <ul class="archetype-list">
        <li>Streaks, with a "Never Miss Twice" nudge after a missed day</li>
        <li>XP and levels from every real check-in</li>
        <li>A five-minute weekly review to adjust your habits</li>
        <li>Day Cleared and Rank Up celebrations in your archetype's colours</li>
      </ul>
      <div class="hero-actions">
        ${arcBuyButton}
        <a href="${ARC_SIGN_IN}" class="btn btn-outline">${site.arcTrackerSales ? 'Member Sign In' : 'Have A Key? Sign In'}</a>
      </div>
      ${site.arcTrackerSales ? '' : `<p class="hero-note">Not on sale yet. <a href="${links.substack}subscribe" data-subscribe style="color:var(--accent);">Join the newsletter</a> to hear when it opens.</p>`}
    </div>
    <div class="arc-ladder" style="--hue:${sample.hue}">
      <div class="arc-ladder-head"><img class="arc-face" src="/assets/avatars/${sample.key}.png" alt="" width="200" height="200" loading="lazy"><div><b>${esc(sample.title)}</b><span>Example ladder</span></div></div>
      ${sample.ranks.map((r, i) => `<div class="arc-step" style="--lvl:${i}"><span class="n">${i + 1}</span><b>${esc(r.name)}</b><span class="ms">${r.ms} full-clear days</span></div>`).join('\n      ')}
    </div>
  </div>
</section>`;
};

// one button in the Arc Tracker's bottom tab bar: a line icon over a short label
const arcTab = (tab, label, icon, active) => `<button type="button" data-tab="${tab}"${active ? ' class="active" aria-current="page"' : ''}><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icon}</svg><span>${label}</span></button>`;

/* ---------- ARC TRACKER (the app itself lives in src/arc-tracker.js + src/arc-tracker.css) ---------- */
export const arcTracker = () => `
<div class="arc-root">
  <div id="arc-gate" class="arc-gate" hidden>
    <form class="arc-gate-card" id="arc-gate-form" novalidate>
      <div class="arc-gate-icon" aria-hidden="true"><img src="/assets/kaminari-bolt.png" alt="" width="30" height="38"></div>
      <h1>Unlock Arc Tracker</h1>
      <p>${site.arcTrackerSales ? 'Enter the licence key from your Gumroad receipt email.' : 'Enter your access key.'}</p>
      <label for="arc-key">Licence key</label>
      <input type="text" id="arc-key" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX">
      <div class="arc-gate-msg" id="arc-gate-msg" role="alert"></div>
      <button type="submit" class="btn" id="arc-unlock">Unlock</button>
      <p class="arc-gate-foot">${site.arcTrackerSales ? `No key yet? <a href="${ARC_BUY}">Get access</a>` : 'Arc Tracker is coming soon. Access is invite-only for now.'}</p>
      <div id="arc-preview-note" hidden>
        <button type="button" class="btn ghost" id="arc-preview-open" style="margin-top:14px;">Skip the key and open the tracker</button>
        <p class="arc-gate-foot">Preview only. This button and the sample key ARC7-K2MQ-9XTD-4HPL do not work on the live site.</p>
      </div>
      <p class="arc-gate-foot"><a href="/anime-mindset">← Back to Kaminari</a></p>
    </form>
  </div>
  <div id="arc-app" hidden>
    <header class="top">
      <div class="brand"><img class="kbolt" src="/assets/kaminari-bolt.png" alt="" width="12" height="16"><span class="word">ARC TRACKER</span></div>
      <div class="headline-badge" id="headerBadge">Set up your character in Setup →</div>
    </header>

    <div class="arc-main">
      <section class="tab active" id="tab-today"></section>
      <section class="tab" id="tab-progress"></section>
      <section class="tab" id="tab-archetypes"></section>
      <section class="tab" id="tab-setup"></section>
      <section class="tab" id="tab-guide"></section>
    </div>

    <nav class="tabs" aria-label="Arc Tracker">
      ${arcTab('today', 'Today', '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.7 2.7L16.5 9"/>', true)}
      ${arcTab('progress', 'Progress', '<path d="M5 20V12M12 20V5M19 20v-9"/>')}
      ${arcTab('archetypes', 'Archetypes', '<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5c1.2-4 4-6 7.5-6s6.3 2 7.5 6"/>')}
      ${arcTab('setup', 'Setup', '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>')}
      ${arcTab('guide', 'Start Here', '<path d="M5 4.5h9.5a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h9.5"/>')}
    </nav>
    <noscript><p>Arc Tracker needs JavaScript turned on.</p></noscript>
  </div>
  <div id="modalRoot"></div>
</div>
<script src="/arc-gate.js" defer></script>`;

export const notFound = () => `
<header class="page-hero center">
  <div class="wrap">
    <span class="eyebrow">404</span>
    <h1>This Page Got Isekai'd.</h1>
    <p class="lede">The page you're looking for doesn't exist or has moved.</p>
    <div class="hero-actions"><a href="/" class="btn btn-primary">Back Home</a><a href="/blog" class="btn btn-outline">Browse The Blog</a></div>
  </div>
</header>`;
