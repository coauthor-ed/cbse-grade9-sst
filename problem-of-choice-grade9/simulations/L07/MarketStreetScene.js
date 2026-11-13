/**
 * MarketStreetScene - L07 s02 "Market Economy" (2 beats). Canvas SimScene: the people are SimFigure.
 *   b0 market:  one street, two umbrella stalls, each with a price board (Rs 200) on its canopy and a stock
 *               pile of closed umbrellas in its counter. Rain starts; each stall's queue grows from 3 to 6
 *               buyers (one more every 0.6 s) while the stock pile shrinks from 6 to 3. Each seller reaches up
 *               and changes its own board to Rs 250. No official, no building. Status line:
 *               "more buyers, same umbrellas: the price rises". Round replay button (top right).
 *               Rest: rain, 6 buyers at each stall, boards at 250.
 *   b1 referee: the same street (queues dimmed); a referee (plain striped shirt, whistle, no badge) stands
 *               between the stalls. Two buttons inside the canvas: "broken umbrella sold as new" (the referee
 *               blows the whistle and points; a red "foul" card pops over stall 1's broken umbrella) and
 *               "seller changes price" (stall 2's board goes 250 -> 280; the referee does nothing; a tag
 *               "price: up to the market"). On entry both play once. Rest: the foul called, the price left alone.
 * One layout (canvas), sized to read at 390 px. Colours are tokens only (this.colors). The rupee sign is built
 * from its char code. ASCII only.
 */
import { SimScene } from 'simulations/base/kit/SimScene.js';
import { drawBackdrop, pill, font, rr, mix, darken, alpha, clamp01, outBack } from 'simulations/base/kit/SimLook.js';
import { drawFigure, figureFor } from 'simulations/base/kit/SimFigure.js';

const RS = String.fromCharCode(0x20B9);
const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const SX = [140, 420];        // stall centres
const GY = 250;               // stall ground
const QY = 372;               // queue ground
const STEP = 0.6;
const RAIN0 = 0.4;            // rain starts
const Q0 = 0.8;               // first extra buyer
const FLIP = 2.6;             // boards change
const B0_END = 3.7;
const BTN = [
  { id: 'foul', label: 'broken umbrella sold as new', x: 12, y: 410, w: 300, h: 60 },
  { id: 'price', label: 'seller changes price', x: 324, y: 410, w: 224, h: 60 },
];
const REPLAY = { x: 528, y: 36, r: 26 };
const BUYER_LOOKS = [
  { role: 'student', look: { outfit: 'uniform' } }, { role: 'adult' }, { role: 'elder' },
  { role: 'adult' }, { role: 'worker' }, { role: 'student' },
];

const seeded = (i, k) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };

