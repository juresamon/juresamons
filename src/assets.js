// Every picture the game uses. Save a PNG at the listed path and it replaces the placeholder.

// key: [file, width, height] - the size is only used to draw the placeholder.
const portrait = (who, expr) => [`assets/portraits/${who}-${expr}.png`, 400, 480];

export const IMAGES = {
  'title-bg': ['assets/ui/title.png', 1280, 720],
  'intro-bg': ['assets/ui/intro-bg.png', 1280, 720],
  'professor-intro': ['assets/portraits/professor.png', 400, 480],

  // Large talking pictures, one per expression: assets/portraits/<who>-<expression>.png
  // A line with no expression uses 'neutral'. Missing ones show a blank labelled placeholder.
  'portrait-player-neutral': portrait('player', 'neutral'),
  'portrait-player-yawn': portrait('player', 'yawn'),
  'portrait-player-shocked': portrait('player', 'shocked'),
  'portrait-player-sleep': portrait('player', 'sleep'),
  'portrait-player-down': portrait('player', 'down'),
  'portrait-player-dance': portrait('player', 'dance'),
  'portrait-player-kiss': portrait('player', 'kiss'),
  'portrait-julian-neutral': portrait('julian', 'neutral'),
  'portrait-julian-adamant': portrait('julian', 'adamant'),
  'portrait-julian-dance': portrait('julian', 'dance'),
  'portrait-julian-serious': portrait('julian', 'serious'),
  'portrait-julian-blushing': portrait('julian', 'blushing'),
  'portrait-julian-confused': portrait('julian', 'confused'),
  'portrait-julian-happy': portrait('julian', 'happy'),
  'portrait-professor-neutral': portrait('professor', 'neutral'),
  'portrait-assistant-neutral': portrait('assistant', 'neutral'),

  // Maps: the painting, plus an optional '-over' layer drawn in front of the characters.
  'map-bedroom': ['assets/maps/bedroom.png', 1600, 960],
  'map-bedroom-over': ['assets/maps/bedroom-over.png', 1600, 960],
  'map-town': ['assets/maps/town.png', 2000, 1400],
  'map-lab': ['assets/maps/lab.png', 1280, 720],

  // Juresamons: front (Julian's, and the choosing screen) and back (hers in battle).
  'mon-pantsmon-front': ['assets/mons/pantsmon-front.png', 300, 300],
  'mon-pantsmon-back': ['assets/mons/pantsmon-back.png', 300, 300],
  'mon-shirtmon-front': ['assets/mons/shirtmon-front.png', 300, 300],
  'mon-shirtmon-back': ['assets/mons/shirtmon-back.png', 300, 300],
  'mon-socks-front': ['assets/mons/socks-front.png', 300, 300],
  'mon-socks-back': ['assets/mons/socks-back.png', 300, 300],
  'battle-bg': ['assets/ui/battle-bg.png', 1280, 720],

  'player-sleep': ['assets/sprites/player-sleep.png', 76, 80],
  'prop-desk': ['assets/props/desk.png', 200, 140],
  'prop-ball-table': ['assets/props/ball-table.png', 220, 120],
};

// Walk sheets. Frames are numbered row by row in the order facing down, left, right, up,
// with `cols` frames per direction. The first frame of each direction is the standing pose,
// and `walk` is the order the frames play in while moving.
//
// A sheet is cut up one of two ways:
//   frameWidth / frameHeight  - an even grid starting at the top-left corner
//   frames                    - one [x, y, width, height] box per frame, for sheets drawn freehand.
//                               Each box is centred on the character with the feet on its bottom edge.
//
// `scale` (optional, default 1) shrinks or enlarges the character on the map.
export const SHEETS = {
  player: {
    file: 'assets/sprites/characters.png',
    cols: 3,
    walk: [1, 0, 2, 0],
    frames: [
      [111, 109, 76, 80], [215, 109, 76, 80], [316, 109, 76, 80],   // down
      [110, 200, 76, 80], [213, 200, 76, 80], [315, 200, 76, 80],   // left
      [111, 291, 76, 80], [213, 291, 76, 80], [316, 291, 76, 80],   // right
      [112, 19, 76, 80], [214, 17, 76, 80], [316, 18, 76, 80],      // up
    ],
  },
  julian: {
    file: 'assets/sprites/characters.png',
    cols: 3,
    scale: 0.92,   // a little taller than her, not a lot
    walk: [1, 0, 2, 0],
    frames: [
      [131, 570, 68, 92], [235, 571, 68, 92], [336, 572, 68, 92],   // down
      [130, 668, 68, 92], [233, 666, 68, 92], [336, 667, 68, 92],   // left
      [133, 763, 68, 92], [236, 762, 68, 92], [339, 764, 68, 92],   // right
      [132, 473, 68, 92], [234, 476, 68, 92], [337, 479, 68, 92],   // up
    ],
  },
  // One standing picture per direction, no walking frames.
  professor: {
    file: 'assets/sprites/characters-2.png',
    cols: 1,
    walk: [0],
    frames: [
      [445, 105, 84, 80],   // down
      [442, 201, 84, 80],   // left
      [450, 297, 84, 80],   // right
      [446, 7, 84, 80],     // up
    ],
  },
  assistant: {
    file: 'assets/sprites/characters-2.png',
    cols: 1,
    walk: [0],
    frames: [
      [654, 126, 68, 64],   // down
      [657, 222, 68, 64],   // left
      [665, 311, 68, 64],   // right
      [653, 28, 68, 64],    // up
    ],
  },
};

// Each map also needs assets/maps/<name>.json, exported from Tiled.
export const MAPS = ['bedroom', 'town', 'lab'];

export const DIRS = ['down', 'left', 'right', 'up'];

export const sheetScale = key => SHEETS[key]?.scale || 1;

export const idleFrame = (key, dir) => DIRS.indexOf(dir) * SHEETS[key].cols;
