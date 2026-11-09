// RootsScene - L02 s06b. Two columns of tiles, no red crosses: what the old practices had, then what
// the Constitution added. Right-hand tiles arrive one a beat, so nothing is shown before it is said.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, mix, clamp01, drawBackdrop } from 'simulations/base/kit/SimLook.js';
import { panel, person } from '../shared/SstArt.js';
import { drawCivic } from '../shared/CivicArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const SAMGHA = 'voting in the Sa\u1E41gha';
const H = 120, Y = [60, 188, 316];

export class RootsScene extends SimScene {
  static HEIGHT = 456;   // on a phone the host caps height: this keeps 28 px labels near 14 px
  static BEAT_STEP_MAP = [m(0), m(1), m(2)];
  static NOTE_STAGE = -1;
  static ARIA_LABEL = 'Two columns of tiles. The left, old roots: consultation, discussion, and voting in the Samgha. The right, added later, arriving one at a time: every adult votes, written Fundamental Rights, and courts that protect them.';

  busy() { return this.age < 0.7; }

  _tile(ctx, c, x, y, tone, text, fn, on = 1) {
    ctx.save(); ctx.globalAlpha *= on;
    panel(ctx, c, x, y + (1 - on) * 16, 322, H, { fill: mix(c[tone], c.bgSurface, 0.8) });
    fn(x, y + (1 - on) * 16);
    pill(ctx, c, text, x + 161, y + 100 + (1 - on) * 16, { size: 28, bg: c.bgSurface, ink: c.label, display: !/\u1E41/.test(text) });
    ctx.restore();
  }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'dots');
    pill(ctx, c, 'Old roots', 173, 30, { size: 32, bg: mix(c.gold, c.bgSurface, 0.4), ink: c.label, display: true });
    const fy = (y) => y + 112;
    const P = (x, y, n, role) => { for (let i = 0; i < n; i++) person(ctx, this, { role: i % 2 ? role : 'adult', x: x + i * 54, y, height: 102, i: i + 2, facing: i < n / 2 ? 1 : -1 }); };
    this._tile(ctx, c, 12, Y[0], 's2', 'consultation', (x, y) => P(x + 53, fy(y), 5, 'elder'));
    this._tile(ctx, c, 12, Y[1], 's8', 'discussion', (x, y) => P(x + 53, fy(y), 5, 'farmer'));
    this._tile(ctx, c, 12, Y[2], 's3', SAMGHA, (x, y) => { for (let i = 0; i < 5; i++) person(ctx, this, { role: 'adult', x: x + 53 + i * 54, y: fy(y), height: 96, i: i + 1, pose: 'reach-up', look: { outfit: 'drape', top: 's8', bottom: 's8', hairStyle: 'crop' } }); });
    // Dashed places for what comes next, so the right half is not empty and says nothing yet.
    const ghost = (y) => { ctx.save(); ctx.strokeStyle = c.labelMuted; ctx.lineWidth = 3; ctx.setLineDash([12, 10]); ctx.beginPath(); ctx.roundRect(346, y, 322, H, 16); ctx.stroke(); ctx.restore(); };
    Y.slice(this.stage === 0 ? 0 : this.stage === 1 ? 1 : 3).forEach(ghost);
    if (this.stage < 1) { pill(ctx, c, '?', 507, 30, { size: 32, bg: c.bgSurface, ink: c.labelMuted, display: true }); return; }
    pill(ctx, c, 'Added later', 507, 30, { size: 32, bg: mix(c.s1, c.bgSurface, 0.5), ink: c.label, display: true });
    const a = clamp01(this.age / 0.5), on1 = this.stage === 1 ? a : 1;
    this._tile(ctx, c, 346, Y[0], 's1', 'every adult votes', (x, y) => { drawCivic(ctx, c, 'booth', x + 62, fy(y) - 8, { h: 88 }); for (let i = 0; i < 4; i++) person(ctx, this, { role: ['elder', 'adult', 'farmer', 'student'][i], x: x + 136 + i * 52, y: fy(y), height: 102, i: i + 1, facing: -1 }); }, on1);
    if (this.stage < 2) return;
    this._tile(ctx, c, 346, Y[1], 's5', 'written rights', (x, y) => drawCivic(ctx, c, 'book', x + 161, fy(y) - 16, { h: 88 }), a);
    this._tile(ctx, c, 346, Y[2], 's7', 'courts protect them', (x, y) => drawCivic(ctx, c, 'court', x + 161, fy(y) - 14, { h: 88 }), clamp01((this.age - 0.25) / 0.5));
  }
}
