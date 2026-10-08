// Arc Tracker — ported from prototype/arc-tracker.html (game rules, copy and animations unchanged).
// Saves to this browser's localStorage. The shared Board is not included yet; it needs a real backend.
(() => {
/* ---------------- Archetype data ---------------- */
const ARCHETYPES = [
  {key:'strategist',emoji:'🧠',title:'The Strategist',alias:'Magician',hue:255,
   quote:"I don't chase outcomes. I position myself for them.",
   check:"You're the one thinking three moves ahead while everyone else reacts, you'd rather wait for the right moment than force one, you overthink before you commit, and people come to you for \u201cwhat's actually going on here.\u201d",
   light:'Pattern recognition, timing, the long game.',
   shadow:'Manipulation & paralysis. Overthinks, never commits.',
   integration:'A plan you never execute is a fantasy with footnotes. Move.',
   anime:'Shikamaru Nara, L.',
   ranks:[{name:'Reactor',ms:0},{name:'Analyst',ms:10},{name:'Operator',ms:25},{name:'Tactician',ms:50},{name:'Grandmaster',ms:100}],
   lightHabits:['Write tomorrow\u2019s top 3 priorities before bed','Review one system or process for 10 minutes','Study one example of someone who executed well'],
   shadowOptions:['Make one decision today with the info you already have, no more research','Ship one \u201cgood enough\u201d version instead of the perfect one','Set a 10-minute timer and act when it ends, decision or not']},
  {key:'demon-grind',emoji:'🔥',title:'The Relentless',alias:'Hero',hue:14,
   quote:"I don't stop when I'm tired. I stop when I'm done.",
   check:"You measure your day by how hard you worked, resting feels like falling behind, you'd rather suffer through it than half-do it, and quitting isn't in your vocabulary even when you probably should.",
   light:'Discipline, courage, willingness to suffer for the goal.',
   shadow:"Burnout. Worth = output, can't rest.",
   integration:'Rest is part of the contract. The grind is a season, not an identity.',
   anime:'Guts, early Eren Yeager.',
   ranks:[{name:'Recruit',ms:0},{name:'Grinder',ms:10},{name:'Warhorse',ms:25},{name:'Berserker',ms:50},{name:'Juggernaut',ms:100}],
   lightHabits:['Do the hardest task first, before anything else','Track your work hours honestly','Push one set, rep, or task past where you wanted to stop'],
   shadowOptions:['Take one full rest day this week, tracked like a habit','Stop working at a set time, no exceptions','Do something purely for fun, not output, for 15 minutes']},
  {key:'prodigy',emoji:'⚡',title:'The Prodigy',alias:'Explorer',hue:45,
   quote:"I'm competing with who I was yesterday.",
   check:"You're only satisfied compared to yesterday's version of you, ceilings annoy you, you pick up new skills fast and get bored once you're \u201cgood enough,\u201d and you rarely sit with a win before chasing the next one.",
   light:'Obsessive improvement, adaptability, refuses ceilings.',
   shadow:"Never enough. Identity fused to achievement, can't enjoy the win.",
   integration:'Learn to land, not just launch.',
   anime:'Rock Lee, Izuku Midoriya.',
   ranks:[{name:'Novice',ms:0},{name:'Climber',ms:10},{name:'Riser',ms:25},{name:'Breakthrough',ms:50},{name:'Prodigy',ms:100}],
   lightHabits:['Learn or practice one new skill for 15 minutes','Review yesterday\u2019s work and note one improvement','Push past your usual comfort point in one rep or task'],
   shadowOptions:['Write down one win from today before moving to the next thing','Say \u201cthat\u2019s good enough\u201d out loud and stop','Sit with a finished thing for 60 seconds before starting the next']},
  {key:'reborn',emoji:'🌊',title:'The Reborn',alias:'Outlaw / Rebel',hue:24,
   quote:"My past is not my prison. It's my proof.",
   check:"You've reinvented yourself before and you're not scared to do it again, your past embarrasses you more than it should, you burn bridges when you're done with a chapter, and you'd rather be misunderstood than go back to who you were.",
   light:'Transformation, resilience, burns what no longer serves.',
   shadow:"Stuck in the rebellion. Can't forgive the old self, burns bridges.",
   integration:"You don't have to hate who you were to love who you're becoming.",
   anime:'Zuko, Vegeta, Naruto Uzumaki.',
   ranks:[{name:'Ashes',ms:0},{name:'Ember',ms:10},{name:'Flame',ms:25},{name:'Wildfire',ms:50},{name:'Inferno',ms:100}],
   lightHabits:['Do one thing your old self would never have done','Write one line connecting today to who you\u2019re becoming','Cut one habit that belongs to the old chapter'],
   shadowOptions:['Say one fair thing about your past self today','Reach out to someone from a burned bridge, if it\u2019s safe to','Name one thing your old self actually got right']},
  {key:'beacon',emoji:'🕯️',title:'The Beacon',alias:'Caregiver',hue:42,
   quote:"My success is loudest when the people around me are winning too.",
   check:"You notice when someone else is struggling before they say anything, you give more than you ask for, people lean on you by default, and you're the last one to admit when you're running on empty.",
   light:'Generosity, loyalty, legacy-thinking.',
   shadow:'Martyrdom. Pours into everyone but himself, quiet resentment.',
   integration:"You can't pour from an empty cup. Protect your own arc.",
   anime:'Whitebeard, All Might.',
   ranks:[{name:'Candle',ms:0},{name:'Torchbearer',ms:10},{name:'Guardian',ms:25},{name:'Lighthouse',ms:50},{name:'Guiding Star',ms:100}],
   lightHabits:['Check in on one person without being asked','Do one thing that makes someone else\u2019s day easier','Share credit for something out loud'],
   shadowOptions:['Ask someone else for help today','Say no to one request that would drain you','Spend 15 minutes on something just for you']},
  {key:'social-commander',emoji:'🎯',title:'The Social Commander',alias:'Ruler',hue:340,
   quote:'People remember how you made them feel.',
   check:"People remember the room differently after you're in it, you naturally end up leading even when you didn't ask to, you have strong opinions about how things should be done, and you get uncomfortable when no one's steering.",
   light:'Presence, charisma, decisiveness, makes people believe.',
   shadow:'Control & ego. Image over substance, needs the spotlight.',
   integration:'Real authority serves the room. Lead so others can lead.',
   anime:'Erwin Smith, Lelouch vi Britannia.',
   ranks:[{name:'Voice',ms:0},{name:'Presence',ms:10},{name:'Influencer',ms:25},{name:'Leader',ms:50},{name:'Commander',ms:100}],
   lightHabits:['Lead one conversation or meeting with a clear point of view','Make one decisive call instead of polling the room','Practice your pitch or message out loud'],
   shadowOptions:['Let someone else lead today, on purpose','Ask for feedback and just listen, no rebuttal','Give credit to someone else before taking any yourself']},
  {key:'believer',emoji:'✨',title:'The Believer',alias:'Innocent',hue:50,
   quote:'The dream is worth believing in, so I do, fully.',
   check:"You're the one still hopeful when everyone else has given up, you take people at their word until they prove otherwise, you get hurt by cynicism more than most, and you'd rather believe in something and be wrong than believe in nothing.",
   light:'Optimism, faith, purity of purpose, contagious hope.',
   shadow:'Naivety. Denies hard truths, leans on hope instead of action.',
   integration:'Faith without eyes open is fragile. Believe and prepare.',
   anime:'Monkey D. Luffy, Tanjiro Kamado, Gon Freecss.',
   ranks:[{name:'Hopeful',ms:0},{name:'Faithful',ms:10},{name:'Steadfast',ms:25},{name:'Unshaken',ms:50},{name:'Luminous',ms:100}],
   lightHabits:['Write down one thing you\u2019re hopeful about','Encourage one person today','Take in something that renews your belief in the goal'],
   shadowOptions:['Write down one hard truth you\u2019ve been avoiding','Make one backup plan for something you\u2019re hoping works out','Ask a skeptic what they\u2019d push back on']},
  {key:'underdog',emoji:'🌱',title:'The Underdog',alias:'Everyman',hue:132,
   quote:"I started with nothing special. That's exactly why I'll prove it.",
   check:"You've never felt like the most talented person in the room, you're used to being counted out, you work quietly instead of announcing your plans, and you're motivated more by proving people wrong than by trophies.",
   light:'Grit, relatability, grounded, rises from behind.',
   shadow:'Victim mentality. Plays small, \u201cI\u2019m just average,\u201d fears standing out.',
   integration:"Humble and hungry. Don't let \u201cordinary\u201d become an excuse.",
   anime:'Krillin, Yuji Itadori.',
   ranks:[{name:'Earthling',ms:0},{name:'Fighter',ms:10},{name:'Elite Saiyan',ms:25},{name:'Super Saiyan',ms:50},{name:'Ascended Saiyan',ms:100}],
   lightHabits:['Do one rep or task that proves the doubters wrong','Track a small win, no matter how minor','Study someone who started where you\u2019re starting'],
   shadowOptions:['Say one thing out loud you\u2019re actually good at','Take up space in a room today instead of shrinking','Ask for something you deserve instead of waiting to be noticed']},
  {key:'free-spirit',emoji:'🎭',title:'The Free Spirit',alias:'Jester',hue:300,
   quote:'I refuse to let the weight steal the joy.',
   check:"You use humor to defuse tension, you'd rather laugh through a hard week than talk about it directly, commitment makes you a little itchy, and people say you're \u201cfun to be around\u201d more than they say you're \u201cdeep.\u201d",
   light:'Lightness, presence, resilience through humor, lifts morale.',
   shadow:'Avoidance. Deflects pain with jokes, never goes deep, runs from commitment.',
   integration:'Joy is strength; escape is not. Let yourself feel it, then laugh.',
   anime:'Gintoki Sakata, Bon Clay.',
   ranks:[{name:'Free Radical',ms:0},{name:'Jester',ms:10},{name:'Trickster',ms:25},{name:'Wildcard',ms:50},{name:'Nomad',ms:100}],
   lightHabits:['Make someone laugh on purpose today','Try something new just because it sounds fun','Lighten a tense moment with humor'],
   shadowOptions:['Sit with a hard feeling for 5 minutes without deflecting','Have one direct, serious conversation you\u2019ve been avoiding','Follow through on one commitment instead of floating past it']},
  {key:'balanced-master',emoji:'🧘',title:'The Balanced Master',alias:'The Self',endgame:true,hue:170,
   quote:'Calm is a different kind of strength.',
   shadow:'Detachment & complacency. Uses \u201cbalance\u201d to avoid intensity or risk.',
   integration:'Balance is earned through fire, not avoidance of it.',
   anime:'Uncle Iroh, Kakashi Hatake.'}
];

const ARCHETYPE_ICONS = {"lone-wolf": "<path d=\"M24 44 L17.5 37 L11 31 L9.5 20 L12.5 6.5 L19.5 14.5 H28.5 L35.5 6.5 L38.5 20 L37 31 L30.5 37 Z\" fill=\"currentColor\" fill-opacity=\".16\"/> <path d=\"M12.5 6.5 L15 17 M35.5 6.5 L33 17\" stroke-opacity=\".6\"/> <path d=\"M24 14.5 V25\" stroke-opacity=\".5\"/> <path d=\"M15.5 22.5 L21 25.5 M32.5 22.5 L27 25.5\"/> <circle cx=\"19.3\" cy=\"24.5\" r=\".9\" fill=\"currentColor\"/><circle cx=\"28.7\" cy=\"24.5\" r=\".9\" fill=\"currentColor\"/> <path d=\"M21 31 L24 34.5 L27 31 Z\" fill=\"currentColor\"/> <path d=\"M24 34.5 V38.5\" stroke-opacity=\".6\"/> <path d=\"M9.5 27 L14.5 29 M38.5 27 L33.5 29 M11 31 L15.5 33.5 M37 31 L32.5 33.5\" stroke-opacity=\".55\"/>", "social-commander": "<path d=\"M13.5 23 L15 12.5 L20 18 L24 9.5 L28 18 L33 12.5 L34.5 23 Z\" fill=\"currentColor\" fill-opacity=\".18\"/> <rect x=\"13\" y=\"23\" width=\"22\" height=\"3.5\" rx=\"1\"/> <circle cx=\"15\" cy=\"12\" r=\"1.3\" fill=\"currentColor\"/><circle cx=\"24\" cy=\"9\" r=\"1.5\" fill=\"currentColor\"/><circle cx=\"33\" cy=\"12\" r=\"1.3\" fill=\"currentColor\"/> <circle cx=\"24\" cy=\"24.7\" r=\".9\" fill=\"currentColor\"/> <path d=\"M22 42 C15 41 10 36 9 28\"/><path d=\"M26 42 C33 41 38 36 39 28\"/> <path d=\"M10.2 33 c-2.4-.4-3.8-2-4-4 c2.2 0 3.7 1.4 4 4z\" fill=\"currentColor\" fill-opacity=\".45\"/> <path d=\"M13.3 38 c-2.4.3-4.2-.8-5-2.6 c2.1-.5 4 .5 5 2.6z\" fill=\"currentColor\" fill-opacity=\".45\"/> <path d=\"M18 41.3 c-2 1.2-4.1 1-5.4-.3 c1.8-1.1 3.9-1 5.4.3z\" fill=\"currentColor\" fill-opacity=\".45\"/> <path d=\"M37.8 33 c2.4-.4 3.8-2 4-4 c-2.2 0-3.7 1.4-4 4z\" fill=\"currentColor\" fill-opacity=\".45\"/> <path d=\"M34.7 38 c2.4.3 4.2-.8 5-2.6 c-2.1-.5-4 .5-5 2.6z\" fill=\"currentColor\" fill-opacity=\".45\"/> <path d=\"M30 41.3 c2 1.2 4.1 1 5.4-.3 c-1.8-1.1-3.9-1-5.4.3z\" fill=\"currentColor\" fill-opacity=\".45\"/>", "demon-grind": "<path d=\"M11 27 H36 C36 30.5 32.5 32 29 32 V35.5 H32.5 V40 H14.5 V35.5 H18 V32 C14 32 12 30 11 27 Z\" fill=\"currentColor\" fill-opacity=\".18\"/> <path d=\"M11 27 C8 27 5.5 25.5 4 23.5 C6.5 23.5 9 24.5 11 25.5\"/> <path d=\"M11 25.5 V27\"/> <path d=\"M27 21.5 L39 7.5\"/> <path d=\"M34.5 4.5 L42.5 11.5 L40 14.3 L32 7.3 Z\" fill=\"currentColor\" fill-opacity=\".35\"/> <path d=\"M24 22 L22 16\"/><path d=\"M20 23 L15 19\"/><path d=\"M28 23.5 L31.5 21\"/><path d=\"M18 25 L13 24\"/> <circle cx=\"21\" cy=\"12.5\" r=\".9\" fill=\"currentColor\"/><circle cx=\"12.5\" cy=\"17\" r=\".8\" fill=\"currentColor\"/> <path d=\"M21 35.5 C19.5 33.5 21 32 22.5 31 C22.5 32.5 24 33 25.5 32 C26 34 25 35.5 24 35.5\" fill=\"currentColor\" fill-opacity=\".5\"/>", "prodigy": "<path d=\"M5 18 H18.5\"/><path d=\"M29.5 18 H43\"/> <path d=\"M18.5 18 L16 14.5\"/><path d=\"M18.5 18 L15.5 21\"/><path d=\"M29.5 18 L32.5 14.5\"/><path d=\"M29.5 18 L32 21.5\"/> <path d=\"M13 12 l1.5-2.5\"/><path d=\"M35 11.5 l-1.2-2.8\"/> <path d=\"M24 41 V9\"/> <path d=\"M17.5 14 L24 5 L30.5 14 Z\" fill=\"currentColor\" fill-opacity=\".35\"/> <path d=\"M5 43 H12 V38 H18 V33 H22\"/> <path d=\"M26 33 H30 V38 H36 V43 H43\" stroke-opacity=\".45\"/> <circle cx=\"39\" cy=\"28\" r=\".9\" fill=\"currentColor\"/><circle cx=\"9\" cy=\"28\" r=\".9\" fill=\"currentColor\"/>", "strategist": "<circle cx=\"24\" cy=\"24\" r=\"17\"/> <circle cx=\"24\" cy=\"24\" r=\"12.5\" stroke-opacity=\".45\"/> <path d=\"M24 5 V9 M24 39 V43 M5 24 H9 M39 24 H43\" /> <path d=\"M11 11 l2.5 2.5 M37 11 l-2.5 2.5 M11 37 l2.5-2.5 M37 37 l-2.5-2.5\" stroke-opacity=\".6\"/> <path d=\"M24 12 L28 24 L24 36 L20 24 Z\"/> <path d=\"M24 12 L28 24 L20 24 Z\" fill=\"currentColor\" fill-opacity=\".5\"/> <circle cx=\"24\" cy=\"24\" r=\"1.6\" fill=\"currentColor\"/>", "reborn": "<path d=\"M24 34 C21 30 21 24 24 19 C27 24 27 30 24 34 Z\" fill=\"currentColor\" fill-opacity=\".3\"/> <circle cx=\"24\" cy=\"16\" r=\"2.2\"/> <path d=\"M22.5 22 C18 17 11 17 5 10 C7 17 12 22 19 25\"/> <path d=\"M25.5 22 C30 17 37 17 43 10 C41 17 36 22 29 25\"/> <path d=\"M10 14.5 C13 17 16 18 19 19\" stroke-opacity=\".55\"/><path d=\"M38 14.5 C35 17 32 18 29 19\" stroke-opacity=\".55\"/> <path d=\"M17 43 C14 39 16 35 19 34 C18.5 37 21 38 22 36 C23 39 25 39 26 36 C27 38 29.5 37 29 34 C32 35 34 39 31 43 Z\" fill=\"currentColor\" fill-opacity=\".45\"/>", "beacon": "<path d=\"M19 42 L21 18 H27 L29 42 Z\" fill=\"currentColor\" fill-opacity=\".18\"/> <path d=\"M20.2 32 H27.8 M19.7 37 H28.3 M20.7 26 H27.3\" stroke-opacity=\".7\"/> <path d=\"M20 18 H28 V14 H20 Z\"/> <path d=\"M21 14 C21 11 22.5 9.5 24 9.5 C25.5 9.5 27 11 27 14\"/> <circle cx=\"24\" cy=\"16\" r=\"1.2\" fill=\"currentColor\"/> <path d=\"M18 15 L7 11 M18 16.5 L6 18\" /><path d=\"M30 15 L41 11 M30 16.5 L42 18\"/> <path d=\"M13 42 H35\"/>", "visionary": "<path d=\"M9 30 L30 18 L32.5 22.5 L11.5 34.5 Z\" fill=\"currentColor\" fill-opacity=\".2\"/> <path d=\"M30 18 L33.5 16 L36.5 21 L32.5 22.5\"/> <path d=\"M19 28 L16 42 M21.5 27 L24 42 M20.3 27.5 L20.3 42\" /> <path d=\"M39 5 L40.4 8.6 L44 10 L40.4 11.4 L39 15 L37.6 11.4 L34 10 L37.6 8.6 Z\" fill=\"currentColor\" fill-opacity=\".55\"/> <circle cx=\"30\" cy=\"7\" r=\".9\" fill=\"currentColor\"/><circle cx=\"44\" cy=\"20\" r=\".8\" fill=\"currentColor\"/>", "believer": "<path d=\"M13 33 A11 11 0 0 1 35 33 Z\" fill=\"currentColor\" fill-opacity=\".3\"/> <path d=\"M6 33 H42\"/><path d=\"M12 38 H36\" stroke-opacity=\".55\"/><path d=\"M18 42.5 H30\" stroke-opacity=\".3\"/> <path d=\"M24 8 V16 M11.5 13.5 L16.5 19 M36.5 13.5 L31.5 19 M5 24 L11.5 26.5 M43 24 L36.5 26.5\"/>", "underdog": "<path d=\"M6 32 H42 V42 H6 Z\" fill=\"currentColor\" fill-opacity=\".15\"/> <path d=\"M24 32 L21.5 36 L25 38.5 L22.5 42\"/> <path d=\"M11 36 L15 37 M32 38 L37 36\" stroke-opacity=\".5\"/> <path d=\"M24 32 C24 26 24 20 24 14\"/> <path d=\"M24 22 C19 22 14.5 19 14 13 C19.5 13.5 23.5 17 24 22 Z\" fill=\"currentColor\" fill-opacity=\".4\"/> <path d=\"M24 17 C28 16 33 12 33 6 C28 6.5 24.5 10.5 24 17 Z\" fill=\"currentColor\" fill-opacity=\".4\"/>", "devoted": "<path d=\"M24 41 C12 33 6 26 6 18 C6 12 10 8 15.5 8 C19.5 8 22.5 10.5 24 13.5 C25.5 10.5 28.5 8 32.5 8 C38 8 42 12 42 18 C42 26 36 33 24 41 Z\"/> <path d=\"M24 33 C19.5 30.5 18.5 25.5 21 21.5 C21.5 24 23 24.5 24 23 C23.5 20 25 17 27.5 15.5 C27 19 30 21 29.5 25.5 C29 29.5 27 32 24 33 Z\" fill=\"currentColor\" fill-opacity=\".45\"/>", "free-spirit": "<path d=\"M13 37 C13 25 22 13 37 8 C35 21 27 32 13 37 Z\" fill=\"currentColor\" fill-opacity=\".2\"/> <path d=\"M13 37 L30 16\"/> <path d=\"M18.5 30.5 L16 26 M22 26 L20 20.5 M25.5 22 L24.5 16 M20 29 L25 30 M23.5 25 L29 25.5 M27 20.5 L32.5 20\"/> <path d=\"M6 42 C12 42 13 38 18 38 C23 38 23 42 29 42\" stroke-opacity=\".6\"/> <path d=\"M30 36 C33 36 34 33.5 37 33.5 C40 33.5 40.5 36 43 36\" stroke-opacity=\".4\"/>", "balanced-master": "<path d=\"M38.5 13 A17 17 0 1 0 41 24\" stroke-width=\"2.6\"/> <path d=\"M24 34 C20 30 20 23 24 17 C28 23 28 30 24 34 Z\" fill=\"currentColor\" fill-opacity=\".35\"/> <path d=\"M23 34 C18 33 14 29 13 23 C17 24 20 27 22 31\"/> <path d=\"M25 34 C30 33 34 29 35 23 C31 24 28 27 26 31\"/> <path d=\"M14 36 H34\" stroke-opacity=\".5\"/>"};
const ARCHETYPE_ART = Object.fromEntries(ARCHETYPES.map(a => [a.key, '/assets/avatars/' + a.key + '.png']));
// The current quote for the member's archetype; a new one drops every Monday and Thursday. The list
// comes from api/arc-quotes.js (build.mjs adds it to the top of this file as ARC_QUOTES) and the pick
// matches quoteFor() there, so the tracker and the notification agree.
function dailyQuote(arche, dateStr){
  const list = arche && window.ARC_QUOTES && window.ARC_QUOTES[arche.key];
  if(!list || !list.length) return null;
  const p = dateStr.split('-').map(Number);
  const sinceMonday = Math.floor(Date.UTC(p[0], p[1]-1, p[2]) / 86400000) - 4;
  const week = Math.floor(sinceMonday/7), dow = sinceMonday - week*7;
  const index = week*2 + (dow>=3 ? 1 : 0);
  return list[((index % list.length) + list.length) % list.length];
}
// Smoke rolls in, then clears to show the quote. Plays when a quote notification is opened, and when
// the quote on the Today tab is tapped.
function showQuoteReveal(){
  const arche = getArchetype(profile.archetypeKey);
  const dq = dailyQuote(arche, todayStr());
  const root = document.querySelector('.arc-root');
  if(!dq || !root || document.querySelector('.quote-reveal')) return;
  let puffs = '';
  for(let i=0;i<14;i++){
    const angle = (i/14)*Math.PI*2, far = 34 + (i%3)*10;
    puffs += '<i style="--x:'+(50+Math.cos(angle)*(8+(i%4)*7)).toFixed(1)+'%;--y:'+(50+Math.sin(angle)*(6+(i%5)*6)).toFixed(1)+'%;'+
      '--dx:'+(Math.cos(angle)*far).toFixed(1)+'vw;--dy:'+(Math.sin(angle)*far).toFixed(1)+'vh;--s:'+(190+(i%4)*70)+'px;--d:'+(i%5)*0.12+'s;"></i>';
  }
  const el = document.createElement('div');
  el.className = 'quote-reveal';
  el.setAttribute('role','dialog');
  el.setAttribute('aria-label','Your arc quote');
  el.innerHTML = '<div class="qr-card"><div class="qr-kicker">'+escapeHtml(arche.title)+'</div>'+
    '<p class="qr-quote">\u201c'+escapeHtml(dq.q)+'\u201d</p>'+
    '<div class="qr-by">Inspired by '+escapeHtml(dq.c)+'</div>'+
    '<button class="btn" type="button">Continue</button></div>'+
    '<div class="qr-smoke" aria-hidden="true">'+puffs+'</div>';
  const close = ()=>{ el.classList.add('out'); setTimeout(()=>el.remove(), 350); document.removeEventListener('keydown', onKey); };
  const onKey = (e)=>{ if(e.key==='Escape') close(); };
  el.querySelector('button').addEventListener('click', close);
  el.addEventListener('click', (e)=>{ if(e.target===el) close(); });
  document.addEventListener('keydown', onKey);
  root.appendChild(el);
  el.querySelector('button').focus({preventScroll:true});
}
function iconSVG(arche, size){
  if(arche && ARCHETYPE_ART[arche.key]){
    return '<img class="avatar" src="'+ARCHETYPE_ART[arche.key]+'" alt="" width="'+size+'" height="'+size+'" style="width:'+size+'px;height:'+size+'px;">';
  }
  if(!arche || !ARCHETYPE_ICONS[arche.key]) return '<img class="kbolt" src="/assets/kaminari-bolt.png" alt="" width="12" height="16">';
  const hue = (arche.hue!=null)?arche.hue:170;
  return '<svg class="aicon" viewBox="0 0 48 48" width="'+size+'" height="'+size+'" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="color:hsl('+hue+' 78% 55%);display:inline-block;vertical-align:middle;flex-shrink:0;" aria-hidden="true">'+ARCHETYPE_ICONS[arche.key]+'</svg>';
}

/* ---------------- Storage ---------------- */
const LS = {profile:'arc_profile',habits:'arc_habits',log:'arc_log',weekly:'arc_weekly',reminder:'arc_reminder'};
function load(k,fb){ try{ const r=localStorage.getItem(k); return r?JSON.parse(r):fb; }catch(e){ return fb; } }
function persist(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }

let profile = load(LS.profile,{name:'',archetypeKey:''});
let habits  = load(LS.habits,{h1:{cue:'',habit:''},h2:{cue:'',habit:''},h3:{cue:'',habit:''},sc:{cue:'',habit:''}});
let log     = load(LS.log,[]);
let weekly  = load(LS.weekly,[]);
let reminder= load(LS.reminder,{enabled:false,time:'08:00',lastFired:''});

// The "Preview the animations" section is a demo tool, not something members should play with:
// it only appears when the address ends in ?demo
const DEMO = new URLSearchParams(location.search).has('demo');

/* ---------------- Date / stats helpers ---------------- */
function todayStr(){ const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function dfs(s){ const p=s.split('-').map(Number); return new Date(p[0],p[1]-1,p[2]); }
function dayGap(a,b){ return Math.round((dfs(b)-dfs(a))/86400000); }
function fmtDate(s){ return dfs(s).toLocaleDateString(undefined,{month:'short',day:'numeric'}); }

function getArchetype(key){ return ARCHETYPES.find(a=>a.key===key); }

function computeStats(){
  const sorted=[...log].sort((a,b)=>a.date.localeCompare(b.date));
  let fullClear=0, xp=0, shadowTotal=0;
  sorted.forEach(e=>{
    if(e.h1&&e.h2&&e.h3) fullClear++;
    if(e.sc) shadowTotal++;
    xp += (e.h1?10:0)+(e.h2?5:0)+(e.h3?5:0)+(e.sc?5:0)+((e.note||'').trim()?2:0);
  });
  let currentStreak=0;
  for(let i=sorted.length-1;i>=0;i--){
    const e=sorted[i];
    if(i<sorted.length-1){ if(dayGap(e.date,sorted[i+1].date)!==1) break; }
    if(!e.h1) break;
    currentStreak++;
  }
  let longest=0, run=0;
  for(let i=0;i<sorted.length;i++){
    const e=sorted[i];
    if(i>0 && dayGap(sorted[i-1].date,e.date)!==1) run=0;
    if(e.h1){ run++; longest=Math.max(longest,run); } else { run=0; }
  }
  let shadowStreak=0;
  for(let i=sorted.length-1;i>=0;i--){
    const e=sorted[i];
    if(i<sorted.length-1){ if(dayGap(e.date,sorted[i+1].date)!==1) break; }
    if(!e.sc) break;
    shadowStreak++;
  }
  return {totalDays:sorted.length, fullClear, xp, currentStreak, longest, shadowTotal, shadowStreak, sorted};
}

const SHADOW_BADGES=[{name:'Shadow Aware',n:10},{name:'Shadow Tamed',n:25},{name:'Shadow Integrated',n:50}];

function rankInfo(archetype, fullClear){
  if(!archetype || !archetype.ranks) return null;
  let idx=0;
  for(let i=0;i<archetype.ranks.length;i++){ if(fullClear>=archetype.ranks[i].ms) idx=i; }
  return {cur:archetype.ranks[idx], next:archetype.ranks[idx+1]||null, idx};
}

/* ---------------- Tabs ---------------- */
document.querySelectorAll('nav.tabs button').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('nav.tabs button').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-'+btn.dataset.tab).classList.add('active');
  });
});

