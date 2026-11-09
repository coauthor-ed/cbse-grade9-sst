// PlateWorldScene - every plate on one map, tap to read it. SimScene + GeoMap, equirectangular so the
// plate areas can be flood-filled from the PB2002 boundary lines. India's outline only from the Survey of
// India layer. Mounts by beat count: 4 (plates, what they carry, the two-plate table, India) and 2 (close:
// boundary lines by kind; no quakes here, the next lesson opens on them).
import { SimScene } from 'simulations/base/kit/SimScene.js';
import {
  alpha, mix, parseColor, font, inkOn, pill, drawBackdrop, drawCard,
} from 'simulations/base/kit/SimLook.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { SimGeo } from 'simulations/base/SimGeo.js';
import {
  loadMap, drawLand, drawIndia, drawPlates, layerCache, CREDIT_INDIA,
} from 'simulations/base/kit/GeoMap.js';

// ---- the map frame -----------------------------------------------------------------------
// Cylindrical (equirectangular), the projection the source figure itself uses. Fitted so the whole
// 360 deg of longitude fills the frame and latitude -90..84 fills its height; the frame stops at 84
// because above it the vendor boundary net leaves one plate continuous over the pole.
const MAP = { x: 8, y: 6, w: 664, h: 321 };
const LAT_TOP = 84, LAT_BOTTOM = -90;

// ---- the region grid ---------------------------------------------------------------------
const GRID = 0.5;                     // deg per cell; 720 x 360 = 259200 cells
const GW = 720, GH = 360;

// The seven of the source figure, in its legend order, each with the PB2002 codes it owns.
// Okhotsk/Amur/Yangtze read as part of Eurasia, Somalia as part of Africa, Caribbean/Juan de Fuca
// as part of North America and Australia+India as one Indo-Australian plate - that is how Fig. 2.3
// is drawn, and without the merges each of the seven would carry a dark grey hole in the middle.
// `rep` is the plate whose PB2002 Euler-pole velocity stands for the group; `at` is its label point
// (North America has none in the layer - the one hand-written position in this file, a TEXT anchor).
// `off` moves the plate's NAME off the plate's own label point; `aoff` moves its arrow. Both are
// pixel nudges on top of a point the layer supplies, so a name never lands on another plate, on
// India's outline or on the Survey of India credit, and no arrow ever sits under its own name.
const GROUPS = [
  { name: 'North American', codes: ['NA', 'CA', 'JF'], rep: 'NA', tone: 'strata1', off: [10, -6], aoff: [40, 34] },
  { name: 'Eurasian', codes: ['EU', 'OK', 'AM', 'YA'], rep: 'EU', tone: 'strata6', off: [-6, -28], aoff: [0, 0] },
  { name: 'African', codes: ['AF', 'SO'], rep: 'AF', tone: 'strata2', off: [8, -16], aoff: [-4, 34] },
  { name: 'South American', codes: ['SA'], rep: 'SA', tone: 'elevLow', off: [-22, 8], aoff: [0, 26] },
  { name: 'Indo-Australian', codes: ['IN', 'AU'], rep: 'IN', tone: 'elevMid', off: [70, 64], aoff: [10, 96] },
  { name: 'Pacific', codes: ['PA'], rep: 'PA', tone: 'seaShallow', off: [4, 40], aoff: [-6, 0] },
  { name: 'Antarctic', codes: ['AN'], rep: 'AN', tone: 'strata5', off: [-58, -8], aoff: [90, -18] },
];
const G_MINOR = 7, G_NONE = 8;        // 7 = one of the small plates, 8 = a boundary cell or nothing
const NA_LABEL = [-98, 46];           // text anchor for the North American label (the layer has no point)

/** What each of the seven carries. The source's LET'S MAP table is an empty exercise, so this is
 *  the filled-in version of it: a plate's name, the continents on it and the ocean beside it. */
const CARRIED = {
  'North American': { continents: 'North America, Greenland', ocean: 'Atlantic, Arctic' },
  Eurasian: { continents: 'Europe, most of Asia', ocean: 'Atlantic, Arctic' },
  African: { continents: 'Africa', ocean: 'Atlantic, Indian' },
  'South American': { continents: 'South America', ocean: 'Atlantic, Pacific' },
  'Indo-Australian': { continents: 'India, Australia', ocean: 'Indian, Pacific' },
  Pacific: { continents: 'none', ocean: 'most of the Pacific' },
  Antarctic: { continents: 'Antarctica', ocean: 'seas round Antarctica' },
};

