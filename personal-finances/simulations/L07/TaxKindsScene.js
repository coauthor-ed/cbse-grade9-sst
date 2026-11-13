/**
 * TaxKindsScene - L07 s01 "Taxes" (2 beats). SvgScene, design 560 x 490 landscape, 390 x 640 portrait.
 *   b0 Who pays for the school?: people and businesses pay taxes (a stream of coins) into a government
 *      building; four branches carry the money out to a school, a hospital, transport and defence.
 *      Key label "taxes pay for public services".
 *   b1 Direct and indirect: two sources feed the same stream. A salary slip with "income tax" taken out of
 *      the pay (tag DIRECT, "on income") and a shop bill for a notebook, Rs 50 + GST (example) Rs 6 = Rs 56
 *      (made-up numbers; tag INDIRECT, "added to the price"). "try it" lifts the two tags into a tray; tap a
 *      tag, then the paper it belongs on. A wrong paper says why in one short line.
 * Rest / cold start: everything drawn, both tags placed; each beat plays in on entry, with replay.
 * Tokens only. ASCII only.
 */
import { SvgScene, stroke, fill, shade } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';
import { MONEY_CSS, rs, coin } from '../shared/MoneyKit.js';

const f1 = (v) => (+v).toFixed(1);
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const PRICE = 50, GST = 6, TOTAL = PRICE + GST;   // made-up bill: Rs 56
const INK = 'var(--sim-label)', MUTED = 'var(--sim-label-muted)', ACC_INK = shade('var(--sim-accent)', 62);
const TAX = 'var(--sim-series-8)', TAX_INK = 'color-mix(in oklab, var(--sim-series-8) 60%, var(--sim-label))';
const DIR = 'var(--sim-series-1)', DIR_INK = 'color-mix(in oklab, var(--sim-series-1) 62%, var(--sim-label))';
const IND = 'var(--sim-series-5)', IND_INK = 'color-mix(in oklab, var(--sim-series-5) 58%, var(--sim-label))';
const GOOD_INK = 'color-mix(in oklab, var(--sim-series-3) 55%, var(--sim-label))', BAD_INK = shade('var(--sim-bad)', 80);
const PAY = 'color-mix(in oklab, var(--sim-series-3) 45%, var(--sim-bg-surface))';
const SERVICES = [['school', 'school', 4], ['hospital', 'hospital', 7], ['road', 'transport', 6], ['shield', 'defence', 1]];
const TAGS = { direct: { word: 'DIRECT', sub: 'on income', col: DIR, ink: DIR_INK, home: 'slip' }, indirect: { word: 'INDIRECT', sub: 'added to the price', col: IND, ink: IND_INK, home: 'bill' } };
const WHY = { slip: 'Income tax is taken from the pay: a direct tax.', bill: 'GST is added to the price: an indirect tax.' };

const CSS = `
.tk-ab { position: absolute; transform: translate(-50%, -50%); display: flex; gap: 10px; }
.tk-btn { min-height: 46px; padding: 5px 16px; cursor: pointer; white-space: nowrap;
  border-radius: calc(12px * var(--look-radius, 1)); font: 800 19px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.tk-btn:active { transform: translateY(3px); box-shadow: none; }
.tk-btn:focus-visible, .tk-hit:focus-visible, .tk-tag:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.tk-hit { position: absolute; background: transparent; border: 0; padding: 0; cursor: pointer; border-radius: 16px; }
.tk-hit[data-armed="1"] { outline: 3px dashed var(--sim-accent); outline-offset: -3px; }
.tk-tag { position: absolute; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; justify-content: center;
  min-width: 150px; min-height: 58px; padding: 4px 14px; white-space: nowrap; cursor: pointer; border-radius: 14px; line-height: 1.1;
  background: color-mix(in oklab, var(--tk-c) 16%, var(--sim-bg-surface)); color: var(--tk-ink);
  border: 3px solid var(--tk-c); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--tk-c); }
.tk-tag b { font: 900 22px/1.05 var(--sim-font); letter-spacing: 0.04em; }
.tk-tag span { font: 800 18px/1.1 var(--sim-font); }
.tk-tag[aria-pressed="true"] { outline: 4px solid var(--sim-accent); outline-offset: 3px; }
.tk-tag.tk-in { animation: tk-in 0.45s cubic-bezier(.3,1.5,.5,1) both; animation-delay: var(--d, 0s); }
@keyframes tk-in { 0% { transform: translate(-50%, -50%) scale(0.4); opacity: 0; } 100% { transform: translate(-50%, -50%); opacity: 1; } }
svg .tk-grow { stroke-dasharray: 1 0; animation: tk-draw 0.7s ease-out both; animation-delay: var(--d, 0s); }
@keyframes tk-draw { 0% { stroke-dasharray: 0 400; } 100% { stroke-dasharray: 400 0; } }
@media (prefers-reduced-motion: reduce) { .tk-tag.tk-in, svg .tk-grow { animation: none; } }
`;

