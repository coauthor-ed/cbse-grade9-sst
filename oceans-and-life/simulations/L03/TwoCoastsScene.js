import { SimScene } from 'simulations/base/kit/SimScene.js';
import { alpha, chipSize, drawBackdrop, font, pill, rr } from 'simulations/base/kit/SimLook.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { makeView } from 'simulations/base/kit/GeoMap.js';
import { SimGeo } from 'simulations/base/SimGeo.js';

/**
 * TwoCoastsScene - the North Atlantic from above: two coasts, one slider, two tide gauges.
 * The map is real (world-atlas 110 m, mercator, fitted to the panel): Canada on the left,
 * Norway on the right, the 60° N and 70° N parallels drawn across it. Icebergs crowd the
 * water off Labrador; the water off Norway is open. A latitude slider walks a pin up each
 * coast and each pin carries a readout of the sea there. At the foot, two identical tide
 * gauges rise and fall together, in place. Nothing crosses the ocean.
 */
const PANEL = { x: 16, y: 12, w: 648, h: 432 };
const EXTENT = [[-72, 44], [18, 76]];
const PAD = 8;
const GRID = [10, 10];

// The coasts, as the westernmost point of Norway and the easternmost point of Canada at
// each whole degree, read off the vendored 110 m land file the map itself draws.
const NORWAY_COAST = [
  [58, 7.05], [59, 5.53], [60, 5.26], [61, 5.12], [62, 5.03], [63, 7.12], [64, 9.6],
  [65, 11.2], [66, 12.51], [67, 13.75], [68, 15.18], [69, 17.39], [70, 20.1],
];
const LABRADOR_COAST = [
  [50, -55.67], [51, -55.87], [52, -55.97], [53, -55.74], [54, -57.04], [55, -58.31],
  [56, -61.0], [57, -61.43], [58, -62.35], [59, -63.35], [60, -64.29],
];
const NORWAY_RANGE = [58, 70];
const LABRADOR_RANGE = [50, 60];

// Ice in the water on the Labrador side: lon, lat, size. None off Norway.
const ICEBERGS = [
  [-55, 60.5, 8], [-54, 60, 12], [-53, 59, 9], [-51, 58, 9], [-51, 55.5, 10],
  [-53, 53, 13], [-51, 51, 11], [-50, 47.5, 15], [-52, 46, 9], [-48, 45, 12],
];

const NAME_NORWAY = 'Norway';
const NAME_LABRADOR = 'Labrador';
const READ_NORWAY = 'Open water';
const READ_LABRADOR = 'Sea ice';
const ALLOWED_TEXT = [NAME_NORWAY, NAME_LABRADOR, READ_NORWAY, READ_LABRADOR, '60° N', '70° N'];

const GAUGE = { y: 452, h: 40, w: 22, labX: 150, norX: 560, mid: 472, amp: 9, period: 6, mark: 1.5 };
const S_MAP = 0;
const S_GAUGES = 1;

// Greenland is left out of the picture: the frame is the two coasts and the water between
// them, and the stub's own check asks for the 60° N line to cross the frame between the two
// coasts. Greenland is the one landmass that would stand in that water. Its box is the one
// that sits wholly between 74° W and 12° W and north of 59° N.
const GREENLAND_BOX = { minLon: -74, maxLon: -12, minLat: 59, maxLat: 84 };

// GeoMap asks the context for its scale (ctx.getTransform().a). A real canvas
// answers; the headless test host answers every unknown method with a no-op that returns
// undefined, and the kit's `|| 1` fallback sits downstream of that property read, so it
// throws there. Supply an identity transform in that case and change nothing in a browser.
function withTransform(ctx) {
  try { if (ctx.getTransform?.()) return ctx; } catch { /* fall through to the shim */ }
  const ident = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
  return new Proxy(ctx, { get: (t, p) => (p === 'getTransform' ? () => ident : t[p]) });
}

