// JanapadaFootprintScene - L02 s01. Fig. 5.1 as a real timeline hero, spaced to scale.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawBackdrop, drawVignette, rr, mix, alpha, pill, font } from 'simulations/base/kit/SimLook.js';
import { pal, panel, hut, fire, crown, TAU } from '../shared/SstArt.js';

const m = (idx) => [{ idx, dwellMs: null }];
const S_LINE = 0, S_KNOW = 1, S_GUESS = 2;
const MAP_1 = [m(S_LINE), m(S_KNOW), m(S_GUESS)];
const FROM = -2000, TO = 1000;
const BANDS = [
  { from: -2000, to: -1000, name: 'Kin-based, polities', when: 'from 2000 BCE', how: '\u1E5Aigveda', tone: 's2' },
  { from: -1000, to: -300, name: 'Janapadas, mah\u0101janapadas', when: '1000, 600 BCE', how: 'pottery, iron', tone: 's3' },
  { from: -300, to: 700, name: 'Empires', when: 'from 300 BCE', how: 'inscriptions', tone: 's6' },
  { from: 700, to: 1000, name: 'Regional, empires', when: 'from 700 CE', how: 'copper plates', tone: 's5' },
];
const LX = 24, LW = 632;
const xAt = (y) => LX + ((y - FROM) / (TO - FROM)) * LW;

export class JanapadaFootprintScene extends SimScene {
  static BEAT_STEP_MAP = MAP_1;
  static NOTE_STAGE = -1;
  static ARIA_LABEL = 'A timeline from 2000 BCE to 1000 CE spaced to scale, with four phases: kin-based polities, janapadas and mahajanapadas, empires, and regional empires. Four cards give each phase and how we know it.';

  _line(ctx, c) {
    const y = 60, h = 50;
    BANDS.forEach((b) => {
      const x0 = xAt(b.from), x1 = xAt(b.to);
      rr(ctx, x0 + 1, y + 5, x1 - x0 - 2, h, 10); ctx.fillStyle = mix(c[b.tone], c.label, 0.3); ctx.fill();
      rr(ctx, x0 + 1, y, x1 - x0 - 2, h, 10); ctx.fillStyle = c[b.tone]; ctx.fill();
    });
    ctx.font = font(c, 700, 28, true); ctx.textBaseline = 'alphabetic'; ctx.fillStyle = c.label;
    ctx.textAlign = 'left'; ctx.fillText('2000 BCE', LX, 42);
    ctx.textAlign = 'right'; ctx.fillText('1000 CE', LX + LW, 42);
    ctx.textAlign = 'center';
    // Janapadas from about 1000 BCE, mahajanapadas from about 600 BCE (L02 s03), then Fig. 5.1.
    for (const [yr, t, ty] of [[-1000, '1000 BCE', 146], [-600, '600 BCE', 42], [-300, '300 BCE', 146], [700, '700 CE', 146]]) {
      const x = xAt(yr); ctx.fillStyle = c.label; ctx.fillRect(x - 1.5, y - 6, 3, h + 12); ctx.fillText(t, x, ty);
    }
  }

  _cards(ctx, c) {
    BANDS.forEach((b, i) => {
      const col = i % 2, row = i >> 1, x = 16 + col * 330, y = 170 + row * 170, w = 318, h = 158;
      panel(ctx, c, x, y, w, h, { fill: mix(c.bgSurface, c[b.tone], 0.14) });
      ctx.save(); ctx.beginPath(); ctx.rect(x + 6, y + 8, 88, h - 16); ctx.clip();
      if (i === 0) { hut(ctx, c, x + 50, y + 112, 0.8); fire(ctx, c, x + 22, y + 136, 0.45, 0); }
      if (i === 1) { ctx.beginPath(); ctx.ellipse(x + 50, y + 84, 38, 30, 0, 0, TAU); ctx.fillStyle = alpha(c.s3, 0.35); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = c.s3; ctx.stroke(); hut(ctx, c, x + 50, y + 104, 0.5); }
      if (i === 2) crown(ctx, c, x + 50, y + 84, 1.2);
      if (i === 3) { crown(ctx, c, x + 34, y + 62, 0.75, c.s5); crown(ctx, c, x + 66, y + 110, 0.75, c.s6); }
      ctx.restore();
      ctx.textAlign = 'left'; ctx.fillStyle = c.label; ctx.font = font(c, 700, 28, true); ctx.textBaseline = 'middle';
      const tx = x + 98, nm = b.name.split(', ');
      nm.forEach((t, k) => ctx.fillText(t + (k < nm.length - 1 && i === 1 ? ',' : ''), tx, y + (nm.length > 1 ? 26 + k * 32 : 42)));
      ctx.font = font(c, 800, 28); ctx.fillStyle = c.labelMuted; ctx.fillText(b.when, tx, y + 96);
      if (this.stage === S_KNOW) { ctx.font = font(c, 800, 28); ctx.fillStyle = c.label; ctx.fillText(b.how, tx, y + 130); }
    });
  }

  draw(ctx, c) {
    if (this.stage === S_GUESS) {
      drawBackdrop(ctx, c, 'dots');
      const p = pal(c);
      rr(ctx, 6, 6, 668, 508, 18); ctx.fillStyle = p.grass; ctx.fill();
      hut(ctx, c, 330, 300, 3);
      pill(ctx, c, 'jana = kin', 180, 90, { size: 32, bg: c.s2, display: true });
      pill(ctx, c, 'a larger unit = a larger clan?', 340, 440, { size: 28, bg: c.gold, display: true });
      drawVignette(ctx, c, 0.3);
      return;
    }
    drawBackdrop(ctx, c, 'dots'); this._line(ctx, c); this._cards(ctx, c); drawVignette(ctx, c, 0.3);
  }
}
