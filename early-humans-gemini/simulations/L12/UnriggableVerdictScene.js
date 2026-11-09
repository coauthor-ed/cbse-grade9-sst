// UnriggableVerdictScene - blk-l12-s01b, 4 beats. The file keeps its old name; the old idea of a crack nobody controls is
// gone. A big shoulder blade and a diviner. Beat 0: the question. Beat 1: rows of hollows are cut. Beat 2: a hot rod, and
// the crack runs from the hollow. Beat 3: the reader, with "one explanation" on screen. Canvas: the person is SimFigure.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { clamp, darken, mix, pill, outBack } from 'simulations/base/kit/SimLook.js';
import { figureFor, drawFigure } from 'simulations/base/kit/SimFigure.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { drawBone, drawHollow, HOLLOWS, traceLine, ground } from './ChinaDraw.js';

const W = 680, H = 520;
const MAP = [0, 1, 2, 3].map((idx) => [{ idx, dwellMs: null }]);
const BX = 452, BY = 238, BS = 0.98;
const FIRST = 3;      // the hollow the rod touches
const QUESTIONS = ['Attack now?', 'When to plant?', 'Will the child recover?'];
const hx = (i) => BX + HOLLOWS[i][0] * BS, hy = (i) => BY + HOLLOWS[i][1] * BS;

export class UnriggableVerdictScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static COLOR_MAP = GEO_COLOR_MAP;
  static ARIA_LABEL = 'A large ox shoulder blade and a diviner. A king has a question. The diviner cuts rows of small hollows into the bone. A hot rod makes a crack run from one hollow. One explanation is that such a sign could make a hard decision easier to accept.';

  busy() { return this.age < 2; }

  _crack(ctx, c, s, k) {
    const x = hx(FIRST) + 15 * BS, y = hy(FIRST) + 2 * BS;
    const main = [[x, y], [x + 3, y + 22], [x - 2, y + 44], [x + 4, y + 70]], side = [[x + 1, y + 16], [x + 22, y + 10], [x + 36, y + 18], [x + 56, y + 8]];
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const [pts, u] of [[main, k * 1.6], [side, k * 1.6 - 0.6]]) {
      traceLine(ctx, pts, u); ctx.strokeStyle = mix(c.bgSurface, c.strata1, 0.6); ctx.lineWidth = s === 3 ? 11 : 9; ctx.stroke();
      traceLine(ctx, pts, u); ctx.strokeStyle = darken(c.strata6, 0.2); ctx.lineWidth = s === 3 ? 6 : 5; ctx.stroke();
    }
    ctx.restore();
  }

  draw(ctx, c) {
    const s = this.stage ?? 0, t = this.age;
    ctx.fillStyle = mix(c.bgSurface, c.strata3, 0.1); ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = mix(c.bgSurface, c.strata2, 0.2); ctx.fillRect(0, 0, W, 360);
    ground(ctx, c, 440);
    drawBone(ctx, c, BX, BY, BS);
    HOLLOWS.forEach((_, i) => {
      const k = s === 0 ? 0 : s === 1 ? outBack(clamp((t - 0.1 - i * 0.12) / 0.32, 0, 1)) : 1;
      if (s >= 2 && i !== FIRST) ctx.globalAlpha = 0.5;
      drawHollow(ctx, c, hx(i), hy(i), BS, k, s === 2 ? clamp(1 - (t - 0.9) / 1.2, 0, 1) * (i === FIRST ? 1 : 0) : 0);
      ctx.globalAlpha = 1;
    });
    if (s >= 2) this._crack(ctx, c, s, s === 2 ? clamp((t - 0.5) / 0.8, 0, 1) : 1);
    const py = 478, h = 300, hand = { x: 322, y: 296 };
    let spec;
    if (s === 0 || s === 3) spec = figureFor(this, { role: 'elder', pose: 'point', x: 164, y: py, height: h, facing: 1 });
    else spec = figureFor(this, { role: 'worker', pose: 'stand', x: 196, y: py, height: h, facing: 1, hands: [hand, { x: hand.x - 8, y: hand.y + 4 }] });
    if (s === 1) { // the cutting tool, from the hand to the bone
      ctx.strokeStyle = darken(c.strata5, 0.2); ctx.lineWidth = 9; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(hand.x, hand.y); ctx.lineTo(hx(4) - 4, hy(4) + 2); ctx.stroke();
    }
    drawFigure(ctx, c, spec, spec.look);
    if (s === 2) { // the hot rod reaches from the hand to the hollow
      const ex = hx(FIRST) + 12, ey = hy(FIRST) + 2;
      ctx.lineCap = 'round'; ctx.strokeStyle = darken(c.strata6, 0.1); ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(hand.x, hand.y); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.strokeStyle = c.flame; ctx.lineWidth = 11; ctx.beginPath(); ctx.moveTo(ex - (ex - hand.x) * 0.2, ey - (ey - hand.y) * 0.2); ctx.lineTo(ex, ey); ctx.stroke();
    }
    const big = { size: 27, display: true }, TX = 186, TY = 40;
    if (s === 0) {
      pill(ctx, c, 'The king has a question', TX, TY, { ...big, bg: c.bgSurface, ink: c.label });
      QUESTIONS.forEach((q, i) => pill(ctx, c, q, 452, 220 + i * 66, { size: 28, display: true, bg: c.s2, scale: outBack(clamp((t - 0.2 - i * 0.22) / 0.4, 0, 1)) }));
    }
    if (s === 1) pill(ctx, c, 'Rows of hollows, cut first', TX, TY, { ...big, bg: c.bgSurface, ink: c.label });
    if (s === 2) pill(ctx, c, 'The hollows guide the crack', TX, TY, { ...big, bg: c.bgSurface, ink: c.label });
    if (s === 3) {
      pill(ctx, c, 'Reading the crack', TX, TY, { ...big, bg: c.bgSurface, ink: c.label });
      pill(ctx, c, 'One explanation', 452, 484, { size: 28, display: true, bg: c.warning });
    }
  }
}