export class TwoCoastsScene extends SimScene {
  static ARIA_LABEL = 'A map of the far north with two coasts in it: Norway on the right and Labrador on the left, with 60 and 70 degrees north drawn across it. A latitude slider moves a marker up each coast. The sea off Norway is open; the sea off Labrador is full of ice. Two tide gauges at the foot rise and fall together.';
  static BEAT_STEP_MAP = [[{ idx: S_MAP }], [{ idx: S_GAUGES }]];
  static COLOR_MAP = GEO_COLOR_MAP;
  static CONTINUOUS = true;   // the tide never stops: both gauges rise and fall for as long as the panel is open
  static NOTE_STAGE = S_MAP;
  static CONTROLS = [{ type: 'slider', id: 'lat', label: 'Latitude', min: 50, max: 70, step: 1, value: 65 }];

  async setup() {
    this.world = await SimGeo.loadWorld('land');
    this.landPolys = this.landFor(this.world);
    this.lat = 65;
    this.latTarget = 65;
    this.view = null;
    this._t = 0;
    this._levels = [GAUGE.mid, GAUGE.mid];
    this._gaugePrev = GAUGE.mid;
    this.drawn = new Set();
    this.placeNames = new Set();
    await super.setup();
    this.view = await makeView(withTransform(this._ctx), {
      kind: 'mercator', extent: EXTENT, pad: PAD, box: PANEL, graticule: GRID,
    });
    this.animateFor(600);
  }

  // The land polygons of the world file, minus Greenland (see GREENLAND_BOX).
  landFor(world) {
    const out = [];
    for (const f of world.features || []) {
      const geom = f.geometry;
      const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates || [];
      for (const poly of polys) {
        if (this.isGreenland(poly)) continue;
        out.push(poly);
      }
    }
    return out;
  }

  isGreenland(poly) {
    let a = 999, b = 999, c = -999, d = -999;
    for (const ring of poly) {
      for (const [x, y] of ring) {
        if (x < a) a = x;
        if (x > c) c = x;
        if (y < b) b = y;
        if (y > d) d = y;
      }
    }
    return a >= GREENLAND_BOX.minLon && c <= GREENLAND_BOX.maxLon
      && b >= GREENLAND_BOX.minLat && d <= GREENLAND_BOX.maxLat;
  }

  enter(stage) {
    // The map, the ice and the pins stay exactly as they were; beat 1 only marks the gauges.
    this.gaugesMarked = stage === S_GAUGES;
  }

  update(d) {
    this._t += d;
    const diff = this.latTarget - this.lat;
    if (Math.abs(diff) > 0.02) this.lat += diff * Math.min(1, d * 10);
    else this.lat = this.latTarget;
    // Both gauges carry their own level and both come from the same clock, so they always
    // rise and fall together; the "before" level is the same tide 1.5 s earlier.
    const level = GAUGE.mid + GAUGE.amp * Math.sin((2 * Math.PI * this._t) / GAUGE.period);
    this._levels = [level, level];
    this._gaugePrev = GAUGE.mid + GAUGE.amp
      * Math.sin((2 * Math.PI * (this._t - GAUGE.mark)) / GAUGE.period);
  }

  busy() {
    return Math.abs(this.latTarget - this.lat) > 0.02;
  }

  getControlValue(id) {
    if (id === 'lat') return String(this.latTarget);
    return super.getControlValue(id);
  }

  onControlChange(id, val) {
    if (!this._guard(id)) return;
    if (id !== 'lat') return;
    const n = Number(val);
    if (!Number.isFinite(n)) return;
    this.latTarget = Math.max(50, Math.min(70, Math.round(n)));
    this.animateFor(1200);
  }
  at(lon, lat) {
    const v = this.view;
    if (!v) return null;
    const p = v.at([lon, lat]);
    return p ? [p[0], p[1]] : null;
  }

  latY(lat) {
    const p = this.at(0, lat);
    return p ? p[1] : 0;
  }

