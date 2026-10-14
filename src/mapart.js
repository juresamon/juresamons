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

// ---------- bedroom ----------

export function bedroom(ctx, w, h) {
  // wooden floor
  ctx.fillStyle = '#ecc795';
  ctx.fillRect(0, 200, w, h - 200);
  for (let y = 200, row = 0; y < h; y += 40, row++) {
    stroke(ctx, 0, y, w, y, 'rgba(150,100,55,.3)', 2);
    for (let x = (row % 2) * 80; x < w; x += 160) stroke(ctx, x, y, x, y + 40, 'rgba(150,100,55,.3)', 2);
  }

  // back wall: striped wallpaper and skirting board
  ctx.fillStyle = '#f8ecd9';
  ctx.fillRect(0, 0, w, 200);
  ctx.fillStyle = '#f1dfc4';
  for (let x = 0; x < w; x += 48) ctx.fillRect(x, 0, 24, 180);
  ctx.fillStyle = '#c99260';
  ctx.fillRect(0, 180, w, 20);
  stroke(ctx, 0, 200, w, 200);

  // window with curtains
  windowPane(ctx, 420, 46, 220, 112);
  block(ctx, 390, 30, 280, 12, '#c99260', 4);
  block(ctx, 396, 38, 34, 136, '#f7a8c2', 8);
  block(ctx, 630, 38, 34, 136, '#f7a8c2', 8);

  // framed picture
  block(ctx, 720, 62, 100, 80, '#fffaf0', 4);
  block(ctx, 730, 72, 80, 60, '#bfe6f7', 2, 2);
  dot(ctx, 792, 88, 8, '#ffd76a');
  ctx.beginPath();
  ctx.moveTo(731, 131); ctx.lineTo(758, 102); ctx.lineTo(778, 120); ctx.lineTo(796, 104); ctx.lineTo(809, 131);
  ctx.closePath();
  ctx.fillStyle = '#8fd16a';
  ctx.fill();

  // door
  block(ctx, 900, 50, 90, 150, '#b27b4c', 4);
  block(ctx, 912, 64, 66, 52, '#c38b5a', 3, 2);
  block(ctx, 912, 126, 66, 60, '#c38b5a', 3, 2);
  dot(ctx, 972, 124, 5, '#ffd76a', 2);

  bookshelf(ctx, 1090, 40, 150, 160, 11);

  // plant in the corner
  block(ctx, 1470, 142, 50, 52, '#e27d5c', 6);
  dot(ctx, 1478, 128, 18, '#4ea64f', 3);
  dot(ctx, 1514, 126, 18, '#4ea64f', 3);
  dot(ctx, 1495, 112, 22, '#5cb85c', 3);

  // side and front walls
  ctx.fillStyle = '#e2c9a6';
  ctx.fillRect(0, 0, 40, h);
  ctx.fillRect(w - 40, 0, 40, h);
  ctx.fillRect(0, h - 40, w, 40);
  stroke(ctx, 40, 200, 40, h - 40);
  stroke(ctx, w - 40, 200, w - 40, h - 40);
  stroke(ctx, 40, h - 40, w - 40, h - 40);

  // rug
  block(ctx, 610, 520, 380, 210, '#8ec5ea', 26);
  block(ctx, 632, 542, 336, 166, '#a9d6f2', 18, 2);
  ctx.setLineDash([10, 8]);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(648, 558, 304, 134, 12);
  ctx.stroke();
  ctx.setLineDash([]);

  // doormat inside the door
  block(ctx, 906, 204, 78, 22, '#e9a95e', 5);

  // bed: headboard, frame, mattress, pillow (the blanket is on the -over layer)
  shadow(ctx, 225, 545, 120, 16);
  block(ctx, 116, 232, 218, 48, '#9a6a3f', 12);
  block(ctx, 120, 250, 210, 290, '#b27b4c', 10);
  block(ctx, 132, 262, 186, 266, '#ffffff', 8);
  block(ctx, 160, 272, 130, 62, '#eef3ff', 16);
}

