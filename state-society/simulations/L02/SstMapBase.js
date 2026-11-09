// SstMapBase.js - the shared subcontinent base map for the state-society L02 (and any
// later) scene: real SimGeo geometry, a fitted mercator view, the relief + rivers +
// coastline base the chapter's own figures use, and the data tables those scenes place
// on it. Shared behaviour lives in functions, not a base class - each scene extends
// SimScene itself.
//
// India's modern border is never drawn: the chapter's map convention (Fig. 5.3, Fig. 5.4)
// is relief shading, major rivers and a coastal outline only, so nothing here loads the
// 'india' layer and no scene using this helper can accidentally pick up a de facto border.
import { loadMap, makeView, drawLand, reliefImage, drawRivers } from 'simulations/base/kit/GeoMap.js';
import { alpha, mix, lighten, darken, mulberry32, inkOn } from 'simulations/base/kit/SimLook.js';

// The subcontinent window every map in the chapter uses: 10 N - 35 N, 65 E - 95 E.
export const SST_EXTENT = [[65, 10], [95, 35]];

// Nine rivers come from the vendored rivers layer. Two more are typed below.
export const SST_LAYER_RIVERS = ['Indus', 'Chenab', 'Sutlej', 'Ganges', 'Yamuna', 'Narmada', 'Brahmaputra', 'Godavari', 'Krishna'];

const line = (name, coords) => ({ type: 'Feature', properties: { name }, geometry: { type: 'LineString', coordinates: coords } });

// Only two hand-typed courses remain, source to sea (2026-10-31): the other ten ran the wrong way
// across the Deccan and came off the map.
export const SST_EXTRA_RIVERS = [
  line('Kaveri', [[75.5, 12.4], [76.6, 12.4], [77.3, 12.3], [77.8, 12.1], [77.8, 11.8], [77.7, 11.35], [78.7, 10.85], [79.2, 10.95], [79.8, 11.1]]),
  line('Mahanadi', [[82.0, 21.0], [82.9, 21.6], [83.9, 21.45], [84.6, 20.9], [85.9, 20.45], [86.7, 20.3]]),
];

// Label anchors, in the order they should win a crowded panel: the Ganga plain rivers
// first (they are the ones the wares and the settlement dots are read against), then the
// rest. A panel too small for all 19 drops the tail rather than overprinting - the caller
// de-collides by measured box, so the survivors are always the ones it could fit.
export const SST_RIVER_LABELS = [
  { name: 'Ganga', at: [83.5, 25.0] },
  { name: 'Yamuna', at: [79.0, 27.0] },
  { name: 'Indus', at: [70.5, 28.5] },
  { name: 'Brahmaputra', at: [91.5, 27.0] },
  { name: 'Godavari', at: [79.5, 17.5] },
  { name: 'Krishna', at: [79.0, 16.5] },
  { name: 'Narmada', at: [74.0, 22.5] },
  { name: 'Chenab', at: [74.5, 30.5] },
  { name: 'Sutlej', at: [73.0, 30.0] },
  { name: 'Mahanadi', at: [84.5, 20.4] },
  { name: 'Kaveri', at: [78.2, 11.3] },
];

