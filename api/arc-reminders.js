// What the daily reminder notification says. It only goes out when the member hasn't cleared today,
// so every line is a nudge to go and do it. A different one each day: lines written for the member's
// archetype on some days, lines for everyone on the others. Each row is [title, message].
// Add, remove or reword rows freely; nothing else needs changing.
const EVERYONE = [
  ['Your arc isn’t going to write itself', 'Three habits stand between you and today’s clear.'],
  ['Episode’s almost over', 'Don’t let today end on a cliffhanger. Clear your three.'],
  ['Main characters show up', 'Even on filler days. Especially on filler days.'],
  ['The training arc is calling', 'Nobody sees these reps. That’s what makes them count.'],
  ['Don’t break the chain', 'Your streak is still alive. Keep it that way.'],
  ['Two minutes. That’s the ask', 'Start your non-negotiable. The rest follows.'],
  ['Future you is watching', 'Give them something to be proud of today.'],
  ['Still time on the clock', 'Today isn’t over until you say it is. Go clear it.'],
  ['Power-ups aren’t sudden', 'They’re a hundred quiet days like this one. Log today.'],
  ['Never miss twice', 'Whatever yesterday was, today is still yours.'],
  ['You said you would', 'That’s reason enough. Three habits, then rest.'],
  ['Small counts', 'One habit done beats three planned. Open the tracker.'],
];
const BY_ARCHETYPE = {
  strategist: [
    ['The plan only works if you run it', 'You already know the move. Make it.'],
    ['Thinking time is over', 'Three habits, in order. Execute.'],
    ['Checkmate takes daily moves', 'Play today’s. The board is waiting.'],
  ],
  'demon-grind': [
    ['Still standing? Then swing', 'Today’s three are waiting on you.'],
    ['You don’t stop when you’re tired', 'You stop when it’s done. Clear today.'],
    ['One more step forward', 'That’s all today is asking for. Take it.'],
  ],
  prodigy: [
    ['Yesterday’s you set the bar', 'Go beat it. Three habits.'],
    ['Talent is waiting on the reps', 'Put today’s in.'],
    ['One percent better', 'That’s the whole job today. Log it.'],
  ],
  reborn: [
    ['Today is a new page', 'Write it. Your three are waiting.'],
    ['The old you would have skipped this', 'You’re not them anymore.'],
    ['Proof beats promises', 'Add today’s proof to the pile.'],
  ],
  beacon: [
    ['Fill your own tank first', 'Then go carry everyone else. Clear today.'],
    ['Someone’s watching how you show up', 'Show them. Three habits.'],
    ['Keep the light on', 'It starts with today’s three.'],
  ],
  'social-commander': [
    ['Leaders go first', 'Clear your own day before you rally anyone else.'],
    ['Give yourself the order', 'Three habits. Advance.'],
    ['Your move, commander', 'The day doesn’t win itself.'],
  ],
  believer: [
    ['The dream is still on', 'Today’s three keep it alive.'],
    ['Hope with a plan is a promise', 'Keep today’s.'],
    ['Set sail', 'You know where you’re going. Clear today.'],
  ],
  underdog: [
    ['Nobody’s betting on you today', 'Good. Go prove them wrong.'],
    ['No special power needed', 'Just today’s three.'],
    ['Outwork the odds', 'It starts with one habit. Open the tracker.'],
  ],
  'free-spirit': [
    ['Do it your way', 'Just do it today. Three habits.'],
    ['Play first, skip never', 'Today’s three won’t take long.'],
    ['Keep it light', 'A quick clear, then the day is yours.'],
  ],
  'balanced-master': [
    ['Small corrections, every day', 'Today’s is waiting.'],
    ['Make the tea slowly', 'Then clear your three.'],
  ],
};

// One reminder per calendar day ("YYYY-MM-DD"): every other day leans on the member's archetype.
export function reminderFor(archetypeKey, dateStr) {
  const [y, m, d] = String(dateStr).split('-').map(Number);
  const day = Math.floor(Date.UTC(y, (m || 1) - 1, d || 1) / 86400000);
  const mine = BY_ARCHETYPE[archetypeKey];
  const list = mine && day % 2 === 0 ? mine : EVERYONE;
  const [title, body] = list[Math.floor(day / 2) % list.length];
  return { title, body };
}
