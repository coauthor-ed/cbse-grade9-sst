/**
 * BondScene - L04 s05 "Bonds" (3 beats). SvgScene, design 560 x 480 landscape, 390 x 620 portrait.
 * Cast: Ravi and a buyer (registered here), the bond note of FourOptionsScene (ruled sheet + seal), SimCivic
 * parliament (a government) and factory (a company), MoneyKit coins and tags.
 *   b0 A loan you give: the bond note (Rs 10,000, 5% a year, 1 year, made-up numbers). Ravi lends Rs 10,000 to a
 *      government (arrow out); one year later the arrow comes back: "Rs 10,000 back" and "+Rs 500 interest";
 *      big total "Rs 10,500 in all". Plays in on entry (about 3 s); replay. Rest / cold start: all shown.
 *   b1 From 1 day to 30 years: a long scale (1 day, 1 month, 1 year, 5, 10, 30+ years) with three bond notes on it;
 *      below, Ravi sells his note to a buyer before maturity; the price tag shows "?" and "not known in advance".
 *      "pick a day" shows a made-up price for one sale day (it changes from day to day). Cold start: "?".
 *   b2 Government and company bonds: two cards side by side (portrait: stacked): government bond 7% a year,
 *      "safer, lower rate", Rs 700 a year on Rs 10,000; company bond 9% a year, "riskier, higher rate", Rs 900.
 *      Made-up rates. "company runs short of money": the company card's Rs 900 turns to "may come late, or not
 *      at all"; the government card stays. Cold start: normal year.
 * Tokens only. ASCII only.
 */
import { SvgScene, stroke, fill, shade } from 'simulations/base/kit/SimSvg.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';
import { MONEY_CSS, TONE, coin, tag, rs } from '../shared/MoneyKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, nameTag, registerCast } from '../shared/FinPeople.js';

registerCast('ravi', { name: 'Ravi', series: 4, role: 'adult', i: 13,
  look: { outfit: 'shirt', hairStyle: 'sidepart', top: 's4', bottom: 'khaki', shoeStyle: 'shoe', shoe: 'brown', pattern: 'plain', moustache: true, dupatta: false, glasses: false, girth: 1.04 } });
registerCast('buyer', { name: 'Buyer', series: 7, role: 'adult', i: 14,
  look: { outfit: 'kurti', hairStyle: 'long', top: 's7', bottom: 'cream', dupatta: false, trim: 'cream', shoeStyle: 'sandal', shoe: 'brown', pattern: 'plain', moustache: false, glasses: false, girth: 1 } });

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const P0 = 10000, RATE = 5, INT = P0 * RATE / 100, TOTAL = P0 + INT;          // 500, 10,500
const GOV = 7, CO = 9;                                                       // made-up rates
const MUTED = 'var(--sim-label-muted)', ACC = 'var(--sim-accent)', INK = 'var(--sim-label)';
const ACC_INK = shade('var(--sim-accent)', 62);
const SAVE = TONE.save, SAVE_INK = shade(TONE.save, 62), BAD = 'var(--sim-bad)', BAD_INK = shade('var(--sim-bad)', 80);
const NOTE = 'var(--sim-series-6)';
/** Made-up prices for "pick a day" (b1): a sale day's price is not known in advance. */
const DAY_PRICES = [9850, 10240, 10060, 9700, 10180];
/** The maturity scale: label, position 0..1 (log-like). */
const SCALE = [['1 day', 0], ['1 month', 0.2], ['1 year', 0.4], ['5 years', 0.6], ['10 years', 0.8], ['30+ years', 1]];

const CSS = `
.bd-ab { position: absolute; transform: translate(-50%, -50%); }
.bd-btn { min-height: 48px; padding: 5px 18px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 21px/1.1 var(--sim-font); background: var(--sim-accent); color: var(--sim-bg-deep);
  border: 2.5px solid color-mix(in oklab, var(--sim-accent) 70%, black); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 color-mix(in oklab, var(--sim-accent) 60%, black); }
.bd-btn--quiet { background: var(--sim-bg-surface); color: var(--sim-label); border-color: var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); font-size: 20px; }
.bd-btn:active { transform: translateY(3px); box-shadow: none; }
.bd-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
svg .bd-growr { transform-box: fill-box; transform-origin: right center; animation: mk-grow 0.6s ease-out both; animation-delay: var(--d, 0s); }
@media (prefers-reduced-motion: reduce) { svg .bd-growr { animation: none; } }
`;

