import { sfx } from './sfx.js';
import { SLOTS, readSlot } from './state.js';

export const FONT = '"Trebuchet MS", Verdana, sans-serif';
export const INK = 0x3a2e4d;
export const INK_CSS = '#3a2e4d';
export const PAPER = 0xfffaf0;

// Draw order. `over` is inside the map; the rest are screen layers.
export const DEPTH = { over: 1000000, hud: 10, black: 20, dialogue: 30, menu: 40, toast: 50 };

// Phaser can hand the same key press to a listener twice when several keys land in one frame.
// Wrap keyboard listeners in this so each real press only counts once.
export function once(fn) {
  const seen = new WeakSet();
  return e => {
    if (seen.has(e)) return;
    seen.add(e);
    fn(e);
  };
}

export function button(scene, x, y, w, h, label, onClick, fontSize = 28) {
  const bg = scene.add.rectangle(0, 0, w, h, PAPER).setStrokeStyle(3, INK);
  const txt = scene.add.text(0, 0, label, { fontFamily: FONT, fontSize, color: INK_CSS }).setOrigin(0.5);
  const c = scene.add.container(x, y, [bg, txt]);
  c.enabled = true;
  c.setEnabled = on => { c.enabled = on; c.setAlpha(on ? 1 : 0.4); return c; };
  bg.setInteractive({ useHandCursor: true })
    .on('pointerover', () => c.enabled && bg.setFillStyle(0xffd9e8))
    .on('pointerout', () => bg.setFillStyle(PAPER))
    .on('pointerdown', () => { if (c.enabled) { sfx.select(); onClick(); } });
  return c;
}

// A panel over a dimmed screen. The dim layer swallows clicks meant for whatever is underneath.
export function modal(scene, w, h, title) {
  const dim = scene.add.rectangle(640, 360, 1280, 720, 0x000000, 0.55).setInteractive();
  const panel = scene.add.rectangle(640, 360, w, h, PAPER).setStrokeStyle(4, INK);
  const head = scene.add.text(640, 360 - h / 2 + 50, title, {
    fontFamily: FONT, fontSize: 32, color: INK_CSS, align: 'center', wordWrap: { width: w - 60 },
  }).setOrigin(0.5);
  return scene.add.container(0, 0, [dim, panel, head]).setDepth(DEPTH.menu);
}

export function confirm(scene, message, onYes) {
  const c = modal(scene, 640, 260, message);
  c.add(button(scene, 530, 420, 180, 60, 'Yes', () => { c.destroy(); onYes(); }));
  c.add(button(scene, 750, 420, 180, 60, 'No', () => c.destroy()));
  return c;
}

const when = t => new Date(t).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

export function slotPanel(scene, title, allowEmpty, onPick) {
  const c = modal(scene, 760, 520, title);
  for (let i = 1; i <= SLOTS; i++) {
    const s = readSlot(i);
    const label = s ? `File ${i}  ·  ${s.label}  ·  ${when(s.savedAt)}` : `File ${i}  ·  empty`;
    c.add(button(scene, 640, 250 + (i - 1) * 90, 660, 72, label, () => onPick(i)).setEnabled(!!s || allowEmpty));
  }
  c.add(button(scene, 640, 540, 220, 60, 'Back', () => c.destroy()));
  return c;
}
