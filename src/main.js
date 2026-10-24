import Boot from './scenes/Boot.js';
import Title from './scenes/Title.js';
import Intro from './scenes/Intro.js';
import World from './scenes/World.js';
import Hud from './scenes/Hud.js';
import Starter from './scenes/Starter.js';
import Battle from './scenes/Battle.js';
import Dance from './scenes/Dance.js';
import End from './scenes/End.js';
import { state } from './state.js';

window.game = new Phaser.Game({
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: '#000000',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [Boot, Title, Intro, World, Hud, Starter, Battle, Dance, End],
});

// There is no autosave, so warn before the tab closes with unsaved progress.
window.addEventListener('beforeunload', e => {
  if (state.dirty) { e.preventDefault(); e.returnValue = ''; }
});