/* ---------------- Header ---------------- */
function renderHeader(){
  const el=document.getElementById('headerBadge');
  const arche=getArchetype(profile.archetypeKey);
  if(!arche){ el.textContent='Set up your character in Setup \u2192'; return; }
  const stats=computeStats();
  const ri=rankInfo(arche, stats.fullClear);
  el.innerHTML = iconSVG(arche,18)+' <b>'+(ri?ri.cur.name:arche.alias)+'</b> &nbsp;\u00b7&nbsp; <span class="flame">\u{1F525}'+stats.currentStreak+'</span>';
}

/* ---------------- Confetti + modal ---------------- */
/* ---------- 3D confetti engine ---------- */
let confettiState=null;
function spawnConfetti(hue, opts){
  hue = (hue==null)?45:hue; opts=opts||{};
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let cv=document.getElementById('confettiCanvas');
  if(!cv){ cv=document.createElement('canvas'); cv.id='confettiCanvas'; document.body.appendChild(cv); }
  const dpr=Math.min(window.devicePixelRatio||1,2);
  const W=window.innerWidth, H=window.innerHeight;
  cv.width=W*dpr; cv.height=H*dpr;
  const ctx=cv.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0);
  const palette=[
    [hue,90,62],[hue,95,72],[(hue+30)%360,90,62],[(hue+330)%360,85,60],[45,95,60],[45,100,75],[0,0,100]
  ];
  const parts = confettiState ? confettiState.parts : [];
  const scale = reduce?0.3:1;
  function make(x,y,vx,vy,kind){
    const c=palette[Math.floor(Math.random()*palette.length)];
    return {x,y,vx,vy,kind,
      w:6+Math.random()*7, h:9+Math.random()*9,
      rot:Math.random()*Math.PI*2, vr:(Math.random()-.5)*0.3,
      flip:Math.random()*Math.PI*2, vf:0.08+Math.random()*0.18,
      wob:Math.random()*Math.PI*2, vw:0.04+Math.random()*0.08,
      c, life:0, max:260+Math.random()*160, tw:Math.random()*Math.PI*2};
  }
  function burst(n, x, y, angle, spread, speed){
    for(let i=0;i<n*scale;i++){
      const a=angle+(Math.random()-.5)*spread, s=speed*(0.55+Math.random()*0.7);
      const r=Math.random();
      parts.push(make(x,y,Math.cos(a)*s,Math.sin(a)*s, r<0.62?'ribbon':(r<0.82?'disc':'spark')));
    }
  }
  // Two side cannons, a center pop, then waves falling from the top
  burst(90, 0, H*0.95, -Math.PI/3.2, 0.7, 22);
  burst(90, W, H*0.95, -Math.PI+Math.PI/3.2, 0.7, 22);
  if(opts.center!==false) burst(70, W/2, H*0.42, -Math.PI/2, Math.PI*2, 13);
  const waves=[600,1300,2100];
  const timers=waves.map(t=>setTimeout(()=>{
    for(let i=0;i<45*scale;i++) parts.push(make(Math.random()*W, -20-Math.random()*60, (Math.random()-.5)*2, 1+Math.random()*2, Math.random()<.75?'ribbon':'spark'));
  },t));
  if(confettiState){ confettiState.timers.push(...timers); return; }
  confettiState={parts,timers};
  function star(x,y,r){
    ctx.beginPath();
    for(let i=0;i<8;i++){const a=i*Math.PI/4, rr=(i%2)?r*0.32:r; ctx.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}
    ctx.closePath(); ctx.fill();
  }
  function frame(){
    ctx.clearRect(0,0,W,H);
    for(let i=parts.length-1;i>=0;i--){
      const p=parts[i];
      p.life++;
      p.vy+= (p.kind==='spark')?0.12:0.26;
      p.vx*=0.985; p.vy*=0.985;
      if(p.vy>3.6 && p.kind!=='spark') p.vy=3.6+ (p.vy-3.6)*0.9; // terminal flutter speed
      p.wob+=p.vw; p.flip+=p.vf; p.rot+=p.vr; p.tw+=0.25;
      p.x+=p.vx+Math.sin(p.wob)*1.4; p.y+=p.vy;
      const fade = p.life>p.max-50 ? Math.max(0,(p.max-p.life)/50) : 1;
      if(p.life>p.max || p.y>H+40){ parts.splice(i,1); continue; }
      const flipCos=Math.cos(p.flip);
      const light = p.c[2] + (flipCos>0? 8 : -18);  // front face bright, back face shaded
      ctx.save();
      ctx.globalAlpha=fade;
      ctx.translate(p.x,p.y);
      ctx.rotate(p.rot);
      if(p.kind==='ribbon'){
        ctx.scale(1, flipCos);
        ctx.fillStyle='hsl('+p.c[0]+','+p.c[1]+'%,'+light+'%)';
        ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);
        ctx.fillStyle='rgba(255,255,255,'+(0.35*Math.max(0,flipCos))+')';
        ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h*0.28);
      } else if(p.kind==='disc'){
        ctx.scale(Math.abs(flipCos)*0.85+0.15, 1);
        ctx.fillStyle='hsl('+p.c[0]+','+p.c[1]+'%,'+light+'%)';
        ctx.beginPath(); ctx.arc(0,0,p.w*0.55,0,Math.PI*2); ctx.fill();
      } else {
        ctx.globalAlpha=fade*(0.55+0.45*Math.sin(p.tw));
        ctx.fillStyle='hsl('+p.c[0]+','+p.c[1]+'%,'+Math.min(92,p.c[2]+20)+'%)';
        ctx.shadowColor='hsl('+p.c[0]+',100%,70%)'; ctx.shadowBlur=10;
        star(0,0,p.w*0.75);
      }
      ctx.restore();
    }
    if(parts.length){ requestAnimationFrame(frame); }
    else { ctx.clearRect(0,0,W,H); cv.remove(); confettiState=null; }
  }
  requestAnimationFrame(frame);
}

