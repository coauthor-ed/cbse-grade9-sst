/**
 * FourFactorsScene - L05 s02 "Four Things to Weigh" (3 beats). SvgScene, design 560 x 490 landscape, 390 x 620
 * portrait. Aarav's Rs 50,000, college fee due in three months. Four factor cards along the top (Risk, Return,
 * Time horizon, Liquidity); the beat's factor lights and its book definition shows under the cards.
 *   b0 Risk + return: a place toggle in the figure (shares / fixed deposit). Shares: a fan of 9 made-up possible
 *      endings after 3 months, Rs 44,000 to Rs 54,000; 4 end below the fee line (Rs 50,000) and show red.
 *      Fixed deposit: one dot at Rs 50,700 (about 5.6% a year for 3 months, made-up). Cold start: shares.
 *   b1 Time horizon: two horizon rows on one 15-year scale (they are the toggle): "3 months" is a sliver,
 *      "15 years" is the full bar. Under them a made-up path over the chosen horizon: 3 months ends in a dip on
 *      the fee day ("no time to recover"); 15 years has one bad year (year 3) and recovers ("time to recover").
 *      Cold start: 3 months.
 *   b2 Liquidity: three tiles: savings account "cash today"; bond and shares "sell first", "that day's price".
 *      Plays in on entry (about 2.6 s), then all four cards light. Rest / cold start: all shown, all lit.
 * Tokens only. ASCII only.
 */
import { SvgScene, stroke, fill, shade } from 'simulations/base/kit/SimSvg.js';
import { civicSvg } from 'simulations/base/kit/SimCivic.js';
import { linScale } from 'simulations/base/kit/SimPlotSvg.js';
import { MONEY_CSS, TONE, coin, tag, rs, group } from '../shared/MoneyKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const START = 50000, FEE = 50000;
const ENDINGS = [44000, 45500, 47000, 48500, 50500, 51000, 52000, 53000, 54000];   // made-up, 4 below the fee
const BELOW = ENDINGS.filter((v) => v < FEE).length;                                 // 4
const FD_END = Math.round(START * (1 + 0.056 / 4));                                  // 50,700
const PATH_3M = [[0, 100], [1, 103], [2, 99.5], [3, 94]];                            // made-up, dips at the end
const PATH_15Y = [100, 108, 115, 96, 106, 114, 122, 131, 140, 150, 160, 172, 183, 196, 209, 224].map((v, i) => [i, v]);
const FACTORS = [
  { key: 'risk', name: 'Risk', def: 'the chance of losing money' },
  { key: 'return', name: 'Return', def: 'the profit earned' },
  { key: 'time', name: 'Time horizon', def: 'how long the money can stay invested' },
  { key: 'liq', name: 'Liquidity', def: 'how easily it turns into cash' },
];
const LIT = [['risk', 'return'], ['time'], ['liq']];
const INK = 'var(--sim-label)', MUTED = 'var(--sim-label-muted)', ACC = 'var(--sim-accent)', ACC_INK = shade('var(--sim-accent)', 62);
const SAVE = TONE.save, SAVE_INK = shade(TONE.save, 62), BAD = 'var(--sim-bad)', BAD_INK = shade('var(--sim-bad)', 80);
const SHARE = 'var(--sim-series-8)', FDC = 'var(--sim-series-4)';

const CSS = `
.ff-ab { position: absolute; transform: translate(-50%, -50%); }
.ff-row { position: absolute; display: flex; gap: 12px; transform: translate(-50%, -50%); }
.ff-btn { min-height: 48px; padding: 5px 16px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 21px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.ff-btn[aria-pressed="true"] { background: var(--sim-accent); color: var(--sim-bg-deep); border-color: color-mix(in oklab, var(--sim-accent) 70%, black);
  box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 color-mix(in oklab, var(--sim-accent) 60%, black); }
.ff-btn--row { min-width: 190px; text-align: left; }
.ff-btn--quiet { font-size: 19px; }
.ff-btn:active { transform: translateY(3px); box-shadow: none; }
.ff-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
`;

