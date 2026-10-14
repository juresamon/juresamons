// Stand-in art drawn in code. Anything in assets.js without a PNG yet gets one of these.
import { DIRS } from './assets.js';
import { bedroom, bedroomOver, desk, town, lab, ballTable, battleBg } from './mapart.js';

const INK = '#3a2e4d', SKIN = '#ffe2cf';
const LOOKS = {
  player: { body: '#f79ab8', hair: '#6b4226' },
  julian: { body: '#6fa8dc', hair: '#2b2b33' },
  professor: { body: '#ffffff', hair: '#9a9aa6' },
  assistant: { body: '#bfe3c8', hair: '#c98b4b' },
};

const circle = (ctx, x, y, r) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); };
const rounded = (ctx, x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };

function tag(ctx, w, h, text) {
  ctx.fillStyle = 'rgba(58,46,77,.5)';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(text, w / 2, h - 10);
}

function box(ctx, w, h, text) {
  ctx.fillStyle = '#d8d2e6';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, w - 4, h - 4);
  tag(ctx, w, h / 2 + 16, text);
}

function backdrop(ctx, w, h, top, bottom) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(255,255,255,.18)';
  for (let i = 0; i < 14; i++) { circle(ctx, (i * 337) % w, (i * 191) % h, 30 + (i * 23) % 70); ctx.fill(); }
}

function face(ctx, cx, cy, r, expr) {
  ctx.strokeStyle = INK;
  ctx.lineWidth = Math.max(2, r * 0.07);
  ctx.lineCap = 'round';
  const ey = cy - r * 0.05, e = r * 0.1;
  for (const side of [-1, 1]) {
    const x = cx + side * r * 0.4;
    ctx.fillStyle = INK;
    if (expr === 'sleep') {
      ctx.beginPath(); ctx.arc(x, ey, e * 1.6, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    } else {
      circle(ctx, x, ey, e); ctx.fill();
    }
  }
  const my = cy + r * 0.48;
  ctx.beginPath();
  if (expr === 'sleep') { ctx.moveTo(cx - r * 0.12, my); ctx.lineTo(cx + r * 0.12, my); ctx.stroke(); }
  else { ctx.arc(cx, my - r * 0.18, r * 0.26, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke(); }
}

// A blank stand-in for a talking picture: no face, just who it is and which expression goes here.
function blankBust(ctx, w, h, lines) {
  const cx = w / 2, r = w * 0.24, cy = h * 0.36;
  ctx.strokeStyle = 'rgba(58,46,77,.5)';
  ctx.lineWidth = 4;
  ctx.setLineDash([12, 10]);
  ctx.fillStyle = 'rgba(255,255,255,.8)';
  rounded(ctx, w * 0.14, h * 0.6, w * 0.72, h * 0.6, 60); ctx.fill(); ctx.stroke();
  circle(ctx, cx, cy, r); ctx.fill(); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = INK;
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'center';
  lines.filter(Boolean).forEach((line, i) => ctx.fillText(line, cx, h * 0.76 + i * 34));
}

function walker(ctx, w, h, dir, frame, look) {
  const cx = w / 2, r = w * 0.3, bob = frame % 2 ? -3 : 0, cy = h * 0.33 + bob;
  ctx.fillStyle = 'rgba(0,0,0,.18)';
  ctx.beginPath(); ctx.ellipse(cx, h - 6, w * 0.32, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = INK;
  ctx.fillRect(cx - 12, h - 24, 9, frame === 1 ? 11 : 18);
  ctx.fillRect(cx + 3, h - 24, 9, frame === 3 ? 11 : 18);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.fillStyle = look.body;
  rounded(ctx, cx - w * 0.28, h * 0.5 + bob, w * 0.56, h * 0.3, 8); ctx.fill(); ctx.stroke();
  ctx.fillStyle = dir === 'up' ? look.hair : SKIN;
  circle(ctx, cx, cy, r); ctx.fill(); ctx.stroke();
  if (dir === 'up') return;
  ctx.fillStyle = look.hair;
  ctx.beginPath(); ctx.arc(cx, cy, r, 1.05 * Math.PI, 1.95 * Math.PI); ctx.closePath(); ctx.fill();
  ctx.fillStyle = INK;
  for (const off of dir === 'down' ? [-7, 7] : dir === 'left' ? [-10] : [10]) { circle(ctx, cx + off, cy + 4, 2.5); ctx.fill(); }
}

function sleeper(ctx, w, h, look) {
  const cx = w / 2, r = w * 0.3;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.fillStyle = look.body;
  rounded(ctx, cx - w * 0.28, h * 0.45, w * 0.56, h * 0.5, 8); ctx.fill(); ctx.stroke();
  ctx.fillStyle = SKIN;
  circle(ctx, cx, h * 0.33, r); ctx.fill(); ctx.stroke();
  ctx.fillStyle = look.hair;
  ctx.beginPath(); ctx.arc(cx, h * 0.33, r, 1.05 * Math.PI, 1.95 * Math.PI); ctx.closePath(); ctx.fill();
  face(ctx, cx, h * 0.33 + 2, r, 'sleep');
}

function draw(ctx, key, w, h) {
  const [kind, who, expr] = key.split('-');
  if (key === 'title-bg') return backdrop(ctx, w, h, '#ffc2d9', '#b9a7f5');
  if (key === 'intro-bg') return backdrop(ctx, w, h, '#d9f0e4', '#a9d4f0');
  if (key === 'professor-intro') return blankBust(ctx, w, h, ['professor']);
  if (kind === 'portrait') return blankBust(ctx, w, h, [who, expr]);
  if (key === 'player-sleep') return sleeper(ctx, w, h, LOOKS.player);
  if (key === 'map-bedroom') return bedroom(ctx, w, h);
  if (key === 'map-bedroom-over') return bedroomOver(ctx);
  if (key === 'map-town') return town(ctx, w, h);
  if (key === 'map-lab') return lab(ctx, w, h);
  if (key === 'prop-desk') return desk(ctx, w, h);
  if (key === 'prop-ball-table') return ballTable(ctx, w, h);
  if (key === 'battle-bg') return battleBg(ctx, w, h);
  box(ctx, w, h, key);
}

export function placeholderImage(scene, key, w, h) {
  const tex = scene.textures.createCanvas(key, w, h);
  draw(tex.getContext(), key, w, h);
  tex.refresh();
}

export function placeholderSheet(scene, key, fw, fh, cols) {
  const tex = scene.textures.createCanvas(key, fw * cols, fh * 4);
  const ctx = tex.getContext();
  // With 3 frames the sheet is stand, step, step; with 4 it is stand, step, stand, step.
  const poses = cols === 3 ? [0, 1, 3] : [0, 1, 2, 3];
  DIRS.forEach((dir, row) => {
    for (let f = 0; f < cols; f++) {
      ctx.save();
      ctx.translate(f * fw, row * fh);
      walker(ctx, fw, fh, dir, poses[f], LOOKS[key] || LOOKS.julian);
      ctx.restore();
      tex.add(row * cols + f, 0, f * fw, row * fh, fw, fh);
    }
  });
  tex.refresh();
}
