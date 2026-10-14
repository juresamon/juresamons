import { Dialogue } from '../dialogue.js';
import { DEPTH } from '../ui.js';
import { PLAYER_NAME } from '../data/characters.js';
import { newGame } from '../state.js';

// The Professor's welcome, shown once when a new game starts.
export default class Intro extends Phaser.Scene {
  constructor() { super('Intro'); }

  create() {
    this.add.image(640, 360, 'intro-bg');
    this.add.image(640, 524, 'professor-intro').setOrigin(0.5, 1);
    this.black = this.add.rectangle(640, 360, 1280, 720, 0x000000).setDepth(DEPTH.black).setAlpha(0);
    this.dialogue = new Dialogue(this);
    this.cameras.main.fadeIn(400);
    this.run();
  }

  async run() {
    const d = this.dialogue;
    const prof = (text, hold = false) => d.say({ who: 'professor', text, portrait: false, hold });

    await prof('Welcome to the world of Juresamons!');
    await prof('First, what’s your name:', true);
    await d.askName();
    // Whatever she types, the Professor hears the same thing.
    await prof(`Sorry, did you say ${PLAYER_NAME} ?`, true);
    await d.choice(['Yes', 'No'], 1100);
    await prof(`Alright ${PLAYER_NAME}, enjoy the world of Juresamons. Be safe out there, and come to the lab later to receive your first Juresamon!!`);
    d.hide();

    this.tweens.add({
      targets: this.black, alpha: 1, duration: 1000,
      onComplete: () => { newGame(); this.scene.start('World', { cutscene: 'wakeup', black: true }); },
    });
  }
}
