// RumorSpreadScene - blk-l07-s01. One false message on one phone, then real growth: each phone
// forwards to 20 more, so 1, 21, 421, 8,421 phones. The learner presses Forward. 1 dot = 20 phones.
// The message is invented and about no real event. Beat 1 always shows the full spread.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawBackdrop, mulberry32, wrapText, font } from 'simulations/base/kit/SimLook.js';
import { drawCivic } from '../shared/CivicArt.js';
import { tones, tile, say, folk, tag, mix, rr, ellipse, clamp01, pop } from '../L06/CivicWorld.js';

const S_SPREAD = 0, S_VOTERS = 1;
const MAP = [S_SPREAD, S_VOTERS].map((idx) => [{ idx, dwellMs: null }]);
const BOX = { x: 236, y: 66, w: 430, h: 222 };
const TOTALS = [1, 21, 421, 8421];
const DOTS = (() => {                         // gen 1: 1 dot, gen 2: 20 dots, gen 3: 400 dots; each near its parent
  const r = mulberry32(11), out = [{ x: 0.2, y: 0.5, g: 0 }];
  const near = (p, s) => ({ x: Math.max(0.02, Math.min(0.98, p.x + (r() - 0.45) * s)), y: Math.max(0.04, Math.min(0.96, p.y + (r() - 0.5) * s)) });
  const a = { ...near(out[0], 0.1), g: 1 }; out.push(a);
  const two = []; for (let i = 0; i < 20; i++) two.push({ ...near(a, 0.8), g: 2 });
  out.push(...two);
  for (let i = 0; i < 400; i++) out.push({ x: 0.02 + r() * 0.96, y: 0.04 + r() * 0.92, g: 3 });
  return out;
})();

export class RumorSpreadScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static HEIGHT = 456;   // shorter than the 520 default: on a phone the host caps height, so this keeps labels at 14 px
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A phone with one false, unchecked message, beside a map of one district. Each press of Forward sends it from each phone to 20 more, and dots fill the district: 1, then 21, then 421, then 8,421 phones in this example. On the second beat a row of people stands under the full district: most of these readers vote.';
  static CONTROLS = [{ type: 'button', id: 'forward', label: 'Forward it' }, { type: 'button', id: 'again', label: 'Start again' }];

  constructor(container, config) { super(container, config); this._gen = 0; this._t0 = -9; }

  enter(stage) { this._gen = stage === S_VOTERS ? 3 : 0; this._t0 = -9; }
  isControlHidden(id) {
    if (this.stage === S_VOTERS) return true;
    return id === 'forward' ? this._gen >= 3 : this._gen < 3;
  }
  onControlChange(id) {
    if (!this._guard(id)) return;
    if (id === 'forward') { this._gen = Math.min(3, this._gen + 1); this._t0 = this.clock; this.animateFor?.(1600); }
    else { this._gen = 0; this._t0 = -9; }
    this.requestUiUpdate?.();
  }
  busy() { return this.clock - this._t0 < 1.4; }

  draw(ctx, c) {
    const t = tones(c), a = this.clock - this._t0;
    drawBackdrop(ctx, c, 'dots');
    // the phone, the hero
    drawCivic(ctx, c, 'phone', 122, 448, { h: 400 });
    const mx = 122 - 96, my = 104;
    tile(ctx, c, mx, my, 192, 190, { fill: c.bgSurface, r: 14 });
    ctx.font = font(c, 800, 27); ctx.fillStyle = c.label;
    wrapText(ctx, 'Voting in the district has moved to a later date', mx + 12, my + 12, 172, { lineH: 34 });
    tag(ctx, c, 'Not checked', 122, 330, { bg: c.waste });
    // the district
    tile(ctx, c, BOX.x, BOX.y, BOX.w, BOX.h, { fill: t.ground, r: 18 });
    ctx.save(); rr(ctx, BOX.x + 3, BOX.y + 3, BOX.w - 6, BOX.h - 6, 16); ctx.clip();
    ctx.strokeStyle = t.road; ctx.lineWidth = 12; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(BOX.x, BOX.y + 190); ctx.bezierCurveTo(BOX.x + 130, BOX.y + 120, BOX.x + 260, BOX.y + 230, BOX.x + BOX.w, BOX.y + 90); ctx.stroke();
    ctx.strokeStyle = t.water; ctx.lineWidth = 16;
    ctx.beginPath(); ctx.moveTo(BOX.x + 300, BOX.y); ctx.bezierCurveTo(BOX.x + 260, BOX.y + 90, BOX.x + 360, BOX.y + 180, BOX.x + 310, BOX.y + BOX.h); ctx.stroke();
    for (const d of DOTS) {
      if (d.g > this._gen) continue;
      const fresh = d.g === this._gen && a < 1.4;
      const k = fresh ? clamp01((a - (d.x * 0.7)) / 0.3) : 1;
      if (k <= 0) continue;
      const big = d.g < 2;
      ctx.fillStyle = big ? c.accent : mix(c.accent, c.label, 0.2);
      ellipse(ctx, BOX.x + 6 + d.x * (BOX.w - 12), BOX.y + 6 + d.y * (BOX.h - 12), (big ? 10 : 5.5) * k, (big ? 10 : 5.5) * k); ctx.fill();
    }
    ctx.restore();
    const total = TOTALS[this._gen];
    say(ctx, c, 'In this example', BOX.x + BOX.w / 2, 14, { size: 26, display: false, col: c.labelMuted });
    say(ctx, c, total.toLocaleString('en-IN') + (total === 1 ? ' phone' : ' phones'), BOX.x + BOX.w / 2, 44, { size: 38 });
    if (this.stage === S_SPREAD) {
      say(ctx, c, 'Each phone forwards to 20 more', 450, 324, { size: 28, display: false });
      if (this._gen > 0) say(ctx, c, '1 dot = 20 phones', 450, 366, { size: 28, display: false, col: c.labelMuted });
      else say(ctx, c, 'One district, 7 in the morning', 450, 366, { size: 28, display: false, col: c.labelMuted });
    } else {
      const k = pop(this.age, 0.1);
      ctx.save(); ctx.globalAlpha *= Math.min(1, k);
      ['farmer', 'shopkeeper', 'student', 'adult', 'elder'].forEach((role, i) => folk(ctx, this, { role, x: 284 + i * 84, y: 452, height: 114, i: i + 1 }));
      ctx.restore();
      tag(ctx, c, 'Most readers are voters', 450, 312, { bg: c.accent });
    }
  }
}
