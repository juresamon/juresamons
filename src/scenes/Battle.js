import { MONS } from '../data/battle.js';
import { Dialogue } from '../dialogue.js';
import { FONT, INK, INK_CSS, PAPER, DEPTH, button, modal } from '../ui.js';
import { sfx } from '../sfx.js';

// Where each creature stands: Julian's facing her at the top right, hers from behind at the bottom left.
const SPOT = { foe: { x: 930, y: 300, scale: 0.8 }, mine: { x: 330, y: 505, scale: 1 } };
const BAR_W = 250;

const tween = (scene, config) => new Promise(resolve => scene.tweens.add({ ...config, onComplete: resolve }));
const wait = (scene, ms) => new Promise(resolve => scene.time.delayedCall(ms, resolve));
const hpColour = v => (v > 50 ? 0x6fcf6f : v > 20 ? 0xf2c14e : 0xe2685f);

// The battle against Julian. Ends by sending 'battle-over' with 'win' or 'flirt';
// losing shows a try-again screen that restarts the battle.
export default class Battle extends Phaser.Scene {
  constructor() { super('Battle'); }

  init(setup) {
    this.setup = setup;
    const make = (key, label) => ({ key, label, moves: MONS[key].moves, hp: 100 });
    this.mine = make(setup.player, MONS[setup.player].name);
    this.foe = make(setup.julian, `Julian's ${MONS[setup.julian].name}`);
  }

  create() {
    this.add.image(640, 360, 'battle-bg');
    for (const side of ['foe', 'mine']) {
      const mon = this[side], spot = SPOT[side];
      mon.side = side;
      mon.home = { x: spot.x, y: spot.y };
      mon.sprite = this.add.image(spot.x, spot.y, `mon-${mon.key}-${side === 'foe' ? 'front' : 'back'}`)
        .setOrigin(0.5, 1).setScale(spot.scale);
    }
    this.hpBox(this.foe, 60, 50);
    this.hpBox(this.mine, 780, 360);
    this.dialogue = new Dialogue(this);
    this.menu = this.add.container(0, 0).setDepth(DEPTH.dialogue + 1);
    this.intro();
  }

  hpBox(mon, x, y) {
    const panel = this.add.rectangle(0, 0, 440, 104, PAPER).setOrigin(0).setStrokeStyle(4, INK);
    const name = this.add.text(20, 12, mon.label, { fontFamily: FONT, fontSize: 26, color: INK_CSS });
    const hp = this.add.text(20, 58, 'HP', { fontFamily: FONT, fontSize: 20, fontStyle: 'bold', color: '#e2685f' });
    const track = this.add.rectangle(64, 70, BAR_W, 18, 0xd8d2e6).setOrigin(0, 0.5);
    mon.bar = this.add.rectangle(64, 70, BAR_W, 18, hpColour(100)).setOrigin(0, 0.5);
    const outline = this.add.rectangle(64, 70, BAR_W, 18).setOrigin(0, 0.5).setStrokeStyle(2, INK);
    mon.pct = this.add.text(420, 70, '100%', { fontFamily: FONT, fontSize: 24, color: INK_CSS }).setOrigin(1, 0.5);
    mon.box = this.add.container(x, y, [panel, name, hp, track, mon.bar, outline, mon.pct]).setDepth(5).setAlpha(0);
  }

  say(text) {
    return this.dialogue.say({ text });
  }

  // Three white flashes, the black splits open, and both creatures slide in.
  async intro() {
    const { foe, mine } = this;
    foe.sprite.x = -250;
    mine.sprite.x = 1530;
    const top = this.add.rectangle(640, 180, 1280, 360, 0x000000).setDepth(99);
    const bottom = this.add.rectangle(640, 540, 1280, 360, 0x000000).setDepth(99);
    const flash = this.add.rectangle(640, 360, 1280, 720, 0xffffff).setDepth(100).setAlpha(0);
    for (let i = 0; i < 3; i++) {
      sfx.select();
      await tween(this, { targets: flash, alpha: 1, duration: 90, yoyo: true });
    }
    await wait(this, 150);
    this.tweens.add({ targets: top, y: -180, duration: 500, ease: 'Cubic.In' });
    this.tweens.add({ targets: bottom, y: 900, duration: 500, ease: 'Cubic.In' });
    this.tweens.add({ targets: foe.sprite, x: foe.home.x, duration: 900, ease: 'Cubic.Out' });
    await tween(this, { targets: mine.sprite, x: mine.home.x, duration: 900, ease: 'Cubic.Out' });
    [top, bottom, flash].forEach(o => o.destroy());

    await this.say('You are battling Julian!');
    this.tweens.add({ targets: foe.box, alpha: 1, duration: 250 });
    await this.say(`Julian sent out ${MONS[foe.key].name}!`);
    this.tweens.add({ targets: mine.box, alpha: 1, duration: 250 });
    await this.say(`You sent out ${mine.label}!`);
    this.choose();
  }

  // ---- her turn: the menus ----

  choose() {
    this.dialogue.say({ text: `What will ${this.mine.label} do?`, hold: true });
    this.menu.removeAll(true);
    this.menu.add(button(this, 1090, 582, 240, 56, 'Attack', () => this.moveMenu()));
    this.menu.add(button(this, 1090, 652, 240, 56, 'Flirt', () => this.flirt()));
  }

  // Four slots; empty ones show a dash and can't be clicked. What a move does is never shown here.
  moveMenu() {
    this.menu.removeAll(true);
    this.dialogue.clear();
    for (let i = 0; i < 4; i++) {
      const move = this.mine.moves[i];
      const b = button(this, 300 + (i % 2) * 470, 582 + Math.floor(i / 2) * 70, 450, 56, move ? move.name : '—', () => this.turn(move), 24);
      this.menu.add(move ? b : b.setEnabled(false));
    }
    this.menu.add(button(this, 1130, 617, 160, 56, 'Back', () => this.choose()));
  }

