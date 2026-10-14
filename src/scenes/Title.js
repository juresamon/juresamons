import { FONT, INK_CSS, button, slotPanel } from '../ui.js';
import { loadSlot } from '../state.js';

export default class Title extends Phaser.Scene {
  constructor() { super('Title'); }

  create() {
    this.add.image(640, 360, 'title-bg');
    this.add.text(640, 180, 'JURESAMONS', {
      fontFamily: FONT, fontSize: 96, fontStyle: 'bold', color: '#ffffff', stroke: INK_CSS, strokeThickness: 10,
    }).setOrigin(0.5);

    button(this, 640, 360, 360, 70, 'New Game', () => this.scene.start('Intro'));
    button(this, 640, 450, 360, 70, 'Load Save', () => {
      // The empty object matters: without it Phaser reuses the last start data and replays the intro.
      slotPanel(this, 'Load which file?', false, i => { if (loadSlot(i)) this.scene.start('World', {}); });
    });

    this.add.text(640, 610,
      'WASD to move  ·  SPACE to talk  ·  CLICK buttons to choose\nMake sure to play on your computer!!!',
      { fontFamily: FONT, fontSize: 26, color: INK_CSS, align: 'center', lineSpacing: 10 }).setOrigin(0.5);
  }
}