const text = (x, y, t, size, col = INK, anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;
const panel = (x, y, w, h, o = {}) => `<rect x="${f1(x)}" y="${f1(y + 4)}" width="${f1(w)}" height="${f1(h)}" rx="16" ${fill('var(--sim-stroke)')}/>`
  + `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="16" ${fill(o.bg ?? 'var(--sim-bg-surface)', `stroke:${o.edge ?? 'var(--sim-stroke)'};stroke-width:${o.sw ?? 2.5}`)}/>`;
const pill = (cx, cy, label, size = 21, o = {}) => {
  const w = label.length * size * 0.56 + 28, h = size + 18;
  return `<rect x="${f1(cx - w / 2)}" y="${f1(cy - h / 2)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(h / 2)}" ${fill(o.bg ?? 'color-mix(in oklab, var(--sim-accent) 18%, var(--sim-bg-surface))', `stroke:${o.edge ?? 'var(--sim-accent)'};stroke-width:2.5`)}/>`
    + text(cx, cy + size * 0.36, label, size, o.ink ?? ACC_INK);
};
/** A horizontal arrow from x1 to x2 at y (head at x2). */
const arrow = (x1, y, x2, col, w = 6) => {
  const d = x2 > x1 ? 1 : -1;
  return `<path d="M${f1(x1)} ${f1(y)}H${f1(x2 - d * 14)}" ${stroke(col, w)}/>`
    + `<path d="M${f1(x2)} ${f1(y)}l${f1(-d * 20)} -13v26z" ${fill(col)}/>`;
};
/** The bond note (the FourOptionsScene art, bigger): a ruled sheet with a seal; lines of text on it. */
function note(cx, cy, w, h, o = {}) {
  const x0 = cx - w / 2, y0 = cy - h / 2, col = o.col ?? NOTE;
  let s = `<g transform="rotate(${o.rot ?? -3} ${f1(cx)} ${f1(cy)})"${o.dim ? ' style="opacity:0.35"' : ''}>`
    + `<rect x="${f1(x0)}" y="${f1(y0 + 4)}" width="${f1(w)}" height="${f1(h)}" rx="8" ${fill('var(--sim-stroke)')}/>`
    + `<rect x="${f1(x0)}" y="${f1(y0)}" width="${f1(w)}" height="${f1(h)}" rx="8" ${fill(`color-mix(in oklab, ${col} 14%, var(--sim-bg-surface))`, 'stroke:var(--sim-stroke);stroke-width:2.4')}/>`
    + `<rect x="${f1(x0 + 5)}" y="${f1(y0 + 5)}" width="${f1(w - 10)}" height="${f1(h - 10)}" rx="5" ${fill('none', `stroke:${col};stroke-width:1.6;stroke-dasharray:5 4`)}/>`;
  const sr = o.seal ?? Math.min(w, h) * 0.13;
  s += `<circle cx="${f1(x0 + w - sr - 12)}" cy="${f1(y0 + h - sr - 10)}" r="${f1(sr)}" ${fill(col, `stroke:${shade(col, 66)};stroke-width:2`)}/>`;
  if (o.lines) s += o.lines;
  else for (let i = 0; i < 3; i++) s += `<path d="M${f1(x0 + w * 0.14)} ${f1(y0 + h * (0.3 + i * 0.2))}H${f1(x0 + w * (i === 2 ? 0.5 : 0.78))}" ${stroke(MUTED, 2.4)}/>`;
  return s + '</g>';
}

export class BondScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 620;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'A bond is a loan you give. Made-up numbers: Ravi lends 10,000 rupees to a government with a bond that pays 5% a year. After one year he gets 500 rupees interest and his 10,000 rupees back, 10,500 rupees in all. Bonds run from 1 day to 30 years or more. Ravi can sell his bond to a buyer before maturity, but the price on the day of sale is not known in advance. A government bond is safer and pays a lower rate, made-up 7% a year, 700 rupees a year on 10,000. A company bond is riskier and pays a higher rate, made-up 9% a year, 900 rupees; if the company runs short of money, that interest may come late or not at all.';

  async setup() {
    this.fresh = false;
    this.day = -1;
    this.short = false;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b) return;
      const a = b.dataset.act;
      if (a === 'replay') this.play();
      else if (a === 'day') { this.day = (this.day + 1) % DAY_PRICES.length; this.repaint(); }
      else if (a === 'short') { this.short = !this.short; this.repaint(); }
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MONEY_CSS + PEOPLE_CSS + CSS; }

  repaint() { super.repaint(); paintPeople(this); }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.fresh = false; }

  enter(step) {
    this.clear();
    this.day = -1;
    this.short = false;
    if (step === 0) this.after(0.05, () => this.play());
  }

  /** b0: the loan plays in (CSS delays); the rest markup is the same, so no repaint is needed at the end. */
  play() {
    if (this.stepIndex !== 0) return;
    this.clear();
    this.fresh = true;
    this.after(3.4, () => { this.fresh = false; this.repaint(); });
    this.repaint();
  }

  skip() {
    if (!this.fresh) return false;
    this.clear();
    this.repaint();
    return true;
  }

  busy() { return this.fresh; }

  stageHeight(st) { return Math.round((st.portrait ? 620 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 620 : 480, k = (st.W / DW).toFixed(4), v = this.stepIndex;
    const out = v === 1 ? this.paintTerm(P) : v === 2 ? this.paintKinds(P) : this.paintLoan(P);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  /** A piece that pops in at delay d on the fresh play (plain group at rest). */
  pop(d, body, cls = 'mk-pop') { return `<g${this.fresh ? ` class="${cls}" style="--d:${d}s"` : ''}>${body}</g>`; }

  // b0: Ravi lends Rs 10,000; one year later Rs 10,000 back + Rs 500 interest = Rs 10,500.
  paintLoan(P) {
    let svg = '', over = '';
    const G = P
      ? { note: [195, 72, 250, 112], rv: [52, 356, 160], gov: [318, 352, 136], ax: [96, 246], yOut: 200, yBack: 284,
        lOut: 186, lBack1: 318, lBack2: 344, yr: [171, 242], tot: [20, 420, 350, 104], totY: 500, sub: 448, replay: [195, 584], made: [195, 548] }
      : { note: [280, 70, 270, 118], rv: [66, 330, 180], gov: [462, 316, 180], ax: [118, 360], yOut: 196, yBack: 262,
        lOut: 182, lBack1: 296, lBack2: 324, yr: [239, 229], tot: [130, 372, 300, 96], totY: 446, sub: 400, replay: [496, 418], made: [496, 40] };
    // the bond note
    const [nx, ny, nw, nh] = G.note;
    const lines = text(nx - nw / 2 + 22, ny - nh / 2 + 32, 'bond', 21, MUTED, 'start', 700)
      + text(nx - nw / 2 + 22, ny + 6, rs(P0), 34, INK, 'start')
      + text(nx - nw / 2 + 22, ny + nh / 2 - 16, `${RATE}% a year, 1 year`, 21, INK, 'start', 700);
    svg += this.pop(0, note(nx, ny, nw, nh, { lines, rot: -2, seal: 16 }));
    svg += P ? text(G.made[0], G.made[1], 'made-up numbers', 19, MUTED, 'middle', 700)
      : text(G.made[0], G.made[1], 'made-up', 19, MUTED, 'middle', 700) + text(G.made[0], G.made[1] + 22, 'numbers', 19, MUTED, 'middle', 700);
    // Ravi and the borrower
    over += personSlot('ravi', { x: G.rv[0], y: G.rv[1], h: G.rv[2], facing: 1, mood: 'smile' });
    svg += nameTag(G.rv[0], G.rv[1] + 4, 'ravi', 18);
    svg += civicSvg('parliament', G.gov[0], G.gov[1], { w: G.gov[2] });
    svg += text(G.gov[0], G.gov[1] + 28, 'a government', 20, INK, 'middle', 700);
    const [a, b] = G.ax, mid = (a + b) / 2;
    // out: Ravi lends Rs 10,000
    svg += this.pop(0.3, arrow(a, G.yOut, b, 'var(--sim-series-4)') , 'mk-grow');
    svg += this.pop(0.5, text(mid, G.yOut - 18, `lends ${rs(P0)}`, 22, INK));
    // one year later
    svg += this.pop(1.2, pill(G.yr[0], G.yr[1], 'one year later', P ? 19 : 20));
    // back: Rs 10,000 back + Rs 500 interest
    svg += this.pop(1.7, arrow(b, G.yBack, a, SAVE), 'bd-growr');
    svg += this.pop(2.1, text(mid, G.lBack1, `${rs(P0)} back`, 21, INK));
    svg += this.pop(2.3, text(mid, G.lBack2, `+${rs(INT)} interest`, 22, SAVE_INK));
    // the total
    const [tx, ty, tw, th] = G.tot;
    svg += this.pop(2.8, panel(tx, ty, tw, th, { bg: `color-mix(in oklab, ${SAVE} 18%, var(--sim-bg-surface))`, edge: shade(SAVE, 62), sw: 3 })
      + text(tx + tw / 2, G.sub, 'Ravi gets', 20, MUTED, 'middle', 700)
      + text(tx + tw / 2, G.totY, `${rs(TOTAL)} in all`, P ? 38 : 40, INK));
    if (!this.fresh) over += `<div class="bd-ab" style="left:${G.replay[0]}px;top:${G.replay[1]}px"><button type="button" class="sv-hit bd-btn bd-btn--quiet" data-act="replay">replay</button></div>`;
    return { svg, over };
  }

  // b1: maturity from 1 day to 30+ years; selling before maturity at a price not known in advance.
  paintTerm(P) {
    let svg = '', over = '';
    const G = P
      ? { title: [195, 40], x0: 30, x1: 360, y: 150, notes: [1, 3, 5], nw: 64, nh: 46, lab: 20,
        rv: [62, 440, 140], by: [272, 440, 140], ax: [104, 226], ay: 352, al: 278, note: [165, 386],
        tag: [112, 528, 190], btn: [300, 528], warn: [195, 600] }
      : { title: [280, 40], x0: 40, x1: 520, y: 140, notes: [1, 3, 5], nw: 74, nh: 52, lab: 20,
        rv: [70, 436, 150], by: [296, 436, 150], ax: [116, 246], ay: 346, al: 266, note: [181, 382],
        tag: [450, 330, 190], btn: [450, 410], warn: [450, 464] };
    svg += text(G.title[0], G.title[1], 'maturity: 1 day to 30+ years', P ? 25 : 27, INK);
    // the scale
    const px = (t) => G.x0 + t * (G.x1 - G.x0);
    svg += `<path d="M${G.x0} ${G.y}H${G.x1}" ${stroke('var(--sim-stroke)', 8)}/>`
      + `<path d="M${G.x0} ${G.y}H${G.x1}" ${stroke(NOTE, 4, 'opacity:0.7')}/>`;
    SCALE.forEach(([lab, t], i) => {
      const x = px(t), stag = i % 2 === 1;
      svg += `<circle cx="${f1(x)}" cy="${G.y}" r="8" ${fill('var(--sim-bg-surface)', `stroke:${shade(NOTE, 66)};stroke-width:3`)}/>`;
      const anchor = i === 0 ? 'start' : i === SCALE.length - 1 ? 'end' : 'middle', dx = i === 0 ? -14 : i === SCALE.length - 1 ? 14 : 0;
      svg += text(x + dx, G.y + (stag ? 56 : 32), lab, G.lab, INK, anchor, 700);
      if (stag) svg += `<path d="M${f1(x)} ${G.y + 10}V${G.y + 36}" ${stroke(MUTED, 2)}/>`;
    });
    G.notes.forEach((i, j) => {
      const x = px(SCALE[i][1]);
      svg += `<g class="mk-pop" style="--d:${(0.15 + j * 0.2).toFixed(2)}s">${note(x, G.y - 46, G.nw, G.nh, { rot: j % 2 ? 4 : -4, col: `var(--sim-series-${[6, 4, 7][j]})`, seal: 8 })}</g>`;
    });
    // selling before maturity
    over += personSlot('ravi', { x: G.rv[0], y: G.rv[1], h: G.rv[2], facing: 1, mood: 'smile' });
    svg += nameTag(G.rv[0], G.rv[1] + 4, 'ravi', 18);
    over += personSlot('buyer', { x: G.by[0], y: G.by[1], h: G.by[2], facing: -1, mood: 'smile' });
    svg += nameTag(G.by[0], G.by[1] + 4, 'buyer', 18);
    svg += text((G.ax[0] + G.ax[1]) / 2, G.al, 'sells before maturity', P ? 20 : 21, INK);
    svg += arrow(G.ax[0], G.ay, G.ax[1], 'var(--sim-series-4)');
    svg += note(G.note[0], G.note[1], 62, 44, { seal: 7 });
    // the price on the sale day
    const known = this.day >= 0;
    const [tx, ty, tw] = G.tag;
    if (known) svg += tag(tx, ty, `day ${this.day + 1} price`, DAY_PRICES[this.day], { w: tw, labelSize: 19, valueSize: 32, ring: true });
    else {
      svg += tag(tx, ty, 'price that day', null, { w: tw, labelSize: 19 });
      svg += text(tx + 12, ty + 33, '?', 40, ACC_INK);
    }
    svg += text(G.warn[0], G.warn[1], known ? 'made-up price' : 'not known in advance', 21, known ? MUTED : ACC_INK, 'middle', known ? 700 : 800);
    over += `<div class="bd-ab" style="left:${G.btn[0]}px;top:${G.btn[1]}px"><button type="button" class="sv-hit bd-btn${known ? ' bd-btn--quiet' : ''}" data-act="day">${known ? 'another day' : 'pick a day'}</button></div>`;
    return { svg, over };
  }

  // b2: government bond (safer, lower rate) against company bond (riskier, higher rate).
  paintKinds(P) {
    let svg = '', over = '';
    const cards = [
      { kind: 'parliament', name: 'government bond', rate: GOV, a: 'safer', b: 'lower rate', col: 'var(--sim-series-4)' },
      { kind: 'factory', name: 'company bond', rate: CO, a: 'riskier', b: 'higher rate', col: 'var(--sim-series-8)' },
    ];
    const B = P ? [{ x: 8, y: 54, w: 374, h: 226 }, { x: 8, y: 294, w: 374, h: 226 }]
      : [{ x: 10, y: 60, w: 266, h: 340 }, { x: 284, y: 60, w: 266, h: 340 }];
    svg += text(P ? 14 : 16, 36, 'on ' + rs(P0) + ', for a year', P ? 23 : 24, INK, 'start');
    svg += P ? text(195, 538, 'made-up rates', 19, MUTED, 'middle', 700) : text(544, 36, 'made-up rates', 19, MUTED, 'end', 700);
    cards.forEach((c, i) => {
      const b = B[i], co = i === 1, hit = co && this.short;
      svg += panel(b.x, b.y, b.w, b.h, { edge: hit ? BAD : 'var(--sim-stroke)', sw: hit ? 4 : 2.5 });
      svg += `<rect x="${b.x + 2}" y="${b.y + 2}" width="10" height="${b.h - 4}" rx="5" ${fill(c.col)}/>`;
      const pay = rs(P0 * c.rate / 100);
      if (P) {
        const x = b.x + 26;
        svg += civicSvg(c.kind, b.x + b.w - 74, b.y + 104, { w: 120 });
        svg += text(x, b.y + 38, c.name, 24, INK, 'start');
        svg += text(x, b.y + 88, `${c.rate}% a year`, 34, INK, 'start');
        svg += text(x, b.y + 124, `${c.a}, ${c.b}`, 21, co ? BAD_INK : SAVE_INK, 'start');
        if (hit) {
          svg += text(x, b.y + 166, `${pay} interest:`, 22, INK, 'start') + `<path d="M${x} ${b.y + 159}H${x + 150}" ${stroke(BAD, 3)}/>`;
          svg += text(x, b.y + 196, 'may come late, or not at all', 21, BAD_INK, 'start');
        } else svg += text(x, b.y + 170, `${pay} interest a year`, 24, INK, 'start') + coin(b.x + b.w - 34, b.y + 162, 15);
      } else {
        const cx = b.x + b.w / 2 + 4;
        svg += civicSvg(c.kind, cx, b.y + 128, { w: 150 });
        svg += text(cx, b.y + 162, c.name, 24, INK);
        svg += text(cx, b.y + 206, `${c.rate}% a year`, 36, INK);
        svg += text(cx, b.y + 240, `${c.a}, ${c.b}`, 21, co ? BAD_INK : SAVE_INK);
        if (hit) {
          svg += text(cx, b.y + 274, `${pay} interest`, 24, INK) + `<path d="M${cx - 82} ${b.y + 266}H${cx + 82}" ${stroke(BAD, 3)}/>`;
          svg += text(cx, b.y + 303, 'may come late,', 21, BAD_INK) + text(cx, b.y + 330, 'or not at all', 21, BAD_INK);
        } else {
          svg += coin(cx - 98, b.y + 290, 15) + text(cx + 14, b.y + 298, `${pay} a year`, 26, INK);
          svg += text(cx, b.y + 328, 'interest', 20, MUTED, 'middle', 700);
        }
      }
    });
    if (!P) svg += text(147, 428, 'steady: easy to plan', 20, SAVE_INK, 'middle', 700);
    const bx = P ? 195 : 417, by = P ? 582 : 442;
    over += `<div class="bd-ab" style="left:${bx}px;top:${by}px"><button type="button" class="sv-hit bd-btn${this.short ? ' bd-btn--quiet' : ''}" data-act="short" aria-pressed="${this.short}">${this.short ? 'a normal year' : 'company runs short'}</button></div>`;
    return { svg, over };
  }

  testState() { return { view: this.stepIndex, fresh: this.fresh, day: this.day, short: this.short, total: TOTAL, interest: INT }; }
}