const ARROW_LEN = 46, ARROW_HEAD = 14;   // constant: direction only, the speed is s04's slide
const PULSE_S = 1.6;                     // India's one pulse on s03 beat 2
const CARD_S = 0.18;                     // the card's slide-in
const CARD = { x: MAP.x, y: 334, w: MAP.w, h: 142 };

const MAP_S03 = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }],
  [{ idx: 2, dwellMs: null }], [{ idx: 3, dwellMs: null }]];
const MAP_S08 = [[{ idx: 4, dwellMs: null }], [{ idx: 5, dwellMs: null }]];

const clamp01 = (t) => (t < 0 ? 0 : t > 1 ? 1 : t);
const cellX = (lon) => Math.round(((lon + 180) % 360 + 360) % 360 / GRID) % GW;
const cellY = (lat) => Math.round((90 - lat) / GRID);
const inFrame = (lat) => lat <= LAT_TOP && lat >= LAT_BOTTOM;

/**
 * The exact inverse of d3.geoEquirectangular: the projection is x = cx + k*lon, y = cy - k*lat,
 * so lon/lat is a plain linear function of the pixel. Proved against proj.invert once at build.
 */
function linearInverse(proj) {
  const o = proj([0, 0]), e = proj([180, 0]);
  const k = (e[0] - o[0]) / Math.PI;
  const cx = o[0], cy = o[1];
  const back = (px, py) => [((px - cx) / k) * 180 / Math.PI, ((cy - py) / k) * 180 / Math.PI];
  const px = o[0] + 40, py = o[1] - 26;
  const ref = proj.invert([px, py]);
  const got = back(px, py);
  const ok = ref && Number.isFinite(ref[0]) && Math.abs(ref[0] - got[0]) < 0.01 && Math.abs(ref[1] - got[1]) < 0.01;
  return ok ? back : (x, y) => proj.invert([x, y]);   // fall back if the projection is not plain
}

/**
 * The plate regions, from the layer's own geometry: rasterise every boundary line, flood-fill the
 * sea of cells, then label each region from the layer's label points. Returns, per cell, which of
 * the seven it belongs to (or minor / none) and which named plate it is when it is a small one.
 */
function buildRegions(plates) {
  const wall = new Uint8Array(GW * GH);
  for (const f of plates.features) {
    if (f.properties.kind === 'plate') continue;
    for (const line of f.geometry.coordinates) {
      for (let i = 1; i < line.length; i++) {
        let [x0, y0] = line[i - 1];
        let [x1, y1] = line[i];
        if (x1 - x0 > 180) x1 -= 360; else if (x1 - x0 < -180) x1 += 360;
        const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) / GRID));
        for (let s = 0; s <= n; s++) {
          const cx = cellX(x0 + (x1 - x0) * s / n), cy = cellY(y0 + (y1 - y0) * s / n);
          if (cy >= 0 && cy < GH) wall[cy * GW + cx] = 1;
        }
      }
    }
  }
  const comp = new Int32Array(GW * GH).fill(-1);
  const area = [];
  const stack = [];
  for (let i = 0; i < GW * GH; i++) {
    if (wall[i] || comp[i] >= 0) continue;
    const id = area.length;
    let a = 0;
    stack.push(i); comp[i] = id;
    while (stack.length) {
      const c = stack.pop(); a++;
      const cy = (c / GW) | 0, cx = c % GW;
      const nb = [[cx - 1, cy], [cx + 1, cy], [cx, cy - 1], [cx, cy + 1]];
      for (let n = 0; n < 4; n++) {
        const ny = nb[n][1];
        if (ny < 0 || ny >= GH) continue;
        const nx = (nb[n][0] + GW) % GW;                 // longitude wraps; latitude does not
        const k = ny * GW + nx;
        if (wall[k] || comp[k] >= 0) continue;
        comp[k] = id; stack.push(k);
      }
    }
    area.push(a);
  }
  // Label every region from the layer's own label points.
  const seed = new Map();                                 // comp id -> plate code
  const info = new Map();                                 // plate code -> { name, vEU, at }
  for (const f of plates.features) {
    if (f.properties.kind !== 'plate') continue;
    const p = f.properties;
    if (!info.has(p.code)) info.set(p.code, { name: p.name, vEU: p.vEU, at: f.geometry.coordinates.slice() });
    const cx = cellX(f.geometry.coordinates[0]), cy = cellY(f.geometry.coordinates[1]);
    if (cy < 0 || cy >= GH) continue;
    const k = cy * GW + cx;
    if (wall[k]) continue;                                // a label sitting on a boundary seeds nothing
    const id = comp[k];
    if (id >= 0 && !seed.has(id)) seed.set(id, p.code);
  }
  // The one region nothing seeds: PB2002's North America, whose label point is missing from the
  // build. It is the largest unseeded region by a wide margin, so area rank picks it deterministically.
  let big = -1, bigArea = 0;
  for (let id = 0; id < area.length; id++) if (!seed.has(id) && area[id] > bigArea) { big = id; bigArea = area[id]; }
  if (big >= 0) seed.set(big, 'NA');

  const groupOf = new Map();
  GROUPS.forEach((g, i) => g.codes.forEach((code) => groupOf.set(code, i)));
  const cell = new Uint8Array(GW * GH).fill(G_NONE);
  const plate = new Int16Array(GW * GH).fill(-1);
  const codes = [...info.keys()];
  const codeIndex = new Map(codes.map((c, i) => [c, i]));
  for (let i = 0; i < GW * GH; i++) {
    const id = comp[i];
    if (id < 0) continue;
    const code = seed.get(id);
    if (!code) continue;
    const g = groupOf.has(code) ? groupOf.get(code) : G_MINOR;
    cell[i] = g;
    if (g === G_MINOR) plate[i] = codeIndex.get(code) ?? -1;
  }
  return { cell, plate, codes, info };
}