/* ---------- celebration queue ---------- */
const celebrationQueue=[]; let celebrating=false;
function queueCelebration(fn){ celebrationQueue.push(fn); if(!celebrating) nextCelebration(); }
function nextCelebration(){
  const fn=celebrationQueue.shift();
  if(!fn){ celebrating=false; return; }
  celebrating=true; fn(()=>setTimeout(nextCelebration,250));
}
function mountCelebration(archetype, innerHtml, ms, onDone, shake){
  const root=document.getElementById('modalRoot');
  const hue=(archetype&&archetype.hue!=null)?archetype.hue:45;
  root.innerHTML='<div class="celebrate-back" id="celBack" style="--hue:'+hue+';"><div class="celebrate'+(shake?' shake':'')+'" id="celBox">'+innerHtml+'</div></div>';
  let done=false;
  const close=()=>{ if(done) return; done=true; const b=document.getElementById('celBack'); if(b){ b.classList.add('out'); setTimeout(()=>{ root.innerHTML=''; onDone&&onDone(); },380);} else { onDone&&onDone(); } };
  document.getElementById('celBack').addEventListener('click',(e)=>{ if(e.target.id==='celBack') close(); });
  const ok=document.getElementById('celOk'); if(ok) ok.addEventListener('click',close);
  setTimeout(close, ms);
}
function avatarStage(archetype, extra){
  const src = (archetype && ARCHETYPE_ART[archetype.key]) ? ARCHETYPE_ART[archetype.key] : '';
  return '<div class="cel-stage"><div class="cel-rays"></div><div class="cel-glow"></div><div class="cel-ring r2"></div><div class="cel-ring r3"></div><div class="cel-ring"></div>'+
    '<div class="cel-avatar">'+(src?'<img src="'+src+'" alt="">':iconSVG(archetype,178))+'</div>'+(extra||'')+'</div>';
}

