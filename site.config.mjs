// Everything you're likely to change lives here: links, nav, team, quotes.
export const site = {
  name: 'Kaminari',
  url: 'https://www.joinkaminari.com',
  tagline: 'Turn The Anime You Love Into Habits That Actually Stick',
  description:
    'Stay ahead of the anime curve with Kaminari. Get the latest news, reviews, and exclusive content delivered straight to your inbox every week.',
  googleSiteVerification: 'Ey0CAWBSEi4WMjgZLYF4ixwntx00lI0Qd1rEQinoJQ4',
  ga4Id: 'G-G0ZNGK9CCS',
  clarityId: 'vfa1cvf7bd',
  ogImage: '/assets/og-image.jpg',
  // false = invite-only test run: no menu link, no public Arc Tracker page, no buy button.
  // The tracker itself still works at /arc-tracker/app for anyone holding a key.
  arcTrackerPublic: true,
  // false = the buy buttons read "Coming Soon" and can't be clicked. true = they open the Gumroad checkout.
  arcTrackerSales: false,
  email: 'joinkaminari@gmail.com',
  advertiseEmail: 'contact@joinkaminari.com',
};

export const links = {
  substack: 'https://joinkaminari.substack.com/',
  substackEmbed: 'https://joinkaminari.substack.com/embed',
  quiz: '/quiz', // restyled copy of the original at kaminari-archetype-quiz.vercel.app
  templates: 'https://kaminari4.gumroad.com/l/anime-mindset-system',
  arcTracker: 'https://kaminari4.gumroad.com/l/huotdg',
  discord: 'https://discord.gg/6H5KAp3edZ',
  linkedin: 'https://www.linkedin.com/company/kaminari-newsletter/',
};

export const nav = [
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Newsletter', href: '/newsletter' },
  { label: 'Community', href: '/#community' },
  { label: 'Anime Mindset', href: '/anime-mindset' },
];

export const authors = {
  'devin-morris': { name: 'Devin Morris', photo: '/assets/team/devin-morris.png' },
};

export const team = [
  {
    name: 'Andrel Neptune', role: 'Co-Founder', photo: '/assets/team/andrel-neptune.png',
    socials: [['Instagram', 'https://www.instagram.com/drellyyy/'], ['LinkedIn', 'https://www.linkedin.com/in/andrelneptune/']],
    top5: ['Attack on Titan', 'Prison School', 'My Hero Academia', 'Food Wars', 'Demon Slayer'],
  },
  {
    name: 'Devin Morris', role: 'Co-Founder', photo: '/assets/team/devin-morris.png',
    socials: [['Instagram', 'https://www.instagram.com/yoitsdevmo/'], ['LinkedIn', 'https://www.linkedin.com/in/devin-morris-408'], ['X', 'https://x.com/devmo_4']],
    top5: ['One Piece', 'Naruto', 'Koe No Katachi', 'Haikyu!!', 'Dragon Ball Z'],
  },
];

export const quotes = [
  "You don't need a bigger villain. You need a longer training arc.",
  'Every main character was a background character first. The arc is the only difference.',
  'Motivation gets you to episode one. Systems get you to the finale.',
  "The training arc is boring on purpose. That's how you know it's working.",
  "You're not behind. You're mid-arc.",
  "Power-ups aren't sudden. They're a hundred reps nobody saw.",
  'Stop waiting for a rival to force your growth. Be your own trial arc.',
];

// [emoji, name, quote, Jungian root, what drives them, their weakness, avatar file, colour hue]
export const archetypes = [
  ['🎭', 'The Free Spirit', 'You refuse to let the weight steal the joy.', 'Jester', 'Moves through life light. Humor and presence as real resilience that outlasts the heaviness.', 'Avoidance', 'free-spirit', 300],
  ['🌱', 'The Underdog', "You started with nothing special. That's why you'll prove it.", 'Everyman', 'No head start, no shortcuts, just grit. Rises from behind and makes people root for them.', 'Victim mentality', 'underdog', 132],
  ['✨', 'The Believer', "Hope isn't naive. It's the engine.", 'Innocent', "Keeps the faith most people lost. Optimism that's contagious and pulls people forward.", 'Naivety', 'believer', 50],
  ['🎯', 'The Social Commander', 'People follow conviction, not titles.', 'Ruler', 'Sets the standard in any room. Presence, charisma, and decisiveness that makes people move.', 'Control & ego', 'social-commander', 340],
  ['🕯️', 'The Beacon', "You don't just rise. You bring people with you.", 'Caregiver', 'Leads by example and builds rooms for others. The kind of strength that multiplies.', 'Martyrdom', 'beacon', 42],
  ['🌊', 'The Reborn', 'You shed a version of yourself that no longer served you.', 'Outlaw / Rebel', 'Becoming someone new on purpose. The past is proof, not a prison.', 'Stuck in rebellion', 'reborn', 24],
  ['⚡', 'The Prodigy', 'Mastery belongs to the obsessed.', 'Explorer', 'Obsessed with improvement. Competing with who they were yesterday, refusing every ceiling.', 'Never enough', 'prodigy', 45],
  ['🔥', 'The Relentless', "This isn't balance. This is a season of war.", 'Hero', 'Chooses intensity over comfort, on purpose. Disciplined and all-in, for a season, not forever.', 'Burnout', 'demon-grind', 14],
  ['🧠', 'The Strategist', 'Most people react to life. You position ahead of it.', 'Magician', 'Thinks ahead: patterns, timing, leverage. Moves on the decisions that actually shift the board.', 'Analysis paralysis', 'strategist', 255],
];

