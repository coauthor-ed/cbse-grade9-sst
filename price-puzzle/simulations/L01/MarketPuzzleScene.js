/**
 * MarketPuzzleScene - L01 s01 "Why do prices change?" (3 beats). SvgScene, drawn in design units (560 wide
 * landscape, 390 wide portrait) and scaled to the stage width. Cast from shared/MangoKit.js; the stall is SimCivic.
 *   b0 prices move: three things with their price boards (portrait: stacked rows): mangoes Rs 150 -> Rs 75
 *      ("last week -> now"), tomatoes Rs 40 -> Rs 30 ("morning -> evening", a made-up example), a flight seat
 *      Rs 3,000 -> Rs 9,000 ("one day -> another"). The boards flip in turn (0.6 s each); rest: old price small and
 *      struck through, new price big. replay / skip in the figure.
 *   b1 two sides: one mango stall with its price board; buyers (Srivalli, Alex, Israt) under "demand: buyers",
 *      the stall's seller under "supply: sellers"; two arrows meet at the price board.
 *   b2 willing and able: two buyers at the stall, both thinking of a mango. Srivalli has money: pay -> her basket
 *      fills with 2 kg, "willing and able / counts as demand". Alex's purse is open and empty: his basket stays
 *      empty, "willing, not able / not demand". Cold start: the rest state; replay shows the pay step.
 * Colours are tokens only. ASCII only.
 */
import { SvgScene, fill, stroke, shade } from 'simulations/base/kit/SimSvg.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';
import { MANGO_CSS, RS, heap, basket, priceBoard, purse, mango } from '../shared/MangoKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, nameTag, frontSvg } from '../shared/MangoPeople.js';

const f1 = (v) => (+v).toFixed(1);
const AR = '\u2192';
const FLIP_S = 0.6;
const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const ITEMS = [
  { old: 150, now: 75, unit: '/ kg', when: `last week ${AR} now` },
  { old: 40, now: 30, unit: '/ kg', when: `morning ${AR} evening`, made: true },
  { old: 3000, now: 9000, unit: '', when: `one day ${AR} another` },
];

const CSS = `
.mp-ab { position: absolute; transform: translate(-50%, -50%); }
.mp-btn { min-height: 46px; padding: 5px 18px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 20px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.mp-btn--go { background: var(--primary-color, var(--sim-accent)); color: var(--on-primary, var(--sim-ink-on-accent, var(--sim-bg-deep))); border-color: transparent;
  box-shadow: 0 calc(4px * var(--look-lip, 1)) 0 color-mix(in oklab, var(--sim-accent) 55%, var(--sim-stroke)); animation: mp-pulse 1.4s ease-in-out infinite; }
.mp-btn:active { transform: translateY(3px); box-shadow: none; }
.mp-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
@keyframes mp-pulse { 50% { outline: 4px solid color-mix(in oklab, var(--sim-accent) 45%, transparent); outline-offset: 5px; } }
svg .mp-flip { transform-box: fill-box; transform-origin: center; animation: mp-flip 0.5s ease-out both; }
@keyframes mp-flip { 0% { transform: scaleY(0.05); } 100% { transform: none; } }
svg .mp-pop { transform-box: fill-box; transform-origin: center; animation: mp-pop 0.45s cubic-bezier(.3,1.5,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes mp-pop { 0% { transform: scale(0.4); opacity: 0; } 100% { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { svg .mp-flip, svg .mp-pop, .mp-btn--go { animation: none; } }
`;

const text = (x, y, t, size, col = 'var(--sim-label)', anchor = 'middle') =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:800 ${size}px var(--sim-font)">${t}</text>`;