// The blanket, drawn in front of her so she looks tucked in.
export function bedroomOver(ctx) {
  block(ctx, 126, 344, 198, 190, '#f59bb8', 10);
  block(ctx, 126, 344, 198, 32, '#ffd3e1', 10);
  for (let y = 404, row = 0; y < 520; y += 34, row++) {
    for (let x = 150 + (row % 2) * 17; x < 310; x += 34) dot(ctx, x, y, 4, 'rgba(255,255,255,.75)');
  }
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

// ---------- town ----------

function grass(ctx, w, h) {
  ctx.fillStyle = '#95d56f';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#8ccd67';
  for (let y = 0, row = 0; y < h; y += 40, row++) {
    for (let x = (row % 2) * 40; x < w; x += 80) ctx.fillRect(x, y, 40, 40);
  }
  const r = rng(7);
  for (let i = 0; i < 420; i++) {
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

function flowerBed(ctx, x, y, cols, rows, seed) {
  const r = rng(seed);
  const colours = ['#ff7a8a', '#ffffff', '#ffd76a'];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const fx = x + i * 26 + (j % 2) * 13, fy = y + j * 22;
      const petal = colours[Math.floor(r() * colours.length)];
      for (const [dx, dy] of [[-4, 0], [4, 0], [0, -4], [0, 4]]) dot(ctx, fx + dx, fy + dy, 4, petal);
      dot(ctx, fx, fy, 3, '#f2a65a');
    }
  }
}

function tallGrass(ctx, x, y, w, h) {
  for (let ty = y, row = 0; ty < y + h; ty += 30, row++) {
    for (let tx = x + (row % 2) * 20; tx < x + w - 20; tx += 40) {
      ctx.beginPath();
      ctx.moveTo(tx, ty + 30);
      ctx.lineTo(tx + 5, ty + 4); ctx.lineTo(tx + 10, ty + 24);
      ctx.lineTo(tx + 16, ty); ctx.lineTo(tx + 22, ty + 24);
      ctx.lineTo(tx + 27, ty + 6); ctx.lineTo(tx + 32, ty + 30);
      ctx.closePath();
      ctx.fillStyle = '#4f9e3f';
      ctx.fill();
      ctx.strokeStyle = '#3a7d2e';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
}

function tree(ctx, x, y, r) {
  shadow(ctx, x, y, r * 0.85, r * 0.28);
  block(ctx, x - r * 0.18, y - r * 0.75, r * 0.36, r * 0.75, '#8a5a33', 3, 3);
  dot(ctx, x, y - r * 1.25, r, '#3f9a4a', 3);
  dot(ctx, x - r * 0.3, y - r * 1.5, r * 0.42, '#5cb85c');
}

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

export function town(ctx, w, h) {
  grass(ctx, w, h);
  paths(ctx, [
    [340, 420, 80, 180], [340, 520, 880, 80], [1040, 420, 80, 180],
    [1140, 520, 80, 680], [760, 1120, 460, 80], [760, 1040, 80, 160],
  ]);

  flowerBed(ctx, 236, 446, 3, 3, 3);
  flowerBed(ctx, 450, 446, 3, 3, 5);
  flowerBed(ctx, 936, 446, 3, 3, 9);
  flowerBed(ctx, 1150, 446, 3, 3, 13);
  flowerBed(ctx, 600, 1064, 4, 2, 17);
  flowerBed(ctx, 900, 1064, 4, 2, 19);
  tallGrass(ctx, 1420, 880, 420, 340);

  // pond
  oval(ctx, 300, 1120, 160, 96, '#d9c58f', 3);
  oval(ctx, 300, 1118, 146, 84, '#7cc8f2');
  ctx.strokeStyle = 'rgba(255,255,255,.8)';
  ctx.lineWidth = 3;
  for (const [cx, cy, rx] of [[250, 1090, 40], [350, 1140, 30]]) { ctx.beginPath(); ctx.ellipse(cx, cy, rx, rx * 0.35, 0, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
  dot(ctx, 380, 1086, 14, '#6fbf5a', 2);
  dot(ctx, 214, 1150, 11, '#6fbf5a', 2);

  house(ctx, 200, 120, 360, 300, '#e9706e', '#c95553');
  house(ctx, 900, 120, 360, 300, '#6fa2df', '#5385c2');
  labBuilding(ctx, 560, 700, 480, 340);

  // a ring of trees around the edge; drawn top to bottom so nearer trees overlap farther ones
  const trees = [];
  for (let x = 30; x < w; x += 68) trees.push([x, 78], [x, h - 6]);
  for (let y = 150; y < h - 40; y += 68) trees.push([34, y], [w - 34, y]);
  trees.sort((a, b) => a[1] - b[1]).forEach(([x, y]) => tree(ctx, x, y, 36));
}

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
