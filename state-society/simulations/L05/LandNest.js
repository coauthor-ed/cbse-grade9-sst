// LandNest.js - land inside land, shared by L05 AdminLadderScene and L06 CholaLadderScene.
// A helper, not a scene. A level is a map of jittered cells. One cell of each level is the next
// level, so the camera can fly into it: nesting is drawn, never told. Level v may be fractional.
// The last level is a village close to the viewer. Colours are tokens via SstArt pal().
import { alpha, mix, lighten, darken, rr, mulberry32, drawVignette } from 'simulations/base/kit/SimLook.js';
import { pal, hut, tree } from '../shared/SstArt.js';

const W = 680, H = 520;
const seg = (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a)));

/** One level's cells: cols x rows, with shared corners nudged by a seeded jitter. */
export function makeLevel(cols, rows, seed, child) {
  const rnd = mulberry32(seed), pts = [];
  for (let j = 0; j <= rows; j++) {
    pts[j] = [];
    for (let i = 0; i <= cols; i++) {
      const edgeX = i === 0 || i === cols, edgeY = j === 0 || j === rows;
      pts[j][i] = {
        x: (i / cols) * (W + 120) - 60 + (edgeX ? 0 : (rnd() - 0.5) * 90),
        y: (j / rows) * (H + 120) - 60 + (edgeY ? 0 : (rnd() - 0.5) * 80),
      };
    }
  }
  const cells = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const p = [pts[j][i], pts[j][i + 1], pts[j + 1][i + 1], pts[j + 1][i]];
      const cx = p.reduce((a, q) => a + q.x, 0) / 4, cy = p.reduce((a, q) => a + q.y, 0) / 4;
      cells.push({ p, cx, cy, i: cells.length });
    }
  }
  return { cells, child, seed };
}

function cellPath(ctx, cell, inset = 0) {
  ctx.beginPath();
  cell.p.forEach((q, k) => {
    const x = q.x + (cell.cx - q.x) * inset, y = q.y + (cell.cy - q.y) * inset;
    if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y);
  });
  ctx.closePath();
}

/** The frame-shaped box round a cell that the camera lands on. */
function boxOf(cell) {
  const xs = cell.p.map((q) => q.x), ys = cell.p.map((q) => q.y);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  let w = (x1 - x0) * 0.86, h = (y1 - y0) * 0.86;
  if (w / h > W / H) h = (w * H) / W; else w = (h * W) / H;
  return { x: (x0 + x1) / 2 - w / 2, y: (y0 + y1) / 2 - h / 2, w, h, S: W / w };
}

/** One map level. o.huts: huts per cell; o.lit: draw the child cell's rim. */
function paintMap(ctx, c, level, o = {}) {
  const P = pal(c);
  const rnd = mulberry32(level.seed + 5);
  ctx.fillStyle = P.grass; ctx.fillRect(-80, -80, W + 160, H + 160);
  const tints = [P.grass, mix(P.sand, P.grass, 0.4), mix(P.earth, P.grass, 0.5), P.sand, mix(P.leaf, P.grass, 0.55)];
  for (const cell of level.cells) {
    cellPath(ctx, cell, 0.035);
    ctx.fillStyle = tints[(cell.i * 3 + (level.seed % 5)) % tints.length]; ctx.fill();
    ctx.strokeStyle = alpha(P.earthDark, 0.55); ctx.lineWidth = 3; ctx.setLineDash([12, 9]); ctx.stroke(); ctx.setLineDash([]);
  }
  // one river across every level, so the land reads as land and not as a table
  ctx.strokeStyle = P.water; ctx.lineWidth = 12; ctx.lineCap = 'round';
  const ry = 120 + rnd() * 240;
  ctx.beginPath(); ctx.moveTo(-70, ry); ctx.bezierCurveTo(180, ry - 90, 420, ry + 110, W + 70, ry - 20); ctx.stroke();
  ctx.strokeStyle = alpha(lighten(P.water, 0.4), 0.7); ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-70, ry - 2); ctx.bezierCurveTo(180, ry - 92, 420, ry + 108, W + 70, ry - 22); ctx.stroke();
  ctx.lineCap = 'butt';
  const list = [];
  for (const cell of level.cells) {
    const n = o.huts ?? 0;
    for (let k = 0; k < n; k++) list.push({ x: cell.cx + (rnd() - 0.5) * 130, y: cell.cy + (rnd() - 0.5) * 90, t: 'h', s: o.hutScale ?? 0.55 });
    for (let k = 0; k < (o.trees ?? 2); k++) list.push({ x: cell.cx + (rnd() - 0.5) * 210, y: cell.cy + (rnd() - 0.5) * 150, t: 't', s: 0.5 + rnd() * 0.25, seed: k + cell.i });
  }
  list.sort((a, b) => a.y - b.y);
  for (const it of list) { if (it.t === 'h') hut(ctx, c, it.x, it.y, it.s); else tree(ctx, c, it.x, it.y, it.s, it.seed); }
  if (o.lit !== false && level.child != null) {
    const cell = level.cells[level.child];
    cellPath(ctx, cell, 0.035);
    ctx.strokeStyle = c.accent; ctx.lineWidth = 7; ctx.stroke();
  }
}

