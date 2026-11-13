/**
 * BudgetWeekScene - L01 s06 "Rs 500 for the Week" (2 beats).
 *   b0 budget: a jar that holds Meera's Rs 500. Her list (snacks 150, film ticket 200, game top-up 150,
 *              brother's gift 250) drops into it one item at a time, in the order of the text. The list adds
 *              up to Rs 750, so the stack rises past the rim: the part above the rim is marked "Rs 250 over".
 *   b1 gap:    the list rows are toggles. A row left out is dimmed and says "given up"; its block leaves the
 *              jar and the blocks above it fall. The status says the total and either "fits, Rs N left" or
 *              "Rs N over". Any set within Rs 500 is a fine choice; there is no single right answer.
 *              Rest (cold start): all four in, Rs 250 over, the rows pulse "Tap to leave one out".
 *              Named cases: "drop the gift" (500, fits exactly), "drop film + game" (400, Rs 100 left).
 *              The title row names the market: a shop or an app.
 * Money is numbers on tags only. Colours are tokens only; each item has its own series colour (row
 * swatch = jar block). Drawn in stage px (st.W wide), so text stays its written size. ASCII only.
 */
import { SvgScene, fill, stroke, shade, cushionRect } from 'simulations/base/kit/SimSvg.js';
import { iconSvg } from 'simulations/base/kit/SimIcons.js';

const RS = String.fromCharCode(0x20B9);
const BUDGET = 500;
const ITEMS = [
  { id: 'snacks', name: 'snacks', price: 150, tone: 1, icon: 'snack' },
  { id: 'film', name: 'film ticket', price: 200, tone: 2, icon: 'ticket' },
  { id: 'game', name: 'game top-up', price: 150, tone: 3, icon: 'phone' },
  { id: 'gift', name: 'brother\'s gift', price: 250, tone: 5, icon: 'gift' },
];
const CASES = { nogift: [true, true, true, false], keepgift: [true, false, false, true] };
const MAP = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }]];
const DROP_S = 0.6;                      // one item every 0.6 s
const FILL_END = DROP_S * 3 + 0.6;       // the over mark lands after the fourth item
const f1 = (v) => (+v).toFixed(1);
const ser = (n) => `var(--sim-series-${n})`;

/** Two icons SimIcons does not have, drawn on its 48 grid in the same three shades. */
const OWN = {
  gift: [
    ['M8 21h32v19a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3z', 'b'], ['M6 15h36v8H6z', 'd'], ['M21 15h6v28h-6z', 'l'],
    ['M24 15c-3-7-11-9-12-4s7 5 12 4zM24 15c3-7 11-9 12-4s-7 5-12 4z', 'l'],
  ],
  snack: [
    ['M11 9h26l2 31a3 3 0 0 1-3 3H12a3 3 0 0 1-3-3z', 'b'], ['M10 6l3 3 3-3 3 3 3-3 3 3 3-3 3 3 3-3 3 3v3H10z', 'd'],
    ['M14 18h20v10H14z', 'l'], ['M24 23m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0', 'd'],
  ],
};
const shadeOf = (k) => (k === 'd' ? 'color-mix(in oklab, var(--i) 64%, black)' : k === 'l' ? 'color-mix(in oklab, var(--i) 45%, white)' : 'var(--i)');

/** An icon at (x, y) top-left, s px square. */
function icon(name, tone, x, y, s) {
  const at = `x="${f1(x)}" y="${f1(y)}" width="${f1(s)}" height="${f1(s)}" viewBox="0 0 48 48"`;
  if (OWN[name]) return `<svg ${at} aria-hidden="true" style="--i:${ser(tone)}">${OWN[name].map(([d, k]) => `<path d="${d}" style="fill:${shadeOf(k)}"/>`).join('')}</svg>`;
  return iconSvg(name, tone).replace('viewBox="0 0 48 48" width="48" height="48"', at);
}

