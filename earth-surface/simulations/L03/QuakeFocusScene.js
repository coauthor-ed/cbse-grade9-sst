// QuakeFocusScene - a cut through a fault. Rock locks, then one side slips. The focus is where it breaks;
// the epicentre is straight above; waves spread from the focus. Step up compares magnitudes: each circle's
// AREA is the energy, so 32 times more energy is drawn as 32 times the area.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, outBack, clamp01, drawBackdrop, drawCard, star } from 'simulations/base/kit/SimLook.js';
import { EARTH_COLOR_MAP, earthColour, drawRock, drawEarthSky, drawGrass, drawFlowArrow } from '../shared/EarthArt.js';

const MAP = [[{ idx: 0 }], [{ idx: 1 }], [{ idx: 2 }], [{ idx: 3 }]];
const GROUND = 118, FX = 330, FOCUS = { x: 372, y: 330 }, EPI = { x: 372, y: GROUND };
const faultX = (y) => FX + (y - GROUND) * 0.2;
const MAGS = [{ m: 5, e: '1' }, { m: 6, e: 'about 32 times' }, { m: 7, e: 'about 1000 times' }];

export class QuakeFocusScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static COLOR_MAP = EARTH_COLOR_MAP;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A cut through the ground at a fault. Rock locks, then slips. The focus is underground where the rock breaks and the epicentre is on the surface straight above it. Waves spread from the focus.';
  static CONTROLS = [{ type: 'button', id: 'step', label: 'Step up' }];

  constructor(container, config) { super(container, config); this._s = 0; this._m = 0; this._found = false; }
  enter(stage) { this._s = stage; this._m = 0; this.requestUiUpdate?.(); }
  isControlHidden(id) { return id === 'step' && this._s !== 2; }
  onControlChange(id) {
    if (id !== 'step') return;
    this._m = (this._m + 1) % MAGS.length;
    if (this._m === 2 && !this._found) { this._found = true; this.celebrate(340, 300, 12, { key: 'mag' }); }
    this.animateFor?.(500); this.requestUiUpdate?.();
  }
  busy() { return this.age < 1.2; }

  _ground(ctx, c, slip) {
    const lb = [[-10, GROUND], [faultX(GROUND), GROUND], [faultX(540), 540], [-10, 540]];
    const rb = [[faultX(GROUND), GROUND], [690, GROUND], [690, 540], [faultX(540), 540]];
    ctx.save();
    ctx.translate(0, -slip);
    drawRock(ctx, c, lb, { seed: 3, bands: ['strata2', 'strata3', 'strata5'], bandH: 46, warp: 2, cracks: 4, grain: false });
    drawGrass(ctx, c, 0, GROUND, FX - 10, GROUND, { seed: 3, n: 28 });
    ctx.restore();
    ctx.save();
    ctx.translate(0, slip);
    drawRock(ctx, c, rb, { seed: 3, bands: ['strata2', 'strata3', 'strata5'], bandH: 46, warp: 2, cracks: 4, grain: false });
    drawGrass(ctx, c, FX + 10, GROUND, 680, GROUND, { seed: 5, n: 28 });
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = earthColour(c, 'ink'); ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(faultX(GROUND - slip), GROUND - slip); ctx.lineTo(faultX(530), 530); ctx.stroke();
    ctx.restore();
  }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'plain');
    drawEarthSky(ctx, c, 0, 0, 680, 140);
    const s = this._s, ink = earthColour(c, 'ink'), snow = earthColour(c, 'snow');
    const tag = (t, x, y, o = {}) => pill(ctx, c, t, x, y, { bg: ink, ink: snow, size: 26, display: true, ...o });
    if (s === 2) {
      this._ground(ctx, c, 14);
      ctx.save();
      ctx.strokeStyle = snow; ctx.lineWidth = 4;
      for (const r of [50, 100, 150]) { ctx.beginPath(); ctx.arc(FOCUS.x, FOCUS.y, r, 0, 7); ctx.stroke(); }
      ctx.restore();
      const k = outBack(clamp01(this.age / 0.5));
      const e = [1, 32, 1000][this._m], r = 5 * Math.sqrt(e) * k;
      ctx.save(); ctx.globalAlpha = 0.82; ctx.fillStyle = c.magma; ctx.beginPath(); ctx.arc(190, 300, Math.max(3, r), 0, 7); ctx.fill(); ctx.restore();
      tag('Waves spread out', 460, 494, { bg: snow, ink, size: 25 });
      tag('Area shows energy', 136, 494, { size: 24 });
      drawCard(ctx, c, 8, 8, 664, 92);
      tag(`Magnitude ${MAGS[this._m].m}`, 112, 54, { size: 28 });
      tag(this._m ? `${MAGS[this._m].e} the energy of 5` : 'Press Step up', 444, 54, { bg: c.gold, ink, size: 27 });
      return;
    }
    const slip = s === 0 ? 14 * outBack(clamp01((this.age - 0.3) / 0.5)) : 14;
    this._ground(ctx, c, slip);
    if (s === 0) {
      drawFlowArrow(ctx, c, 110, 260, 110, 170, { col: c.warning, w: 13 });
      drawFlowArrow(ctx, c, 560, 170, 560, 260, { col: c.warning, w: 13 });
      tag('Fault', 330, 40, { bg: c.gold, ink });
      tag('Rock locks, strain builds, rock slips', 340, 460, { size: 25 });
    }
    if (s === 1) {
      ctx.save();
      ctx.strokeStyle = snow; ctx.lineWidth = 4; ctx.setLineDash([12, 10]);
      ctx.beginPath(); ctx.moveTo(FOCUS.x, FOCUS.y); ctx.lineTo(EPI.x, EPI.y); ctx.stroke();
      ctx.restore();
      ctx.save(); ctx.fillStyle = c.magma; ctx.strokeStyle = ink; ctx.lineWidth = 3; star(ctx, FOCUS.x, FOCUS.y, 26); ctx.fill(); ctx.stroke();
      ctx.fillStyle = c.gold; ctx.beginPath(); ctx.arc(EPI.x, EPI.y + 14, 13, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore();
      tag('Epicentre: on the surface', 372, 44, { bg: c.gold, ink });
      tag('Focus: where rock breaks', 372, 400);
    }
    if (s === 3) {
      drawCard(ctx, c, 40, 24, 600, 74);
      tag('Which day? Which hour? Not known', 340, 60, { size: 26 });
      tag('Likely places, over many years: known', 340, 460, { bg: c.gold, ink, size: 25 });
    }
  }
}
