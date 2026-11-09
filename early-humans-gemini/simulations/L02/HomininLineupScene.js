// HomininLineupScene - L02 s02. Four species on one true-scale time axis, each with its skull.
// Beats name a species, then show overlap, the older line and the Quaternary. It never says who left Africa.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';
import { rr, alpha, darken, pill, font, clamp01, outBack, drawBackdrop } from 'simulations/base/kit/SimLook.js';
import { drawSkull, drawTool, SKULLS } from '../shared/StoneArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const S_OVER = 4, S_EARLY = 5, S_TWO = 6;
const AX0 = 212, AX1 = 662, MAX = 3.5, YAX = 62;
const xAt = (ma) => AX0 + (MAX - ma) / MAX * (AX1 - AX0);
// from, to in million years ago. Fades mark where the book gives no firm end.
const ROWS = [
  { id: 'habilis', name: 'H. habilis', from: 2.5, to: 1.6, tone: 's1', tool: 'choppers', kit: 'chopper', fadeL: true, fadeR: true, when: 'more than 2 million years ago' },
  { id: 'erectus', name: 'H. erectus', from: 2.0, to: 0.5, tone: 's2', tool: 'handaxes, cleavers', kit: 'handaxe', fadeR: true, when: 'about 2 million years ago' },
  { id: 'neanderthal', name: 'Neanderthal', from: 0.4, to: 0.04, tone: 's3', tool: 'flake tools', kit: 'flake', fadeL: true, when: 'until about 40,000 years ago' },
  { id: 'sapiens', name: 'H. sapiens', from: 0.3, to: 0, tone: 's4', tool: 'complex tools', kit: 'blade', when: 'from about 300,000 years ago' },
];
const Y0 = 98, RH = 84;

export class HomininLineupScene extends SimScene {
  static BEAT_STEP_MAP = [m(0), m(1), m(2), m(3), m(4), m(5), m(6)];
  static COLOR_MAP = GEO_COLOR_MAP;
  static NOTE_STAGE = -1;
  static DRAGGABLE = false;
  static ARIA_LABEL = 'Four species on a time scale from 3.5 million years ago to today, each with a skull: Homo habilis, Homo erectus, Neanderthals and Homo sapiens. Bars overlap. An earlier row shows the australopithecines. The bars for the last two species are short and overlap near today.';

  busy() { return this.age < 1.2; }

  _axis(ctx, c) {
    ctx.strokeStyle = c.label; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(AX0, YAX); ctx.lineTo(AX1, YAX); ctx.stroke();
    ctx.font = font(c, 700, 26, true); ctx.fillStyle = c.label; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    for (const v of [3, 2, 1, 0]) {
      const x = xAt(v);
      ctx.fillRect(x - 2, YAX - 8, 4, 16);
      ctx.fillText(v ? String(v) : 'today', Math.min(x, 628), YAX - 16);
    }
    ctx.font = font(c, 800, 25); ctx.textAlign = 'left'; ctx.fillStyle = c.labelMuted;
    ctx.fillText('million years ago', 8, YAX - 14);
  }

  _bar(ctx, c, r, y, on) {
    const x0 = xAt(r.from), x1 = xAt(r.to), h = 36, col = c[r.tone];
    const k = this.age * 2.2;
    ctx.save();
    ctx.globalAlpha *= on ? 1 : 0.34;
    const g = ctx.createLinearGradient(x0, 0, x1, 0), f = Math.min(0.3, 26 / Math.max(1, x1 - x0));
    g.addColorStop(0, r.fadeL ? alpha(col, 0.12) : col); g.addColorStop(f, col); g.addColorStop(1 - f, col); g.addColorStop(1, r.fadeR ? alpha(col, 0.12) : col);
    rr(ctx, x0, y - h / 2 + 4, x1 - x0, h, 12); ctx.fillStyle = r.fadeR || r.fadeL ? alpha(darken(col, 0.3), 0.3) : darken(col, 0.3); ctx.fill();
    rr(ctx, x0, y - h / 2, x1 - x0, h, 12); ctx.fillStyle = g; ctx.fill();
    ctx.restore();
    return k;
  }

