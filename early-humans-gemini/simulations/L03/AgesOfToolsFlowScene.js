// AgesOfToolsFlowScene - L03 s02. Six ages in time order on one rail, each with what marks it.
// A bracket holds the three Stone Age stages. The Neolithic is the hinge. No dates: the book's Fig. 4.7 gives none.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { rr, alpha, mix, pill, font, outBack, clamp01, drawBackdrop, drawCard, chipRow } from 'simulations/base/kit/SimLook.js';
import { drawIcon } from 'simulations/base/kit/SimIcons.js';
import { drawTool } from '../shared/StoneArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const S_INTRO = 0, S_HINGE = 7;
const CW = 208, CH = 170, X = [14, 236, 458], Y = [66, 280];
const AGES = [
  { name: 'Palaeolithic', sub: 'Old Stone Age' },
  { name: 'Mesolithic', sub: 'Middle Stone Age' },
  { name: 'Neolithic', sub: 'New Stone Age' },
  { name: 'Chalcolithic', sub: 'copper + stone' },
  { name: 'Bronze Age', sub: 'copper + tin' },
  { name: 'Iron Age', sub: 'smelted iron' },
];

export class AgesOfToolsFlowScene extends SimScene {
  static BEAT_STEP_MAP = [0, 1, 2, 3, 4, 5, 6, 7].map(m);
  static COLOR_MAP = GEO_COLOR_MAP;
  static NOTE_STAGE = -1;
  static DRAGGABLE = false;
  static ARIA_LABEL = 'Six ages in time order: Palaeolithic, Mesolithic and Neolithic under a Stone Age bracket, then Chalcolithic, Bronze Age and Iron Age. Each card shows what marks the age. The Neolithic is marked as the turning point, the Neolithic Revolution.';

  busy() { return this.age < 1; }

  _art(ctx, c, i, x, y) {
    if (i === 0) drawTool(ctx, c, 'handaxe', x, y, 46, { rot: 0.5 });
    if (i === 1) { drawTool(ctx, c, 'blade', x - 30, y, 36, { rot: 0.3 }); drawTool(ctx, c, 'blade', x, y, 36, { rot: -0.1, seed: 9 }); drawTool(ctx, c, 'blade', x + 30, y, 36, { rot: 0.5, seed: 17 }); }
    if (i === 2) { drawTool(ctx, c, 'polished', x - 28, y, 44, { rot: 0.35, tone: mix(c.strata5, c.bgSurface, 0.1) }); drawIcon(ctx, c, 'grain', x + 44, y, 34, { tone: c.gold }); }
    if (i === 3) { drawTool(ctx, c, 'polished', x - 26, y, 42, { rot: 0.3, tone: mix(c.strata3, c.flame, 0.35) }); drawTool(ctx, c, 'flake', x + 44, y + 6, 28); }
    if (i === 4) drawTool(ctx, c, 'polished', x, y, 46, { rot: 0.4, tone: mix(c.gold, c.strata3, 0.3) });
    if (i === 5) drawTool(ctx, c, 'polished', x, y, 46, { rot: 0.4, tone: mix(c.strata6, c.label, 0.35) });
  }

  _card(ctx, c, i, k, now) {
    const x = X[i % 3], y = Y[i > 2 ? 1 : 0];
    ctx.save(); ctx.translate(x + CW / 2, y + CH / 2); ctx.scale(k, k); ctx.translate(-x - CW / 2, -y - CH / 2);
    drawCard(ctx, c, x, y, CW, CH);
    this._art(ctx, c, i, x + CW / 2, y + 58);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = c.label;
    ctx.font = font(c, 700, 26, true); ctx.fillText(AGES[i].name, x + CW / 2, y + CH - 48);
    ctx.font = font(c, 800, 25); ctx.fillStyle = c.labelMuted; ctx.fillText(AGES[i].sub, x + CW / 2, y + CH - 20);
    if (now) { rr(ctx, x, y, CW, CH, 16); ctx.strokeStyle = c.accent; ctx.lineWidth = 4; ctx.stroke(); }
    ctx.restore();
  }

  _slot(ctx, c, i) {
    const x = X[i % 3], y = Y[i > 2 ? 1 : 0];
    ctx.setLineDash([12, 10]); rr(ctx, x, y, CW, CH, 16); ctx.strokeStyle = alpha(c.labelMuted, 0.5); ctx.lineWidth = 3; ctx.stroke(); ctx.setLineDash([]);
  }

  _rail(ctx, c) {
    ctx.strokeStyle = this.stage === S_HINGE ? c.gold : alpha(c.labelMuted, 0.7); ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const y0 = Y[0] + CH + 2;
    ctx.beginPath(); ctx.moveTo(X[2] + CW / 2, y0); ctx.lineTo(X[2] + CW / 2, y0 + 14); ctx.lineTo(X[0] + CW / 2, y0 + 14); ctx.lineTo(X[0] + CW / 2, Y[1] - 12); ctx.stroke();
    ctx.fillStyle = ctx.strokeStyle; ctx.beginPath(); ctx.moveTo(X[0] + CW / 2, Y[1]); ctx.lineTo(X[0] + CW / 2 - 12, Y[1] - 16); ctx.lineTo(X[0] + CW / 2 + 12, Y[1] - 16); ctx.closePath(); ctx.fill();
    for (const y of [Y[0], Y[1]]) for (const x of [X[0] + CW, X[1] + CW]) {
      ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x + 2, y + CH / 2); ctx.lineTo(x + 12, y + CH / 2); ctx.stroke();
    }
  }

  draw(ctx, c) {
    const st = this.stage;
    drawBackdrop(ctx, c, 'dots');
    // Stone Age bracket over the first three.
    ctx.strokeStyle = c.label; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(X[0] + 4, 58); ctx.lineTo(X[0] + 4, 38); ctx.lineTo(X[2] + CW - 4, 38); ctx.lineTo(X[2] + CW - 4, 58); ctx.stroke();
    pill(ctx, c, 'Stone Age', 340, 34, { size: 26, bg: c.bgSurface, ink: c.label, display: true });
    this._rail(ctx, c);
    for (let i = 0; i < 6; i++) {
      if (st <= i && st < S_HINGE) { this._slot(ctx, c, i); continue; }
      const k = st === i + 1 ? outBack(clamp01(this.age / 0.4)) : 1;
      ctx.save();
      if (st === S_HINGE && i !== 2) ctx.globalAlpha *= 0.6;
      this._card(ctx, c, i, k, st === i + 1);
      ctx.restore();
    }
    if (st === S_INTRO) pill(ctx, c, 'palaeo old, meso middle, neo new', 340, 486, { size: 25, bg: c.bgSurface, ink: c.label, display: true });
    if (st === S_HINGE) {
      const k = outBack(clamp01(this.age / 0.5)), x = X[2], y = Y[0];
      rr(ctx, x - 4, y - 4, CW + 8, CH + 8, 18); ctx.strokeStyle = c.gold; ctx.lineWidth = 7; ctx.stroke();
      ctx.save(); ctx.translate(340, 262); ctx.scale(k, k); pill(ctx, c, 'Neolithic Revolution', 0, 0, { size: 28, bg: c.gold, display: true }); ctx.restore();
      chipRow(ctx, c, [{ text: 'hunting' }, { text: 'farming' }, { text: 'surplus' }, { text: 'civilisations' }].map((q) => ({ ...q, bg: c.bgSurface, ink: c.label })), 340, 486, { size: 25, align: 'center', display: true, gap: 14 });
    }
  }
}
