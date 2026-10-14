import { MONS, STARTERS } from '../data/battle.js';
import { FONT, INK_CSS, button, confirm, once } from '../ui.js';
import { sfx } from '../sfx.js';

const XS = [300, 640, 980];   // where the three creatures stand
const BASE = 500;             // the line their feet sit on

// The choosing screen: the creature in focus is big and bright, the others small and dark.
// Sends 'starter-picked' with the chosen key once she confirms.
export default class Starter extends Phaser.Scene {
  constructor() { super('Starter'); }

  create() {
    this.index = 0;
    this.locked = false;
    this.add.rectangle(640, 360, 1280, 720, 0x1d1630, 0.93);
    this.add.text(640, 70, 'Which Juresamon will you choose?', { fontFamily: FONT, fontSize: 40, color: '#ffffff' }).setOrigin(0.5);

    this.mons = STARTERS.map((key, i) => this.add.image(XS[i], BASE, `mon-${key}-front`)
      .setOrigin(0.5, 1)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        if (this.locked) return;
        if (i === this.index) this.choose();
        else this.select(i);
      }));

    this.name = this.add.text(640, 562, '', {
      fontFamily: FONT, fontSize: 44, fontStyle: 'bold', color: '#ffffff', stroke: INK_CSS, strokeThickness: 8,
    }).setOrigin(0.5);
    button(this, 90, 330, 80, 80, '◀', () => this.move(-1), 40);
    button(this, 1190, 330, 80, 80, '▶', () => this.move(1), 40);
    button(this, 640, 636, 240, 58, 'Choose', () => this.choose());
    this.add.text(640, 698, '◀ ▶ or A / D to look  ·  SPACE or click to choose', {
      fontFamily: FONT, fontSize: 20, color: '#d9d2ec',
    }).setOrigin(0.5);

    this.input.keyboard.on('keydown', once(e => {
      if (this.locked) return;
      if (['ArrowLeft', 'a', 'A'].includes(e.key)) this.move(-1);
      else if (['ArrowRight', 'd', 'D'].includes(e.key)) this.move(1);
      else if (e.key === ' ' || e.key === 'Enter') this.choose();
    }));

    this.select(0, true);
  }

  move(step) {
    if (!this.locked) this.select((this.index + step + STARTERS.length) % STARTERS.length);
  }

  select(i, instant = false) {
    this.index = i;
    if (!instant) sfx.select();
    this.mons.forEach((img, j) => {
      const focus = j === i;
      img.setTint(focus ? 0xffffff : 0x55506a).setDepth(focus ? 2 : 1);
      if (instant) img.setScale(focus ? 1 : 0.55);
      else this.tweens.add({ targets: img, scale: focus ? 1 : 0.55, duration: 200, ease: 'Quad.Out' });
    });
    this.name.setText(MONS[STARTERS[i]].name);
  }

  choose() {
    if (this.locked) return;
    this.locked = true;
    const key = STARTERS[this.index];
    const panel = confirm(this, `Choose ${MONS[key].name}?`, () => {
      this.game.events.emit('starter-picked', key);
      this.scene.stop();
    });
    panel.once('destroy', () => { this.locked = false; });
  }
}