// Daily: all three habits checked
function showDayCleared(archetype, streak, habitNames, onDone){
  const check='<svg class="cel-check" viewBox="0 0 74 74"><circle cx="37" cy="37" r="33"/><path d="M22 38 L32.5 48.5 L52 27"/></svg>';
  const items=(habitNames||[]).map((n,i)=>'<li style="animation-delay:'+(1.05+i*0.18)+'s;"><b>\u2713</b>'+escapeHtml(n)+'</li>').join('');
  const inner = avatarStage(archetype, check)+
    '<div class="cel-kicker">DAY CLEARED</div>'+
    '<div class="cel-title">All three. Done.</div>'+
    (items?'<ul class="cel-list">'+items+'</ul><br>':'')+
    '<div class="cel-streak">\uD83D\uDD25 '+streak+'-day streak</div>'+
    '<p class="cel-sub">'+(archetype?escapeHtml(archetype.title)+' showed up today.':'You showed up today.')+'</p>'+
    '<button class="btn" id="celOk">Keep the arc going</button>';
  mountCelebration(archetype, inner, 7000, onDone, false);
  setTimeout(()=>spawnConfetti(archetype?archetype.hue:45,{center:false}), 700);
}

// Rank up: crossed a milestone
function showRankUpModal(archetype, rank, prevRank, onDone){
  const inner = avatarStage(archetype, '')+
    '<div class="cel-kicker">RANK UP</div>'+
    '<div class="cel-title">'+escapeHtml(rank.name)+'</div>'+
    (prevRank?'<div class="cel-path"><span class="old">'+escapeHtml(prevRank.name)+'</span><span class="arrow">\u279C</span><span class="new">'+escapeHtml(rank.name)+'</span></div>':'')+
    '<p class="cel-sub">'+rank.ms+' full-clear days, earned the real way. '+escapeHtml(archetype.title)+' moves different now.</p>'+
    '<button class="btn" id="celOk">Claim it</button>';
  mountCelebration(archetype, inner, 9000, onDone, true);
  setTimeout(()=>spawnConfetti(archetype.hue), 550);
}

/* ---------------- Today tab ---------------- */
function renderToday(){
  const el=document.getElementById('tab-today');
  const arche=getArchetype(profile.archetypeKey);
  const stats=computeStats();
  const t=todayStr();
  const existing=log.find(e=>e.date===t);
  const yesterday=(()=>{ const d=dfs(t); d.setDate(d.getDate()-1); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); })();
  const yEntry=log.find(e=>e.date===yesterday);

  let html='';
  if(!arche){
    html += '<div class="banner info"><div>Pick your archetype and name your three habits in <b>Setup</b> before you start logging \u2014 takes about a minute.</div></div>';
  }
  if(yEntry && !yEntry.h1 && stats.currentStreak===0 && stats.totalDays>0){
    html += '<div class="banner warn"><span>\u26A0\uFE0F</span><div><b>Never miss twice.</b> Yesterday\u2019s non-negotiable didn\u2019t happen. One miss is an accident \u2014 the only rule now is don\u2019t miss today too.</div></div>';
  }

  const dq = dailyQuote(arche, t);
  if(dq) html += '<button type="button" class="daily-quote" id="dailyQuoteBtn" title="Replay the reveal"><p class="q">\u201c'+escapeHtml(dq.q)+'\u201d</p><div class="by">Inspired by '+escapeHtml(dq.c)+' \u00b7 '+escapeHtml(arche.title)+' \u00b7 New quote every Monday and Thursday</div></button>';
  html += '<h2 class="section-title">Today \u00b7 '+fmtDate(t)+'</h2>';
  html += '<p class="section-sub">A habit counts once you upload proof: a photo or a short video. No proof, no check.</p>';

  html += '<div class="card">';
  const h1=habits.h1, h2=habits.h2, h3=habits.h3;
  const vals = existing || {h1:false,h2:false,h3:false,sc:false,note:''};
  html += proofline('h1',h1,true);
  html += proofline('h2',h2,false);
  html += proofline('h3',h3,false);
  if(proofError) html += '<div class="proof-error" role="alert">'+escapeHtml(proofError)+'</div>';
  html += '</div>';

  if(arche && arche.shadowOptions){
    const sc = habits.sc||{cue:'',habit:''};
    html += '<div class="card accent"><div style="font-size:11.5px;font-weight:700;color:var(--gold);letter-spacing:0.3px;margin-bottom:2px;">SHADOW-CHECK \u2014 separate from your 3 habits</div>';
    html += '<div class="helptext" style="margin-bottom:8px;">'+arche.title+'\u2019s shadow: '+arche.shadow+'</div>';
    html += checkline('f_sc','sc',sc,vals.sc,false);
    html += '</div>';
  }

  html += '<div class="card"><div style="margin-top:0;"><label for="f_note">One line \u2014 a win or something you\u2019re grateful for</label>';
  html += '<textarea id="f_note" placeholder="Small counts.">'+escapeHtml(vals.note||'')+'</textarea></div>';
  html += '<button class="btn" id="saveDayBtn">Save note'+(arche && arche.shadowOptions?' and shadow-check':'')+'</button>';
  html += ' <span class="helptext" style="margin-left:8px;">Habits save on their own when you add proof.</span>';
  html += '</div>';

  el.innerHTML = html;

  // A habit line has no checkbox to tick: it shows done only while proof for today is attached.
  function proofline(key, h, nonneg){
    const fallback = key==='h1' ? 'Non-negotiable (name it in Setup)' : 'Habit '+key.slice(1)+' (name it in Setup)';
    const label = h.habit ? h.habit : fallback;
    const cue = h.cue ? 'After I '+h.cue : '';
    const p = todayProof[key];
    let row;
    if(p){
      const thumb = p.kind==='image' ? '<img class="proof-thumb" src="'+p.url+'" alt="Your proof">' : '<video class="proof-thumb" src="'+p.url+'" muted playsinline preload="metadata"></video>';
      row = '<a href="'+p.url+'" target="_blank" rel="noopener" title="Open proof">'+thumb+'</a><span class="proof-ok">Proof added</span>'+
        '<label class="proof-link">Replace<input type="file" accept="image/*,video/*" data-proof="'+key+'" hidden></label>'+
        '<button type="button" class="proof-link" data-proof-remove="'+key+'">Remove</button>';
    } else {
      row = '<label class="btn proof-btn">Upload proof<input type="file" accept="image/*,video/*" data-proof="'+key+'" hidden></label>'+
        '<span class="proof-hint">Photo or video</span>';
    }
    return '<div class="checkline'+(nonneg?' nonneg':'')+'"><span class="proof-mark'+(p?' done':'')+'" aria-hidden="true">'+(p?'\u2713':'')+'</span>'+
      '<div class="txt" style="flex:1;min-width:0;"><b>'+escapeHtml(label)+'</b>'+(cue?'<span>'+escapeHtml(cue)+'</span>':'')+
      '<div class="proof-row">'+row+'</div></div></div>';
  }
  el.querySelectorAll('[data-proof]').forEach(inp=>inp.addEventListener('change',()=>{ if(inp.files && inp.files[0]) addProof(inp.dataset.proof, inp.files[0]); }));
  el.querySelectorAll('[data-proof-remove]').forEach(b=>b.addEventListener('click',()=>removeProof(b.dataset.proofRemove)));

  function checkline(id, key, h, checked, nonneg){
    const fallback = key==='h1' ? 'Non-negotiable (name it in Setup)' : key==='sc' ? 'Shadow-check (name it in Setup)' : 'Habit '+key.slice(1)+' (name it in Setup)';
    const label = h.habit ? h.habit : fallback;
    const cue = h.cue ? 'After I '+h.cue : '';
    return '<div class="checkline'+(nonneg?' nonneg':'')+'"><input type="checkbox" id="'+id+'" '+(checked?'checked':'')+'>'+
      '<label class="txt" for="'+id+'" style="margin:0;font-size:14.5px;font-weight:400;color:inherit;"><b>'+escapeHtml(label)+'</b>'+(cue?'<span>'+escapeHtml(cue)+'</span>':'')+'</label></div>';
  }

  document.getElementById('saveDayBtn').addEventListener('click', commitToday);
}

