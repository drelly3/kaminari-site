// Rebuilds src/quiz.html from the original archetype quiz (migration/quiz-original.html), swapping its
// fonts and colours for the site's: Inter, near-black background, and the Kaminari accent blue.
// The questions, scoring, results and the Supabase lead capture are left exactly as they were.
import fs from 'node:fs';

let h = fs.readFileSync('migration/quiz-original.html', 'utf8');
const all = (from, to) => { h = h.split(from).join(to); };
const need = (from, to) => { if (!h.includes(from)) throw new Error('not found: ' + from); all(from, to); };

// fonts
need('family=Orbitron:wght@500;600;700;800;900&family=Dosis:wght@400;500;600;700&display=swap', 'family=Inter:wght@400;500;600;700;800;900&display=swap');
need("'Orbitron',sans-serif", "'Inter',sans-serif");
need("'Dosis',sans-serif", "'Inter',sans-serif");
all('Orbitron, sans-serif', 'Inter, sans-serif');
all('Dosis, sans-serif', 'Inter, sans-serif');
need("font-family:'Inter',sans-serif;font-weight:600;font-size:16.5px", "font-family:'Inter',sans-serif;font-weight:500;font-size:16px");

// colours: [original, site]
const colours = [
  ['#0090dc', '#00C0F9'], ['#3bb6ff', '#5CD6FF'], ['#09111e', '#0B0B0F'], ['#0c2238', '#131317'], ['#123150', '#1C1C22'],
  ['#faff00', '#00C0F9'], ['#d600c4', '#00C0F9'], ['#04121f', '#0B0B0F'],
  ['rgba(0,144,220,', 'rgba(0,192,249,'], ['rgba(214,0,196,', 'rgba(0,192,249,'], ['rgba(250,255,0,', 'rgba(0,192,249,'],
  ['rgba(9,17,30,', 'rgba(11,11,15,'], ['rgba(4,18,31,', 'rgba(11,11,15,'],
];
for (const [from, to] of colours) h = h.replace(new RegExp(from.replace(/[()]/g, '\\$&'), 'gi'), to);

// no lightning-bolt emoji on the title, loading and start screens
h = h.replace(/<span class="(hero|loading)-bolt" aria-hidden="true">⚡<\/span>\s*/g, '');
need('Start the quiz ⚡', 'Start the quiz');

// nine archetypes: The Lone Wolf (0), The Visionary (7) and The Devoted (10) can no longer be a result.
// Their questions and answer options are untouched, so an answer that only pointed at one of them now scores nothing.
need('let max=Math.max.apply(null,scores);', '[0,7,10].forEach(function(i){scores[i]=-1;});\n  let max=Math.max.apply(null,scores);');
all('of the 12', 'of the 9');
need('All 12 archetypes grow', 'All 9 archetypes grow');

// it lives on the main site now
all('https://kaminari-archetype-quiz.vercel.app', 'https://www.joinkaminari.com/quiz');
all('kaminari-archetype-quiz.vercel.app', 'joinkaminari.com/quiz');
need('<meta name="viewport"', '<link rel="icon" href="/favicon.jpg" type="image/jpeg">\n<link rel="canonical" href="https://www.joinkaminari.com/quiz">\n<meta name="viewport"');

fs.writeFileSync('src/quiz.html', h);
console.log('quiz restyled:', h.length, 'chars; leftovers:', (h.match(/Orbitron|Dosis|0090dc|d600c4|faff00/gi) || []).length);
