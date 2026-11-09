// RiverRiskRewardScene - blk-l14-s06, 4 beats. One river down the middle. The left bank holds what it gives, the right bank
// what it costs: water and floods, soil and salt, boats and one shared risk. Each beat lights its pair; the last lights all three.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { clamp, darken, inkOn, lighten, mix, outBack, pill, mulberry32 } from 'simulations/base/kit/SimLook.js';
import { drawIcon } from 'simulations/base/kit/SimIcons.js';
import { GEO_COLOR_MAP } from 'simulations/base/kit/GeoLook.js';

const W = 680, H = 520;
const MAP = [0, 1, 2, 3].map((idx) => [{ idx, dwellMs: null }]);
const ROWS = [
  { give: 'Fresh water', cost: 'Floods', ig: 'well', ic: 'rain' },
  { give: 'New soil', cost: 'Salt in the soil', ig: 'field', ic: 'field' },
  { give: 'Boats for goods', cost: 'One bad year hurts all', ig: 'boat', ic: 'crowd' },
];
const LIT = [[0, 1, 2], [0], [1], [2]];
const OPEN = [3, 1, 2, 3];   // how many rows have arrived on each beat

export class RiverRiskRewardScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static COLOR_MAP = GEO_COLOR_MAP;
  static ARIA_LABEL = 'One river. On one bank what it gives: fresh water, new soil and boats for goods. On the other what it costs: floods, salt in the soil, and one bad year that hurts everybody.';

  busy() { return this.age < 1; }

  draw(ctx, c) {
    const s = this.stage ?? 0, t = this.age;
    const green = mix(c.elevLow, c.bgSurface, 0.4), dry = mix(c.strata1, c.strata2, 0.4);
    ctx.fillStyle = green; ctx.fillRect(0, 0, W / 2, H);
    ctx.fillStyle = dry; ctx.fillRect(W / 2, 0, W / 2, H);
    if (s === 2) { const rnd = mulberry32(4); ctx.fillStyle = lighten(dry, 0.75); for (let i = 0; i < 90; i++) ctx.fillRect(W / 2 + 60 + rnd() * 280, 90 + rnd() * 420, 7, 4); }
    const rw = s === 1 ? 118 : 76;
    ctx.beginPath(); ctx.moveTo(W / 2 - rw / 2, 0);
    ctx.bezierCurveTo(W / 2 - rw / 2 + 70, 170, W / 2 - rw / 2 - 70, 330, W / 2 - rw / 2, H); ctx.lineTo(W / 2 + rw / 2, H);
    ctx.bezierCurveTo(W / 2 + rw / 2 - 70, 330, W / 2 + rw / 2 + 70, 170, W / 2 + rw / 2, 0); ctx.closePath();
    ctx.fillStyle = c.seaShallow; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = darken(c.seaShallow, 0.3); ctx.stroke();
    pill(ctx, c, 'What it gives', 170, 40, { size: 30, display: true, bg: c.good, ink: inkOn(c, c.good) });
    pill(ctx, c, 'What it costs', 510, 40, { size: 30, display: true, bg: c.bad, ink: inkOn(c, c.bad) });
    ROWS.forEach((r, i) => {
      if (i >= OPEN[s]) return;
      const lit = LIT[s].includes(i), y = 150 + i * 132, g = lit ? outBack(clamp(t / 0.4, 0, 1)) : 1;
      ctx.save(); if (!lit) ctx.globalAlpha = 0.45;
      for (const [x, ic, tone, label] of [[150, r.ig, c.s3, r.give], [530, r.ic, c.s6, r.cost]]) {
        ctx.save(); ctx.translate(x, y - 16); ctx.scale(g, g);
        ctx.beginPath(); ctx.arc(0, 0, 52, 0, 7); ctx.fillStyle = c.bgSurface; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = darken(tone, 0.2); ctx.stroke();
        drawIcon(ctx, c, ic, 0, 0, 38, { tone });
        ctx.restore();
        pill(ctx, c, label, x, y + 52, { size: label.length > 18 ? 22 : 25, display: true, bg: c.bgSurface, ink: c.label });
      }
      ctx.restore();
    });
  }
}