// Writes today's entry and fires the celebrations. Runs by itself the moment proof is added or
// removed, so Day Cleared and Rank Up play as soon as the third habit is proven, with no button press.
function commitToday(){
  const t = todayStr();
  const existing = log.find(e=>e.date===t);
  const before = computeStats().fullClear;
  const wasFull = !!(existing && existing.h1 && existing.h2 && existing.h3);
  const scEl = document.getElementById('f_sc'), noteEl = document.getElementById('f_note');
  const entry = {
    date: t,
    h1: !!todayProof.h1,
    h2: !!todayProof.h2,
    h3: !!todayProof.h3,
    sc: scEl ? scEl.checked : (existing?existing.sc:false),
    note: noteEl ? noteEl.value.slice(0,280) : (existing?existing.note:'')
  };
  const idx = log.findIndex(e=>e.date===t);
  if(idx>=0) log[idx]=entry; else log.push(entry);
  persist(LS.log, log);
  const after = computeStats().fullClear;
  const arche2 = getArchetype(profile.archetypeKey);
  const nowFull = entry.h1 && entry.h2 && entry.h3;
  if(nowFull && !wasFull){
    const names=[habits.h1.habit||'Non-negotiable', habits.h2.habit||'Habit 2', habits.h3.habit||'Habit 3'];
    const streakNow=computeStats().currentStreak;
    queueCelebration(done=>showDayCleared(arche2, streakNow, names, done));
  }
  if(arche2 && arche2.ranks){
    const beforeRank = rankInfo(arche2, before);
    const afterRank = rankInfo(arche2, after);
    if(afterRank && beforeRank && afterRank.idx > beforeRank.idx){
      queueCelebration(done=>showRankUpModal(arche2, afterRank.cur, beforeRank.cur, done));
    }
  }
  pushReportCleared();
  renderAll();
}

/* ---------------- Proof: a photo or video per habit, kept on this device ---------------- */
const PROOF_SLOTS = ['h1','h2','h3'];
const PROOF_MAX_VIDEO = 50*1024*1024;
let proofDb = null, todayProof = {}, proofError = '';
function openProofDb(){
  return new Promise((res,rej)=>{
    if(!('indexedDB' in window)) return rej(new Error('no indexedDB'));
    const rq = indexedDB.open('arc-proof',1);
    rq.onupgradeneeded = ()=>rq.result.createObjectStore('proofs');
    rq.onsuccess = ()=>res(rq.result);
    rq.onerror = ()=>rej(rq.error);
  });
}
function proofTx(mode, fn){
  return new Promise((res,rej)=>{
    const tx = proofDb.transaction('proofs',mode);
    const rq = fn(tx.objectStore('proofs'));
    tx.oncomplete = ()=>res(rq && rq.result);
    tx.onerror = ()=>rej(tx.error);
    tx.onabort = ()=>rej(tx.error);
  });
}
async function loadTodayProof(){
  Object.keys(todayProof).forEach(k=>URL.revokeObjectURL(todayProof[k].url));
  todayProof = {};
  if(!proofDb) return;
  const t = todayStr();
  for(const slot of PROOF_SLOTS){
    const rec = await proofTx('readonly', s=>s.get(t+':'+slot));
    if(rec) todayProof[slot] = {kind:rec.kind, url:URL.createObjectURL(rec.blob)};
  }
}
// photos are scaled down before saving so a month of proof doesn't fill the device
function shrinkImage(file){
  return new Promise(res=>{
    const img = new Image(), u = URL.createObjectURL(file);
    img.onload = ()=>{
      const sc = Math.min(1, 1280/Math.max(img.width,img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width*sc); c.height = Math.round(img.height*sc);
      c.getContext('2d').drawImage(img,0,0,c.width,c.height);
      URL.revokeObjectURL(u);
      c.toBlob(b=>res(b||file),'image/jpeg',0.8);
    };
    img.onerror = ()=>{ URL.revokeObjectURL(u); res(file); };
    img.src = u;
  });
}
async function addProof(slot, file){
  proofError = '';
  const isImg = file.type.startsWith('image/'), isVid = file.type.startsWith('video/');
  if(!isImg && !isVid){ proofError = 'Proof has to be a photo or a video.'; return renderToday(); }
  if(isVid && file.size > PROOF_MAX_VIDEO){ proofError = 'That video is over 50 MB. Use a shorter clip.'; return renderToday(); }
  if(!proofDb){ proofError = 'This browser can’t store proof. Private browsing blocks it.'; return renderToday(); }
  try{
    const blob = isImg ? await shrinkImage(file) : file;
    await proofTx('readwrite', s=>s.put({blob, kind:isImg?'image':'video', addedAt:Date.now()}, todayStr()+':'+slot));
  }catch(e){ proofError = 'Couldn’t save that file. Your device may be out of space.'; return renderToday(); }
  await loadTodayProof();
  commitToday();
}
async function removeProof(slot){
  proofError = '';
  if(proofDb){ try{ await proofTx('readwrite', s=>s.delete(todayStr()+':'+slot)); }catch(e){} }
  await loadTodayProof();
  commitToday();
}
// proof older than 30 days is deleted; the log itself (and the rank it earned) stays
async function pruneProof(){
  if(!proofDb) return;
  const d = new Date(); d.setDate(d.getDate()-30);
  const cutoff = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  try{
    const keys = await proofTx('readonly', s=>s.getAllKeys());
    for(const k of keys||[]){ if(String(k).slice(0,10) < cutoff) await proofTx('readwrite', s=>s.delete(k)); }
  }catch(e){}
}

function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

function buildRecap(stats, arche){
  const bits = [];
  if(stats.currentStreak>0){
    bits.push('You\u2019re on a '+stats.currentStreak+'-day streak');
  } else if(stats.totalDays>0){
    bits.push('Your streak reset \u2014 today\u2019s the day to start a new one');
  }
  if(stats.fullClear>0){
    bits.push(stats.fullClear+' full-clear '+(stats.fullClear===1?'day':'days')+' banked');
  }
  if(arche && arche.ranks){
    const ri = rankInfo(arche, stats.fullClear);
    bits.push('sitting at '+ri.cur.name);
  }
  if(!bits.length) return 'Log your first day to start your arc.';
  return bits.join(', ')+'. Next arc starts the moment you check today\u2019s box.';
}

/* ---------------- Progress tab ---------------- */
function renderProgress(){
  const el=document.getElementById('tab-progress');
  const arche=getArchetype(profile.archetypeKey);
  const stats=computeStats();
  let html='<h2 class="section-title">Progress</h2><p class="section-sub">No math on you \u2014 this is calculated straight from your daily log.</p>';

  if(stats.totalDays>0){
    html += '<div class="card recap-card"><div class="tag">Your arc so far</div><p>'+buildRecap(stats, arche)+'</p></div>';
  }

  html += '<div class="row" style="margin-bottom:14px;">';
  html += stat(stats.totalDays,'Days logged');
  html += stat(stats.currentStreak,'Current streak');
  html += stat(stats.longest,'Longest streak');
  html += stat(stats.fullClear,'Full-clear days');
  html += '</div>';

  const level = Math.floor(stats.xp/100)+1;
  const inLevel = stats.xp%100;
  html += '<div class="card"><div style="display:flex;justify-content:space-between;font-size:13px;color:var(--text-dim);"><span>Level '+level+'</span><span>'+stats.xp+' XP total</span></div>';
  html += '<div class="xpbar-outer"><div class="xpbar-inner" style="width:'+inLevel+'%;"></div></div>';
  html += '<div class="helptext" style="margin-top:0;">'+(100-inLevel)+' XP to level '+(level+1)+' \u2014 earned from real check-ins (10/5/5 for non-negotiable/habit 2/habit 3, +2 for a reflection line).</div></div>';

  if(arche && arche.ranks){
    const ri = rankInfo(arche, stats.fullClear);
    html += '<div class="card accent"><div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">';
    html += '<span>'+iconSVG(arche,34)+'</span><div><div style="font-family:var(--font-display);font-weight:700;font-size:17px;">'+ri.cur.name+'</div><div class="helptext" style="margin:0;">'+arche.title+' \u00b7 rank is earned by full-clear days, not time on the calendar</div></div></div>';
    if(ri.next){
      const pct = Math.min(100, Math.round((stats.fullClear-ri.cur.ms)/(ri.next.ms-ri.cur.ms)*100));
      html += '<div class="helptext" style="margin-bottom:4px;">'+(ri.next.ms-stats.fullClear)+' more full-clear days to reach '+ri.next.name+'</div>';
      html += '<div class="xpbar-outer"><div class="xpbar-inner" style="width:'+pct+'%;"></div></div>';
    } else {
      html += '<div class="helptext" style="margin:0;">Top rank reached. That\u2019s the ceiling for this archetype \u2014 the grind now is just staying there.</div>';
    }
    html += '<div class="emblem-row">'+arche.ranks.map((r,i)=>{
      const tier = i; // 0..4, matches milestone index
      const reached = stats.fullClear>=r.ms;
      const isTop = i===arche.ranks.length-1;
      const nameClass = 'emblem-name'+(reached?' reached':'')+(reached&&isTop?' top':'');
      return '<div class="emblem-wrap"><div class="emblem" data-tier="'+(reached?tier:0)+'" style="--hue:'+arche.hue+';">'+
        '<div class="ring ring-outer"></div><div class="ring ring-mid"></div><div class="glow"></div><div class="icon">'+iconSVG(arche,40)+'</div>'+
        '</div><div class="'+nameClass+'">'+escapeHtml(r.name)+'</div></div>';
    }).join('')+'</div>';
    html += '</div>';

    if(arche.shadowOptions){
      html += '<div class="card"><div style="font-size:11.5px;font-weight:700;color:var(--gold);letter-spacing:0.3px;margin-bottom:6px;">SHADOW-CHECK PROGRESS</div>';
      html += '<div class="row" style="margin-bottom:8px;">'+stat(stats.shadowStreak,'Current streak')+stat(stats.shadowTotal,'Total completed')+'</div>';
      const earnedShadow = SHADOW_BADGES.filter(b=>stats.shadowTotal>=b.n);
      if(earnedShadow.length) html += '<div class="badgechips">'+earnedShadow.map(b=>'<span class="chip">'+b.name+'</span>').join('')+'</div>';
      else html += '<div class="helptext" style="margin:0;">10 shadow-checks unlocks your first badge \u2014 tracked separately from your rank.</div>';
      html += '</div>';
    }
  } else {
    html += '<div class="banner info">Pick an archetype in the Archetypes tab to unlock your rank ladder.</div>';
  }

  html += '<div class="card"><div style="font-size:13px;color:var(--text-dim);margin-bottom:6px;">Last 30 days \u2014 darker means more of the three habits landed</div>';
  html += '<div class="heatgrid">'+heatCells(30)+'</div></div>';

  html += weeklyReviewBlock();

  el.innerHTML = html;
  wireWeeklyReview();

  function stat(num,lbl){ return '<div class="stat"><div class="num">'+num+'</div><div class="lbl">'+lbl+'</div></div>'; }

  function heatCells(n){
    const map = {};
    log.forEach(e=>{ map[e.date] = (e.h1?1:0)+(e.h2?1:0)+(e.h3?1:0); });
    let out='';
    const t = dfs(todayStr());
    for(let i=n-1;i>=0;i--){
      const d = new Date(t); d.setDate(d.getDate()-i);
      const key = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
      const lvl = map[key]||0;
      out += '<div class="cell" data-lvl="'+lvl+'" title="'+key+' \u00b7 '+lvl+'/3"></div>';
    }
    return out;
  }
}

function weeklyReviewBlock(){
  let html = '<h2 class="section-title" style="margin-top:26px;">Weekly review</h2><p class="section-sub">Five minutes, once a week \u2014 this is the only place patterns actually show up instead of just grinding through days.</p>';
  html += '<div class="card"><label for="wr_went">How did the week go?</label><textarea id="wr_went"></textarea>';
  html += '<label for="wr_wins">Wins</label><textarea id="wr_wins"></textarea>';
  html += '<label for="wr_advice">Advice for next week\u2019s you</label><textarea id="wr_advice"></textarea>';
  html += '<label for="wr_adjust">Does a habit need to get easier or harder?</label><textarea id="wr_adjust"></textarea>';
  html += '<button class="btn" id="wrSaveBtn">Save this week\u2019s review</button></div>';
  if(weekly.length){
    html += '<div class="card">'+[...weekly].reverse().map(w=>(
      '<div style="padding:10px 0;border-bottom:1px solid var(--border);"><div style="font-weight:600;font-size:13px;margin-bottom:4px;">'+fmtDate(w.date)+'</div>'+
      (w.went?'<div style="font-size:13.5px;margin-bottom:4px;">'+escapeHtml(w.went)+'</div>':'')+
      (w.wins?'<div style="font-size:13px;color:var(--text-dim);">Wins: '+escapeHtml(w.wins)+'</div>':'')+
      '</div>'
    )).join('')+'</div>';
  }
  return html;
}
function wireWeeklyReview(){
  const btn=document.getElementById('wrSaveBtn');
  if(!btn) return;
  btn.addEventListener('click',()=>{
    weekly.push({
      date: todayStr(),
      went: document.getElementById('wr_went').value.slice(0,400),
      wins: document.getElementById('wr_wins').value.slice(0,400),
      advice: document.getElementById('wr_advice').value.slice(0,400),
      adjust: document.getElementById('wr_adjust').value.slice(0,400)
    });
    persist(LS.weekly, weekly);
    renderAll();
  });
}

/* ---------------- Archetypes tab ---------------- */
function renderArchetypes(){
  const el=document.getElementById('tab-archetypes');
  let html = '<h2 class="section-title">Know your archetype</h2><p class="section-sub">Open a card and run the self-check. Not sure yet? Pick the one that stings a little \u2014 that\u2019s usually the right one.</p>';
  ARCHETYPES.forEach(a=>{
    const isCurrent = profile.archetypeKey===a.key;
    html += '<details class="arche"'+(isCurrent?' open':'')+'><summary><span class="em">'+iconSVG(a,34)+'</span>'+a.title+(a.alias?' \u00b7 '+a.alias:'')+(isCurrent?' <span class="sub">current</span>':'')+'</summary><div class="body">';
    html += '<p class="quote">\u201c'+a.quote+'\u201d</p>';
    if(a.check) html += '<div class="fieldrow"><b>You might be this if:</b> '+a.check+'</div>';
    if(a.light) html += '<div class="fieldrow"><b>Light:</b> '+a.light+'</div>';
    html += '<div class="fieldrow"><b>Shadow:</b> '+a.shadow+'</div>';
    html += '<div class="fieldrow"><b>Integration:</b> '+a.integration+'</div>';
    html += '<div class="fieldrow"><b>Anime:</b> '+a.anime+'</div>';
    if(a.ranks){
      html += '<table class="ranks"><thead><tr><th>Rank</th><th>Full-clear days</th></tr></thead><tbody>';
      a.ranks.forEach(r=>{ html += '<tr class="'+(isCurrent && computeStats().fullClear>=r.ms && (a.ranks[a.ranks.indexOf(r)+1]? computeStats().fullClear<a.ranks[a.ranks.indexOf(r)+1].ms : true) ?'current':'')+'"><td>'+r.name+'</td><td>'+r.ms+'</td></tr>'; });
      html += '</tbody></table>';
      html += '<button class="btn" style="margin-top:12px;" data-pick="'+a.key+'">'+(isCurrent?'This is your archetype':'Choose this archetype')+'</button>';
    } else {
      html += '<div class="banner info" style="margin-top:10px;">Not a starting archetype \u2014 this is the endgame all nine arcs are headed toward.</div>';
    }
    html += '</div></details>';
  });
  el.innerHTML = html;
  el.querySelectorAll('[data-pick]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      profile.archetypeKey = btn.dataset.pick;
      persist(LS.profile, profile);
      if(pushState==='on') pushSync().catch(()=>{});
            renderAll();
    });
  });
}