export const SST_SITES = {
  // 'tag' marks the eight the slide names: those are the tappable, full-size pins.
  // The rest are the figure legend's remaining sites, placed at the region each legend
  // entry names, drawn small and untappable so the layer reads as a distribution.
  iron: [
    { name: 'Pirak', at: [68.9, 29.0], region: 'Balochistan', tag: true },
    { name: 'Jakhera', at: [79.0, 26.8], region: 'Ganga doab' },
    { name: 'Dadupur', at: [81.2, 25.7], region: 'Ganga, east' },
    { name: 'Ahar', at: [75.8, 25.8], region: 'Banas valley', tag: true },
    { name: 'Nagda', at: [74.6, 24.1], region: 'Chambal valley' },
    { name: 'Lahuradeva', at: [83.4, 24.5], region: 'eastern UP' },
    { name: 'Malhar', at: [82.9, 25.1], region: 'eastern UP' },
    { name: 'Raja-Nal-Ka-Tila', at: [82.2, 25.7], region: 'Belan valley' },
    { name: 'Naikund', at: [78.6, 20.9], region: 'Vidarbha' },
    { name: 'Mahurjhari', at: [78.5, 20.6], region: 'Vidarbha' },
    { name: 'Maski', at: [75.7, 15.9], region: 'Raichur doab', tag: true },
    { name: 'Watgal', at: [75.2, 16.0], region: 'Raichur doab' },
    { name: 'Hallur', at: [76.1, 15.6], region: 'Tungabhadra', tag: true },
  ],
  megalith: [
    { name: 'Burzahom', at: [74.95, 34.05], region: 'Kashmir valley', tag: true },
    { name: 'Gandhara Caves', at: [72.7, 34.0], region: 'north-west' },
    { name: 'Deodhoora', at: [76.3, 32.0], region: 'Himalayan foothills' },
    { name: 'Nartiang', at: [91.9, 25.75], region: 'Meghalaya', tag: true },
    { name: 'Nangbah', at: [91.75, 25.35], region: 'Meghalaya', tag: true },
    { name: 'Birbir', at: [85.6, 22.6], region: 'Chota Nagpur' },
    { name: 'Chaibasa', at: [85.8, 22.6], region: 'Chota Nagpur' },
    { name: 'Kadambapur', at: [79.0, 17.9], region: 'Godavari basin' },
    { name: 'Nagarjunakonda', at: [80.8, 16.5], region: 'Krishna valley' },
    { name: 'Brahmagiri', at: [76.5, 12.4], region: 'Karnataka' },
    { name: 'Hire Benakal', at: [77.3, 14.8], region: 'Karnataka' },
    { name: 'Hallur', at: [76.1, 15.6], region: 'Tungabhadra' },
    { name: 'Pudukkottai', at: [78.8, 10.4], region: 'Tamil Nadu' },
    { name: 'Marayur', at: [76.75, 10.55], region: 'Kerala' },
    { name: 'Mangadu', at: [76.4, 10.0], region: 'Kerala' },
    { name: 'Adichanallur', at: [77.55, 8.95], region: 'Tamraparni', tag: true },
  ],
};

// The two ceramic-ware fields, schematic: PGW over the upper Ganga region, NBPW over the
// middle Ganga region, from present-day Prayagraj to eastern Bihar.
export const SST_WARES = {
  pgw: { name: 'PGW', at: [[74.8, 30.4], [77.4, 30.2], [79.8, 29.2], [81.8, 27.8], [82.6, 26.4], [81.0, 25.4], [79.0, 25.8], [76.8, 26.6], [75.2, 28.0]] },
  nbpw: { name: 'NBPW', at: [[80.4, 26.5], [83.0, 26.5], [85.8, 26.4], [87.8, 25.8], [87.0, 24.4], [84.8, 24.2], [82.6, 24.9], [80.9, 25.2], [80.3, 25.8]] },
};

/** Two eras of settlement dots, schematic. `2nd` scatters thinly over the whole window;
 *  `1st` piles 96 of 104 dots into the middle Ganga-Yamuna plain band. Deterministic. */
export function sstSettlements() {
  const early = [];
  const r1 = mulberry32(2);
  for (let i = 0; i < 26; i++) early.push({ at: [65.8 + r1() * 28.4, 10.8 + r1() * 23.4], r: 1.1 + r1() * 0.9 });
  const late = [];
  const r2 = mulberry32(1);
  for (let i = 0; i < 96; i++) late.push({ at: [77.6 + r2() * 9.2, 23.2 + r2() * 6.6], r: 1.1 + r2() * 0.9 });
  for (let i = 0; i < 8; i++) late.push({ at: [66.5 + r2() * 26, 11.5 + r2() * 20], r: 1.1 + r2() * 0.9 });
  return { early, late };
}

export async function loadSstMap() { return loadMap(['land', 'rivers', 'elevation']); }

/** A fitted mercator view of the subcontinent window inside `box` (design px). */
export async function makeSstView(ctx, box, extent = SST_EXTENT) {
  return makeView(withTransform(ctx), { kind: 'mercator', extent, box });
}

/** The whole stage as the map box: a map scene needs no legend column. */
export const SST_FULL = { x: 6, y: 6, w: 668, h: 508 };

