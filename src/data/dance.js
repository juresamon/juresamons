// The dance battle: a short take on Grieg's "In the Hall of the Mountain King" (public domain).

// The tune in eighth notes, one bar per line. '-' holds the note before it.
export const THEME = [
  ['B4', 'C#5', 'D5', 'E5', 'F#5', 'D5', 'F#5', '-'],
  ['F5', 'C#5', 'F5', '-', 'E5', 'C5', 'E5', '-'],
  ['B4', 'C#5', 'D5', 'E5', 'F#5', 'D5', 'F#5', 'B5'],
  ['A5', 'F#5', 'D5', 'F#5', 'A5', '-', '-', '-'],
];

// The bass note under each bar.
export const BASS = ['B2', 'B2', 'B2', 'F#2'];

// One bar to count in, then four turns that each play the tune once, getting faster like the
// original. `steps` are the eighth notes in each bar that get an arrow; the rest play by themselves.
export const COUNT_IN_BPM = 128;
const EASY = [[0, 2, 4, 6], [0, 2, 4, 6], [0, 2, 4, 6], [0, 2, 4]];
const HARD = [[0, 1, 2, 3, 4, 6], [0, 2, 4, 6], [0, 1, 2, 3, 4, 6, 7], [0, 2, 4]];
export const TURNS = [
  { who: 'julian', bpm: 128, steps: EASY },
  { who: 'player', bpm: 128, steps: EASY },
  { who: 'julian', bpm: 152, steps: HARD },
  { who: 'player', bpm: 152, steps: HARD },
];

// Which arrow each note gets, so the arrows follow the melody up and down.
export const LANE_OF = {
  B4: 'left', C5: 'left', 'C#5': 'left', D5: 'down', E5: 'down', F5: 'up', 'F#5': 'up', A5: 'right', B5: 'right',
};

// How close to its beat a press has to be (in seconds) for each rating, and what each is worth.
export const RATINGS = [
  { name: 'PERFECT!', within: 0.05, points: 350 },
  { name: 'GOOD', within: 0.1, points: 200 },
  { name: 'OKAY', within: 0.15, points: 100 },
];

// Points are multiplied while a combo is going: x1.5 from 5 in a row, x2 from 10.
export const comboBonus = combo => (combo >= 10 ? 2 : combo >= 5 ? 1.5 : 1);

// Julian is good but not perfect: his chance of each rating on an arrow he hits, and how many
// arrows he misses in the whole song. She wins a tie.
export const JULIAN = { perfect: 0.15, good: 0.6, misses: 3 };
