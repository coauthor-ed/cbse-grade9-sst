// EndowmentScene - L11 blk-l11-s07, 5 beats. The Nashik inscription read as a source: donor and donee at a rock-cut cave;
// the deposit in two guilds; the interest worked out big; why a guild could be trusted; other guilds and textile centres.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { mix, darken, lighten, rr, drawBackdrop, drawCard, drawVignette } from 'simulations/base/kit/SimLook.js';
import { ease, seg, say, plate, sky, stone, ground, MAN, person } from '../L09/SstWorld.js';

const W = 680, H = 520, GY = 448;
const MAP = [0, 1, 2, 3, 4].map((idx) => [{ idx, dwellMs: null }]);

export class EndowmentScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static ARIA_LABEL = 'A rock-cut cave with a donor and a monk. Three thousand coins split into two weavers guilds, two thousand and one thousand. The yearly interest worked out: 240 plus 90 is 330. Then three reasons a guild could be trusted, and last three bolts of cloth for textile centres beside a carved gateway at Sanchi.';
  static CONTROLS = [];

  busy() { return this.age < 1.6; }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'plain');
    [this._cave, this._deposit, this._sum, this._trust, this._others][this.stage ?? 0].call(this, ctx, c, ease(this.age / 0.8));
    drawVignette(ctx, c, 0.25);
  }

  _facade(ctx, c, x, y, w, h) {
    const rock = stone(c);
    ctx.fillStyle = darken(rock, 0.12); ctx.fillRect(x, y, w, h);
    ctx.fillStyle = rock;
    ctx.beginPath(); ctx.moveTo(x, y + 30);
    for (let i = 0; i <= 8; i++) ctx.lineTo(x + i * w / 8, y + 10 + ((i * 37) % 26));
    ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.closePath(); ctx.fill();
    // the hall: a dark opening behind six pillars, a lintel with a railing pattern above
    const hx = x + w * 0.1, hw = w * 0.8, hy = y + 150, hh = h - 150;
    ctx.fillStyle = darken(rock, 0.62); rr(ctx, hx, hy, hw, hh, 6); ctx.fill();
    ctx.fillStyle = lighten(rock, 0.1); rr(ctx, hx - 12, hy - 40, hw + 24, 42, 6); ctx.fill();
    ctx.fillStyle = darken(rock, 0.2);
    for (let i = 0; i < 16; i++) { rr(ctx, hx + i * (hw / 16), hy - 32, 12, 26, 3); ctx.fill(); }
    for (let i = 0; i < 6; i++) {
      const px = hx + 26 + i * ((hw - 76) / 5);
      ctx.fillStyle = lighten(rock, 0.06); rr(ctx, px, hy, 24, hh, 6); ctx.fill();
      ctx.fillStyle = darken(rock, 0.14); rr(ctx, px - 7, hy + 2, 38, 16, 7); ctx.fill(); rr(ctx, px - 7, y + h - 14, 38, 14, 5); ctx.fill();
    }
  }

  _cave(ctx, c, k) {
    ctx.fillStyle = sky(c); ctx.fillRect(0, 0, W, GY);
    this._facade(ctx, c, 0, 40, W, GY - 40);
    ground(ctx, c, GY);
    person(this, ctx, c, { role: 'adult', pose: 'stand', x: 170, y: GY + 48, height: 240, facing: 1, i: 0, look: { ...MAN, mood: 'smile' } });
    person(this, ctx, c, { role: 'elder', pose: 'stand', x: 500, y: GY + 48, height: 226, facing: -1, i: 2, look: { ...MAN, top: c.s8, trim: c.s8, bottom: c.s8 } });
    plate(ctx, c, 'donor: U\u1E63havad\u0101ta', 180, 40, { size: 28, alpha: k });
    plate(ctx, c, 'receives: the Sa\u1E41gha', 496, 40, { size: 28, alpha: k });
  }

  _coins(ctx, c, x, y, n, k) {
    for (let i = 0; i < n; i++) {
      const row = Math.floor(i / 5), px = x + (i % 5) * 44 + (row % 2) * 16, py = y - row * 19;
      const a = ease(seg(k, i * 0.03, i * 0.03 + 0.4));
      ctx.save(); ctx.globalAlpha *= a;
      ctx.fillStyle = darken(c.gold, 0.3); ctx.beginPath(); ctx.ellipse(px, py + 4, 22, 11, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c.gold; ctx.beginPath(); ctx.ellipse(px, py, 22, 11, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }

  _deposit(ctx, c) {
    ctx.fillStyle = mix(c.bgSurface, sky(c), 0.45); ctx.fillRect(0, 0, W, H);
    const a = this.age;
    say(ctx, c, '3000 k\u0101h\u0101pa\u1E47as', W / 2, 54, { size: 44 });
    ctx.strokeStyle = c.s8; ctx.lineWidth = 12; ctx.lineCap = 'round';
    const k = ease(seg(a, 0.2, 0.9));
    ctx.beginPath(); ctx.moveTo(W / 2 - 30, 92); ctx.lineTo(W / 2 - 30 - 110 * k, 92 + 74 * k); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W / 2 + 30, 92); ctx.lineTo(W / 2 + 30 + 110 * k, 92 + 74 * k); ctx.stroke();
    const guild = (x, w, amount, rate, n) => {
      drawCard(ctx, c, x, 180, w, 324);
      say(ctx, c, amount, x + w / 2, 224, { size: 46, col: c.s8ink });
      say(ctx, c, 'weavers\u2019 guild', x + w / 2, 270, { size: 28 });
      this._coins(ctx, c, x + 40, 392, n, a - 0.5);
      rate.forEach((t, i) => say(ctx, c, t, x + w / 2, 450 + i * 34, { size: 28, weight: 700, display: false }));
    };
    guild(16, 320, '2000', ['1 pratika a month', 'for each 100'], 20);
    guild(344, 320, '1000', ['\u00BE pa\u1E0Dika a month', 'for each 100'], 10);
  }

  _sum(ctx, c) {
    ctx.fillStyle = mix(c.bgSurface, sky(c), 0.3); ctx.fillRect(0, 0, W, H);
    const a = this.age;
    drawCard(ctx, c, 16, 16, W - 32, 488);
    const line = (y, t, col, at, size = 42) => say(ctx, c, t, W / 2, y, { size, col, a: ease(seg(a, at, at + 0.4)) });
    say(ctx, c, 'Each year', W / 2, 54, { size: 30, col: c.labelMuted });
    line(126, '12 on each 100 of 2000 = 240', c.label, 0.1, 40);
    line(202, '9 on each 100 of 1000 = 90', c.label, 0.5, 40);
    ctx.fillStyle = c.stroke; ctx.fillRect(70, 248, W - 140, 5);
    line(322, '240 + 90 = 330', c.s8ink, 0.9, 62);
    line(400, 'k\u0101h\u0101pa\u1E47as a year', c.label, 1.0, 34);
    line(462, 'cloth money, money for outside life', c.labelMuted, 1.2, 28);
  }

  _trust(ctx, c, k) {
    ctx.fillStyle = sky(c); ctx.fillRect(0, 0, W, GY);
    this._facade(ctx, c, 0, 230, W, GY - 230);
    ground(ctx, c, GY);
    plate(ctx, c, 'Why trust a guild?', W / 2, 44, { size: 32 });
    const items = ['fixed rate of interest', 'rules and guild courts', 'a steady trade'];
    items.forEach((t, i) => plate(ctx, c, t, W / 2, 112 + i * 54, { size: 28, alpha: ease(seg(this.age, 0.2 + i * 0.3, 0.6 + i * 0.3)), ink: i ? c.s5ink : c.s8ink }));
    void k;
  }

  _others(ctx, c) {
    ctx.fillStyle = sky(c); ctx.fillRect(0, 0, W, GY);
    ground(ctx, c, GY);
    const a = this.age;
    [['Mathur\u0101', c.s6], ['K\u0101\u015Bh\u012B', c.s1], ['K\u0101mar\u016Bpa', c.s3]].forEach(([name, col], i) => {
      const x = 74 + i * 106, k = ease(seg(a, i * 0.14, i * 0.14 + 0.4));
      ctx.save(); ctx.globalAlpha *= k;
      ctx.fillStyle = darken(col, 0.28); rr(ctx, x - 40, 196, 80, GY - 190, 10); ctx.fill();
      ctx.fillStyle = col; rr(ctx, x - 40, 190, 72, GY - 190, 10); ctx.fill();
      ctx.strokeStyle = lighten(col, 0.3); ctx.lineWidth = 5;
      for (let r = 1; r < 6; r++) { ctx.beginPath(); ctx.moveTo(x - 40, 190 + r * 42); ctx.lineTo(x + 32, 190 + r * 42); ctx.stroke(); }
      ctx.restore();
      plate(ctx, c, name, x, 164 - (i % 2) * 40, { size: 28, alpha: k });
    });
    plate(ctx, c, 'textile centres', 180, 46, { size: 28 });
    // a carved gateway: two posts, three crossbars
    const st = mix(stone(c), c.gold, 0.14), gx = 520;
    ctx.fillStyle = darken(st, 0.16); rr(ctx, gx - 106, 130, 34, GY + 26 - 130, 8); ctx.fill(); rr(ctx, gx + 72, 130, 34, GY + 26 - 130, 8); ctx.fill();
    [120, 176, 232].forEach((y, i) => {
      ctx.fillStyle = darken(st, 0.2); rr(ctx, gx - 140 + i * 6, y + 5, 280 - i * 12, 34, 16); ctx.fill();
      ctx.fillStyle = st; rr(ctx, gx - 140 + i * 6, y, 280 - i * 12, 34, 16); ctx.fill();
      ctx.fillStyle = darken(st, 0.26); for (let k = 0; k < 7; k++) { ctx.beginPath(); ctx.arc(gx - 108 + k * 36, y + 17, 7, 0, Math.PI * 2); ctx.fill(); }
    });
    person(this, ctx, c, { role: 'worker', pose: { name: 'reach-up' }, x: gx, y: GY + 44, height: 170, facing: 0, i: 0, look: MAN });
    plate(ctx, c, 'ivory workers, Vidi\u015Bh\u0101', 500, 62, { size: 28 });
  }
}
