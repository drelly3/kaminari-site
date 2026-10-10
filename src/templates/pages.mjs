import { site, links, team, quotes, archetypes, kinds, authors } from '../../site.config.mjs';
import { esc, abs, subscribe, shock } from './layout.mjs';

const fmtDate = (iso, opts = { month: 'short', day: 'numeric', year: 'numeric' }) =>
  new Date(iso).toLocaleDateString('en-US', { ...opts, timeZone: 'UTC' });
const kindLabel = id => kinds.find(k => k.id === id).label;
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
export const home = posts => {
  const tiles = ['The Relentless', 'The Strategist', 'The Prodigy', 'The Underdog'].map(n => archetypes.find(a => a[1] === n));
  return `
<header class="hero">
  <div class="wrap hero-grid">
    <div>
      <span class="eyebrow">Anime Mindset</span>
      <h1>Turn The Anime You Love Into Habits That Actually Stick.</h1>
      <p class="lede">Weekly lessons, archetype-matched templates, coaching, and a community of others doing the same. Start free.</p>
      <div class="hero-actions">
        ${subscribe('Join Our Free Weekly Newsletter')}
        <a href="${links.quiz}" ${ext} class="btn btn-outline">Take The Archetype Quiz</a>
      </div>
      <p class="hero-note">No spam. One email a week. Unsubscribe anytime.</p>
    </div>
    <div class="hero-visual"><img src="/assets/hero.webp" alt="Anime silhouette lit by lightning" width="960" height="704" fetchpriority="high"></div>
  </div>
</header>

<section id="branches" class="alt">
  <div class="wrap">
    <div class="section-head center">
      <span class="eyebrow">What We Do</span>
      <h2>Three Branches, <span class="accent">One Mission</span></h2>
      <p>The newsletter builds the mindset, the templates turn it into habits, and the coaching keeps you consistent. Start wherever fits your week.</p>
    </div>
    <div class="branch-grid">
      <div class="branch-card">
        <div class="icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="#00C0F9" stroke-width="1.7"/><path d="M3 7l9 6 9-6" stroke="#00C0F9" stroke-width="1.7" stroke-linecap="round"/></svg></div>
        <div class="k">Free</div>
        <h3>The Newsletter</h3>
        <p>One anime story or character breakdown every Wednesday, with insights and exercises to level up each week.</p>
        <a href="/newsletter" class="link">Start reading →</a>
      </div>
      <div class="branch-card">
        <div class="icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="5" y="3" width="14" height="18" rx="2" stroke="#00C0F9" stroke-width="1.7"/><path d="M9 8h6M9 12h6M9 16h3" stroke="#00C0F9" stroke-width="1.7" stroke-linecap="round"/></svg></div>
        <div class="k">Templates</div>
        <h3>The Anime Mindset System</h3>
        <p>Habit and productivity templates matched to your archetype, so the plan fits how you're actually wired.</p>
        <a href="/anime-mindset" class="link">See the system →</a>
      </div>
      <div class="branch-card">
        <div class="icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.4" stroke="#00C0F9" stroke-width="1.7"/><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" stroke="#00C0F9" stroke-width="1.7" stroke-linecap="round"/></svg></div>
        <div class="k">Coaching</div>
        <h3>Guided Accountability</h3>
        <p>Group goal-setting, weekly check-ins with founders, and opportunities for 1:1 coaching with trained professionals.</p>
        <a href="/anime-mindset" class="link">Work with us →</a>
      </div>
    </div>
  </div>
</section>

<section id="archetype">
  <div class="wrap split">
    <div>
      <span class="eyebrow">Start Here</span>
      <h2 class="h">Which Protagonist Are You?</h2>
      <p class="sub">Every archetype builds habits differently. Take the quiz and get a system matched to how you're actually wired — not a generic routine you'll drop by week two.</p>
      <ul class="archetype-list">
        <li>Twelve quick questions, under five minutes</li>
        <li>Your archetype, plus the weakness that comes with it</li>
        <li>No wrong answers, just honest ones</li>
      </ul>
      <a href="${links.quiz}" ${ext} class="btn btn-primary">Take The Archetype Quiz</a>
    </div>
    <div class="archetype-visual">
      ${tiles.map(([, name, , , , demon, key, hue]) => `<div class="arch-tile">
        <img class="arc-face" style="--hue:${hue};width:64px;" src="/assets/avatars/${key}.png" alt="" width="200" height="200" loading="lazy">
        ${name}
        <div class="sub">Weakness: ${esc(demon)}</div>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>

<section id="community" class="alt">
  <div class="wrap split">
    <div class="discord-card">
      <div class="discord-top"><span class="dot"></span> Kaminari Discord</div>
      <div class="discord-body">
        <div class="dmsg"><div class="av">✅</div><div><div class="who">Daily check-ins</div><div class="txt">Channels that make skipping visible.</div></div></div>
        <div class="dmsg"><div class="av">⚡</div><div><div class="who">Founder drop-ins</div><div class="txt">Weekly drop-ins and group goal-setting.</div></div></div>
        <div class="dmsg"><div class="av">💬</div><div><div class="who">Recs &amp; arc discussion</div><div class="txt">Recommendations, deep dives, and arc discussion.</div></div></div>
      </div>
    </div>
    <div>
      <span class="eyebrow">The Community</span>
      <h2 class="h">You'll Quit Alone. You Won't Quit Here.</h2>
      <p class="sub">Most habits die quietly, with nobody around to notice. The Kaminari Discord is where members post check-ins, compare templates, and keep each other honest through the boring middle of an arc.</p>
      <a href="${links.discord}" ${ext} class="btn btn-primary">Join The Discord</a>
    </div>
  </div>
</section>

<section id="about">
  <div class="wrap founder-grid">
    <div class="founder-faces">
      ${team.map(t => `<figure><img src="${t.photo}" alt="${esc(t.name)}" loading="lazy"><figcaption>${esc(t.name)}</figcaption></figure>`).join('\n      ')}
    </div>
    <div>
      <span class="eyebrow">About Kaminari</span>
      <h2 class="h">We Break Down Arcs. You Get The Takeaways.</h2>
      <p class="sub" style="margin-bottom:16px;">The fights, arcs, and characters you grew up on hold real lessons about mindset, discipline, and purpose. Kaminari exists to make that explicit — we pull the lesson out of the story and hand you something you can use on a random Tuesday.</p>
      <p class="sub">Not "watch more anime." Extract the arc. Apply the lesson. Repeat until it's who you are.</p>
      <a href="/about" class="btn btn-outline">Meet The Team</a>
    </div>
  </div>
</section>

<section class="alt">
  <div class="wrap">
    <div class="quote-block">
      <div class="mark">"</div>
      <p id="quote-text" data-quotes="${esc(JSON.stringify(quotes))}">${esc(quotes[0])}</p>
      <div class="src">Kaminari</div>
      <div class="quote-dots" id="quote-dots"></div>
    </div>
  </div>
</section>

<section id="blog">
  <div class="wrap">
    <div class="section-head row">
      <div>
        <span class="eyebrow">From The Blog</span>
        <h2>Latest Blog Drops</h2>
        <p>Curated reads on anime watch order, filler episodes, character quotes &amp; more.</p>
      </div>
      <a href="/blog" class="btn btn-outline btn-sm">Explore all</a>
    </div>
    <div class="post-grid">${posts.slice(0, 6).map(postCard).join('')}</div>
  </div>
</section>

${shock({ second: `<a href="/anime-mindset" class="btn btn-outline">See The Anime Mindset System</a>` })}`;
};

/* ---------- ABOUT ---------- */
export const about = () => `
<header class="page-hero center">
  <div class="wrap">
    <span class="eyebrow">About Kaminari</span>
    <h1>Where Anime Meets Real Life. Weekly Thunder.</h1>
    <p class="lede">Anime ain't just entertainment — it's energy, lessons, and mindset shifts disguised as battles. Every loss, every power-up, every inner demon? That's life. Just with better animation. Kaminari is a weekly newsletter for people who grew up on anime — and grew up learning from it.</p>
    <div class="hero-actions">${subscribe('Join Our Free Weekly Newsletter')}</div>
  </div>
</header>

<section class="alt">
  <div class="wrap">
    <div class="section-head center">
      <h2>Enter The Kaminari Storm</h2>
      <p>Kaminari means lightning in Japanese, and that's exactly what we bring. Every week, we hit your inbox with anime-fueled electricity.</p>
    </div>
    <div class="branch-grid two">
      <div class="branch-card">
        <div class="icon">❤️</div>
        <h3>Motivational Wednesdays</h3>
        <p>Power-ups for your real life. We break down the struggles, grit, and glow-ups of your favorite characters and show you how to charge through your own.</p>
      </div>
      <div class="branch-card">
        <div class="icon">⚡</div>
        <h3>Sunday Funday</h3>
        <p>Chaotic polls, spicy takes, dumb anime moments, and "why am I wheezing?" memes. It's the side quest you didn't know you needed.</p>
      </div>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="section-head center">
      <span class="eyebrow">Meet The Team</span>
      <h2>Why We Started This</h2>
      <p>We're just three anime-heads raised on Toonami, trauma arcs, and characters who powered up through pain. Now we're flipping all that energy into real-life voltage — helping you level up through every arc life throws your way.</p>
    </div>
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

${shock({ text: 'Good energy, heavy laughs, and anime truths that hit harder than a final form.' })}`;

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
    <div class="section-head"><span class="eyebrow">Editor's Picks</span></div>
    <div class="post-grid">${posts.filter(p => p.featured).slice(0, 6).map(postCard).join('')}</div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="blog-tools">
      <div class="chips">
        <button class="chip active" data-kind="all">All (${posts.length})</button>
        ${kinds.map(k => `<button class="chip" data-kind="${k.id}">${k.label}</button>`).join('\n        ')}
      </div>
      <input class="search" type="search" placeholder="Search posts…" aria-label="Search posts">
    </div>
    <div class="post-grid" data-post-grid>${posts.map(postCard).join('')}</div>
    <p class="empty" hidden>No posts match that search.</p>
  </div>
</section>

${shock()}`;

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
      <div class="crumb"><a href="/blog">Blog</a><span>/</span><a href="/blog?type=${p.kind}">${kindLabel(p.kind)}</a></div>
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
        <h3>Three habits, max</h3>
        <p>One Non-Negotiable plus two supporting habits, each stacked onto something you already do: "After I pour my coffee, I will read one page."</p>
      </div>
      <div class="branch-card">
        <div class="k">Shadow-Check</div>
        <h3>Face your shadow</h3>
        <p>Every archetype has a failure mode. Your shadow-check works against it and is tracked on its own, with badges at 10, 25 and 50 check-ins.</p>
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
