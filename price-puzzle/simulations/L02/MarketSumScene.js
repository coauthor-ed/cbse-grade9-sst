/**
 * MarketSumScene - L02 s01 (predict, setup mount) and s02 "Add Across Each Price" (3 beats). SvgScene, design
 * units 560 x 480 landscape, 390 x 600 portrait. Table 9.1: Rs 150 -> 1 / 2 / 3 (6 kg), Rs 100 -> 2 / 4 / 6
 * (12 kg), Rs 50 -> 3 / 6 / 9 (18 kg). Srivalli series-1, Alex series-2, Israt series-3, the market MKT (series-5).
 *   setup  the price board Rs 100 / kg; Srivalli, Alex and Israt each hold a basket (2 / 4 / 6 kg tags); one big
 *          empty market crate with a "?". No sum, no plus signs.
 *   b0     three price boards (Rs 150 / 100 / 50) in the figure. Tap one: the three baskets fill to their row,
 *          three kg tags fly into the market crate, the crate fills and "2 + 4 + 6 = 12 kg" reads out big.
 *          Cold start: Rs 100, 12 kg (the fill plays once on entry).
 *   b1     the three buyers become a header row over the market demand schedule (3 rows: price, Srivalli,
 *          Alex, Israt, market). The market column is lit. Tap a row: its sum reads out under the table.
 *   b2     the market demand curve: E (6 kg, Rs 150), F (12 kg, Rs 100), G (18 kg, Rs 50) drop in with guides,
 *          then DmDm' draws through them. Tap a point to light its guides; "again" replays.
 * Colours are tokens only. ASCII only.
 */
import { SvgScene, fill } from 'simulations/base/kit/SimSvg.js';
import { MANGO_CSS, RS, basket, priceBoard } from '../shared/MangoKit.js';
import { PEOPLE_CSS, personSlot, paintPeople, nameTag, frontSvg } from '../shared/MangoPeople.js';
import { MKT, BTN_CSS, txt, frame, axes, line, dot, guides, pill, crate, btn } from '../shared/MarketParts.js';

const f1 = (v) => (+v).toFixed(1);
const PRICES = [150, 100, 50];
const ROWS = [[1, 2, 3], [2, 4, 6], [3, 6, 9]];
const TOTAL = [6, 12, 18];
const WHO = ['srivalli', 'alex', 'israt'];
const SER = (n) => `var(--sim-series-${n})`;
const INK = (n) => `var(--sim-ink-on-${n}, var(--sim-bg-deep))`;
const PTS = ['E', 'F', 'G'];
const MAIN = [[{ idx: 0, dwellMs: null }], [{ idx: 1, dwellMs: null }], [{ idx: 2, dwellMs: null }]];

export class MarketSumScene extends SvgScene {
  static WIDTH = 560;
  static PORTRAIT_WIDTH = 390;
  static HEIGHT = 480;
  static PORTRAIT_HEIGHT = 600;
  static CONTINUOUS = false;
  static BEAT_STEP_MAP = MAIN;
  static BEAT_MAPS = { 3: MAIN, [Number.MAX_SAFE_INTEGER]: [[{ idx: 3, dwellMs: null }]] };
  static CONTROLS = [];
  static ARIA_LABEL = 'Three buyers at 100 rupees a kg: Srivalli 2 kg, Alex 4 kg, Israt 6 kg, and an empty market crate. Adding the three baskets gives the market: at 150 rupees 1 + 2 + 3 = 6 kg, at 100 rupees 2 + 4 + 6 = 12 kg, at 50 rupees 3 + 6 + 9 = 18 kg. That is the market demand schedule. Plotted with price up the side and kg along the bottom, the points E (6 kg, 150 rupees), F (12 kg, 100 rupees) and G (18 kg, 50 rupees) join into the market demand curve DmDm\', which slopes down from left to right.';

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

  get view() { return this.hostRole === 'setup' ? 3 : this.stepIndex; }

  clear() { for (const t of (this._timers ?? []).splice(0)) clearTimeout(t); this.anim = false; this.fresh = false; this.popRow = -1; this.popPt = -1; }

  enter(step) {
    this.clear();
    this.lit = -1;
    const v = this.hostRole === 'setup' ? 3 : step;
    this.sel = 1; this.phase = 'done'; this.rowsIn = 3; this.shown = 3; this.drawn = true;
    if (v === 0) this.after(0.5, () => this.pick(1));
    else if (v === 1) this.build();
    else if (v === 2) this.plot();
  }

