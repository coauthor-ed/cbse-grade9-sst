// CounterPressureScene - blk-l04-s01. A person in the open air with arrows at nine places on the
// body. Outside: the air's push. Inside: the body's push. Both: equal and opposite, so nothing is
// felt (book's Don't Miss Out). Canvas because the person is the kit's figure. No dial.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, drawShadow } from 'simulations/base/kit/SimLook.js';
import { solveFigure, drawFigure } from 'simulations/base/kit/SimFigure.js';

import { SKY_COLOR_MAP, drawSkyColumn, drawCloud, drawLand, drawHills, skyColour } from '../L03/AirDraw.js';
const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const FIG = { x: 340, y: 452, h: 318 };
const L = 56, GAP = 6;
const SAY = {
  outside: 'Air pushes in from all sides',
  inside: 'The body pushes out as hard',
  both: 'They cancel: you feel nothing',
};

export class CounterPressureScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static COLOR_MAP = SKY_COLOR_MAP;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'A person stands in the open. Arrows show the air pressing in from all sides, the body pressing out equally, and the two together cancelling.';
  static CONTROLS = [{ type: 'segmented', id: 'show', label: 'Show', value: 'outside', options: [{ value: 'outside', label: 'Outside' }, { value: 'inside', label: 'Inside' }, { value: 'both', label: 'Both' }] }];

  constructor(container, config) {
    super(container, config);
    this._show = 'outside';
    this._found = false;
  }

  enter(stage) { this._show = stage === 0 ? 'outside' : 'both'; this.requestUiUpdate?.(); }
  getControlValue(id) { return id === 'show' ? this._show : super.getControlValue(id); }

  onControlChange(id, v) {
    if (!this._guard(id)) return;
    this._show = String(v);
    if (this._show === 'both' && !this._found && this.stage === 1) { this._found = true; this.celebrate(FIG.x, 250, 12, { key: 'balance' }); }
    this.animateFor?.(700);
    this.requestUiUpdate?.();
  }

  _sites() {
    const sk = solveFigure({ x: FIG.x, y: FIG.y, height: FIG.h, facing: 0, pose: 'stand' });
    const sh = sk.joints.arms.map((a) => a.shoulder), hand = sk.anchors.hand, hip = sk.joints.hip, head = sk.joints.head;
    return [
      [head.x, head.y - head.r * 0.9, 0, -1],
      [head.x + head.r * 0.9, head.y - head.r * 0.2, 1, -0.25],
      [head.x - head.r * 0.9, head.y - head.r * 0.2, -1, -0.25],
      [sh[0].x, sh[0].y - 3, 0.75, -0.65],
      [sh[1].x, sh[1].y - 3, -0.75, -0.65],
      [hip.x + 30, hip.y - 30, 1, 0],
      [hip.x - 30, hip.y - 30, -1, 0],
      [hand[0].x + 4, hand[0].y + 4, 0.8, 0.5],
      [hand[1].x - 4, hand[1].y + 4, -0.8, 0.5],
    ].map(([x, y, a, b]) => { const n = Math.hypot(a, b); return { x, y, ux: a / n, uy: b / n }; });
  }

  _arrow(ctx, x0, y0, x1, y1, col, rim) {
    const a = Math.atan2(y1 - y0, x1 - x0), hl = 19, hw = 14;
    const bx = x1 - Math.cos(a) * hl, by = y1 - Math.sin(a) * hl;
    const path = () => { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(bx, by); };
    const head = () => { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(bx - Math.sin(a) * hw, by + Math.cos(a) * hw); ctx.lineTo(bx + Math.sin(a) * hw, by - Math.cos(a) * hw); ctx.closePath(); };
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = rim; ctx.fillStyle = rim; ctx.lineWidth = 14; path(); ctx.stroke(); ctx.lineWidth = 4; head(); ctx.stroke(); ctx.fill();
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 9; path(); ctx.stroke(); head(); ctx.fill();
  }

  draw(ctx, c) {
    drawSkyColumn(ctx, c, 0, 0, 680, 520, 0, 8);
    drawCloud(ctx, c, 110, 120, 0.9, { seed: 3 });
    drawCloud(ctx, c, 580, 90, 0.75, { seed: 6 });
    drawHills(ctx, c, 0, 450, 1, { w: 680, h: 90, seed: 4, far: true });
    drawLand(ctx, c, 0, 450, 1, { w: 680, h: 70, kind: 'plain', seed: 3 });
    drawShadow(ctx, c, FIG.x, FIG.y + 4, 60, 11, 0.7);
    const rim = skyColour(c, 'ink');
    drawFigure(ctx, c, { x: FIG.x, y: FIG.y, height: FIG.h, facing: 0, pose: 'stand' }, { top: c.s5, bottom: c.s6 ?? c.s5, skin: 1, hairStyle: 'short', mood: 'smile' });
    const s = this._show;
    for (const p of this._sites()) {
      if (s !== 'inside') this._arrow(ctx, p.x + p.ux * (2 * L + GAP), p.y + p.uy * (2 * L + GAP), p.x + p.ux * (L + GAP), p.y + p.uy * (L + GAP), c.s1, rim);
      if (s !== 'outside') this._arrow(ctx, p.x, p.y, p.x + p.ux * L, p.y + p.uy * L, c.s2, rim);
    }
    pill(ctx, c, SAY[s], 340, 492, { bg: s === 'both' ? c.accent : s === 'outside' ? c.s1 : c.s2, size: 32, display: true });
  }
}