let emblemDemoTimer=null;
let previewKey='';
function playEmblemDemo(arche){
  const el=document.getElementById('demoEmblem');
  const label=document.getElementById('demoEmblemLabel');
  if(!el || !label) return;
  if(emblemDemoTimer) clearInterval(emblemDemoTimer);
  let tier=0;
  el.setAttribute('data-tier','0');
  label.className='emblem-name';
  label.textContent=arche.ranks[0].name;
  emblemDemoTimer=setInterval(()=>{
    tier++;
    if(tier>4){ clearInterval(emblemDemoTimer); emblemDemoTimer=null; return; }
    el.setAttribute('data-tier', String(tier));
    label.textContent=arche.ranks[tier].name;
    if(tier===4){
      label.className='emblem-name reached top';
      spawnConfetti(arche.hue,{center:false});
    } else {
      label.className='emblem-name reached';
    }
  }, 800);
}

/* ---------------- Setup tab ---------------- */
let reminderTimer=null;
function renderSetup(){
  const el=document.getElementById('tab-setup');
  let html = '<h2 class="section-title">Character & habits</h2><p class="section-sub">Fill this once, then leave it alone. Change it any time your habits change.</p>';

  html += '<div class="card"><label for="p_name">Your name</label><input type="text" id="p_name" value="'+escapeHtml(profile.name||'')+'" placeholder="Who\u2019s running this arc?"></div>';

  const arche = getArchetype(profile.archetypeKey);

  html += '<h2 class="section-title" style="font-size:16px;margin-top:22px;">Habit stack</h2><p class="section-sub">\u201cAfter I [thing I already do], I will [new habit].\u201d Two minutes or less to start each one.</p>';
  if(arche && arche.lightHabits){
    html += '<div class="banner info"><div><b>Ideas for '+arche.title+'</b> \u2014 things that build the strength you already lean on. Tap one to drop it into your next open habit slot.<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:7px;">'+
      arche.lightHabits.map(t=>'<span class="chip" style="cursor:pointer;background:var(--accent-soft);color:var(--accent);border-color:var(--accent);" data-light-suggest="'+escapeHtml(t)+'">'+escapeHtml(t)+'</span>').join('')+
      '</div></div></div>';
  }
  html += '<div class="card">'+habitField('h1','Non-negotiable', habits.h1)+'</div>';
  html += '<div class="card">'+habitField('h2','Habit 2', habits.h2)+'</div>';
  html += '<div class="card">'+habitField('h3','Habit 3', habits.h3)+'</div>';

  if(arche && arche.shadowOptions){
    html += '<h2 class="section-title" style="font-size:16px;margin-top:26px;">Your shadow-check</h2>';
    html += '<p class="section-sub">Strongly recommended \u2014 kept separate from the 3-habit cap on purpose, because it\u2019s working against a different thing: '+arche.title+'\u2019s specific failure mode, not your general discipline.</p>';
    html += '<div class="card accent"><div style="font-size:12.5px;color:var(--text-dim);margin-bottom:10px;"><b style="color:var(--text);">The shadow it counters:</b> '+arche.shadow+'</div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:12px;">'+
      arche.shadowOptions.map(t=>'<span class="chip" style="cursor:pointer;" data-shadow-suggest="'+escapeHtml(t)+'">'+escapeHtml(t)+'</span>').join('')+
      '</div>';
    html += habitField('sc','Shadow-check', habits.sc||{cue:'',habit:''});
    html += '</div>';
  } else if(arche && arche.endgame){
    html += '<div class="banner info" style="margin-top:20px;">The Balanced Master has no shadow-check of its own \u2014 it\u2019s the archetype every shadow-check is ultimately training you toward.</div>';
  } else {
    html += '<div class="banner info" style="margin-top:20px;">Pick an archetype in the Archetypes tab to unlock a shadow-check suggestion built for it.</div>';
  }

  html += '<button class="btn" id="saveHabitsBtn" style="margin-top:6px;">Save character & habits</button>';

  html += '<h2 class="section-title" style="font-size:16px;margin-top:30px;">Daily reminder</h2><p class="section-sub">Get a notification on this device if you haven\u2019t cleared today by your reminder time. It arrives even when Arc Tracker is closed.</p>';
  html += '<div class="card"><label for="r_time">Reminder time</label><input type="time" id="r_time" value="'+(reminder.time||'08:00')+'">';
  html += '<div id="pushBox">'+pushBoxHtml()+'</div></div>';

  // Calendar reminder: a repeating daily event in the user's own calendar, which then notifies
  // them on every device that calendar is on. Uses the reminder time picked above.
  html += '<div class="card"><label>Put it on your calendar</label>';
  html += '<div class="helptext" style="margin-top:0;">Adds a repeating daily event at your reminder time. Your calendar app then reminds you on your phone and computer, even when Arc Tracker is closed.</div>';
  html += '<div class="row" style="gap:8px;"><a class="btn" id="calGoogleBtn" href="#" target="_blank" rel="noopener" style="text-decoration:none;">Add to Google Calendar</a>';
  html += '<button class="btn ghost" id="calFileBtn">Apple or Outlook (.ics file)</button></div></div>';

  const demoArche = getArchetype(previewKey) || ((arche && arche.ranks) ? arche : ARCHETYPES[0]);
  if(DEMO){
  html += '<h2 class="section-title" style="font-size:16px;margin-top:30px;">Preview the animations</h2><p class="section-sub">See exactly what a level-up looks like, without needing real progress first \u2014 this doesn\u2019t touch your actual log.</p>';
  html += '<div class="card"><div class="helptext" style="margin:0 0 8px;">Pick any archetype to preview:</div><div class="preview-picker">'+ARCHETYPES.filter(a=>a.ranks).map(a=>'<button data-prev="'+a.key+'" class="'+(a.key===demoArche.key?'on':'')+'" title="'+escapeHtml(a.title)+'">'+iconSVG(a,40)+'</button>').join('')+'</div><div style="display:flex;gap:18px;flex-wrap:wrap;align-items:center;">';
  html += '<div class="emblem-wrap"><div class="emblem" id="demoEmblem" data-tier="0" style="--hue:'+demoArche.hue+';"><div class="ring ring-outer"></div><div class="ring ring-mid"></div><div class="glow"></div><div class="icon">'+iconSVG(demoArche,40)+'</div></div><div class="emblem-name" id="demoEmblemLabel">'+escapeHtml(demoArche.ranks[0].name)+'</div></div>';
  html += '<div style="display:flex;flex-direction:column;gap:8px;"><button class="btn" id="previewLevelBtn">\u25B6 Emblem level-up</button><button class="btn" id="previewDayBtn">\u25B6 Day cleared (all 3 habits)</button><button class="btn ghost" id="previewRankUpBtn">\u25B6 Rank-up</button></div>';
  html += '</div></div>';
  }

  html += '<h2 class="section-title" style="font-size:16px;margin-top:30px;">Reset</h2>';
  html += '<div class="card"><p class="section-sub" style="margin-bottom:12px;">Clears your log, habits, and character on this device.</p><button class="btn danger" id="resetBtn">Reset all local data</button></div>';

  el.innerHTML = html;

  function habitField(key, label, h){
    return '<label>'+label+'</label>'+
      '<div class="grid2">'+
      '<div><label for="'+key+'_cue" style="font-weight:400;font-size:11.5px;">After I\u2026 (existing habit)</label><input type="text" id="'+key+'_cue" value="'+escapeHtml(h.cue||'')+'" placeholder="pour my morning coffee"></div>'+
      '<div><label for="'+key+'_habit" style="font-weight:400;font-size:11.5px;">I will\u2026 (new habit, 2-minute version)</label><input type="text" id="'+key+'_habit" value="'+escapeHtml(h.habit||'')+'" placeholder="open my book and read one page"></div>'+
      '</div>';
  }

  el.querySelectorAll('[data-light-suggest]').forEach(chip=>{
    chip.addEventListener('click',()=>{
      const text = chip.dataset.lightSuggest;
      const slots=['h1_habit','h2_habit','h3_habit'];
      const target = slots.map(id=>document.getElementById(id)).find(inp=>inp && !inp.value.trim());
      if(target){ target.value = text; target.focus(); }
      else { chip.style.opacity='0.5'; chip.title='All 3 habit slots are full \u2014 clear one first.'; }
    });
  });
  el.querySelectorAll('[data-shadow-suggest]').forEach(chip=>{
    chip.addEventListener('click',()=>{
      const target = document.getElementById('sc_habit');
      if(target) target.value = chip.dataset.shadowSuggest;
    });
  });

  document.getElementById('saveHabitsBtn').addEventListener('click',()=>{
    profile.name = document.getElementById('p_name').value.trim();
    habits.h1 = {cue:document.getElementById('h1_cue').value.trim(), habit:document.getElementById('h1_habit').value.trim()};
    habits.h2 = {cue:document.getElementById('h2_cue').value.trim(), habit:document.getElementById('h2_habit').value.trim()};
    habits.h3 = {cue:document.getElementById('h3_cue').value.trim(), habit:document.getElementById('h3_habit').value.trim()};
    if(document.getElementById('sc_cue')){
      habits.sc = {cue:document.getElementById('sc_cue').value.trim(), habit:document.getElementById('sc_habit').value.trim()};
    }
    persist(LS.profile, profile);
    persist(LS.habits, habits);
        renderAll();
  });

  function calendarEvent(){
    const time=(document.getElementById('r_time').value||reminder.time||'08:00').split(':');
    const d=new Date(); d.setHours(+time[0],+time[1],0,0);
    const end=new Date(d.getTime()+10*60000);
    const p=n=>String(n).padStart(2,'0');
    // no time zone on purpose: the event sits at this clock time wherever the user is
    const local=x=>x.getFullYear()+p(x.getMonth()+1)+p(x.getDate())+'T'+p(x.getHours())+p(x.getMinutes())+'00';
    const url=location.origin+'/arc-tracker/app';
    return {start:local(d), end:local(end), title:'Log today’s arc', details:'Check off today’s three habits in Arc Tracker: '+url, url:url};
  }
  const calG=document.getElementById('calGoogleBtn');
  function refreshCalendarLink(){
    const ev=calendarEvent();
    calG.href='https://calendar.google.com/calendar/render?action=TEMPLATE&text='+encodeURIComponent(ev.title)+
      '&dates='+ev.start+'/'+ev.end+'&recur='+encodeURIComponent('RRULE:FREQ=DAILY')+'&details='+encodeURIComponent(ev.details);
  }
  refreshCalendarLink();
  document.getElementById('r_time').addEventListener('change', refreshCalendarLink);
  document.getElementById('calFileBtn').addEventListener('click',()=>{
    const ev=calendarEvent();
    const stamp=new Date().toISOString().replace(/[-:]/g,'').slice(0,15)+'Z';
    const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Kaminari//Arc Tracker//EN','BEGIN:VEVENT',
      'UID:arc-tracker-daily-reminder@joinkaminari.com','DTSTAMP:'+stamp,'DTSTART:'+ev.start,'DTEND:'+ev.end,
      'RRULE:FREQ=DAILY','SUMMARY:Log today’s arc','DESCRIPTION:'+ev.details.replace(/,/g,'\\,'),'URL:'+ev.url,
      'BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:Log today’s arc','TRIGGER:PT0M','END:VALARM',
      'END:VEVENT','END:VCALENDAR'].join('\r\n');
    const a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([ics],{type:'text/calendar'}));
    a.download='arc-tracker-reminder.ics';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  });

  document.getElementById('r_time').addEventListener('change',(e)=>{
    reminder.time = e.target.value;
    persist(LS.reminder, reminder);
    if(pushState==='on') pushSync().catch(()=>{});
  });
  wirePushBox();

  if(DEMO){
  document.getElementById('previewRankUpBtn').addEventListener('click', ()=>{
    const r=demoArche.ranks; queueCelebration(done=>showRankUpModal(demoArche, r[r.length-1], r[r.length-2], done));
  });
  document.getElementById('previewDayBtn').addEventListener('click', ()=>{
    const names=[habits.h1.habit||'Non-negotiable', habits.h2.habit||'Habit 2', habits.h3.habit||'Habit 3'];
    queueCelebration(done=>showDayCleared(demoArche, Math.max(1,computeStats().currentStreak), names, done));
  });
  el.querySelectorAll('[data-prev]').forEach(b=>b.addEventListener('click',()=>{ previewKey=b.dataset.prev; renderSetup(); }));
  document.getElementById('previewLevelBtn').addEventListener('click', ()=>{
    playEmblemDemo(demoArche);
  });
  }

  document.getElementById('resetBtn').addEventListener('click',()=>{
    if(!confirm('Reset all local Arc Tracker data on this device? This can\u2019t be undone.')) return;
    if(proofDb){ proofTx('readwrite', s=>s.clear()).catch(()=>{}); }
    Object.keys(todayProof).forEach(k=>URL.revokeObjectURL(todayProof[k].url)); todayProof={}; proofError='';
    profile={name:'',archetypeKey:''}; habits={h1:{cue:'',habit:''},h2:{cue:'',habit:''},h3:{cue:'',habit:''},sc:{cue:'',habit:''}}; log=[]; weekly=[];
    persist(LS.profile,profile); persist(LS.habits,habits); persist(LS.log,log); persist(LS.weekly,weekly);
    renderAll();
  });
}

