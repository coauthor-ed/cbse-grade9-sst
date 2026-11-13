/**
 * FourOptionsScene - L04 s01 "Four Places for Savings" (2 beats). SvgScene, design 560 x 510 landscape, 390 x 620
 * portrait. A family has Rs 10,000 it will not need for ten years; four big cards name the book's four options.
 *   b0 Four common options: four cards (2 x 2 landscape, one column portrait), each with a small picture, its name
 *      and one line of what it is: fixed deposit (a bank), bond (a loan note), shares (a slice of a company
 *      building), mutual fund (small coins into one pool). Tapping a card lifts it and shows one more line
 *      (landscape: inside the card; portrait: in a strip under the cards). Rest / cold start: nothing lifted.
 *   b1 How they differ: the same four cards, each with three rows of dots, "roughly" and made-up levels (4 dots):
 *      how safe, may earn, take out; plus one short line on taking the money out. Tapping still lifts a card.
 * Levels follow the L04 text: an FD is safest and earns least; shares are least safe and may earn most over many
 * years (never "always"); bonds and mutual funds sit between. Tokens only, ASCII only.
 */
import { SvgScene, stroke, fill, shade } from 'simulations/base/kit/SimSvg.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { MONEY_CSS, coin, tag } from '../shared/MoneyKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const MUTED = 'var(--sim-label-muted)', ACC = 'var(--sim-accent)', INK = 'var(--sim-label)';
const ACC_INK = shade('var(--sim-accent)', 62);
const DOT = 'var(--sim-series-1)';

/** The four options. Levels are 0..4 in half steps (made-up, "roughly"). */
const OPTS = [
  { key: 'fd', name: 'Fixed deposit', what: 'with a bank or post office', extra: 'rate fixed in advance',
    safe: 4, earn: 1.5, out: 2, outTxt: 'take out early: at a lower rate', col: 'var(--sim-series-4)' },
  { key: 'bond', name: 'Bond', what: 'a loan to a government or a company', extra: 'pays interest, money back on a set date',
    safe: 3, earn: 2, out: 2.5, outTxt: 'can often be sold before the date', col: 'var(--sim-series-6)' },
  { key: 'shares', name: 'Shares', what: 'part-owner of a company', extra: 'its price goes up and down',
    safe: 1, earn: 3.5, out: 4, outTxt: 'any working day, at that day\u2019s price', col: 'var(--sim-series-5)' },
  { key: 'mf', name: 'Mutual fund', what: 'pools money from many people', extra: 'a manager spreads it over many investments',
    safe: 2, earn: 3, out: 3.5, outTxt: 'sell units at that day\u2019s value', col: 'var(--sim-series-7)' },
];
const ROWS = [['safe', 'how safe'], ['earn', 'may earn'], ['out', 'take out']];

const CSS = `
.fo-hit { position: absolute; background: transparent; border: 0; padding: 0; cursor: pointer; border-radius: 16px; }
.fo-hit:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 2px; }
`;