const text = (x, y, t, size, col = INK, anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;
const panel = (x, y, w, h, o = {}) => `<rect x="${f1(x)}" y="${f1(y + 4)}" width="${f1(w)}" height="${f1(h)}" rx="14" ${fill('var(--sim-stroke)')}/>`
  + `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="14" ${fill(o.bg ?? 'var(--sim-bg-surface)', `stroke:${o.edge ?? 'var(--sim-stroke)'};stroke-width:${o.sw ?? 2.5}`)}/>`;
const dot = (x, y, r, col) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" ${fill(col, 'stroke:var(--sim-bg-surface);stroke-width:3')}/>`;

/** A small bond note (FourOptionsScene / BondScene art): a ruled sheet with a seal. */
function note(cx, cy, w, h) {
  const x0 = cx - w / 2, y0 = cy - h / 2, col = 'var(--sim-series-6)';
  let s = `<g transform="rotate(-4 ${f1(cx)} ${f1(cy)})"><rect x="${f1(x0)}" y="${f1(y0 + 3)}" width="${w}" height="${h}" rx="6" ${fill('var(--sim-stroke)')}/>`
    + `<rect x="${f1(x0)}" y="${f1(y0)}" width="${w}" height="${h}" rx="6" ${fill(`color-mix(in oklab, ${col} 14%, var(--sim-bg-surface))`, 'stroke:var(--sim-stroke);stroke-width:2.2')}/>`;
  for (let i = 0; i < 3; i++) s += `<path d="M${f1(x0 + w * 0.14)} ${f1(y0 + h * (0.3 + i * 0.2))}H${f1(x0 + w * (i === 2 ? 0.45 : 0.72))}" ${stroke(MUTED, 2.2)}/>`;
  return s + `<circle cx="${f1(x0 + w - 16)}" cy="${f1(y0 + h - 14)}" r="8" ${fill(col, `stroke:${shade(col, 66)};stroke-width:2`)}/></g>`;
}
/** A small share-price card: a zig-zag line on a card. */
function shareCard(cx, cy, w, h) {
  const x0 = cx - w / 2, y0 = cy - h / 2, pts = [0.1, 0.6, 0.25, 0.35, 0.4, 0.55, 0.55, 0.2, 0.7, 0.5, 0.9, 0.3];
  let d = '';
  for (let i = 0; i < pts.length; i += 2) d += `${i ? 'L' : 'M'}${f1(x0 + w * pts[i])} ${f1(y0 + h * (0.15 + pts[i + 1] * 0.8))}`;
  return panel(x0, y0, w, h) + `<path d="${d}" ${stroke(SHARE, 5, 'fill:none;stroke-linejoin:round;stroke-linecap:round')}/>`;
}

export class FourFactorsScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 490;
  static PORTRAIT_HEIGHT = 620;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'Aarav has 50,000 rupees for a college fee due in three months. Four things to weigh: risk, the chance of losing money; return, the profit earned; time horizon, how long the money can stay invested; liquidity, how easily it turns into cash. Made-up numbers: in shares, nine possible endings after three months run from 44,000 to 54,000 rupees, and four of them are below the 50,000 rupee fee. A fixed deposit ends at 50,700 rupees. Three months gives a fall no time to recover; fifteen years has time to recover from one bad year. A savings account gives cash the same day; a bond or shares must be sold first, at that day\'s price.';

  async setup() {
    this.place = 'shares';
    this.hz = 'm3';
    this.fresh = false;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b) return;
      const a = b.dataset.act;
      if (a === 'place') { this.place = b.dataset.val; this.repaint(); }
      else if (a === 'hz') { this.hz = b.dataset.val; this.repaint(); }
      else if (a === 'replay') this.play();
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MONEY_CSS + CSS; }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.fresh = false; }

  enter(step) {
    this.clear();
    this.place = 'shares';
    this.hz = 'm3';
    if (step === 2) this.after(0.05, () => this.play());
  }

  /** b2: the tiles play in (CSS delays); a timed repaint lights all four cards at the end. */
  play() {
    if (this.stepIndex !== 2) return;
    this.clear();
    this.fresh = true;
    this.after(2.8, () => { this.fresh = false; this.repaint(); });
    this.repaint();
  }

  skip() {
    if (!this.fresh) return false;
    this.clear();
    this.repaint();
    return true;
  }

  busy() { return this.fresh; }

  stageHeight(st) { return Math.round((st.portrait ? 620 : 490) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 620 : 490, k = (st.W / DW).toFixed(4), v = this.stepIndex;
    const top = this.paintCards(P, v);
    const out = v === 1 ? this.paintTime(P) : v === 2 ? this.paintLiq(P) : this.paintRisk(P);
    return { svg: `<g transform="scale(${k})">${top}${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  pop(d, body) { return `<g${this.fresh ? ` class="mk-pop" style="--d:${d}s"` : ''}>${body}</g>`; }

  /** The four factor cards; the beat's factors lit, with their definitions under the cards. */
  paintCards(P, v) {
    const all = v === 2 && !this.fresh, lit = LIT[v] ?? [];
    let s = '';
    FACTORS.forEach((f, i) => {
      const on = all || lit.includes(f.key), ring = lit.includes(f.key);
      const x = P ? 8 + (i % 2) * 191 : 4 + i * 139, y = P ? 8 + Math.floor(i / 2) * 58 : 8, w = P ? 183 : 132, h = 48;
      s += `<g${on ? '' : ' style="opacity:0.38"'}>` + panel(x, y, w, h, {
        bg: on ? `color-mix(in oklab, ${ACC} ${ring ? 26 : 12}%, var(--sim-bg-surface))` : 'var(--sim-bg-surface)',
        edge: ring ? ACC : 'var(--sim-stroke)', sw: ring ? 3.5 : 2.5,
      }) + text(x + w / 2, y + 32, f.name, f.name.length > 8 ? 20 : 22, on ? INK : MUTED) + '</g>';
    });
    const defs = FACTORS.filter((f) => lit.includes(f.key));
    const y0 = P ? 152 : 88;
    defs.forEach((f, j) => {
      const y = y0 + j * (P ? 52 : 28);
      if (P) {
        s += text(16, y, `${f.name}:`, 21, ACC_INK, 'start') + text(16, y + 24, f.def, 20, INK, 'start', 700);
      } else s += `<text x="16" y="${y}" style="font:700 20px var(--sim-font);fill:${INK}"><tspan style="fill:${ACC_INK};font-weight:800">${f.name}:</tspan> ${f.def}</text>`;
    });
    return s;
  }

  // b0: shares fan out around the fee; a fixed deposit is one known ending.
  paintRisk(P) {
    let svg = '', over = '';
    const G = P
      ? { tog: [195, 270], x0: 80, x1: 300, yT: 346, yB: 560, xs: 106, xe: 280, gut: 344, made: [386, 330], xl: 586, card: [86, 350, 160, 62] }
      : { tog: [280, 150], x0: 92, x1: 430, yT: 216, yB: 432, xs: 122, xe: 400, gut: 494, made: [552, 206], xl: 456, card: [100, 222, 170, 62] };
    const py = linScale(43000, 56000, G.yB, G.yT);
    const sh = this.place === 'shares';
    over += `<div class="ff-row" style="left:${G.tog[0]}px;top:${G.tog[1]}px">`
      + `<button type="button" class="sv-hit ff-btn" data-act="place" data-val="shares" aria-pressed="${sh}">shares</button>`
      + `<button type="button" class="sv-hit ff-btn" data-act="place" data-val="fd" aria-pressed="${!sh}">fixed deposit</button></div>`;
    // graph paper
    svg += `<rect x="${G.x0}" y="${G.yT}" width="${G.x1 - G.x0}" height="${G.yB - G.yT}" ${fill('color-mix(in oklab, var(--sim-bg-surface) 70%, transparent)')}/>`;
    for (let v = 44000; v <= 56000; v += 2000) {
      svg += `<path d="M${G.x0} ${f1(py(v))}H${G.x1}" ${stroke('var(--sim-stroke)', 1.5, 'opacity:0.45')}/>`;
      if (v % 4000 === 0 && v !== 52000 && v !== 48000) svg += text(G.x0 - 8, py(v) + 6, group(v), 17, MUTED, 'end', 700);
    }
    svg += `<path d="M${G.x0} ${G.yT - 6}V${G.yB}H${G.x1}" ${stroke(INK, 3)}/>`;
    svg += text(G.xs, G.xl, 'today', 20, INK) + text(G.xe, G.xl, 'fee day', 20, INK);
    svg += text(G.x0 - 60, G.yT - 22, 'rupees', 18, INK, 'start');
    // the fee line, the key label
    const yf = py(FEE);
    svg += `<path d="M${G.x0} ${f1(yf)}H${G.x1 + 8}" ${stroke(INK, 3.5, 'stroke-dasharray:10 7')}/>`;
    svg += text(G.gut, yf - 12, 'fee', 22, INK, 'middle', 800) + text(G.gut, yf + 26, rs(FEE), P ? 24 : 28, INK);
    // the endings
    if (sh) {
      ENDINGS.forEach((e) => { svg += `<path d="M${G.xs} ${f1(yf)}L${G.xe} ${f1(py(e))}" ${stroke(e < FEE ? BAD : SAVE, 2.5, 'opacity:0.55')}/>`; });
      ENDINGS.forEach((e, i) => { svg += `<g class="mk-pop" style="--d:${(i * 0.06).toFixed(2)}s">${dot(G.xe, py(e), 9, e < FEE ? BAD : SAVE)}</g>`; });
      svg += text(G.made[0], G.made[1], P ? 'made-up endings' : 'made-up possible endings', 19, MUTED, 'end', 700);
    } else {
      svg += `<path d="M${G.xs} ${f1(yf)}L${G.xe} ${f1(py(FD_END))}" ${stroke(FDC, 5)}/>`;
      svg += `<g class="mk-pop">${dot(G.xe, py(FD_END), 11, FDC)}</g>`;
      svg += text(G.made[0], G.made[1], 'made-up rate', 19, MUTED, 'end', 700);
    }
    svg += dot(G.xs, yf, 10, INK);
    // the readout, top left inside the graph
    const [cx, cy, cw, ch] = G.card;
    svg += panel(cx, cy, cw, ch, { edge: sh ? BAD : SAVE_INK, sw: 3 });
    svg += sh ? text(cx + 14, cy + 34, `${BELOW} of ${ENDINGS.length}`, 30, BAD_INK, 'start') + text(cx + 14, cy + 54, 'below the fee', 18, INK, 'start', 700)
      : text(cx + 14, cy + 34, rs(FD_END), 30, SAVE_INK, 'start') + text(cx + 14, cy + 54, 'on the fee day', 18, INK, 'start', 700);
    return { svg, over };
  }

  // b1: horizon rows on one 15-year scale; a made-up path over the chosen horizon.
  paintTime(P) {
    let svg = '', over = '';
    const G = P
      ? { r1: 230, r2: 284, bx: 16, bx0: 16, bx1: 374, barDy: 30, x0: 20, x1: 370, yT: 356, yB: 548, lab: [195, 604] }
      : { r1: 150, r2: 202, bx: 116, bx0: 228, bx1: 548, barDy: 0, x0: 30, x1: 470, yT: 252, yB: 418, lab: [280, 478] };
    const m3 = this.hz === 'm3';
    const rows = [
      { val: 'm3', label: 'Aarav: 3 months', yrs: 0.25, y: G.r1, col: 'var(--sim-series-1)' },
      { val: 'y15', label: 'college: 15 years', yrs: 15, y: G.r2, col: 'var(--sim-series-5)' },
    ];
    rows.forEach((r) => {
      const on = this.hz === r.val, by = r.y + G.barDy, bw = Math.max(10, (G.bx1 - G.bx0) * r.yrs / 15);
      const bx = P ? G.bx0 + 196 : G.bx0, bww = P ? Math.max(10, (G.bx1 - bx) * r.yrs / 15) : bw;
      svg += `<g${on ? '' : ' style="opacity:0.4"'}><rect x="${f1(bx)}" y="${f1(by - 12)}" width="${f1(P ? G.bx1 - bx : G.bx1 - G.bx0)}" height="24" rx="12" ${fill('var(--sim-bg-cell, var(--sim-bg-surface))', 'stroke:var(--sim-stroke);stroke-width:2')}/>`
        + `<rect x="${f1(bx)}" y="${f1(by - 12)}" width="${f1(bww)}" height="24" rx="12" ${fill(r.col, `stroke:${shade(r.col, 62)};stroke-width:2`)}/></g>`;
      over += `<div class="ff-ab" style="left:${P ? 100 : G.bx}px;top:${by}px"><button type="button" class="sv-hit ff-btn ff-btn--row" data-act="hz" data-val="${r.val}" aria-pressed="${on}">${r.label}</button></div>`;
    });
    svg += text(P ? 374 : 548, (P ? G.r1 - 16 : G.r1 - 26), 'on one 15-year scale', 17, MUTED, 'end', 700);
    // the path chart
    const pts = m3 ? PATH_3M : PATH_15Y, xMax = m3 ? 3 : 15;
    const px = linScale(0, xMax, G.x0 + 10, G.x1 - 10), py = linScale(80, 230, G.yB, G.yT);
    const pyM = linScale(88, 108, G.yB, G.yT);
    const Y = m3 ? pyM : py;
    svg += `<rect x="${G.x0}" y="${G.yT}" width="${G.x1 - G.x0}" height="${G.yB - G.yT}" ${fill('color-mix(in oklab, var(--sim-bg-surface) 70%, transparent)')}/>`;
    for (let i = 0; i <= xMax; i += m3 ? 1 : 3) {
      svg += `<path d="M${f1(px(i))} ${G.yT}V${G.yB}" ${stroke('var(--sim-stroke)', 1.5, 'opacity:0.4')}/>`;
      const last = i === xMax;
      svg += text(last ? px(i) + 12 : px(i), G.yB + 24, last ? `${i} ${m3 ? 'months' : 'years'}` : String(i), last ? 19 : 17, last ? INK : MUTED, last ? 'end' : 'middle', last ? 800 : 700);
    }
    svg += `<path d="M${G.x0} ${G.yT - 4}V${G.yB}H${G.x1}" ${stroke(INK, 3)}/>`;
    svg += text(G.x0 + 12, G.yT + 24, 'value (made-up path)', 18, MUTED, 'start', 700);
    const col = m3 ? 'var(--sim-series-1)' : 'var(--sim-series-5)';
    const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${f1(px(x))} ${f1(Y(y))}`).join('');
    svg += `<path d="${d}" transform="translate(0 3)" ${stroke(shade(col, 60), 6, 'fill:none;stroke-linejoin:round;stroke-linecap:round')}/>`
      + `<path d="${d}" ${stroke(col, 6, 'fill:none;stroke-linejoin:round;stroke-linecap:round')}/>`;
    if (m3) {
      const [ex, ey] = pts[pts.length - 1];
      svg += `<path d="M${f1(px(ex))} ${G.yT}V${G.yB}" ${stroke(INK, 3, 'stroke-dasharray:8 6')}/>`;
      svg += `<circle cx="${f1(px(ex))}" cy="${f1(Y(ey))}" r="16" ${fill('none', `stroke:${BAD};stroke-width:4`)}/>` + dot(px(ex), Y(ey), 8, BAD);
      svg += text(px(ex) - 12, G.yT + 26, 'fee day', 20, INK, 'end');
      svg += text(G.lab[0], G.lab[1], 'no time to recover', P ? 28 : 30, BAD_INK);
    } else {
      const [bx, bv] = PATH_15Y[3];
      svg += `<circle cx="${f1(px(bx))}" cy="${f1(Y(bv))}" r="16" ${fill('none', `stroke:${BAD};stroke-width:4`)}/>` + dot(px(bx), Y(bv), 8, BAD);
      svg += text(px(bx) + 4, Y(bv) + 44, 'one bad year', 20, BAD_INK, 'start');
      const [ex, ey] = PATH_15Y[15];
      svg += dot(px(ex), Y(ey), 9, col);
      svg += text(G.lab[0], G.lab[1], 'time to recover', P ? 28 : 30, SAVE_INK);
    }
    return { svg, over };
  }

  // b2: how fast each place turns into cash.
  paintLiq(P) {
    let svg = '', over = '';
    const tiles = [
      { name: 'savings account', art: 'bank', fast: true },
      { name: 'bond', art: 'note' },
      { name: 'shares', art: 'shares' },
    ];
    tiles.forEach((t, i) => {
      const d0 = 0.3 + i * 0.7;
      if (P) {
        const x = 8, y = 198 + i * 126, w = 374, h = 114;
        svg += panel(x, y, w, h, { edge: t.fast ? SAVE_INK : 'var(--sim-stroke)', sw: t.fast ? 3.5 : 2.5 });
        const ax = x + 58, ay = y + 62;
        svg += t.art === 'bank' ? civicSvg('bank', ax, ay + 34, { w: 88 }) : t.art === 'note' ? note(ax, ay, 84, 58) : shareCard(ax, ay, 84, 58);
        svg += text(x + 120, y + 36, t.name, 22, INK, 'start');
        if (t.fast) svg += this.pop(d0, coin(x + 136, y + 78, 18) + text(x + 166, y + 87, 'cash today', 26, SAVE_INK, 'start'));
        else {
          svg += this.pop(d0, text(x + 120, y + 70, '1. sell first', 22, INK, 'start', 700));
          svg += this.pop(d0 + 0.35, text(x + 120, y + 100, "2. that day's price", 22, ACC_INK, 'start'));
        }
      } else {
        const x = 6 + i * 184, y = 146, w = 176, h = 300;
        svg += panel(x, y, w, h, { edge: t.fast ? SAVE_INK : 'var(--sim-stroke)', sw: t.fast ? 3.5 : 2.5 });
        const cx = x + w / 2;
        svg += t.art === 'bank' ? civicSvg('bank', cx, y + 112, { w: 110 }) : t.art === 'note' ? note(cx, y + 74, 110, 76) : shareCard(cx, y + 74, 110, 76);
        svg += text(cx, y + 146, t.name, t.name.length > 10 ? 20 : 23, INK);
        if (t.fast) svg += this.pop(d0, coin(cx, y + 196, 22) + text(cx, y + 256, 'cash today', 27, SAVE_INK));
        else {
          svg += this.pop(d0, text(cx, y + 186, 'sell first', 23, INK, 'middle', 700) + `<path d="M${f1(cx)} ${y + 196}V${y + 214}" ${stroke(MUTED, 3)}/><path d="M${f1(cx)} ${y + 222}l-8 -10h16z" ${fill(MUTED)}/>`);
          svg += this.pop(d0 + 0.35, tag(cx + 6, y + 252, "that day's price", null, { w: 150, h: 64, labelSize: 17 }) + text(cx + 16, y + 276, '?', 30, ACC_INK));
        }
      }
    });
    if (!this.fresh) over += `<div class="ff-ab" style="left:${P ? 316 : 490}px;top:${P ? 596 : 470}px"><button type="button" class="sv-hit ff-btn ff-btn--quiet" data-act="replay">replay</button></div>`;
    if (!this.fresh) svg += text(P ? 16 : 16, P ? 604 : 478, 'weigh all four', 24, ACC_INK, 'start');
    return { svg, over };
  }

  testState() {
    return { view: this.stepIndex, place: this.place, hz: this.hz, fresh: this.fresh, endings: ENDINGS, below: BELOW, fd: FD_END };
  }
}
