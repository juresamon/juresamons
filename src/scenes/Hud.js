import { DEPTH, FONT, INK_CSS, button, modal, confirm, slotPanel, once } from '../ui.js';
import { Dialogue } from '../dialogue.js';
import { state, readSlot, writeSlot } from '../state.js';

// Everything drawn on top of the map: the text box, the fade to black, and the menu.
export default class Hud extends Phaser.Scene {
  constructor() { super('Hud'); }

  create() {
    this.layers = [];
    this.locked = false;
    this.black = this.add.rectangle(640, 360, 1280, 720, 0x000000).setDepth(DEPTH.black).setAlpha(0);
    this.dialogue = new Dialogue(this);
    this.gear = button(this, 1232, 44, 60, 56, '⚙', () => this.openMenu(), 44).setDepth(DEPTH.hud);
    this.input.keyboard.on('keydown-ESC', once(() => {
      if (this.layers.length) this.layers.at(-1).destroy();
      else this.openMenu();
    }));
  }

  get menuOpen() { return this.layers.length > 0; }

  // Saving is locked during cutscenes and conversations.
  setLocked(on) {
    this.locked = on;
    this.gear.setEnabled(!on);
  }

  open(panel) {
    this.layers.push(panel);
    panel.once('destroy', () => { this.layers = this.layers.filter(l => l !== panel); });
    return panel;
  }

  openMenu() {
    if (this.locked || this.menuOpen) return;
    const c = this.open(modal(this, 460, 460, 'Menu'));
    c.add(button(this, 640, 270, 340, 64, 'Save', () => this.saveFlow()));
    c.add(button(this, 640, 350, 340, 64, 'Controls', () => this.showControls()));
    c.add(button(this, 640, 430, 340, 64, 'Return to title', () => this.leave()));
    c.add(button(this, 640, 520, 340, 64, 'Resume', () => c.destroy()));
  }

  saveFlow() {
    const world = this.scene.get('World');
    const panel = this.open(slotPanel(this, 'Save to which file?', true, i => {
      const save = () => {
        world.syncState();
        const ok = writeSlot(i, world.mapLabel);
        panel.destroy();
        this.toast(ok ? 'Saved!' : 'Could not save');
      };
      if (readSlot(i)) this.open(confirm(this, `Overwrite File ${i}?`, save));
      else save();
    }));
  }

  showControls() {
    const c = this.open(modal(this, 620, 360, 'Controls'));
    c.add(this.add.text(640, 340, 'WASD  ·  move\nSPACE  ·  talk, next line\nCLICK  ·  choose buttons\nESC  ·  open or close this menu', {
      fontFamily: FONT, fontSize: 26, color: INK_CSS, align: 'center', lineSpacing: 10,
    }).setOrigin(0.5));
    c.add(button(this, 640, 480, 200, 56, 'Back', () => c.destroy()));
  }

  leave() {
    const go = () => {
      state.dirty = false;
      this.scene.stop('World');
      this.scene.start('Title');
    };
    if (state.dirty) this.open(confirm(this, 'You have unsaved progress.\nLeave anyway?', go));
    else go();
  }

  toast(message) {
    const t = this.add.text(640, 60, message, {
      fontFamily: FONT, fontSize: 30, color: '#ffffff', backgroundColor: INK_CSS, padding: { x: 24, y: 12 },
    }).setOrigin(0.5).setDepth(DEPTH.toast);
    this.tweens.add({ targets: t, alpha: 0, delay: 1200, duration: 500, onComplete: () => t.destroy() });
  }

  fade(alpha, ms) {
    return new Promise(resolve => this.tweens.add({ targets: this.black, alpha, duration: ms, onComplete: resolve }));
  }
}