const text = (x, y, t, size, col = INK, anchor = 'middle', w = 800) =>
  `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" style="fill:${col};font:${w} ${size}px var(--sim-font)">${t}</text>`;
const panel = (x, y, w, h, o = {}) => `<rect x="${f1(x)}" y="${f1(y + 4)}" width="${f1(w)}" height="${f1(h)}" rx="14" ${fill('var(--sim-stroke)')}/>`
  + `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="14" ${fill(o.bg ?? 'var(--sim-bg-surface)', `stroke:${o.edge ?? 'var(--sim-stroke)'};stroke-width:${o.sw ?? 2.5}`)}/>`;
/** A plain shield for defence (SimIcons has none): centred on (x, y), s across. */
const shield = (x, y, s, tone) => {
  const k = s / 48, c = `var(--sim-series-${tone})`;
  return `<g transform="translate(${f1(x - s / 2)} ${f1(y - s / 2)}) scale(${f1(k)})">`
    + `<path d="M24 4L41 10V22C41 33 33 40 24 44C15 40 7 33 7 22V10Z" ${fill(`color-mix(in oklab, ${c} 64%, black)`)}/>`
    + `<path d="M24 2L41 8V20C41 31 33 38 24 42C15 38 7 31 7 20V8Z" ${fill(c)}/>`
    + `<path d="M24 8L35 12V20C35 28 30 33 24 36Z" ${fill(`color-mix(in oklab, ${c} 45%, white)`)}/></g>`;
};
const icon = (name, x, y, s, tone) => (name === 'shield' ? shield(x, y, s, tone)
  : `<g transform="translate(${f1(x - s / 2)} ${f1(y - s / 2)}) scale(${f1(s / 48)})">${iconSvg(name, tone)}</g>`);
