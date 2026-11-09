// GuildScene - L11 blk-l11-s06, 4 beats. b0 weavers of one craft; b1 eighteen types; b2, b3 what a guild did: chips Quality,
// Price, Court and Bank each light one drawn panel, so a term points at a thing. A beat presets what it names.
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { mix, darken, lighten, rr, drawBackdrop, drawVignette } from 'simulations/base/kit/SimLook.js';
import { figureMetrics } from 'simulations/base/kit/SimFigure.js';
import { tapLight, tapLightControl } from 'simulations/base/kit/TapLight.js';
import { ground, ease, seg, say, plate, sky, stone, thatch, MAN, WOMAN, person } from '../L09/SstWorld.js';

const W = 680, H = 520, GY = 440;
const MAP = [0, 1, 2, 3].map((idx) => [{ idx, dwellMs: null }]);
const CHIPS = [
  { id: 'qual', label: 'Quality', targets: ['qual'], tone: 3 },
  { id: 'price', label: 'Price', targets: ['price'], tone: 2 },
  { id: 'court', label: 'Court', targets: ['court'], tone: 5 },
  { id: 'bank', label: 'Bank', targets: ['bank'], tone: 8 },
];
const PANEL = { qual: [10, 10], price: [345, 10], court: [10, 265], bank: [345, 265] };
const PW = 325, PH = 245;