  // b0: fill the baskets at price i, pour into the crate, read out the sum.
  pick(i) {
    this.clear();
    this.sel = i;
    this.phase = 'fill';
    this.fresh = true;
    this.anim = true;
    this.repaint();
    this.fresh = false;
    this.after(1.2, () => { this.phase = 'pour'; this.repaint(); });
    this.after(1.9, () => { this.phase = 'done'; this.popSum = true; this.repaint(); this.popSum = false; });
    this.after(2.8, () => { this.anim = false; this.repaint(); });
  }

  // b1: rows pop in turn.
  build() {
    this.rowsIn = 0;
    this.anim = true;
    [0, 1, 2].forEach((i) => this.after(0.4 + i * 0.5, () => { this.rowsIn = i + 1; this.popRow = i; this.repaint(); this.popRow = -1; }));
    this.after(0.4 + 3 * 0.5, () => { this.anim = false; this.repaint(); });
  }

  // b2: points drop in, then the curve draws.
  plot() {
    this.shown = 0;
    this.drawn = false;
    this.anim = true;
    [0, 1, 2].forEach((i) => this.after(0.4 + i * 0.6, () => { this.shown = i + 1; this.popPt = i; this.repaint(); this.popPt = -1; }));
    this.after(0.4 + 3 * 0.6, () => { this.drawn = true; this.drawNow = true; this.repaint(); this.drawNow = false; });
    this.after(0.4 + 3 * 0.6 + 0.9, () => { this.anim = false; this.repaint(); });
  }

  act(a, v) {
    const s = this.view, i = Number(v);
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
    const P = st.portrait, DW = P ? 390 : 560, DH = P ? 600 : 480, k = (st.W / DW).toFixed(4), v = this.view;
    const out = v === 2 ? this.paintCurve(P) : v === 1 ? this.paintTable(P) : this.paintBaskets(P, v === 3, DW, DH);
    return { svg: `<g transform="scale(${k})">${out.svg}</g>`, over: `<div style="position:absolute;left:0;top:0;width:${DW}px;height:${DH}px;transform:scale(${k});transform-origin:0 0">${out.over ?? ''}</div>` };
  }

  // setup and b0: three buyers with baskets, the market crate.
  paintBaskets(P, setup, DW, DH) {
    let svg = '', over = '', front = '';
    const G = P
      ? { bx: [68, 195, 322], by: 46, bw: 120, bh: 54, gy: 300, H: 156, xs: [70, 195, 320], kw: 82, cr: [250, 488, 180], mk: [76, 452], tag: [250, 520], sum: [195, 578], sumFs: 32, hint: 92 }
      : { bx: [80, 214, 348], by: 48, bw: 128, bh: 56, gy: 350, H: 196, xs: [70, 192, 314], kw: 96, cr: [470, 350, 156], mk: [470, 222], tag: [470, 392], sum: [280, 448], sumFs: 38, hint: 96 };
    const i = this.sel, kgs = setup ? ROWS[1] : ROWS[i];
    if (setup) svg += priceBoard(G.bx[1], G.by, 100, { w: G.bw + 40, h: 64, active: true });
    else {
      PRICES.forEach((p, j) => {
        const on = j === i;
        svg += priceBoard(G.bx[j], G.by, p, { w: G.bw, h: G.bh, active: on, dim: !on });
        over += `<button type="button" class="sv-hit tap btn mq-hit" data-act="price" data-val="${j}" aria-label="${p} rupees a kg" style="left:${G.bx[j] - G.bw / 2 - 4}px;top:${G.by - G.bh / 2 - 6}px;width:${G.bw + 8}px;height:${G.bh + 16}px"></button>`;
      });
      if (!this.anim) svg += txt(P ? 195 : 205, G.hint, 'tap a price', 19, 'var(--sim-label-muted)');
    }
    // the buyers, each holding a basket by its handle
    WHO.forEach((w, j) => {
      const sx = G.xs[j], sy = G.gy, H = G.H, bw = G.kw, bBot = sy - H * 0.1, bTop = bBot - bw * 0.5, grip = bTop - bw * 0.33;
      over += personSlot(w, { x: sx, y: sy, h: H, pose: 'stand', facing: 0, mood: 'smile', hands: [{ x: sx + bw * 0.2, y: grip }, { x: sx - bw * 0.2, y: grip }] });
      front += basket(sx, bBot, kgs[j], { w: bw, fromKg: this.fresh ? 0 : undefined, per: 0.12 });
      front += pill(sx, bBot + 4, `${kgs[j]} kg`, { size: P ? 19 : 21, bg: SER(j + 1), ink: INK(j + 1), edge: SER(j + 1) });
      svg += nameTag(sx, sy + 8 + (P && j === 1 ? 0 : 0), w, P ? 15 : 17);
    });
    // the market crate
    const [cx, cgy, cw] = G.cr, full = !setup && this.phase === 'done';
    svg += pill(G.mk[0], G.mk[1], 'market', { size: P ? 20 : 22, bg: MKT, ink: INK(5), edge: MKT });
    svg += `<g${full && this.popSum ? ' class="mq-pop"' : ''}>${crate(cx, cgy, full ? TOTAL[i] : 0, { w: cw, r: 6.5, q: !full })}</g>`;
    if (full) svg += `<g${this.popSum ? ' class="mq-pop" style="--d:0.2s"' : ''}>${pill(G.tag[0], G.tag[1], `${TOTAL[i]} kg`, { size: P ? 26 : 28, bg: MKT, ink: INK(5), edge: MKT })}</g>`;
    else svg += pill(G.tag[0], G.tag[1], '? kg', { size: P ? 26 : 28 });
    // b0: the three kg tags fly into the crate, then the sum
    if (!setup && this.phase === 'pour') {
      WHO.forEach((_, j) => {
        const sx = G.xs[j], sy = G.gy - G.H * 0.1 + 4, tx = cx + (j - 1) * 30, ty = cgy - cw * 0.3;
        svg += `<g class="mq-fly" style="--dx:${f1(sx - tx)}px;--dy:${f1(sy - ty)}px;--d:${j * 0.08}s">${pill(tx, ty, `${kgs[j]} kg`, { size: 20, bg: SER(j + 1), ink: INK(j + 1), edge: SER(j + 1) })}</g>`;
      });
    }
    if (!setup && this.phase === 'done') {
      const fs = G.sumFs, parts = [[`${kgs[0]}`, SER(1)], [' + ', 'var(--sim-label)'], [`${kgs[1]}`, 'var(--sim-label)'], [' + ', 'var(--sim-label)'], [`${kgs[2]}`, SER(3)], [' = ', 'var(--sim-label)'], [`${TOTAL[i]} kg`, MKT]];
      const spans = parts.map(([t, c]) => `<tspan style="fill:${c}">${t}</tspan>`).join('');
      svg += `<g${this.popSum ? ' class="mq-fade" style="--d:0.3s"' : ''}><text x="${G.sum[0]}" y="${G.sum[1]}" text-anchor="middle" style="font:800 ${fs}px var(--sim-font);fill:var(--sim-label)">${spans}</text></g>`;
    }
    over += frontSvg(DW, DH, front);
    return { svg, over };
  }

