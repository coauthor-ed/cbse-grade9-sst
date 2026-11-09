// BoothMapScene - L01 s01. b0 a full polling station deep in the Gir forest, one voter walking to it.
// b1 the same map fills with stations: each dot stands for 1,000 of them, so 1,000 dots is the book's
// "over 10 lakh". India is drawn only from the Survey of India layer, with its credit.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, mix, rr, drawBackdrop, mulberry32, clamp01 } from 'simulations/base/kit/SimLook.js';
import { figureFor, drawFigure } from 'simulations/base/kit/SimFigure.js';
import { loadMap, makeView, drawIndia } from 'simulations/base/kit/GeoMap.js';
import { panel } from '../shared/SstArt.js';
import { drawCivic } from '../shared/CivicArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const EXT = [[68, 6.5], [97.5, 37.2]];
const GIR = [70.8, 21.1];
const DOTS = 1000;
const P = { x: 8, y: 266, w: 280, h: 184 };

export class BoothMapScene extends SimScene {
  static HEIGHT = 456;   // on a phone the host caps height: this keeps 28 px labels near 14 px
  static BEAT_STEP_MAP = [m(0), m(1)];
  static NOTE_STAGE = -1;
  static ARIA_LABEL = 'A map of India. A pin marks the Gir forest in Gujarat, where a card shows a polling station among trees and one voter walking to it. On the second step, one thousand dots spread over India. Each dot stands for one thousand polling stations, so the map shows over ten lakh stations.';

  async setup() {
    this.map = await loadMap(['india']);
    await super.setup();
    this.view = await makeView(this._ctx ?? this.ctx ?? this._canvas?.getContext('2d'), { kind: 'mercator', extent: EXT, box: { x: 204, y: 2, w: 472, h: 450 } });
    this.dots = this._scatter();
    this.requestDraw?.(); this.animateFor?.(400);
  }

  // A thousand seeded points inside India, in the projected view.
  _scatter() {
    const v = this.view, out = [], r = mulberry32(19);
    let test = null;
    try {
      const d = v.path.context(null)(this.map.india);
      const pc = document.createElement('canvas').getContext('2d'), p2 = new Path2D(d);
      test = (x, y) => pc.isPointInPath(p2, x, y);
    } catch (_) { test = null; }
    for (let i = 0; i < 40000 && out.length < DOTS; i++) {
      const x = 204 + r() * 472, y = 2 + r() * 450;
      if (test && !test(x, y)) continue;
      if (x < P.x + P.w + 8 && y > P.y - 8) continue;
      out.push({ x, y, at: r() });
    }
    return out;
  }

  busy() { return this.age < (this.stage === 0 ? 2.6 : 2.4); }

  _map(ctx, c) {
    drawBackdrop(ctx, c, 'dots');
    if (!this.view) return;
    drawIndia(ctx, this.view, c, this.map.india, { fill: mix(c.gold, c.bgSurface, 0.62), stroke: mix(c.gold, c.label, 0.45), lineWidth: 2.4, credit: false });
    // Two lines: the Gir card fills the lower left, and one line of readable size would run under it.
    pill(ctx, c, 'Boundary of India:', 674, 398, { align: 'right', size: 26, bg: c.bgSurface, ink: c.labelMuted });
    pill(ctx, c, 'Survey of India', 674, 436, { align: 'right', size: 26, bg: c.bgSurface, ink: c.labelMuted });
  }

  _card(ctx, c, walk) {
    const q = this.view?.at(GIR);
    if (q) {
      ctx.strokeStyle = c.label; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(q[0] - 26, P.y + 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(q[0], q[1], 11, 0, 7); ctx.fillStyle = c.bad; ctx.fill(); ctx.lineWidth = 3.5; ctx.strokeStyle = c.bgSurface; ctx.stroke();
    }
    panel(ctx, c, P.x, P.y, P.w, P.h, { fill: mix(c.s3, c.bgSurface, 0.6) });
    const gy = P.y + P.h - 22;
    ctx.save(); rrClip(ctx, P);
    ctx.fillStyle = mix(c.gold, c.bgSurface, 0.45); ctx.fillRect(P.x, gy - 14, P.w, 40);
    drawCivic(ctx, c, 'tree', P.x + 40, gy - 8, { h: 156 });
    drawCivic(ctx, c, 'tree', P.x + 262, gy - 8, { h: 140 });
    drawCivic(ctx, c, 'booth', P.x + 190, gy + 2, { h: 124 });
    const fig = figureFor(this, { role: 'elder', pose: walk < 1 ? { name: 'walk', phase: (walk * 3) % 1 } : 'stand', x: P.x + 42 + walk * 66, y: gy + 8, height: 104, facing: 1, i: 2, mood: 'smile' });
    drawFigure(ctx, c, fig, fig.look);
    ctx.restore();
  }

  draw(ctx, c) {
    this._map(ctx, c);
    if (this.stage === 0) {
      const walk = 1 - (1 - clamp01(this.age / 2.4)) ** 2;
      this._card(ctx, c, walk);
      pill(ctx, c, 'Gir forest, Gujarat', 158, 32, { size: 28, bg: c.bgSurface, ink: c.label, display: true });
      pill(ctx, c, '1 registered voter', 148, 80, { size: 28, bg: mix(c.gold, c.bgSurface, 0.4), ink: c.label, display: true });
      return;
    }
    this._card(ctx, c, 1);
    for (const d of this.dots ?? []) {
      const k = clamp01((this.age - d.at * 1.8) / 0.3);
      if (k <= 0) continue;
      ctx.beginPath(); ctx.arc(d.x, d.y, 3.1 * k, 0, 7); ctx.fillStyle = mix(c.s1, c.label, 0.45); ctx.fill();
    }
    pill(ctx, c, 'over 10 lakh', 118, 42, { size: 40, bg: mix(c.gold, c.bgSurface, 0.4), ink: c.label, display: true });
    pill(ctx, c, 'polling stations', 118, 98, { size: 28, bg: c.bgSurface, ink: c.label });
    pill(ctx, c, '1 dot = 1,000', 106, 148, { size: 28, bg: mix(c.s1, c.label, 0.45), display: false });
  }
}

function rrClip(ctx, p) { rr(ctx, p.x + 2, p.y + 2, p.w - 4, p.h - 4, 16); ctx.clip(); }
