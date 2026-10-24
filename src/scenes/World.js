import { state } from '../state.js';
import { SCENES } from '../data/scenes.js';
import { idleFrame, sheetScale } from '../assets.js';
import { DEPTH, FONT, INK_CSS, once } from '../ui.js';
import { MONS, JULIAN_PICKS } from '../data/battle.js';
import { PLAYER_NAME } from '../data/characters.js';
import { sfx } from '../sfx.js';
import { STANDING } from '../mapart.js';

const SPEED = 240;      // walking speed, pixels per second
const FEET_W = 36;      // only a small box at the feet collides, so heads can overlap walls
const FEET_H = 18;
const REACH = 90;       // how close she must be to talk to someone
const FOLLOW_GAP = 64;  // how far behind her a follower walks
const G = Phaser.Geom;

const props = o => Object.fromEntries((o.properties || []).map(p => [p.name, p.value]));
// Whether something marked with showIf / hideIf flags should be there right now.
const present = p => (!p.showIf || !!state.flags[p.showIf]) && !(p.hideIf && state.flags[p.hideIf]);
const feet = (x, y) => new G.Rectangle(x - FEET_W / 2, y - FEET_H, FEET_W, FEET_H);
const dirTo = (from, to) => {
  const dx = to.x - from.x, dy = to.y - from.y;
  return Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
};

function polyHitsRect(poly, r) {
  const corners = [[r.x, r.y], [r.right, r.y], [r.right, r.bottom], [r.x, r.bottom]];
  if (corners.some(([x, y]) => poly.contains(x, y))) return true;
  const pts = poly.points;
  return pts.some((p, i) => {
    const q = pts[(i + 1) % pts.length];
    return G.Intersects.LineToRectangle(new G.Line(p.x, p.y, q.x, q.y), r);
  });
}

// The walkable map. Reads a Tiled file: a 'walls' object layer of shapes, and any other
// object layer holding things told apart by their type:
//   npc       a character; talking plays 'talk-<name>', or the scene in its talk property
//   prop      stand-up scenery she can walk behind; the name is the picture, placed by its base
//   door      a box that sends her to another map. Properties: to, spawn, and optionally needs (a flag)
//   interact  a spot she can press Space at. Property: scene
//   trigger   a box that plays a scene as soon as she walks into it. Property: scene
//   ledge     a thin box she can hop down over (walking down) but never cross any other way
//   grass     a box of tall grass; anyone standing in it has their feet hidden
//   barrier   an invisible wall, usually with showIf / hideIf so it can open up later
//   (blank)   a named point, used as a spawn or by cutscenes
// An npc, interact, trigger or barrier with showIf is only there once that flag is set, and one with
// hideIf goes away once that flag is set.
export default class World extends Phaser.Scene {
  constructor() { super('World'); }

  init(data) {
    this.startScene = data.cutscene;
    this.startBlack = !!data.black;
    this.fadeIn = !!data.fadeIn;
    this.ready = false;
    this.busy = false;
    this.cooldown = 0;
  }