/** A price tag (pointed end, a hole) centred on (x, y). Money is always shown this way. */
function priceTag(text, x, y, size, col, o = {}) {
  const h = size * 1.55, n = h * 0.42, w = text.length * size * 0.6 + size * 0.9 + n;
  const x0 = x - w / 2, x1 = x + w / 2, t = y - h / 2, b = y + h / 2;
  const d = (dy) => `M${f1(x0)} ${f1(y + dy)}L${f1(x0 + n)} ${f1(t + dy)}H${f1(x1 - 5)}Q${f1(x1)} ${f1(t + dy)} ${f1(x1)} ${f1(t + 5 + dy)}V${f1(b - 5 + dy)}Q${f1(x1)} ${f1(b + dy)} ${f1(x1 - 5)} ${f1(b + dy)}H${f1(x0 + n)}Z`;
  return `<g${o.cls ? ` class="${o.cls}"` : ''}${o.style ? ` style="${o.style}"` : ''}>`
    + `<path d="${d(3)}" ${fill(shade(col, 70), 'opacity:0.55')}/>`
    + `<path d="${d(0)}" ${fill('var(--sim-bg-surface)', `stroke:${col};stroke-width:2.5;stroke-linejoin:round`)}/>`
    + `<circle cx="${f1(x0 + n * 0.8)}" cy="${f1(y)}" r="${f1(size * 0.13)}" ${fill('var(--sim-bg-deep)', `stroke:${col};stroke-width:1.5`)}/>`
    + `<text x="${f1(x + n * 0.45)}" y="${f1(y)}" text-anchor="middle" dominant-baseline="central" style="fill:var(--sim-label);font:800 ${size}px var(--sim-font)">${text}</text></g>`;
}

const CSS = `
svg .bw-drop { animation: bw-drop 0.5s var(--look-spring-soft, ease-out) both; animation-delay: var(--d, 0s); }
@keyframes bw-drop { from { transform: translateY(-110px); opacity: 0; } to { transform: none; opacity: 1; } }
svg .bw-fall { animation: bw-fall 0.45s ease-in both; animation-delay: 0.15s; }
@keyframes bw-fall { from { transform: translateY(var(--dy, 0px)); } to { transform: none; } }
svg .bw-out { animation: bw-out 0.5s ease-in both; }
@keyframes bw-out { to { transform: translateX(80px); opacity: 0; } }
svg .bw-in, .bw-in { animation: bw-in 0.45s ease-out both; animation-delay: var(--d, 0s); }
@keyframes bw-in { from { opacity: 0; } to { opacity: 1; } }
svg .bw-pulse { animation: bw-pulse 1.3s ease-in-out infinite; }
@keyframes bw-pulse { 50% { opacity: 0.25; } }
.bw-row { position: absolute; transform: translate(-50%, -50%); display: flex; justify-content: center; align-items: center; gap: 8px; flex-wrap: nowrap; white-space: nowrap; }
.bw-read { display: inline-flex; align-items: center; gap: 6px; padding: 4px 14px; border-radius: var(--look-pill, 999px); white-space: nowrap;
  font: 800 19px/1.25 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: calc(2.5px * var(--look-rim, 1)) solid var(--c, var(--sim-stroke)); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--c, var(--sim-stroke)); }
.bw-read b { color: var(--c, var(--sim-label)); }
.bw-btn { min-height: 44px; padding: 4px 14px; cursor: pointer; white-space: nowrap; border-radius: calc(12px * var(--look-radius, 1));
  font: 800 17px/1.1 var(--sim-font); background: var(--sim-bg-surface); color: var(--sim-label);
  border: 2.5px solid var(--sim-stroke); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-stroke); }
.bw-btn:active { transform: translateY(3px); box-shadow: none; }
.bw-btn[aria-pressed="true"] { border-color: var(--sim-accent); box-shadow: 0 calc(3px * var(--look-lip, 1)) 0 var(--sim-accent); }
.bw-hit { position: absolute; padding: 0; border: 0; background: none; border-radius: 12px; cursor: pointer; }
.bw-hit:hover { background: color-mix(in oklab, var(--sim-accent) 8%, transparent); }
.bw-btn:focus-visible, .bw-hit:focus-visible { outline: 3px solid var(--sim-accent); outline-offset: 3px; }
.bw-mk { display: inline-flex; align-items: center; gap: 6px; font: 800 18px/1.2 var(--sim-font); color: var(--sim-label); }
.bw-mk svg { width: 30px; height: 30px; }
.bw-p .bw-read { font-size: 17px; padding: 3px 11px; }
.bw-p .bw-btn { font-size: 16px; padding: 4px 11px; }
`;

