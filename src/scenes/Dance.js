import { THEME, BASS, TURNS, COUNT_IN_BPM, LANE_OF, RATINGS, comboBonus, JULIAN } from '../data/dance.js';
import { startSong } from '../music.js';
import { sfx } from '../sfx.js';
import { FONT, INK, INK_CSS } from '../ui.js';

// Julian on the left, her on the right, each with a row of four arrows at the top.
const LANES = ['left', 'down', 'up', 'right'];
const KEYS = { KeyA: 'left', KeyS: 'down', KeyW: 'up', KeyD: 'right' };
const ANGLE = { left: -90, down: 180, up: 0, right: 90 };
const COLOUR = { left: 0xb57cdc, down: 0x5fd3f2, up: 0x73d96b, right: 0xf2647a };
const SIDES = {
  julian: { x: 320, picture: 'portrait-julian-dance', label: 'JULIAN' },
  player: { x: 960, picture: 'portrait-player-dance', label: 'YOU' },
};
const STRUM_Y = 96;        // where the arrows have to be hit
const SPEED = 600;         // how fast arrows rise, pixels per second
const FLOOR = 668;         // the dancers stand on this line
const DANCER_SCALE = 1.2;
const DRIFT = 45;          // how far the stage slides towards whoever's turn it is

const wait = (scene, ms) => new Promise(resolve => scene.time.delayedCall(ms, resolve));

// The dance battle. Ends by sending 'dance-over' with 'player' or 'julian', whoever scored more
// (she wins a tie).
export default class Dance extends Phaser.Scene {
  constructor() { super('Dance'); }

  create() {
    this.finished = false;
    this.makeArrowTexture();

    // the stage slides and zooms a little, so everything on it lives in one container
    this.stage = this.add.container(640, 360);
    this.stage.add(this.add.image(0, 0, 'dance-bg').setDisplaySize(1400, 800));
    this.sides = {};
    for (const [who, s] of Object.entries(SIDES)) {
      const img = this.add.image(s.x - 640, FLOOR - 360, s.picture).setOrigin(0.5, 1).setScale(DANCER_SCALE);
      this.stage.add(img);
      const strum = LANES.map((lane, i) => this.add.image(s.x - 135 + i * 90, STRUM_Y, 'dance-arrow')
        .setAngle(ANGLE[lane]).setTint(0x9aa0b4).setAlpha(0.5).setDepth(2));
      const score = this.add.text(s.x, 704, `${s.label}  0`, {
        fontFamily: FONT, fontSize: 28, fontStyle: 'bold', color: '#ffffff', stroke: INK_CSS, strokeThickness: 6,
      }).setOrigin(0.5).setDepth(5);
      this.sides[who] = { ...s, img, strum, score, points: 0, combo: 0, dancer: { dx: 0, dy: 0, sx: 1, sy: 1, flip: false, red: 0, shake: 0 } };
    }

    this.song = startSong({ theme: THEME, bass: BASS, turns: TURNS, countInBpm: COUNT_IN_BPM, laneOf: LANE_OF });
    for (const n of this.song.notes) {
      const s = this.sides[n.who];
      n.sprite = this.add.image(s.strum[LANES.indexOf(n.lane)].x, 900, 'dance-arrow')
        .setAngle(ANGLE[n.lane]).setTint(COLOUR[n.lane]).setDepth(3).setVisible(false);
    }
    this.planJulian();

    // things that happen at set times: the count-in, and a banner at the start of each turn
    this.cues = ['3', '2', '1', 'GO!'].map((text, i) => ({ at: this.song.beats[i], run: () => this.banner(text, 72) }));
    for (const t of this.song.turnStarts) {
      this.cues.push({ at: t.at, run: () => this.startTurn(t.who) });
    }
    this.cues.sort((a, b) => a.at - b.at);
    this.nextBeat = 0;
    this.lastBeat = -1;

    this.input.keyboard.on('keydown', e => {
      const lane = KEYS[e.code];
      if (lane && !e.repeat) this.press(lane);
    });
    this.cameras.main.fadeIn(300, 0, 0, 0);
  }

