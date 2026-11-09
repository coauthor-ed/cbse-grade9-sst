// OnePartyScene - L04 s07. Two chambers. b0 one party, one colour, a decision comes sooner.
// b1 the chamber of many parties beside it: questions rise there, and none in the other.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawVignette } from 'simulations/base/kit/SimLook.js';
import { room, who, tag, sheet, pop, mix, darken, font } from './DayKit.js';

const m = (idx) => [{ idx, dwellMs: null }];
const TAU = Math.PI * 2;
const TONES = ['s1', 's2', 's3', 's5', 's7'];
const LEFT = 176, RIGHT = 506, BASE = 256;

export class OnePartyScene extends SimScene {
  static HEIGHT = 453;
  static BEAT_STEP_MAP = [m(0), m(1)];
  static ARIA_LABEL = 'Two half-round chambers. On the right all seats have one colour and a law passes quickly. On the left the seats have five colours, members stand, and question marks rise.';

  busy() { return this.age < 2.6; }

  _chamber(ctx, c, cx, many, dim) {
    ctx.save(); if (dim) ctx.globalAlpha *= 0.34;
    ctx.beginPath(); ctx.arc(cx, BASE, 156, Math.PI, 0); ctx.closePath(); ctx.fillStyle = mix(c.bgSurface, c.s8, 0.26); ctx.fill();
    ctx.fillStyle = darken(mix(c.bgSurface, c.s8, 0.26), 0.14); ctx.fillRect(cx - 164, BASE, 328, 10);
    let n = 0;
    for (let r = 0; r < 4; r++) {
      const R = 66 + r * 27, cnt = 6 + r * 3;
      for (let i = 0; i < cnt; i++) {
        const th = Math.PI + ((i + 0.5) / cnt) * Math.PI, x = cx + Math.cos(th) * R, y = BASE + Math.sin(th) * R;
        const tone = many ? TONES[Math.min(4, Math.floor(((i + 0.5) / cnt) * 5))] : 's1';
        ctx.beginPath(); ctx.arc(x, y + 3, 10, 0, TAU); ctx.fillStyle = darken(c[tone], 0.3); ctx.fill();
        ctx.beginPath(); ctx.arc(x, y, 10, 0, TAU); ctx.fillStyle = c[tone]; ctx.fill(); n++;
      }
    }
    ctx.restore();
  }

  _ask(ctx, c, x, y, k, tone) {
    if (k <= 0.02) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    ctx.beginPath(); ctx.arc(0, 0, 30, 0, TAU); ctx.fillStyle = c.bgSurface; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = c[tone]; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-8, 26); ctx.lineTo(-16, 42); ctx.lineTo(6, 28); ctx.closePath(); ctx.fillStyle = c[tone]; ctx.fill();
    ctx.font = font(c, 700, 38, true); ctx.fillStyle = c.label; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 0, 2);
    ctx.restore();
  }

  draw(ctx, c) {
    const st = this.stage, a = this.age;
    room(ctx, c, { ground: 280, wall: mix(c.bgSurface, c.water, 0.14), floor: mix(c.bgSurface, c.s8, 0.4) });
    this._chamber(ctx, c, LEFT, true, st === 0);
    this._chamber(ctx, c, RIGHT, false, false);
    if (st === 0) {
      const u = Math.min(1, a / 0.9);
      sheet(ctx, c, RIGHT, 190 - u * 50, 130, 96, { title: 'passed', size: 28, lines: 2 });
      who(ctx, this, { role: 'adult', x: RIGHT, y: 396, height: 156, i: 1, pose: 'point', facing: 0 });
      tag(ctx, c, 'one party', RIGHT, 424, { bg: c.s1, k: pop(a, 0.1) });
      tag(ctx, c, 'many parties', LEFT, 424, { k: pop(a, 0.1) });
      tag(ctx, c, 'some decisions come sooner', 340, 38, { bg: c.gold, k: pop(a, 0.9) });
    } else {
      [[60, 's1', 0], [176, 's3', 1], [292, 's5', 2]].forEach(([x, t, i]) => who(ctx, this, { role: ['teacher', 'farmer', 'elder'][i], x, y: 396, height: 156, i: i + 2, pose: 'reach-up', facing: 0 }));
      [[LEFT - 96, 72, 's1', 0.3], [LEFT + 8, 44, 's3', 0.7], [LEFT + 104, 76, 's5', 1.1], [LEFT - 34, 136, 's2', 1.5], [LEFT + 64, 146, 's7', 1.9]].forEach(([x, y, t, at]) => this._ask(ctx, c, x, y, pop(a, at), t));
      who(ctx, this, { role: 'adult', x: RIGHT, y: 396, height: 156, i: 1, pose: 'stand', facing: 0 });
      tag(ctx, c, 'many voices, questions', LEFT + 4, 426, { bg: c.gold, size: 29 });
      tag(ctx, c, 'nobody asks', RIGHT + 10, 426, { bg: c.s1, size: 29 });
    }
    drawVignette(ctx, c, 0.16);
  }
}
