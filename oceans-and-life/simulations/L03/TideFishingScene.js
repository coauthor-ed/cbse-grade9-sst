// TideFishingScene - one fishing shore at two heights of tide. The sand rises to the right; the water line moves.
// High tide: many fish close in, a fisher knee-deep casting a net, another with a boat just off the shore.
// Low tide: the fish further out, wet sand bare, a fisher at the new edge and a person bending to gather there.
// A switch moves between them; each beat rests on its own tide. People have their hands on the work.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill } from 'simulations/base/kit/SimLook.js';
import { figureFor, drawFigure, groupLook } from 'simulations/base/kit/SimFigure.js';
import { canvasChips } from '../shared/SeaBits.js';
import { SEA_COLOR_MAP, seaColour, drawSeaColumn, drawWaveLine, drawCountryBoat, drawFish, drawCloud, drawSkyColumn, drawPalm } from '../shared/SeaArt.js';

// A wide stage: at 1280 the host card is wide and short, and a tall stage left a white column beside the figure.
const W = 580, H = 460;
const HIGH_Y = 270, LOW_Y = 330;
const SLOPE = 0.46;
const sandAt = (x) => HIGH_Y + (300 - x) * SLOPE;
const xAt = (y) => 300 - (y - HIGH_Y) / SLOPE;
const FISH_HIGH = [[232, 286, 0], [186, 304, 1], [148, 328, 2], [108, 300, 0], [76, 342, 2], [52, 296, 1]];
const FISH_LOW = [[24, 376, 0], [66, 352, 1], [112, 346, 2], [20, 346, 1], [48, 386, 0], [92, 372, 2]];

export class TideFishingScene extends SimScene {
  static WIDTH = W;
  static HEIGHT = H;
  static PORTRAIT_WIDTH = W;
  static PORTRAIT_HEIGHT = H;
  static COLOR_MAP = SEA_COLOR_MAP;
  static MIN_SCALE = 0.85;       // on a phone, below this the host gives the figure the full width
  static BEAT_STEP_MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
  static ARIA_LABEL = 'A fishing shore. At high tide many fish come close to the shore and a fisher casts a net in the shallows. At low tide the water moves away, wet sand is bare, and people work at the new edge of the water.';
  static CONTROLS = [];
  static DRAGGABLE = false;

  constructor(container, config) {
    super(container, config);
    this._t = 0; this._to = 0;
  }

  async setup() {
    await super.setup();
    this.ctl = canvasChips(this, 'Tide', [{ value: 'high', label: 'High tide' }, { value: 'low', label: 'Low tide' }], (v) => { this._to = v === 'low' ? 1 : 0; this.animateFor(1000); });
    this.ctl.set(this._to ? 'low' : 'high');
  }

  destroy() { this.ctl?.destroy(); super.destroy(); }

  enter(stage) { this._to = stage === 0 ? 0 : 1; this._t = this._to; this.ctl?.set(this._to ? 'low' : 'high'); }

  update(d) { const q = d / 0.7; this._t = this._to > this._t ? Math.min(this._to, this._t + q) : Math.max(this._to, this._t - q); }

  busy() { return this._t !== this._to; }

  draw(ctx, c) {
    const t = this._t, y = HIGH_Y + (LOW_Y - HIGH_Y) * t, ink = seaColour(c, 'ink'), edge = xAt(y);
    drawSkyColumn(ctx, c, 0, 0, W, y + 6, 0, 10);
    drawCloud(ctx, c, 110, 120, 0.7, { seed: 4 });
    drawSeaColumn(ctx, c, 0, y, 1, { w: W, h: H - y, bands: 3, wave: 2 });
    // Sand over the water's foot.
    ctx.fillStyle = seaColour(c, 'sand');
    ctx.beginPath(); ctx.moveTo(0, sandAt(0)); ctx.lineTo(W, sandAt(W)); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
    ctx.fillStyle = seaColour(c, 'sandDark');
    ctx.beginPath(); ctx.moveTo(0, sandAt(0) + 20); ctx.lineTo(W, sandAt(W) + 34); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
    // Wet sand left bare by the falling tide.
    if (t > 0.02) {
      ctx.strokeStyle = seaColour(c, 'rockMid'); ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.globalAlpha = 0.5 * t;
      ctx.beginPath(); ctx.moveTo(edge, sandAt(edge)); ctx.lineTo(xAt(HIGH_Y), HIGH_Y); ctx.stroke(); ctx.globalAlpha = 1;
    }
    drawPalm(ctx, c, W - 44, sandAt(W - 44) + 2, 0.86, { lean: -14 });
    const fish = FISH_HIGH.map((p, i) => [p[0] + (FISH_LOW[i][0] - p[0]) * t, p[1] + (FISH_LOW[i][1] - p[1]) * t, p[2]]);
    for (const [fx, fy, k] of fish) { if (fy > y + 12) drawFish(ctx, c, fx, fy, 0.72, { kind: k, flip: t > 0.5 }); }
    drawWaveLine(ctx, c, 0, y, 1, { w: edge, amp: 2 });
    if (t < 0.5) drawCountryBoat(ctx, c, 84, y + 1, 1, { nets: true });
    const net = (hx, hy, x1, y1) => {
      ctx.strokeStyle = ink; ctx.lineWidth = 2; ctx.setLineDash([3, 5]);
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.quadraticCurveTo((hx + x1) / 2, hy - 90, x1, y1); ctx.stroke(); ctx.setLineDash([]);
    };
    // The caster stands at the water's edge, in the shallows.
    const cx = edge + 26, cy = sandAt(cx) + 2;
    const s1 = figureFor(this, { role: 'worker', pose: { name: 'throw', u: 0.6 }, x: cx, y: cy, height: 132, i: 1, facing: -1 });
    const sk1 = drawFigure(ctx, c, s1, groupLook(c, 1, { role: 'worker' }));
    const hand = sk1?.anchors?.hand?.[0] ?? { x: cx - 30, y: cy - 90 };
    net(hand.x, hand.y, cx - 120, y + 6);
    if (t < 0.5) {
      const x2 = edge + 96, y2 = sandAt(x2) + 2;
      drawFigure(ctx, c, figureFor(this, { role: 'worker', pose: 'carry', x: x2, y: y2, height: 128, i: 2, facing: -1 }), groupLook(c, 2, { role: 'worker' }));
    } else {
      const x2 = edge + 96, y2 = sandAt(x2) + 2;
      drawFigure(ctx, c, figureFor(this, { role: 'worker', pose: { name: 'stand', crouch: 0.45, lean: 44 }, hands: [{ x: x2 - 30, y: y2 + 2 }, { x: x2 - 22, y: y2 }], x: x2, y: y2, height: 128, i: 2, facing: -1 }), groupLook(c, 2, { role: 'worker' }));
    }
    pill(ctx, c, t < 0.5 ? 'High tide: fish come close' : 'Low tide: wet sand is bare', W / 2, 36, { size: 26, bg: seaColour(c, 'cloud'), ink });
  }
}