  // A white arrow pointing up with an outline, tinted per lane.
  makeArrowTexture() {
    if (this.textures.exists('dance-arrow')) return;
    const g = this.make.graphics({ add: false });
    const pts = [[40, 6], [74, 40], [55, 40], [55, 74], [25, 74], [25, 40], [6, 40]].map(([x, y]) => new Phaser.Geom.Point(x, y));
    g.fillStyle(0xffffff).fillPoints(pts, true);
    g.lineStyle(6, INK).strokePoints(pts, true);
    g.generateTexture('dance-arrow', 80, 80);
    g.destroy();
  }

  // Decide ahead of time how Julian does on each of his arrows.
  planJulian() {
    const his = this.song.notes.filter(n => n.who === 'julian');
    const misses = new Set(Phaser.Utils.Array.Shuffle(his.slice(3)).slice(0, JULIAN.misses));
    for (const n of his) {
      const r = Math.random();
      n.plan = misses.has(n) ? null : RATINGS[r < JULIAN.perfect ? 0 : r < JULIAN.perfect + JULIAN.good ? 1 : 2];
    }
  }

  startTurn(who) {
    this.turn = who;
    this.banner(who === 'player' ? 'YOUR TURN!' : "JULIAN'S TURN!", 56);
    for (const [side, s] of Object.entries(this.sides)) s.strum.forEach(a => a.setAlpha(side === who ? 1 : 0.5));
    this.tweens.add({ targets: this.stage, x: 640 + (who === 'julian' ? DRIFT : -DRIFT), scale: 1.05, duration: 900, ease: 'Sine.InOut' });
  }

  banner(text, size) {
    const t = this.add.text(640, 300, text, {
      fontFamily: FONT, fontSize: size, fontStyle: 'bold', color: '#ffffff', stroke: INK_CSS, strokeThickness: 10,
    }).setOrigin(0.5).setDepth(10).setScale(0.6);
    this.tweens.add({ targets: t, scale: 1, duration: 160, ease: 'Back.Out' });
    this.tweens.add({ targets: t, alpha: 0, delay: 550, duration: 250, onComplete: () => t.destroy() });
  }

  update(time, delta) {
    const now = this.song.now(), dt = delta / 1000;
    while (this.cues.length && now >= this.cues[0].at) this.cues.shift().run();
    while (this.nextBeat < this.song.beats.length && now >= this.song.beats[this.nextBeat]) this.lastBeat = this.song.beats[this.nextBeat++];

    for (const n of this.song.notes) {
      if (n.judged) continue;
      const y = STRUM_Y + (n.time - now) * SPEED;
      n.sprite.setVisible(y < 800).setY(y);
      if (n.who === 'julian') {
        // his notes sound right on the beat, even though the hit is shown a moment later
        if (n.plan && !n.voiced && now >= n.time - 0.1) { this.song.voice(n); n.voiced = true; }
        const late = n.plan ? [0.01, 0.04, 0.08][RATINGS.indexOf(n.plan)] : RATINGS[2].within;
        if (now >= n.time + late) this.judge(n, n.plan);
      } else if (now > n.time + RATINGS[2].within) {
        this.judge(n, null);
      }
    }

    const bop = this.lastBeat >= 0 ? 0.035 * Math.exp(-(now - this.lastBeat) * 9) : 0;
    for (const s of Object.values(this.sides)) this.animate(s, dt, bop);

    if (!this.finished && now > this.song.end + 0.8) this.finish();
  }

  // Her key press: the closest unjudged arrow in that lane, if one is near enough to its beat.
  press(lane) {
    const s = this.sides.player, now = this.song.now();
    const receptor = s.strum[LANES.indexOf(lane)];
    receptor.setScale(0.88);
    this.tweens.add({ targets: receptor, scale: 1, duration: 120 });
    const n = this.song.notes.find(n => n.who === 'player' && !n.judged && n.lane === lane && Math.abs(n.time - now) <= RATINGS[2].within);
    if (!n) return;   // pressing with nothing there costs nothing
    this.judge(n, RATINGS.find(r => Math.abs(n.time - now) <= r.within));
  }