  flirt() {
    this.menu.removeAll(true);
    this.dialogue.hide();
    this.finish('flirt');
  }

  // She always goes first, then Julian.
  async turn(move) {
    this.menu.removeAll(true);
    if (await this.act(this.mine, this.foe, move)) return;
    if (await this.act(this.foe, this.mine, this.julianMove())) return;
    this.choose();
  }

  // Julian never takes her creature below 10%: any hit that would is left out, so once she
  // is low he only uses moves that don't hurt her.
  julianMove() {
    const allowed = this.foe.moves.filter(m => !(m.foe < 0) || this.mine.hp + m.foe >= 10);
    return Phaser.Utils.Array.GetRandom(allowed.length ? allowed : this.foe.moves);
  }

  // ---- what moves do ----

  // Returns true when the battle is over.
  async act(user, target, move) {
    if (move.special === 'sock') {
      await this.sockTurn();
      return false;
    }
    await this.say(`${user.label} used ${move.name}${/[!?]$/.test(move.name) ? '' : '!'}`);
    await this.lunge(user);
    if (move.foe) await this.changeHp(target, move.foe, false);
    if (move.self) await this.changeHp(user, move.self, true);
    return this.checkEnd();
  }

  async sockTurn() {
    await this.say('Sock used sock!!');
    await this.lunge(this.mine);
    await this.say('Wait is this even a juresamon...');
    await this.say("I think it's just a regular pair of socks...");
    const line = this.dialogue.say({ who: 'julian', expr: 'confused', text: 'Umm. Why did you pick that...' });
    const picture = this.dialogue.portrait;
    picture.x = 1500;
    this.tweens.add({ targets: picture, x: 1030, duration: 400, ease: 'Back.Out' });
    await line;
    await tween(this, { targets: picture, x: 1500, duration: 250, ease: 'Cubic.In' });
  }

  async changeHp(mon, amount, own) {
    const before = mon.hp;
    mon.hp = Phaser.Math.Clamp(mon.hp + amount, 0, 100);
    const change = mon.hp - before;
    if (amount < 0) {
      sfx.hit();
      await this.flashHit(mon);
      await this.drain(mon);
      if (own) await this.say(`${mon.label} hurt itself!`);
    } else {
      sfx.heal();
      this.sparkle(mon);
      await this.drain(mon);
      await this.say(change > 0 ? `${mon.label} recovered ${change}%!` : `${mon.label}'s HP is already full!`);
    }
  }

  async checkEnd() {
    if (this.foe.hp <= 0) {
      await this.faint(this.foe);
      await this.say(`${this.foe.label} fainted!`);
      await this.say('You won the battle!');
      this.finish('win');
      return true;
    }
    if (this.mine.hp <= 0) {
      await this.faint(this.mine);
      await this.say(`${this.mine.label} fainted...`);
      this.tryAgain();
      return true;
    }
    return false;
  }

  tryAgain() {
    this.dialogue.hide();
    const panel = modal(this, 560, 300, `${this.mine.label} fainted...\nWant to try again?`);
    panel.add(button(this, 640, 440, 260, 64, 'Try again', () => this.scene.restart(this.setup)));
  }

  finish(result) {
    const cam = this.cameras.main;
    cam.fadeOut(600, 0, 0, 0);
    cam.once('camerafadeoutcomplete', () => {
      this.game.events.emit('battle-over', result);
      this.scene.stop();
    });
  }

  // ---- animations (move-specific effects can be added here later) ----

  lunge(mon) {
    const ahead = mon.side === 'mine' ? 1 : -1;
    return tween(this, {
      targets: mon.sprite, x: mon.home.x + 50 * ahead, y: mon.home.y - 18 * ahead,
      duration: 110, yoyo: true, ease: 'Quad.Out',
    });
  }

  async flashHit(mon) {
    this.cameras.main.shake(150, 0.006);
    await tween(this, { targets: mon.sprite, alpha: 0.15, duration: 70, yoyo: true, repeat: 2 });
    mon.sprite.setAlpha(1);
  }

  sparkle(mon) {
    const s = mon.sprite, half = s.displayWidth / 2.5;
    for (let i = 0; i < 10; i++) {
      const x = s.x + Phaser.Math.Between(-half, half);
      const y = s.y - Phaser.Math.Between(20, Math.max(30, s.displayHeight * 0.8));
      const dot = this.add.circle(x, y, Phaser.Math.Between(5, 9), i % 2 ? 0x9be08f : 0xffffff)
        .setStrokeStyle(2, INK).setDepth(6).setAlpha(0);
      this.tweens.add({ targets: dot, alpha: 1, y: y - 40, duration: 300, delay: i * 50, yoyo: true, onComplete: () => dot.destroy() });
    }
  }

  drain(mon) {
    const shown = { v: parseInt(mon.pct.text, 10) };
    return tween(this, {
      targets: shown, v: mon.hp, duration: 600,
      onUpdate: () => {
        const v = Math.round(shown.v);
        mon.bar.scaleX = Math.max(0, shown.v) / 100;
        mon.bar.setFillStyle(hpColour(v));
        mon.pct.setText(`${v}%`);
      },
    });
  }

  faint(mon) {
    sfx.hit();
    return tween(this, { targets: mon.sprite, y: mon.home.y + 120, alpha: 0, duration: 450, ease: 'Quad.In' });
  }
}
