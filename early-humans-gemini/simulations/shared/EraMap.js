// EraMap.js - the shared ancient-world base map for this course. Canvas scenes (SimScene) only.
// Land, relief, rivers and sites: no country lines, ever. India's outline comes only from the
// Survey of India layer, with the credit chip. Never call SimGeo.loadWorld('countries').
//
//   import { loadEraMap, eraView, drawEraBase, eraCredit, ERA_EXTENT, ERA_RIVERS, ... } from '../shared/EraMap.js';
//   static COLOR_MAP = GEO_COLOR_MAP;                      // from kit/GeoLook.js: the map needs its tokens
//   async setup() { this.map = await loadEraMap(); await super.setup(); await eraView(this, ERA_EXTENT.india); this.animateFor?.(300); }
//   draw(ctx, c) {
//     if (!drawEraBase(ctx, c, this, { rivers: ERA_RIVERS.india })) return;   // false until the view is ready
//     const [x, y] = this.view.at([80.0, 13.2]); eraPin(ctx, c, x, y, 'tri', { col: c.s2 }); eraLabel(ctx, c, 'Attirampakkam', x, y - 30);
//     eraRoute(ctx, c, this.view, [[35, 0], [38, 22], [45, 30]], 0.6, { col: c.s1 });  // k 0..1 draws it on
//     eraCredit(ctx, c, this.view);                        // last, whenever India is on the map
//   }
// Stable API: batches B to E import it. ASCII only.
import { loadMap, makeView, reliefImage, drawRivers, drawIndia, CREDIT_INDIA } from 'simulations/base/kit/GeoMap.js';
import { alpha, darken, lighten, mix, inkOn, pill, rr, font, mulberry32 } from 'simulations/base/kit/SimLook.js';

export const ERA_FULL = { x: 6, y: 6, w: 668, h: 508 };

/** Fitted windows, [[west, south], [east, north]]. */
export const ERA_EXTENT = {
  oldWorld: [[-22, -40], [158, 62]],    // Africa to Australia, for the routes out of Africa and world-wide farming
  india: [[62, 5], [98, 37]],           // the subcontinent with Sri Lanka
  westAsia: [[26, 22], [60, 41]],       // Nile mouth to the Gulf
  nile: [[24, 21], [40, 33]],
  china: [[98, 22], [126, 44]],
  fourRivers: [[20, 8], [130, 48]],     // the Nile to the Huang He
};

/** Names in the rivers layer. Join what you need: [...ERA_RIVERS.india, ...ERA_RIVERS.nile]. */
export const ERA_RIVERS = {
  india: ['Indus', 'Chenab', 'Sutlej', 'Ganges', 'Yamuna', 'Narmada', 'Brahmaputra', 'Godavari', 'Krishna'],
  nile: ['Nile', 'White Nile', 'Blue Nile', 'Albert Nile', 'Mountain Nile', 'Victoria Nile'],
  mesopotamia: ['Tigris', 'Dicle', 'Euphrates', 'Firat', 'Al Furat'],
  china: ['Huang', 'Yellow', 'Yangtze'],
};

export async function loadEraMap() { return loadMap(['land', 'rivers', 'elevation', 'india']); }

/** Call in setup() after super.setup(): sets scene.view. o: { kind, pad }. */
export async function eraView(scene, extent = ERA_EXTENT.oldWorld, box = ERA_FULL, o = {}) {
  scene.view = await makeView(scene._ctx, { kind: o.kind ?? 'mercator', extent, box, pad: o.pad ?? 0 });
  return scene.view;
}

const CACHE = new WeakMap();
const LAND = new WeakMap();