const text = (x, y, t, size, col = INK, anchor = 'start', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;
const icon = (name, x, y, s, tone) => iconSvg(name, tone).replace(' width="48" height="48"', '').replace('<svg ', `<svg x="${f1(x - s / 2)}" y="${f1(y - s / 2)}" width="${s}" height="${s}" `);

/** Greedy word wrap: the first line holds up to `first` characters, the rest up to `rest`. */
function wrap(s, first, rest = first) {
  const out = [];
  let cur = '';
  for (const w of String(s).split(' ')) {
    const lim = out.length ? rest : first;
    if (cur && (cur + ' ' + w).length > lim) { out.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w;
  }
  if (cur) out.push(cur);
  return out;
}

/** The small picture of each option, fitted in a box centred on (cx, cy), about s wide. No faces, no brands. */
function art(key, cx, cy, s) {
  if (key === 'fd') return civicSvg('bank', cx, cy + s * 0.38, { w: s });
  if (key === 'bond') {
    // a loan note: a ruled sheet with a seal and a rupee coin
    const w = s * 0.78, h = s * 0.62, x0 = cx - w / 2, y0 = cy - h / 2;
    let o = `<g transform="rotate(-6 ${f1(cx)} ${f1(cy)})"><rect x="${f1(x0)}" y="${f1(y0 + 3)}" width="${f1(w)}" height="${f1(h)}" rx="5" ${fill('var(--sim-stroke)')}/>`
      + `<rect x="${f1(x0)}" y="${f1(y0)}" width="${f1(w)}" height="${f1(h)}" rx="5" ${fill('color-mix(in oklab, var(--sim-series-6) 14%, var(--sim-bg-surface))', 'stroke:var(--sim-stroke);stroke-width:2.2')}/>`;
    for (let i = 0; i < 3; i++) o += `<path d="M${f1(x0 + w * 0.12)} ${f1(y0 + h * (0.26 + i * 0.2))}H${f1(x0 + w * (i === 2 ? 0.5 : 0.86))}" ${stroke(MUTED, 2.4)}/>`;
    o += `<circle cx="${f1(x0 + w * 0.78)}" cy="${f1(y0 + h * 0.74)}" r="${f1(h * 0.17)}" ${fill('var(--sim-series-6)', `stroke:${shade('var(--sim-series-6)', 66)};stroke-width:2`)}/></g>`;
    return o + coin(cx - w * 0.5, cy + h * 0.42, s * 0.15);
  }
  if (key === 'shares') {
    // a company building; one slice of it lit (the part a shareholder owns)
    const w = s, h = w * 220 / 280, x0 = cx - w / 2, y0 = cy + s * 0.38 - h;
    return civicSvg('office', cx, cy + s * 0.38, { w })
      + `<rect x="${f1(x0 + w * 0.56)}" y="${f1(y0 + h * 0.08)}" width="${f1(w * 0.17)}" height="${f1(h * 0.9)}" rx="3" ${fill('color-mix(in oklab, var(--sim-accent) 40%, transparent)', 'stroke:var(--sim-accent);stroke-width:2.6')}/>`;
  }
  // mutual fund: small coins from three sides drop into one pool
  const pr = s * 0.42, py = cy + s * 0.2;
  let o = `<ellipse cx="${f1(cx)}" cy="${f1(py + 3)}" rx="${f1(pr)}" ry="${f1(pr * 0.42)}" ${fill('var(--sim-stroke)')}/>`
    + `<ellipse cx="${f1(cx)}" cy="${f1(py)}" rx="${f1(pr)}" ry="${f1(pr * 0.42)}" ${fill('color-mix(in oklab, var(--sim-series-7) 30%, var(--sim-bg-surface))', 'stroke:var(--sim-stroke);stroke-width:2.2')}/>`;
  o += coin(cx - pr * 0.4, py, s * 0.1) + coin(cx + pr * 0.35, py + 1, s * 0.1) + coin(cx, py - 2, s * 0.1);
  [[-0.46, -0.42], [0, -0.5], [0.46, -0.42]].forEach(([dx, dy]) => {
    const x = cx + dx * s, y = cy + dy * s;
    const tx = cx + dx * s * 0.5, ty = py - pr * 0.5, ax = x + (tx - x) * 0.3, ay = y + (ty - y) * 0.3 + s * 0.06;
    o += `<path d="M${f1(ax)} ${f1(ay)}L${f1(tx)} ${f1(ty)}" ${stroke(MUTED, 2.4)}/>`
      + `<circle cx="${f1(tx)}" cy="${f1(ty)}" r="${f1(s * 0.025)}" ${fill(MUTED)}/>`;
    o += coin(x, y, s * 0.085);
  });
  return o;
}

/** A row of 4 dots filled to level v (half steps), left edge x, centre y. */
function dots(x, y, v, r, gap) {
  let o = '';
  for (let i = 0; i < 4; i++) {
    const cx = x + r + i * gap, full = v >= i + 1, half = !full && v >= i + 0.5;
    o += `<circle cx="${f1(cx)}" cy="${f1(y)}" r="${f1(r)}" ${fill('var(--sim-bg-surface)', `stroke:${shade(DOT, 70)};stroke-width:2.2`)}/>`;
    if (full) o += `<circle cx="${f1(cx)}" cy="${f1(y)}" r="${f1(r)}" ${fill(DOT, `stroke:${shade(DOT, 70)};stroke-width:2.2`)}/>`;
    if (half) o += `<path d="M${f1(cx)} ${f1(y - r)}A${f1(r)} ${f1(r)} 0 0 0 ${f1(cx)} ${f1(y + r)}Z" ${fill(DOT, `stroke:${shade(DOT, 70)};stroke-width:2.2`)}/>`;
  }
  return o;
}

export class FourOptionsScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 510;
  static PORTRAIT_HEIGHT = 620;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 2: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'A family has 10,000 rupees for ten years. Four cards: a fixed deposit with a bank or post office, at a rate fixed in advance; a bond, a loan to a government or a company that pays interest and gives the money back on a set date; shares, which make you a part-owner of a company, whose price goes up and down; a mutual fund, which pools money from many people and a manager spreads it over many investments. Roughly, with made-up levels: a fixed deposit is the safest and may earn the least, and taking it out early pays a lower rate; shares are the least safe and may earn the most over many years, and can be sold any working day at that day\u2019s price; bonds and mutual funds sit between.';

  async setup() {
    this.sel = null;
    this.fresh = true;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b) return;
      if (b.dataset.act === 'card') this.pick(Number(b.dataset.i));
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MONEY_CSS + CSS; }

  enter() {
    for (const t of (this._timers ?? []).splice(0)) clearTimeout(t);
    this.sel = null;
    this.fresh = true;
    this.after(1.4, () => { this.fresh = false; });
  }

  pick(i) {
    if (!(i >= 0 && i < OPTS.length)) return;
    this.sel = this.sel === i ? null : i;
    this.fresh = false;
    this.repaint();
  }

  stageHeight(st) { return Math.round((st.portrait ? 620 : 510) * st.W / (st.portrait ? 390 : 560)); }

  /** Card boxes in design units. */
  boxes(P, v) {
    if (!P) return OPTS.map((o, i) => ({ x: 10 + (i % 2) * 276, y: 70 + Math.floor(i / 2) * 222, w: 264, h: 212 }));
    const h = v === 0 ? 108 : 132, gap = v === 0 ? 8 : 6, y0 = v === 0 ? 56 : 54;
    return OPTS.map((o, i) => ({ x: 8, y: y0 + i * (h + gap), w: 374, h }));
  }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 620 : 510, k = st.W / DW, v = this.stepIndex;
    let svg = '', over = '';

    // the top strip: the family's Rs 10,000 and its ten years
    if (v === 0) {
      svg += coin(26, 30, 15) + coin(26, 22, 15) + coin(26, 14, 15);
      svg += tag(P ? 122 : 134, 28, 'savings', 10000, { w: P ? 156 : 170, h: 56, labelSize: 18, valueSize: 26, tone: 'save' });
      svg += icon('calendar', P ? 228 : 252, 26, 40, 4) + text(P ? 252 : 278, 35, '10 years', 24);
      if (!P) svg += text(548, 35, this.sel == null ? 'tap a card' : 'tap another', 21, ACC_INK, 'end');
    } else {
      svg += text(P ? 12 : 14, 34, 'roughly', 25) + text(P ? 112 : 124, 34, '(made-up levels)', 21, MUTED, 'start', 700);
      if (!P) svg += dots(400, 27, 4, 9, 22) + text(548, 34, '= a lot', 21, MUTED, 'end', 700);
    }

    const B = this.boxes(P, v);
    OPTS.forEach((o, i) => {
      const b = B[i], up = this.sel === i, lift = up ? -6 : 0;
      let g = `<rect x="${b.x}" y="${b.y + 5}" width="${b.w}" height="${b.h}" rx="16" ${fill('var(--sim-stroke)')}/>`
        + `<rect x="${b.x}" y="${b.y + lift}" width="${b.w}" height="${b.h}" rx="16" ${fill('var(--sim-bg-surface)', `stroke:${up ? ACC : 'var(--sim-stroke)'};stroke-width:${up ? 4 : 2.5}`)}/>`
        + `<rect x="${b.x + 2}" y="${b.y + lift + 2}" width="10" height="${b.h - 4}" rx="5" ${fill(o.col)}/>`;
      const y = b.y + lift;
      g += P ? this.portraitCard(o, b, y, v) : this.landCard(o, b, y, v, up);
      svg += `<g${this.fresh ? ` class="mk-pop" style="--d:${(0.08 + i * 0.12).toFixed(2)}s"` : ''}>${g}</g>`;
      over += `<button type="button" class="sv-hit fo-hit" data-act="card" data-i="${i}" aria-pressed="${up}" aria-label="${o.name}" style="left:${b.x}px;top:${b.y}px;width:${b.w}px;height:${b.h}px"></button>`;
    });

    // portrait b0: the lifted card's extra line goes in a strip under the cards
    if (P && v === 0) {
      const y0 = B[3].y + B[3].h + 10;
      if (this.sel == null) svg += text(195, y0 + 40, 'tap a card', 24, ACC_INK, 'middle');
      else {
        const o = OPTS[this.sel];
        svg += `<rect x="8" y="${y0}" width="374" height="${DH - y0 - 4}" rx="14" ${fill('color-mix(in oklab, var(--sim-accent) 16%, var(--sim-bg-surface))', 'stroke:var(--sim-accent);stroke-width:2.5')}/>`;
        wrap(`${o.name}: ${o.extra}`, 29).slice(0, 2).forEach((l, j) => { svg += text(195, y0 + 32 + j * 31, l, 22, ACC_INK, 'middle'); });
      }
    }
    return { svg: `<g transform="scale(${k.toFixed(4)})">${svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k.toFixed(4)});transform-origin:0 0">${over}</div>` };
  }

  /** Landscape card, 264 x 212: name top left, picture top right; b0 lines, b1 dot rows. */
  landCard(o, b, y, v, up) {
    const x = b.x + 22;
    let s = art(o.key, b.x + b.w - 44, y + 34, 64) + text(x, y + 40, o.name, 25);
    if (v === 0) {
      wrap(o.what, 22).slice(0, 2).forEach((l, j) => { s += text(x, y + 78 + j * 25, l, 20, INK, 'start', 700); });
      if (up) {
        s += `<rect x="${b.x + 14}" y="${y + 128}" width="${b.w - 26}" height="72" rx="12" ${fill('color-mix(in oklab, var(--sim-accent) 18%, var(--sim-bg-surface))')}/>`;
        wrap(o.extra, 24).slice(0, 2).forEach((l, j) => { s += text(x, y + 158 + j * 26, l, 20, ACC_INK); });
      } else {
        // a small tap badge: there is more on this card
        const bx = b.x + b.w - 30, by = y + b.h - 30;
        s += `<circle cx="${bx}" cy="${by}" r="15" ${fill('color-mix(in oklab, var(--sim-accent) 20%, var(--sim-bg-surface))', 'stroke:var(--sim-accent);stroke-width:2.5')}/>`
          + `<path d="M${bx - 7} ${by}H${bx + 7}M${bx} ${by - 7}V${by + 7}" ${stroke(ACC_INK, 3)}/>`;
      }
      return s;
    }
    ROWS.forEach(([k, lab], j) => {
      s += text(x, y + 86 + j * 30, lab, 20, MUTED, 'start', 700) + dots(x + 106, y + 79 + j * 30, o[k], 9, 24);
    });
    wrap(o.outTxt, 25).slice(0, 2).forEach((l, j) => { s += text(x, y + 172 + j * 25, l, 20, INK, 'start', 700); });
    return s;
  }

  /** Portrait card, 374 wide: one column. b0: picture left, name and what; b1: name, dots in two lines, the take-out line. */
  portraitCard(o, b, y, v) {
    if (v === 0) {
      const x = b.x + 96;
      let s = art(o.key, b.x + 54, y + b.h / 2 - 4, 66) + text(x, y + 36, o.name, 25);
      wrap(o.what, 22).slice(0, 2).forEach((l, j) => { s += text(x, y + 66 + j * 25, l, 20, INK, 'start', 700); });
      return s;
    }
    const x = b.x + 22;
    let s = text(x, y + 32, o.name, 24);
    s += text(x, y + 66, 'how safe', 20, MUTED, 'start', 700) + dots(x + 92, y + 59, o.safe, 8, 21);
    s += text(x + 176, y + 66, 'may earn', 20, MUTED, 'start', 700) + dots(x + 270, y + 59, o.earn, 7.5, 19);
    s += text(x, y + 96, 'take out', 20, MUTED, 'start', 700) + dots(x + 92, y + 89, o.out, 8, 21);
    const lines = wrap(o.outTxt, 15, 32);
    s += text(x + 186, y + 96, lines[0], 20, INK, 'start', 700);
    if (lines.length > 1) s += text(x, y + 122, lines.slice(1).join(' '), 20, INK, 'start', 700);
    return s;
  }

  testState() { return { view: this.stepIndex, sel: this.sel, name: this.sel == null ? null : OPTS[this.sel].name }; }
}