/** Call in setup() after super.setup(): sets scene.view for the full-stage box. */
export async function sstFullView(scene, extent, box = SST_FULL) {
  scene.view = await makeSstView(scene._ctx, box, extent);
}

/** The base map, relief built once per theme. Scene loads scene.map before super.setup(). */
export function drawSstFull(ctx, c, scene) {
  if (!scene.view || !scene.map) return false;
  if (scene._reliefFor !== c) { scene._reliefFor = c; scene._relief = reliefImage(scene.view, c, scene.map, { step: 2 }); }
  drawSstBase(ctx, scene.view, c, scene.map, { relief: scene._relief });
  return true;
}

/** The sixteen mahajanapadas, in the numbering of Fig. 5.4. */
export const SST_JANAPADAS = [
  { n: 1, name: 'Kamboja', at: [71.0, 34.6], zone: 'nw' },
  { n: 2, name: 'Gandh\u0101ra', at: [72.8, 33.4], zone: 'nw' },
  { n: 3, name: 'Matsya', at: [76.2, 27.0], zone: 'nw' },
  { n: 4, name: 'Kuru', at: [77.0, 29.5], zone: 'ganga' },
  { n: 5, name: '\u015Ah\u016Brasena', at: [77.7, 27.5], zone: 'ganga' },
  { n: 6, name: 'Pa\u00F1ch\u0101la', at: [79.5, 28.3], zone: 'ganga' },
  { n: 7, name: 'Vatsa', at: [81.2, 25.4], zone: 'ganga' },
  { n: 8, name: 'Kosala', at: [82.2, 27.0], zone: 'ganga' },
  { n: 9, name: 'K\u0101\u015Bh\u012B', at: [83.2, 25.3], zone: 'ganga' },
  { n: 10, name: 'Malla', at: [84.0, 27.2], zone: 'ganga' },
  { n: 11, name: 'V\u1E5Bijji', at: [85.6, 26.5], zone: 'ganga' },
  { n: 12, name: 'Magadha', at: [85.4, 24.9], zone: 'ganga' },
  { n: 13, name: 'Anga', at: [87.2, 25.2], zone: 'ganga' },
  { n: 14, name: 'Chedi', at: [79.8, 24.2], zone: 'south' },
  { n: 15, name: 'Avanti', at: [75.8, 23.2], zone: 'south' },
  { n: 16, name: 'A\u015Bhmaka', at: [77.9, 18.7], zone: 'south' },
];