  create() {
    const key = state.map;
    const map = this.cache.json.get(`mapdata-${key}`);
    this.mapLabel = props(map).label || key;
    this.outside = !!props(map).outside;
    const W = map.width * map.tilewidth, H = map.height * map.tileheight;
    this.bounds = new G.Rectangle(0, 0, W, H);

    this.add.image(0, 0, `map-${key}`).setOrigin(0).setDepth(-1);
    // Code-drawn maps stand their trees, buildings and fences up separately (see mapart.js).
    // A hand-drawn map picture already has them, so it gets none.
    if (STANDING[key] && this.textures.get(`map-${key}`).source[0].isCanvas) {
      STANDING[key]().forEach((t, i) => {
        const tex = `standing-${key}-${i}`;
        if (!this.textures.exists(tex)) {
          const canvas = this.textures.createCanvas(tex, t.w, t.h), ctx = canvas.getContext();
          ctx.translate(-t.x, -t.y);
          t.draw(ctx);
          canvas.refresh();
        }
        this.add.image(t.x, t.y, tex).setOrigin(0).setDepth(t.base);
      });
    }
    if (this.textures.exists(`map-${key}-over`)) {
      this.add.image(0, 0, `map-${key}-over`).setOrigin(0).setDepth(DEPTH.over);
    }

    this.walls = [];
    this.points = {};
    this.npcs = {};
    this.doors = [];
    this.spots = [];
    this.triggers = [];
    this.ledges = [];
    this.grass = [];
    this.barriers = [];
    this.follower = null;
    this.trail = [];
    for (const layer of map.layers) {
      if (layer.type !== 'objectgroup') continue;
      for (const o of layer.objects) {
        if (layer.name === 'walls') this.addWall(o);
        else this.addObject(o);
      }
    }

    const at = state.x == null ? (this.points[state.spawn] || this.points.start) : state;
    this.facing = state.facing || 'down';
    this.player = this.add.sprite(at.x, at.y, 'player').setOrigin(0.5, 1).setScale(sheetScale('player')).setDepth(at.y);
    this.idle(this.player, 'player', this.facing);
    if (state.follower) this.addFollower(state.follower, at);
    this.sleeper = this.add.image(0, 0, 'player-sleep').setVisible(false);
    this.prompt = this.add.text(0, 0, 'SPACE', {
      fontFamily: FONT, fontSize: 16, color: '#ffffff', backgroundColor: INK_CSS, padding: { x: 8, y: 4 },
    }).setOrigin(0.5, 1).setDepth(DEPTH.over + 1).setVisible(false);

    // Outside, the camera stops at the edge of the map; indoors it keeps her in the middle.
    const cam = this.cameras.main;
    if (this.outside) cam.setBounds(0, 0, W, H);
    cam.startFollow(this.player, true);
    this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT');
    // Caught as an event so a very quick tap is never missed between frames.
    this.spacePressed = false;
    this.input.keyboard.on('keydown-SPACE', once(e => { if (!e.repeat) this.spacePressed = true; }));

    // Keep the map hidden until the screen layer exists, so a black start never flashes.
    cam.setVisible(false);
    this.scene.launch('Hud');
    this.hud = this.scene.get('Hud');
    this.hud.events.once('create', () => {
      this.hud.black.setAlpha(this.startBlack ? 1 : 0);
      cam.setVisible(true);
      this.ready = true;
      if (this.startScene) this.play(this.startScene);
      else if (this.fadeIn) this.hud.fade(0, 250);
    });
  }

  addWall(o) {
    if (o.polygon) this.walls.push({ poly: new G.Polygon(o.polygon.map(p => ({ x: o.x + p.x, y: o.y + p.y }))) });
    else this.walls.push({ rect: new G.Rectangle(o.x, o.y, o.width, o.height) });
  }

  addObject(o) {
    const type = o.type || o.class, p = props(o);
    if (type === 'npc') {
      if (o.name === state.follower) return;   // they are walking with her instead
      const key = p.sprite || o.name;
      const sprite = this.add.sprite(o.x, o.y, key, 0).setOrigin(0.5, 1).setScale(sheetScale(key)).setDepth(o.y);
      sprite.setVisible(present(p));
      this.npcs[o.name] = { sprite, key, home: { x: o.x, y: o.y }, talk: p.talk || `talk-${o.name}` };
    } else if (type === 'prop') {
      this.add.image(o.x, o.y, o.name).setOrigin(0.5, 1).setDepth(o.y);
    } else if (type === 'door') {
      this.doors.push({ rect: new G.Rectangle(o.x, o.y, o.width, o.height), to: p.to, spawn: p.spawn, needs: p.needs });
    } else if (type === 'interact') {
      this.spots.push({ x: o.x + (o.width || 0) / 2, y: o.y + (o.height || 0) / 2, talk: p.scene, when: p });
    } else if (type === 'trigger') {
      this.triggers.push({ rect: new G.Rectangle(o.x, o.y, o.width, o.height), scene: p.scene, when: p });
    } else if (type === 'ledge') {
      this.ledges.push(new G.Rectangle(o.x, o.y, o.width, o.height));
    } else if (type === 'barrier') {
      this.barriers.push({ rect: new G.Rectangle(o.x, o.y, o.width, o.height), when: p });
    } else if (type === 'grass') {
      this.grass.push(new G.Rectangle(o.x, o.y, o.width, o.height));
    } else {
      this.points[o.name] = { x: o.x, y: o.y };
    }
  }

