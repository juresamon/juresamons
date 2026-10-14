const KEY = 'juresamons-save-';
export const SLOTS = 3;

// Everything a save file remembers. `dirty` means there is progress that has not been saved.
// `spawn` is the map point she appears at when x/y are empty (after walking through a door).
const fresh = () => ({ map: 'bedroom', spawn: 'start', x: null, y: null, facing: 'down', flags: {}, caught: [], follower: null, mons: null });
export const state = { ...fresh(), dirty: false };

export function newGame() {
  Object.assign(state, fresh(), { dirty: true });
}

export function readSlot(i) {
  try { return JSON.parse(localStorage.getItem(KEY + i)); } catch { return null; }
}

export function writeSlot(i, label) {
  const { dirty, ...data } = state;
  try {
    localStorage.setItem(KEY + i, JSON.stringify({ ...data, label, savedAt: Date.now() }));
  } catch { return false; }
  state.dirty = false;
  return true;
}

export function loadSlot(i) {
  const s = readSlot(i);
  if (!s) return false;
  const { label, savedAt, ...data } = s;
  Object.assign(state, fresh(), data, { dirty: false });
  return true;
}
