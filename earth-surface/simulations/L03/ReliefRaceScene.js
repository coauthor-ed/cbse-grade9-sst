// ReliefRaceScene - one big mountain. Raise lifts it, Wear down takes rock off the top and lays it at the foot.
// One height state, so the arrows, the rock and the heap at the foot always agree. Text and buttons match per beat.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, clamp, drawBackdrop } from 'simulations/base/kit/SimLook.js';
import { layerCache } from 'simulations/base/kit/GeoMap.js';
import { EARTH_COLOR_MAP, earthColour, drawRock, drawSnow, drawSand, drawEarthSky, drawGrass, drawFlowArrow, roughen } from '../shared/EarthArt.js';

const MAP = [[{ idx: 0 }], [{ idx: 1 }], [{ idx: 2 }]];
const G = 400, START = 180, LOW = 90, HIGH = 320, STEP = 46;

export class ReliefRaceScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static COLOR_MAP = EARTH_COLOR_MAP;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'One mountain. Raise lifts it with forces from inside the Earth. Wear down takes rock from the top and lays it at the foot.';
  static CONTROLS = [{ type: 'button', id: 'raise', label: 'Raise' }, { type: 'button', id: 'wear', label: 'Wear down' }];

  constructor(container, config) { super(container, config); this._b = 0; this._h = START; this._to = START; this._heap = 0; this._heapTo = 0; this.cache = layerCache(); }
  enter(stage) {
    this._b = stage;
    this._h = this._to = stage === 1 ? 300 : START;
    this._heap = this._heapTo = 0;
    this.requestUiUpdate?.();
  }
  isControlHidden(id) { return (id === 'raise' && this._b === 1) || (id === 'wear' && this._b === 0); }
  isControlDisabled(id) { return (id === 'raise' && this._to >= HIGH) || (id === 'wear' && this._to <= LOW); }
  onControlChange(id) {
    if (id === 'raise') this._to = clamp(this._to + STEP, LOW, HIGH);
    if (id === 'wear') { const n = clamp(this._to - STEP, LOW, HIGH); this._heapTo += this._to - n; this._to = n; }
    this.animateFor?.(900); this.requestUiUpdate?.();
  }
  update(d) {
    this._h += (this._to - this._h) * Math.min(1, d * 6);
    this._heap += (this._heapTo - this._heap) * Math.min(1, d * 6);
  }
  busy() { return Math.abs(this._to - this._h) > 0.5 || Math.abs(this._heapTo - this._heap) > 0.5; }

  draw(ctx, c) {
    const h = Math.round(this._h), heap = Math.round(this._heap);
    this.cache(ctx, [c, this._b, h, heap], (o) => this._paint(o, c, h, heap));
  }

  _paint(ctx, c, h, heap) {
    drawBackdrop(ctx, c, 'plain');
    const b = this._b, ink = earthColour(c, 'ink'), snow = earthColour(c, 'snow'), top = G - h, W = 170 + h * 0.75;
    drawEarthSky(ctx, c, 0, 0, 680, G + 10);
    const hill = roughen([[340 - W, G], [340 - W * 0.45, G - h * 0.5], [340 - 22, top + 6], [340 + 26, top], [340 + W * 0.42, G - h * 0.52], [340 + W, G]], { closed: false, amp: 6, seed: 3, step: 26 });
    drawRock(ctx, c, [...hill, [340 + W, G + 4], [340 - W, G + 4]], { seed: 5, bands: ['strata2', 'strata3', 'strata5'], bandH: 36, dip: 8, warp: 8, cracks: 9, grain: false });
    if (h > 150) drawSnow(ctx, c, [[340 + 26, top], [340 + 74, top + 58], [340 + 40, top + 50], [340 + 18, top + 68], [340 - 6, top + 48], [340 - 34, top + 62], [340 - 22, top + 6]], { seed: 3 });
    drawRock(ctx, c, [[-10, G], [690, G], [690, 530], [-10, 530]], { seed: 7, bands: ['strata3', 'strata5', 'strata6'], bandH: 40, cracks: 8, grain: false, lit: false });
    drawGrass(ctx, c, 0, G + 2, 340 - W, G + 2, { seed: 4, n: 16 });
    drawGrass(ctx, c, 340 + W, G + 2, 680, G + 2, { seed: 8, n: 16 });
    if (heap > 2) {
      const q = Math.min(70, heap * 0.4);
      drawSand(ctx, c, [[440 - q * 3, G + 2], [560, G - q], [690, G - q * 0.8], [690, G + 2]], { seed: 3, ripples: false });
    }
    if (b >= 1) {
      ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const run = () => { ctx.beginPath(); ctx.moveTo(340 + 30, top + 70); ctx.bezierCurveTo(340 + 10, top + h * 0.35, 340 + W * 0.5, top + h * 0.45, 340 + W * 0.3, G - h * 0.22); ctx.quadraticCurveTo(340 + W * 0.2, G - 24, 340 + W * 0.56, G - 3); };
      ctx.strokeStyle = earthColour(c, 'ink'); ctx.lineWidth = 11; run(); ctx.stroke();
      ctx.strokeStyle = c.seaShallow; ctx.lineWidth = 6; run(); ctx.stroke();
      ctx.restore();
    }
    const tag = (t, x, y, o = {}) => pill(ctx, c, t, x, y, { bg: ink, ink: snow, size: 26, display: true, ...o });
    if (b !== 1) { drawFlowArrow(ctx, c, 340, 512, 340, 420, { col: c.magma, w: 15 }); tag('Internal forces', 150, 466, { size: 26 }); }
    if (b !== 0) { drawFlowArrow(ctx, c, 520, 34, 420, Math.max(70, top + 12), { col: c.s1, w: 12, bend: -6 }); tag('External forces', 560, 72, { bg: c.gold, ink }); }
    if (b === 0) tag('Plates move, rock folds', 200, 40, { size: 25 });
    if (b === 1) tag('Water, ice, wind and waves', 190, 40, { size: 25 });
    if (b === 2) tag('Both, all the time', 190, 40, { size: 26 });
  }
}