  // Stand a follower next to her, on whichever side is free.
  addFollower(id, at) {
    const spot = [[-56, 0], [56, 0], [0, 56], [0, -56]]
      .map(([dx, dy]) => ({ x: at.x + dx, y: at.y + dy }))
      .find(q => !this.blocked(q.x, q.y)) || at;
    const sprite = this.add.sprite(spot.x, spot.y, id).setOrigin(0.5, 1).setScale(sheetScale(id)).setDepth(spot.y);
    this.follower = { sprite, key: id, dir: 'down' };
    this.idle(sprite, id, 'down');
    this.trail = [];
  }

  update() {
    const space = this.spacePressed;
    this.spacePressed = false;
    if (!this.ready || this.busy) return;
    const p = this.player, k = this.keys;
    if (this.hud.menuOpen) return this.idle(p, 'player', this.facing);

    const dx = (k.D.isDown || k.RIGHT.isDown) - (k.A.isDown || k.LEFT.isDown);
    const dy = (k.S.isDown || k.DOWN.isDown) - (k.W.isDown || k.UP.isDown);
    let hopOver = null;
    if (dx || dy) {
      const step = SPEED * Math.min(this.game.loop.delta, 50) / 1000 / Math.hypot(dx, dy);
      // Try each direction on its own so she slides along walls instead of sticking.
      if (dx && !this.blocked(p.x + dx * step, p.y)) p.x += dx * step;
      if (dy && !this.blocked(p.x, p.y + dy * step)) p.y += dy * step;
      else if (dy > 0) hopOver = this.ledgeBelow(p.x, p.y + dy * step);
      this.facing = dx ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
      p.anims.play(`player-${this.facing}`, true);
      state.dirty = true;
    } else {
      this.idle(p, 'player', this.facing);
    }
    p.setDepth(p.y);
    this.wade(p);
    this.followStep();

    if (dx || dy) {
      const r = feet(p.x, p.y);
      const door = this.doors.find(d => (!d.needs || state.flags[d.needs]) && G.Intersects.RectangleToRectangle(r, d.rect));
      if (door) return this.warp(door.to, door.spawn);
      const trigger = this.triggers.find(t => present(t.when) && G.Intersects.RectangleToRectangle(r, t.rect));
      if (trigger) return this.play(trigger.scene);
      if (hopOver) return this.hop(hopOver);
    }

    const near = this.nearest();
    this.prompt.setVisible(!!near && !near.noPrompt);
    if (!near) return;
    if (!near.noPrompt) this.prompt.setPosition(near.x, near.top - 6);
    if (space && this.time.now > this.cooldown) {
      this.facing = dirTo(p, near);
      this.idle(p, 'player', this.facing);
      if (near.npc) {
        near.npc.dir = dirTo(near.npc.sprite, p);   // a follower keeps facing her afterwards
        this.idle(near.npc.sprite, near.npc.key, near.npc.dir);
      }
      this.play(near.talk);
    }
  }

  blocked(x, y) {
    const r = feet(x, y);
    if (!G.Rectangle.ContainsRect(this.bounds, r)) return true;
    if (this.walls.some(w => (w.rect ? G.Intersects.RectangleToRectangle(r, w.rect) : polyHitsRect(w.poly, r)))) return true;
    if (this.ledges.some(l => G.Intersects.RectangleToRectangle(r, l))) return true;
    if (this.barriers.some(b => present(b.when) && G.Intersects.RectangleToRectangle(r, b.rect))) return true;
    return Object.values(this.npcs).some(n => n.sprite.visible
      && G.Intersects.RectangleToRectangle(r, feet(n.sprite.x, n.sprite.y)));
  }