/** An arrow from (x1, y1) to (x2, y2), head at the end. */
function arrow(x1, y1, x2, y2, col, w = 6) {
  const a = Math.atan2(y2 - y1, x2 - x1), hl = w * 3, hw = w * 2;
  const bx = x2 - Math.cos(a) * hl, by = y2 - Math.sin(a) * hl;
  const px = -Math.sin(a) * hw, py = Math.cos(a) * hw;
  return `<path d="M${f1(x1)} ${f1(y1)}L${f1(bx)} ${f1(by)}" ${stroke(col, w)}/>`
    + `<path d="M${f1(x2)} ${f1(y2)}L${f1(bx + px)} ${f1(by + py)}L${f1(bx - px)} ${f1(by - py)}Z" ${fill(col, `stroke:${col};stroke-width:2;stroke-linejoin:round`)}/>`;
}

/** A heap of tomatoes on a tray; (x, y) bottom centre. */
function tomatoes(x, y, r) {
  const col = 'var(--sim-series-6)', rim = shade(col, 70), leaf = 'var(--sim-series-3)';
  const pts = [[-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [-1.5, 1], [-0.5, 1], [0.5, 1], [1.5, 1], [-1, 2], [0, 2], [1, 2], [-0.5, 3], [0.5, 3]];
  const dx = r * 2.05, dy = r * 1.55, tw = 5 * dx + r;
  let out = `<path d="M${f1(x - tw / 2)} ${f1(y - r * 0.9)}H${f1(x + tw / 2)}L${f1(x + tw / 2 - r * 0.8)} ${f1(y)}H${f1(x - tw / 2 + r * 0.8)}Z" ${fill('color-mix(in oklab, var(--sim-series-8) 45%, var(--sim-bg-surface))', 'stroke:color-mix(in oklab, var(--sim-series-8) 60%, var(--sim-label));stroke-width:2;stroke-linejoin:round')}/>`;
  for (const [i, row] of pts) {
    const cx = x + i * dx, cy = y - r * 1.7 - row * dy;
    out += `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}" ${fill(col, `stroke:${rim};stroke-width:1.5`)}/>`
      + `<path d="M${f1(cx - r * 0.45)} ${f1(cy - r * 0.75)}L${f1(cx)} ${f1(cy - r * 0.45)}L${f1(cx + r * 0.45)} ${f1(cy - r * 0.75)}M${f1(cx)} ${f1(cy - r * 0.45)}V${f1(cy - r * 1.05)}" ${stroke(leaf, Math.max(1.5, r * 0.2))}/>`
      + `<ellipse cx="${f1(cx - r * 0.38)}" cy="${f1(cy - r * 0.1)}" rx="${f1(r * 0.22)}" ry="${f1(r * 0.3)}" ${fill('color-mix(in oklab, var(--sim-series-6) 55%, white)', 'opacity:0.6')}/>`;
  }
  return out;
}

/** An aeroplane seat, side view, facing left; (x, y) floor centre, s = height. */
function seat(x, y, s) {
  const col = 'var(--sim-series-5)', rim = shade(col, 62), frame = 'var(--sim-stroke)';
  return `<path d="M${f1(x - s * 0.18)} ${f1(y - s * 0.3)}L${f1(x - s * 0.24)} ${f1(y)}M${f1(x + s * 0.2)} ${f1(y - s * 0.3)}L${f1(x + s * 0.28)} ${f1(y)}M${f1(x - s * 0.3)} ${f1(y)}H${f1(x + s * 0.36)}" ${stroke(frame, Math.max(3, s * 0.05))}/>`
    + `<path d="M${f1(x + s * 0.12)} ${f1(y - s * 0.36)}L${f1(x + s * 0.24)} ${f1(y - s * 0.98)}Q${f1(x + s * 0.26)} ${f1(y - s * 1.08)} ${f1(x + s * 0.36)} ${f1(y - s * 1.04)}L${f1(x + s * 0.4)} ${f1(y - s * 1.0)}Q${f1(x + s * 0.44)} ${f1(y - s * 0.96)} ${f1(x + s * 0.42)} ${f1(y - s * 0.86)}L${f1(x + s * 0.34)} ${f1(y - s * 0.3)}Z" ${fill(col, `stroke:${rim};stroke-width:2.5;stroke-linejoin:round`)}/>`
    + `<rect x="${f1(x + s * 0.24)}" y="${f1(y - s * 1.06)}" width="${f1(s * 0.16)}" height="${f1(s * 0.2)}" rx="${f1(s * 0.05)}" ${fill('color-mix(in oklab, var(--sim-series-5) 30%, var(--sim-bg-surface))', `stroke:${rim};stroke-width:2`)}/>`
    + `<rect x="${f1(x - s * 0.3)}" y="${f1(y - s * 0.42)}" width="${f1(s * 0.66)}" height="${f1(s * 0.14)}" rx="${f1(s * 0.06)}" ${fill(col, `stroke:${rim};stroke-width:2.5`)}/>`
    + `<rect x="${f1(x - s * 0.12)}" y="${f1(y - s * 0.58)}" width="${f1(s * 0.38)}" height="${f1(s * 0.07)}" rx="${f1(s * 0.035)}" ${fill(frame)}/>`;
}

/** A thought bubble holding one mango; (x, y) the bubble centre, (hx, hy) the head it comes from. */
function thought(x, y, r, hx, hy) {
  const face = 'var(--sim-bg-surface)', edge = 'var(--sim-stroke)';
  const t1 = 0.35, t2 = 0.68;
  const d1 = [hx + (x - hx) * t1, hy + (y - hy) * t1], d2 = [hx + (x - hx) * t2, hy + (y - hy) * t2];
  return `<circle cx="${f1(d1[0])}" cy="${f1(d1[1])}" r="${f1(r * 0.13)}" ${fill(face, `stroke:${edge};stroke-width:2`)}/>`
    + `<circle cx="${f1(d2[0])}" cy="${f1(d2[1])}" r="${f1(r * 0.22)}" ${fill(face, `stroke:${edge};stroke-width:2`)}/>`
    + `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" ${fill(face, `stroke:${edge};stroke-width:2.5`)}/>`
    + mango(x, y + r * 0.08, r * 0.52, { leaf: true });
}

const stallArt = (cx, gy, w) => civicSvg('stall', cx, gy, { w }).replace(/<g data-part="goods"[^>]*>[\s\S]*?<\/g>/g, '');

export class MarketPuzzleScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 470;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 3: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'Three prices that change: mangoes 150 rupees a kg last week and 75 now; tomatoes 40 in the morning and 30 in the evening (a made-up example); a flight seat 3,000 rupees one day and 9,000 another. Then a mango stall: buyers on one side (demand), the seller on the other (supply), meeting at the price board. Then two buyers who both want mangoes: Srivalli can pay and her basket fills with 2 kg, which counts as demand; Alex has an empty purse, his basket stays empty: not demand.';

  async setup() {
    this.flipped = 3;
    this.paid = true;
    this.labels = true;
    this.fresh = false;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (b) this.act(b.dataset.act);
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MANGO_CSS + PEOPLE_CSS + CSS; }

  repaint() { super.repaint(); paintPeople(this); }

  enter(step) {
    for (const t of (this._timers ?? []).splice(0)) clearTimeout(t);
    this.fresh = false;
    this.paid = true;
    this.labels = true;
    this.flipped = 3;
    if (step === 0) this.runFlips(0.5);
  }

  runFlips(lead) {
    for (const t of (this._timers ?? []).splice(0)) clearTimeout(t);
    this.flipped = 0;
    this.justFlipped = -1;
    for (let i = 0; i < 3; i++) this.after(lead + i * FLIP_S, () => { this.flipped = i + 1; this.justFlipped = i; this.repaint(); this.justFlipped = -1; });
  }

  act(a) {
    const s = this.stepIndex;
    if (s === 0 && a === 'again') { this.runFlips(0.3); this.repaint(); }
    else if (s === 0 && a === 'skip') this.skip();
    else if (s === 2 && a === 'again') { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.paid = false; this.labels = false; this.repaint(); }
    else if (s === 2 && a === 'pay' && !this.paid) {
      this.paid = true;
      this.fresh = true;
      this.repaint();
      this.fresh = false;
      this.after(1.2, () => { this.labels = true; this.labelPop = true; this.repaint(); this.labelPop = false; });
    }
  }

  skip() {
    if (this.stepIndex === 0 && this.flipped < 3) {
      for (const t of (this._timers ?? []).splice(0)) clearTimeout(t);
      this.flipped = 3;
      this.repaint();
      return true;
    }
    if (this.stepIndex === 2 && this.paid && !this.labels) {
      for (const t of (this._timers ?? []).splice(0)) clearTimeout(t);
      this.labels = true;
      this.repaint();
      return true;
    }
    return false;
  }

  busy() { return (this.stepIndex === 0 && this.flipped < 3) || (this.stepIndex === 2 && this.paid && !this.labels); }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 470) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, k = (st.W / DW).toFixed(4);
    const out = this.stepIndex === 0 ? this.paintPrices(P) : this.stepIndex === 1 ? this.paintSides(P) : this.paintAble(P);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${P ? 600 : 470}px;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  btn(act, label, x, y, go) {
    return `<div class="mp-ab" style="left:${x}px;top:${y}px"><button type="button" class="sv-hit mp-btn${go ? ' mp-btn--go' : ''}" data-act="${act}">${label}</button></div>`;
  }

  // b0: three prices that change.
  paintPrices(P) {
    let svg = '';
    const fmt = (v) => (v >= 1000 ? `${Math.floor(v / 1000)},${String(v % 1000).padStart(3, '0')}` : String(v));
    ITEMS.forEach((it, i) => {
      const L = P
        ? { thing: [82, 24 + i * 176 + 128], board: [262, 24 + i * 176 + 78], old: [262, 24 + i * 176 + 26], when: [262, 24 + i * 176 + 138], made: [82, 24 + i * 176 + 156], bw: 168 }
        : { thing: [96 + i * 184, 190], board: [96 + i * 184, 272], old: [96 + i * 184, 222], when: [96 + i * 184, 334], made: [96 + i * 184, 366], bw: 164 };
      const [tx, ty] = L.thing;
      if (i === 0) svg += heap(tx, ty, 2, { r: P ? 17 : 19, tray: true });
      else if (i === 1) svg += tomatoes(tx, ty, P ? 13 : 14);
      else svg += seat(tx, ty, P ? 120 : 130);
      const done = this.flipped > i, price = done ? it.now : it.old;
      const [bx, by] = L.board;
      svg += `<g${this.justFlipped === i ? ' class="mp-flip"' : ''}>${priceBoard(bx, by, price, { w: L.bw, h: 70, unit: it.unit, active: done })}</g>`;
      if (done) {
        const [ox, oy] = L.old, t = `${RS}${fmt(it.old)}`, tw = t.length * 13;
        svg += `<g${this.justFlipped === i ? ' class="mp-pop"' : ''} opacity="0.85">${text(ox, oy + 8, t, 24, 'var(--sim-label-muted)')}<path d="M${f1(ox - tw / 2 - 6)} ${f1(oy)}H${f1(ox + tw / 2 + 6)}" ${stroke('var(--sim-bad)', 3)}/></g>`;
      }
      svg += text(L.when[0], L.when[1], it.when, P ? 19 : 19, 'var(--sim-label)');
      if (it.made) svg += text(L.made[0], L.made[1], 'made-up example', P ? 16 : 16, 'var(--sim-label-muted)');
    });
    const running = this.flipped < 3;
    const over = P ? this.btn(running ? 'skip' : 'again', running ? 'skip' : 'replay', 195, 566) : this.btn(running ? 'skip' : 'again', running ? 'skip' : 'replay', 280, 428);
    return { svg, over };
  }

  // b1: buyers on one side, sellers on the other. SimFigure people in the overlay, the stall in the SVG.
  paintSides(P) {
    let svg = '', over = '';
    const ink = 'var(--sim-label)';
    const stallH = (w) => w * 200 / 230;
    if (!P) {
      const GY = 404, H = 178, xs = [48, 120, 192], st = [336, 222], sx = 498;
      svg += text(110, 46, 'demand', 34, ink) + text(110, 82, 'buyers', 23, 'var(--sim-label-muted)');
      svg += text(496, 46, 'supply', 34, ink) + text(496, 82, 'sellers', 23, 'var(--sim-label-muted)');
      svg += arrow(174, 58, 262, 58, ink) + arrow(442, 58, 414, 58, ink);
      const top = GY - stallH(st[1]);
      svg += `<path d="M${st[0] - 40} 88V${f1(top + 30)}M${st[0] + 40} 88V${f1(top + 30)}" ${stroke('var(--sim-stroke)', 3)}/>`;
      svg += stallArt(st[0], GY, st[1]);
      svg += heap(st[0], GY - 84 * (st[1] / 230), 3, { r: 12 });
      svg += priceBoard(st[0], 58, 100, { w: 136, h: 62 });
      ['srivalli', 'alex', 'israt'].forEach((w, i) => {
        over += personSlot(w, { x: xs[i], y: GY, h: H, pose: 'stand', facing: 0, mood: 'smile' });
        svg += nameTag(xs[i], GY + 6 + (i === 1 ? 30 : 0), w, 17);
      });
      over += personSlot('sellerA', { x: sx, y: GY, h: H + 4, pose: 'relax', facing: 0, mood: 'smile' });
      svg += nameTag(sx, GY + 6, 'sellerA', 17);
    } else {
      const GY = 214, H = 140, xs = [72, 195, 318], st = [158, 236], SG = 520;
      svg += text(195, 36, 'demand: buyers', 30, ink);
      ['srivalli', 'alex', 'israt'].forEach((w, i) => {
        over += personSlot(w, { x: xs[i], y: GY, h: H, pose: 'stand', facing: 0, mood: 'smile' });
        svg += nameTag(xs[i], GY + 4, w, 17);
      });
      svg += arrow(195, 250, 195, 270, ink);
      const top = SG - stallH(st[1]);
      svg += `<path d="M${st[0] - 30} 326V${f1(top + 24)}M${st[0] + 50} 326V${f1(top + 24)}" ${stroke('var(--sim-stroke)', 3)}/>`;
      svg += stallArt(st[0], SG, st[1]);
      svg += heap(st[0], SG - 84 * (st[1] / 230), 3, { r: 11 });
      svg += priceBoard(195, 300, 100, { w: 150, h: 60 });
      over += personSlot('sellerA', { x: 336, y: SG, h: 144, pose: 'relax', facing: 0, mood: 'smile' });
      svg += nameTag(336, SG + 4, 'sellerA', 17);
      svg += arrow(330, 360, 284, 312, ink);
      svg += text(195, 584, 'supply: sellers', 30, ink);
    }
    return { svg, over };
  }

  // b2: willing and able. Srivalli holds her basket by the handle (it fills when she pays); Alex holds his open,
  // empty purse; his basket stands empty at his feet.
  paintAble(P) {
    let svg = '', front = '', over = '';
    const DW = P ? 390 : 560, DH = P ? 600 : 470;
    const G = P
      ? { st: [195, 236, 178], board: [195, 42], s: [92, 448], a: [298, 448], h: 156, bw: 88, lab: [100, 292], ly: 520, again: [195, 576], btn: [100, 536] }
      : { st: [280, 368, 214], board: [280, 48], s: [104, 368], a: [440, 368], h: 190, bw: 104, lab: [112, 440], ly: 424, again: [280, 440], btn: [112, 440] };
    const [scx, sgy, sw] = G.st, H = G.h;
    svg += `<path d="M${scx - 34} ${G.board[1] + 28}V${f1(sgy - sw * 0.75)}M${scx + 34} ${G.board[1] + 28}V${f1(sgy - sw * 0.75)}" ${stroke('var(--sim-stroke)', 3)}/>`;
    svg += stallArt(scx, sgy, sw) + heap(scx, sgy - 84 * (sw / 230), 3, { r: P ? 9 : 11 });
    svg += priceBoard(G.board[0], G.board[1], 100, { w: 136, h: 60 });
    // Srivalli: basket held in front, both hands on the handle.
    const [sx, sy] = G.s, bw = G.bw, bBot = sy - H * 0.1, bTop = bBot - bw * 0.5, grip = bTop - bw * 0.33;
    over += personSlot('srivalli', { x: sx, y: sy, h: H, pose: 'stand', facing: 0, mood: this.paid ? 'happy' : 'smile',
      hands: [{ x: sx + bw * 0.2, y: grip }, { x: sx - bw * 0.2, y: grip }] });
    front += basket(sx, bBot, this.paid ? 2 : 0, { w: bw, fromKg: this.fresh ? 0 : undefined, per: 0.5 });
    // Alex: the open purse held out towards the stall, empty; his basket on the ground.
    const [ax, ay] = G.a, ph = { x: ax - H * 0.3, y: ay - H * 0.5 }, pw = P ? 50 : 58;
    over += personSlot('alex', { x: ax, y: ay, h: H, pose: 'stand', facing: 0, mood: 'think', hands: [null, ph] });
    front += purse(ph.x, ph.y + pw * 0.72 * 0.86 + 4, { w: pw, open: true });
    const abx = ax + H * 0.36, abw = bw * 0.8;
    svg += basket(abx, ay, 0, { w: abw });
    svg += nameTag(sx, sy + 6, 'srivalli', 17) + nameTag(ax, sy + 6, 'alex', 17);
    const tag = (x, y, t, good) => `<rect x="${f1(x - 31)}" y="${f1(y - 16)}" width="62" height="32" rx="16" ${fill(good ? 'var(--sim-good)' : 'var(--sim-bg-surface)', `stroke:${good ? 'var(--sim-good)' : 'var(--sim-stroke)'};stroke-width:2.5`)}/>` + text(x, y + 7, t, 20, good ? 'var(--sim-bg-deep)' : 'var(--sim-label-muted)');
    if (this.paid) front += `<g${this.fresh ? ' class="mp-pop" style="--d:1.0s"' : ''}>${tag(sx, bBot + 4, '2 kg', true)}</g>`;
    svg += tag(abx, ay - abw * 1.12, '0 kg', false);
    // Thought bubbles: both want a mango.
    const hy = (y) => y - H * 0.86;
    svg += thought(sx + (P ? 52 : 70), hy(sy) - (P ? 46 : 52), P ? 26 : 32, sx + 14, hy(sy) - 18);
    svg += thought(ax - (P ? 52 : 70), hy(ay) - (P ? 46 : 52), P ? 26 : 32, ax - 14, hy(ay) - 18);
    if (this.labels) {
      const pop = this.labelPop ? ' class="mp-pop"' : '';
      const fs = P ? 19 : 22, fs2 = P ? 18 : 20;
      svg += `<g${pop}>${text(G.lab[0], G.ly, 'willing and able', fs, 'var(--sim-good)')}${text(G.lab[0], G.ly + 26, 'counts as demand', fs2, 'var(--sim-label)')}</g>`;
      svg += `<g${pop}>${text(G.lab[1], G.ly, 'willing, not able', fs, 'var(--sim-bad)')}${text(G.lab[1], G.ly + 26, 'not demand', fs2, 'var(--sim-label)')}</g>`;
      over += frontSvg(DW, DH, front) + this.btn('again', 'replay', G.again[0], G.again[1]);
    } else {
      over += frontSvg(DW, DH, front);
      if (!this.paid) {
        over += this.btn('pay', 'pay', G.btn[0], G.btn[1], true);
        svg += text(G.lab[1], G.ly + 14, 'no money', P ? 19 : 22, 'var(--sim-label-muted)');
      }
    }
    return { svg, over };
  }

  testState() {
    return { step: this.stepIndex, flipped: this.flipped, paid: this.paid, labels: this.labels };
  }
}