export class BudgetWeekScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 496;   // the host budgets the panel from this (about 465 / HEIGHT at 1280x720)
  static PORTRAIT_HEIGHT = 590;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAP;
  static BEAT_MAPS = { 2: MAP };
  static CONTROLS = [];
  static ARIA_LABEL = 'Meera has 500 rupees for the week. A jar holds her 500 rupees. Her list drops in: snacks 150, film ticket 200, game top-up 150 and a gift for her brother 250. The list adds up to 750 rupees, 250 more than she has. Then tap an item to leave it out: the total must fit in 500 rupees, and what she leaves out is given up.';

  async setup() {
    this.inn = [true, true, true, true];
    this.from = null;       // the set before the last tap (for the fall animation)
    this.outId = -1;        // the item that just left the jar
    this.moving = false;
    this.fresh = false;     // b0: the list is still dropping in
    this.moved = false;
    this.pend = [];
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (!b) return;
      this.act(b.dataset.act, b.dataset.val);
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return CSS; }

  cancel() { for (const c of this.pend) c(); this.pend = []; }

  enter(step) {
    this.cancel();
    this.inn = [true, true, true, true];
    this.from = null; this.outId = -1; this.moving = false; this.moved = false;
    this.fresh = step === 0;
    // The rest state needs no animation: a timed repaint drops Skip and shows Replay.
    if (this.fresh) this.pend.push(this.after(FILL_END + 0.5, () => { this.fresh = false; this.repaint(); }));
  }

  act(a, v) {
    if (a === 'skip' || a === 'replay') {
      if (this.stepIndex !== 0) return;
      if (a === 'skip') { this.cancel(); this.fresh = false; } else this.enter(0);
      this.repaint();
      return;
    }
    if (this.stepIndex !== 1) return;
    const before = this.inn.slice();
    if (a === 'item') {
      const i = Number(v);
      if (!(i >= 0 && i < ITEMS.length)) return;
      this.inn[i] = !this.inn[i];
      this.outId = this.inn[i] ? -1 : i;
    } else if (CASES[a]) {
      this.inn = CASES[a].slice();
      this.outId = -1;
    } else return;
    this.from = before;
    this.moved = true;
    this.moving = true;
    this.cancel();
    this.pend.push(this.after(0.7, () => { this.moving = false; this.from = null; this.outId = -1; }));
    this.repaint();
  }

  total(inn = this.inn) { return ITEMS.reduce((s, it, i) => s + (inn[i] ? it.price : 0), 0); }

  /** The top y of each block in the jar for a set (null when left out). */
  stackY(L, inn) {
    let cum = 0;
    return ITEMS.map((it, i) => {
      if (!inn[i]) return null;
      cum += it.price;
      return L.by - cum * L.k;
    });
  }

  layout(st) {
    const P = st.portrait, W = st.W;
    const k = 0.4, top = P ? 52 : 44;
    const by = top + 750 * k;
    const jx = P ? 80 : 104, jw = P ? 106 : 140;
    const rx = jx + jw + (P ? 14 : 24), rw = W - rx - 4;
    const rowH = P ? 62 : 56, gap = 8, ry0 = P ? 60 : 50;
    const rowsEnd = ry0 + 4 * rowH + 3 * gap;
    const readY = P ? by + 40 : rowsEnd + 30;
    const btnY = P ? readY + 54 : Math.max(by + 4, readY) + 44;
    return { P, W, k, top, by, rim: by - BUDGET * k, jx, jw, rx, rw, rowH, gap, ry0, rowsEnd, readY, btnY,
      rowY: (i) => ry0 + i * (rowH + gap) + rowH / 2 };
  }

  stageHeight(st) {
    const L = this.layout(st);
    return Math.round(Math.max(L.by + 30, L.btnY + 30));
  }

  paint(st) {
    const L = this.layout(st), step = this.stepIndex, P = L.P;
    const inn = this.inn, T = this.total(), over = T - BUDGET;
    const fs = P ? 16 : 19, tagFs = P ? 16 : 19;
    let svg = '', over$ = `<div class="${P ? 'bw-p' : 'bw-l'}">`;

    // The jar: its rim is Meera's Rs 500.
    const { jx, jw, by, rim } = L;
    svg += `<rect x="${jx}" y="${f1(rim)}" width="${jw}" height="${f1(by - rim)}" rx="16" ${fill('color-mix(in oklab, var(--sim-bg-surface) 70%, var(--sim-accent))', 'opacity:0.35')}/>`;

    // The blocks, bottom up in list order.
    const ys = this.stackY(L, inn);
    const was = this.moving && this.from ? this.stackY(L, this.from) : null;
    ITEMS.forEach((it, i) => {
      const y = ys[i];
      const h = it.price * L.k, bx = jx + 9, bw = jw - 18;
      if (y == null) {
        if (this.moving && this.outId === i && was?.[i] != null) {
          svg += `<g class="bw-out">${cushionRect(bx, f1(was[i]), bw, f1(h - 3), 8, ser(it.tone))}${icon(it.icon, it.tone, jx + jw / 2 - 17, was[i] + h / 2 - 18, 34)}</g>`;
        }
        return;
      }
      let cls = '', sty = '';
      if (step === 0 && this.fresh) { cls = 'bw-drop'; sty = `--d:${(i * DROP_S).toFixed(2)}s`; }
      else if (this.moving && was) {
        if (was[i] == null) cls = 'bw-drop';
        else if (Math.abs(was[i] - y) > 0.5) { cls = 'bw-fall'; sty = `--dy:${f1(was[i] - y)}px`; }
      }
      const isz = Math.min(40, h - 12);
      svg += `<g${cls ? ` class="${cls}"` : ''}${sty ? ` style="${sty}"` : ''}>${cushionRect(bx, f1(y), bw, f1(h - 3), 8, ser(it.tone))}`
        + `<rect x="${f1(jx + jw / 2 - isz / 2 - 5)}" y="${f1(y + h / 2 - isz / 2 - 6)}" width="${f1(isz + 10)}" height="${f1(isz + 10)}" rx="10" ${fill('var(--sim-bg-surface)', 'opacity:0.85')}/>`
        + `${icon(it.icon, it.tone, jx + jw / 2 - isz / 2, y + h / 2 - isz / 2 - 1, isz)}</g>`;
    });

    // Jar walls over the blocks, and the rim line across.
    svg += `<path d="M${jx - 4} ${f1(rim - 10)}V${by - 16}Q${jx - 4} ${by + 4} ${jx + 16} ${by + 4}H${jx + jw - 16}Q${jx + jw + 4} ${by + 4} ${jx + jw + 4} ${by - 16}V${f1(rim - 10)}" ${stroke('var(--sim-label)', 4.5)}/>`;
    svg += `<path d="M${jx - 14} ${f1(rim - 10)}H${jx + 6}M${jx + jw - 6} ${f1(rim - 10)}H${jx + jw + 14}" ${stroke('var(--sim-label)', 4.5)}/>`;
    svg += `<line x1="${jx - 6}" y1="${f1(rim)}" x2="${jx + jw + 8}" y2="${f1(rim)}" ${stroke('var(--sim-label-muted)', 2.5, 'stroke-dasharray:8 6')}/>`;
    const tx = P ? jx - 36 : jx - 54;
    svg += priceTag(`${RS}500`, tx, rim, tagFs, 'var(--sim-accent)');
    svg += `<text x="${f1(tx + 4)}" y="${f1(rim + (P ? 30 : 34))}" text-anchor="middle" style="fill:var(--sim-label-muted);font:800 ${P ? 15 : 17}px var(--sim-font)">she has</text>`;

    // Above the rim: what does not fit.
    if (over > 0) {
      const topY = by - T * L.k;
      const anim = step === 0 && this.fresh ? ` class="bw-in" style="--d:${FILL_END.toFixed(2)}s"` : '';
      svg += `<g${anim}><rect x="${jx - 2}" y="${f1(topY - 4)}" width="${jw + 4}" height="${f1(rim - topY + 4)}" rx="10" ${fill('color-mix(in oklab, var(--sim-bad) 14%, transparent)', 'stroke:var(--sim-bad);stroke-width:3;stroke-dasharray:9 6')}/>`;
      svg += priceTag(`${RS}${over} over`, jx + jw / 2, topY - (P ? 26 : 24), tagFs, 'var(--sim-bad)');
      svg += '</g>';
    }

    // The list: one row per item, in the colour of its block.
    const head = step === 0 ? 'Meera\'s list' : this.moved ? 'Her choice' : 'Tap to leave one out';
    svg += `<text x="${f1(L.rx + 4)}" y="${f1(L.ry0 - 14)}" ${step === 1 && !this.moved ? 'class="bw-pulse" ' : ''}style="fill:${step === 1 && !this.moved ? 'var(--sim-accent)' : 'var(--sim-label-muted)'};font:800 ${fs}px var(--sim-font)">${head}</text>`;
    ITEMS.forEach((it, i) => {
      const cy = L.rowY(i), x = L.rx, w = L.rw, h = L.rowH, inside = inn[i];
      const anim = step === 0 && this.fresh ? ` class="bw-in" style="--d:${(i * DROP_S).toFixed(2)}s"` : '';
      const dim = step === 1 && !inside;
      svg += `<g${anim}><g style="opacity:${dim ? 0.5 : 1}">`;
      svg += `<rect x="${f1(x)}" y="${f1(cy - h / 2)}" width="${f1(w)}" height="${h}" rx="12" ${fill('var(--sim-bg-surface)', `stroke:${dim ? 'var(--sim-stroke)' : ser(it.tone)};stroke-width:2.5${dim ? ';stroke-dasharray:7 5' : ''}`)}/>`;
      svg += `<rect x="${f1(x + 6)}" y="${f1(cy - 21)}" width="42" height="42" rx="10" ${fill(ser(it.tone), 'opacity:0.25')}/>`;
      svg += icon(it.icon, it.tone, x + 9, cy - 18, 36);
      const nx = x + 56;
      const nf = P ? 15 : 18;
      svg += `<text x="${f1(nx)}" y="${f1(cy - 7)}" style="fill:var(--sim-label);font:800 ${nf}px var(--sim-font)${dim ? ';text-decoration:line-through' : ''}">${it.name}</text>`;
      svg += `<text x="${f1(nx)}" y="${f1(cy + 17)}" style="fill:var(--sim-label);font:800 ${nf + 1}px var(--sim-font)">${RS}${it.price}</text>`;
      svg += '</g>';
      if (dim) svg += `<text x="${f1(nx + (P ? 48 : 56))}" y="${f1(cy + 17)}" style="fill:var(--sim-bad);font:800 ${P ? 15 : 17}px var(--sim-font)">given up</text>`;
      svg += '</g>';
    });

    // Readout and controls.
    const cx = P ? L.W / 2 : L.rx + L.rw / 2, bcx = L.W / 2;
    const read = (label, v, c) => `<span class="bw-read" style="--c:${c}">${label} <b>${v}</b></span>`;
    const btn = (act, label, pressed) => `<button type="button" class="sv-hit bw-btn" data-act="${act}"${pressed != null ? ` aria-pressed="${pressed}"` : ''}>${label}</button>`;
    if (step === 0) {
      const anim = this.fresh ? ` bw-in" style="--d:${FILL_END.toFixed(2)}s;` : '" style="';
      over$ += `<div class="bw-row${anim}left:${f1(cx)}px;top:${f1(L.readY)}px">${read('list total', `${RS}750`, 'var(--sim-bad)')}</div>`;
      over$ += `<div class="bw-row" style="left:${f1(bcx)}px;top:${f1(L.btnY)}px">${this.fresh ? btn('skip', 'Skip') : btn('replay', 'Replay')}</div>`;
    } else {
      for (let i = 0; i < ITEMS.length; i++) {
        const y = L.rowY(i) - L.rowH / 2;
        over$ += `<button type="button" class="sv-hit bw-hit" data-act="item" data-val="${i}" aria-pressed="${inn[i]}" aria-label="${ITEMS[i].name}, ${ITEMS[i].price} rupees: ${inn[i] ? 'in. Tap to leave it out' : 'given up. Tap to put it back'}"`
          + ` style="left:${f1(L.rx - 4)}px;top:${f1(y - 4)}px;width:${f1(L.rw + 8)}px;height:${L.rowH + 8}px"></button>`;
      }
      const status = over > 0 ? read('', `${RS}${over} over`, 'var(--sim-bad)') : (over === 0 ? read('', 'fits exactly', 'var(--sim-good)') : read('fits,', `${RS}${-over} left`, 'var(--sim-good)'));
      over$ += `<div class="bw-row" style="left:${f1(cx)}px;top:${f1(L.readY)}px">${read('total', `${RS}${T}`, over > 0 ? 'var(--sim-bad)' : 'var(--sim-good)')}${status}</div>`;
      const same = (c) => CASES[c].every((v, i) => v === inn[i]);
      over$ += `<div class="bw-row" style="left:${f1(bcx)}px;top:${f1(L.btnY)}px">${btn('nogift', 'drop the gift', same('nogift'))}${btn('keepgift', 'drop film + game', same('keepgift'))}</div>`;
    }
    over$ += '</div>';
    const headHtml = step === 1
      ? `<span class="bw-mk">${iconSvg('shop', 6)}${iconSvg('phone', 7)}a market: a shop or an app</span>`
      : '';
    return { svg, over: over$, head: headHtml };
  }

  testState() { return { step: this.stepIndex, inn: this.inn.map(Number).join(''), total: this.total(), fresh: this.fresh }; }
}
