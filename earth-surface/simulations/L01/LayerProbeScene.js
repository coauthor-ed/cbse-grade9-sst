// LayerProbeScene - a side section of the top of the Earth. The rigid shell (crust plus upper mantle)
// rests on the hot, soft layer. Drag the shell: it moves as one piece, the soft layer bends, the deep mantle
// stays. Two mounts: predict (no beats: nothing named below the crust) and explain (3 beats).
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, mix, clamp } from 'simulations/base/kit/SimLook.js';
import { layerCache } from 'simulations/base/kit/GeoMap.js';
import { EARTH_COLOR_MAP, earthColour, drawRock, drawWater, drawHotRock, drawTree, drawGrass, drawEarthSky, drawFlowArrow, roughen } from '../shared/EarthArt.js';

const SETUP = [[{ idx: 9 }]];
const MAP = [[{ idx: 0 }], [{ idx: 1 }], [{ idx: 2 }]];
const Y = { sky: 96, seabed: 132, crust: 172, lith: 236, asth: 368 };
const MAX = 84;

export class LayerProbeScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 0: SETUP, [Number.MAX_SAFE_INTEGER]: SETUP, 1: SETUP, 3: MAP };
  static COLOR_MAP = EARTH_COLOR_MAP;
  static CONTROLS_IN_SIGHT = true;
  static DRAGGABLE = true;
  static ARIA_LABEL = 'A side section through the top of the Earth: the rigid lithosphere rests on the hot, soft asthenosphere, with the mostly solid mantle below. Dragging the lithosphere moves it as one piece.';
  static CONTROLS = [{ type: 'range', id: 'shift', label: 'Move the shell', min: -84, max: 84, step: 1, value: 0 }];

  constructor(container, config) {
    super(container, config);
    this._s = 0; this._dx = 0; this._drag = null; this._found = false; this.cache = layerCache();
  }

  enter(stage) {
    this._s = stage;
    this._dx = 0; this._drag = null;
    this.requestUiUpdate?.();
  }
  getControlValue(id) { return id === 'shift' ? String(Math.round(this._dx)) : super.getControlValue(id); }
  isControlHidden(id) { return id === 'shift' && this._s !== 1; }
  onControlChange(id, v) { if (id === 'shift') { this._dx = clamp(Number(v), -MAX, MAX); this._check(); this.animateFor?.(300); } }
  _check() { if (!this._found && Math.abs(this._dx) > 56) { this._found = true; this.celebrate(340, 170, 12, { key: 'shell' }); } }
  pointerDown(p) { if (this._s === 1 && p.y > 40 && p.y < Y.lith) { this._drag = { x: p.x, from: this._dx }; return true; } return false; }
  pointerMove(p) {
    if (!this._drag) return false;
    this._dx = clamp(this._drag.from + p.x - this._drag.x, -MAX, MAX);
    this._check();
    return true;
  }
  pointerUp() { this._drag = null; }
  busy() { return !!this._drag || (this._s === 2 && this.age < 0.8); }

  _land(ctx, c) {
    const land = roughen([[-140, 96], [80, 84], [240, 90], [392, 92], [452, Y.seabed], [452, Y.crust], [-140, Y.crust]], { closed: true, amp: 3, seed: 3, step: 30 });
    drawWater(ctx, c, [[380, Y.sky], [900, Y.sky], [900, Y.seabed + 2], [430, Y.seabed + 2]], { deep: 0.4, ripples: 2 });
    drawRock(ctx, c, land, { seed: 3, bands: ['strata2', 'strata3'], bandH: 26, cracks: 6, grain: false });
    drawRock(ctx, c, [[440, Y.seabed], [900, Y.seabed], [900, Y.seabed + 20], [440, Y.seabed + 20]], { seed: 5, fill: 'slate', outline: false, grain: false });
    drawGrass(ctx, c, -120, 92, 380, 90, { seed: 5, n: 44 });
    for (const [x, s, k] of [[50, 0.62, 'round'], [152, 0.5, 'pine'], [290, 0.56, 'round']]) drawTree(ctx, c, x, 90, s, { kind: k, seed: x });
  }
  _shell(ctx, c, dx, broken, part) {
    ctx.save();
    ctx.translate(dx, 0);
    if (broken) {
      const parts = [[-140, 205, 188, -12], [205, 480, 505, 0], [480, 900, 900, 12]];
      parts.forEach(([x0, x1, , off], i) => {
        ctx.save();
        ctx.translate(off * part, 0);
        ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x1, 0); ctx.lineTo(x1 + (i === 0 ? -14 : 14), Y.lith); ctx.lineTo(x0 + (i === 1 ? -14 : 14), Y.lith); ctx.closePath(); ctx.clip();
        this._rigid(ctx, c);
        ctx.restore();
      });
    } else this._rigid(ctx, c);
    ctx.restore();
  }
  _rigid(ctx, c) {
    drawRock(ctx, c, [[-140, Y.crust - 16], [900, Y.seabed + 16], [900, Y.lith], [-140, Y.lith]], { seed: 8, fill: 'slate', cracks: 8, grain: true, lit: false });
    this._land(ctx, c);
  }
  _soft(ctx, c, dx) {
    drawHotRock(ctx, c, [[-20, Y.lith], [700, Y.lith], [700, Y.asth], [-20, Y.asth]], { seed: 4, glow: 0.7 });
    ctx.save();
    ctx.strokeStyle = earthColour(c, 'hotDark'); ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (let i = 0; i < 5; i++) for (let k = -1; k < 8; k++) {
      const u = (i + 0.5) / 5, y = Y.lith + u * (Y.asth - Y.lith), x = k * 110 + (i % 2) * 44 + dx * (1 - u);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 30, y + 6, x + 62, y); ctx.stroke();
    }
    ctx.restore();
  }
  _deep(ctx, c) {
    drawRock(ctx, c, [[-20, Y.asth], [700, Y.asth], [700, 540], [-20, 540]], { seed: 9, bands: ['strata6', 'strata5'], bandH: 40, warp: 6, grain: true, lit: false });
  }

  draw(ctx, c) {
    const part = Math.round(Math.min(1, this.age / 0.7) * 20);
    this.cache(ctx, [c, this._s, Math.round(this._dx), part, !!this._drag], (o) => this._paint(o, c, part / 20));
  }

  _paint(ctx, c, part) {
    const s = this._s, ink = earthColour(c, 'ink'), snow = earthColour(c, 'snow');
    drawEarthSky(ctx, c, 0, 0, 680, 150);
    if (s === 9) {
      this._deep(ctx, c);
      ctx.save(); ctx.fillStyle = mix(earthColour(c, 'rockDeep'), c.bgDeep, 0.3); ctx.fillRect(0, Y.crust - 4, 680, 360); ctx.restore();
      this._land(ctx, c);
      pill(ctx, c, 'What lies below?', 340, 340, { bg: snow, ink, size: 34, display: true });
      drawFlowArrow(ctx, c, 240, 40, 440, 40, { col: c.warning, w: 12 });
      pill(ctx, c, 'A few cm a year', 340, 136, { bg: ink, ink: snow, size: 27, display: true });
      return;
    }
    this._deep(ctx, c);
    this._soft(ctx, c, this._dx);
    this._shell(ctx, c, this._dx, s === 2, part);
    const tag = (t, x, y, bg = ink, fg = snow, size = 27) => pill(ctx, c, t, x, y, { bg, ink: fg, size, display: true });
    if (s === 0) {
      tag('Lithosphere: 100 km', 340, 204);
      tag('Asthenosphere: 200 km', 340, 302, c.gold, ink);
      tag('Crust', 150 , 132);
    }
    if (s === 1) {
      tag('Rigid', 340 + this._dx, 204);
      tag('Soft, flows very slowly', 340, 302, c.gold, ink);
      tag('Mantle: mostly solid', 340, 448);
      if (!this._drag && Math.abs(this._dx) < 8) tag('Drag the shell', 340, 40, c.accent, undefined, 28);
    }
    if (s === 2) {
      tag('Plate', 70, 204); tag('Plate', 340, 204); tag('Plate', 610, 204);
      tag('Semi-molten layer', 340, 302, c.gold, ink);
      drawFlowArrow(ctx, c, 150, 40, 40, 40, { col: c.warning, w: 12 });
      drawFlowArrow(ctx, c, 530, 40, 640, 40, { col: c.warning, w: 12 });
      tag('A few cm a year', 340, 40, snow, ink, 26);
    }
  }
}
