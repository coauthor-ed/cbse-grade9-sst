// VarnaWheelScene - blk-l08-s01 (5 beats), s02 setup (0), blk-l08-s03 (4 beats). No wheel any more.
// Four panels in a row, one person at work in each, the same quiet treatment for all four, no
// ranking in the layout. The panel the beat names widens; the others stay in place at the same height.
//   stages: 0 all four  1-4 one lit  5 the family (setup)  6 the family, three occupations
//           7 knowledge, power, wealth  8 Sutta Nipata  9 flexibility reduced over time
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { pill, inkOn, font, mix, rr, darken, lighten } from 'simulations/base/kit/SimLook.js';
import { pal, panel, person, crown, palmLeaf, hut } from '../shared/SstArt.js';
import { sack } from './WorkProps.js';

const V = [
  { name: 'Br\u0101hma\u1E47as', role: 'teacher', i: 2, tasks: ['study and teach', 'yaj\u00F1as', 'd\u0101na (gifts)'], prop: 'leaf' },
  { name: 'Rajanya', sub: '(K\u1E63hatriyas)', role: 'adult', i: 4, tasks: ['warfare', 'protection', 'justice'], prop: 'shield' },
  { name: 'Vai\u015Bhyas', role: 'farmer', i: 3, tasks: ['agriculture', 'pastoralism', 'trade'], prop: 'sack' },
  { name: '\u015Ah\u016Bdras', role: 'worker', i: 5, tasks: ['assist the other var\u1E47as'], also: ['agriculture', 'animals', 'trade', 'crafts'], prop: 'pot' },
];
const one = (i) => [{ idx: i, dwellMs: null }];
const FAMILY = [
  { who: 'poet', x: 150, role: 'adult', i: 3, prop: 'leaf' },
  { who: 'physician', x: 340, role: 'elder', i: 2, prop: 'bowl' },
  { who: 'grinder of corn', x: 530, role: 'adult', i: 1, prop: 'quern', woman: true },
];
const MAN = { hairStyle: 'short', dupatta: false };
const QUOTE = ['"No br\u0101hma\u1E47a is such by birth.', 'No outcaste is such by birth', 'but only by his deeds.', 'A br\u0101hma\u1E47a is such by his deeds."'];

export class VarnaWheelScene extends SimScene {
  static BEAT_STEP_MAP = [one(5)];   // the host sends a huge beat count on a predict setup: this map holds it
  static BEAT_MAPS = { 5: [one(0), one(1), one(2), one(3), one(4)], 0: [one(5)], 4: [one(6), one(7), one(8), one(9)] };
  static VISUAL_PROFILE = 'rich';
  static IRIS = true;
  static ARIA_LABEL = 'Four panels in a row, each with a person at their work, for the roles the texts describe. Then a family of three occupations, a system of values, a line from the Sutta Nipata, and a band that narrows over time.';
  static CONTROLS = [];

  draw(ctx, c, t) {
    const P = pal(c);
    ctx.fillStyle = P.sand; ctx.fillRect(0, 0, 680, 520);
    const s = this.stage;
    if (s <= 4) this._row(ctx, c, t, s - 1);
    else if (s <= 6) this._family(ctx, c, t);
    else if (s === 7) this._values(ctx, c);
    else if (s === 8) this._sutta(ctx, c);
    else this._reduced(ctx, c);
  }