// Eighteen crafts as plain icons, each centred on 0,0 in about 66 x 66, in the current fill and stroke.
// The book names weavers, silk weavers and ivory workers; the rest are generic examples. Second colour d.
const line = (ctx, ...pts) => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); };
const disc = (ctx, x, y, r) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); };
const CRAFTS = [
  (ctx, d) => { // potter: a pot
    ctx.beginPath(); ctx.moveTo(-14, -28); ctx.lineTo(14, -28); ctx.lineTo(10, -16); ctx.bezierCurveTo(44, -2, 26, 30, 0, 30); ctx.bezierCurveTo(-26, 30, -44, -2, -10, -16); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = d; ctx.lineWidth = 4; line(ctx, [-24, 2], [24, 2]);
  },
  (ctx, d) => { // weaver: a loom
    line(ctx, [-28, -30], [-28, 30]); line(ctx, [28, -30], [28, 30]); line(ctx, [-32, -24], [32, -24]);
    rr(ctx, -20, -18, 40, 34, 3); ctx.fill(); ctx.strokeStyle = d; ctx.lineWidth = 3;
    for (let y = -10; y < 16; y += 9) line(ctx, [-20, y], [20, y]);
  },
  (ctx, d) => { // silk weaver: a skein on a spool
    rr(ctx, -30, -28, 60, 10, 4); ctx.fill(); rr(ctx, -30, 18, 60, 10, 4); ctx.fill(); rr(ctx, -20, -20, 40, 40, 8); ctx.fill();
    ctx.strokeStyle = d; ctx.lineWidth = 3; for (let y = -14; y < 18; y += 8) line(ctx, [-20, y + 3], [20, y - 3]);
  },
  (ctx) => { // ivory worker: a tusk
    ctx.beginPath(); ctx.moveTo(-30, -24); ctx.bezierCurveTo(-30, 16, 2, 34, 34, 26); ctx.bezierCurveTo(10, 18, -8, 0, -12, -28); ctx.closePath(); ctx.fill();
  },
  (ctx) => { // smith: anvil and hammer
    ctx.beginPath(); ctx.moveTo(-32, 0); ctx.lineTo(30, 0); ctx.lineTo(16, 12); ctx.lineTo(12, 30); ctx.lineTo(-12, 30); ctx.lineTo(-12, 12); ctx.closePath(); ctx.fill();
    ctx.save(); ctx.rotate(-0.6); rr(ctx, -2, -46, 24, 14, 3); ctx.fill(); ctx.restore(); line(ctx, [-8, -14], [14, -34]);
  },
  (ctx) => { // carpenter: an adze
    line(ctx, [-20, 30], [14, -26]); ctx.beginPath(); ctx.moveTo(4, -32); ctx.lineTo(32, -26); ctx.lineTo(36, -10); ctx.lineTo(20, -18); ctx.closePath(); ctx.fill();
  },
  (ctx, d) => { // goldsmith: a ring
    ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(0, 8, 22, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-12, -24); ctx.lineTo(12, -24); ctx.lineTo(0, -8); ctx.closePath(); ctx.fill(); ctx.fillStyle = d; disc(ctx, 0, -20, 3);
  },
  (ctx) => { // oil presser: a drop
    ctx.beginPath(); ctx.moveTo(0, -32); ctx.bezierCurveTo(10, -12, 26, 0, 26, 12); ctx.arc(0, 12, 26, 0, Math.PI); ctx.bezierCurveTo(-26, 0, -10, -12, 0, -32); ctx.fill();
  },
  (ctx, d) => { // stone carver: block and chisel
    rr(ctx, -30, -2, 46, 32, 4); ctx.fill(); ctx.strokeStyle = d; ctx.lineWidth = 3; line(ctx, [-30, 13], [16, 13]); line(ctx, [-8, -2], [-8, 13]);
    ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 7; line(ctx, [8, -8], [30, -30]);
  },
  (ctx, d) => { // basket maker: a basket
    ctx.beginPath(); ctx.moveTo(-30, -6); ctx.lineTo(30, -6); ctx.lineTo(20, 30); ctx.lineTo(-20, 30); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -6, 24, Math.PI, 0); ctx.stroke();
    ctx.strokeStyle = d; ctx.lineWidth = 3; line(ctx, [-26, 6], [26, 6]); line(ctx, [-23, 18], [23, 18]); line(ctx, [-8, -6], [-6, 30]); line(ctx, [8, -6], [6, 30]);
  },
  (ctx) => { // garland maker: flowers on a string
    for (let i = 0; i < 7; i++) { const a = Math.PI * (0.05 + i * 0.15); disc(ctx, Math.cos(a) * 30, Math.sin(a) * 34 - 12, 8); }
  },
  (ctx) => { // leather worker: a sandal
    ctx.beginPath(); ctx.ellipse(0, 0, 18, 32, 0.25, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(-3, -8, 24, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  },
  (ctx, d) => { // dyer: a vat
    rr(ctx, -30, -10, 60, 40, 8); ctx.fill(); rr(ctx, -34, -16, 68, 12, 5); ctx.fill();
    ctx.fillStyle = d; for (const x of [-16, 0, 16]) { rr(ctx, x - 4, -16, 8, 18 + (x === 0 ? 10 : 0), 4); ctx.fill(); }
  },
  (ctx, d) => { // caravan trader: a cart
    rr(ctx, -30, -16, 60, 26, 5); ctx.fill(); line(ctx, [30, 0], [40, 0]);
    disc(ctx, -14, 18, 12); disc(ctx, 14, 18, 12); ctx.fillStyle = d; disc(ctx, -14, 18, 4); disc(ctx, 14, 18, 4);
  },
  (ctx) => { // sailor: a boat
    ctx.beginPath(); ctx.moveTo(-34, 8); ctx.lineTo(34, 8); ctx.lineTo(22, 26); ctx.lineTo(-22, 26); ctx.closePath(); ctx.fill();
    line(ctx, [0, 8], [0, -30]); ctx.beginPath(); ctx.moveTo(4, -28); ctx.lineTo(26, 2); ctx.lineTo(4, 2); ctx.closePath(); ctx.fill();
  },
  (ctx, d) => { // fisher: a fish
    ctx.beginPath(); ctx.ellipse(-4, 0, 26, 15, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(36, -14); ctx.lineTo(36, 14); ctx.closePath(); ctx.fill(); ctx.fillStyle = d; disc(ctx, -18, -3, 3);
  },
  (ctx) => { // bow maker: a bow
    ctx.beginPath(); ctx.arc(-14, 0, 36, -1.1, 1.1); ctx.stroke(); ctx.lineWidth = 3; line(ctx, [2, -32], [2, 32]); line(ctx, [-30, 0], [20, 0]);
  },
  (ctx, d) => { // lamp maker: a lamp
    ctx.beginPath(); ctx.moveTo(-32, 6); ctx.bezierCurveTo(-20, 28, 20, 28, 32, 6); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, -30); ctx.bezierCurveTo(14, -10, 8, 2, 0, 2); ctx.bezierCurveTo(-8, 2, -14, -10, 0, -30); ctx.fill();
    ctx.fillStyle = d; disc(ctx, 0, -6, 3);
  },
];

export class GuildScene extends SimScene {
  static BEAT_STEP_MAP = MAP;
  static CONTINUOUS = false;
  static IRIS = false;
  static NOTE_STAGE = -1;
  static CONTROLS_IN_SIGHT = true;
  static ARIA_LABEL = 'Weavers of one guild at their looms. Then eighteen tiles for eighteen types of guild, each with a craft as an example: potter, weaver, silk weaver, ivory worker, smith and others. Then four panels: a cloth checked for quality, a fixed price between an artisan and a buyer, elders of a guild court hearing a member, and a chest of coins held as a bank.';
  static CONTROLS = [tapLightControl({ id: 'lit', label: 'A guild\u2019s work', chips: CHIPS })];

  tl = tapLight({ chips: CHIPS, onChange: () => { this._at = this.clock; this.animateFor(500); } });
  _at = 0;

  getControlValue(id) { return id === 'lit' ? this.tl.controlValue() : undefined; }
  onControlChange(id, v) { if (id === 'lit') this.tl.fromControl(v); }
  isControlHidden(id) { return id === 'lit' && (this.stage ?? 0) < 2; }

  enter(s) {
    this._at = this.clock;
    this.tl.set({ lit: s === 2 ? 'qual' : s === 3 ? 'bank' : null });
    if (s < 2) this.tl.reset();
  }

  busy() { return this.age < 1.4; }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'plain');
    const s = this.stage ?? 0;
    if (s === 0) this._weavers(ctx, c);
    else if (s === 1) this._eighteen(ctx, c);
    else this._panels(ctx, c);
    drawVignette(ctx, c, 0.25);
  }

  _loom(ctx, c, x, y, tone) {
    const wood = darken(mix(c.s8, c.waste, 0.45), 0.16);
    ctx.fillStyle = wood;
    rr(ctx, x - 70, y - 150, 12, 150, 4); ctx.fill(); rr(ctx, x + 58, y - 150, 12, 150, 4); ctx.fill();
    rr(ctx, x - 78, y - 156, 156, 12, 5); ctx.fill(); rr(ctx, x - 78, y - 70, 156, 10, 5); ctx.fill();
    ctx.fillStyle = tone; rr(ctx, x - 54, y - 144, 108, 76, 4); ctx.fill();
    ctx.strokeStyle = lighten(tone, 0.3); ctx.lineWidth = 4;
    for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x - 54, y - 144 + i * 19); ctx.lineTo(x + 54, y - 144 + i * 19); ctx.stroke(); }
  }

  _weavers(ctx, c) {
    ctx.fillStyle = sky(c); ctx.fillRect(0, 0, W, GY);
    ctx.fillStyle = darken(thatch(c), 0.1); rr(ctx, 18, 92, W - 36, 24, 10); ctx.fill();
    ctx.fillStyle = darken(mix(c.s8, c.waste, 0.5), 0.2);
    [[34], [W - 48]].forEach(([x]) => { rr(ctx, x, 110, 14, GY - 110, 4); ctx.fill(); });
    ground(ctx, c, GY);
    [[150, c.s6, 0, MAN], [340, c.s1, 1, WOMAN], [530, c.s3, 3, MAN]].forEach(([x, tone, i, look]) => {
      this._loom(ctx, c, x, GY + 8, tone);
      person(this, ctx, c, { role: 'worker', pose: 'stand', x: x + 2, y: GY + 54, height: 176, facing: 0, i, look });
    });
    plate(ctx, c, '\u015Bhre\u1E47\u012B: people of one craft', W / 2, 46, { size: 30 });
  }

  _eighteen(ctx, c) {
    ctx.fillStyle = mix(c.bgSurface, sky(c), 0.5); ctx.fillRect(0, 0, W, H);
    say(ctx, c, '18 types of guilds', W / 2, 50, { size: 42 });
    say(ctx, c, 'J\u0101taka literature; these crafts are examples', W / 2, 98, { size: 28, weight: 600, display: false, col: c.labelMuted });
    const cols = 6, cell = 106, x0 = (W - cols * cell) / 2 + 6, y0 = 136, tones = [c.s1, c.s2, c.s3, c.s4, c.s5, c.s8];
    for (let i = 0; i < 18; i++) {
      const a = ease(seg(this.age, i * 0.035, i * 0.035 + 0.25));
      const x = x0 + (i % cols) * cell, y = y0 + Math.floor(i / cols) * cell;
      ctx.save(); ctx.globalAlpha *= a;
      const col = tones[(i * 5) % 6], sz = cell - 12;
      ctx.fillStyle = darken(col, 0.28); rr(ctx, x, y + 6, sz, sz, 14); ctx.fill();
      ctx.fillStyle = col; rr(ctx, x, y, sz, sz, 14); ctx.fill();
      ctx.translate(x + sz / 2, y + sz / 2);
      ctx.fillStyle = lighten(col, 0.62); ctx.strokeStyle = lighten(col, 0.62); ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      CRAFTS[i](ctx, darken(col, 0.3));
      ctx.restore();
    }
  }

  _panels(ctx, c) {
    const lit = this.tl.lit()[0] ?? null, k = ease((this.clock - this._at) / 0.4);
    const draw = { qual: this._qual, price: this._price, court: this._court, bank: this._bank };
    for (const id of Object.keys(PANEL)) {
      const [x, y] = PANEL[id], on = !lit || lit === id;
      ctx.save(); ctx.globalAlpha *= on ? 1 : 0.28;
      ctx.beginPath(); rr(ctx, x, y, PW, PH, 16); ctx.save(); ctx.clip();
      ctx.fillStyle = sky(c); ctx.fillRect(x, y, PW, PH);
      ctx.fillStyle = mix(c.gold, c.s8, 0.4); ctx.fillRect(x, y + PH - 34, PW, 34);
      draw[id].call(this, ctx, c, x, y);
      ctx.restore();
      ctx.lineWidth = lit === id ? 6 : 3; ctx.strokeStyle = lit === id ? c.label : c.stroke; rr(ctx, x, y, PW, PH, 16); ctx.stroke();
      ctx.restore();
      plate(ctx, c, CHIPS.find((h) => h.id === id).label, x + 66, y + 30, { size: 28, alpha: on ? 1 : 0.5 });
    }
    void k;
  }

  _qual(ctx, c, x, y) {
    ctx.fillStyle = c.s1; rr(ctx, x + 40, y + 96, 150, 100, 6); ctx.fill();
    ctx.strokeStyle = lighten(c.s1, 0.3); ctx.lineWidth = 4;
    for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(x + 40, y + 96 + i * 20); ctx.lineTo(x + 190, y + 96 + i * 20); ctx.stroke(); }
    person(this, ctx, c, { role: 'elder', pose: 'point', x: x + 262, y: y + PH - 12, height: 170, facing: -1, i: 0, look: MAN });
    ctx.strokeStyle = c.good; ctx.lineWidth = 11; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(x + 86, y + 146); ctx.lineTo(x + 108, y + 168); ctx.lineTo(x + 150, y + 118); ctx.stroke();
  }

  _price(ctx, c, x, y) {
    person(this, ctx, c, { role: 'worker', pose: 'stand', x: x + 56, y: y + PH - 10, height: 150, facing: 1, i: 0, look: MAN });
    person(this, ctx, c, { role: 'adult', pose: 'stand', x: x + 270, y: y + PH - 10, height: 150, facing: -1, i: 1, look: WOMAN });
    ctx.fillStyle = c.gold; rr(ctx, x + 110, y + 104, 106, 66, 12); ctx.fill();
    ctx.fillStyle = darken(c.gold, 0.3); rr(ctx, x + 110, y + 162, 106, 8, 4); ctx.fill();
    say(ctx, c, 'fixed', x + 163, y + 133, { size: 28, col: mix(c.label, c.bgDeep, 0.2) });
  }

  _court(ctx, c, x, y) {
    const h = 130, m = figureMetrics(h, 'adult'), sy = y + PH - 16 - m.seatSit;
    ctx.fillStyle = stone(c); rr(ctx, x + 22, sy, 210, y + PH - 16 - sy, 10); ctx.fill();
    [[62, 0], [127, 2], [192, 4]].forEach(([dx, i]) => person(this, ctx, c, { role: 'elder', pose: 'sit', seat: { x: x + dx, y: sy }, y: y + PH - 16, height: h, facing: 1, i, look: MAN }));
    person(this, ctx, c, { role: 'worker', pose: 'stand', x: x + 280, y: y + PH - 10, height: 150, facing: -1, i: 3, look: { ...MAN, mood: 'oops' } });
  }

  _bank(ctx, c, x, y) {
    const wood = darken(mix(c.s8, c.waste, 0.45), 0.1);
    ctx.fillStyle = darken(wood, 0.24); rr(ctx, x + 66, y + 112, 196, 104, 12); ctx.fill();
    ctx.fillStyle = wood; rr(ctx, x + 66, y + 108, 196, 96, 12); ctx.fill();
    ctx.fillStyle = c.gold; rr(ctx, x + 74, y + 88, 180, 26, 12); ctx.fill();
    ctx.fillStyle = darken(c.gold, 0.2);
    for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.arc(x + 88 + i * 25, y + 88 + (i % 2) * 4, 12, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = darken(c.gold, 0.34); rr(ctx, x + 150, y + 130, 28, 34, 6); ctx.fill();
  }
}