// Blog categories are derived from the slug (the Webflow "Category" field was empty).
// Each kind of post has its own page at /blog/<page>, with its own title and intro for search.
export const kinds = [
  { id: 'watch-order', label: 'Watch Orders', test: s => /watch-order|in-order/.test(s), page: 'watch-orders',
    h1: 'Anime Watch Order Guides',
    metaTitle: 'Anime Watch Order Guides: Every Series in the Right Order | Kaminari',
    description: 'Anime watch order guides for long-running series: every season, movie, OVA and spin-off in the right order, with what you can skip.',
    intro: 'Long-running anime rarely make the order obvious. Seasons get renamed, movies slot in between arcs, and spin-offs and OVAs pile up. Each guide lays out the full watch order, where the movies fit, and which extras you can safely skip, so you can start a series knowing exactly where every piece goes.' },
  { id: 'filler-list', label: 'Filler Lists', test: s => /filler/.test(s), page: 'filler-lists',
    h1: 'Anime Filler Lists',
    metaTitle: 'Anime Filler Lists: Which Episodes to Skip | Kaminari',
    description: 'Anime filler lists that show which episodes are canon, mixed or filler, so you can skip what you don’t need and keep the story moving.',
    intro: 'Filler can stretch a great series into a slog. These lists break down every episode as canon, mixed or filler, point out the filler worth watching anyway, and show what you can skip without missing a beat of the story.' },
  { id: 'quotes', label: 'Quotes', test: s => /quotes/.test(s), page: 'quotes',
    h1: 'Anime Quotes',
    metaTitle: 'Anime Quotes: Iconic Lines From Your Favorite Characters | Kaminari',
    description: 'The most memorable anime quotes from your favorite characters, with the context behind each line and what it means.',
    intro: 'Some lines stay with you long after the episode ends. These collections gather the most memorable quotes from anime characters, with the moment each line comes from and why it hits, from rallying cries to quiet truths worth living by.' },
  { id: 'anime-like', label: 'Anime Like…', test: s => /^(top-)?anime-like|anime-like-/.test(s), page: 'anime-like',
    h1: 'Anime Like Your Favorites',
    metaTitle: 'Anime Like Your Favorites: What to Watch Next | Kaminari',
    description: 'Finished a favorite and need something next? Anime recommendations ranked by how closely each show matches the one you loved.',
    intro: 'Finished a favorite and nothing else feels right? Each list picks shows that share what made the original work, its setup, its tone or its kind of hero, ranked from closest match to loosest, so you can find your next watch fast.' },
  { id: 'characters', label: 'Characters', test: s => /anime-characters/.test(s), page: 'characters',
    h1: 'Anime Characters',
    metaTitle: 'Anime Character Lists: The Best of Every Type | Kaminari',
    description: 'Anime character lists: the best villains, geniuses, heroes and more, with who they are, what makes them stand out, and where to watch.',
    intro: 'From geniuses and villains to quiet heroes, these lists round up standout anime characters by type, with who each one is, what makes them memorable, and which show to watch to meet them.' },
  { id: 'lessons', label: 'Lessons', test: () => true, page: 'lessons',
    h1: 'Anime Life Lessons',
    metaTitle: 'Anime Life Lessons: Mindset and Growth From Anime | Kaminari',
    description: 'Life lessons from anime: discipline, mindset and growth from the characters and stories you love, turned into habits you can use.',
    intro: 'Anime is full of lessons hiding in plain sight: discipline, resilience, purpose. These posts pull them out of the stories you love and turn them into something you can use in your own life.' },
];