  judge(n, rating) {
    n.judged = true;
    n.sprite.setVisible(false);
    const s = this.sides[n.who], d = s.dancer;
    if (rating) {
      s.combo++;
      s.points += Math.round(rating.points * comboBonus(s.combo));
      if (!n.voiced) this.song.voice(n);
      const receptor = s.strum[LANES.indexOf(n.lane)];
      receptor.setTint(COLOUR[n.lane]);
      this.time.delayedCall(140, () => receptor.setTint(0x9aa0b4));
      this.dance(d, n.lane);
    } else {
      s.combo = 0;
      sfx.miss();
      d.red = 0.35;
      d.shake = 0.3;
    }
    s.score.setText(`${s.label}  ${s.points.toLocaleString()}`);
    this.popup(s, rating ? rating.name : 'MISS', s.combo);
  }

  // left: hop left and face the way she was drawn; right: face the other way and hop right;
  // up: stretch; down: squash. Everything drifts back to normal in animate().
  dance(d, lane) {
    if (lane === 'left') { d.dx = -50; d.dy = -22; d.flip = false; }
    if (lane === 'right') { d.dx = 50; d.dy = -22; d.flip = true; }
    if (lane === 'up') { d.sx = 0.92; d.sy = 1.14; }
    if (lane === 'down') { d.sx = 1.1; d.sy = 0.86; }
  }

  animate(s, dt, bop) {
    const d = s.dancer, k = 1 - Math.exp(-dt * 7);
    d.dx += -d.dx * k;
    d.dy += -d.dy * k * 1.5;
    d.sx += (1 - d.sx) * k;
    d.sy += (1 - d.sy) * k;
    d.red = Math.max(0, d.red - dt);
    d.shake = Math.max(0, d.shake - dt);
    const jitter = d.shake > 0 ? Phaser.Math.Between(-7, 7) : 0;
    s.img.setPosition(s.x - 640 + d.dx + jitter, FLOOR - 360 + d.dy)
      .setScale(DANCER_SCALE * d.sx, DANCER_SCALE * d.sy * (1 + bop))
      .setFlipX(d.flip);
    if (d.red > 0) s.img.setTint(0xff9a9a); else s.img.clearTint();
  }

  popup(s, text, combo) {
    const colour = text === 'MISS' ? '#ff8a8a' : text === 'PERFECT!' ? '#ffe27a' : '#ffffff';
    const y = 250;
    const label = this.add.text(s.x, y, text, {
      fontFamily: FONT, fontSize: 40, fontStyle: 'bold', color: colour, stroke: INK_CSS, strokeThickness: 8,
    }).setOrigin(0.5).setDepth(6);
    const parts = [label];
    if (combo >= 2) {
      parts.push(this.add.text(s.x, y + 42, `${combo} combo  x${comboBonus(combo)}`, {
        fontFamily: FONT, fontSize: 24, fontStyle: 'bold', color: '#ffffff', stroke: INK_CSS, strokeThickness: 6,
      }).setOrigin(0.5).setDepth(6));
    }
    this.tweens.add({ targets: parts, y: '-=30', alpha: 0, duration: 550, delay: 150, onComplete: () => parts.forEach(p => p.destroy()) });
  }

  async finish() {
    this.finished = true;
    const { julian, player } = this.sides;
    const result = player.points >= julian.points ? 'player' : 'julian';
    this.tweens.add({ targets: this.stage, x: 640, scale: 1, duration: 600, ease: 'Sine.InOut' });
    this.banner(result === 'player' ? 'YOU WIN!!' : 'JULIAN WINS!', 72);
    await wait(this, 1800);
    this.song.stop();
    this.cameras.main.fadeOut(500, 0, 0, 0);
    await new Promise(resolve => this.cameras.main.once('camerafadeoutcomplete', resolve));
    this.game.events.emit('dance-over', result);
    this.scene.stop();
  }
}