function paintBase(g, v, c, m, o, relief) {
  const b = v.box, path = v.path.context(g);
  const land = () => { g.beginPath(); path(m.land); };
  g.save();
  rr(g, b.x, b.y, b.w, b.h, 16); g.clip();
  g.fillStyle = c.seaDeep; g.fillRect(b.x, b.y, b.w, b.h);
  // Sea pales toward the shore; land is relief washed back so the sites and rivers lead.
  const sg = g.createLinearGradient(b.x, b.y, b.x + b.w * 0.4, b.y + b.h);
  sg.addColorStop(0, alpha(lighten(c.seaDeep, 0.14), 0.7)); sg.addColorStop(1, alpha(darken(c.seaDeep, 0.15), 0.7));
  g.fillStyle = sg; g.fillRect(b.x, b.y, b.w, b.h);
  g.lineJoin = 'round';
  for (const [lw, a] of [[22, 0.1], [13, 0.14], [6, 0.2]]) { land(); g.strokeStyle = alpha(c.seaShallow, a); g.lineWidth = lw; g.stroke(); }
  g.save(); land(); g.clip();
  if (relief) g.drawImage(relief, b.x, b.y, b.w, b.h);
  g.fillStyle = alpha(c.bgSurface, 0.46); g.fillRect(b.x, b.y, b.w, b.h);
  g.fillStyle = alpha(c.elevLow, 0.26); g.fillRect(b.x, b.y, b.w, b.h);
  land(); g.strokeStyle = alpha(lighten(c.elevLow, 0.45), 0.35); g.lineWidth = 5; g.stroke();
  const rnd = mulberry32(4093);
  g.fillStyle = alpha(darken(c.elevLow, 0.4), 0.08);
  for (let i = 0; i < 420; i++) g.fillRect(b.x + rnd() * b.w, b.y + rnd() * b.h, 1.4, 1.4);
  g.restore();
  land(); g.strokeStyle = alpha(darken(c.elevMid, 0.35), 0.6); g.lineWidth = 2.2; g.stroke();
  if (o.india !== false && m.india) drawIndia(g, v, c, m.india, { credit: false, stroke: alpha(c.label, 0.5), lineWidth: 1.4 });
  if (o.rivers?.length) {
    const w = o.riverWidth ?? 2;
    drawRivers(g, v, c, m.rivers, { names: o.rivers, color: alpha(darken(c.seaShallow, 0.35), 0.5), width: w + 1.6 });
    drawRivers(g, v, c, m.rivers, { names: o.rivers, color: alpha(lighten(c.seaShallow, 0.15), 0.95), width: w });
  }
  const kl = g.createRadialGradient(b.x + b.w * 0.2, b.y + b.h * 0.12, 0, b.x + b.w * 0.2, b.y + b.h * 0.12, Math.hypot(b.w, b.h));
  kl.addColorStop(0, alpha(lighten(c.bgSurface, 0.5), 0.14)); kl.addColorStop(0.55, alpha(c.bgSurface, 0)); kl.addColorStop(1, alpha(darken(c.seaDeep, 0.5), 0.16));
  g.fillStyle = kl; g.fillRect(b.x, b.y, b.w, b.h);
  g.restore();
  rr(g, b.x + 1, b.y + 1, b.w - 2, b.h - 2, 16); g.strokeStyle = alpha(darken(c.elevMid, 0.3), 0.6); g.lineWidth = 3; g.stroke();
}

/** Sea, relief, coast, India outline, rivers; painted once per theme and blitted. o: { rivers, india: false, riverWidth }. Returns false until ready. */
export function drawEraBase(ctx, c, scene, o = {}) {
  const v = scene.view, m = scene.map;
  if (!v || !m) return false;
  const b = v.box;
  let sc = 1;
  try { sc = ctx.getTransform?.()?.a || 1; } catch { sc = 1; }
  const key = [sc, c.seaDeep, c.elevLow, c.bgSurface, o.india !== false, (o.rivers ?? []).join(), o.riverWidth ?? 2].join('|');
  let hit = CACHE.get(v);
  if (!hit || hit.key !== key) {
    hit = null;
    try {
      const cv = document.createElement('canvas');
      cv.width = Math.ceil(b.w * sc); cv.height = Math.ceil(b.h * sc);
      const g = cv.getContext('2d');
      if (g?.setTransform) {
        const relief = reliefImage(v, c, m, { step: 2 });
        g.setTransform(sc, 0, 0, sc, -b.x * sc, -b.y * sc);
        paintBase(g, v, c, m, o, relief);
        hit = { key, cv }; CACHE.set(v, hit);
      }
    } catch { hit = null; }
  }
  if (hit) ctx.drawImage(hit.cv, b.x, b.y, b.w, b.h);
  else { ctx.fillStyle = c.seaDeep; ctx.fillRect(b.x, b.y, b.w, b.h); }   // no canvas host (headless check): a flat sea, never a full repaint per frame
  return true;
}