/* ---------------- Push notifications ---------------- */
// A daily reminder sent by the server, so it arrives with the tracker closed. The device registers
// itself with /api/arc-push (see api/arc-push.js); public/arc-sw.js shows the notification.
let pushState='off', pushNote=''; // 'unsupported' | 'ios-install' | 'blocked' | 'off' | 'busy' | 'on'
const PUSH_OK = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
const IS_IOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);
const IS_STANDALONE = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone===true;
function b64ToBytes(s){ const pad='='.repeat((4-s.length%4)%4); const raw=atob((s+pad).replace(/-/g,'+').replace(/_/g,'/')); return Uint8Array.from(raw, c=>c.charCodeAt(0)); }
function clearedToday(){ const e=log.find(x=>x.date===todayStr()); return !!(e&&e.h1&&e.h2&&e.h3); }
async function pushApi(action, body){
  const r=await fetch('/api/arc-push/'+action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  return r.json();
}
async function currentSub(){
  const reg=await navigator.serviceWorker.getRegistration('/arc-tracker/');
  return reg ? reg.pushManager.getSubscription() : null;
}
// (re)register this device with the current reminder time, time zone and today's status
async function pushSync(){
  const sub=await currentSub(); if(!sub) return {ok:false};
  let key=''; try{ key=localStorage.getItem('arc_license')||''; }catch(e){}
  return pushApi('subscribe',{key, endpoint:sub.endpoint, subscription:sub.toJSON(), time:reminder.time||'08:00', archetype:profile.archetypeKey||'',
    tz:Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC', clearedToday:clearedToday()});
}
async function pushInit(){
  if(!PUSH_OK){ pushState=(IS_IOS && !IS_STANDALONE)?'ios-install':'unsupported'; return refreshPushBox(); }
  if(Notification.permission==='denied'){ pushState='blocked'; return refreshPushBox(); }
  try{ const sub=await currentSub(); pushState=(sub && Notification.permission==='granted')?'on':'off'; }catch(e){ pushState='off'; }
  refreshPushBox();
  if(pushState==='on') pushSync().catch(()=>{});
}
async function pushEnable(){
  pushState='busy'; pushNote=''; refreshPushBox();
  try{
    const perm=await Notification.requestPermission();
    if(perm!=='granted'){ pushState=perm==='denied'?'blocked':'off'; return refreshPushBox(); }
    await navigator.serviceWorker.register('/arc-sw.js',{scope:'/arc-tracker/'});
    const reg=await navigator.serviceWorker.ready;
    const keyRes=await (await fetch('/api/arc-push/key')).json();
    if(!keyRes.publicKey) throw new Error('not configured');
    const sub=await reg.pushManager.getSubscription() || await reg.pushManager.subscribe({userVisibleOnly:true, applicationServerKey:b64ToBytes(keyRes.publicKey)});
    const res=await pushSync();
    if(!res.ok){
      await sub.unsubscribe().catch(()=>{});
      pushState='off';
      pushNote=res.reason==='no_access'?'Notifications need an active Arc Tracker key.':'Couldn\u2019t turn notifications on. Try again in a moment.';
      return refreshPushBox();
    }
    pushState='on'; reminder.enabled=true; persist(LS.reminder, reminder);
  }catch(e){ pushState='off'; pushNote='Couldn\u2019t turn notifications on. Try again in a moment.'; }
  refreshPushBox();
}
async function pushDisable(){
  try{
    const sub=await currentSub();
    if(sub){ await pushApi('unsubscribe',{endpoint:sub.endpoint}).catch(()=>{}); await sub.unsubscribe(); }
  }catch(e){}
  pushState='off'; pushNote=''; reminder.enabled=false; persist(LS.reminder, reminder);
  refreshPushBox();
}
async function pushTest(){
  const sub=await currentSub(); if(!sub) return;
  pushNote='Sending\u2026'; refreshPushBox();
  const r=await pushApi('test',{endpoint:sub.endpoint}).catch(()=>({ok:false}));
  pushNote=r.ok?'Sent. It should arrive within a few seconds.':'Couldn\u2019t send a test right now.';
  refreshPushBox();
}
// tell the server when today is cleared (or un-cleared) so it knows whether to remind
function pushReportCleared(){
  if(pushState!=='on') return;
  currentSub().then(s=>s && pushApi('cleared',{endpoint:s.endpoint, cleared:clearedToday()})).catch(()=>{});
}
function pushBoxHtml(){
  const note=pushNote?'<div class="helptext" style="margin:10px 0 0;">'+escapeHtml(pushNote)+'</div>':'';
  if(pushState==='on') return '<div class="proof-ok" style="margin-bottom:10px;">Notifications are on for this device.</div>'+
    '<div class="row" style="gap:8px;"><button class="btn" id="pushTestBtn">Send a test notification</button><button class="btn ghost" id="pushOffBtn">Turn off</button></div>'+note;
  if(pushState==='busy') return '<button class="btn" disabled>Turning on\u2026</button>';
  if(pushState==='blocked') return '<div class="banner warn" style="margin:0;"><div>Notifications are blocked for this site in your browser settings. Allow them there, then reload this page.</div></div>';
  if(pushState==='ios-install') return '<div class="banner info" style="margin:0;"><div><b>On iPhone and iPad, add Arc Tracker to your Home Screen first.</b> Tap the Share button, choose <b>Add to Home Screen</b>, then open Arc Tracker from the new icon and turn notifications on here.</div></div>';
  if(pushState==='unsupported') return '<div class="banner warn" style="margin:0;"><div>This browser doesn\u2019t support notifications. Use the calendar option below.</div></div>';
  return '<button class="btn" id="pushOnBtn">Turn on notifications</button>'+note;
}
function wirePushBox(){
  const on=document.getElementById('pushOnBtn'), off=document.getElementById('pushOffBtn'), test=document.getElementById('pushTestBtn');
  if(on) on.addEventListener('click', pushEnable);
  if(off) off.addEventListener('click', pushDisable);
  if(test) test.addEventListener('click', pushTest);
}
function refreshPushBox(){
  const el=document.getElementById('pushBox');
  if(el){ el.innerHTML=pushBoxHtml(); wirePushBox(); }
}

/* ---------------- Start Here tab (the setup guide, from the Notion "Arc Tracker" page) ---------------- */
function renderGuide(){
  const el=document.getElementById('tab-guide');
  const starters=ARCHETYPES.filter(a=>a.ranks);
  const endgame=ARCHETYPES.find(a=>a.endgame);
  const list=items=>'<ul>'+items.map(t=>'<li>'+escapeHtml(t)+'</li>').join('')+'</ul>';
  let html=`
  <div class="banner info"><div><b>One system. Nine arcs. Pick yours and start today.</b><br>
  This is the system every Anime Mindset archetype runs on. The habit science is from Atomic Habits. Your archetype’s identity, shadow, and rank ladder sit on top. Rank, XP, and level calculate themselves. You never do math.</div></div>

  <h2 class="section-title">Setup (15 minutes, one time)</h2>
  <div class="card"><ol>
    <li><b>Know your archetype.</b> Open the toggles in <i>Know Your Archetype</i> below and find the one that stings a little. That’s usually yours.</li>
    <li><b>Set up your character.</b> In the Character Profile below, rename <b>Your Name Here</b> to your name and pick your <b>Archetype</b>. Your rank ladder switches to your archetype automatically.</li>
    <li><b>Pick 3 habits, max.</b> One Non-Negotiable plus two supporting habits. Each archetype toggle has ideas built for it. Size each one to the <b>two-minute rule</b>: “open the book,” not “read 30 pages.”</li>
    <li><b>Pick one shadow-check.</b> This is separate from your 3 habits and works against your archetype’s specific failure mode. Ideas are in your archetype toggle.</li>
    <li><b>Write your habit stacks</b> in the Habit Stacking section so each habit rides on something you already do.</li>
    <li><b>Rename the Daily Log columns.</b> Click the <i>Habit 2</i> and <i>Habit 3</i> column headers and rename them to your actual habits, so check-off reads like your life, not a template.</li>
  </ol></div>
  <div class="banner note"><div>If setup is taking longer than 15 minutes, you’re overbuilding it. Three habits and one shadow-check. That’s the whole system.</div></div>

  <h2 class="section-title">Your Character</h2>
  <div class="banner info"><div><b>Your progress is automatic.</b> Ranks are earned by <b>full-clear days</b> (all 3 habits on the same day), not by time on the calendar. Coasting doesn’t move you up. Check the Rank Progress bar after each log.</div></div>

  <h2 class="section-title">The Daily Loop (under 5 minutes)</h2>
  <div class="card"><ol>
    <li>Add today’s row in the Daily Log below and check off what you did, <b>even on a miss.</b> An honest empty box keeps your rank real.</li>
    <li>Check <b>Shadow-Check</b> if you did it.</li>
    <li>Write <b>one line</b>: a win or something you’re grateful for (+2 XP).</li>
    <li>Watch the <b>Status</b> column. All three habits gives you <img class="kbolt" src="/assets/kaminari-bolt.png" alt="" width="12" height="16"> Day Cleared.</li>
  </ol></div>
  <div class="banner warn"><div><b>Never Miss Twice.</b> Missing one day is an accident. Missing two is the start of a new (worse) habit. If you miss a day, the only rule is: don’t miss the next one.</div></div>
  <div class="banner note"><div><b>XP breakdown:</b> Non-Negotiable 10 · Habit 2: 5 · Habit 3: 5 · Shadow-Check 5 · Win line 2. Every 100 XP is a new level.</div></div>

  <h2 class="section-title">Habit Stacking Setup (fill once, then leave alone)</h2>
  <p class="guide-p"><b>The formula:</b> “After I [thing I already do], I will [new habit].” Your morning coffee, sitting down at your desk, brushing your teeth: all reliable enough to build on. Example: <i>After I pour my morning coffee, I will open my book and read one page.</i></p>
  <div class="banner info"><div>
    <b>Non-Negotiable:</b> After I (existing habit), I will (new habit).<br>
    <b>Habit 2:</b> After I (existing habit), I will (new habit).<br>
    <b>Habit 3:</b> After I (existing habit), I will (new habit).<br>
    <b>Shadow-Check:</b> After I (existing habit), I will (shadow-check).
  </div></div>
  <p class="guide-p"><i>Each one should take 2 minutes or less to start. The goal is showing up, not going hard.</i></p>

  <h2 class="section-title">Weekly Review (5 minutes, once a week)</h2>
  <p class="guide-p">Pick a day (Sunday night works for most people). Add a row below and answer the prompts. It’s the only place you actually see your patterns instead of just grinding through days.</p>

  <h2 class="section-title">Know Your Archetype</h2>
  <p class="guide-p">Open your toggle. Each one has a self-check, your Light and Shadow, habit ideas built for your archetype, shadow-check ideas, and your rank ladder.</p>`;
  starters.forEach(a=>{
    html+='<details class="arche"><summary><span class="em">'+iconSVG(a,34)+'</span>'+a.title+' · '+a.alias+'</summary><div class="body">'+
      '<p class="quote">'+escapeHtml(a.quote)+'</p>'+
      '<div class="fieldrow"><b>You might be this if:</b> '+a.check+'</div>'+
      '<div class="fieldrow"><b>Light:</b> '+a.light+'</div>'+
      '<div class="fieldrow"><b>Shadow (the demon):</b> '+a.shadow+'</div>'+
      '<div class="fieldrow"><b>Integration:</b> '+a.integration+'</div>'+
      '<div class="fieldrow"><b>Anime:</b> '+a.anime+'</div>'+
      '<div class="fieldrow"><b>Habit ideas that build your Light:</b>'+list(a.lightHabits)+'</div>'+
      '<div class="fieldrow"><b>Shadow-check ideas</b> (pick one, log it in the Shadow-Check column):'+list(a.shadowOptions)+'</div>'+
      '<div class="fieldrow"><b>Rank ladder</b> (full-clear days): '+a.ranks.map(r=>escapeHtml(r.name)+' '+r.ms).join(' → ')+'</div>'+
      '</div></details>';
  });
  if(endgame){
    html+='<details class="arche"><summary><span class="em">'+iconSVG(endgame,34)+'</span>'+endgame.title+' · '+endgame.alias+' (the endgame)</summary><div class="body">'+
      '<p class="quote">'+escapeHtml(endgame.quote)+'</p>'+
      '<div class="fieldrow">Not a starting archetype. This is where every arc is headed: the version of you that has done the shadow work.</div>'+
      '<div class="fieldrow"><b>Shadow:</b> '+endgame.shadow+'</div>'+
      '<div class="fieldrow"><b>Integration:</b> '+endgame.integration+'</div>'+
      '<div class="fieldrow"><b>Anime:</b> '+endgame.anime+'</div></div></details>';
  }
  html+='<div class="banner note" style="margin-top:18px;"><div><b>Final Rule of the System</b><br><i>You do not wait to feel different. You act different until you become different.</i></div></div>';
  el.innerHTML='<div class="guide">'+html+'</div>';
}

/* ---------------- Master render ---------------- */
function renderAll(){
  renderGuide();
  renderHeader();
  renderToday();
  renderProgress();
  renderArchetypes();
  renderSetup();
}
renderAll();
// someone who hasn't picked an archetype yet lands on the setup guide first
if(!getArchetype(profile.archetypeKey)) document.querySelector('nav.tabs button[data-tab="guide"]').click();
pushInit();
// opened from a quote notification: play the reveal
if(location.hash==='#quote'){
  history.replaceState(null, '', location.pathname + location.search);
  showQuoteReveal();
}
if('serviceWorker' in navigator) navigator.serviceWorker.addEventListener('message', (e)=>{ if(e.data && e.data.arc==='quote') showQuoteReveal(); });
document.addEventListener('click', (e)=>{ if(e.target.closest && e.target.closest('#dailyQuoteBtn')) showQuoteReveal(); });
// load today's proof, then draw again so habits with proof show as done
openProofDb().then(db=>{ proofDb=db; return loadTodayProof(); }).then(()=>{ renderToday(); pruneProof(); }).catch(()=>{});
})();
