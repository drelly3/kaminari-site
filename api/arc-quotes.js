// Arc Tracker daily quotes, one list per archetype. Each line is written by Kaminari in the spirit
// of an anime character who fits that archetype ("c" is the character it channels).
// Used in two places: the Today tab (build.mjs copies this list into the tracker) and the daily
// reminder notification (api/arc-push.js). Add, remove or reword lines freely; nothing else needs changing.
export const QUOTES = {
  strategist: [
    { c: 'Shikamaru Nara', q: 'The lazy move is the planned move. Think once, then act without the drag.' },
    { c: 'L', q: 'You already have enough clues. Make the call and test it.' },
    { c: 'Shikamaru Nara', q: 'Ten moves ahead means nothing if you never play the first one.' },
    { c: 'L', q: 'A theory is only worth what today’s evidence says. Go collect some.' },
    { c: 'Shikamaru Nara', q: 'What a drag. Do it anyway, and do it the smart way.' },
    { c: 'L', q: 'Perfect information never arrives. Decide at eighty percent.' },
    { c: 'Shikamaru Nara', q: 'The plan was the easy part. The board only changes when you move.' },
  ],
  'demon-grind': [
    { c: 'Guts', q: 'Nobody is coming to swing it for you. Pick it up.' },
    { c: 'Eren Yeager', q: 'Keep moving forward, and know what you are moving toward.' },
    { c: 'Guts', q: 'You survived every bad day so far. Today is not the one that stops you.' },
    { c: 'Guts', q: 'Even the Black Swordsman sat by the fire. Rest is part of the fight.' },
    { c: 'Eren Yeager', q: 'Rage gets you over the wall. Discipline is what keeps you alive beyond it.' },
    { c: 'Guts', q: 'The struggle is the point. Show up for it again.' },
    { c: 'Eren Yeager', q: 'Freedom is not handed over. It is earned one stubborn day at a time.' },
  ],
  prodigy: [
    { c: 'Rock Lee', q: 'Talent is a head start. Hard work is the whole race.' },
    { c: 'Izuku Midoriya', q: 'Take notes on yourself the way you take notes on your heroes.' },
    { c: 'Rock Lee', q: 'If you cannot do it today, do the five hundred reps that say you will.' },
    { c: 'Izuku Midoriya', q: 'One percent of the power, used well, beats a hundred percent that breaks you.' },
    { c: 'Rock Lee', q: 'The weights come off later. Wear them today.' },
    { c: 'Izuku Midoriya', q: 'You are allowed to enjoy the win before you chase the next one.' },
    { c: 'Rock Lee', q: 'Your only rival this morning is the you from yesterday.' },
  ],
  reborn: [
    { c: 'Zuko', q: 'Your past is a chapter, not the title. Write today’s page.' },
    { c: 'Vegeta', q: 'Pride got you this far. Humility is what takes you further.' },
    { c: 'Naruto Uzumaki', q: 'The ones who doubted you are not watching today’s reps. Do them for you.' },
    { c: 'Zuko', q: 'Honor is not found out there. You build it with what you do today.' },
    { c: 'Vegeta', q: 'You do not have to be the strongest. You have to be stronger than you were.' },
    { c: 'Naruto Uzumaki', q: 'You said you would. That is reason enough.' },
    { c: 'Zuko', q: 'Changing sides was the hard part. Staying changed is the daily part.' },
  ],
  beacon: [
    { c: 'All Might', q: 'Smile, then do the work. People are steadier when you are.' },
    { c: 'Whitebeard', q: 'A captain eats last, but a captain still eats. Look after yourself too.' },
    { c: 'All Might', q: 'You cannot carry anyone on an empty tank. Today’s habits are the fuel.' },
    { c: 'Whitebeard', q: 'Strength means the people behind you feel safe. Build some today.' },
    { c: 'All Might', q: 'It is fine now. Why? Because you showed up.' },
    { c: 'Whitebeard', q: 'Your crew is watching how you handle the ordinary days.' },
    { c: 'All Might', q: 'Pass the torch someday. Keep it lit today.' },
  ],
  'social-commander': [
    { c: 'Erwin Smith', q: 'Give today a purpose and your whole day will charge with you.' },
    { c: 'Lelouch vi Britannia', q: 'Only give the order you are willing to follow yourself. Start with your own three.' },
    { c: 'Erwin Smith', q: 'Leaders go first. Clear your own day before you rally anyone else.' },
    { c: 'Lelouch vi Britannia', q: 'A grand plan is a pile of small moves done on schedule.' },
    { c: 'Erwin Smith', q: 'Advance. The answers are past the wall, not behind your desk.' },
    { c: 'Lelouch vi Britannia', q: 'The king who does not move loses the board.' },
    { c: 'Erwin Smith', q: 'People follow the one who keeps showing up. Be that one today.' },
  ],
  believer: [
    { c: 'Monkey D. Luffy', q: 'You already decided where you are going. Today is just sailing.' },
    { c: 'Tanjiro Kamado', q: 'Breathe, set your feet, and take the next step. Then the next.' },
    { c: 'Gon Freecss', q: 'Stay curious about today. The fun part is finding out what you can do.' },
    { c: 'Monkey D. Luffy', q: 'Big dreams are not embarrassing. Skipping the work for them is.' },
    { c: 'Tanjiro Kamado', q: 'Be kind to yourself and keep going. Both at once.' },
    { c: 'Gon Freecss', q: 'Hope with a plan is a promise. Keep today’s.' },
    { c: 'Monkey D. Luffy', q: 'Eat well, laugh loud, clear your three.' },
  ],
  underdog: [
    { c: 'Krillin', q: 'You are standing next to giants and still stepping forward. That is the courage.' },
    { c: 'Yuji Itadori', q: 'You do not need to be the chosen one. You need to be the one who shows up.' },
    { c: 'Krillin', q: 'No special bloodline needed for today. Just the work.' },
    { c: 'Yuji Itadori', q: 'Help the one person in front of you. Today that person is you.' },
    { c: 'Krillin', q: 'They keep counting you out. Keep giving them reasons to recount.' },
    { c: 'Yuji Itadori', q: 'You are a cog that keeps turning. That is how the big things move.' },
    { c: 'Krillin', q: 'Ordinary people who refuse to quit make the best stories.' },
  ],
  'free-spirit': [
    { c: 'Gintoki Sakata', q: 'Be lazy about the things that do not matter. These three matter.' },
    { c: 'Bon Clay', q: 'Dance through it. A heavy day still gets a light step.' },
    { c: 'Gintoki Sakata', q: 'Protect what is in reach. Today, that is your word to yourself.' },
    { c: 'Bon Clay', q: 'Joy is not the reward for finishing. Bring it with you.' },
    { c: 'Gintoki Sakata', q: 'Life is short. Have the sweet thing, and do the thing you said you would.' },
    { c: 'Bon Clay', q: 'Laugh at the mess, then clean up one corner of it.' },
    { c: 'Gintoki Sakata', q: 'You can joke about anything except skipping today.' },
  ],
  'balanced-master': [
    { c: 'Uncle Iroh', q: 'Make the tea slowly. Do the work the same way.' },
    { c: 'Kakashi Hatake', q: 'You know every technique. The one that counts is showing up.' },
    { c: 'Uncle Iroh', q: 'Balance is not standing still. It is small corrections, every day.' },
    { c: 'Kakashi Hatake', q: 'Look after your team, and remember you are on it.' },
    { c: 'Uncle Iroh', q: 'Be proud of your light and honest about your shadow. Both walked you here.' },
  ],
};

// One quote per calendar day ("YYYY-MM-DD"), so the tracker and the notification always agree.
export function quoteFor(archetypeKey, dateStr) {
  const list = QUOTES[archetypeKey];
  if (!list || !list.length) return null;
  const [y, m, d] = String(dateStr).split('-').map(Number);
  const day = Math.floor(Date.UTC(y, (m || 1) - 1, d || 1) / 86400000);
  return list[((day % list.length) + list.length) % list.length];
}
