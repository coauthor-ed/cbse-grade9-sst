import { ArcadeSortScene } from 'simulations/base/kit/ArcadeSortScene.js';
import { font, mix, darken } from 'simulations/base/kit/SimLook.js';
import { lookOf } from 'simulations/base/kit/lookProfile.js';
import { rr, alpha } from '../L06/PartyWorld.js';
import { MISCONDUCT_SORT } from '../L06/ElectionsDeckC.js';

// Misconduct Sort - each case falls towards three bins: intimidation, false information, bribe (L08 arcade).
// File and class name kept. No item names a party.
export class MisconductRouteScene extends ArcadeSortScene {
  static ARIA_LABEL = 'Misconduct Sort: each case falls towards three bins; tap intimidation, false information or bribe before it lands.';
  static CONFIG = { ...MISCONDUCT_SORT, title: 'Misconduct Sort', skin: 'sky', rounds: 8 };
  // One case of each kind, not the first three of the deck.
  menuSample() { return [4, 7, 2].map((i) => MISCONDUCT_SORT.items[i]); }

  // The kit bin carries a smiling face. A smile on a bin named Bribe teaches the wrong thing, so this bin has none.
  _drawBin(ctx, c, b, i, t, lit = false) {
    const col = this.tone(b.g.tone ?? b.g.id), x = b.x, w = b.w, h = 96;
    const y = 410 + (b.flash > 0 ? -10 * Math.sin(Math.min(1, b.flash) * Math.PI) : 0);
    if (lit) { ctx.fillStyle = alpha(c.good, 0.35 + 0.2 * Math.sin(t * 8)); rr(ctx, x - 8, y - 8, w + 16, h + 16, 22); ctx.fill(); }
    ctx.fillStyle = col;
    if (lookOf().lip > 0) { rr(ctx, x, y + 5, w, h, 18); ctx.fill(); }
    ctx.fillStyle = mix(mix(c.bgDeep, col, 0.1), c.good, Math.min(1, b.flash) * 0.45);
    rr(ctx, x, y, w, h, 18); ctx.fill();
    ctx.strokeStyle = col; ctx.lineWidth = 2.5;
    rr(ctx, x + 1.25, y + 1.25, w - 2.5, h - 2.5, 17); ctx.stroke();
    if (lookOf().lip > 0) { ctx.fillStyle = darken(col, 0.55); rr(ctx, x + 8, y - 4, w - 16, 12, 6); ctx.fill(); }
    const f = this.fitText(ctx, c, b.g.label, w - 14, 24, 14, 800, true);
    ctx.font = font(c, 800, f.size, true); ctx.fillStyle = c.label; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    f.lines.forEach((l, k) => ctx.fillText(l, x + w / 2, y + 50 + (k - (f.lines.length - 1) / 2) * (f.size + 3)));
    ctx.textAlign = 'left';
    if (!lit) this.hit('bin', { x, y: y - 6, w, h: h + 12 }, i);
  }
}