const arrowHead = (x, y, ang, col, s = 12) => {
  const a = (ang * Math.PI) / 180, p = (t) => [x + Math.cos(a + t) * s, y + Math.sin(a + t) * s];
  const [x1, y1] = p(Math.PI * 0.82), [x2, y2] = p(-Math.PI * 0.82);
  return `<path d="M${f1(x)} ${f1(y)}L${f1(x1)} ${f1(y1)}L${f1(x2)} ${f1(y2)}Z" ${fill(col)}/>`;
};
const calm = () => !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export class TaxKindsScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 490;
  static PORTRAIT_HEIGHT = 660;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 2: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'Taxes. People and businesses pay taxes to the government, and the government uses the money for schools, hospitals, transport and defence. Two kinds of tax feed the same stream: income tax is taken out of a salary, a direct tax on income; GST is added to the price on a shop bill, made-up numbers: a notebook of 50 rupees plus 6 rupees GST makes 56 rupees, an indirect tax.';

  async setup() {
    this.fresh = false;
    this.place = { direct: 'slip', indirect: 'bill' };
    this.sel = null;
    this.said = null;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      const a = b?.dataset.act;
      if (a === 'replay') this.run();
      else if (a === 'try') { this.clear(); this.place = { direct: 'tray', indirect: 'tray' }; this.sel = null; this.said = null; this.repaint(); }
      else if (a === 'tag') { this.clear(); const k = b.dataset.val; this.sel = this.place[k] === 'tray' ? (this.sel === k ? null : k) : null; this.repaint(); }
      else if (a === 'paper') this.drop(b.dataset.val);
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MONEY_CSS + CSS; }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.fresh = false; }

  enter() { this.clear(); this.reset(); this.after(0.05, () => this.run()); }

  reset() { this.place = { direct: 'slip', indirect: 'bill' }; this.sel = null; this.said = null; }

  run() {
    this.clear();
    this.reset();
    if (calm()) { this.repaint(); return; }
    this.fresh = true;
    this.after(2.6, () => { this.fresh = false; this.repaint(); });
    this.repaint();
  }

  skip() {
    if (!this.fresh) return false;
    this.clear();
    this.repaint();
    return true;
  }

  busy() { return this.fresh; }

  /** Put the selected tag on a paper: the right one keeps it, a wrong one says why. */
  drop(paper) {
    this.clear();
    const k = this.sel;
    if (!k) return;
    if (TAGS[k].home === paper) { this.place[k] = paper; this.sel = null; this.said = this.place.direct === 'slip' && this.place.indirect === 'bill' ? 'done' : null; }
    else this.said = TAGS[k].home;
    this.repaint();
  }

  stageHeight(st) { return Math.round((st.portrait ? 660 : 490) * st.W / (st.portrait ? 390 : 560)); }

  anim(cls, d, body, extra = '') { return `<g${this.fresh ? ` class="${cls}" style="--d:${d}s;${extra}"` : ''}>${body}</g>`; }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 660 : 490, k = (st.W / DW).toFixed(4);
    const out = this.stepIndex === 0 ? this.paintWho(P) : this.paintKinds(P);
    let over = out.over ?? '';
    if (!this.fresh && this.stepIndex === 0) over += `<div class="tk-ab" style="left:${P ? 330 : 500}px;top:${P ? 628 : 462}px"><button type="button" class="sv-hit tk-btn" data-act="replay">replay</button></div>`;
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${over}</div>` };
  }

  /** Coins riding a path from (x0, y0) to (x1, y1): n coins, staggered; at rest they sit spread along it. */
  stream(x0, y0, x1, y1, n, d0, r = 11) {
    let s = `<path d="M${f1(x0)} ${f1(y0)}L${f1(x1)} ${f1(y1)}" ${stroke('color-mix(in oklab, var(--sim-series-2) 55%, var(--sim-bg-surface))', 10, 'stroke-linecap:round')}/>`;
    const ang = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
    s += arrowHead(x1 + Math.cos((ang * Math.PI) / 180) * 12, y1 + Math.sin((ang * Math.PI) / 180) * 12, ang, 'color-mix(in oklab, var(--sim-series-2) 55%, var(--sim-label))', 16);
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
      if (this.fresh) s += `<g class="mk-fly" style="--d:${(d0 + i * 0.18).toFixed(2)}s;--dx:${f1(x0 - x)}px;--dy:${f1(y0 - y)}px">${coin(x, y, r)}</g>`;
      else s += coin(x, y, r);
    }
    return s;
  }

  /** A branch from the government to a service: a line that grows, with an arrow head. */
  branch(x0, y0, x1, y1, d) {
    const ang = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
    const col = 'color-mix(in oklab, var(--sim-series-2) 55%, var(--sim-label))';
    return `<path d="M${f1(x0)} ${f1(y0)}L${f1(x1)} ${f1(y1)}" pathLength="400" ${this.fresh ? `class="tk-grow" style="--d:${d}s;stroke:${col};stroke-width:5;stroke-linecap:round;fill:none"` : stroke(col, 5, 'stroke-linecap:round')}/>`
      + this.anim('mk-pop', (d + 0.6).toFixed(2), arrowHead(x1, y1, ang, col, 14));
  }

  paintWho(P) {
    let svg = '';
    const G = P
      ? { key: [[195, 44], [195, 78]], src: [[105, 165, 'crowd', 'people', 8], [285, 165, 'shop', 'businesses', 5]], gov: [195, 318, 112], govLab: 392,
        sv: [[46, 478], [142, 478], [246, 478], [344, 478]], svIcon: 54, svLabDy: 50, from: [195, 404] }
      : { key: [[280, 42]], src: [[78, 150, 'crowd', 'people', 8], [78, 318, 'shop', 'businesses', 5]], gov: [262, 236, 124], govLab: 322,
        sv: [[408, 112], [408, 206], [408, 300], [408, 394]], svIcon: 60, svLabDx: 40, from: [326, 236] };
    // key label
    const keyT = P ? ['taxes pay for', 'public services'] : ['taxes pay for public services'];
    keyT.forEach((t, i) => { svg += text(G.key[i][0], G.key[i][1], t, 28, ACC_INK, 'middle', 900); });
    // who pays
    G.src.forEach(([x, y, ic, lab, tone], i) => {
      svg += icon(ic, x, y, P ? 70 : 76, tone) + text(x, y + (P ? 58 : 62), lab, 21, INK);
      const [gx, gy] = G.gov;
      const to = P ? [gx + (i ? 28 : -28), gy - 70] : [gx - 74, gy + (i ? 26 : -26)];
      const from = P ? [x + (i ? -18 : 18), y + 70] : [x + 52, y + (i ? -16 : 16)];
      svg += this.stream(from[0], from[1], to[0], to[1], 3, 0.2 + i * 0.3);
    });
    svg += text(P ? 195 : 168, P ? 214 : 243, 'taxes', 22, 'color-mix(in oklab, var(--sim-series-2) 50%, var(--sim-label))', 'middle', 900);
    // the government
    const [gx, gy, gs] = G.gov;
    svg += icon('building', gx, gy, gs, 4) + text(gx, G.govLab, 'government', 22, INK);
    // branches out
    G.sv.forEach(([x, y], i) => {
      const [ic, lab, tone] = SERVICES[i];
      const d = 1.2 + i * 0.25;
      if (P) svg += this.branch(G.from[0] + (i - 1.5) * 16, G.from[1], x + (195 - x) * 0.18, y - 38, d);
      else svg += this.branch(G.from[0], G.from[1] + (i - 1.5) * 18, x - 40, y, d);
      const body = icon(ic, x, y, G.svIcon, tone) + (P ? text(x, y + G.svLabDy, lab, 22, INK) : text(x + G.svLabDx, y + 8, lab, 22, INK, 'start'));
      svg += this.anim('mk-pop', (d + 0.5).toFixed(2), body);
    });
    return { svg };
  }

  paintKinds(P) {
    let svg = '', over = '';
    const G = P
      ? { slip: [20, 20, 350, 170], bill: [20, 334, 350, 214], gov: [104, 262, 84], govLab: [160, 270, 'start'], tray: [[104, 626], [292, 626]], say: [195, 592], tryB: [195, 626] }
      : { slip: [16, 24, 316, 196], bill: [16, 244, 316, 228], gov: [452, 156, 112], govLab: [452, 82, 'middle'], tray: [[452, 372], [452, 442]], say: [470, 252], tryB: [452, 462] };
    // the salary slip: pay bar with income tax taken out
    {
      const [x, y, w, h] = G.slip;
      svg += panel(x, y, w, h);
      svg += text(x + 18, y + 34, 'salary slip', 22, INK, 'start', 900);
      const bx = x + 18, by = y + 70, bw = w - 36, bh = 46, cut = bw * 0.3;
      svg += `<rect x="${f1(bx)}" y="${f1(by)}" width="${f1(bw - cut)}" height="${bh}" rx="8" ${fill(PAY)}/>`;
      svg += this.anim('mk-pop', 0.5, `<rect x="${f1(bx + bw - cut + 4)}" y="${f1(by)}" width="${f1(cut - 4)}" height="${bh}" rx="8" ${fill(TAX)}/>`);
      svg += text(bx + 12, by + 31, 'pay', 21, INK, 'start', 800);
      svg += text(bx + bw, by + bh + 28, 'income tax', 20, TAX_INK, 'end', 900);
      svg += text(bx + 12, by + bh + 28, 'take home', 20, MUTED, 'start', 700);
      svg += `<path d="M${f1(bx + bw - cut + 2)} ${f1(by - 8)}V${f1(by + bh + 8)}" ${stroke(INK, 2.5, 'stroke-dasharray:5 4')}/>`;
    }
    // the shop bill: notebook + GST = total
    {
      const [x, y, w, h] = G.bill;
      svg += panel(x, y, w, h);
      svg += text(x + 18, y + 34, 'shop bill', 22, INK, 'start', 900);
      const r0 = y + 76, rx = x + w - 22;
      svg += text(x + 18, r0, 'notebook', 21, INK, 'start', 700) + text(rx, r0, rs(PRICE), 22, INK, 'end');
      svg += this.anim('mk-pop', 0.7, `<rect x="${f1(x + 10)}" y="${f1(r0 + 12)}" width="${f1(w - 20)}" height="40" rx="8" ${fill('color-mix(in oklab, var(--sim-series-8) 18%, var(--sim-bg-surface))')}/>`
        + text(x + 18, r0 + 40, 'GST (example)', 21, TAX_INK, 'start', 900) + text(rx, r0 + 40, rs(GST), 22, TAX_INK, 'end'));
      svg += `<path d="M${f1(x + 18)} ${f1(r0 + 66)}H${f1(rx)}" ${stroke(INK, 2.5)}/>`;
      svg += text(x + 18, r0 + 98, 'you pay', 22, INK, 'start', 900) + text(rx, r0 + 98, rs(TOTAL), 28, INK, 'end', 900);
      svg += text(x + 18, r0 + 126, 'made-up numbers', 17, MUTED, 'start', 700);
    }
    // the government, fed by both
    const [gx, gy, gs] = G.gov;
    svg += icon('building', gx, gy, gs, 4) + text(G.govLab[0], G.govLab[1], 'government', 21, INK, G.govLab[2]);
    if (P) {
      svg += this.stream(318, 196, gx + 54, gy - 22, 2, 0.4, 10);
      svg += this.stream(318, 330, gx + 54, gy + 22, 2, 0.8, 10);
    } else {
      const [sx, sy, sw] = G.slip, [bx, bY, bw] = G.bill;
      svg += this.stream(sx + sw + 4, sy + 92, gx - gs / 2 - 6, gy - 22, 2, 0.4, 10);
      svg += this.stream(bx + bw + 4, bY + 116, gx - 34, gy + 54, 2, 0.8, 10);
    }
    // the two tags: on their paper, or in the tray
    const spot = {
      slip: P ? [G.slip[0] + G.slip[2] - 92, G.slip[1] + 30] : [G.slip[0] + G.slip[2] - 86, G.slip[1] + 26],
      bill: P ? [G.bill[0] + G.bill[2] - 92, G.bill[1] - 2] : [G.bill[0] + G.bill[2] - 86, G.bill[1] - 2],
    };
    const traySlots = G.tray.slice();
    const inTray = Object.keys(TAGS).filter((k) => this.place[k] === 'tray');
    Object.entries(TAGS).forEach(([key, t], i) => {
      const where = this.place[key];
      const [x, y] = where === 'tray' ? traySlots[inTray.indexOf(key)] : spot[where];
      const cls = this.fresh ? ' tk-in' : '';
      over += `<button type="button" class="sv-hit tk-tag${cls}" data-act="tag" data-val="${key}" aria-pressed="${this.sel === key}" aria-label="${t.word} tax, ${t.sub}" style="left:${x}px;top:${y}px;--tk-c:${t.col};--tk-ink:${t.ink};--d:${(1.5 + i * 0.4).toFixed(2)}s"><b>${t.word}</b><span>${t.sub}</span></button>`;
    });
    // tap targets on the two papers (only while a tag is selected)
    if (this.sel) {
      for (const p of ['slip', 'bill']) {
        const [x, y, w, h] = G[p];
        over += `<button type="button" class="sv-hit tk-hit" data-act="paper" data-val="${p}" data-armed="1" aria-label="put it on the ${p === 'slip' ? 'salary slip' : 'shop bill'}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"></button>`;
      }
    }
    // the line under it all
    if (inTray.length) {
      const [sx, sy] = G.say;
      const msg = this.said && this.said !== 'done' ? WHY[this.said] : this.sel ? 'now tap its paper' : 'tap a tag';
      const col = this.said && this.said !== 'done' ? BAD_INK : MUTED;
      const lines = this.wrap(msg, P ? 30 : 16);
      svg += lines.map((l, i) => text(sx, sy + (P ? (i - lines.length + 1) * 24 : i * 26), l, P ? 19 : 20, col, 'middle', 800)).join('');
    } else if (this.said === 'done') {
      svg += P ? text(140, 634, 'both right', 24, GOOD_INK, 'middle', 900) : text(G.tray[0][0], G.tray[0][1] + 10, 'both right', 24, GOOD_INK, 'middle', 900);
    }
    if (!this.fresh && !inTray.length) {
      const [tx, ty] = P ? [this.said === 'done' ? 310 : 195, G.tryB[1]] : G.tryB;
      over += `<div class="tk-ab" style="left:${tx}px;top:${ty}px"><button type="button" class="sv-hit tk-btn" data-act="try">${this.said === 'done' ? 'again' : 'try it'}</button></div>`;
    }
    return { svg, over };
  }

  wrap(s, n) {
    const out = [];
    let line = '';
    for (const w of s.split(' ')) {
      if (line && (line + ' ' + w).length > n) { out.push(line); line = w; } else line = line ? `${line} ${w}` : w;
    }
    if (line) out.push(line);
    return out;
  }

  testState() {
    return { view: this.stepIndex, fresh: this.fresh, place: { ...this.place }, sel: this.sel, said: this.said, bill: [PRICE, GST, TOTAL] };
  }
}
