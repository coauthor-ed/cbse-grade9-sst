// OneScriptTwoLanguagesScene - blk-l09-s05, 4 beats. Two scribes, a Sumerian and an Akkadian. Beat 0: the new power, 2334 BCE.
// Beat 1: one tablet with the sign AN between them; each says his own word for it: "an" and "shamu", both meaning sky.
// Beat 2: cities joined under one family. Beat 3: the same tablet carrying a story. Canvas: the scribes come from SimFigure.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { clamp, darken, mix, pill, rr } from 'simulations/base/kit/SimLook.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { figureFor, drawFigure } from 'simulations/base/kit/SimFigure.js';
import { drawIcon } from 'simulations/base/kit/SimIcons.js';

const W = 680, H = 520, FLOOR = 452;
const MAP = [0, 1, 2, 3].map((idx) => [{ idx, dwellMs: null }]);

function wedge(ctx, x, y, a, len, h, col) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.beginPath();
  ctx.moveTo(0, -h / 2); ctx.lineTo(h * 0.85, -h * 0.16); ctx.lineTo(len, 0); ctx.lineTo(h * 0.85, h * 0.16); ctx.lineTo(0, h / 2); ctx.closePath();
  ctx.fillStyle = col; ctx.fill(); ctx.restore();
}

export class OneScriptTwoLanguagesScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static COLOR_MAP = GEO_COLOR_MAP;
  static ARIA_LABEL = 'Two scribes stand either side of one clay tablet. One reads the sign as an, the other as shamu, and both mean sky. Then cities joined under one family, and a tablet with a story.';

  busy() { return this.age < 0.9; }

  draw(ctx, c) {
    const s = this.stage ?? 0, k = clamp(this.age / 0.6, 0, 1);
    ctx.fillStyle = mix(c.bgSurface, c.gold, 0.1); ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = mix(c.gold, c.bgSurface, 0.55); ctx.fillRect(0, FLOOR, W, H - FLOOR);
    ctx.fillStyle = darken(c.gold, 0.2); ctx.fillRect(0, FLOOR - 2, W, 4);
    if (s === 2) { this._cities(ctx, c, k); return; }
    const left = figureFor(this, { role: 'adult', pose: s === 1 ? 'point' : 'stand', x: 92, y: FLOOR + 22, height: 250, facing: 1, i: 1 });
    const right = figureFor(this, { role: 'adult', pose: s === 1 ? 'point' : 'stand', x: 588, y: FLOOR + 22, height: 250, facing: -1, i: 2 });
    drawFigure(ctx, c, left, left.look); drawFigure(ctx, c, right, right.look);
    pill(ctx, c, 'Sumerian', 96, 486, { size: 26, bg: c.s2, display: true });
    pill(ctx, c, 'Akkadian', 584, 486, { size: 26, bg: c.s5, display: true });
    if (s === 0) {
      // North up: the new power over the older cities, and the two peoples who speak differently.
      ctx.strokeStyle = c.s5; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.setLineDash([2, 15]);
      ctx.beginPath(); ctx.moveTo(340, 236); ctx.lineTo(340, 300); ctx.stroke(); ctx.setLineDash([]);
      pill(ctx, c, '2334 BCE', 340, 50, { size: 40, bg: c.bgSurface, ink: c.label, display: true });
      drawIcon(ctx, c, 'building', 340, 142, 86, { tone: c.s5 });
      pill(ctx, c, 'Akkad, in the north', 340, 214, { size: 28, bg: c.s5, display: true });
      drawIcon(ctx, c, 'building', 340, 334, 58, { tone: c.s2 });
      pill(ctx, c, 'Sumer, in the south', 340, 392, { size: 28, bg: c.s2, display: true });
      pill(ctx, c, 'Two languages', 340, 486, { size: 26, bg: c.bgSurface, ink: c.label, display: true });
      return;
    }
    this._tablet(ctx, c, s, k);
  }

  _tablet(ctx, c, s, k) {
    const tw = 264, th = 330, x = 340 - tw / 2, y = 100, col = mix(c.elevHigh, c.gold, 0.5), cut = darken(c.elevHigh, 0.55);
    rr(ctx, x, y + 10, tw, th, 34); ctx.fillStyle = darken(col, 0.3); ctx.fill();
    rr(ctx, x, y, tw, th, 34); ctx.fillStyle = col; ctx.fill();
    if (s === 1) {
      const cx = 340, cy = y + th / 2, r = 92, d = r * 0.72;
      wedge(ctx, cx - r, cy, 0, r * 2, 34, cut); wedge(ctx, cx, cy - r, Math.PI / 2, r * 2, 34, cut);
      wedge(ctx, cx - d, cy - d, Math.PI / 4, r * 2, 34, cut); wedge(ctx, cx - d, cy + d, -Math.PI / 4, r * 2, 34, cut);
      const a = clamp(k * 1.5, 0, 1);
      ctx.save(); ctx.globalAlpha *= a;
      pill(ctx, c, '"an"', 104, 156, { size: 44, bg: c.s2, display: true });
      pill(ctx, c, '"shamu"', 574, 156, { size: 44, bg: c.s5, display: true });
      pill(ctx, c, 'Both mean sky', 340, 48, { size: 30, bg: c.bgSurface, ink: c.label, display: true });
      ctx.restore();
    } else {
      for (let i = 0; i < 7; i++) for (let j = 0; j < 8; j++) { if ((i * 5 + j * 3) % 7 === 2) continue; wedge(ctx, x + 28 + j * 27 + (i % 2) * 6, y + 42 + i * 38, (i + j) % 3 === 0 ? Math.PI / 2 : 0, 22, 12, cut); }
      pill(ctx, c, 'The Epic of Gilgamesh', 340, 52, { size: 34, bg: c.s2, display: true });
    }
  }

  _cities(ctx, c, k) {
    const pts = [[120, 330], [240, 240], [340, 340], [450, 230], [570, 320]];
    ctx.strokeStyle = c.s5; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.setLineDash([2, 16]);
    ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke(); ctx.setLineDash([]);
    pts.forEach((p, i) => { const g = clamp(k * 3 - i * 0.4, 0, 1); ctx.save(); ctx.globalAlpha *= g; drawIcon(ctx, c, 'building', p[0], p[1], 52, { tone: i === 2 ? c.s5 : c.elevHigh }); ctx.restore(); });
    drawIcon(ctx, c, 'crown', 340, 262, 36, { tone: c.gold });
    pill(ctx, c, 'One family', 340, 72, { size: 40, bg: c.s5, display: true });
    pill(ctx, c, 'Many regions', 340, 136, { size: 32, bg: c.bgSurface, ink: c.label, display: true });
    pill(ctx, c, 'First dynastic empire', 340, 408, { size: 32, bg: c.bgSurface, ink: c.label, display: true });
  }
}