  // A ledge she is walking down onto from above, if the ground past it is clear to land on.
  ledgeBelow(x, y) {
    const r = feet(x, y);
    return this.ledges.find(l => G.Intersects.RectangleToRectangle(r, l) && this.player.y <= l.y + 1
      && !this.blocked(x, l.bottom + FEET_H + 4));
  }

  // A little jump down over a ledge.
  hop(ledge) {
    this.busy = true;
    this.prompt.setVisible(false);
    const p = this.player, from = p.y, to = ledge.bottom + FEET_H + 4;
    sfx.tick();
    return new Promise(resolve => this.tweens.addCounter({
      from: 0, to: 1, duration: 300,
      onUpdate: tw => {
        const t = tw.getValue();
        p.y = from + (to - from) * t - Math.sin(Math.PI * t) * 26;
        p.setDepth(p.y);
        this.wade(p);
        this.followStep();
      },
      onComplete: () => {
        p.y = to;
        this.busy = false;
        resolve();
      },
    }));
  }

  // The closest character or spot she can press Space at, if any is within reach.
  nearest() {
    const p = this.player;
    const things = this.spots.filter(s => present(s.when)).map(s => ({ ...s, top: s.y - 70 }));
    for (const n of Object.values(this.npcs)) {
      if (n.sprite.visible) things.push({ x: n.sprite.x, y: n.sprite.y, top: n.sprite.y - n.sprite.displayHeight, talk: n.talk, npc: n });
    }
    let best = null, bestDist = REACH;
    for (const t of things) {
      const d = Phaser.Math.Distance.Between(p.x, p.y, t.x, t.y);
      if (d < bestDist) { best = t; bestDist = d; }
    }
    // Outdoors she can also talk to whoever is following her ('follow-<name>' in scenes.js).
    // He is always right beside her, so no SPACE tag is shown over him, and anyone else in reach comes first.
    const f = this.follower;
    if (!best && f && this.outside && Phaser.Math.Distance.Between(p.x, p.y, f.sprite.x, f.sprite.y) < REACH) {
      best = { x: f.sprite.x, y: f.sprite.y, talk: `follow-${f.key}`, npc: f, noPrompt: true };
    }
    return best;
  }

  // The follower walks the exact path she took, staying a fixed distance behind.
  followStep() {
    const f = this.follower;
    if (!f) return;
    const p = this.player, t = this.trail, s = f.sprite, last = t[t.length - 1];
    if (!last || last.x !== p.x || last.y !== p.y) t.push({ x: p.x, y: p.y });

    let length = 0, from = s;
    for (const q of t) { length += Math.hypot(q.x - from.x, q.y - from.y); from = q; }
    let excess = length - FOLLOW_GAP, moved = false;
    while (excess > 0.5 && t.length) {
      const q = t[0], d = Math.hypot(q.x - s.x, q.y - s.y), step = Math.min(d, excess);
      if (d > 0.01) {
        if (d > 2) f.dir = dirTo(s, q);
        s.x += (q.x - s.x) / d * step;
        s.y += (q.y - s.y) / d * step;
        moved = true;
      }
      excess -= step;
      if (step >= d) t.shift();
    }
    if (moved) s.anims.play(`${f.key}-${f.dir}`, true);
    else this.idle(s, f.key, f.dir);
    s.setDepth(s.y);
    this.wade(s);
  }

  // Tall grass covers someone's feet while they stand in it.
  wade(sprite) {
    if (!this.grass.length) return;
    const inGrass = sprite.visible && this.grass.some(g => g.contains(sprite.x, sprite.y - 2));
    if (!sprite.grassFront) sprite.grassFront = this.add.image(0, 0, 'grass-front').setOrigin(0.5, 1);
    sprite.grassFront.setVisible(inGrass).setPosition(sprite.x, sprite.y + 2).setDepth(sprite.y + 0.5);
  }

  idle(sprite, key, dir) {
    sprite.anims.stop();
    sprite.setTexture(key, idleFrame(key, dir));
  }

