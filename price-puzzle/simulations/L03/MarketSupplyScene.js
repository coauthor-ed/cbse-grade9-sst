/**
 * MarketSupplyScene - L03 s04 "Market Supply" (3 beats). SvgScene, design units 560 x 480 landscape, 390 x 600
 * portrait. Mirror of L02 MarketSumScene on the supply side. Table 9.2: Rs 50 -> A 1, B 3, C 2 (6 kg);
 * Rs 100 -> 2, 4, 6 (12 kg); Rs 150 -> 3, 7, 8 (18 kg). Seller A series-4, B series-5, C series-6 (their tops),
 * market supply SUP (series-7).
 *   b0  three stalls side by side, each seller behind a heap with a kg tag; price boards Rs 50 / 100 / 150 in the
 *       figure. Tap one: the heaps resize, the three kg tags fly into the market crate, the crate fills and
 *       "2 + 4 + 6 = 12 kg" reads out. Cold start: Rs 100, 12 kg (the fill plays once on entry).
 *   b1  the sellers become a header row over the market supply schedule (3 rows: price, A, B, C, market); the
 *       market column is lit (series-7). Tap a row: its sum reads out under the table.
 *   b2  the market supply curve: (6, Rs 50), (12, Rs 100), (18, Rs 150) drop in with guides (no letters: E is
 *       kept for equilibrium), then SmSm' draws through them, sloping up. Tap a point; "again" replays.
 * Colours are tokens only. ASCII only.
 */
import { SvgScene, fill } from 'simulations/base/kit/SimSvg.js';
import { MANGO_CSS, RS, priceBoard } from '../shared/MangoKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, nameTag, frontSvg } from '../shared/MangoPeople.js';
import { BTN_CSS, txt, frame, axes, line, dot, guides, pill, crate, btn } from '../shared/MarketParts.js';
import { SUP, SER, INK, SINK, SELLERS, sellerStall } from '../shared/SupplyParts.js';

const f1 = (v) => (+v).toFixed(1);
const PRICES = [50, 100, 150];
const ROWS = [[1, 3, 2], [2, 4, 6], [3, 7, 8]];
const TOTAL = [6, 12, 18];
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];

