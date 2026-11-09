// DriftNotJourneyScene - L02 s06. A strip of land, camp after camp a few km apart. Numbers are marked imagine.
// Beat 3 has a wet and a dry case: in the dry case the way across fails.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { alpha, mix, darken, pill, font, rr, clamp01, inOutSine, outBack, blob, mulberry32 } from 'simulations/base/kit/SimLook.js';
import { drawFigure, figureFor } from 'simulations/base/kit/SimFigure.js';
import { drawAnimal } from 'simulations/base/kit/SimAnimal.js';

const m = (idx) => [{ idx, dwellMs: null }];
const S_ASK = 0, S_DRIFT = 1, S_FOOD = 2, S_WET = 3;
const FY = 400, GEN = 1000, KM = 5;
const fmt = (n) => Math.round(n).toLocaleString('en-IN');
const RUN = 3.2;

export class DriftNotJourneyScene extends SimScene {
  static BEAT_STEP_MAP = [m(0), m(1), m(2), m(3)];
  static COLOR_MAP = GEO_COLOR_MAP;
  static NOTE_STAGE = -1;
  static DRAGGABLE = false;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A long strip of land. One camp, then camp after camp a few kilometres apart, with a counter that says imagine 5 kilometres a generation, 1,000 generations, 5,000 kilometres. Then deer move and people follow. Last, a choice of wet time, where grass and water let people cross, or dry time, where sand closes the way.';
  static CONTROLS = [{ type: 'segmented', tall: true, id: 'time', label: 'Climate', value: 'wet', options: [{ value: 'wet', label: 'Wet time: way open' }, { value: 'dry', label: 'Dry time: way closed' }] }];
  time = 'wet';

  isControlHidden(id) { return id === 'time' && this.stage !== S_WET; }
  getControlValue(id) { return id === 'time' ? this.time : super.getControlValue(id); }
  onControlChange(id, v) { if (!this._guard(id)) return; this.time = v; this.changed = this.clock; this.animateFor?.(1200); this.requestUiUpdate?.(); }
  enter() { this.time = 'wet'; this.changed = -9; this.requestUiUpdate?.(); }
  busy() { return this.stage === S_DRIFT ? this.age < RUN + 0.5 : this.age < 1.4; }