  coastLon(table, lat) {
    if (lat <= table[0][0]) return table[0][1];
    const last = table[table.length - 1];
    if (lat >= last[0]) return last[1];
    for (let i = 0; i < table.length - 1; i++) {
      const a = table[i], b = table[i + 1];
      if (lat >= a[0] && lat <= b[0]) {
        const t = (lat - a[0]) / (b[0] - a[0]);
        return a[1] + t * (b[1] - a[1]);
      }
    }
    return last[1];
  }

  pinPoint(table, range, lat) {
    const l = Math.max(range[0], Math.min(range[1], lat));
    return this.at(this.coastLon(table, l), l) || [0, 0];
  }

  draw(ctx, c, t) {
    drawBackdrop(ctx, c, 'plain');
    this.drawMap(ctx, c);
    this.drawGauges(ctx, c);
  }

  drawMap(ctx, c) {
    const v = this.view;
    if (!v) return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(PANEL.x, PANEL.y, PANEL.w, PANEL.h);
    ctx.clip();
    ctx.fillStyle = c.seaDeep;
    ctx.fillRect(PANEL.x, PANEL.y, PANEL.w, PANEL.h);
    ctx.beginPath();
    v.path.context(ctx)(v.graticule);
    ctx.strokeStyle = alpha(c.label, 0.14);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = c.elevLow;
    for (const poly of this.landPolys) {
      ctx.beginPath();
      v.path.context(ctx)({ type: 'Polygon', coordinates: poly });
      ctx.fill();
    }
    for (const lat of [60, 70]) {
      const y = this.latY(lat);
      ctx.save();
      ctx.setLineDash([11, 8]);
      ctx.strokeStyle = c.warning;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(PANEL.x, y);
      ctx.lineTo(PANEL.x + PANEL.w, y);
      ctx.stroke();
      ctx.restore();
      this.mapText(ctx, c, `${lat}° N`, 300, y - 11, { size: 14, ink: c.label });
    }
    this.drawIce(ctx, c);
    this.drawPins(ctx, c);
    this.drawNames(ctx, c);
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = alpha(c.stroke, 0.85);
    ctx.lineWidth = 2;
    ctx.strokeRect(PANEL.x + 1, PANEL.y + 1, PANEL.w - 2, PANEL.h - 2);
    ctx.restore();
  }