/** The Survey of India credit. Draw last whenever India is on the map. */
export function eraCredit(ctx, c, v, o = {}) {
  const b = v.box;
  let x = o.x ?? b.x + b.w - 10, y = o.y ?? b.y + b.h - 20;
  // The stage scales down on a phone: size for 11.5 px on screen, on two lines so it covers less of the map.
  let k = 1;
  try { k = ctx.canvas.getBoundingClientRect().width / ctx.canvas.width * ctx.getTransform().a; } catch { k = 1; }
  const size = o.size ?? Math.max(18, Math.min(30, 11.5 / (k > 0 ? k : 1)));
  if (size <= 21) { pill(ctx, c, CREDIT_INDIA, x, y, { align: 'right', size, bg: alpha(c.bgSurface, 0.88), ink: c.label }); return; }
  x = o.twoX ?? x; y = o.twoY ?? y;   // a scene moves the two-line block off its own labels
  const lines = CREDIT_INDIA.replace(': ', ':|').split('|'), lh = size * 1.2;
  ctx.save();
  ctx.font = font(c, 700, size);
  const w = Math.max(...lines.map((t) => ctx.measureText(t).width)) + size * 0.9, h = lh * lines.length + size * 0.4;
  rr(ctx, x - w, y + 10 - h, w, h, size * 0.45); ctx.fillStyle = alpha(c.bgSurface, 0.9); ctx.fill();
  ctx.fillStyle = c.label; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  lines.forEach((t, i) => ctx.fillText(t, x - size * 0.45, y + 10 - h + size * 0.2 + lh * (i + 0.5)));
  ctx.restore();
}

/** A site pin, told apart by shape as well as colour. kind: circle tri square diamond. o: { r, col, lit, off }. */
export function eraPin(ctx, c, x, y, kind = 'circle', o = {}) {
  const r = o.r ?? 12, col = o.col ?? c.bad;
  const shape = (dy) => {
    ctx.beginPath();
    if (kind === 'tri') { ctx.moveTo(x, y + dy - r * 1.2); ctx.lineTo(x + r * 1.1, y + dy + r * 0.85); ctx.lineTo(x - r * 1.1, y + dy + r * 0.85); ctx.closePath(); }
    else if (kind === 'square') rr(ctx, x - r * 0.9, y + dy - r * 0.9, r * 1.8, r * 1.8, r * 0.25);
    else if (kind === 'diamond') { ctx.moveTo(x, y + dy - r * 1.25); ctx.lineTo(x + r * 1.25, y + dy); ctx.lineTo(x, y + dy + r * 1.25); ctx.lineTo(x - r * 1.25, y + dy); ctx.closePath(); }
    else ctx.arc(x, y + dy, r, 0, Math.PI * 2);
  };
  ctx.save();
  if (o.off) ctx.globalAlpha = 0.3;
  ctx.lineJoin = 'round';
  shape(3); ctx.fillStyle = darken(col, 0.35); ctx.fill();
  shape(0); ctx.fillStyle = col; ctx.fill();
  ctx.lineWidth = o.lit ? 4 : 2.5; ctx.strokeStyle = o.lit ? c.label : c.bgSurface; ctx.stroke();
  ctx.restore();
}

/** A big place label. Size 26 reads at phone width. o: pill options + { size, bg, ink, display }. */
export function eraLabel(ctx, c, text, x, y, o = {}) {
  const bg = o.bg ?? c.bgSurface;
  return pill(ctx, c, text, x, y, { display: true, ...o, size: o.size ?? 26, bg, ink: o.ink ?? inkOn(c, bg) });
}

