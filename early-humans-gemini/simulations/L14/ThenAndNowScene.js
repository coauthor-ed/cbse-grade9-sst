// ThenAndNowScene - blk-l14-s06b, 5 beats. Three problems, each as a pair: then on the left, now on the right. Beat 0 sets
// out the three questions. Beats 1 to 3 give one pair each, big. Beat 4 shows the three pairs. No banknote or State Emblem is
// drawn: a coin icon stands for money. Canvas: SimIcons and the course's own drawings.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { clamp, darken, inkOn, mix, outBack, pill, rr } from 'simulations/base/kit/SimLook.js';
import { drawIcon } from 'simulations/base/kit/SimIcons.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { zigguratArt } from './BronzeDraw.js';

const W = 680, H = 520;
const MAP = [0, 1, 2, 3, 4].map((idx) => [{ idx, dwellMs: null }]);
const P = [
  { q: 'Who owes what?', then: 'Clay tablet', now: 'Shop bill', a: 'tablet', b: 'newspaper', tone: 's2' },
  { q: 'Trust a stranger?', then: 'Harappan weight', now: 'Stamped weight', a: 'cube', b: 'scales', tone: 's3' },
  { q: 'Why obey?', then: 'Ziggurat', now: 'Election', a: 'zig', b: 'ballot-box', tone: 's5' },
];

export class ThenAndNowScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static COLOR_MAP = GEO_COLOR_MAP;
  static ARIA_LABEL = 'Three problems and their answers then and now. Who owes what: a clay tablet then, a shop bill now. Trusting a stranger: a Harappan weight then, a stamped weight now. Why obey: a ziggurat then, an election now.';

  busy() { return this.age < 1; }

  _art(ctx, c, id, x, y, r, tone) {
    if (id === 'zig') { zigguratArt(ctx, c, x, y + r * 0.9, r / 118); return; }
    if (id === 'cube') {
      const s = r * 1.15, col = mix(c.strata5, c.bgSurface, 0.2);
      ctx.fillStyle = col; rr(ctx, x - s * 0.62, y - s * 0.38, s * 1.08, s * 1.08, 6); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = darken(col, 0.45); ctx.stroke();
      ctx.fillStyle = mix(col, c.bgSurface, 0.3); ctx.beginPath(); ctx.moveTo(x - s * 0.62, y - s * 0.38); ctx.lineTo(x - s * 0.34, y - s * 0.68); ctx.lineTo(x + s * 0.74, y - s * 0.68); ctx.lineTo(x + s * 0.46, y - s * 0.38); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = darken(col, 0.2); ctx.beginPath(); ctx.moveTo(x + s * 0.46, y - s * 0.38); ctx.lineTo(x + s * 0.74, y - s * 0.68); ctx.lineTo(x + s * 0.74, y + s * 0.4); ctx.lineTo(x + s * 0.46, y + s * 0.7); ctx.closePath(); ctx.fill(); ctx.stroke();
      return;
    }
    drawIcon(ctx, c, id, x, y, r, { tone });
  }

  _pair(ctx, c, p, y, r, g, big) {
    const col = c[p.tone];
    this._art(ctx, c, p.a, 170, y, r, col);
    ctx.strokeStyle = c.label; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(310, y); ctx.lineTo(370, y); ctx.moveTo(348, y - 20); ctx.lineTo(370, y); ctx.lineTo(348, y + 20); ctx.stroke();
    ctx.save(); ctx.translate(510, y); ctx.scale(g, g); this._art(ctx, c, p.b, 0, 0, r, col); ctx.restore();
    const ly = y + r + (big ? 44 : 26);
    pill(ctx, c, p.then, 170, ly, { size: big ? 30 : 24, display: true, bg: c.bgSurface, ink: c.label });
    pill(ctx, c, p.now, 510, ly, { size: big ? 30 : 24, display: true, bg: col, ink: inkOn(c, col) });
  }

  draw(ctx, c) {
    const s = this.stage ?? 0, t = this.age, g = outBack(clamp(t / 0.4, 0, 1));
    ctx.fillStyle = mix(c.bgSurface, c.strata2, 0.14); ctx.fillRect(0, 0, W, H);
    if (s === 0) {
      pill(ctx, c, 'Any large group must answer', 340, 44, { size: 30, display: true, bg: c.bgSurface, ink: c.label });
      P.forEach((p, i) => pill(ctx, c, p.q, 340, 170 + i * 110, { size: 40, display: true, bg: c[p.tone], ink: inkOn(c, c[p.tone]), scale: outBack(clamp((t - i * 0.15) / 0.36, 0, 1)) }));
    } else if (s <= 3) {
      const p = P[s - 1];
      pill(ctx, c, p.q, 340, 44, { size: 36, display: true, bg: c.bgSurface, ink: c.label });
      pill(ctx, c, 'Then', 170, 106, { size: 26, display: false, bg: c.bgSurface, ink: c.label });
      pill(ctx, c, 'Now', 510, 106, { size: 26, display: false, bg: c.bgSurface, ink: c.label });
      this._pair(ctx, c, p, 270, 108, g, true);
    } else {
      pill(ctx, c, 'Then and now', 340, 36, { size: 32, display: true, bg: c.bgSurface, ink: c.label });
      P.forEach((p, i) => this._pair(ctx, c, p, 112 + i * 142, 50, 1, false));
    }
  }
}