  // b1: the market demand schedule with the buyers as its header row.
  paintTable(P) {
    let svg = '', over = '';
    const G = P
      ? { cx: [44, 116, 186, 256, 334], gy: 132, H: 92, ys: [236, 318, 400], rh: 72, x0: 6, x1: 384, fs: 26, mw: 96, sum: 492, hint: 492, cr: 334 }
      : { cx: [70, 186, 284, 382, 486], gy: 126, H: 96, ys: [222, 306, 390], rh: 76, x0: 14, x1: 546, fs: 32, mw: 112, sum: 456, hint: 456, cr: 486 };
    // header: price, the three buyers (small), the market crate
    svg += txt(G.cx[0], G.gy - 46, 'price', P ? 19 : 21, 'var(--sim-label-muted)') + txt(G.cx[0], G.gy - 20, 'per kg', P ? 19 : 21, 'var(--sim-label-muted)');
    WHO.forEach((w, j) => {
      over += personSlot(w, { x: G.cx[j + 1], y: G.gy - 10, h: G.H - 14, pose: 'stand', facing: 0, mood: 'smile' });
      svg += nameTag(G.cx[j + 1], G.gy - 4 + (P && j === 1 ? 24 : 0), w, P ? 14 : 16);
    });
    svg += crate(G.cr, G.gy - 30, 18, { w: P ? 72 : 92, r: 3.6 });
    svg += pill(G.cr, G.gy + 8, 'market', { size: P ? 16 : 18, bg: MKT, ink: INK(5), edge: MKT });
    const top = G.ys[0] - G.rh / 2 - 6, bot = G.ys[2] + G.rh / 2 - 4;
    svg += `<rect x="${f1(G.cr - G.mw / 2)}" y="${f1(top)}" width="${G.mw}" height="${f1(bot - top)}" rx="14" ${fill(`color-mix(in oklab, ${MKT} 16%, var(--sim-bg-surface))`, `stroke:${MKT};stroke-width:3`)}/>`;
    ROWS.forEach((r, i) => {
      if (i >= this.rowsIn) return;
      const y = G.ys[i], on = this.lit === i, dim = this.lit >= 0 && !on;
      let row = `<rect x="${G.x0}" y="${f1(y - G.rh / 2)}" width="${G.x1 - G.x0}" height="${G.rh - 10}" rx="14" ${fill(on ? 'color-mix(in oklab, var(--sim-accent) 14%, transparent)' : 'transparent', `stroke:${on ? 'var(--sim-accent)' : 'var(--sim-stroke)'};stroke-width:${on ? 3.5 : 2}`)}/>`;
      const ty = y + G.fs * 0.36 - 5;
      row += txt(G.cx[0], ty, `${RS}${PRICES[i]}`, G.fs);
      r.forEach((kg, j) => { row += txt(G.cx[j + 1], ty, `${kg} kg`, G.fs); });
      row += `<rect x="${f1(G.cr - G.mw / 2 + 8)}" y="${f1(y - G.rh / 2 + 6)}" width="${G.mw - 16}" height="${G.rh - 22}" rx="12" ${fill(MKT)}/>`;
      row += txt(G.cr, ty, `${TOTAL[i]} kg`, G.fs + 2, INK(5));
      svg += `<g${this.popRow === i ? ' class="mq-pop"' : ''}${dim ? ' opacity="0.4"' : ''}>${row}</g>`;
      over += `<button type="button" class="sv-hit tap btn mq-hit" data-act="row" data-val="${i}" aria-label="${PRICES[i]} rupees: ${r[0]} + ${r[1]} + ${r[2]} = ${TOTAL[i]} kg" aria-pressed="${on ? 'true' : 'false'}" style="left:${G.x0}px;top:${f1(y - G.rh / 2)}px;width:${G.x1 - G.x0}px;height:${G.rh - 10}px"></button>`;
    });
    if (this.lit >= 0) {
      const r = ROWS[this.lit];
      svg += txt(P ? 195 : 280, G.sum, `${RS}${PRICES[this.lit]}:  ${r[0]} + ${r[1]} + ${r[2]} = ${TOTAL[this.lit]} kg`, P ? 26 : 30);
    } else if (!this.anim) svg += txt(P ? 195 : 280, G.hint, 'tap a row', 20, 'var(--sim-label-muted)');
    return { svg, over };
  }