/** A route through lon/lat points, smooth, drawn on by k 0..1, with an arrowhead while k > 0. o: { col, width, dash }. */
export function eraRoute(ctx, c, v, lls, k = 1, o = {}) {
  if (k <= 0) return;
  const pts = lls.map((ll) => v.at(ll)).filter(Boolean);
  if (pts.length < 2) return;
  // Flatten a Catmull-Rom curve, so length and the arrowhead come from the same points.
  const line = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let s = 0; s < 16; s++) {
      const t = s / 16, t2 = t * t, t3 = t2 * t;
      const f = (a, b, e, d) => 0.5 * (2 * b + (e - a) * t + (2 * a - 5 * b + 4 * e - d) * t2 + (3 * b - a - 3 * e + d) * t3);
      line.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  line.push(pts[pts.length - 1]);
  const n = Math.max(2, Math.ceil(line.length * Math.min(1, k)));
  const col = o.col ?? c.accent, w = o.width ?? 6;
  const trace = () => { ctx.beginPath(); for (let i = 0; i < n; i++) i ? ctx.lineTo(line[i][0], line[i][1]) : ctx.moveTo(line[i][0], line[i][1]); };
  ctx.save();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  trace(); ctx.strokeStyle = alpha(c.bgSurface, 0.9); ctx.lineWidth = w + 4; ctx.stroke();
  if (o.dash) ctx.setLineDash(o.dash);
  trace(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke();
  ctx.setLineDash([]);
  const e = line[n - 1], q = line[Math.max(0, n - 4)], a = Math.atan2(e[1] - q[1], e[0] - q[0]), h = w * 2.6;
  ctx.beginPath(); ctx.moveTo(e[0] + Math.cos(a) * h, e[1] + Math.sin(a) * h);
  ctx.lineTo(e[0] + Math.cos(a + 2.3) * h, e[1] + Math.sin(a + 2.3) * h);
  ctx.lineTo(e[0] + Math.cos(a - 2.3) * h, e[1] + Math.sin(a - 2.3) * h); ctx.closePath();
  ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = alpha(c.bgSurface, 0.9); ctx.stroke();
  ctx.restore();
}

/** A soft filled region from a lon/lat ring. k fades it in. */
export function eraRegion(ctx, c, v, ring, col, k = 1, o = {}) {
  const pts = ring.map((ll) => v.at(ll)).filter(Boolean);
  if (pts.length < 3 || k <= 0) return;
  ctx.save();
  ctx.globalAlpha = k;
  ctx.beginPath();
  pts.forEach((p, i) => { const q = pts[(i + 1) % pts.length]; const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2; if (!i) ctx.moveTo(mx, my); ctx.quadraticCurveTo(q[0], q[1], (q[0] + pts[(i + 2) % pts.length][0]) / 2, (q[1] + pts[(i + 2) % pts.length][1]) / 2); });
  ctx.closePath();
  ctx.fillStyle = alpha(col, o.fill ?? 0.42); ctx.fill();
  ctx.strokeStyle = o.rim ?? mix(col, c.label, 0.35); ctx.lineWidth = o.width ?? 3; ctx.stroke();
  ctx.restore();
}

/** Run paint() clipped to land, so a region shaded across a coast stays on the land. */
export function eraOnLand(ctx, scene, paint) {
  const v = scene.view;
  if (typeof Path2D !== 'function') { paint(); return; }   // headless check
  let land = LAND.get(v);                                  // built once: the land path is far too heavy to rebuild per frame
  if (!land) { land = new Path2D(v.d3.geoPath(v.proj)(scene.map.land)); LAND.set(v, land); }
  ctx.save(); ctx.clip(land); paint(); ctx.restore();
}

/** Text colour for a label sitting straight on a fill. */
export const eraInk = (c, bg) => inkOn(c, bg);