export class MarketSupplyScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN };
  static CONTROLS = [];
  static ARIA_LABEL = 'Three mango sellers in the same market. At 100 rupees a kg Seller A offers 2 kg, Seller B 4 kg and Seller C 6 kg: together 2 + 4 + 6 = 12 kg. At 50 rupees: 1 + 3 + 2 = 6 kg. At 150 rupees: 3 + 7 + 8 = 18 kg. That is the market supply schedule. Plotted with price up the side and kg along the bottom, the points 6 kg at 50 rupees, 12 kg at 100 rupees and 18 kg at 150 rupees join into the market supply curve SmSm\', which slopes up from left to right.';

  async setup() {
    this.sel = 1;
    this.phase = 'done';
    this.lit = -1;
    this.rowsIn = 3;
    this.shown = 3;
    this.drawn = true;
    this.anim = false;
    await super.setup();
    this._onClick = (e) => {
      const b = e.target?.closest?.('[data-act]');
      if (b) this.act(b.dataset.act, b.dataset.val);
    };
    this.root.addEventListener('click', this._onClick);
  }

  destroy() {
    this.root?.removeEventListener('click', this._onClick);
    super.destroy();
  }

  css() { return MANGO_CSS + PEOPLE_CSS + BTN_CSS; }

  repaint() { super.repaint(); paintPeople(this); }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.anim = false; this.fresh = false; this.popRow = -1; this.popPt = -1; this.popSum = false; this.drawNow = false; }

  enter(step) {
    this.clear();
    this.lit = -1;
    this.sel = 1; this.phase = 'done'; this.rowsIn = 3; this.shown = 3; this.drawn = true;
    if (step === 0) { this.phase = 'fill'; this.anim = true; this.after(0.4, () => this.pick(1)); }
    else if (step === 1) this.build();
    else this.plot();
  }

  // b0: the heaps at price i, the tags pour into the crate, the sum reads out.
  pick(i) {
    this.clear();
    this.sel = i;
    this.phase = 'fill';
    this.fresh = true;
    this.anim = true;
    this.repaint();
    this.fresh = false;
    this.after(1.0, () => { this.phase = 'pour'; this.repaint(); });
    this.after(1.7, () => { this.phase = 'done'; this.popSum = true; this.repaint(); this.popSum = false; });
    this.after(2.5, () => { this.anim = false; this.repaint(); });
  }

  build() {
    this.rowsIn = 0;
    this.anim = true;
    [0, 1, 2].forEach((i) => this.after(0.4 + i * 0.5, () => { this.rowsIn = i + 1; this.popRow = i; this.repaint(); this.popRow = -1; }));
    this.after(0.4 + 3 * 0.5, () => { this.anim = false; this.repaint(); });
  }

  plot() {
    this.shown = 0;
    this.drawn = false;
    this.anim = true;
    [0, 1, 2].forEach((i) => this.after(0.4 + i * 0.6, () => { this.shown = i + 1; this.popPt = i; this.repaint(); this.popPt = -1; }));
    this.after(0.4 + 3 * 0.6, () => { this.drawn = true; this.drawNow = true; this.repaint(); this.drawNow = false; });
    this.after(0.4 + 3 * 0.6 + 1.0, () => { this.anim = false; this.repaint(); });
  }

  act(a, v) {
    const s = this.stepIndex, i = Number(v);
    if (s === 0 && a === 'price') this.pick(i);
    else if (s === 1 && a === 'row') { if (this.anim) this.skip(); this.lit = this.lit === i ? -1 : i; this.repaint(); }
    else if (s === 2 && a === 'pt') { if (this.anim) this.skip(); this.lit = this.lit === i ? -1 : i; this.repaint(); }
    else if (s === 2 && a === 'again') { this.clear(); this.lit = -1; this.plot(); this.repaint(); }
  }

  skip() {
    if (!this.anim) return false;
    this.clear();
    this.phase = 'done'; this.rowsIn = 3; this.shown = 3; this.drawn = true;
    this.repaint();
    return true;
  }

  busy() { return this.anim; }

  stageHeight(st) { return Math.round((st.portrait ? 600 : 480) * st.W / (st.portrait ? 390 : 560)); }

  paint(st) {
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 480, k = (st.W / DW).toFixed(4), s = this.stepIndex;
    const out = s === 2 ? this.paintCurve(P) : s === 1 ? this.paintTable(P) : this.paintStalls(P, DW, DH);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  // b0: three stalls, the market crate, the sum.
  paintStalls(P, DW, DH) {
    let svg = '', over = '', front = '';
    const G = P
      ? { bx: [70, 195, 320], by: 44, bw: 114, bh: 50, hint: 90, xs: [100, 290, 116], gys: [284, 284, 468], w: 178, r: 5.4,
        cr: [306, 456, 118], mk: [306, 350], tag: [306, 494], sum: [195, 580], sumFs: 32 }
      : { bx: [110, 280, 450], by: 44, bw: 140, bh: 54, hint: 90, xs: [93, 280, 467], gys: [318, 318, 318], w: 180, r: 5.6,
        cr: [280, 432, 116], mk: [150, 404], tag: [410, 404], sum: [280, 470], sumFs: 32 };
    const i = this.sel, kgs = ROWS[i];
    PRICES.forEach((p, j) => {
      const on = j === i;
      svg += priceBoard(G.bx[j], G.by, p, { w: G.bw, h: G.bh, active: on, dim: !on });
      over += `<button type="button" class="sv-hit tap btn mq-hit" data-act="price" data-val="${j}" aria-label="${p} rupees a kg" style="left:${G.bx[j] - G.bw / 2 - 4}px;top:${G.by - G.bh / 2 - 6}px;width:${G.bw + 8}px;height:${G.bh + 16}px"></button>`;
    });
    if (!this.anim) svg += txt(P ? 195 : 280, G.hint, 'tap a price', 19, 'var(--sim-label-muted)');
    SELLERS.forEach((who, j) => {
      const x = G.xs[j], gy = G.gys[j];
      const st = sellerStall(who, x, gy, G.w, kgs[j], { r: G.r, tag: false, heapCls: this.fresh ? 'mk-drop' : '', heapStyle: `--d:${(j * 0.1).toFixed(2)}s` });
      over += st.over;
      front += st.front;
      front += pill(x, st.G.cart + 2, `${kgs[j]} kg`, { size: P ? 20 : 21, bg: SER(j + 4), ink: INK(j + 4), edge: SER(j + 4) });
      front += nameTag(x, gy + 4, who, P ? 15 : 16);
    });
    over += frontSvg(DW, DH, front);
    // the market crate
    const [cx, cgy, cw] = G.cr, full = this.phase === 'done';
    svg += pill(G.mk[0], G.mk[1], 'market', { size: P ? 20 : 21, bg: SUP, ink: INK(7), edge: SUP });
    svg += `<g${full && this.popSum ? ' class="mq-pop"' : ''}>${crate(cx, cgy, full ? TOTAL[i] : 0, { w: cw, r: 4.6, q: !full })}</g>`;
    if (full) svg += `<g${this.popSum ? ' class="mq-pop" style="--d:0.2s"' : ''}>${pill(G.tag[0], G.tag[1], `${TOTAL[i]} kg`, { size: P ? 24 : 26, bg: SUP, ink: INK(7), edge: SUP })}</g>`;
    else svg += pill(G.tag[0], G.tag[1], '? kg', { size: P ? 24 : 26 });
    let fly = '';
    if (this.phase === 'pour') {
      SELLERS.forEach((_, j) => {
        const sx = G.xs[j], sy = G.gys[j] - G.w * 70 / 230, tx = cx + (j - 1) * 30, ty = cgy - cw * 0.3;
        fly += `<g class="mq-fly" style="--dx:${f1(sx - tx)}px;--dy:${f1(sy - ty)}px;--d:${j * 0.08}s">${pill(tx, ty, `${kgs[j]} kg`, { size: 20, bg: SER(j + 4), ink: INK(j + 4), edge: SER(j + 4) })}</g>`;
      });
      over += frontSvg(DW, DH, fly);
    }
    if (full) {
      const parts = [[`${kgs[0]}`, SINK(4)], [' + ', 'var(--sim-label)'], [`${kgs[1]}`, SINK(5)], [' + ', 'var(--sim-label)'], [`${kgs[2]}`, SINK(6)], [' = ', 'var(--sim-label)'], [`${TOTAL[i]} kg`, SINK(7)]];
      const spans = parts.map(([t, c]) => `<tspan style="fill:${c}">${t}</tspan>`).join('');
      svg += `<g${this.popSum ? ' class="mq-fade" style="--d:0.3s"' : ''}><text x="${G.sum[0]}" y="${G.sum[1]}" text-anchor="middle" style="font:800 ${G.sumFs}px var(--sim-font);fill:var(--sim-label)">${spans}</text></g>`;
    }
    return { svg, over };
  }

  // b1: the market supply schedule with the sellers as its header row.
  paintTable(P) {
    let svg = '', over = '';
    const G = P
      ? { cx: [44, 116, 186, 256, 334], gy: 132, H: 92, ys: [236, 318, 400], rh: 72, x0: 6, x1: 384, fs: 26, mw: 96, sum: 492, cr: 334 }
      : { cx: [70, 186, 284, 382, 486], gy: 126, H: 96, ys: [222, 306, 390], rh: 76, x0: 14, x1: 546, fs: 32, mw: 112, sum: 456, cr: 486 };
    svg += txt(G.cx[0], G.gy - 46, 'price', P ? 19 : 21, 'var(--sim-label-muted)') + txt(G.cx[0], G.gy - 20, 'per kg', P ? 19 : 21, 'var(--sim-label-muted)');
    const top = G.ys[0] - G.rh / 2 - 6, bot = G.ys[2] + G.rh / 2 - 4;
    SELLERS.forEach((w, j) => {
      const x = G.cx[j + 1], cw = P ? 64 : 84;
      svg += `<rect x="${f1(x - cw / 2)}" y="${f1(top)}" width="${cw}" height="${f1(bot - top)}" rx="12" ${fill(`color-mix(in oklab, ${SER(j + 4)} 12%, var(--sim-bg-surface))`)}/>`;
      over += personSlot(w, { x, y: G.gy - 10, h: G.H - 14, pose: 'stand', facing: 0, mood: 'smile' });
      svg += nameTag(x, G.gy - 4 + (P && j === 1 ? 24 : 0), w, P ? 14 : 15);
    });
    svg += crate(G.cr, G.gy - 30, 18, { w: P ? 72 : 92, r: 3.6 });
    svg += pill(G.cr, G.gy + 8, 'market', { size: P ? 16 : 18, bg: SUP, ink: INK(7), edge: SUP });
    svg += `<rect x="${f1(G.cr - G.mw / 2)}" y="${f1(top)}" width="${G.mw}" height="${f1(bot - top)}" rx="14" ${fill(`color-mix(in oklab, ${SUP} 16%, var(--sim-bg-surface))`, `stroke:${SUP};stroke-width:3`)}/>`;
    ROWS.forEach((r, i) => {
      if (i >= this.rowsIn) return;
      const y = G.ys[i], on = this.lit === i, dim = this.lit >= 0 && !on;
      let row = `<rect x="${G.x0}" y="${f1(y - G.rh / 2)}" width="${G.x1 - G.x0}" height="${G.rh - 10}" rx="14" ${fill(on ? 'color-mix(in oklab, var(--sim-accent) 14%, transparent)' : 'transparent', `stroke:${on ? 'var(--sim-accent)' : 'var(--sim-stroke)'};stroke-width:${on ? 3.5 : 2}`)}/>`;
      const ty = y + G.fs * 0.36 - 5;
      row += txt(G.cx[0], ty, `${RS}${PRICES[i]}`, G.fs);
      r.forEach((kg, j) => { row += txt(G.cx[j + 1], ty, `${kg} kg`, G.fs, SINK(j + 4)); });
      row += `<rect x="${f1(G.cr - G.mw / 2 + 8)}" y="${f1(y - G.rh / 2 + 6)}" width="${G.mw - 16}" height="${G.rh - 22}" rx="12" ${fill(SUP)}/>`;
      row += txt(G.cr, ty, `${TOTAL[i]} kg`, G.fs + 2, INK(7));
      svg += `<g${this.popRow === i ? ' class="mq-pop"' : ''}${dim ? ' opacity="0.4"' : ''}>${row}</g>`;
      over += `<button type="button" class="sv-hit tap btn mq-hit" data-act="row" data-val="${i}" aria-label="${PRICES[i]} rupees: ${r[0]} + ${r[1]} + ${r[2]} = ${TOTAL[i]} kg" aria-pressed="${on ? 'true' : 'false'}" style="left:${G.x0}px;top:${f1(y - G.rh / 2)}px;width:${G.x1 - G.x0}px;height:${G.rh - 10}px"></button>`;
    });
    if (this.lit >= 0) {
      const r = ROWS[this.lit];
      svg += txt(P ? 195 : 280, G.sum, `${RS}${PRICES[this.lit]}:  ${r[0]} + ${r[1]} + ${r[2]} = ${TOTAL[this.lit]} kg`, P ? 26 : 30);
    } else if (!this.anim) svg += txt(P ? 195 : 280, G.sum, 'tap a row', 20, 'var(--sim-label-muted)');
    return { svg, over };
  }

  // b2: the market supply curve SmSm'.
  paintCurve(P) {
    const g = P ? frame(104, 366, 92, 440, 20, 200) : frame(132, 528, 36, 370, 20, 200);
    let svg = axes(g, { yTitleX: P ? 26 : 44, tick: P ? 18 : 20 }), over = '';
    TOTAL.forEach((q, i) => {
      if (i >= this.shown) return;
      const p = PRICES[i], x = g.X(q), y = g.Y(p), on = this.lit === i;
      svg += `<g${this.popPt === i ? ' class="mq-fade"' : ''}>${guides(g, q, p, { lit: on })}</g>`;
      svg += `<g${this.popPt === i ? ' class="mq-pop"' : ''}>${dot(x, y, '', { col: SUP, lit: on, r: 12 })}</g>`;
      over += `<button type="button" class="sv-hit tap btn mq-hit" data-act="pt" data-val="${i}" aria-label="${q} kg at ${p} rupees" aria-pressed="${on ? 'true' : 'false'}" style="left:${f1(x - 28)}px;top:${f1(y - 28)}px;width:56px;height:56px;border-radius:50%"></button>`;
    });
    if (this.drawn) {
      svg += line(g, 1.5, 12.5, 19.5, 162.5, SUP, { w: 7, draw: this.drawNow ? 0.8 : 0 });
      const lab = (x, y, a, prime) => `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${a}" style="fill:${SINK(7)};font:800 30px var(--sim-font)">S<tspan style="font-size:20px" dy="6">m</tspan>${prime ? '<tspan dy="-6">\'</tspan>' : ''}</text>`;
      svg += `<g${this.drawNow ? ' class="mq-fade" style="--d:0.7s"' : ''}>${lab(g.X(1.5) - 8, g.Y(12.5) + 2, 'end', false)}${lab(g.X(19.5) - 18, g.Y(162.5) - 8, 'end', true)}</g>`;
      TOTAL.forEach((q, i) => { svg += dot(g.X(q), g.Y(PRICES[i]), '', { col: SUP, r: 12, lit: this.lit === i }); });
    }
    if (this.lit >= 0) {
      const q = TOTAL[this.lit], p = PRICES[this.lit];
      svg += pill(g.X(q), g.Y(p) + 40, `${q} kg at ${RS}${p}`, { size: P ? 18 : 20 });
    }
    const leg = P ? [150, 46] : [250, 70];
    svg += pill(leg[0], leg[1], 'market supply', { size: P ? 21 : 22, bg: SUP, ink: INK(7), edge: SUP });
    if (!this.anim) over += P ? btn('again', 'again', 195, 556) : btn('again', 'again', 470, 300);
    return { svg, over };
  }

  testState() { return { step: this.stepIndex, sel: this.sel, price: PRICES[this.sel], kgs: ROWS[this.sel], total: TOTAL[this.sel], phase: this.phase, rows: this.rowsIn, shown: this.shown, drawn: this.drawn, lit: this.lit }; }
}
