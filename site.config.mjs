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
  email: 'joinkaminari@gmail.com',
  advertiseEmail: 'hello@joinkaminari.com',
};

export const links = {
  substack: 'https://joinkaminari.substack.com/',
  substackEmbed: 'https://joinkaminari.substack.com/embed',
  quiz: 'https://kaminari-archetype-quiz.vercel.app/',
  templates: 'https://kaminari4.gumroad.com/l/anime-mindset-system',
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
    name: "Will O'Neal", role: 'Co-Founder', photo: '/assets/team/will-oneal.png',
    socials: [['Instagram', 'https://www.instagram.com/chill.will14/']],
    top5: ['My Hero Academia', 'One Piece', 'The Fate Series', 'Attack on Titan', 'Food Wars'],
  },
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

export const archetypes = [
  ['🎭', 'The Free Spirit', 'You refuse to let the weight steal the joy.', 'Jester', 'Moves through life light. Humor and presence as real resilience that outlasts the heaviness.', 'Avoidance'],
  ['❤️‍🔥', 'The Devoted', 'You do it with your whole chest.', 'Lover', 'Passion as fuel. Cares completely about their people, their craft, their mission.', 'Losing yourself'],
  ['🌱', 'The Underdog', "You started with nothing special. That's why you'll prove it.", 'Everyman', 'No head start, no shortcuts, just grit. Rises from behind and makes people root for them.', 'Victim mentality'],
  ['✨', 'The Believer', "Hope isn't naive. It's the engine.", 'Innocent', "Keeps the faith most people lost. Optimism that's contagious and pulls people forward.", 'Naivety'],
  ['🔮', 'The Visionary', 'You move like the future already exists.', 'Creator', "Sees what isn't there yet and is compelled to build it. Constraints look like a blank canvas.", 'Never shipping'],
  ['🎯', 'The Social Commander', 'People follow conviction, not titles.', 'Ruler', 'Sets the standard in any room. Presence, charisma, and decisiveness that makes people move.', 'Control & ego'],
  ['🕯️', 'The Beacon', "You don't just rise. You bring people with you.", 'Caregiver', 'Leads by example and builds rooms for others. The kind of strength that multiplies.', 'Martyrdom'],
  ['🌊', 'The Reborn', 'You shed a version of yourself that no longer served you.', 'Outlaw / Rebel', 'Becoming someone new on purpose. The past is proof, not a prison.', 'Stuck in rebellion'],
  ['⚡', 'The Prodigy', 'Mastery belongs to the obsessed.', 'Explorer', 'Obsessed with improvement. Competing with who they were yesterday, refusing every ceiling.', 'Never enough'],
  ['🔥', 'The Relentless', "This isn't balance. This is a season of war.", 'Hero', 'Chooses intensity over comfort, on purpose. Disciplined and all-in, for a season, not forever.', 'Burnout'],
  ['🧠', 'The Strategist', 'Most people react to life. You position ahead of it.', 'Magician', 'Thinks ahead: patterns, timing, leverage. Moves on the decisions that actually shift the board.', 'Analysis paralysis'],
];

// Blog categories are derived from the slug (the Webflow "Category" field was empty).
export const kinds = [
  { id: 'watch-order', label: 'Watch Orders', test: s => /watch-order|in-order/.test(s) },
  { id: 'filler-list', label: 'Filler Lists', test: s => /filler/.test(s) },
  { id: 'quotes', label: 'Quotes', test: s => /quotes/.test(s) },
  { id: 'anime-like', label: 'Anime Like…', test: s => /^(top-)?anime-like|anime-like-/.test(s) },
  { id: 'characters', label: 'Characters', test: s => /anime-characters/.test(s) },
  { id: 'lessons', label: 'Lessons', test: () => true },
];