/** 16-point compass word for a PB2002 vEU [east, north] vector. No speed is ever shown. */
function compassWord(vEU) {
  if (!vEU || (vEU[0] === 0 && vEU[1] === 0)) return 'reference plate';
  const a = ((Math.atan2(vEU[1], vEU[0]) * 180 / Math.PI) + 360) % 360;
  const words = ['east', 'east-north-east', 'north-east', 'north-north-east', 'north', 'north-north-west',
    'north-west', 'west-north-west', 'west', 'west-south-west', 'south-west', 'south-south-west',
    'south', 'south-south-east', 'south-east', 'east-south-east'];
  return words[Math.round(a / 22.5) % 16];
}

export class PlateWorldScene extends SimScene {
  static BEAT_STEP_MAP = MAP_S03;
  static BEAT_MAPS = { 4: MAP_S03, 2: MAP_S08 };
  static COLOR_MAP = GEO_COLOR_MAP;
  static CONTINUOUS = false;
  static DRAGGABLE = false;                     // the projection is held still: no pan, no orbit
  static ARIA_LABEL =
    'A world map drawn flat, with the Earth divided into its tectonic plates. Seven large plates are '
    + 'coloured and named, and a crowd of smaller ones is left in dark grey. Each large plate carries '
    + 'a black arrow showing which way that plate is travelling relative to Eurasia. India is outlined '
    + 'inside the Indo-Australian plate. Tapping any plate names it and lists the continents and '
    + 'the ocean it carries. The map does not move.';

  constructor(container, config) {
    super(container, config);
    this.view = null;             // the cylindrical projection, built in setup()
    this.inv = null;              // pixel -> [lon, lat]
    this.map = null;              // loaded layers
    this.grid = null;             // flood-filled plate regions
    this._fill = null;            // offscreen plate-colour image
    this._fillTones = null;       // the tones that image was painted with
    this._s = 0;                  // beat state, from the stage only
    this._sel = null;             // selected group index, or { minor: <code> }
    this._picks = [];             // the last two plates tapped, for the table
    this._cardT = CARD_S;
    this._pulseT = 0;
    this._said = false;
  }

  async setup() {
    this.map = await loadMap(['land', 'plates', 'india']);
    this.cache = layerCache();
    await super.setup();
    // makeView carries its own projection list; this scene needs the plain cylindrical one, so the
    // view is built here with the same shape the GeoMap draw functions use ({ path, at, box }).
    const d3 = await SimGeo.d3();
    const proj = d3.geoEquirectangular();
    proj.fitExtent([[MAP.x, MAP.y], [MAP.x + MAP.w, MAP.y + MAP.h]], {
      type: 'MultiPoint',
      coordinates: [[-180, LAT_BOTTOM], [180, LAT_TOP], [-180, LAT_TOP], [180, LAT_BOTTOM]],
    });
    this.view = { proj, path: d3.geoPath(proj).context(this._ctx), box: MAP, at: (ll) => proj(ll), d3 };
    this.inv = linearInverse(proj);
    this.grid = buildRegions(this.map.plates);
    this.animateFor(500);
  }

