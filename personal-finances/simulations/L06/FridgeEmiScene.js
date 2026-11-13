/**
 * FridgeEmiScene - L06 s05 "A Fridge on EMI" (3 beats). SvgScene, design 560 x 490 landscape, 390 x 620
 * portrait. The fridge costs Rs 30,000; the family repays Rs 3,000 a month for 12 months = Rs 36,000.
 *   b0 Rs 3,000 a month: the fridge with its price tag Rs 30,000; 12 EMI bars on a month strip, each split
 *      roughly into principal Rs 2,500 and interest Rs 500 (equal split, labelled "roughly").
 *   b1 Rs 36,000 in all: 12 x Rs 3,000 = Rs 36,000; price Rs 30,000; + Rs 6,000 interest. Two timelines: EMI,
 *      fridge from month 1, pays Rs 36,000 / save Rs 3,000 a month first, no fridge for 10 months, pays
 *      Rs 30,000. Chip: EMI = fridge now, no Rs 30,000 in one go. (No claim that waiting costs more.)
 *   b2 Too many EMIs: a made-up monthly income bar Rs 30,000 (rent and food 15,000, other costs 5,500,
 *      savings 4,750, emergency 4,750). Buttons add the fridge EMI 3,000, phone EMI 2,500, scooter EMI 4,000;
 *      each EMI takes half from savings and half from emergency; all three leave Rs 0 and Rs 0.
 * Rest / cold start: everything drawn, all three EMIs on in b2; every beat plays in on entry, with replay.
 * Tokens only. ASCII only.
 */
import { SvgScene, stroke, fill, shade } from 'simulations/base/kit/SimSvg.js';
import { MONEY_CSS, rs, tag, coin } from '../shared/MoneyKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];
const PRICE = 30000, EMI = 3000, MONTHS = 12, TOTAL = EMI * MONTHS, INTEREST = TOTAL - PRICE;   // 36,000 and 6,000
const PRIN = 2500, INT = EMI - PRIN;                    // roughly, an equal split
const SAVE_MONTHS = PRICE / EMI;                        // 10
const INCOME = 30000, FIXED = [['rent and food', 15000], ['other costs', 5500]], FREE = INCOME - 15000 - 5500;   // 9,500
const EMIS = [['fridge', 3000], ['phone', 2500], ['scooter', 4000]];
const INK = 'var(--sim-label)', MUTED = 'var(--sim-label-muted)', ACC = 'var(--sim-accent)', ACC_INK = shade('var(--sim-accent)', 62);
const BAD = 'var(--sim-bad)', BAD_INK = shade('var(--sim-bad)', 80);
const PRIN_C = 'var(--sim-series-1)', INT_C = 'var(--sim-series-8)';
const SAVE_C = 'var(--sim-series-3)', EMERG_C = 'var(--sim-series-7)';
const FIX_C = ['color-mix(in oklab, var(--sim-label-muted) 50%, var(--sim-bg-surface))', 'color-mix(in oklab, var(--sim-label-muted) 28%, var(--sim-bg-surface))'];
const EMI_C = ['var(--sim-bad)', 'color-mix(in oklab, var(--sim-bad) 70%, var(--sim-bg-surface))', 'color-mix(in oklab, var(--sim-bad) 82%, var(--sim-label))'];

const CSS = `
.fe-ab { position: absolute; transform: translate(-50%, -50%); }
.fe-col { position: absolute; display: flex; flex-direction: column; gap: 12px; transform: translate(-50%, 0); }
.fe-row { position: absolute; display: flex; gap: 8px; transform: translate(-50%, -50%); }
.fe-btn { min-height: 48px; padding: 5px 14px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 19px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.fe-btn[aria-pressed="true"] { background: color-mix(in oklab, var(--sim-bad) 20%, var(--sim-bg-surface)); border-color: var(--sim-bad); color: var(--sim-label);
  box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-bad); }
.fe-btn:active { transform: translateY(3px); box-shadow: none; }
.fe-btn:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
`;

