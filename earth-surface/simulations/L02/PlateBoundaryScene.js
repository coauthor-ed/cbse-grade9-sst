// PlateBoundaryScene - a side section of each case, one picture per beat. The ocean-ocean and ocean-continent
// pictures are different drawings: water on both sides with an island arc, then a coast with a land range.
// Which plate sinks is drawn, and the arrows run the true way. Setup: two neutral plates, nothing named.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, mix, outBack, clamp01, drawBackdrop } from 'simulations/base/kit/SimLook.js';
import { layerCache } from 'simulations/base/kit/GeoMap.js';
import { EARTH_COLOR_MAP, earthColour, drawRock, drawWater, drawSnow, drawHotRock, drawEarthSky, drawFlowArrow, roughen } from '../shared/EarthArt.js';

const SETUP = [[{ idx: 9 }]];
const MAP = [[{ idx: 0 }], [{ idx: 1 }], [{ idx: 2 }], [{ idx: 3 }], [{ idx: 4 }]];
const SEA = 130, LITH = 300;
const CONT = ['strata2', 'strata3'], OCN = ['strata5', 'strata6'];

export class PlateBoundaryScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 0: SETUP, [Number.MAX_SAFE_INTEGER]: SETUP, 1: SETUP, 5: MAP };
  static COLOR_MAP = EARTH_COLOR_MAP;
  static ARIA_LABEL = 'Side sections of plate boundaries: two continents folding into mountains, an ocean plate sinking under a continent, an ocean plate sinking under another with an island arc, plates moving apart at a ridge, and plates sliding past at a fault.';

  constructor(container, config) { super(container, config); this._s = 9; this.cache = layerCache(); }
  enter(stage) { this._s = stage; }
  busy() { return this.age < 0.8; }

  _mantle(ctx, c, top = LITH) {
    drawHotRock(ctx, c, [[-10, top], [690, top], [690, 530], [-10, 530]], { seed: 3, glow: 0.45 });
  }
  _tag(ctx, c, t, x, y, o = {}) { pill(ctx, c, t, x, y, { bg: earthColour(c, 'ink'), ink: earthColour(c, 'snow'), size: 26, display: true, ...o }); }
  _sinking(ctx, c, x0, y0, seed) {
    // an ocean slab going down at a slant, with melt rising above it
    const k = 1;
    drawRock(ctx, c, [[x0 - 60, y0], [x0, y0], [x0 + 210 * k, y0 + 270 * k], [x0 + 130 * k, y0 + 270 * k], [x0 - 60, y0 + 70]], { seed, bands: OCN, bandH: 22, dip: 52, cracks: 3, grain: false });
  }
  _volcano(ctx, c, x, base, h, w, seed) {
    drawRock(ctx, c, roughen([[x - w, base], [x - 14, base - h], [x + 14, base - h], [x + w, base]], { amp: 4, seed, step: 22 }), { seed, fill: 'slate', cracks: 3, grain: false });
    ctx.save();
    ctx.fillStyle = c.magma; ctx.beginPath(); ctx.ellipse(x, base - h, 16, 6, 0, 0, 7); ctx.fill();
    ctx.restore();
  }
  _meltUp(ctx, c, x0, y0, x1, y1) { drawFlowArrow(ctx, c, x0, y0, x1, y1, { col: c.magma, w: 9, bend: 8 }); }

  draw(ctx, c) {
    const g = outBack(clamp01(this.age / 0.7));
    this.cache(ctx, [c, this._s, Math.round(g * 30)], (o) => this._paint(o, c, g));
  }

  _paint(ctx, c, g) {
    drawBackdrop(ctx, c, 'plain');
    drawEarthSky(ctx, c, 0, 0, 680, 200);
    const s = this._s;
    if (s === 9) {
      this._mantle(ctx, c);
      drawRock(ctx, c, [[-10, 150], [336, 150], [336, LITH], [-10, LITH]], { seed: 3, fill: 'rock', cracks: 5, grain: false });
      drawRock(ctx, c, [[344, 150], [690, 150], [690, LITH], [344, LITH]], { seed: 5, fill: 'rock', cracks: 5, grain: false });
      drawFlowArrow(ctx, c, 90, 90, 270, 90, { col: c.warning, w: 13 });
      drawFlowArrow(ctx, c, 590, 90, 410, 90, { col: c.warning, w: 13 });
      this._tag(ctx, c, 'Plate', 170, 228); this._tag(ctx, c, 'Plate', 510, 228);
      return;
    }
    if (s === 0) {
      this._mantle(ctx, c);
      const h = 120 * g;
      const top = [[-10, 176], [110, 170], [190, 150], [250, 170 - h * 0.5], [300, 150 - h * 0.3], [340, 170 - h], [390, 148 - h * 0.25], [440, 172 - h * 0.6], [510, 152], [590, 170], [690, 176]];
      const profile = roughen(top, { closed: false, amp: 4, seed: 3, step: 22 });
      // folded bands follow the top
      drawRock(ctx, c, [...profile, [690, LITH], [-10, LITH]], { seed: 3, bands: CONT, bandH: 26, warp: 12, cracks: 6, grain: false });
      drawSnow(ctx, c, [[314, 118 - h * 0.45], [340, 170 - h], [366, 116 - h * 0.45], [352, 124 - h * 0.5], [340, 112 - h * 0.45], [328, 124 - h * 0.5]], { shade: false });
      drawFlowArrow(ctx, c, 20, 120, 150, 120, { col: c.warning, w: 13 });
      drawFlowArrow(ctx, c, 660, 120, 530, 120, { col: c.warning, w: 13 });
      this._tag(ctx, c, 'Continent', 112, 236); this._tag(ctx, c, 'Continent', 568, 236);
      this._tag(ctx, c, 'Fold mountains', 340, 300, { bg: c.gold, ink: earthColour(c, 'ink') });
    }
    if (s === 1) {
      this._mantle(ctx, c, 230);
      drawWater(ctx, c, [[-10, SEA], [400, SEA], [400, 236], [-10, 236]], { deep: 0.7, ripples: 3 });
      drawRock(ctx, c, [[-10, 234], [340, 234], [340, LITH], [-10, LITH]], { seed: 6, bands: OCN, bandH: 22, cracks: 3, grain: false });
      this._sinking(ctx, c, 330, 234, 5);
      const land = roughen([[346, 232], [420, 130], [470, 120], [510, 60], [560, 118], [620, 112], [700, 120], [700, 300], [470, 300]], { amp: 4, seed: 7, step: 22 });
      drawRock(ctx, c, land, { seed: 7, bands: CONT, bandH: 26, cracks: 5, grain: false });
      this._volcano(ctx, c, 510, 124, 66 * g, 56, 4);
      this._meltUp(ctx, c, 540, 400, 512, 150);
      drawFlowArrow(ctx, c, 60, 180, 220, 180, { col: c.warning, w: 12 });
      this._tag(ctx, c, 'Oceanic plate sinks', 170, 268, { size: 25 });
      this._tag(ctx, c, 'Continent', 600, 214);
      this._tag(ctx, c, 'Volcanoes and earthquakes', 300, 40, { bg: c.gold, ink: earthColour(c, 'ink'), size: 25 });
    }
    if (s === 2) {
      this._mantle(ctx, c, 212);
      drawWater(ctx, c, [[-10, SEA], [690, SEA], [690, 240], [-10, 240]], { deep: 0.7, ripples: 3 });
      drawRock(ctx, c, [[-10, 238], [300, 238], [300, LITH], [-10, LITH]], { seed: 6, bands: OCN, bandH: 22, cracks: 3, grain: false });
      this._sinking(ctx, c, 288, 238, 5);
      drawRock(ctx, c, [[332, 214], [690, 214], [690, LITH], [420, LITH]], { seed: 9, bands: OCN, bandH: 22, cracks: 3, grain: false });
      for (const [x, h, w] of [[476, 118, 60], [590, 90, 54]]) this._volcano(ctx, c, x, 220, h * g, w, x);
      this._meltUp(ctx, c, 508, 410, 478, 150);
      drawFlowArrow(ctx, c, 40, 180, 200, 180, { col: c.warning, w: 12 });
      this._tag(ctx, c, 'Trench', 318, 40);
      ctx.save(); ctx.strokeStyle = earthColour(c, 'ink'); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(318, 62); ctx.lineTo(318, 228); ctx.stroke(); ctx.restore();
      this._tag(ctx, c, 'Island arc', 540, 40, { bg: c.gold, ink: earthColour(c, 'ink') });
      this._tag(ctx, c, 'Ocean plate', 130, 268, { size: 25 });
    }
    if (s === 3) {
      const part = 46 * g;
      this._mantle(ctx, c);
      drawWater(ctx, c, [[-10, SEA], [690, SEA], [690, 240], [-10, 240]], { deep: 0.7, ripples: 3 });
      const rise = [[-10, 240], [200, 226], [340 - part, 186], [340 - part, LITH], [-10, LITH]];
      const rise2 = [[690, 240], [480, 226], [340 + part, 186], [340 + part, LITH], [690, LITH]];
      drawRock(ctx, c, rise, { seed: 3, bands: OCN, bandH: 22, cracks: 3, grain: false });
      drawRock(ctx, c, rise2, { seed: 5, bands: OCN, bandH: 22, cracks: 3, grain: false });
      drawHotRock(ctx, c, [[340 - part, 200], [340 + part, 200], [340 + part, 320], [340 - part, 320]], { seed: 5, glow: 0.9 });
      drawFlowArrow(ctx, c, 340, 420, 340, 226, { col: c.magma, w: 14 });
      drawFlowArrow(ctx, c, 240, 90, 90, 90, { col: c.warning, w: 13 });
      drawFlowArrow(ctx, c, 440, 90, 590, 90, { col: c.warning, w: 13 });
      this._tag(ctx, c, 'Mid-ocean ridge', 340, 40, { bg: c.gold, ink: earthColour(c, 'ink') });
      this._tag(ctx, c, 'Magma rises', 340, 468, { bg: earthColour(c, 'snow'), ink: earthColour(c, 'ink') });
      this._tag(ctx, c, 'New crust', 130, 270);
    }
    if (s === 4) {
      // looking down on the fault: land on both sides, a road offset along it
      drawRock(ctx, c, [[-10, -10], [340, -10], [340, 530], [-10, 530]], { seed: 3, fill: 'grass', grain: false, outline: false, lit: false });
      drawRock(ctx, c, [[340, -10], [690, -10], [690, 530], [340, 530]], { seed: 5, fill: 'grassDark', grain: false, outline: false, lit: false });
      const off = 70 * g, ink = earthColour(c, 'ink');
      ctx.save();
      ctx.fillStyle = mix(earthColour(c, 'slate'), c.bgSurface, 0.1); ctx.strokeStyle = ink; ctx.lineWidth = 3;
      ctx.fillRect(-10, 240 - off, 346, 60); ctx.strokeRect(-10, 240 - off, 346, 60);
      ctx.fillRect(344, 240 + off, 346, 60); ctx.strokeRect(344, 240 + off, 346, 60);
      ctx.strokeStyle = ink; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(340, -10); ctx.lineTo(340, 530); ctx.stroke();
      ctx.restore();
      drawFlowArrow(ctx, c, 150, 470, 150, 350, { col: c.warning, w: 13 });
      drawFlowArrow(ctx, c, 530, 60, 530, 170, { col: c.warning, w: 13 });
      this._tag(ctx, c, 'Fault', 340, 36, { bg: c.gold, ink });
      this._tag(ctx, c, 'Seen from above', 500, 482, { bg: earthColour(c, 'snow'), ink });
      this._tag(ctx, c, 'No crust made or lost', 160, 96);
    }
  }
}
