import { CHARACTERS } from './data/characters.js';
import { FONT, INK, INK_CSS, PAPER, DEPTH, button, once } from './ui.js';
import { sfx } from './sfx.js';
import { placeholderImage } from './placeholder.js';

const PORTRAIT_H = 450;   // on-screen height of placeholder talking pictures
const ART_SCALE = 1.5;    // how much drawn talking pictures are enlarged

// The text box at the bottom of the screen, with the speaker's name and large picture.
export class Dialogue {
  constructor(scene) {
    this.scene = scene;
    this.state = 'idle';
    this.startedAt = 0;

    this.portrait = scene.add.image(0, 524, '__DEFAULT').setOrigin(0.5, 1);
    const box = scene.add.rectangle(640, 610, 1200, 180, PAPER).setStrokeStyle(4, INK);
    this.nameBg = scene.add.rectangle(0, 520, 10, 46, INK).setOrigin(0, 0.5);
    this.nameText = scene.add.text(0, 520, '', { fontFamily: FONT, fontSize: 24, color: '#ffffff' }).setOrigin(0, 0.5);
    this.text = scene.add.text(70, 556, '', {
      fontFamily: FONT, fontSize: 30, color: INK_CSS, lineSpacing: 8, wordWrap: { width: 1140 },
    });
    this.arrow = scene.add.text(1205, 670, '▼', { fontFamily: FONT, fontSize: 22, color: INK_CSS }).setOrigin(0.5);
    scene.tweens.add({ targets: this.arrow, y: 677, duration: 400, yoyo: true, repeat: -1 });

    this.root = scene.add.container(0, 0, [this.portrait, box, this.nameBg, this.nameText, this.text, this.arrow])
      .setDepth(DEPTH.dialogue).setVisible(false);

    // Holding the key down must not race through every line.
    scene.input.keyboard.on('keydown-SPACE', once(e => { if (!e.repeat) this.press(); }));
    scene.input.on('pointerdown', () => this.press());
  }

  // Types the line out and resolves once the player moves on.
  // `hold` resolves as soon as the line is typed, leaving it on screen (used before a choice).
  say({ who, text, expr, portrait = true, hold = false }) {
    const ch = CHARACTERS[who];
    const left = ch?.side === 'left';

    // An expression with no drawing yet gets a blank placeholder labelled with its name.
    const key = `portrait-${who}-${expr || 'neutral'}`;
    const show = portrait && !!ch;
    if (show && !this.scene.textures.exists(key)) placeholderImage(this.scene, key, 400, 480);
    this.portrait.setVisible(show);
    // Drawn portraits are all enlarged by the same amount, so characters keep their sizes
    // relative to each other. Placeholders are fitted to the usual height instead.
    if (show) {
      this.portrait.setTexture(key).setX(left ? 250 : 1030);
      const placeholder = this.portrait.texture.source[0].isCanvas;
      this.portrait.setScale(placeholder ? PORTRAIT_H / this.portrait.height : ART_SCALE);
    }

    this.nameBg.setVisible(!!ch);
    this.nameText.setVisible(!!ch);
    if (ch) {
      this.nameText.setText(ch.name);
      const w = this.nameText.width + 40;
      const x = left ? 60 : 1220 - w;
      this.nameBg.setSize(w, 46).setX(x);
      this.nameText.setX(x + 20);
    }

    // Wrap up front so words don't jump to the next line while typing.
    this.full = this.text.getWrappedText(text).join('\n');
    this.shown = 0;
    this.hold = hold;
    this.text.setText('');
    this.arrow.setVisible(false);
    this.root.setVisible(true);
    this.state = 'typing';
    this.startedAt = this.scene.time.now;
    this.timer?.remove();
    this.timer = this.scene.time.addEvent({ delay: 24, loop: true, callback: () => this.type() });
    return new Promise(resolve => { this.resolve = resolve; });
  }

  type() {
    this.shown++;
    this.text.setText(this.full.slice(0, this.shown));
    if (this.shown % 3 === 0) sfx.tick();
    if (this.shown >= this.full.length) this.finish();
  }

  finish() {
    this.timer?.remove();
    this.timer = null;
    this.text.setText(this.full);
    if (this.hold) { this.state = 'idle'; this.resolve(); }
    else { this.state = 'waiting'; this.arrow.setVisible(true); }
  }

  press() {
    // Ignore the key press or click that opened this line.
    if (this.scene.time.now - this.startedAt < 150) return;
    if (this.state === 'typing') this.finish();
    else if (this.state === 'waiting') {
      this.state = 'idle';
      this.arrow.setVisible(false);
      sfx.advance();
      this.resolve();
    }
  }

  hide() { this.root.setVisible(false); }

  // Empties the box, stopping any line that is still typing out.
  clear() {
    this.timer?.remove();
    this.timer = null;
    this.state = 'idle';
    this.text.setText('');
    this.arrow.setVisible(false);
  }

  // Buttons above the text box. Resolves with the index of the one clicked.
  choice(options, x = 640) {
    return new Promise(resolve => {
      const buttons = options.map((label, i) => button(
        this.scene, x, 450 - (options.length - 1 - i) * 72, x === 640 ? 340 : 220, 58, label,
        () => { buttons.forEach(b => b.destroy()); resolve(i); },
      ).setDepth(DEPTH.dialogue + 1));
    });
  }

  // A typing panel. Resolves with what was typed.
  askName(max = 24) {
    return new Promise(resolve => {
      const s = this.scene;
      let value = '', cursor = true;
      const bg = s.add.rectangle(640, 250, 640, 250, PAPER).setStrokeStyle(4, INK);
      const head = s.add.text(640, 170, 'Type your name', { fontFamily: FONT, fontSize: 30, color: INK_CSS }).setOrigin(0.5);
      const field = s.add.rectangle(640, 240, 560, 60, 0xffffff).setStrokeStyle(3, INK);
      const typed = s.add.text(640, 240, '', { fontFamily: FONT, fontSize: 30, color: INK_CSS }).setOrigin(0.5);
      const render = () => typed.setText(value + (cursor ? '|' : ' '));
      const blink = s.time.addEvent({ delay: 450, loop: true, callback: () => { cursor = !cursor; render(); } });
      const done = () => {
        s.input.keyboard.off('keydown', onKey);
        blink.remove();
        panel.destroy();
        resolve(value.trim());
      };
      const onKey = once(e => {
        if (e.key === 'Enter') return done();
        if (e.key === 'Backspace') value = value.slice(0, -1);
        else if (e.key.length === 1 && value.length < max) value += e.key;
        else return;
        sfx.tick();
        render();
      });
      const ok = button(s, 640, 325, 180, 56, 'OK', done);
      const panel = s.add.container(0, 0, [bg, head, field, typed, ok]).setDepth(DEPTH.dialogue + 1);
      s.input.keyboard.on('keydown', onKey);
      render();
    });
  }
}
