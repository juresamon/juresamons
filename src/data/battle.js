// The three creatures and their moves. Numbers are percentages of a full HP bar.
//   foe: -30    hurts the other creature by 30%
//   foe: +10    heals the other creature by 10%
//   self: +20   heals the user by 20%
//   self: -10   hurts the user by 10%
// Socks' move is special: it does nothing except the lines in Battle.js.
export const MONS = {
  pantsmon: {
    name: 'Pantsmon',
    moves: [
      { name: 'Neverwash', self: -10 },
      { name: 'When theresa puts it on 🤤', foe: -40 },
      { name: 'Low rise', foe: -10 },
      { name: 'Polyester Rub', self: -10 },
    ],
  },
  shirtmon: {
    name: 'Shirtmon',
    moves: [
      { name: 'sweaty attack!', foe: -30 },
      { name: 'laundry thrower', foe: -10 },
      { name: 'cologne up', foe: +10 },
      { name: 'fricken chicken', self: +20 },
    ],
  },
  socks: {
    name: 'Socks',
    moves: [
      { name: 'Sock', special: 'sock' },
    ],
  },
};

// The order they appear on the choosing screen.
export const STARTERS = ['pantsmon', 'shirtmon', 'socks'];

// Julian takes whichever of Shirtmon and Pantsmon she didn't, and never Socks.
export const JULIAN_PICKS = { pantsmon: 'shirtmon', shirtmon: 'pantsmon', socks: 'shirtmon' };
