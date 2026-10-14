import { IMAGES, SHEETS, MAPS, DIRS } from '../assets.js';
import { placeholderImage, placeholderSheet } from '../placeholder.js';
import { FONT } from '../ui.js';

export default class Boot extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    this.add.text(640, 360, 'Loading…', { fontFamily: FONT, fontSize: 32, color: '#ffffff' }).setOrigin(0.5);
    for (const [key, [file]] of Object.entries(IMAGES)) this.load.image(key, file);
    for (const [key, s] of Object.entries(SHEETS)) {
      if (s.frames) this.load.image(key, s.file);
      else this.load.spritesheet(key, s.file, { frameWidth: s.frameWidth, frameHeight: s.frameHeight });
    }
    for (const map of MAPS) this.load.json(`mapdata-${map}`, `assets/maps/${map}.json`);
  }

  create() {
    // Any picture that has not been drawn yet gets a placeholder.
    for (const [key, [, w, h]] of Object.entries(IMAGES)) {
      if (!this.textures.exists(key)) placeholderImage(this, key, w, h);
    }
    for (const [key, s] of Object.entries(SHEETS)) {
      if (!this.textures.exists(key)) {
        placeholderSheet(this, key, s.frameWidth || 64, s.frameHeight || 96, s.cols);
      } else if (s.frames) {
        const tex = this.textures.get(key);
        s.frames.forEach(([x, y, w, h], i) => tex.add(i, 0, x, y, w, h));
      }
      DIRS.forEach((dir, row) => this.anims.create({
        key: `${key}-${dir}`,
        frames: s.walk.map(i => ({ key, frame: row * s.cols + i })),
        frameRate: 8,
        repeat: -1,
      }));
    }
    this.scene.start('Title');
  }
}