/** The village up close: tank, garden, shrine, huts, and room for an assembly under the tree. */
export function paintVillage(ctx, c, o = {}) {
  const P = pal(c), lit = o.lit ?? [];
  const off = (k) => (lit.length && !lit.includes(k) ? 0.3 : 1);
  ctx.fillStyle = P.grass; ctx.fillRect(-80, -80, W + 160, H + 160);
  ctx.fillStyle = mix(P.sand, P.grass, 0.35);
  ctx.beginPath(); ctx.moveTo(-80, 330); ctx.bezierCurveTo(200, 270, 480, 380, W + 80, 300); ctx.lineTo(W + 80, H + 80); ctx.lineTo(-80, H + 80); ctx.fill();
  // the tank
  ctx.save(); ctx.globalAlpha *= off('tank');
  ctx.fillStyle = P.sandDark; ctx.beginPath(); ctx.ellipse(160, 250, 150, 74, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = mix(P.sand, P.sandDark, 0.4); ctx.beginPath(); ctx.ellipse(160, 246, 140, 66, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = P.water; ctx.beginPath(); ctx.ellipse(160, 248, 118, 52, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = alpha(lighten(P.water, 0.5), 0.8); ctx.lineWidth = 3;
  for (const [x, y, r] of [[120, 236, 30], [192, 256, 38]]) { ctx.beginPath(); ctx.ellipse(x, y, r, 5, 0, 0, Math.PI * 2); ctx.stroke(); }
  ctx.restore();
  // the shrine
  ctx.save(); ctx.globalAlpha *= off('temple');
  const sx = 570, sy = 250;
  const st = mix(P.sand, P.sandDark, 0.45), st2 = mix(P.sand, P.sandDark, 0.2);
  ctx.fillStyle = P.sandDark; rr(ctx, sx - 60, sy - 10, 120, 16, 4); ctx.fill();
  ctx.fillStyle = st; rr(ctx, sx - 44, sy - 70, 88, 62, 4); ctx.fill();
  for (let i = 0; i < 3; i++) { ctx.fillStyle = i % 2 ? st2 : st; rr(ctx, sx - 40 + i * 12, sy - 94 - i * 20, 80 - i * 24, 24, 4); ctx.fill(); }
  ctx.fillStyle = darken(P.sandDark, 0.4); rr(ctx, sx - 16, sy - 54, 32, 46, 10); ctx.fill();
  ctx.restore();
  // the garden
  ctx.save(); ctx.globalAlpha *= off('garden');
  ctx.fillStyle = mix(P.leaf, P.grass, 0.45); rr(ctx, 318, 150, 170, 84, 12); ctx.fill();
  for (let i = 0; i < 4; i++) tree(ctx, c, 342 + i * 42, 214 + (i % 2) * 12, 0.42, i + 3);
  ctx.restore();
  ctx.save(); ctx.globalAlpha *= lit.length ? 0.4 : 1;
  for (const [x, y, s] of [[58, 150, 0.8], [186, 138, 0.7], [640, 134, 0.7], [470, 120, 0.65], [310, 126, 0.6]]) hut(ctx, c, x, y, s);
  ctx.restore();
}

/** Paint level v. levels: [{ level, huts, trees, hutScale }, ..., { village: true }]. */
export function paintNest(ctx, c, levels, v, o = {}) {
  const last = levels.length - 1;
  const k = Math.max(0, Math.min(last, Math.floor(v + 1e-6))), f = Math.max(0, Math.min(1, v - k));
  const paint = (i, lit) => {
    const L = levels[i];
    if (L.village) paintVillage(ctx, c, { lit: o.villageLit });
    else paintMap(ctx, c, L.level, { ...L, lit });
  };
  ctx.save();
  if (k < last && f > 0.001) {
    const cell = levels[k].level.cells[levels[k].level.child];
    const b = boxOf(cell), s = b.S ** f, u = (s - 1) / (b.S - 1);
    ctx.translate(-b.x * b.S * u, -b.y * b.S * u); ctx.scale(s, s);
    paint(k, false);
    ctx.save();
    ctx.globalAlpha *= seg(f, 0.2, 0.7);
    ctx.translate(b.x, b.y); ctx.scale(1 / b.S, 1 / b.S);
    ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
    paint(k + 1, false);
    ctx.restore();
  } else paint(k, o.rim !== false);
  ctx.restore();
  drawVignette(ctx, c, 0.3);
}