export class MarketStreetScene extends SimScene {
  static WIDTH = 560;
  static HEIGHT = 480;
  static CONTINUOUS = false;
  static DRAGGABLE = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 2: [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]] };
  static CONTROLS = [];
  static ARIA_LABEL = 'A made-up example. A rainy street with two umbrella stalls. Each stall has a price board at 200 rupees and a pile of umbrellas. Rain starts: the queue at each stall grows from 3 to 6 buyers and the piles shrink. Each seller changes the board to 250 rupees: more buyers, same umbrellas, the price rises. Then a referee stands between the stalls. When a seller sells a broken umbrella as new, the referee blows the whistle: foul. When a seller changes the price, the referee does nothing: the price is up to the market.';

  enter(stage) {
    this.run0 = 0;
    this.ev1 = stage === 1 ? 0.5 : -1;
    this.ev2 = stage === 1 ? 1.4 : -1;
  }

  busy() {
    if (this.stage === 0) return this.age - this.run0 < B0_END;
    return this.age < Math.max(this.ev1, this.ev2) + 1.4;
  }

  pointerDown(p) {
    if (this.stage === 0) {
      if (Math.hypot(p.x - REPLAY.x, p.y - REPLAY.y) < REPLAY.r + 10) { this.run0 = this.age; return true; }
      return false;
    }
    for (const b of BTN) {
      if (p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y - 6 && p.y <= b.y + b.h + 6) {
        if (b.id === 'foul') this.ev1 = this.age; else this.ev2 = this.age;
        return true;
      }
    }
    return false;
  }

  /** b0 timeline values for run time u. */
  market(u) {
    const steps = Math.max(0, Math.min(3, Math.floor((u - Q0) / STEP) + 1));
    let nf = 3;
    for (let i = 0; i < 3; i++) { const e = clamp01((u - Q0 - i * STEP) / 0.45); nf += e * e * (3 - 2 * e); }
    return {
      rain: clamp01((u - RAIN0) / 0.6),
      buyers: 3 + steps,
      nf,
      stock: 6 - steps,
      reach: u > FLIP - 0.5 && u < FLIP + 0.5,
      flip: clamp01((u - FLIP) / 0.35),
      say: clamp01((u - FLIP - 0.5) / 0.4),
      rainT: Math.min(u, B0_END),
    };
  }

  drawRain(ctx, c, k, t) {
    if (k <= 0) return;
    ctx.save();
    ctx.strokeStyle = alpha(c.water, 0.55 * k);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    for (let i = 0; i < 46; i++) {
      const x = seeded(i, 1) * 600 - 20, y0 = seeded(i, 2) * 400;
      const y = ((y0 + t * 420) % 400) - 20, x2 = x + ((y + 20) / 400) * 0;
      ctx.beginPath(); ctx.moveTo(x2, y); ctx.lineTo(x2 - 5, y + 18); ctx.stroke();
    }
    ctx.restore();
  }

  drawStreet(ctx, c, rain) {
    ctx.fillStyle = alpha(c.stroke, 0.06 + 0.06 * rain);
    ctx.fillRect(0, 0, 560, GY);
    ctx.fillStyle = alpha(c.stroke, 0.16);
    ctx.fillRect(0, GY, 560, 480 - GY);
    ctx.fillStyle = alpha(c.stroke, 0.3);
    ctx.fillRect(0, GY, 560, 3);
    if (rain > 0) {
      ctx.fillStyle = alpha(c.water, 0.22 * rain);
      for (const [x, y, w] of [[60, 402, 70], [280, 300, 54], [500, 404, 64], [280, 456, 90]]) {
        ctx.beginPath(); ctx.ellipse(x, y, w, 7, 0, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  /** An open umbrella: dome on (x, y), radius r; broken = one panel bent up and a bent handle. */
  openUmbrella(ctx, c, x, y, r, col, broken) {
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.strokeStyle = darken(c.label, 0.1);
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (broken) { ctx.moveTo(x, y); ctx.lineTo(x + 4, y + r * 0.6); ctx.lineTo(x + r * 0.28, y + r * 0.86); }
    else { ctx.moveTo(x, y); ctx.lineTo(x, y + r * 0.8); ctx.arc(x - r * 0.13, y + r * 0.8, r * 0.13, 0, Math.PI); }
    ctx.stroke();
    const n = 4, dx = (2 * r) / n;
    ctx.beginPath();
    ctx.moveTo(x - r, y);
    ctx.arc(x, y, r, Math.PI, 0);
    for (let i = n - 1; i >= 0; i--) ctx.quadraticCurveTo(x - r + (i + 0.5) * dx, y - r * 0.16, x - r + i * dx, y);
    ctx.closePath();
    ctx.fillStyle = col; ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = darken(col, 0.3); ctx.stroke();
    ctx.strokeStyle = alpha(darken(col, 0.35), 0.7); ctx.lineWidth = 2;
    for (let i = 1; i < n; i++) { const px = x - r + i * dx; ctx.beginPath(); ctx.moveTo(x, y - r); ctx.quadraticCurveTo(px + (px - x) * 0.1, y - r * 0.5, px, y); ctx.stroke(); }
    if (broken) {
      ctx.beginPath(); ctx.moveTo(x + r * 0.5, y - r * 0.2); ctx.lineTo(x + r * 1.15, y - r * 0.95); ctx.lineTo(x + r * 0.95, y - r * 0.15); ctx.closePath();
      ctx.fillStyle = darken(col, 0.18); ctx.fill(); ctx.strokeStyle = darken(col, 0.4); ctx.lineWidth = 2.5; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - r * 0.55, y - r * 0.62); ctx.lineTo(x - r * 0.38, y - r * 0.45); ctx.lineTo(x - r * 0.5, y - r * 0.3); ctx.lineTo(x - r * 0.3, y - r * 0.15); ctx.lineTo(x - r * 0.42, y - r * 0.02);
      ctx.strokeStyle = c.bgSurface; ctx.lineWidth = 4; ctx.lineJoin = 'miter'; ctx.stroke();
    }
    ctx.restore();
  }

  /** A closed umbrella lying flat, left to right, centred on (x, y), length L. */
  closedUmbrella(ctx, c, x, y, L, col) {
    const x0 = x - L / 2, t = 6;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x0 + L * 0.22, y - t);
    ctx.lineTo(x0 + L * 0.9, y - 1.5);
    ctx.lineTo(x0 + L * 0.9, y + 1.5);
    ctx.lineTo(x0 + L * 0.22, y + t);
    ctx.quadraticCurveTo(x0 + L * 0.16, y, x0 + L * 0.22, y - t);
    ctx.fillStyle = col; ctx.fill();
    ctx.strokeStyle = darken(col, 0.35); ctx.lineWidth = 2; ctx.stroke();
    ctx.strokeStyle = darken(c.label, 0.1); ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x0 + L * 0.9, y); ctx.lineTo(x0 + L, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x0 + L * 0.2, y); ctx.lineTo(x0 + L * 0.06, y); ctx.arc(x0 + L * 0.06, y + 6, 6, -Math.PI / 2, Math.PI / 2, true); ctx.stroke();
    ctx.restore();
  }

  priceBoard(ctx, c, cx, price, k, fresh) {
    const w = 112, h = 46, y = 18, s = fresh ? 1 + 0.18 * Math.sin(Math.PI * k) : 1;
    ctx.save();
    ctx.strokeStyle = darken(c.stroke, 0.1); ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx - 30, y + h); ctx.lineTo(cx - 30, 62); ctx.moveTo(cx + 30, y + h); ctx.lineTo(cx + 30, 62); ctx.stroke();
    ctx.translate(cx, y + h / 2); ctx.scale(s, s);
    rr(ctx, -w / 2, -h / 2 + 4, w, h, 12); ctx.fillStyle = darken(fresh ? c.accent : c.stroke, 0.2); ctx.fill();
    rr(ctx, -w / 2, -h / 2, w, h, 12); ctx.fillStyle = fresh ? mix(c.accent, c.bgSurface, 0.8) : c.bgSurface; ctx.fill();
    ctx.lineWidth = fresh ? 3.5 : 3; ctx.strokeStyle = fresh ? c.accent : c.stroke; ctx.stroke();
    ctx.font = font(c, 800, 28); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = c.label;
    ctx.fillText(`${RS}${price}`, 0, 2);
    ctx.restore();
  }

  /** One stall: poles, striped canopy, the seller behind the counter, a display umbrella, the stock pile. */
  stall(ctx, c, k, o) {
    const cx = SX[k], top = 62, ch = 34, half = 98, col = k ? c.s6 : c.s1, stripe = k ? c.s7 : c.s5;
    const wood = mix(c.s8, c.label, 0.46);
    ctx.save();
    ctx.globalAlpha *= o.alpha ?? 1;
    ctx.fillStyle = wood;
    for (const px of [cx - half + 8, cx + half - 14]) { rr(ctx, px, top + ch - 4, 6, GY - top - ch + 4, 3); ctx.fill(); }
    const spec = figureFor(this, { role: 'shopkeeper', pose: o.reach ? 'reach-up' : 'stand', x: cx - 34, y: GY - 6, height: 136, facing: 0, i: k ? 5 : 2, mood: 'smile' });
    drawFigure(ctx, c, spec, spec.look);
    this.openUmbrella(ctx, c, cx + 50, GY - 100, 36, col, !!o.broken);
    const cw = 186, cy = GY - 74;
    rr(ctx, cx - cw / 2, cy + 4, cw, 74, 8); ctx.fillStyle = darken(wood, 0.3); ctx.fill();
    rr(ctx, cx - cw / 2, cy, cw, 74, 8); ctx.fillStyle = wood; ctx.fill();
    rr(ctx, cx - cw / 2 + 8, cy + 8, cw - 16, 60, 6); ctx.fillStyle = mix(wood, c.bgDeep, 0.55); ctx.fill();
    for (let i = 0; i < o.stock; i++) this.closedUmbrella(ctx, c, cx + (i % 2 ? 6 : -6), cy + 60 - i * 10, 150, i % 2 ? darken(col, 0.08) : col);
    // canopy: stripes and a scalloped edge
    ctx.save();
    rr(ctx, cx - half - 6, top, 2 * half + 12, ch, 8); ctx.clip();
    for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? c.bgSurface : stripe; ctx.fillRect(cx - half - 6 + i * ((2 * half + 12) / 8), top, (2 * half + 12) / 8 + 0.5, ch); }
    ctx.restore();
    const n = 8, sw = (2 * half + 12) / n;
    for (let i = 0; i < n; i++) {
      ctx.beginPath(); ctx.arc(cx - half - 6 + (i + 0.5) * sw, top + ch, sw / 2, 0, Math.PI);
      ctx.fillStyle = i % 2 ? c.bgSurface : stripe; ctx.fill(); ctx.strokeStyle = darken(stripe, 0.3); ctx.lineWidth = 2; ctx.stroke();
    }
    rr(ctx, cx - half - 6, top, 2 * half + 12, ch, 8); ctx.strokeStyle = darken(stripe, 0.3); ctx.lineWidth = 2.5; ctx.stroke();
    ctx.restore();
    this.priceBoard(ctx, c, cx, o.price, o.flip, o.fresh);
  }

  /** A queue of nf buyers (nf may be fractional: the newest one fades and drops in at the back). */
  queue(ctx, c, k, nf, a) {
    const gap = 42, n = Math.ceil(nf - 0.001), dir = k ? 1 : -1;
    for (let i = n - 1; i >= 0; i--) {
      const e = clamp01(nf - i), x = SX[k] + (i - (nf - 1) / 2) * gap * dir;
      const b = BUYER_LOOKS[(i + k * 3) % BUYER_LOOKS.length];
      ctx.save();
      ctx.globalAlpha *= a * e;
      const spec = figureFor(this, { role: b.role, pose: 'stand', x, y: QY + (i % 2) * 4 - (1 - e) * 16, height: 96, facing: 0, i: 10 + i + k * 6, mood: 'smile', look: b.look });
      drawFigure(ctx, c, spec, spec.look);
      ctx.restore();
    }
  }

  referee(ctx, c, blow, card) {
    const x = 284, y = GY + 12, hand = { x: 254, y: 112 };
    const spec = figureFor(this, { role: 'adult', pose: blow ? 'stand' : 'relax', x, y, height: 150, facing: 0, i: 7, mood: blow ? 'squint' : 'smile',
      ...(blow ? { hands: [null, hand] } : {}),
      look: { outfit: 'tee', top: 'white', pattern: 'stripes', bottom: 'charcoal', shoeStyle: 'sneaker', hairStyle: 'short' } });
    const sk = drawFigure(ctx, c, spec, spec.look);
    const hd = sk?.anchors?.head ?? { x, y: y - 130, r: 14 };
    const wx = hd.x + (blow ? -hd.r * 0.9 : hd.r * 0.2), wy = hd.y + hd.r * 0.7;
    ctx.save();
    ctx.strokeStyle = c.labelMuted; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(wx, wy + 4); ctx.quadraticCurveTo(hd.x, hd.y + hd.r * 2.4, hd.x + hd.r * 0.6, hd.y + hd.r * 1.2); ctx.stroke();
    rr(ctx, wx - 9, wy - 4, 16, 9, 4); ctx.fillStyle = c.gold; ctx.fill(); ctx.strokeStyle = darken(c.gold, 0.4); ctx.lineWidth = 1.5; ctx.stroke();
    if (blow) {
      ctx.strokeStyle = c.accent; ctx.lineWidth = 3; ctx.lineCap = 'round';
      for (const [a, l] of [[-0.5, 18], [0, 22], [0.5, 18]]) {
        const ax = wx - 14, ay = wy;
        ctx.beginPath(); ctx.moveTo(ax - Math.cos(a) * 6, ay + Math.sin(a) * 6); ctx.lineTo(ax - Math.cos(a) * (6 + l), ay + Math.sin(a) * (6 + l)); ctx.stroke();
      }
    }
    ctx.restore();
    pill(ctx, c, 'referee', x - 4, GY + 24, { size: 17, bg: c.bgSurface, ink: c.label });
    if (blow) this.foulCard(ctx, c, card, hand);
  }

  /** The red card, held up in the referee's hand (k: pop-in 0..1). */
  foulCard(ctx, c, k, hand) {
    if (k <= 0) return;
    const s = outBack(clamp01(k));
    ctx.save();
    ctx.translate(hand.x - 4, hand.y - 30); ctx.rotate(-0.14); ctx.scale(s, s);
    rr(ctx, -30, -38 + 4, 60, 76, 9); ctx.fillStyle = darken(c.bad, 0.35); ctx.fill();
    rr(ctx, -30, -38, 60, 76, 9); ctx.fillStyle = c.bad; ctx.fill();
    ctx.font = font(c, 800, 20); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = c.bgSurface;
    ctx.fillText('foul', 0, 0);
    ctx.restore();
  }

  button(ctx, c, b, on) {
    rr(ctx, b.x, b.y + 4, b.w, b.h, 14); ctx.fillStyle = darken(on ? c.accent : c.stroke, 0.2); ctx.fill();
    rr(ctx, b.x, b.y, b.w, b.h, 14); ctx.fillStyle = on ? mix(c.accent, c.bgSurface, 0.84) : c.bgSurface; ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = on ? c.accent : c.stroke; ctx.stroke();
    ctx.font = font(c, 800, 19); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = c.label;
    ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2 + 1);
  }

  replayButton(ctx, c) {
    const { x, y, r } = REPLAY;
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y + 3, r, 0, Math.PI * 2); ctx.fillStyle = darken(c.stroke, 0.2); ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = c.bgSurface; ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = c.stroke; ctx.stroke();
    ctx.strokeStyle = c.label; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(x, y, 12, -Math.PI * 0.35, Math.PI * 1.35); ctx.stroke();
    const ax = x + Math.cos(-Math.PI * 0.35) * 12, ay = y + Math.sin(-Math.PI * 0.35) * 12;
    ctx.beginPath(); ctx.moveTo(ax - 9, ay - 3); ctx.lineTo(ax + 1, ay - 1); ctx.lineTo(ax - 1, ay + 9); ctx.stroke();
    ctx.restore();
  }

  draw(ctx, c) {
    drawBackdrop(ctx, c, 'plain');
    ctx.font = font(c, 800, 16); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = c.labelMuted;
    if (this.stage === 0) {
      const m = this.market(this.age - this.run0);
      this.drawStreet(ctx, c, m.rain);
      ctx.font = font(c, 800, 18); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = c.labelMuted;
      ctx.fillText('a made-up example', 12, 469);
      for (let k = 0; k < 2; k++) {
        this.stall(ctx, c, k, { stock: m.stock, price: m.flip >= 0.5 ? 250 : 200, flip: m.flip, fresh: m.flip > 0, reach: m.reach });
        this.queue(ctx, c, k, m.nf, 1);
        pill(ctx, c, `${m.buyers} buyers`, SX[k], QY + 22, { size: 18, bg: m.buyers > 3 ? c.accent : c.bgSurface, ink: m.buyers > 3 ? undefined : c.label });
      }
      this.drawRain(ctx, c, m.rain, m.rainT);
      if (m.say > 0) {
        ctx.save(); ctx.globalAlpha *= m.say;
        ctx.font = font(c, 800, 21); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = c.label;
        ctx.fillText('more buyers, same umbrellas: the price rises', 280, 438);
        ctx.restore();
      }
      this.replayButton(ctx, c);
      return;
    }
    // b1 referee
    this.drawStreet(ctx, c, 1);
    ctx.font = font(c, 800, 17); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = c.labelMuted;
    ctx.fillText('a made-up example', 12, 394);
    const e1 = this.ev1 >= 0 ? this.age - this.ev1 : -1, e2 = this.ev2 >= 0 ? this.age - this.ev2 : -1;
    const p2 = e2 >= 0 ? clamp01((e2 - 0.4) / 0.35) : 0;
    this.stall(ctx, c, 0, { stock: 3, price: 250, flip: 0, fresh: false, broken: true });
    this.stall(ctx, c, 1, { stock: 3, price: p2 >= 0.5 ? 280 : 250, flip: p2, fresh: p2 > 0 && p2 < 1 || (e2 >= 0 && e2 < 1.6), reach: e2 >= 0 && e2 < 0.9 });
    this.queue(ctx, c, 0, 6, 0.3);
    this.queue(ctx, c, 1, 6, 0.3);
    this.drawRain(ctx, c, 0.7, 0);
    this.referee(ctx, c, e1 >= 0, (e1 - 0.2) / 0.4);
    if (p2 > 0) pill(ctx, c, 'price: up to the market', 448, GY + 24, { size: 17, bg: c.bgSurface, ink: c.label, alpha: clamp01((e2 - 0.8) / 0.3) });
    this.button(ctx, c, BTN[0], e1 >= 0 && e1 < 1.4);
    this.button(ctx, c, BTN[1], e2 >= 0 && e2 < 1.4);
  }

  testState() {
    const m = this.market(this.age - this.run0);
    return { stage: this.stage, busy: this.busy(), buyers: this.stage ? 6 : m.buyers, price: this.stage ? null : (m.flip >= 0.5 ? 250 : 200), foul: this.ev1 >= 0, priceEvent: this.ev2 >= 0 };
  }
}