  _land(ctx, c, dry, off = 0) {
    const sky = mix(c.skyDay ?? c.bgSurface, c.bgSurface, 0.35), sand = mix(c.strata1, c.strata2, 0.2), grass = mix(c.elevLow, c.strata1, 0.25);
    const g = mix(grass, sand, dry);
    ctx.fillStyle = sky; ctx.fillRect(0, 0, 680, 520);
    ctx.fillStyle = mix(g, sky, 0.55); blob(ctx, 340 - (off * 0.3) % 340, FY - 44, 560, 62, 9, 0.2, 2); ctx.fill();
    ctx.fillStyle = g; ctx.fillRect(0, FY - 8, 680, 130);
    ctx.fillStyle = darken(g, 0.1); ctx.fillRect(0, FY + 62, 680, 60);
    const rnd = mulberry32(5);
    ctx.strokeStyle = alpha(darken(g, 0.35), 0.6); ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (let i = 0; i < 34; i++) {
      const x = ((rnd() * 1500 - off) % 700 + 700) % 700 - 10, y = FY + 10 + rnd() * 100;
      if (rnd() < dry * 1.1) continue;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 4, y - 12); ctx.moveTo(x, y); ctx.lineTo(x + 5, y - 11); ctx.stroke();
    }
  }

  _camp(ctx, c, x, s, fire) {
    const y = FY + 8, col = mix(c.strata3, c.strata1, 0.3);
    ctx.beginPath(); ctx.moveTo(x - 62 * s, y); ctx.quadraticCurveTo(x - 50 * s, y - 92 * s, x, y - 100 * s); ctx.quadraticCurveTo(x + 50 * s, y - 92 * s, x + 62 * s, y); ctx.closePath();
    ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = darken(col, 0.45); ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 18 * s, y); ctx.lineTo(x, y - 52 * s); ctx.lineTo(x + 18 * s, y); ctx.closePath(); ctx.fillStyle = darken(col, 0.6); ctx.fill();
    if (fire) {
      const fx = x + 96 * s;
      ctx.fillStyle = c.flame; ctx.beginPath(); ctx.moveTo(fx - 16 * s, y + 4); ctx.quadraticCurveTo(fx - 12 * s, y - 24 * s, fx, y - 40 * s); ctx.quadraticCurveTo(fx + 12 * s, y - 24 * s, fx + 16 * s, y + 4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = c.gold; ctx.beginPath(); ctx.ellipse(fx, y - 8 * s, 7 * s, 13 * s, 0, 0, 6.3); ctx.fill();
    }
  }

  _person(ctx, c, x, h, i, pose = 'stand', facing = 1, phase = 0) {
    const fig = figureFor(this, { role: 'adult', pose: pose === 'walk' ? { name: 'walk', phase } : pose, x, y: FY + 12, height: h, facing, i, look: { outfit: 'drape', top: c.strata3, bottom: c.strata2, shoeStyle: 'none' } });
    drawFigure(ctx, c, fig, fig.look);
  }

  _count(ctx, c, k) {
    rr(ctx, 16, 14, 648, 130, 18); ctx.fillStyle = alpha(c.bgSurface, 0.92); ctx.fill(); ctx.strokeStyle = c.stroke; ctx.lineWidth = 3; ctx.stroke();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = c.label;
    ctx.font = font(c, 700, 26, true); ctx.fillText(`Imagine ${KM} km each generation`, 340, 42);
    ctx.font = font(c, 700, 46, true);
    ctx.fillText(fmt(k * GEN), 170, 92); ctx.fillText(`${fmt(k * GEN * KM)} km`, 500, 92);
    ctx.font = font(c, 800, 25); ctx.fillStyle = c.labelMuted; ctx.fillText('generations', 170, 126); ctx.fillText('walked in small moves', 500, 126);
  }

  draw(ctx, c) {
    const st = this.stage;
    if (st === S_ASK) {
      this._land(ctx, c, 0);
      this._camp(ctx, c, 300, 1.3, true);
      this._person(ctx, c, 150, 180, 3); this._person(ctx, c, 540, 170, 5, 'point', -1);
      pill(ctx, c, 'Why did they leave?', 340, 90, { size: 36, bg: c.bgSurface, ink: c.label, display: true });
      return;
    }
    if (st === S_DRIFT) {
      const k = inOutSine(clamp01(this.age / RUN)), off = k * 1000;
      this._land(ctx, c, 0, off);
      for (let i = 0; i < 9; i++) {
        const x = 120 + i * 170 - off;
        if (x < -120 || x > 800) continue;
        this._camp(ctx, c, x, 0.9, true);
      }
      const walk = this.age < RUN;
      this._person(ctx, c, 340, 150, 3, walk ? 'walk' : 'stand', 1, off / 120);
      this._count(ctx, c, k);
      return;
    }
    if (st === S_FOOD) {
      const d = inOutSine(clamp01(this.age / 1.4)) * 130;
      this._land(ctx, c, 0, d);
      const pop = outBack(clamp01(this.age / 0.4));
      drawAnimal(ctx, c, { x: 430 + d * 0.5, y: FY + 18, length: 150, facing: 1, kind: 'deer', pose: this.age < 1.4 ? 'walk' : 'stand', phase: (d / 60) % 1 }, { t: 0 });
      drawAnimal(ctx, c, { x: 590 + d * 0.3, y: FY + 30, length: 130, facing: 1, kind: 'deer', pose: 'graze' }, { t: 0 });
      this._person(ctx, c, 170 + d * 0.6, 180, 3, this.age < 1.4 ? 'walk' : 'stand', 1, d / 60);
      this._person(ctx, c, 70 + d * 0.6, 165, 5, this.age < 1.4 ? 'walk' : 'stand', 1, d / 50 + 0.3);
      ctx.save(); ctx.translate(340, 90); ctx.scale(pop, pop);
      pill(ctx, c, 'food moves, people follow', 0, 0, { size: 32, bg: c.bgSurface, ink: c.label, display: true });
      ctx.restore();
      return;
    }
    const dry = this.time === 'dry' ? 1 : 0;
    const sw = clamp01((this.clock - this.changed) / 0.7), v = dry ? sw : 1 - sw;
    this._land(ctx, c, v);
    // Water in the wet case: a pool that dries out as the sand comes back.
    const pw = (1 - v) * 150;
    if (pw > 4) { ctx.beginPath(); ctx.ellipse(370, FY + 46, pw, pw * 0.2, 0, 0, 6.3); ctx.fillStyle = c.seaShallow; ctx.fill(); ctx.strokeStyle = darken(c.seaShallow, 0.3); ctx.lineWidth = 3; ctx.stroke(); }
    if (dry) {
      this._person(ctx, c, 130, 175, 3, 'stand', 1); this._person(ctx, c, 60, 160, 5, 'stand', 1);
      pill(ctx, c, 'no water, no grass', 400, 240, { size: 30, bg: c.bgSurface, ink: c.label, display: true });
      pill(ctx, c, 'way closed', 400, 90, { size: 36, bg: c.bad, display: true });
    } else {
      drawAnimal(ctx, c, { x: 560, y: FY + 18, length: 130, facing: 1, kind: 'deer', pose: 'graze' }, { t: 0 });
      this._person(ctx, c, 300, 175, 3, 'walk', 1, 0.2); this._person(ctx, c, 190, 160, 5, 'walk', 1, 0.6);
      pill(ctx, c, 'way open', 340, 90, { size: 36, bg: c.good, display: true });
    }
  }
}
