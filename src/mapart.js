// Code-drawn maps and furniture in a bright, simple top-down RPG style, used until hand-drawn
// maps replace them. Everything solid is placed to match the walls in assets/maps/*.json.

const INK = '#3b3346';
const rng = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

function block(ctx, x, y, w, h, fill, r = 6, line = 3) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
  if (line) { ctx.strokeStyle = INK; ctx.lineWidth = line; ctx.stroke(); }
}

function dot(ctx, x, y, r, fill, line = 0) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  if (line) { ctx.strokeStyle = INK; ctx.lineWidth = line; ctx.stroke(); }
}

function oval(ctx, x, y, rx, ry, fill, line = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  if (line) { ctx.strokeStyle = INK; ctx.lineWidth = line; ctx.stroke(); }
}

function stroke(ctx, x1, y1, x2, y2, colour = INK, width = 3) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = colour;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.stroke();
}

const shadow = (ctx, x, y, rx, ry) => oval(ctx, x, y, rx, ry, 'rgba(40,30,60,.16)');

function windowPane(ctx, x, y, w, h) {
  block(ctx, x, y, w, h, '#fffaf0', 4);
  block(ctx, x + 6, y + 6, w - 12, h - 12, '#bfe6f7', 2, 2);
  stroke(ctx, x + w / 2, y + 6, x + w / 2, y + h - 6, '#fffaf0', 4);
  stroke(ctx, x + 6, y + h / 2, x + w - 6, y + h / 2, '#fffaf0', 4);
  stroke(ctx, x + 12, y + h / 2 - 8, x + w / 2 - 10, y + 12, 'rgba(255,255,255,.8)', 3);
}

function bookshelf(ctx, x, y, w, h, seed) {
  block(ctx, x, y, w, h, '#a8703f', 4);
  const r = rng(seed);
  const colours = ['#e9706e', '#6fa2df', '#ffd76a', '#8fd16a', '#c79ae6', '#f2a65a'];
  const shelf = (h - 12) / 3;
  for (let s = 0; s < 3; s++) {
    const bottom = y + 6 + shelf * (s + 1);
    for (let bx = x + 10; bx < x + w - 22;) {
      const bw = 12 + Math.floor(r() * 8), bh = shelf - 14 - Math.floor(r() * 10);
      block(ctx, bx, bottom - bh - 4, bw, bh, colours[Math.floor(r() * colours.length)], 2, 2);
      bx += bw + 2;
    }
    stroke(ctx, x + 4, bottom - 2, x + w - 4, bottom - 2, '#7d5433', 5);
  }
}

// ---------- rooms ----------

function woodFloor(ctx, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(0, 200, w, h - 200);
  for (let y = 200, row = 0; y < h; y += 40, row++) {
    stroke(ctx, 0, y, w, y, 'rgba(150,100,55,.3)', 2);
    for (let x = (row % 2) * 80; x < w; x += 160) stroke(ctx, x, y, x, y + 40, 'rgba(150,100,55,.3)', 2);
  }
}

// Striped wallpaper above a skirting board, filling the top 200px.
function wallpaper(ctx, w, base, stripe, skirting) {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, 200);
  ctx.fillStyle = stripe;
  for (let x = 0; x < w; x += 48) ctx.fillRect(x, 0, 24, 180);
  ctx.fillStyle = skirting;
  ctx.fillRect(0, 180, w, 20);
  stroke(ctx, 0, 200, w, 200);
}

// Side walls, and a front wall with an optional gap [from, to] for a way out.
function roomEdges(ctx, w, h, fill, front = 40, gap = null) {
  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, 40, h);
  ctx.fillRect(w - 40, 0, 40, h);
  ctx.fillRect(0, h - front, w, front);
  stroke(ctx, 40, 200, 40, h - front);
  stroke(ctx, w - 40, 200, w - 40, h - front);
  if (!gap) return stroke(ctx, 40, h - front, w - 40, h - front);
  stroke(ctx, 40, h - front, gap[0], h - front);
  stroke(ctx, gap[1], h - front, w - 40, h - front);
}

function door(ctx, x, y) {
  block(ctx, x, y, 90, 150, '#b27b4c', 4);
  block(ctx, x + 12, y + 14, 66, 52, '#c38b5a', 3, 2);
  block(ctx, x + 12, y + 76, 66, 60, '#c38b5a', 3, 2);
  dot(ctx, x + 72, y + 74, 5, '#ffd76a', 2);
}

function picture(ctx, x, y) {
  block(ctx, x, y, 100, 80, '#fffaf0', 4);
  block(ctx, x + 10, y + 10, 80, 60, '#bfe6f7', 2, 2);
  dot(ctx, x + 72, y + 26, 8, '#ffd76a');
  ctx.beginPath();
  ctx.moveTo(x + 11, y + 69); ctx.lineTo(x + 38, y + 40); ctx.lineTo(x + 58, y + 58); ctx.lineTo(x + 76, y + 42); ctx.lineTo(x + 89, y + 69);
  ctx.closePath();
  ctx.fillStyle = '#8fd16a';
  ctx.fill();
}