  // b2: E, F, G and the market demand curve DmDm'.
  paintCurve(P) {
    const g = P ? frame(104, 366, 92, 440, 20, 200) : frame(132, 528, 36, 370, 20, 200);
    let svg = axes(g, { yTitleX: P ? 26 : 44, tick: P ? 18 : 20, gridX: [3, 6, 9, 12, 15, 18] }), over = '';
    PTS.forEach((n, i) => {
      if (i >= this.shown) return;
      const q = TOTAL[i], p = PRICES[i], x = g.X(q), y = g.Y(p), on = this.lit === i;
      svg += `<g${this.popPt === i ? ' class="mq-fade"' : ''}>${guides(g, q, p, { lit: on })}</g>`;
      svg += `<g${this.popPt === i ? ' class="mq-pop"' : ''}>${dot(x, y, n, { lit: on, r: 12, size: 30, ldx: 14, ldy: -14 })}</g>`;
      over += `<button type="button" class="sv-hit tap btn mq-hit" data-act="pt" data-val="${i}" aria-label="point ${n}: ${q} kg at ${p} rupees" aria-pressed="${on ? 'true' : 'false'}" style="left:${f1(x - 28)}px;top:${f1(y - 28)}px;width:56px;height:56px;border-radius:50%"></button>`;
    });
    if (this.drawn) {
      svg += line(g, 3, 175, 19.5, 200 - 19.5 * 25 / 3, MKT, { w: 7, draw: this.drawNow ? 0.8 : 0 });
      const lab = (x, y, a, prime) => `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${a}" style="fill:${MKT};font:800 30px var(--sim-font)">D<tspan style="font-size:20px" dy="6">m</tspan>${prime ? '<tspan dy="-6">\'</tspan>' : ''}</text>`;
      svg += `<g${this.drawNow ? ' class="mq-fade" style="--d:0.7s"' : ''}>${lab(g.X(3) - 10, g.Y(175) + 6, 'end', false)}${lab(g.X(19.5) - 6, g.Y(37) + 40, 'middle', true)}</g>`;
      // the points stay on top of the line
      PTS.forEach((n, i) => { svg += dot(g.X(TOTAL[i]), g.Y(PRICES[i]), '', { r: 12, lit: this.lit === i }); });
    }
    const leg = P ? [195, 40] : [420, 70];
    svg += pill(leg[0], leg[1], 'market demand', { size: P ? 21 : 22, bg: MKT, ink: INK(5), edge: MKT });
    if (!this.anim) over += P ? btn('again', 'again', 195, 556) : btn('again', 'again', 470, 140);
    return { svg, over };
  }

  testState() { return { view: this.view, sel: this.sel, price: PRICES[this.sel], total: TOTAL[this.sel], phase: this.phase, rows: this.rowsIn, shown: this.shown, drawn: this.drawn, lit: this.lit }; }
}