/** A numbered badge. o: { r, lit, off, col }. */
export function sstBadge(ctx, c, x, y, n, o = {}) {
  const r = o.r ?? 16, col = o.col ?? c.bad;
  ctx.save();
  if (o.off) ctx.globalAlpha = 0.35;
  ctx.beginPath(); ctx.arc(x, y + 2, r, 0, Math.PI * 2); ctx.fillStyle = darken(col, 0.35); ctx.fill();
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
  ctx.lineWidth = o.lit ? 4 : 2; ctx.strokeStyle = o.lit ? c.label : c.bgSurface; ctx.stroke();
  ctx.font = `800 ${Math.round(r * 1.32)}px ${c.fontDisplay}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (!o.off || r >= 21) { ctx.fillStyle = inkOn(c, col); ctx.fillText(String(n), x, y + 1); }   // a small dimmed badge is a dot, not a label
  ctx.restore();
}

// GeoMap asks the context for its current scale (`ctx.getTransform().a`) to convert design
// px into backing-store px. A real canvas answers; the headless test host answers every
// unknown method with a no-op that returns undefined, and the kit's `|| 1` fallback is
// downstream of the property read, so it throws. Supply an identity transform there and
// change nothing in a real browser, where the original context is returned untouched.
function withTransform(ctx) {
  try { if (ctx.getTransform?.()) return ctx; } catch { /* fall through to the shim */ }
  const ident = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
  return new Proxy(ctx, { get: (t, p) => (p === 'getTransform' ? () => ident : t[p]) });
}

/** Sea, elevation-shaded land, the coastline stroke and both river sets. `relief` may be a
 *  prebuilt reliefImage; pass one from layerCache so the shading is painted once.
 *
 *  The elevation ramp is deliberately knocked back: GeoLook's elevColor is a full-saturation
 *  hypsometric ramp, which at this size shouts louder than the data layers the scene is
 *  about. So the relief is washed toward the surface colour and the land is re-tinted
 *  toward elevLow - the highlands and the Ganga plain stay distinguishable (that is the
 *  only job the shading has here) and nothing competes with a marker or a ware field. */
export function drawSstBase(ctx, v, c, m, o = {}) {
  // The base never changes between frames, so it is painted once per view, palette, scale and
  // relief image into an offscreen layer and blitted after that. A host with no canvas (the
  // headless test host) paints it directly every time.
  const b = v.box;
  let sc = 1;
  try { sc = ctx.getTransform?.().a || 1; } catch { /* no transform: 1 */ }
  const key = [sc, b.x, b.y, b.w, b.h, c.seaDeep, c.seaShallow, c.elevLow, c.elevMid, c.bgSurface, o.hideRivers ? 1 : 0].join('|');
  let hit = BASE_CACHE.get(v);
  if (!hit || hit.key !== key || hit.relief !== o.relief) {
    hit = null;
    try {
      const cv = document.createElement('canvas');
      cv.width = Math.ceil(b.w * sc); cv.height = Math.ceil(b.h * sc);
      const cx = cv.getContext('2d');
      if (cx && typeof cx.setTransform === 'function') {
        cx.setTransform(sc, 0, 0, sc, -b.x * sc, -b.y * sc);
        paintSstBase(cx, v, c, m, o);
        hit = { key, relief: o.relief, cv };
        BASE_CACHE.set(v, hit);
      }
    } catch { hit = null; }
  }
  if (!hit) { paintSstBase(ctx, v, c, m, o); return; }
  ctx.drawImage(hit.cv, b.x, b.y, b.w, b.h);
}

const BASE_CACHE = new WeakMap();

function paintSstBase(ctx, v, c, m, o = {}) {
  const b = v.box;
  ctx.save();
  ctx.beginPath();
  ctx.rect(b.x, b.y, b.w, b.h);
  ctx.clip();
  ctx.fillStyle = c.seaDeep;
  ctx.fillRect(b.x, b.y, b.w, b.h);
  if (o.relief) ctx.drawImage(o.relief, b.x, b.y, b.w, b.h);
  else drawLand(ctx, v, c, m.land, { relief: reliefImage(v, c, m, { step: 2 }) });
  ctx.fillStyle = alpha(c.bgSurface, 0.5);
  ctx.fillRect(b.x, b.y, b.w, b.h);
  // Sea back: the box rect and the land path under one even-odd fill leaves the ocean.
  ctx.beginPath();
  ctx.rect(b.x, b.y, b.w, b.h);
  v.path.context(ctx)(m.land);
  ctx.fillStyle = c.seaDeep;
  ctx.fill('evenodd');
  ctx.save();
  ctx.beginPath();
  v.path.context(ctx)(m.land);
  ctx.clip();
  ctx.fillStyle = alpha(c.elevLow, 0.35);
  ctx.fillRect(b.x, b.y, b.w, b.h);
  ctx.restore();
  const land = () => { ctx.beginPath(); v.path.context(ctx)(m.land); };
  // Painted-map finish (2026-10-27 look lift): a sea that pales toward the coast, a soft
  // shallow-water halo off the shore, a light beach rim inside it, an inked double coast,
  // two-pass rivers and a key light from the top left. Geometry and data are unchanged.
  const sg = ctx.createLinearGradient(b.x, b.y, b.x + b.w * 0.4, b.y + b.h);
  sg.addColorStop(0, alpha(lighten(c.seaDeep, 0.12), 0.6));
  sg.addColorStop(1, alpha(darken(c.seaDeep, 0.15), 0.6));
  ctx.save();
  ctx.beginPath();
  ctx.rect(b.x, b.y, b.w, b.h);
  v.path.context(ctx)(m.land);
  ctx.clip('evenodd');
  ctx.fillStyle = sg;
  ctx.fillRect(b.x, b.y, b.w, b.h);
  ctx.lineJoin = 'round';
  for (const [lw, a] of [[22, 0.1], [13, 0.14], [6, 0.2]]) {
    land();
    ctx.strokeStyle = alpha(c.seaShallow, a);
    ctx.lineWidth = lw;
    ctx.stroke();
  }
  ctx.restore();
  ctx.save();
  land();
  ctx.clip();
  land();
  ctx.strokeStyle = alpha(lighten(c.elevLow, 0.45), 0.35);
  ctx.lineWidth = 5;
  ctx.stroke();
  const rnd = mulberry32(4093);                 // paper speckle on the land, fixed seed
  ctx.fillStyle = alpha(darken(c.elevLow, 0.4), 0.08);
  for (let i = 0; i < 420; i++) ctx.fillRect(b.x + rnd() * b.w, b.y + rnd() * b.h, 1.4, 1.4);
  ctx.restore();
  land();
  ctx.strokeStyle = alpha(darken(c.elevMid, 0.35), 0.55);
  ctx.lineWidth = 2.2;
  ctx.stroke();
  land();
  ctx.strokeStyle = alpha(c.elevMid, 0.9);
  ctx.lineWidth = 0.9;
  ctx.stroke();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const riverUnder = alpha(darken(c.seaShallow, 0.35), 0.45);
  drawRivers(ctx, v, c, m.rivers, { names: SST_LAYER_RIVERS, color: riverUnder, width: 2.6 });
  ctx.strokeStyle = riverUnder;
  ctx.lineWidth = 2.3;
  for (const f of SST_EXTRA_RIVERS) { ctx.beginPath(); v.path.context(ctx)(f); ctx.stroke(); }
  drawRivers(ctx, v, c, m.rivers, { names: SST_LAYER_RIVERS, color: alpha(lighten(c.seaShallow, 0.15), 0.95), width: 1.3 });
  ctx.strokeStyle = alpha(lighten(c.seaShallow, 0.1), 0.85);
  ctx.lineWidth = 1.1;
  for (const f of SST_EXTRA_RIVERS) {
    ctx.beginPath();
    v.path.context(ctx)(f);
    ctx.stroke();
  }
  const kl = ctx.createRadialGradient(b.x + b.w * 0.2, b.y + b.h * 0.12, 0, b.x + b.w * 0.2, b.y + b.h * 0.12, Math.hypot(b.w, b.h));
  kl.addColorStop(0, alpha(lighten(c.bgSurface, 0.5), 0.14));
  kl.addColorStop(0.55, alpha(c.bgSurface, 0));
  kl.addColorStop(1, alpha(darken(c.seaDeep, 0.5), 0.16));
  ctx.fillStyle = kl;
  ctx.fillRect(b.x, b.y, b.w, b.h);
  ctx.strokeStyle = alpha(darken(c.elevMid, 0.3), 0.5);   // the neat line inside the frame
  ctx.lineWidth = 1;
  ctx.strokeRect(b.x + 4.5, b.y + 4.5, b.w - 9, b.h - 9);
  ctx.restore();
}

/** River names, placed in priority order at their anchors and then de-collided by
 *  measured box: a label whose box comes near one already placed is dropped, so a small
 *  panel shows fewer names rather than a pile of overlapping text. `o.limit` caps how many
 *  are drawn at all. Returns the labels actually drawn. */
export function drawSstRiverLabels(ctx, v, c, o = {}) {
  const size = o.size ?? 10;
  const limit = o.limit ?? SST_RIVER_LABELS.length;
  const gapX = o.gapX ?? 8, gapY = o.gapY ?? 4;
  ctx.save();
  ctx.font = `600 ${size}px ${c.fontBody}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const placed = [];
  const kept = [];
  for (const lab of SST_RIVER_LABELS) {
    if (kept.length >= limit) break;
    const p = v.at(lab.at);
    if (!p) continue;
    const w = ctx.measureText(lab.name).width + 6;
    const box = { x0: p[0] - w / 2, x1: p[0] + w / 2, y0: p[1] - size * 0.7, y1: p[1] + size * 0.7 };
    if (box.x0 < v.box.x + 2 || box.x1 > v.box.x + v.box.w - 2) continue;
    if (box.y0 < v.box.y + 2 || box.y1 > v.box.y + v.box.h - 2) continue;
    if (placed.some((q) => box.x0 < q.x1 + gapX && box.x1 + gapX > q.x0 && box.y0 < q.y1 + gapY && box.y1 + gapY > q.y0)) continue;
    placed.push(box);
    kept.push(lab.name);
    ctx.lineWidth = 3;
    ctx.strokeStyle = alpha(c.bgDeep, 0.8);
    ctx.strokeText(lab.name, p[0], p[1]);
    ctx.fillStyle = alpha(c.label, 0.9);
    ctx.fillText(lab.name, p[0], p[1]);
  }
  ctx.restore();
  return kept;
}