function rug(ctx, x, y, w, h, outer, inner) {
  block(ctx, x, y, w, h, outer, 26);
  block(ctx, x + 22, y + 22, w - 44, h - 44, inner, 18, 2);
  ctx.setLineDash([10, 8]);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(x + 38, y + 38, w - 76, h - 76, 12);
  ctx.stroke();
  ctx.setLineDash([]);
}

// ---------- bedroom ----------

export function bedroom(ctx, w, h) {
  woodFloor(ctx, w, h, '#ecc795');
  wallpaper(ctx, w, '#f8ecd9', '#f1dfc4', '#c99260');

  // window with curtains
  windowPane(ctx, 330, 46, 180, 112);
  block(ctx, 300, 30, 240, 12, '#c99260', 4);
  block(ctx, 306, 38, 34, 136, '#f7a8c2', 8);
  block(ctx, 500, 38, 34, 136, '#f7a8c2', 8);

  picture(ctx, 135, 60);
  door(ctx, 600, 50);
  bookshelf(ctx, 790, 40, 150, 160, 11);
  roomEdges(ctx, w, h, '#e2c9a6');
  rug(ctx, 420, 420, 300, 170, '#8ec5ea', '#a9d6f2');

  // doormat inside the door
  block(ctx, 606, 204, 78, 22, '#e9a95e', 5);

  // bed: headboard, frame, mattress, pillow (the blanket is on the -over layer)
  shadow(ctx, 185, 545, 120, 16);
  block(ctx, 76, 232, 218, 48, '#9a6a3f', 12);
  block(ctx, 80, 250, 210, 290, '#b27b4c', 10);
  block(ctx, 92, 262, 186, 266, '#ffffff', 8);
  block(ctx, 120, 272, 130, 62, '#eef3ff', 16);
}

// The blanket, drawn in front of her so she looks tucked in.
export function bedroomOver(ctx) {
  block(ctx, 86, 344, 198, 190, '#f59bb8', 10);
  block(ctx, 86, 344, 198, 32, '#ffd3e1', 10);
  for (let y = 404, row = 0; y < 520; y += 34, row++) {
    for (let x = 110 + (row % 2) * 17; x < 270; x += 34) dot(ctx, x, y, 4, 'rgba(255,255,255,.75)');
  }
}

// ---------- Julian's house ----------

export function julianHouse(ctx, w, h) {
  woodFloor(ctx, w, h, '#e3c79c');
  wallpaper(ctx, w, '#e6eefa', '#d6e3f5', '#8fa9c9');

  windowPane(ctx, 500, 46, 120, 100);
  bookshelf(ctx, 300, 40, 140, 160, 31);
  roomEdges(ctx, w, h, '#c9d6e6', 30, [420, 540]);
  rug(ctx, 330, 330, 300, 180, '#7fa8e0', '#a3c3ef');

  // desk with a computer against the back wall
  shadow(ctx, 170, 296, 96, 10);
  block(ctx, 80, 200, 180, 70, '#c48e5c', 6);
  block(ctx, 92, 262, 14, 30, '#8a5a33', 3);
  block(ctx, 234, 262, 14, 30, '#8a5a33', 3);
  block(ctx, 120, 140, 90, 64, '#5d6f80', 5);
  block(ctx, 127, 147, 76, 48, '#8ef0c4', 3, 2);
  block(ctx, 150, 204, 30, 10, '#5d6f80', 3, 2);
  block(ctx, 120, 226, 80, 20, '#eef3ff', 4, 2);

  // bed with a blue blanket
  shadow(ctx, 830, 425, 84, 12);
  block(ctx, 756, 214, 148, 40, '#9a6a3f', 12);
  block(ctx, 760, 230, 140, 190, '#b27b4c', 10);
  block(ctx, 770, 240, 120, 170, '#ffffff', 8);
  block(ctx, 786, 248, 88, 44, '#eef3ff', 14);
  block(ctx, 766, 300, 128, 114, '#6fa2df', 10);
  block(ctx, 766, 300, 128, 24, '#a9cdf2', 10);

  // doormat at the way out
  block(ctx, 420, 582, 120, 30, '#e9a95e', 6);
}

// A poster on Julian's wall of a white shirt with a design printed on it (an image, if loaded).
export function shirtPoster(ctx, w, h, design) {
  ctx.save();
  ctx.scale(w / 140, h / 170);   // drawn on a 140 x 170 grid, then fitted to the poster's size
  w = 140; h = 170;
  block(ctx, 2, 2, w - 4, h - 4, '#fffaf0', 4);
  block(ctx, 8, 8, w - 16, h - 16, '#cfe2f7', 3, 0);
  ctx.beginPath();
  ctx.moveTo(52, 26);
  ctx.quadraticCurveTo(70, 42, 88, 26);
  ctx.lineTo(112, 30); ctx.lineTo(132, 58); ctx.lineTo(117, 74); ctx.lineTo(110, 66);
  ctx.lineTo(110, 156); ctx.lineTo(30, 156); ctx.lineTo(30, 66);
  ctx.lineTo(23, 74); ctx.lineTo(8, 58); ctx.lineTo(28, 30);
  ctx.closePath();
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  ctx.stroke();
  stroke(ctx, 56, 30, 84, 30, 'rgba(59,51,70,.25)', 2);
  if (design) ctx.drawImage(design, 40, 54, 60, 70);
  else block(ctx, 40, 54, 60, 70, '#7f86c9', 6, 0);
  ctx.restore();
}