  syncState() {
    Object.assign(state, { x: Math.round(this.player.x), y: Math.round(this.player.y), facing: this.facing });
  }

  // Fade out, then restart this scene on another map. `cutscene` plays on arrival if given.
  async warp(to, spawn, cutscene) {
    this.busy = true;
    this.hud.setLocked(true);
    this.prompt.setVisible(false);
    this.idle(this.player, 'player', this.facing);
    if (this.hud.black.alpha < 1) await this.hud.fade(1, 250);
    Object.assign(state, { map: to, spawn, x: null, y: null, facing: this.facing, dirty: true });
    this.scene.restart({ cutscene, black: true, fadeIn: !cutscene });
  }

  // ---- cutscenes (the steps are described in data/scenes.js) ----

  async play(id) {
    const steps = SCENES[id];
    if (!steps) return console.warn(`No scene called "${id}" in data/scenes.js`);
    this.busy = true;
    this.hud.setLocked(true);
    this.prompt.setVisible(false);
    await this.run(steps);
    this.busy = false;
    this.hud.setLocked(false);
    this.cooldown = this.time.now + 250;
  }

  async run(steps) {
    const talks = s => s && (s.say || s.narrate || s.choice);
    for (let i = 0; i < steps.length; i++) {
      await this.step(steps[i]);
      if (talks(steps[i]) && !talks(steps[i + 1])) this.hud.dialogue.hide();
    }
  }

  // Fills in {name}, {playerMon} and {julianMon} in a line of dialogue.
  fill(text) {
    const values = { name: PLAYER_NAME, playerMon: MONS[state.mons?.player]?.name, julianMon: MONS[state.mons?.julian]?.name };
    return text.replace(/\{(\w+)\}/g, (all, key) => values[key] ?? all);
  }

  step(s) {
    if (s.say) return this.hud.dialogue.say({ who: s.say, text: this.fill(s.text), expr: s.expr });
    if (s.narrate) return this.hud.dialogue.say({ text: this.fill(s.narrate) });
    if (s.starter) return this.pickStarter();
    if (s.battle) return this.battle();
    if (s.dance) return this.danceBattle();
    if (s.scene) return this.run(SCENES[s.scene] || []);
    if (s.ifFlag) return this.run(SCENES[state.flags[s.ifFlag] ? s.then : s.else] || []);
    if (s.end) {
      state.dirty = false;   // the story is finished; no "unsaved progress" warning
      this.scene.stop('Hud');
      this.scene.start('End');
      return new Promise(() => {});
    }
    if (s.choice) return this.hud.dialogue.choice(s.choice).then(i => this.run(s.branches?.[i] || []));
    if (s.fade) return this.hud.fade(s.fade === 'out' ? 1 : 0, s.ms || 600);
    if (s.wait) return new Promise(resolve => this.time.delayedCall(s.wait, resolve));
    if (s.move) return this.moveActor(s.move, s.to, s.speed);
    if (s.teleport) return this.teleport(s.teleport);
    if (s.warp) {
      this.warp(s.warp, s.spawn, s.then);
      return new Promise(() => {});   // this scene is about to restart; nothing after this step runs
    }
    if (s.show) {
      const a = this.actor(s.show);
      if (s.at) { const t = this.where(s.at, a); a.sprite.setPosition(t.x, t.y).setDepth(t.y); }
      a.sprite.setVisible(true);
      this.wade(a.sprite);
    } else if (s.hide) {
      const a = this.actor(s.hide);
      a.sprite.setVisible(false);
      this.wade(a.sprite);
    } else if (s.flag) {
      state.flags[s.flag] = true;
      state.dirty = true;
    } else if (s.follow) {
      const npc = this.npcs[s.follow];
      state.follower = s.follow;
      state.dirty = true;
      if (npc) {
        delete this.npcs[s.follow];
        this.follower = { sprite: npc.sprite, key: npc.key, dir: 'down' };
        this.trail = [];
      }
    } else if (s.unfollow) {
      // Whoever was following stays where they are and becomes an ordinary character again.
      const f = this.follower;
      state.follower = null;
      state.dirty = true;
      if (f) {
        this.npcs[f.key] = { sprite: f.sprite, key: f.key, home: { x: f.sprite.x, y: f.sprite.y }, talk: `talk-${f.key}` };
        this.follower = null;
        this.trail = [];
      }
    } else if ('sleep' in s) {
      return this.setSleeping(s.sleep);
    }
  }