  draw(ctx, c) {
    const st = this.stage;
    drawBackdrop(ctx, c, 'dots');
    const pop = outBack(clamp01(this.age / 0.4));
    // Bands behind the bars: when two species shared the earth.
    if (st === S_OVER) {
      for (const [a, b] of [[2.0, 1.6], [0.3, 0.04]]) { ctx.fillStyle = alpha(c.gold, 0.34); ctx.fillRect(xAt(a), YAX + 8, xAt(b) - xAt(a), 340); }
    }
    if (st === S_TWO) { ctx.fillStyle = alpha(c.gold, 0.2); ctx.fillRect(xAt(2.6), YAX + 8, xAt(0) - xAt(2.6), 340); }
    this._axis(ctx, c);
    ROWS.forEach((r, i) => {
      const y = Y0 + i * RH + 12, on = st > 3 || st === i;
      ctx.save(); ctx.globalAlpha *= on ? 1 : 0.42;
      drawSkull(ctx, c, SKULLS[r.id], 50, y - 4, 32);
      ctx.restore();
      ctx.font = font(c, 700, 25, true); ctx.fillStyle = on ? c.label : c.labelMuted; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(r.name, 88, y);
      this._bar(ctx, c, r, y, on);
      if (st === i) {
        const left = r.to < 1.2;
        drawTool(ctx, c, r.kit, left ? xAt(r.from) - 42 : xAt(r.to) + 44, y, 30 * pop);
        const lx = left ? AX0 + 150 : AX0 + 228;
        pill(ctx, c, r.tool, lx, y + 42 > 460 ? y - 42 : y + 40, { size: 25, bg: c[r.tone], display: true });
      }
    });
    const by = Y0 + 4 * RH + 22;
    if (st < 4) {
      const r = ROWS[st];
      pill(ctx, c, r.when, 340, by + 30, { size: 26, bg: c.bgSurface, ink: c.label, display: true });
    }
    if (st === S_OVER) pill(ctx, c, 'alive at the same time', 400, by + 30, { size: 28, bg: c.gold, display: true });
    if (st === S_EARLY) {
      const a = xAt(3.5), b = xAt(2.0), h = 34, y = by + 8;
      ctx.save();
      ctx.setLineDash([12, 9]); rr(ctx, a, y - h / 2, b - a, h, 12); ctx.fillStyle = alpha(c.s5, 0.3); ctx.fill(); ctx.strokeStyle = c.s5; ctx.lineWidth = 3; ctx.stroke(); ctx.setLineDash([]);
      ctx.restore();
      ctx.font = font(c, 700, 25, true); ctx.fillStyle = c.label; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText('Australo-', 14, y - 14); ctx.fillText('pithecines', 14, y + 14);
    }
    if (st === S_EARLY) {
      const x = xAt(3.3);
      ctx.strokeStyle = c.label; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, YAX); ctx.lineTo(x, Y0 + 4 * RH); ctx.stroke();
      drawTool(ctx, c, 'chopper', x + 8, 150, 34 * pop);
      ctx.font = font(c, 700, 25, true); ctx.fillStyle = c.label; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('first stone tools: 3.3', x + 46, 154);
    }
    if (st === S_TWO) {
      ctx.strokeStyle = c.label; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(xAt(2.6), YAX + 18); ctx.lineTo(xAt(2.6), YAX + 28); ctx.lineTo(xAt(0), YAX + 28); ctx.lineTo(xAt(0), YAX + 18); ctx.stroke();
      pill(ctx, c, 'Quaternary: last 26 lakh years', 436, by + 2, { size: 25, bg: c.gold, display: true });
      pill(ctx, c, 'bodies: slow', 180, 494, { size: 25, bg: c.bgSurface, ink: c.label, display: true });
      pill(ctx, c, 'tools: much faster', 450, 494, { size: 25, bg: c.bgSurface, ink: c.label, display: true });
    }
  }
}