export function desk(ctx, w, h) {
  shadow(ctx, w / 2, h - 6, w * 0.46, 8);
  block(ctx, 14, 80, 16, h - 88, '#8a5a33', 3);
  block(ctx, w - 30, 80, 16, h - 88, '#8a5a33', 3);
  block(ctx, 2, 40, w - 4, 46, '#c48e5c', 6);
  block(ctx, w - 72, 50, 52, 26, '#b27b4c', 4, 2);
  dot(ctx, w - 46, 63, 3, '#ffd76a');
  // lamp
  block(ctx, 30, 30, 28, 10, '#fffaf0', 3, 2);
  stroke(ctx, 44, 30, 44, 12);
  block(ctx, 28, 0, 32, 16, '#ffd76a', 6, 2);
  // books
  block(ctx, 92, 26, 42, 14, '#6fa2df', 3, 2);
  block(ctx, 96, 14, 36, 12, '#f2a65a', 3, 2);
}

// ---------- outdoors ----------

export const TILE = 60;   // the town and the route are laid out on a grid of 60px squares

function grass(ctx, w, h, t = 40) {
  ctx.fillStyle = '#95d56f';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#8ccd67';
  for (let y = 0, row = 0; y < h; y += t, row++) {
    for (let x = (row % 2) * t; x < w; x += t * 2) ctx.fillRect(x, y, t, t);
  }
  const r = rng(7);
  for (let i = 0; i < (w * h) / 6700; i++) {
    const x = r() * w, y = r() * h;
    ctx.beginPath();
    ctx.moveTo(x - 4, y - 6); ctx.lineTo(x, y); ctx.lineTo(x + 4, y - 6);
    ctx.strokeStyle = '#6db14f';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function paths(ctx, rects) {
  ctx.fillStyle = '#d7bf84';
  for (const [x, y, w, h] of rects) ctx.fillRect(x - 5, y - 5, w + 10, h + 10);
  ctx.fillStyle = '#efdca6';
  for (const [x, y, w, h] of rects) ctx.fillRect(x, y, w, h);
  const r = rng(3);
  for (const [x, y, w, h] of rects) {
    for (let i = 0; i < (w * h) / 2500; i++) dot(ctx, x + 6 + r() * (w - 12), y + 6 + r() * (h - 12), 2 + r() * 2, '#dcc58c');
  }
}

// Two red flowers in one square.
function flowers(ctx, x, y) {
  for (const [fx, fy] of [[x + 20, y + 22], [x + 40, y + 40]]) {
    dot(ctx, fx - 7, fy + 7, 5, '#4f9e3f');
    dot(ctx, fx + 7, fy + 7, 5, '#4f9e3f');
    for (const [dx, dy] of [[-5, 0], [5, 0], [0, -5], [0, 5]]) dot(ctx, fx + dx, fy + dy, 5, '#f26464');
    dot(ctx, fx, fy, 3, '#ffd76a');
  }
}

// One clump of tall grass filling a 30px square.
function tuft(ctx, x, y) {
  ctx.beginPath();
  ctx.moveTo(x, y + 30);
  ctx.lineTo(x + 4, y + 6); ctx.lineTo(x + 9, y + 22);
  ctx.lineTo(x + 15, y); ctx.lineTo(x + 21, y + 22);
  ctx.lineTo(x + 26, y + 6); ctx.lineTo(x + 30, y + 30);
  ctx.closePath();
  ctx.fillStyle = '#4f9e3f';
  ctx.fill();
  ctx.strokeStyle = '#3a7d2e';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function tallGrass(ctx, x, y) {
  ctx.fillStyle = '#6cb555';
  ctx.fillRect(x, y, TILE, TILE);
  for (const [dx, dy] of [[0, 0], [30, 0], [0, 30], [30, 30]]) tuft(ctx, x + dx, y + dy);
}

// The bottom of a few clumps, shown over someone's feet while they stand in tall grass.
export function grassFront(ctx, w, h) {
  for (let x = 0; x < w - 20; x += 17) tuft(ctx, x, h - 30);
}

// A low rocky ledge she can hop down but not climb. The matching wall sits on the same band.
function ledge(ctx, x0, x1, y) {
  block(ctx, x0 + 3, y, x1 - x0 - 6, 16, '#a26f4b', 8, 3);
  stroke(ctx, x0 + 14, y + 5, x1 - 14, y + 5, '#c99063', 3);
}

// A white picket fence whose posts stand on the line y.
function fence(ctx, x, y, w) {
  block(ctx, x, y - 28, w, 7, '#f4f1ea', 3, 2);
  block(ctx, x, y - 15, w, 7, '#f4f1ea', 3, 2);
  for (let px = x + 8; px <= x + w - 8; px += 28) block(ctx, px - 6, y - 38, 12, 38, '#ffffff', 4, 2.5);
}

function fencePosts(ctx, x, y0, y1) {
  block(ctx, x - 4, y0, 8, y1 - y0, '#f4f1ea', 3, 2);
  for (let py = y0; py < y1; py += 30) block(ctx, x - 6, py, 12, 36, '#ffffff', 4, 2.5);
}

// A signboard standing on the line y.
function signpost(ctx, x, y, board = '#c79a62') {
  shadow(ctx, x, y, 28, 6);
  block(ctx, x - 20, y - 18, 6, 18, '#8a5a33', 2, 2);
  block(ctx, x + 14, y - 18, 6, 18, '#8a5a33', 2, 2);
  block(ctx, x - 30, y - 50, 60, 36, board, 6);
  stroke(ctx, x - 18, y - 38, x + 18, y - 38, 'rgba(59,51,70,.55)', 3);
  stroke(ctx, x - 18, y - 27, x + 10, y - 27, 'rgba(59,51,70,.55)', 3);
}

function mailbox(ctx, x, y) {
  shadow(ctx, x, y, 18, 5);
  block(ctx, x - 4, y - 32, 8, 32, '#8a5a33', 2, 2);
  block(ctx, x - 17, y - 58, 34, 28, '#ffffff', 12);
  stroke(ctx, x - 9, y - 44, x + 9, y - 44, '#c9c2d6', 3);
  block(ctx, x + 14, y - 66, 5, 20, '#e9706e', 2, 2);
}

function pond(ctx, x, y, w, h) {
  block(ctx, x, y, w, h + 30, '#d9c58f', 30);
  block(ctx, x + 12, y + 12, w - 24, h + 30, '#7cc8f2', 22, 0);
  ctx.strokeStyle = 'rgba(255,255,255,.8)';
  ctx.lineWidth = 3;
  for (const [cx, cy, rx] of [[x + w * 0.35, y + 60, 36], [x + w * 0.65, y + 120, 28]]) {
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, rx * 0.35, 0, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  }
  dot(ctx, x + w - 52, y + 52, 14, '#6fbf5a', 2);
  dot(ctx, x + 50, y + 150, 11, '#6fbf5a', 2);
}

// A pine tree standing on the line y, about two squares wide.
function pine(ctx, x, y, s = TILE * 2) {
  shadow(ctx, x, y - 4, s * 0.36, s * 0.09);
  block(ctx, x - s * 0.07, y - s * 0.24, s * 0.14, s * 0.22, '#8a5a33', 3, 3);
  ctx.save();
  ctx.lineJoin = 'round';
  for (const [base, top, half, fill] of [[0.18, 0.72, 0.46, '#3f9a4a'], [0.44, 0.94, 0.36, '#46a851'], [0.68, 1.1, 0.25, '#5cb85c']]) {
    ctx.beginPath();
    ctx.moveTo(x - s * half, y - s * base);
    ctx.quadraticCurveTo(x, y - s * (base - 0.08), x + s * half, y - s * base);
    ctx.lineTo(x, y - s * top);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  ctx.restore();
  stroke(ctx, x - s * 0.08, y - s * 0.96, x - s * 0.17, y - s * 0.8, 'rgba(255,255,255,.4)', 4);
}

// Things that stand up off the ground (trees, buildings, fences, signs) are drawn one by one
// over the ground picture, each sorted by its base like the characters, so someone walking
// behind one is hidden by it and someone in front isn't. Each is { x, y, w, h, base, draw }:
// the box it fits in, the line it stands on, and a function that draws it in place.
const standing = (x, y, w, h, base, draw) => ({ x, y, w, h, base, draw });

// A pine on the [column, row] square; it fills that square and the three after it.
function pineAt(c, r) {
  const x = (c + 1) * TILE, y = (r + 2) * TILE - 6;
  return standing(x - 62, y - 142, 124, 158, y, ctx => pine(ctx, x, y));
}
const houseThing = o => standing(o.x - 28, o.y - 30, o.w + 56, o.h + 52, o.y + o.h, ctx => house(ctx, o.x, o.y, o.w, o.h, o.roof, o.lines));
const fenceThing = (x, y, w) => standing(x - 4, y - 42, w + 8, 46, y, ctx => fence(ctx, x, y, w));
const signThing = (x, y, board) => standing(x - 34, y - 54, 68, 64, y, ctx => signpost(ctx, x, y, board));
const mailboxThing = (x, y) => standing(x - 22, y - 70, 46, 78, y, ctx => mailbox(ctx, x, y));

function house(ctx, x, y, w, h, roof, roofLines) {
  const top = y + Math.round(h * 0.45);
  shadow(ctx, x + w / 2, y + h + 2, w * 0.56, 16);
  block(ctx, x + w - 96, y - 24, 34, 60, '#d9a07a', 3);   // chimney
  block(ctx, x, top, w, y + h - top, '#fff3df', 4);
  ctx.fillStyle = '#ead6b4';
  ctx.fillRect(x + 2, y + h - 18, w - 4, 16);
  stroke(ctx, x, y + h - 18, x + w, y + h - 18, INK, 2);

  ctx.beginPath();
  ctx.moveTo(x - 22, top + 6); ctx.lineTo(x + 26, y); ctx.lineTo(x + w - 26, y); ctx.lineTo(x + w + 22, top + 6);
  ctx.closePath();
  ctx.fillStyle = roof;
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.stroke();
  for (let ry = y + 26; ry < top; ry += 26) {
    const t = (ry - y) / (top + 6 - y);
    stroke(ctx, x + 26 - 48 * t + 6, ry, x + w - 26 + 48 * t - 6, ry, roofLines, 3);
  }

  windowPane(ctx, x + 40, top + 36, 64, 50);
  windowPane(ctx, x + w - 104, top + 36, 64, 50);
  block(ctx, x + w / 2 - 30, y + h - 80, 60, 80, '#b27b4c', 4);
  block(ctx, x + w / 2 - 22, y + h - 70, 44, 30, '#c38b5a', 3, 2);
  dot(ctx, x + w / 2 + 18, y + h - 36, 4, '#ffd76a', 2);
  block(ctx, x + w / 2 - 40, y + h - 4, 80, 10, '#d8cbb3', 3, 2);
}

function labBuilding(ctx, x, y, w, h) {
  const top = y + 110;
  shadow(ctx, x + w / 2, y + h + 2, w * 0.56, 18);
  block(ctx, x, top, w, y + h - top, '#f7fbff', 4);
  ctx.fillStyle = '#dde8f1';
  ctx.fillRect(x + 2, y + h - 18, w - 4, 16);
  stroke(ctx, x, y + h - 18, x + w, y + h - 18, INK, 2);
  for (const wx of [x + 30, x + 140, x + w - 210, x + w - 100]) windowPane(ctx, wx, top + 50, 80, 60);

  // flat roof with a satellite dish
  stroke(ctx, x + w - 70, y + 30, x + w - 70, y - 2);
  oval(ctx, x + w - 70, y - 10, 28, 12, '#e8eef4', 3);
  block(ctx, x - 16, y + 30, w + 32, 90, '#6f8fb3', 6);
  block(ctx, x - 16, y + 30, w + 32, 24, '#88a7c9', 6);

  // sign and glass door
  block(ctx, x + w / 2 - 60, top - 4, 120, 40, '#ffffff', 6);
  ctx.fillStyle = INK;
  ctx.font = 'bold 26px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('LAB', x + w / 2, top + 17);
  block(ctx, x + w / 2 - 30, y + h - 80, 60, 80, '#7fb3e6', 4);
  block(ctx, x + w / 2 - 22, y + h - 72, 44, 64, '#bfe6f7', 3, 2);
  stroke(ctx, x + w / 2, y + h - 72, x + w / 2, y + h - 8, INK, 2);
  block(ctx, x + w / 2 - 40, y + h - 4, 80, 10, '#d8cbb3', 3, 2);
}

// Where everything in town stands. The walls in assets/maps/town.json are placed to match.
export const TOWN = {
  homes: [
    { x: 300, y: 210, w: 300, h: 270, roof: '#e9706e', lines: '#c95553' },   // hers
    { x: 900, y: 210, w: 300, h: 270, roof: '#6fa2df', lines: '#5385c2' },   // Julian's
  ],
  lab: { x: 760, y: 630, w: 480, h: 300 },
  pond: { x: 360, y: 990, w: 240, h: 210 },
  mailboxes: [[270, 470], [870, 470]],   // just left of each house
  garden: { x: 300, y: 700, w: 240 },   // fence along y, flowers in the four squares below
  townSign: [330, 890],
  labFence: { x: 790, y: 1060, w: 420, sign: 1000 },
  paths: [
    [750, 0, 60, 560],      // north to the route
    [420, 480, 60, 80], [1020, 480, 60, 80], [420, 500, 660, 60],
    [700, 500, 60, 500], [700, 940, 330, 60],   // round the side of the lab to its door
  ],
};

export function town(ctx, w, h) {
  const t = TOWN;
  grass(ctx, w, h, TILE);
  paths(ctx, t.paths);

  const g = t.garden;
  for (let x = g.x; x < g.x + g.w; x += TILE) for (const y of [g.y + 20, g.y + 80]) flowers(ctx, x, y);
  pond(ctx, t.pond.x, t.pond.y, t.pond.w, t.pond.h);
}

export function townStanding() {
  const t = TOWN, g = t.garden, f = t.labFence, L = t.lab;
  const things = [
    fenceThing(g.x, g.y, g.w),
    signThing(...t.townSign),
    ...t.mailboxes.map(([x, y]) => mailboxThing(x, y)),
    ...t.homes.map(houseThing),
    standing(L.x - 22, L.y - 32, L.w + 44, L.h + 58, L.y + L.h, ctx => labBuilding(ctx, L.x, L.y, L.w, L.h)),
    fenceThing(f.x, f.y, f.sign - 34 - f.x),
    fenceThing(f.sign + 34, f.y, f.x + f.w - f.sign - 34),
    signThing(f.sign, f.y, '#dfe6ee'),
  ];
  // pines all round the edge, with a gap at the top for the way north and room for the pond
  for (let c = 0; c < 24; c += 2) if (c !== 12) things.push(pineAt(c, 0));
  for (let r = 2; r < 18; r += 2) things.push(pineAt(0, r), pineAt(22, r));
  for (const c of [0, 2, 4, 10, 12, 14, 16, 18, 20, 22]) things.push(pineAt(c, 18));
  return things;
}

// ---------- route ----------

// The route north of town, one letter per 60px square:
//   T tree   . grass   p path   g tall grass   f flowers   F fence   S sign
// `ledges` are [row, first column, last column]; each one is a low drop she can hop down.
// The walls in assets/maps/route.json are made from this same grid.
export const ROUTE = {
  rows: [
    'TTTTTTTTTTppppTTTTTTTTTT',
    'TTTTTTTTTTppppTTTTTTTTTT',
    'TT........pppp.....f.fTT',
    'TT........ppppppppppppTT',
    'TT......TTppppppppppppTT',
    'TT......TT........ppppTT',
    'TT.f...fTTggggggggggggTT',
    'TTf...f.TTggggggggggggTT',
    'TT.f...fTTggggggggggggTT',
    'TTf...f.TTggggggggggggTT',
    'TT......TTggggggggggggTT',
    'TT.f....TT...pppppppppTT',
    'TTf..........pppppppppTT',
    'TT.f.........pppggggggTT',
    'TTTT......TTTTTTggggggTT',
    'TTTT......TTTTTTggggggTT',
    'TT..............ggggggTT',
    'TT...........pppggggggTT',
    'TT...ppppppppppp...f.fTT',
    'TT...ppppppppppp..f.f.TT',
    'TT...pppp.............TT',
    'TT...pppppppppppppppppTT',
    'TT...pppppppppppppppppTT',
    'TT................ppppTT',
    'TTTTTTTTTTTTggggggppppTT',
    'TTTTTTTTTTTTggggggppppTT',
    'TT..........ggggggppppTT',
    'TT.f.f......ggggggppppTT',
    'TTf.f.......ggggggppppTT',
    'TTppppppppppppppppppppTT',
    'TTppppppppppppppppppppTT',
    'TT.......S.pppp.......TT',
    'TT..gggggggpppp..gggggTT',
    'TT..gggggggpppp..gggggTT',
    'TTggggggg.fppppgggggf.TT',
    'TTgggggggf..gg.ggggg.fTT',
    'TTFFFFFFFFFFggFFFFFFFFTT',
    'TT.........FggF.......TT',
    'TTTTTTTTTTTTggTTTTTTTTTT',
    'TTTTTTTTTTTTggTTTTTTTTTT',
  ],
  ledges: [[5, 2, 7], [5, 10, 15], [10, 2, 7], [15, 4, 9], [20, 2, 3], [20, 5, 8], [20, 11, 21], [26, 18, 21], [31, 2, 5], [31, 10, 21]],
};

export const ledgeTop = row => row * TILE + 30;   // ledges are 16px tall bands across their row

// Runs of one letter along each row, as [x, y, w, h] rectangles.
export function runs(rows, letters) {
  const out = [];
  rows.forEach((row, r) => {
    for (let c = 0; c < row.length;) {
      if (!letters.includes(row[c])) { c++; continue; }
      const start = c;
      while (c < row.length && letters.includes(row[c])) c++;
      out.push([start * TILE, r * TILE, (c - start) * TILE, TILE]);
    }
  });
  return out;
}

export function route(ctx, w, h) {
  const rows = ROUTE.rows;
  grass(ctx, w, h, TILE);
  paths(ctx, runs(rows, 'p'));
  rows.forEach((row, r) => [...row].forEach((ch, c) => {
    if (ch === 'f') flowers(ctx, c * TILE, r * TILE);
    if (ch === 'g') tallGrass(ctx, c * TILE, r * TILE);
  }));
  for (const [r, c0, c1] of ROUTE.ledges) ledge(ctx, c0 * TILE, (c1 + 1) * TILE, ledgeTop(r));
}

export function routeStanding() {
  const rows = ROUTE.rows, at = (c, r) => rows[r]?.[c], things = [];
  rows.forEach((row, r) => [...row].forEach((ch, c) => {
    if (ch === 'T' && c % 2 === 0 && r % 2 === 0) things.push(pineAt(c, r));
    if (ch === 'S') things.push(signThing(c * TILE + 30, r * TILE + 52, '#dfe6ee'));
    if (ch !== 'F') return;
    // a fence square with fence beside it runs sideways; one on its own is a gatepost
    if (at(c - 1, r) === 'F' || at(c + 1, r) === 'F') {
      if (at(c - 1, r) !== 'F') things.push(fenceThing(c * TILE, r * TILE + 50, runs([row.slice(c)], 'F')[0][2]));
    } else {
      const x = c * TILE + 30, y0 = r * TILE, y1 = (r + 1) * TILE + 10;
      things.push(standing(x - 10, y0 - 4, 20, y1 - y0 + 8, y1, ctx => fencePosts(ctx, x, y0, y1)));
    }
  }));
  return things;
}

// The standing things for each map drawn in code.
export const STANDING = { town: townStanding, route: routeStanding };

// ---------- lab ----------

export function lab(ctx, w, h) {
  for (let y = 180, row = 0; y < h; y += 40, row++) {
    for (let x = 0, col = 0; x < w; x += 40, col++) {
      ctx.fillStyle = (row + col) % 2 ? '#dde8f0' : '#f3f8fb';
      ctx.fillRect(x, y, 40, 40);
    }
  }

  // back wall
  ctx.fillStyle = '#dbe8f1';
  ctx.fillRect(0, 0, w, 180);
  ctx.fillStyle = '#c7d9e6';
  ctx.fillRect(0, 112, w, 14);
  ctx.fillStyle = '#9fb6c8';
  ctx.fillRect(0, 164, w, 16);
  stroke(ctx, 0, 180, w, 180);

  bookshelf(ctx, 60, 24, 150, 156, 21);
  bookshelf(ctx, 1070, 24, 150, 156, 23);

  // computers on a counter
  block(ctx, 300, 96, 240, 72, '#a9bccb', 6);
  for (const mx of [316, 400, 484]) {
    block(ctx, mx, 40, 70, 52, '#5d6f80', 5);
    block(ctx, mx + 6, 46, 58, 38, '#8ef0c4', 3, 2);
    stroke(ctx, mx + 14, 58, mx + 44, 58, '#4fbf8f', 3);
    stroke(ctx, mx + 14, 70, mx + 36, 70, '#4fbf8f', 3);
  }

  // whiteboard
  block(ctx, 760, 36, 230, 100, '#ffffff', 6);
  stroke(ctx, 784, 64, 870, 64, '#6fa2df', 3);
  stroke(ctx, 784, 84, 850, 84, '#6fa2df', 3);
  stroke(ctx, 784, 104, 880, 104, '#e9706e', 3);
  dot(ctx, 940, 84, 24, '#ffffff', 3);
  stroke(ctx, 916, 84, 964, 84, INK, 3);

  // side and front walls
  ctx.fillStyle = '#b9cbd8';
  ctx.fillRect(0, 0, 40, h);
  ctx.fillRect(w - 40, 0, 40, h);
  ctx.fillRect(0, h - 30, w, 30);
  stroke(ctx, 40, 180, 40, h - 30);
  stroke(ctx, w - 40, 180, w - 40, h - 30);
  stroke(ctx, 40, h - 30, 580, h - 30);
  stroke(ctx, 700, h - 30, w - 40, h - 30);

  // a machine on the floor
  shadow(ctx, 220, 424, 112, 12);
  block(ctx, 120, 300, 200, 122, '#8ea3b5', 10);
  block(ctx, 136, 316, 92, 56, '#2f3b48', 6);
  stroke(ctx, 148, 334, 200, 334, '#8ef0c4', 3);
  stroke(ctx, 148, 350, 184, 350, '#8ef0c4', 3);
  dot(ctx, 254, 330, 9, '#e9706e', 2);
  dot(ctx, 284, 330, 9, '#ffd76a', 2);
  dot(ctx, 269, 356, 9, '#8fd16a', 2);
  for (let vx = 140; vx < 300; vx += 16) stroke(ctx, vx, 392, vx, 410, '#6f8496', 3);

  // doormat at the way out
  block(ctx, 580, 652, 120, 36, '#e2685f', 6);
  ctx.setLineDash([8, 6]);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.strokeRect(590, 660, 100, 20);
  ctx.setLineDash([]);
}

// ---------- dance battle ----------

// Julian's room seen from the front: his wallpaper, window, bookshelf, desk, poster and bed.
export function danceBg(ctx, w, h, design) {
  const floor = Math.round(h * 0.66);

  // striped wallpaper and skirting board
  ctx.fillStyle = '#e6eefa';
  ctx.fillRect(0, 0, w, floor);
  ctx.fillStyle = '#d6e3f5';
  for (let x = 0; x < w; x += 48) ctx.fillRect(x, 0, 24, floor - 20);
  ctx.fillStyle = '#8fa9c9';
  ctx.fillRect(0, floor - 20, w, 20);

  // wooden floor
  ctx.fillStyle = '#e3c79c';
  ctx.fillRect(0, floor, w, h - floor);
  for (let y = floor + 34; y < h; y += 34) stroke(ctx, 0, y, w, y, 'rgba(150,100,55,.3)', 2);
  stroke(ctx, 0, floor, w, floor, INK, 4);

  windowPane(ctx, 620, 80, 170, 150);
  bookshelf(ctx, 120, floor - 270, 170, 270, 31);

  // desk with his computer
  block(ctx, 360, floor - 130, 240, 26, '#c48e5c', 6);
  block(ctx, 376, floor - 104, 16, 104, '#8a5a33', 3);
  block(ctx, 568, floor - 104, 16, 104, '#8a5a33', 3);
  block(ctx, 420, floor - 250, 120, 90, '#5d6f80', 6);
  block(ctx, 430, floor - 240, 100, 70, '#8ef0c4', 3, 2);
  block(ctx, 466, floor - 160, 28, 30, '#5d6f80', 3, 2);
  block(ctx, 430, floor - 142, 100, 12, '#eef3ff', 3, 2);

  // the shirt poster, above his bed
  ctx.save();
  ctx.translate(1195, 150);
  shirtPoster(ctx, 120, 156, design);
  ctx.restore();

  // his bed, side on
  block(ctx, 1270, floor - 210, 34, 210, '#9a6a3f', 10);
  block(ctx, 1010, floor - 70, 280, 40, '#b27b4c', 8);
  block(ctx, 1020, floor - 40, 16, 40, '#8a5a33', 3);
  block(ctx, 1250, floor - 40, 16, 40, '#8a5a33', 3);
  block(ctx, 1014, floor - 100, 270, 34, '#ffffff', 8);
  block(ctx, 1190, floor - 126, 76, 30, '#eef3ff', 12);
  block(ctx, 1000, floor - 110, 190, 52, '#6fa2df', 12);
  block(ctx, 1000, floor - 110, 190, 16, '#a9cdf2', 8);

  // his blue rug in front
  oval(ctx, w / 2, floor + 150, 460, 80, '#7fa8e0', 3);
  oval(ctx, w / 2, floor + 150, 400, 60, '#a3c3ef', 2);
}

// ---------- battle ----------

// Sky, hills and a grassy field, with a platform for each creature (see SPOT in Battle.js).
export function battleBg(ctx, w, h) {
  const sky = ctx.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, '#9fd8f5');
  sky.addColorStop(1, '#e6f6ff');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, 300);
  for (const [x, y, s] of [[170, 70, 1], [600, 44, 0.8], [1060, 92, 1.1]]) {
    dot(ctx, x, y, 28 * s, '#ffffff');
    dot(ctx, x + 32 * s, y - 12 * s, 34 * s, '#ffffff');
    dot(ctx, x + 66 * s, y, 26 * s, '#ffffff');
  }
  oval(ctx, 200, 300, 360, 90, '#b5e39a');
  oval(ctx, 760, 300, 430, 110, '#a6dc8a');
  oval(ctx, 1210, 300, 300, 80, '#b5e39a');

  ctx.fillStyle = '#95d56f';
  ctx.fillRect(0, 280, w, h - 280);
  ctx.fillStyle = '#8fd069';
  for (let y = 280, row = 0; y < h; y += 40, row++) if (row % 2) ctx.fillRect(0, y, w, 40);
  const r = rng(29);
  for (let i = 0; i < 90; i++) {
    const x = r() * w, y = 300 + r() * (h - 300);
    ctx.beginPath();
    ctx.moveTo(x - 4, y - 6); ctx.lineTo(x, y); ctx.lineTo(x + 4, y - 6);
    ctx.strokeStyle = '#6db14f';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  oval(ctx, 930, 292, 220, 50, '#7cc25a', 3);
  oval(ctx, 930, 286, 196, 38, '#9be07a');
  oval(ctx, 330, 500, 260, 58, '#7cc25a', 3);
  oval(ctx, 330, 493, 232, 44, '#9be07a');
}

// A lab table holding three plain coloured orbs.
export function ballTable(ctx, w, h) {
  shadow(ctx, w / 2, h - 6, w * 0.45, 8);
  block(ctx, 16, 84, 12, h - 92, '#9fb0bf', 3);
  block(ctx, w - 28, 84, 12, h - 92, '#9fb0bf', 3);
  block(ctx, 2, 56, w - 4, 34, '#f4f8fb', 6);
  block(ctx, 2, 78, w - 4, 12, '#cfdbe5', 4, 2);
  ['#f08a8a', '#8ac6f0', '#9be08f'].forEach((colour, i) => {
    const x = w / 2 + (i - 1) * 62;
    block(ctx, x - 16, 52, 32, 10, '#cfdbe5', 3, 2);
    dot(ctx, x, 38, 17, colour, 3);
    dot(ctx, x - 6, 32, 5, 'rgba(255,255,255,.8)');
  });
}