  pickStarter() {
    return new Promise(resolve => {
      this.game.events.once('starter-picked', key => {
        state.mons = { player: key, julian: JULIAN_PICKS[key] };
        resolve();
      });
      this.scene.launch('Starter');
    });
  }

  // The battle runs as its own scene on top; this cutscene waits, then plays how it ended.
  async battle() {
    await this.hud.fade(1, 250);
    const result = await new Promise(resolve => {
      this.game.events.once('battle-over', resolve);
      this.scene.launch('Battle', { ...state.mons });
    });
    await this.hud.fade(0, 500);
    await this.run(SCENES[`battle-${result}`] || []);
  }

  // The dance battle works the same way: 'dance-player' or 'dance-julian' plays after it.
  async danceBattle() {
    await this.hud.fade(1, 250);
    const result = await new Promise(resolve => {
      this.game.events.once('dance-over', resolve);
      this.scene.launch('Dance');
    });
    await this.hud.fade(0, 500);
    await this.run(SCENES[`dance-${result}`] || []);
  }

  actor(id) {
    if (id === 'player') return { sprite: this.player, key: 'player' };
    return this.npcs[id] || (this.follower?.key === id ? this.follower : null);
  }

  where(at, actor) {
    if (at === 'home') return actor.home;
    return Array.isArray(at) ? { x: at[0], y: at[1] } : this.points[at];
  }

  moveActor(id, to, speed = SPEED) {
    const a = this.actor(id), s = a.sprite, t = this.where(to, a);
    const dir = dirTo(s, t);
    s.anims.play(`${a.key}-${dir}`, true);
    return new Promise(resolve => this.tweens.add({
      targets: s, x: t.x, y: t.y,
      duration: Phaser.Math.Distance.Between(s.x, s.y, t.x, t.y) / speed * 1000,
      onUpdate: () => {
        s.setDepth(s.y);
        this.wade(s);
        if (id === 'player') this.followStep();   // whoever follows her keeps up during cutscenes too
      },
      onComplete: () => {
        this.idle(s, a.key, dir);
        if (id === 'player') this.facing = dir;
        resolve();
      },
    }));
  }

  // Spin round faster and faster, shoot up off the screen, and disappear.
  async teleport(id) {
    const a = this.actor(id), s = a.sprite, from = s.y, dirs = ['down', 'left', 'up', 'right'];
    s.anims.stop();
    let turn = 0, delay = 140;
    const spinOnce = () => new Promise(resolve => this.time.delayedCall(delay, () => {
      this.idle(s, a.key, dirs[turn++ % 4]);
      resolve();
    }));
    sfx.heal();
    while (delay > 30) { await spinOnce(); delay *= 0.85; }
    const spin = this.time.addEvent({ delay: 30, loop: true, callback: () => this.idle(s, a.key, dirs[turn++ % 4]) });
    sfx.select();
    await new Promise(resolve => this.tweens.add({
      targets: s, y: from - 900, duration: 450, ease: 'Quad.In', onComplete: resolve,
    }));
    spin.remove();
    s.setVisible(false).setY(from);
    this.idle(s, a.key, 'down');
  }

  // In bed she is a separate picture tucked under the map's -over layer.
  async setSleeping(on) {
    const bed = this.points.bed, p = this.player;
    p.setPosition(bed.x, bed.y).setVisible(!on);
    this.sleeper.setPosition(bed.x, bed.y).setDepth(bed.y).setVisible(on);
    if (on) return;
    await this.moveActor('player', 'wake', 500);
    this.facing = 'down';
    this.idle(p, 'player', 'down');
  }
}