  // ---- beats ------------------------------------------------------------------------------

  enter(stage) {
    this._s = stage;
    this._picks = [];
    this._cardT = CARD_S;
    this._sel = stage === 1 ? { g: 2 } : stage === 3 ? { g: 4 } : null;
    this._pulseT = stage === 3 ? PULSE_S : 0;
  }

  update(d) {
    if (this._pulseT > 0) this._pulseT = Math.max(0, this._pulseT - d);
    if (this._cardT < CARD_S) this._cardT = Math.min(CARD_S, this._cardT + d);
  }

  busy() { return this._pulseT > 0 || this._cardT < CARD_S; }

  // ---- drawing ---------------------------------------------------------------------------

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'plain');
    if (!this.view) return;
    const close = this._s >= 4;
    this.cache(ctx, [c, close], (o) => {
      o.save();
      o.beginPath();
      o.rect(MAP.x, MAP.y, MAP.w, MAP.h);
      o.clip();
      this._plateFill(o, c);
      if (this._fill) { o.globalAlpha = close ? 0.34 : 1; o.drawImage(this._fill, MAP.x, MAP.y, MAP.w, MAP.h); o.globalAlpha = 1; }
      drawLand(o, this.view, c, this.map.land, {
        fill: alpha(c.bgSurface, close ? 0.7 : 0.42),
        stroke: alpha(mix(c.bgSurface, c.label, 0.5), 0.55),
        lineWidth: 0.9,
      });
      drawPlates(o, this.view, c, this.map.plates, { width: close ? 3.4 : 1.6, alpha: 0.95 });
      drawIndia(o, this.view, c, this.map.india, { fill: alpha(c.bgSurface, 0.22), stroke: c.label, lineWidth: 2, credit: false });
      o.restore();
    });
    ctx.save();
    ctx.beginPath();
    ctx.rect(MAP.x, MAP.y, MAP.w, MAP.h);
    ctx.clip();
    this._india(ctx, c);
    if (!close) { this._arrows(ctx, c); this._labels(ctx, c); }
    ctx.restore();
    if (close) this._kinds(ctx, c); else this._card(ctx, c);
    pill(ctx, c, CREDIT_INDIA, 340, 500, { size: 28, bg: c.bgSurface, ink: c.label });
  }

  /** The close: which line colour is which boundary. Colour is never alone: transform lines are dashed. */
  _kinds(ctx, c) {
    drawCard(ctx, c, CARD.x, CARD.y, CARD.w, CARD.h);
    if (this._s === 5) {
      pill(ctx, c, 'Where do earthquakes happen?', CARD.x + CARD.w / 2, CARD.y + 46, { size: 30, bg: c.accent, display: true });
      pill(ctx, c, 'Real records next', CARD.x + CARD.w / 2, CARD.y + 98, { size: 28, bg: c.bgSurface, ink: c.label });
      return;
    }
    const rows = [['Convergent: plates meet', c.bad], ['Divergent: plates part', c.good], ['Transform: plates slide', c.warning]];
    rows.forEach(([t, col], i) => {
      const y = CARD.y + 28 + i * 44;
      ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.setLineDash(i === 2 ? [10, 12] : []);
      ctx.beginPath(); ctx.moveTo(CARD.x + 22, y); ctx.lineTo(CARD.x + 92, y); ctx.stroke(); ctx.restore();
      ctx.fillStyle = c.label; ctx.font = font(c, 700, 26); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(t, CARD.x + 110, y);
    });
  }

  /** The eight plate colours for this theme, resolved once per theme change. */
  _plateTones(c) {
    const tones = GROUPS.map((g) => parseColor(c[g.tone]));
    tones[G_MINOR] = parseColor(mix(c.bgSurface, c.label, 0.3));
    return tones;
  }

  /** Paints every pixel of the frame with the plate it sits on: the same boundaries, as areas. */
  _plateFill(ctx, c) {
    const tones = this._plateTones(c);
    const key = tones.map((t) => `${t.r},${t.g},${t.b}`).join('|');
    if (this._fill && this._fillTones === key) return;
    const k = ctx.getTransform?.()?.a || 1;
    const w = Math.max(1, Math.round(MAP.w * k)), h = Math.max(1, Math.round(MAP.h * k));
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const o = cv.getContext('2d');
    const img = o.createImageData?.(w, h);
    if (!img?.data) { this._fill = null; return; }        // no pixel access: draw the flat backdrop
    const data = img.data;
    const cell = this.grid.cell;
    for (let py = 0; py < h; py++) {
      const y = MAP.y + (py + 0.5) / k;
      for (let px = 0; px < w; px++) {
        const [lon, lat] = this.inv(MAP.x + (px + 0.5) / k, y);
        let g = G_NONE;
        if (inFrame(lat)) {
          const cy = cellY(lat), cx = cellX(lon);
          if (cy >= 0 && cy < GH) g = cell[cy * GW + cx];
        }
        const i = (py * w + px) * 4;
        if (g === G_NONE) { data[i + 3] = 0; continue; }    // outside the frame: left transparent
        const t = tones[g];
        data[i] = t.r; data[i + 1] = t.g; data[i + 2] = t.b; data[i + 3] = 255;
      }
    }
    o.putImageData(img, 0, 0);
    this._fill = cv;
    this._fillTones = key;
  }

  /** India's outline, from the Survey of India layer only - and its credit, which drawIndia prints. */
  _india(ctx, c) {
    if (this._pulseT <= 0) return;
    const k = 0.5 + 0.5 * Math.cos(Math.PI * (1 - this._pulseT / PULSE_S));   // starts and ends at 0
    if (k <= 0.01) return;
    ctx.save();
    ctx.beginPath();
    this.view.path.context(ctx)(this.map.india);
    ctx.strokeStyle = alpha(c.gold, 0.55 + 0.45 * k);
    ctx.lineWidth = 2 + 6 * k;
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.restore();
  }

  /** Each of the seven plates' direction of travel against Eurasia. Constant length: direction only.
   *  The tail starts clear of the label box so the two never overlap. */
  _arrows(ctx, c) {
    const ink = mix(c.bgDeep, c.label, 0.9);
    GROUPS.forEach((g, i) => {
      const here = this._anchor(g, 'aoff');
      const v = here.vEU;
      if (!v || (v[0] === 0 && v[1] === 0)) return;       // Eurasia is the frame: nothing to draw
      const a = Math.atan2(-v[1], v[0]);
      const ux = Math.cos(a), uy = Math.sin(a);
      const x = here.x, y = here.y;
      const hx = x + ux * ARROW_LEN, hy = y + uy * ARROW_LEN;
      ctx.lineCap = 'round';
      // A halo in the plate's own tone, so a light arrow still reads on a pale plate.
      ctx.strokeStyle = alpha(c[g.tone], 0.95);
      ctx.lineWidth = 7;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(hx, hy); ctx.stroke();
      ctx.strokeStyle = ink;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(hx - ux * ARROW_HEAD, hy - uy * ARROW_HEAD);
      ctx.stroke();
      ctx.fillStyle = ink;
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(hx - Math.cos(a + 0.42) * ARROW_HEAD * 1.5, hy - Math.sin(a + 0.42) * ARROW_HEAD * 1.5);
      ctx.lineTo(hx - Math.cos(a - 0.42) * ARROW_HEAD * 1.5, hy - Math.sin(a - 0.42) * ARROW_HEAD * 1.5);
      ctx.closePath();
      ctx.fill();
      // Beat 2 brightens this one arrow, and only for as long as India's outline pulses.
      if (i === 4 && this._pulseT > 0) {
        const k = 0.5 + 0.5 * Math.cos(Math.PI * (1 - this._pulseT / PULSE_S));
        ctx.strokeStyle = alpha(c.gold, 0.35 + 0.65 * k);
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(x, y); ctx.lineTo(hx, hy);
        ctx.stroke();
      }
    });
  }

  /** Where a group's label sits and which vector it carries: the layer's own point, nudged by a
   *  pixel offset so no two labels collide and none lands on the Survey of India credit, or the one
   *  hand-written text anchor for North America (PB2002's NA label point is missing from the build). */
  _anchor(g, which = 'off') {
    const ll = g.rep === 'NA' ? NA_LABEL : this.grid.info.get(g.rep)?.at;
    const p = ll ? this.view.at(ll) : null;
    return {
      x: (p ? p[0] : MAP.x + 40) + g[which][0],
      y: (p ? p[1] : MAP.y + 40) + g[which][1],
      vEU: this.grid.info.get(g.rep)?.vEU,
    };
  }

  /** The seven names, on a small backing so a label never sits on a dot it would hide. */
  _labels(ctx, c) {
    ctx.save();
    GROUPS.forEach((g) => {
      const a = this._anchor(g);
      ctx.font = font(c, 700, 28);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const w = ctx.measureText(g.name).width + 14;
      ctx.fillStyle = c.bgSurface;
      ctx.fillRect(a.x - w / 2, a.y - 19, w, 38);
      ctx.strokeStyle = alpha(c[g.tone], 0.95);
      ctx.lineWidth = 2;
      ctx.strokeRect(a.x - w / 2, a.y - 19, w, 38);
      ctx.fillStyle = inkOn(c, c.bgSurface);
      ctx.fillText(g.name, a.x, a.y);
    });
    ctx.restore();
  }

  _line(g) {
    if (g.minor) return { name: this.grid.info.get(g.minor).name + ' plate', cont: 'a smaller plate', ocean: '' };
    const n = GROUPS[g.g].name, k = CARRIED[n];
    return { name: n + ' plate', cont: k.continents, ocean: k.ocean };
  }

  /** The card under the map: the tapped plate, or on the table beat the last two plates tapped. */
  _card(ctx, c) {
    const u = clamp01(this._cardT / CARD_S), rise = (1 - u) * 14;
    drawCard(ctx, c, CARD.x, CARD.y, CARD.w, CARD.h);
    const text = (t, x, y, size = 26, w = 700) => { ctx.fillStyle = c.label; ctx.font = font(c, w, size); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(t, x, y); };
    const X = CARD.x + 20;
    if (this._s === 2) {
      if (!this._picks.length) { pill(ctx, c, 'Tap two plates', CARD.x + CARD.w / 2, CARD.y + CARD.h / 2, { size: 30, bg: c.accent, display: true }); return; }
      this._picks.forEach((g, i) => {
        const l = this._line(g), y = CARD.y + 26 + i * 66;
        text(l.name, X, y, 27);
        text(g.minor ? l.cont : `${l.cont}. Ocean: ${l.ocean}`, X, y + 31, 24, 600);
      });
      return;
    }
    if (!this._sel) { pill(ctx, c, 'Tap a plate', CARD.x + CARD.w / 2, CARD.y + CARD.h / 2, { size: 30, bg: c.accent, display: true }); return; }
    const l = this._line(this._sel), minor = !!this._sel.minor;
    const box = pill(ctx, c, l.name, X, CARD.y + 32 + rise, { align: 'left', size: 27, bg: c.accent, display: true });
    const way = this._direction(this._sel);
    if (way) text(way, X + box.w + 14, CARD.y + 32 + rise, 25, 700);
    text(minor ? l.cont : `Continents: ${l.cont}`, X, CARD.y + 76 + rise);
    if (!minor) text(`Ocean: ${l.ocean}`, X, CARD.y + 114 + rise);
  }

  /** A word for the arrow on the map, measured against the Eurasian plate as the layer gives it. */
  _direction(sel) {
    const code = sel.minor ?? GROUPS[sel.g].rep;
    if (code === 'EU' || code === 'NA') return null;
    const v = this.grid.info.get(code)?.vEU;
    return v ? `moves ${compassWord(v)}` : null;
  }

  // ---- input -----------------------------------------------------------------------------

  /** A tap names a plate. It is a hit test in map coordinates, never a drag: nothing on this map
   *  moves, because the closing beat is a count. A tap that misses every region clears the card. */
  pointerDown(p) {
    if (!this.view || !this.grid || this._s >= 4) return;
    if (p.x < MAP.x || p.x > MAP.x + MAP.w || p.y < MAP.y || p.y > MAP.y + MAP.h) return;
    const [lon, lat] = this.inv(p.x, p.y);
    this.animateFor(400);
    if (!inFrame(lat)) return;
    const cy = cellY(lat), cx = cellX(lon);
    if (cy < 0 || cy >= GH) return;
    const k = cy * GW + cx;
    const g = this.grid.cell[k];
    if (g === G_NONE) return;
    this._sel = g === G_MINOR ? { minor: this.grid.codes[this.grid.plate[k]] } : { g };
    if (this._s === 2) this._picks = [...this._picks.filter((x) => JSON.stringify(x) !== JSON.stringify(this._sel)), this._sel].slice(-2);
    this._cardT = 0;
    if (!this._said) {
      this._said = true;
      this.celebrate(p.x, p.y, 20);
    }
  }

  pointerMove() { return false; }
  pointerUp() {}
}