/** Kilometres per design pixel at the panel's mid-latitude, from the view's own scale. */
export function sstKmPerPx(v) {
  const a = v.at([65, 22.5]);
  const b = v.at([95, 22.5]);
  if (!a || !b) return 0;
  const km = 111.32 * 30 * Math.cos((22.5 * Math.PI) / 180);
  return km / Math.max(1, Math.hypot(b[0] - a[0], b[1] - a[1]));
}

/** The figure's scale bar, 250 0 250 500 km, at the panel's bottom-right. The middle
 *  numeral is dropped on a small panel, where it would collide with '500 km'. */
export function drawSstScaleBar(ctx, c, v, o = {}) {
  const k = sstKmPerPx(v);
  if (!(k > 0)) return '';
  const full = 500 / k;
  if (!(full > 6)) return '';
  const roomy = full >= 78;
  const x0 = o.x ?? (v.box.x + v.box.w - 14 - full);
  const y = o.y ?? (v.box.y + v.box.h - 12);
  ctx.save();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = alpha(c.label, 0.75);
  for (let i = 0; i <= 2; i++) {
    const x = x0 + (i * full) / 2;
    ctx.beginPath();
    ctx.moveTo(x, y - 4);
    ctx.lineTo(x, y + 2);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(x0, y - 2);
  ctx.lineTo(x0 + full, y - 2);
  ctx.stroke();
  ctx.fillStyle = alpha(c.label, 0.85);
  for (let i = 0; i < 2; i++) ctx.fillRect(x0 + (i * full) / 2, y - 2, full / 4, 2);
  ctx.font = `600 9px ${c.fontBody}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText('0', x0, y - 5);
  if (roomy) ctx.fillText('250', x0 + full / 2, y - 5);
  ctx.fillText('500 km', x0 + full, y - 5);
  ctx.restore();
  return roomy ? '0 250 500 km' : '0 500 km';
}

/** North compass rose for a panel's top-left corner. */
export function sstCompass(ctx, c, x, y, r = 9) {
  ctx.save();
  ctx.strokeStyle = alpha(c.label, 0.35);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, r + 3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y + r);
  ctx.lineTo(x, y - r);
  ctx.strokeStyle = alpha(c.label, 0.85);
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y - r - 1);
  ctx.lineTo(x - 3.4, y + 3);
  ctx.lineTo(x + 3.4, y + 3);
  ctx.closePath();
  ctx.fillStyle = c.accent;
  ctx.fill();
  ctx.font = `700 9px ${c.fontBody}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = alpha(c.label, 0.9);
  ctx.fillText('N', x, y - r - 3);
  ctx.restore();
}

/** A filled ware field over the map. `ring` is SST_WARES[key].at in lon/lat. */
export function drawSstWare(ctx, v, c, ring, col, k = 1) {
  const pts = ring.map((ll) => v.at(ll)).filter(Boolean);
  if (pts.length < 3) return;
  ctx.save();
  ctx.globalAlpha = k;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fillStyle = col;
  ctx.fill();
  ctx.strokeStyle = alpha(c.label, 0.5 * k);
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.restore();
}

/** A site pin: a black solid circle for an early iron find, a red triangle for a
 *  megalithic site, so the two layers are told apart by shape as well as by colour.
 *  The stroke is the surface token, not a dark one, so a pin separates from the relief in
 *  both themes - the map behind it is mid-tone green in each. */
export function sstSitePin(ctx, c, x, y, kind, r = 4.6) {
  ctx.save();
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = c.bgSurface;
  if (kind === 'iron') {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = mix(c.label, c.bgDeep, 0.15);
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(x, y - r * 1.15);
    ctx.lineTo(x + r, y + r * 0.8);
    ctx.lineTo(x - r, y + r * 0.8);
    ctx.closePath();
    ctx.fillStyle = c.bad;
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}