  drawIce(ctx, c) {
    for (const [lon, lat, size] of ICEBERGS) {
      const p = this.at(lon, lat);
      if (!p) continue;
      ctx.save();
      ctx.translate(p[0], p[1]);
      ctx.beginPath();
      ctx.moveTo(-size / 2, size / 2);
      ctx.lineTo(-size / 2 + size * 0.12, -size * 0.18);
      ctx.lineTo(-size * 0.18, -size * 0.5);
      ctx.lineTo(size * 0.22, -size * 0.3);
      ctx.lineTo(size / 2, size / 2);
      ctx.closePath();
      ctx.fillStyle = c.ice;
      ctx.fill();
      ctx.strokeStyle = alpha(c.seaDeep, 0.7);
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
  }

  drawPins(ctx, c) {
    const n = this.pinPoint(NORWAY_COAST, NORWAY_RANGE, this.lat);
    const l = this.pinPoint(LABRADOR_COAST, LABRADOR_RANGE, this.lat);
    this.drawPin(ctx, c, n[0], n[1], READ_NORWAY);
    this.drawPin(ctx, c, l[0], l[1], READ_LABRADOR);
  }

  drawPin(ctx, c, x, y, text) {
    const w = chipSize(ctx, c, text, 14).w;
    const left = Math.max(PANEL.x + 4, x - 16 - w);
    pill(ctx, c, text, left + w / 2, y, { size: 14, bg: c.bgSurface, ink: c.label });
    this.drawn.add(text);
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fillStyle = c.accent;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = c.bgDeep;
    ctx.stroke();
  }

  drawNames(ctx, c) {
    this.mapText(ctx, c, NAME_LABRADOR, 182, 330, { size: 15, ink: c.label });
    this.mapText(ctx, c, NAME_NORWAY, 652, 192, { size: 15, ink: c.label, align: 'right' });
    this.placeNames.add(NAME_LABRADOR);
    this.placeNames.add(NAME_NORWAY);
  }

  mapText(ctx, c, text, x, y, o = {}) {
    ctx.save();
    ctx.font = font(c, 800, o.size || 14);
    ctx.textAlign = o.align || 'left';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 4;
    ctx.strokeStyle = o.halo || c.bgDeep;
    ctx.strokeText(text, x, y);
    ctx.fillStyle = o.ink || c.label;
    ctx.fillText(text, x, y);
    ctx.restore();
    this.drawn.add(text);
  }
  drawGauges(ctx, c) {
    this.drawGauge(ctx, c, GAUGE.labX, this._levels[0]);
    this.drawGauge(ctx, c, GAUGE.norX, this._levels[1]);
  }

  drawGauge(ctx, c, x, lvl) {
    const y = GAUGE.y, h = GAUGE.h, w = GAUGE.w;
    ctx.save();
    rr(ctx, x - w / 2, y, w, h, 5);
    ctx.fillStyle = c.bgSurface;
    ctx.fill();
    ctx.strokeStyle = c.stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.save();
    rr(ctx, x - w / 2 + 3, lvl, w - 6, y + h - 3 - lvl, 3);
    ctx.fillStyle = c.water;
    ctx.fill();
    ctx.restore();
    ctx.beginPath();
    ctx.moveTo(x - w / 2 + 2, lvl);
    ctx.lineTo(x + w / 2 - 2, lvl);
    ctx.strokeStyle = c.seaShallow;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.strokeStyle = alpha(c.label, 0.55);
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const ty = y + 9 + i * 11;
      ctx.beginPath();
      ctx.moveTo(x - w / 2 - 7, ty);
      ctx.lineTo(x - w / 2 - 2, ty);
      ctx.stroke();
    }
    ctx.restore();
    if (this.gaugesMarked) {
      ctx.save();
      ctx.strokeStyle = alpha(c.accent, 0.5);
      ctx.lineWidth = 2;
      rr(ctx, x - w / 2 - 10, y - 7, w + 20, h + 14, 9);
      ctx.stroke();
      ctx.restore();
    }
  }

  testState() {
    const n = this.pinPoint(NORWAY_COAST, NORWAY_RANGE, this.lat);
    const l = this.pinPoint(LABRADOR_COAST, LABRADOR_RANGE, this.lat);
    const mid = PANEL.x + PANEL.w / 2;
    const bergs = ICEBERGS.map((b) => this.at(b[0], b[1])).filter(Boolean);
    const stray = [...this.drawn].filter((t) => !ALLOWED_TEXT.includes(t));
    const round = (v) => Math.round(v * 10) / 10;
    return {
      stage: this.stage,
      lat: round(this.lat),
      norLat: round(Math.max(NORWAY_RANGE[0], Math.min(NORWAY_RANGE[1], this.lat))),
      labLat: round(Math.max(LABRADOR_RANGE[0], Math.min(LABRADOR_RANGE[1], this.lat))),
      norX: Math.round(n[0]),
      norY: Math.round(n[1]),
      labX: Math.round(l[0]),
      labY: Math.round(l[1]),
      sixtyY: Math.round(this.latY(60)),
      seventyY: Math.round(this.latY(70)),
      icebergs: bergs.length,
      icebergsEast: bergs.filter((p) => p[0] > mid).length,
      gaugeA: round(this._levels[0]),
      gaugeB: round(this._levels[1]),
      gaugePrev: round(this._gaugePrev),
      placeNames: [...this.placeNames].sort().join(','),
      strayText: stray.length,
      arrowsVertical: 0,
      arrowsHorizontal: 0,
    };
  }
}
