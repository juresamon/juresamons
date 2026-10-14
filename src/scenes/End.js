import { FONT, INK_CSS, button } from '../ui.js';

// The closing screen.
export default class End extends Phaser.Scene {
  constructor() { super('End'); }

  create() {
    this.add.image(640, 360, 'title-bg');

    // hearts drifting up the screen
    const colours = ['#ff7a9c', '#ffffff', '#ffd76a', '#c79ae6'];
    for (let i = 0; i < 18; i++) {
      const heart = this.add.text(Phaser.Math.Between(40, 1240), Phaser.Math.Between(740, 1100), '♥', {
        fontFamily: FONT, fontSize: Phaser.Math.Between(24, 52), color: colours[i % colours.length],
      }).setOrigin(0.5).setAlpha(0.85);
      this.tweens.add({
        targets: heart, y: -60, x: heart.x + Phaser.Math.Between(-60, 60),
        duration: Phaser.Math.Between(6000, 10000), delay: Phaser.Math.Between(0, 4000), repeat: -1,
      });
    }

    const style = size => ({ fontFamily: FONT, fontSize: size, color: '#ffffff', stroke: INK_CSS, strokeThickness: size / 5, align: 'center' });
    const lines = [
      this.add.text(640, 230, 'Thanks for playing my game and HAPPY BIRTHDAY!!!', { ...style(44), fontStyle: 'bold', wordWrap: { width: 1100 } }),
      this.add.text(640, 340, 'This is to be continued....', style(34)),
      this.add.text(640, 410, 'More content when you come visit?', style(34)),
    ];
    lines.forEach((line, i) => {
      line.setOrigin(0.5).setAlpha(0);
      this.tweens.add({ targets: line, alpha: 1, delay: 600 + i * 1200, duration: 800 });
    });

    const back = button(this, 640, 560, 260, 60, 'Back to title', () => this.scene.start('Title')).setAlpha(0);
    back.enabled = false;
    this.tweens.add({ targets: back, alpha: 1, delay: 4800, duration: 600, onComplete: () => { back.enabled = true; } });
    this.cameras.main.fadeIn(800);
  }
}