const text = (x, y, t, size, col = INK, anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;
const calm = () => !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
/** A plain fridge (no face): (x, y) = bottom centre, w wide, 1.75w tall; freezer door on top. */
const fridge = (x, y, w, o = {}) => {
  const h = w * 1.75, x0 = x - w / 2, y0 = y - h, r = Math.max(3, w * 0.1), split = y0 + h * 0.34;
  const body = 'color-mix(in oklab, var(--sim-series-1) 14%, var(--sim-bg-surface))', edge = 'color-mix(in oklab, var(--sim-series-1) 45%, var(--sim-label))';
  const sw = Math.max(1.5, w * 0.03), hw = Math.max(2, w * 0.05);
  return `<g${o.dim ? ' style="opacity:0.3"' : ''}><rect x="${f1(x0)}" y="${f1(y0 + w * 0.04)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(r)}" ${fill(edge)}/>`
    + `<rect x="${f1(x0)}" y="${f1(y0)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(r)}" ${fill(body, `stroke:${edge};stroke-width:${f1(sw)}`)}/>`
    + `<path d="M${f1(x0)} ${f1(split)}H${f1(x0 + w)}" ${stroke(edge, sw)}/>`
    + `<path d="M${f1(x0 + w * 0.8)} ${f1(y0 + h * 0.1)}V${f1(y0 + h * 0.25)}M${f1(x0 + w * 0.8)} ${f1(split + h * 0.08)}V${f1(split + h * 0.3)}" ${stroke(edge, hw, 'stroke-linecap:round')}/></g>`;
};

export class FridgeEmiScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 490;
  static PORTRAIT_HEIGHT = 620;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'A refrigerator costs 30,000 rupees. The family repays 3,000 rupees a month for 12 months, an EMI; each EMI is roughly 2,500 rupees of principal and 500 rupees of interest. Twelve payments of 3,000 rupees come to 36,000 rupees, 6,000 rupees more than the price. With the EMI the family has the fridge from month 1; saving 3,000 rupees a month first, it pays 30,000 rupees but has no fridge for 10 months. Made-up numbers: a monthly income of 30,000 rupees; adding a fridge EMI of 3,000, a phone EMI of 2,500 and a scooter EMI of 4,000 shrinks the savings and the emergency money from 4,750 rupees each to nothing.';

  async setup() {
    this.fresh = false;
    this.on = [true, true, true];
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      const a = b?.dataset.act;
      if (a === 'replay') this.run();
      else if (a === 'emi') { this.clear(); const i = Number(b.dataset.val); this.on[i] = !this.on[i]; this.repaint(); }
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MONEY_CSS + CSS; }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.fresh = false; }

  enter() { this.clear(); this.on = [true, true, true]; this.after(0.05, () => this.run()); }

  run() {
    this.clear();
    this.on = [true, true, true];
    if (calm()) { this.repaint(); return; }
    this.fresh = true;
    if (this.stepIndex === 2) {
      this.on = [false, false, false];
      EMIS.forEach((_, i) => this.after(0.7 + i * 0.8, () => { this.on[i] = true; this.repaint(); }));
      this.after(0.7 + 3 * 0.8, () => { this.fresh = false; this.repaint(); });
    } else {
      this.after(2.8, () => { this.fresh = false; this.repaint(); });
    }
    this.repaint();
  }

  skip() {
    if (!this.fresh) return false;
    this.clear();
    this.on = [true, true, true];
    this.repaint();
    return true;
  }

  busy() { return this.fresh; }

  stageHeight(st) { return Math.round((st.portrait ? 620 : 490) * st.W / (st.portrait ? 390 : 560)); }

  anim(cls, d, body, extra = '') { return `<g${this.fresh ? ` class="${cls}" style="--d:${d}s;${extra}"` : ''}>${body}</g>`; }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 620 : 490, k = (st.W / DW).toFixed(4);
    const v = this.stepIndex;
    const out = v === 0 ? this.paintEmi(P) : v === 1 ? this.paintTotal(P) : this.paintIncome(P);
    let over = out.over ?? '';
    if (!this.fresh) over += `<div class="fe-ab" style="left:${P ? 330 : 500}px;top:${P ? 596 : 462}px"><button type="button" class="sv-hit fe-btn" data-act="replay">replay</button></div>`;
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${over}</div>` };
  }

  paintEmi(P) {
    let svg = '';
    const G = P ? { fr: [70, 196, 96], tag: [246, 70, 180], big: [246, 160], strip: [20, 296, 350, 104], leg: 468 }
      : { fr: [90, 236, 110], tag: [252, 92, 190], big: [446, 110], strip: [24, 290, 512, 100], leg: 450 };
    svg += fridge(G.fr[0], G.fr[1], G.fr[2]);
    svg += tag(G.tag[0], G.tag[1], 'fridge', PRICE, { w: G.tag[2], tone: 'plain', valueSize: 34 });
    const [bx, by] = G.big;
    svg += text(bx, by - (P ? 0 : 40), 'EMI', 22, MUTED, 'middle', 700);
    svg += text(bx, by + (P ? 36 : 0), rs(EMI), P ? 36 : 40, ACC_INK);
    svg += text(bx, by + (P ? 64 : 30), 'a month', 21, INK, 'middle', 700);
    svg += text(bx, by + (P ? 92 : 62), 'for 12 months', 21, INK, 'middle', 700);
    // the strip: 12 bars, principal (bottom) + interest (top)
    const [sx, sy, sw, sh] = G.strip, step = sw / MONTHS, bw = step * 0.8, hp = sh * PRIN / EMI;
    for (let m = 0; m < MONTHS; m++) {
      const x = sx + m * step + (step - bw) / 2;
      svg += this.anim('mk-rise', (0.3 + m * 0.12).toFixed(2), `<rect x="${f1(x)}" y="${f1(sy + sh - hp)}" width="${f1(bw)}" height="${f1(hp)}" rx="4" ${fill(PRIN_C)}/>`
        + `<rect x="${f1(x)}" y="${f1(sy)}" width="${f1(bw)}" height="${f1(sh - hp - 2)}" rx="4" ${fill(INT_C)}/>`);
      svg += text(x + bw / 2, sy + sh + 22, String(m + 1), P ? 17 : 18, MUTED, 'middle', 700);
    }
    svg += `<path d="M${sx - 4} ${sy + sh + 1}H${sx + sw + 2}" ${stroke(INK, 2.5)}/>`;
    svg += text(sx, sy - 12, 'month by month', 19, MUTED, 'start', 700);
    // legend
    const L = G.leg;
    const sq = (x, y, c) => `<rect x="${f1(x)}" y="${f1(y - 17)}" width="20" height="20" rx="5" ${fill(c)}/>`;
    if (P) {
      svg += sq(20, L, PRIN_C) + text(48, L, 'principal', 21, INK, 'start') + text(240, L, rs(PRIN), 22, INK, 'end');
      svg += sq(20, L + 36, INT_C) + text(48, L + 36, 'interest', 21, INK, 'start') + text(240, L + 36, rs(INT), 22, INK, 'end');
      svg += text(20, L + 72, 'each month, roughly', 19, MUTED, 'start', 700);
    } else {
      svg += sq(24, L, PRIN_C) + text(52, L, `principal ${rs(PRIN)}`, 21, INK, 'start');
      svg += sq(250, L, INT_C) + text(278, L, `interest ${rs(INT)}`, 21, INK, 'start');
      svg += text(24, L + 30, 'each month, roughly', 19, MUTED, 'start', 700);
    }
    return { svg };
  }

  paintTotal(P) {
    let svg = '';
    const W = P ? 390 : 560, cx = W / 2;
    svg += text(cx, 44, `12 x ${rs(EMI)} = ${rs(TOTAL)}`, P ? 30 : 34, INK);
    svg += this.anim('mk-pop', 0.5, text(P ? 20 : 60, 88, `price ${rs(PRICE)}`, P ? 22 : 24, MUTED, 'start', 800)
      + text(P ? 370 : 500, 88, `+${rs(INTEREST)} interest`, P ? 23 : 26, BAD_INK, 'end'));
    const sx = P ? 20 : 24, sw = P ? 350 : 512, step = sw / MONTHS, cw = step - 4;
    const rows = [
      { y: P ? 160 : 150, head: 'EMI', cap: `fridge from month 1, pays ${rs(TOTAL)}`, cell: () => 'fridge' },
      { y: P ? 300 : 280, head: `save ${rs(EMI)} a month first`, cap: `no fridge for 10 months, pays ${rs(PRICE)}`, cell: (m) => (m < SAVE_MONTHS ? 'coin' : 'fridge') },
    ];
    rows.forEach((r, ri) => {
      const d = 0.9 + ri * 0.9;
      svg += text(sx, r.y - 14, r.head, 22, INK, 'start');
      const ch = P ? 50 : 56;
      for (let m = 0; m < MONTHS; m++) {
        const x = sx + m * step + 2, kind = r.cell(m);
        let cell = `<rect x="${f1(x)}" y="${r.y}" width="${f1(cw)}" height="${ch}" rx="7" ${fill(kind === 'fridge' ? 'color-mix(in oklab, var(--sim-series-1) 12%, var(--sim-bg-surface))' : 'var(--sim-bg-surface)', `stroke:${kind === 'fridge' ? 'var(--sim-series-1)' : 'var(--sim-stroke)'};stroke-width:2;${kind === 'fridge' ? '' : 'stroke-dasharray:5 4'}`)}/>`;
        cell += kind === 'fridge' ? fridge(x + cw / 2, r.y + ch - 6, Math.min(cw * 0.55, 22)) : coin(x + cw / 2, r.y + ch / 2, P ? 9 : 11);
        svg += this.anim('mk-pop', (d + m * 0.05).toFixed(2), cell);
      }
      svg += text(sx, r.y + ch + 28, r.cap, P ? 19 : 21, ri ? MUTED : INK, 'start', 800);
    });
    const y = P ? 470 : 410;
    const label = P ? ['EMI: the fridge now,', `no ${rs(PRICE)} in one go`] : [`EMI: the fridge now, no ${rs(PRICE)} in one go`];
    const bw = P ? 330 : 500, bh = P ? 76 : 50;
    svg += this.anim('mk-pop', 2.4, `<rect x="${f1(cx - bw / 2)}" y="${f1(y - bh / 2)}" width="${bw}" height="${bh}" rx="${bh / 2}" ${fill('color-mix(in oklab, var(--sim-accent) 16%, var(--sim-bg-surface))', 'stroke:var(--sim-accent);stroke-width:3')}/>`
      + label.map((t, i) => text(cx, y + 8 + (i - (label.length - 1) / 2) * 28, t, 22, ACC_INK)).join(''));
    return { svg };
  }

  /** The monthly budget with the EMIs that are on: [label, amount, colour, kind] bottom to top. */
  segments() {
    const emis = EMIS.filter((_, i) => this.on[i]);
    const E = emis.reduce((s, [, a]) => s + a, 0);
    const left = (FREE - E) / 2;   // each EMI takes half from savings and half from emergency
    return [
      ...FIXED.map(([l, a], i) => [l, a, FIX_C[i], 'fixed']),
      ...EMIS.map(([l, a], i) => (this.on[i] ? [`${l} EMI`, a, EMI_C[i], 'emi'] : null)).filter(Boolean),
      ['savings', left, SAVE_C, 'save'],
      ['emergency', left, EMERG_C, 'save'],
    ];
  }

  paintIncome(P) {
    let svg = '', over = '';
    const G = P ? { bx: 20, bw: 72, top: 70, bot: 470, lx: 108, rx: 380 } : { bx: 40, bw: 96, top: 64, bot: 440, lx: 152, rx: 390 };
    svg += text(P ? 20 : 24, 36, `income ${rs(INCOME)} a month`, P ? 22 : 24, INK, 'start');
    svg += text(P ? 370 : 548, P ? 58 : 36, 'made-up numbers', 18, MUTED, 'end', 700);
    const segs = this.segments(), scale = (G.bot - G.top) / INCOME;
    let y = G.bot;
    const labs = [];
    segs.forEach(([l, a, c, kind]) => {
      const h = a * scale;
      if (h > 0.5) svg += `<rect x="${G.bx}" y="${f1(y - h)}" width="${G.bw}" height="${f1(h)}" ${fill(c, 'stroke:var(--sim-bg-surface);stroke-width:2')}/>`;
      labs.push({ l, a, kind, y: y - h / 2 });
      y -= h;
    });
    svg += `<rect x="${G.bx}" y="${G.top}" width="${G.bw}" height="${G.bot - G.top}" rx="6" ${fill('none', 'stroke:var(--sim-label);stroke-width:3')}/>`;
    // labels: centred on their part, pushed apart (top down) so none overlap
    const gap = P ? 30 : 30;
    for (let i = labs.length - 2; i >= 0; i--) labs[i].y = Math.max(labs[i].y, labs[i + 1].y + gap);
    for (let i = labs.length - 1; i >= 0; i--) labs[i].y = Math.max(labs[i].y, G.top + 12 + (labs.length - 1 - i) * gap);
    for (let i = 1; i < labs.length; i++) labs[i].y = Math.min(labs[i].y, labs[i - 1].y - gap);
    labs.forEach((b) => {
      const zero = b.kind === 'save' && b.a <= 0;
      const ink = b.kind === 'emi' || zero ? BAD_INK : INK;
      svg += text(G.lx, b.y + 7, b.l, P ? 20 : 21, ink, 'start', b.kind === 'fixed' ? 700 : 800) + text(G.rx, b.y + 7, rs(Math.max(0, b.a)), P ? 21 : 22, ink, 'end');
    });
    const left = segs.filter((s) => s[3] === 'save').reduce((s, x) => s + Math.max(0, x[1]), 0);
    const btns = EMIS.map(([l, a], i) => `<button type="button" class="sv-hit fe-btn" data-act="emi" data-val="${i}" aria-pressed="${this.on[i]}" aria-label="${l} EMI ${a} rupees">+ ${l}</button>`).join('');
    if (P) {
      over += `<div class="fe-row" style="left:195px;top:498px">${btns}</div>`;
      if (left <= 0) svg += text(20, 554, 'nothing left for a bad month', 22, BAD_INK, 'start');
    } else {
      svg += text(480, 96, 'add an EMI', 20, MUTED, 'middle', 700);
      over += `<div class="fe-col" style="left:480px;top:112px">${btns}</div>`;
      if (left <= 0) svg += text(480, 350, 'nothing left', 22, BAD_INK) + text(480, 378, 'for a bad', 22, BAD_INK) + text(480, 406, 'month', 22, BAD_INK);
      else svg += text(480, 356, 'left each month', 19, MUTED, 'middle', 700) + text(480, 392, rs(left), 30, INK);
    }
    return { svg, over };
  }

  testState() {
    const segs = this.segments();
    return { view: this.stepIndex, fresh: this.fresh, on: this.on.slice(), total: TOTAL, interest: INTEREST, saveMonths: SAVE_MONTHS, free: FREE, segs: segs.map(([l, a]) => [l, a]) };
  }
}