  _prop(ctx, c, kind, x, y, s = 1) {
    const P = pal(c);
    if (kind === 'leaf') palmLeaf(ctx, c, x - 48 * s, y - 13 * s, 96 * s, 26 * s, {});
    if (kind === 'shield') {
      ctx.fillStyle = mix(c.s8, c.gold, 0.3); ctx.beginPath(); ctx.arc(x, y, 34 * s, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = darken(mix(c.s8, c.gold, 0.3), 0.3); ctx.lineWidth = 6; ctx.stroke();
      ctx.fillStyle = c.gold; ctx.beginPath(); ctx.arc(x, y, 9 * s, 0, Math.PI * 2); ctx.fill();
    }
    if (kind === 'sack') sack(ctx, c, x, y, s);
    if (kind === 'pot') {
      const clay = mix(c.s8, P.sand, 0.15);
      ctx.fillStyle = clay; ctx.beginPath(); ctx.ellipse(x, y, 32 * s, 28 * s, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = darken(clay, 0.3); ctx.beginPath(); ctx.ellipse(x, y - 24 * s, 16 * s, 5 * s, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = lighten(clay, 0.3); ctx.beginPath(); ctx.ellipse(x - 10 * s, y - 8 * s, 6 * s, 10 * s, 0, 0, Math.PI * 2); ctx.fill();
    }
    if (kind === 'bowl') {
      ctx.fillStyle = P.woodLight; ctx.beginPath(); ctx.arc(x, y - 8 * s, 28 * s, 0, Math.PI); ctx.fill();
      ctx.fillStyle = P.leaf; ctx.beginPath(); ctx.ellipse(x, y - 8 * s, 24 * s, 7 * s, 0, 0, Math.PI * 2); ctx.fill();
    }
    if (kind === 'quern') {
      const st = mix(P.sand, P.sandDark, 0.5);
      ctx.fillStyle = darken(st, 0.25); ctx.beginPath(); ctx.ellipse(x, y + 8 * s, 44 * s, 14 * s, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = st; ctx.beginPath(); ctx.ellipse(x, y, 40 * s, 12 * s, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = darken(st, 0.4); ctx.lineWidth = 7; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x + 18 * s, y - 2 * s); ctx.lineTo(x + 18 * s, y - 24 * s); ctx.stroke(); ctx.lineCap = 'butt';
    }
  }

  // lit: index or -1. All panels share one height; the lit one widens so it reads on a phone.
  _row(ctx, c, t, lit) {
    const P = pal(c), gap = 10, W0 = 652, x0 = 14, top = 14, h = lit >= 0 ? 366 : 470;
    const wide = lit >= 0 ? 322 : (W0 - 3 * gap) / 4;
    const nar = lit >= 0 ? (W0 - 3 * gap - wide) / 3 : wide;
    let x = x0;
    V.forEach((v, i) => {
      const on = i === lit, w = lit < 0 || on ? wide : nar, off = lit >= 0 && !on;
      panel(ctx, c, x, top, w, h, { fill: P.panel, lit: on, off, litCol: c.gold });
      ctx.save(); if (off) ctx.globalAlpha *= 0.42;
      const fh = lit < 0 ? 268 : on ? 280 : 196, gy = top + (lit < 0 ? 288 : on ? 292 : 262), cx = on ? x + w * 0.36 : x + w / 2;
      person(ctx, this, { role: v.role, x: cx, y: gy, height: fh, i: v.i, t, facing: on ? 1 : 0, look: i === 3 || i === 2 ? {} : MAN });
      if (on) this._prop(ctx, c, v.prop, x + w * 0.76, gy - 70, 1.25);
      else if (lit < 0) this._prop(ctx, c, v.prop, x + w / 2, gy + 42, 0.72);
      ctx.fillStyle = c.label; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      if (on || lit < 0) {
        ctx.font = font(c, 700, on ? 34 : 26, true); ctx.fillText(v.name, x + w / 2, top + h - (v.sub ? 58 : 36));
        if (v.sub && on) { ctx.font = font(c, 700, 28); ctx.fillStyle = c.labelMuted; ctx.fillText(v.sub, x + w / 2, top + h - 22); }
      }
      ctx.restore();
      x += w + gap;
    });
    if (lit < 0) return;
    const v = V[lit], rows = v.also ? [v.tasks, v.also] : [v.tasks];
    rows.forEach((list, r) => {
      const y = rows.length > 1 ? 416 + r * 56 : 444;
      const tone = r ? c.gold : c.bgSurface;
      const ws = list.map((s) => { ctx.font = font(c, 800, 28); return ctx.measureText(s).width + 28; });
      let px = 340 - (ws.reduce((a, b) => a + b, 0) + (list.length - 1) * 10) / 2;
      list.forEach((s, k) => { pill(ctx, c, s, px + ws[k] / 2, y, { bg: tone, ink: r ? inkOn(c, tone) : c.label, size: 28 }); px += ws[k] + 10; });
    });
  }

  _family(ctx, c, t) {
    const P = pal(c);
    ctx.fillStyle = mix(P.water, c.bgSurface, 0.72); ctx.fillRect(0, 0, 680, 300);
    ctx.fillStyle = P.grass; ctx.fillRect(0, 300, 680, 220);
    hut(ctx, c, 340, 250, 2.6);
    FAMILY.forEach((f) => {
      person(ctx, this, { role: f.role, x: f.x, y: 450, height: 250, i: f.i, t, facing: f.x < 340 ? 1 : f.x > 340 ? -1 : 0, look: f.woman ? {} : MAN });
      this._prop(ctx, c, f.prop, f.x + (f.x < 340 ? 62 : -62) * (f.x === 340 ? -1 : 1), 400, 1);
      pill(ctx, c, f.who, Math.min(f.x, 556), 484, { bg: c.gold, ink: inkOn(c, c.gold), size: 28, display: true });
    });
    pill(ctx, c, 'one family', 340, 42, { bg: c.bgSurface, ink: c.label, size: 32, display: true });
  }

  _values(ctx, c) {
    const P = pal(c);
    const T = [['knowledge', 'leaf'], ['political power', 'crown'], ['wealth', 'sack']];
    T.forEach(([name, art], i) => {
      const x = 18 + i * 218;
      panel(ctx, c, x, 70, 208, 270, { fill: P.panel, lit: i === 0, litCol: c.gold });
      if (art === 'crown') crown(ctx, c, x + 104, 170, 2.2); else this._prop(ctx, c, art, x + 104, 190, 1.7);
      ctx.fillStyle = c.label; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = font(c, 700, 28, true); ctx.fillText(name, x + 104, 302);
    });
    pill(ctx, c, 'highest status', 122, 36, { bg: c.gold, ink: inkOn(c, c.gold), size: 28 });
    pill(ctx, c, 'followed by', 448, 36, { bg: c.bgSurface, ink: c.label, size: 28 });
    pill(ctx, c, 'functional: based on the work a group did', 340, 410, { bg: c.accent, ink: inkOn(c, c.accent), size: 28 });
  }

  _sutta(ctx, c) {
    const P = pal(c);
    ctx.fillStyle = P.palm; rr(ctx, 26, 54, 628, 400, 24); ctx.fill();
    ctx.strokeStyle = P.palmEdge; ctx.lineWidth = 7; ctx.stroke();
    ctx.fillStyle = c.label; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = font(c, 800, 34);
    QUOTE.forEach((l, i) => ctx.fillText(l, 340, 150 + i * 70));
    pill(ctx, c, 'Sutta Nip\u0101ta', 340, 54, { bg: c.gold, ink: inkOn(c, c.gold), size: 32, display: true });
  }

  _reduced(ctx, c) {
    const P = pal(c);
    ctx.fillStyle = P.panel; rr(ctx, 18, 60, 644, 340, 22); ctx.fill();
    const g = ctx.createLinearGradient(40, 0, 640, 0);
    g.addColorStop(0, c.gold); g.addColorStop(1, mix(c.gold, P.panel, 0.5));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(44, 110); ctx.bezierCurveTo(260, 112, 420, 196, 636, 214); ctx.lineTo(636, 246); ctx.bezierCurveTo(420, 264, 260, 348, 44, 350); ctx.closePath(); ctx.fill();
    ctx.fillStyle = inkOn(c, c.gold); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.font = font(c, 700, 34, true);
    ctx.fillText('flexible roles', 66, 230);
    pill(ctx, c, 'early Vedic period', 160, 450, { bg: c.bgSurface, ink: c.label, size: 28 });
    pill(ctx, c, 'over time', 556, 450, { bg: c.bgSurface, ink: c.label, size: 28 });
    ctx.strokeStyle = c.label; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(302, 450); ctx.lineTo(474, 450); ctx.lineTo(456, 436); ctx.moveTo(474, 450); ctx.lineTo(456, 464); ctx.stroke(); ctx.lineCap = 'butt';
    pill(ctx, c, 'gradually reduced', 340, 34, { bg: c.gold, ink: inkOn(c, c.gold), size: 30, display: true });
  }
}
